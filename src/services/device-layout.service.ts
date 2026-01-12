
import { Injectable, signal, OnDestroy } from '@angular/core';
import { LayoutPortrait } from '../config/layout-portrait';
import { LayoutLandscape } from '../config/layout-landscape';

@Injectable({
  providedIn: 'root'
})
export class DeviceLayoutService implements OnDestroy {
  
  // Signal containing the current active layout configuration
  currentLayout = signal(LayoutLandscape);
  orientation = signal<'portrait' | 'landscape'>('landscape');

  private mediaQuery: MediaQueryList;
  private listener: (e: MediaQueryListEvent) => void;

  constructor() {
    // Initialize listener for orientation changes
    this.mediaQuery = window.matchMedia("(orientation: portrait)");
    
    // Initial check
    this.updateLayout(this.mediaQuery.matches);

    // Setup listener
    this.listener = (e: MediaQueryListEvent) => this.updateLayout(e.matches);
    this.mediaQuery.addEventListener("change", this.listener);
  }

  private updateLayout(isPortrait: boolean) {
      if (isPortrait) {
          this.orientation.set('portrait');
          this.currentLayout.set(LayoutPortrait);
      } else {
          this.orientation.set('landscape');
          this.currentLayout.set(LayoutLandscape);
      }
  }

  ngOnDestroy() {
      if (this.mediaQuery && this.listener) {
          this.mediaQuery.removeEventListener("change", this.listener);
      }
  }
}
