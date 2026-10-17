#!/usr/bin/env python
"""One-liner render / mux for the mhfrough.dev reels (method from the Quorum promo reels).

  python promo/reels/tools/reel.py stills hire 1,4,9,14,20   # 1x PNGs in .devcache/reels/hire/stills
  python promo/reels/tools/reel.py all    hire               # frames + master + web + poster
  python promo/reels/tools/reel.py frames hire               # frames only
  python promo/reels/tools/reel.py mux    hire               # re-mux from existing frames

The owner wants vertical (mobile) only. The page and tools still support --format square if that changes.
  python promo/reels/tools/reel.py music  hire                               # regenerate music.wav (music.py)

Serves the repo root on :5528 (REEL_PORT) unless something answers there, runs render.mjs (Playwright, fake clock,
2x frames) and mux.py (PyAV). Heavy files stay on D: under .devcache/reels/<reel>/<format>/ (about 1 GB each).
Outputs:
  promo/reels/out/<reel>-9x16.mp4    4K master for upload (git-ignored), CRF 16
  public/videos/<reel>-9x16.mp4      1080x1920 web version served by the site, CRF 21
  public/videos/<reel>-9x16.webp     poster (720x1280, WebP q80)
"""
import argparse
import os
import socket
import subprocess
import sys
import time

TOOLS = os.path.dirname(os.path.abspath(__file__))
REELS_DIR = os.path.dirname(TOOLS)
ROOT = os.path.dirname(os.path.dirname(REELS_DIR))
CACHE = os.path.join(ROOT, '.devcache')
PORT = int(os.environ.get('REEL_PORT', 5528))
FPS = 30

FORMATS = {
    'vertical': dict(tag='9x16', web='1080x1920', poster=(720, 1280)),
    'square': dict(tag='1x1', web='1080x1080', poster=(720, 720)),
}
REELS = {
    'hire': dict(music='music.wav', music_offset=0.0, fade_out=1.5, poster_t=19.6),
    # Voiceover reel (script.md). Stills work now; frames and mux wait for the recorded voice and a 71 s music bed.
    'pitch': dict(music='music.wav', music_offset=0.0, fade_out=1.5, poster_t=66.5),
}

ENV = dict(os.environ, npm_config_cache=os.path.join(CACHE, 'npm'), TEMP=os.path.join(CACHE, 'tmp'),
           TMP=os.path.join(CACHE, 'tmp'), PLAYWRIGHT_BROWSERS_PATH=os.path.join(CACHE, 'playwright'),
           REEL_PORT=str(PORT))


def port_open(port):
    with socket.socket() as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0


class Server:
    def __enter__(self):
        self.proc = None
        if not port_open(PORT):
            self.proc = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT), '--bind', '127.0.0.1'],
                                         cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            for _ in range(50):
                if port_open(PORT):
                    break
                time.sleep(0.1)
        return self

    def __exit__(self, *a):
        if self.proc:
            self.proc.terminate()
            self.proc.wait()


def run(cmd):
    print('$', ' '.join(cmd), flush=True)
    subprocess.run(cmd, check=True, env=ENV)


def frames_dir(reel, fmt):
    return os.path.join(CACHE, 'reels', reel, fmt)


def render(reel, fmt, mode, out_dir, arg):
    with Server():
        run(['node', os.path.join(TOOLS, 'render.mjs'), reel, fmt, mode, out_dir, arg])


def mux(reel, fmt):
    c, f = REELS[reel], FORMATS[fmt]
    frames = frames_dir(reel, fmt)
    music = os.path.join(REELS_DIR, reel, c['music'])
    base = ['--frames', frames, '--fps', str(FPS), '--bgm', music, '--bgm-offset', str(c['music_offset']),
            '--bgm-gain-db', '0', '--duck-db', '0', '--fade-out', str(c['fade_out'])]
    master = os.path.join(REELS_DIR, 'out', f'{reel}-{f["tag"]}.mp4')
    web = os.path.join(ROOT, 'public', 'videos', f'{reel}-{f["tag"]}.mp4')
    os.makedirs(os.path.dirname(master), exist_ok=True)
    os.makedirs(os.path.dirname(web), exist_ok=True)
    run([sys.executable, os.path.join(TOOLS, 'mux.py'), *base, '--out', master, '--crf', '16'])
    run([sys.executable, os.path.join(TOOLS, 'mux.py'), *base, '--out', web, '--crf', '21', '--size', f['web']])
    poster(reel, fmt)


def poster(reel, fmt):
    from PIL import Image
    c, f = REELS[reel], FORMATS[fmt]
    src = os.path.join(frames_dir(reel, fmt), '%05d.jpg' % round(c['poster_t'] * FPS))
    dst = os.path.join(ROOT, 'public', 'videos', f'{reel}-{f["tag"]}.webp')
    Image.open(src).convert('RGB').resize(f['poster'], Image.LANCZOS).save(dst, 'WEBP', quality=80, method=6)
    print('poster', dst, 'from', os.path.basename(src))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('cmd', choices=['all', 'frames', 'mux', 'stills', 'poster', 'music'])
    ap.add_argument('reel', choices=sorted(REELS))
    ap.add_argument('times', nargs='?', default='1,5,9', help='stills: comma-separated seconds')
    ap.add_argument('--format', default='vertical', choices=['both', *FORMATS])
    a = ap.parse_args()
    os.makedirs(ENV['TEMP'], exist_ok=True)
    if a.cmd == 'music':
        run([sys.executable, os.path.join(TOOLS, 'music.py'), os.path.join(REELS_DIR, a.reel, REELS[a.reel]['music'])])
        return
    for fmt in (FORMATS if a.format == 'both' else [a.format]):
        if a.cmd == 'stills':
            render(a.reel, fmt, 'stills', os.path.join(CACHE, 'reels', a.reel, 'stills'), a.times)
            continue
        if a.cmd in ('all', 'frames'):
            d = frames_dir(a.reel, fmt)
            if os.path.isdir(d):
                for name in os.listdir(d):
                    if name.endswith('.jpg'):
                        os.remove(os.path.join(d, name))
            render(a.reel, fmt, 'frames', d, str(FPS))
        if a.cmd in ('all', 'mux'):
            mux(a.reel, fmt)
        if a.cmd == 'poster':
            poster(a.reel, fmt)


if __name__ == '__main__':
    main()
