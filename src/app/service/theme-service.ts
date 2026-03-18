import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _dark = false;
  private _forced = false;

  constructor() {
    const saved = localStorage.getItem('theme');
    this._dark = saved === 'dark';
    this.apply();
  }

  get dark(): boolean { return this._dark; }

  toggle() {
    if (this._forced) return; // no toggle on admin
    this._dark = !this._dark;
    localStorage.setItem('theme', this._dark ? 'dark' : 'light');
    this.apply();
  }

  /** Called by admin layout — forces light, hides user preference */
  forceLightMode() {
    this._forced = true;
    document.documentElement.removeAttribute('data-theme');
  }

  /** Called when leaving admin — restores user's saved preference */
  restoreUserTheme() {
    this._forced = false;
    this.apply();
  }

  private apply() {
    if (this._dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
