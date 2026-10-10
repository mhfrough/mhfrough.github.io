import { Pipe, PipeTransform } from '@angular/core';

const TOKEN = /(--[a-z][a-z0-9-]*|\.[a-z][a-z0-9]*(?:--?[a-z0-9]+)+|:root\[data-theme\])/g;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Prose with design tokens in it: escapes the text and wraps tokens and BEM classes (--ink, .card--hover)
 * in <code class="tk">, so they render in mono and never break across lines at their hyphens.
 * Use with [innerHTML]; the output only ever contains <code class="tk">.
 */
@Pipe({ name: 'tk' })
export class TkPipe implements PipeTransform {
  transform(text: string): string {
    return esc(text).replace(TOKEN, '<code class="tk">$1</code>');
  }
}
