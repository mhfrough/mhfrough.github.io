import { Injectable, Pipe, PipeTransform, Signal, computed, signal } from '@angular/core';

// DEPRECATED SHIM: Urdu was removed (owner request, 2026-10-10). The site is English only.
// Kept for a moment so in-flight page code compiles. Do not use in new code; delete once nothing imports it.

export type Lang = 'en';
export type Copy<T> = { en: T; ur?: T };

@Injectable({ providedIn: 'root' })
export class I18n {
  readonly lang = signal<Lang>('en').asReadonly();
  select<T>(copy: Copy<T>): Signal<T> {
    return computed(() => copy.en);
  }
  pick<T>(copy: Copy<T>): T {
    return copy.en;
  }
  link(path: string): string {
    return path;
  }
}

@Pipe({ name: 'loc' })
export class LocPipe implements PipeTransform {
  transform(path: string): string {
    return path;
  }
}
