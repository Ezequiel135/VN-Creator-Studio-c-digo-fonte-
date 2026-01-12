
import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ParticleConfig } from '../../../types';
import { VnService } from '../../../services/vn.service';

@Component({
  selector: 'app-particle-layer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-[15]">
        @for (p of particles(); track p.id) {
            <div class="absolute will-change-transform"
                 [style.left.%]="p.left"
                 [style.animation]="p.anim"
                 [style.width.px]="p.size"
                 [style.height.px]="p.size"
                 [style.opacity]="p.opacity"
                 [style.--fall-x]="p.drift + 'px'"
                 [style.--fall-r]="p.rotation + 'deg'">
                 
                 <!-- Inner content -->
                 @if (p.imageUrl) {
                     <img [src]="p.imageUrl" class="w-full h-full object-contain">
                 } @else {
                     <div class="w-full h-full" [innerHTML]="p.svg"></div>
                 }
            </div>
        }
    </div>
  `
})
export class ParticleLayerComponent {
  vnService = inject(VnService);
  sanitizer = inject(DomSanitizer);
  config = input.required<ParticleConfig>();

  particles = computed(() => {
      const cfg = this.config();
      if (!cfg.enabled) return [];

      const count = (cfg.density || 3) * 10; // 10 to 50 particles
      const speedBase = (6 - (cfg.speed || 3)) * 2; // Speed 5 = 2s, Speed 1 = 10s

      const items = [];
      const imgUrl = cfg.preset === 'custom' && cfg.customAssetId ? this.vnService.getAssetUrl(cfg.customAssetId) : null;
      
      const rawSvg = this.getSvgForPreset(cfg.preset);
      // Important: Sanitize SVG to allow it to render
      const svg: SafeHtml | string = rawSvg ? this.sanitizer.bypassSecurityTrustHtml(rawSvg) : '';

      for (let i = 0; i < count; i++) {
          const delay = Math.random() * -10; // Start immediately but staggered
          const duration = speedBase + (Math.random() * 2);
          const size = Math.random() * 15 + 10; // 10-25px
          
          items.push({
              id: i,
              left: Math.random() * 100,
              anim: `particleFall ${duration}s linear ${delay}s infinite, particleSway ${duration * 0.7}s ease-in-out ${delay}s infinite alternate`,
              size,
              opacity: 0.7 + (Math.random() * 0.3),
              drift: (Math.random() - 0.5) * 100, // Horizontal destination offset
              rotation: (Math.random() - 0.5) * 720,
              imageUrl: imgUrl,
              svg
          });
      }
      return items;
  });

  getSvgForPreset(preset: string) {
      if (preset === 'sakura') {
          return `<svg viewBox="0 0 24 24" fill="#ffb7b2" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 14 6 18 8C22 10 22 14 20 17C18 20 14 20 12 18C10 20 6 20 4 17C2 14 2 10 6 8C10 6 12 2 12 2Z"/></svg>`;
      }
      if (preset === 'autumn') {
          return `<svg viewBox="0 0 24 24" fill="#d97706" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14 8L20 9L15 13L16 19L12 16L8 19L9 13L4 9L10 8L12 2Z"/></svg>`; 
      }
      if (preset === 'hearts') {
          return `<svg viewBox="0 0 24 24" fill="#f43f5e" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
      }
      if (preset === 'stars') {
          return `<svg viewBox="0 0 24 24" fill="#facc15" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
      }
      if (preset === 'bubbles') {
          return `<svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="1" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><circle cx="16" cy="8" r="3" fill="white" fill-opacity="0.4" stroke="none"/></svg>`;
      }
      if (preset === 'sparkles') {
          return `<svg viewBox="0 0 24 24" fill="#60a5fa" xmlns="http://www.w3.org/2000/svg"><path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z"/></svg>`;
      }
      if (preset === 'snow-flakes') {
          return `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" fill-opacity="0.8"/></svg>`;
      }
      return '';
  }
}
