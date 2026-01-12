
import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VnService } from '../../services/vn.service';
import { EndingScreenConfig } from '../../types';
import { generateCreditsLayout, CreditBlock } from '../../utils/credits-layout';
import { EndingCardComponent } from './ending-card.component';
import { ParticleLayerComponent } from './layers/particle-layer.component';

@Component({
  selector: 'app-ending-roller',
  standalone: true,
  imports: [CommonModule, EndingCardComponent, ParticleLayerComponent],
  host: {
    class: 'absolute inset-0 z-[100] block overflow-hidden bg-black select-none'
  },
  template: `
        <!-- Background Layer (Fixed) -->
        <div class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 z-0 opacity-30 grayscale-[50%] blur-sm scale-105"
             [style.background-image]="config().backgroundId ? 'url(' + getAssetUrl(config().backgroundId) + ')' : 'none'">
        </div>
        
        <!-- Vignette & Gradient -->
        <div class="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black z-10"></div>

        <!-- Particles (Between BG and Content) -->
        @if (config().particleConfig && config().particleConfig!.enabled) {
            <app-particle-layer [config]="config().particleConfig!"></app-particle-layer>
        }

        <!-- Scrolling Content Container -->
        <div class="absolute inset-x-0 z-20 flex justify-center w-full"
             [style.animation-duration]="scrollDuration() + 's'"
             [ngClass]="config().scrollDirection === 'down' ? 'scroll-anim-down' : 'scroll-anim-up'"
             (animationend)="finished.emit()">
            
             <div class="w-full max-w-4xl px-4 md:px-8 pb-[100vh] flex flex-col items-center pt-[100vh]">
                 
                 <!-- Main Title -->
                 <h1 class="text-6xl md:text-8xl font-black mb-32 text-white drop-shadow-2xl tracking-widest uppercase text-center font-serif opacity-90 break-words w-full">
                     {{ title() || 'FIM' }}
                 </h1>

                 <!-- Content Blocks -->
                 <div class="flex flex-col gap-24 w-full items-center">
                     @for (block of layout(); track $index) {
                         
                         @if (block.type === 'text') {
                             <!-- Text Block -->
                             <div class="w-full text-center font-medium text-slate-300 drop-shadow-md whitespace-pre-wrap leading-relaxed max-w-2xl mx-auto tracking-wide break-words hyphens-auto px-4"
                                  [style.font-family]="config().fontFamily"
                                  [class.text-2xl]="isHeader(block.content)"
                                  [class.font-bold]="isHeader(block.content)"
                                  [class.text-cyan-100]="isHeader(block.content)"
                                  [class.opacity-100]="isHeader(block.content)"
                                  [class.text-lg]="!isHeader(block.content)"
                                  [class.opacity-80]="!isHeader(block.content)">
                                  {{ block.content }}
                             </div>
                         } 
                         
                         @else if (block.type === 'image') {
                             <!-- Image/Scene Block -->
                             <div class="py-4 w-full flex relative z-30 justify-center px-4 perspective-1000" 
                                  [ngClass]="getAlignmentClass(block.data.position)">
                                 <app-ending-card 
                                     [sceneId]="block.data.sceneId"
                                     [showUi]="block.data.showUiSnapshot"
                                     [index]="$index">
                                 </app-ending-card>
                             </div>
                         }
                     }
                 </div>
                 
                 <!-- Footer Logo/Text -->
                 <div class="mt-40 mb-20 text-slate-600 text-xs uppercase tracking-[0.8em] font-light text-center w-full break-words">
                     Obrigado por jogar
                 </div>
            </div>
        </div>

        <!-- Interactive Skip -->
        @if (config().enableSkip !== false) {
            <button (click)="finished.emit()" 
                    class="absolute bottom-8 right-8 z-50 text-white/30 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/20 px-6 py-2 rounded-full transition-all cursor-pointer font-bold text-[10px] tracking-[0.2em] uppercase backdrop-blur-sm">
                Pular Cena
            </button>
        }
  `,
  styles: [`
    .scroll-anim-up {
        animation: scrollUp linear forwards;
    }
    .scroll-anim-down {
        animation: scrollDown linear forwards;
    }
    .perspective-1000 {
        perspective: 1000px;
    }

    @keyframes scrollUp {
        0% { transform: translateY(0); }
        100% { transform: translateY(-100%); }
    }

    @keyframes scrollDown {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(0); }
    }
  `]
})
export class EndingRollerComponent {
  vnService = inject(VnService);
  config = input.required<EndingScreenConfig>();
  title = input.required<string>();
  subtitle = input.required<string>();
  finished = output<void>();

  getAssetUrl(id: string|null) { return this.vnService.getAssetUrl(id); }

  layout = computed(() => {
      const text = this.subtitle();
      const gallery = this.config().gallery || [];
      const name = this.vnService.playerName();
      const allScenes = this.vnService.scenes();
      return generateCreditsLayout(text, gallery, name, allScenes);
  });

  scrollDuration = computed(() => {
     // Slower speed for more professional look
     const base = this.config().scrollSpeed || 40;
     const items = this.layout().length;
     // Base calculation + dynamic length adjustment
     return Math.max(25, items * 5) * (base / 40); 
  });

  isHeader(text: string): boolean {
      // Improved header detection
      const trimmed = text.trim();
      return trimmed.length < 50 && trimmed === trimmed.toUpperCase() && !trimmed.includes('.') && trimmed.length > 2;
  }

  getAlignmentClass(pos: string) {
      if (pos.includes('left')) return 'md:justify-start md:pl-32';
      if (pos.includes('right')) return 'md:justify-end md:pr-32';
      return 'justify-center';
  }
}
