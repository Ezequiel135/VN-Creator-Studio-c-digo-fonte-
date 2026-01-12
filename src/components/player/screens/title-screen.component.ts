
import { Component, input, output, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleScreenConfig, SettingsTranslation } from '../../../types';
import { VnService } from '../../../services/vn.service';
import { TitleModernComponent, TitleClassicComponent, TitleCinematicComponent, TitleRetroComponent, TitleSplitComponent } from './title-styles';

@Component({
  selector: 'app-title-screen',
  standalone: true,
  imports: [CommonModule, TitleModernComponent, TitleClassicComponent, TitleCinematicComponent, TitleRetroComponent, TitleSplitComponent],
  template: `
    <div class="absolute inset-0 z-[90] overflow-hidden"
         [style.background-image]="config().backgroundId ? 'url(' + getAssetUrl(config().backgroundId) + ')' : 'none'"
         [style.background-size]="'cover'"
         [style.background-position]="'center'"
         [style.background-color]="config().backgroundId ? 'transparent' : '#18181b'">
         
         @if (config().backgroundId) { <div class="absolute inset-0 bg-black/40 z-0"></div> }
         
         <!-- Audio & Settings Button -->
         @if (config().musicId) { <audio #titleAudio [src]="getAssetUrl(config().musicId)" autoplay loop></audio> }
         <div class="absolute top-4 right-4 z-[60]">
            <button (click)="settings.emit()" class="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/60 backdrop-blur transition-all">⚙️</button>
         </div>

         <!-- Dynamic Layout -->
         <div class="relative z-10 w-full h-full">
             @switch (config().layout) {
                 @case ('classic') { <app-title-classic [config]="config()" [loc]="loc()" (start)="start.emit()" (load)="load.emit()" (achievements)="achievements.emit()" (terms)="terms.emit()"></app-title-classic> }
                 @case ('cinematic') { <app-title-cinematic [config]="config()" [loc]="loc()" (start)="start.emit()" (load)="load.emit()" (achievements)="achievements.emit()" (terms)="terms.emit()"></app-title-cinematic> }
                 @case ('retro') { <app-title-retro [config]="config()" [loc]="loc()" (start)="start.emit()" (load)="load.emit()" (achievements)="achievements.emit()" (terms)="terms.emit()"></app-title-retro> }
                 @case ('split') { <app-title-split [config]="config()" [loc]="loc()" (start)="start.emit()" (load)="load.emit()" (achievements)="achievements.emit()" (terms)="terms.emit()"></app-title-split> }
                 @default { <app-title-modern [config]="config()" [loc]="loc()" (start)="start.emit()" (load)="load.emit()" (achievements)="achievements.emit()" (terms)="terms.emit()"></app-title-modern> }
             }
         </div>
    </div>
  `
})
export class TitleScreenComponent {
  vnService = inject(VnService);
  config = input.required<TitleScreenConfig>();
  loc = input.required<SettingsTranslation>();
  start = output<void>(); load = output<void>(); achievements = output<void>(); terms = output<void>(); settings = output<void>();

  constructor() {
      effect(() => {
          const vol = this.vnService.userPrefs().musicVolume;
          const audio = document.querySelector('audio') as HTMLAudioElement;
          if(audio) audio.volume = vol;
      });
  }
  getAssetUrl(id: string|null|undefined) { return this.vnService.getAssetUrl(id); }
}
