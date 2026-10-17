#!/usr/bin/env python
"""Original music bed for the hire reel: 120 BPM, A minor, 24 s, 48 kHz stereo WAV.

  python promo/reels/tools/music.py [out.wav]      (default promo/reels/hire/music.wav)

Built from scratch with numpy/scipy (no samples, no license). One bar = 2 s, so every scene change in the reel's
CUES lands on a bar start. Arrangement (bar: seconds):
  0-1  pad + plucked arpeggio         2-3  + kick (beats 1, 3) and sub
  4-7  full groove: four-on-the-floor kick, offbeat hats, claps on 2 and 4
  8    break: no drums, filtered riser into the drop
  9    impact on the CTA (18 s), then pad and a sparse arp until the end
The mux step normalises loudness, so levels here only need to be balanced against each other.
"""
import os
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
LENGTH = 24.0
N = int(LENGTH * SR)
rng = np.random.default_rng(7)

# Chord per bar: (bass MIDI, pad voicing)
AM9 = (45, [57, 60, 64, 67, 71])
FMAJ7 = (41, [53, 57, 60, 64, 67])
CMAJ7 = (48, [55, 59, 60, 64, 67])
G6 = (43, [55, 59, 62, 64, 69])
BARS = [AM9, FMAJ7, CMAJ7, G6, AM9, FMAJ7, CMAJ7, G6, FMAJ7, AM9, FMAJ7, AM9]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def t_(n):
    return np.arange(n) / SR


def place(buf, x, at, gain=1.0):
    i = int(round(at * SR))
    if i >= len(buf):
        return
    m = min(len(x), len(buf) - i)
    buf[i:i + m] += gain * x[:m]


def env_adsr(n, a, r, hold=None):
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    nr = max(1, int(r * SR))
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def saw(f, n, harmonics=14):
    tt = t_(n)
    y = np.zeros(n)
    for k in range(1, harmonics + 1):
        if f * k > SR / 2.2:
            break
        y += np.sin(2 * np.pi * f * k * tt + rng.uniform(0, 6.28)) / k
    return y


def lowpass(x, fc, order=2):
    sos = signal.butter(order, fc, 'low', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def highpass(x, fc, order=2):
    sos = signal.butter(order, fc, 'high', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def bandpass(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], 'band', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


# ---------------------------------------------------------------- voices
def pad_note(m, dur):
    n = int(dur * SR)
    f = hz(m)
    y = sum(saw(f * 2 ** (c / 1200), n) for c in (-7, 0, 7)) / 3
    y = lowpass(y, 1400)
    return y * env_adsr(n, 0.35, 0.7)


def pluck(m, dur=0.6):
    n = int(dur * SR)
    tt = t_(n)
    f = hz(m)
    y = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) + 0.12 * np.sin(6 * np.pi * f * tt)
    e = np.exp(-tt / 0.16)
    e[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return lowpass(y * e, 3800)


def kick(level=1.0):
    n = int(0.45 * SR)
    tt = t_(n)
    f = 46 + 120 * np.exp(-tt / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-tt / 0.22)
    click = rng.standard_normal(n) * np.exp(-tt / 0.002) * 0.25
    return (y + lowpass(click, 4000)) * level


def hat(level=1.0):
    n = int(0.12 * SR)
    tt = t_(n)
    y = highpass(rng.standard_normal(n), 7500) * np.exp(-tt / 0.028)
    return y * level


def clap():
    n = int(0.5 * SR)
    tt = t_(n)
    noise = bandpass(rng.standard_normal(n), 900, 3200)
    e = np.zeros(n)
    for k, d in enumerate((0.0, 0.011, 0.022)):
        i = int(d * SR)
        e[i:] += np.exp(-(tt[: n - i]) / (0.008 if k < 2 else 0.13))
    return noise * e * 0.6


def sub(m, dur):
    n = int(dur * SR)
    tt = t_(n)
    y = np.sin(2 * np.pi * hz(m - 12) * tt) + 0.15 * np.sin(4 * np.pi * hz(m - 12) * tt)
    return y * env_adsr(n, 0.02, 0.08)


def riser(dur):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    hop = int(0.02 * SR)
    for i in range(0, n, hop):
        p = i / n
        lo = 300 + 5000 * p ** 2
        seg = noise[max(0, i - 2048): i + hop]
        y = bandpass(seg, lo, min(lo * 2.2, SR / 2.2))[-hop:] if len(seg) > hop else seg
        out[i:i + len(y)] = y[: n - i]
    tt = t_(n)
    sweep = np.sin(2 * np.pi * np.cumsum(220 + 660 * (tt / dur) ** 2) / SR) * 0.08
    return (out * 0.5 + sweep) * (tt / dur) ** 2.2


def impact():
    n = int(2.4 * SR)
    tt = t_(n)
    boom = lowpass(rng.standard_normal(n), 900) * np.exp(-tt / 0.5) * 0.5
    return boom + np.pad(kick(1.3), (0, n - int(0.45 * SR)))


def reverb_ir(dur=2.4, decay=0.55):
    n = int(dur * SR)
    tt = t_(n)
    ir = rng.standard_normal((n, 2)) * np.exp(-tt / decay)[:, None]
    ir = np.stack([lowpass(ir[:, c], 5000) for c in range(2)], axis=1)
    ir[: int(0.012 * SR)] = 0  # pre-delay
    return ir / np.sqrt((ir ** 2).sum(axis=0))


def delay_pingpong(x, time=0.375, fb=0.38, mix=0.32):
    d = int(time * SR)
    out = np.zeros((len(x), 2))
    out[:, 0] += x
    out[:, 1] += x
    tap = x.copy()
    for k in range(1, 7):
        tap = lowpass(tap, 3200) * fb
        side = k % 2
        out[d * k:, side] += mix * tap[: len(x) - d * k] if d * k < len(x) else 0
    return out


# ---------------------------------------------------------------- arrangement
def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'hire', 'music.wav')
    pad = np.zeros(N)
    arp = np.zeros(N)
    drums = np.zeros(N)
    bass = np.zeros(N)
    fx = np.zeros(N)
    claps = np.zeros(N)

    for b, (root, voicing) in enumerate(BARS):
        t0 = b * BAR
        last = b == len(BARS) - 1
        dur = BAR + (1.2 if not last else 0.0)
        for m in voicing:
            place(pad, pad_note(m, dur if not last else LENGTH - t0), t0, 0.16)

        tones = [m + 12 for m in voicing]
        if b <= 8:  # eighth-note arpeggio
            order = [0, 2, 1, 3, 2, 4, 3, 1]
            for k in range(8):
                place(arp, pluck(tones[order[k]]), t0 + k * BEAT / 2, 0.30 if k % 2 == 0 else 0.22)
        elif b <= 10:  # sparse after the drop
            for k, i in enumerate((0, 2, 4, 3)):
                place(arp, pluck(tones[i], 0.9), t0 + k * BEAT, 0.24)

        if 2 <= b <= 7:
            beats = (0, 2) if b < 4 else (0, 1, 2, 3)
            for k in beats:
                place(drums, kick(), t0 + k * BEAT, 0.9)
            place(bass, sub(root, BAR), t0, 0.42)
        if 4 <= b <= 7:
            for k in range(4):
                place(drums, hat(), t0 + k * BEAT + BEAT / 2, 0.22 if k % 2 else 0.17)
            for k in (1, 3):
                place(claps, clap(), t0 + k * BEAT, 0.5)
        if b == 8:  # break: riser into the drop
            place(fx, riser(BAR), t0, 0.55)
        if b in (9, 10):
            place(drums, kick(0.8), t0, 0.9)
            place(bass, sub(root, BAR), t0, 0.36)

    place(fx, impact(), 9 * BAR, 0.75)

    # Sidechain pump on pad and bass from the kicks (beats while the kick plays)
    pump = np.ones(N)
    for b in range(2, 8):
        beats = (0, 2) if b < 4 else (0, 1, 2, 3)
        for k in beats:
            i = int((b * BAR + k * BEAT) * SR)
            n = min(int(0.35 * SR), N - i)
            pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.45 * np.exp(-t_(n) / 0.09))
    pad *= pump
    bass *= pump

    ir = reverb_ir()
    arp_st = delay_pingpong(arp)
    dry = np.stack([pad, pad], 1) * 0.8 + arp_st + np.stack([drums + bass, drums + bass], 1) + np.stack([claps, claps], 1) * 0.8 + np.stack([fx, fx], 1)
    send = np.stack([pad, pad], 1) * 0.5 + arp_st * 0.6 + np.stack([claps, claps], 1) * 0.7 + np.stack([fx, fx], 1) * 0.5
    wet = np.stack([signal.fftconvolve(send[:, c], ir[:, c])[:N] for c in range(2)], 1)
    mix = dry + wet * 0.35

    # Gentle bus glue, fade the tail, peak to -1 dBFS
    mix = np.tanh(mix * 1.1) / 1.1
    fo = int(2.0 * SR)
    mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
    mix /= np.abs(mix).max() / 10 ** (-1 / 20)
    wavfile.write(out_path, SR, (mix * 32767).astype(np.int16))
    print('wrote', os.path.abspath(out_path), f'{LENGTH:.1f} s, {BPM} BPM')


if __name__ == '__main__':
    main()
