import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RoutesRecognized } from '@angular/router';

/**
 * Case-study themes: route data `{ theme: 'quorum' }` sets `<html data-theme="quorum">` before the page is
 * created, so the shared nav and footer pick up the project's tokens. Leaving the route removes it.
 */
@Injectable({ providedIn: 'root' })
export class RouteTheme {
  private readonly doc = inject(DOCUMENT);
  private readonly _theme = signal<string | null>(null);
  readonly theme = this._theme.asReadonly();

  constructor() {
    inject(Router).events.subscribe((e) => {
      if (!(e instanceof RoutesRecognized)) return;
      const theme = deepestData(e.state.root, 'theme') ?? null;
      this._theme.set(theme);
      const html = this.doc.documentElement;
      if (theme) html.setAttribute('data-theme', theme);
      else html.removeAttribute('data-theme');
    });
  }
}

function deepestData(snap: ActivatedRouteSnapshot, key: string): string | undefined {
  let found: string | undefined = snap.data?.[key];
  for (const child of snap.children) {
    const v = deepestData(child, key);
    if (v !== undefined) found = v;
  }
  return found;
}
