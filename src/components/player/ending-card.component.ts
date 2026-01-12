
import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VnService } from '../../services/vn.service';

@Component({
  selector: 'app-ending-card',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block relative shrink-0'
  },
  template: `
    <!-- Card Container com Rotação Dinâmica -->
    <div [style.transform]="rotationStyle()"
         class="relative transition-all duration-500 ease-out hover:scale-110 hover:rotate-0 hover:z-50 cursor-pointer w-[280px] md:w-[450px]">
         
         <!-- White Frame (Polaroid Style) -->
         <div class="bg-white p-3 pb-12 shadow-[0_10px_20px_rgba(0,0,0,0.5)] rounded-sm transform origin-center border border-slate-200">
             
             <!-- TAPE EFFECT (Durex) - Varia a posição baseado no index -->
             <div class="absolute -top-4 w-24 h-8 bg-white/30 backdrop-blur-sm border-l border-r border-white/40 shadow-sm z-20"
                  [style.left.%]="tapePosition()"
                  [style.transform]="tapeRotation()"></div>

             <!-- Scene Viewport -->
             <div class="w-full aspect-video relative bg-slate-900 overflow-hidden border border-slate-200 shadow-inner group">
                 
                 <!-- MEDIA LAYER -->
                 @if (isVideo() && backgroundUrl(); as url) {
                     <video [src]="url" 
                            class="w-full h-full object-cover" 
                            [style.object-position]="bgPosition()"
                            autoplay loop muted playsinline>
                     </video>
                 } @else {
                     @let bgUrl = backgroundUrl();
                     @if (bgUrl) {
                         <img [src]="bgUrl" class="w-full h-full object-cover" [style.object-position]="bgPosition()">
                     } @else {
                         <!-- Fallback -->
                         <div class="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 p-4 bg-[url('https://transparent-textures.patterns.velomo.de/subtle_dots.png')]">
                             <span class="text-4xl mb-2 opacity-30">🎬</span>
                         </div>
                     }
                 }

                 <!-- CHARACTER LAYER -->
                 @if (characterUrl(); as url) {
                     <img [src]="url" class="absolute bottom-0 left-1/2 -translate-x-1/2 h-[90%] object-contain drop-shadow-md">
                 }

                 <!-- UI SNAPSHOT (Mini Dialogue Overlay) -->
                 @if (showUi() && (dialogueText() || speakerName())) {
                     <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pt-8 flex flex-col justify-end min-h-[40%] transition-opacity duration-300">
                         
                         <div class="bg-slate-900/95 border border-slate-600 rounded-lg p-3 text-white shadow-xl relative transform scale-100 origin-bottom">
                             
                             <!-- Nome do Personagem -->
                             @if (speakerName()) {
                                <div class="absolute -top-2.5 left-2 bg-cyan-700 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-cyan-500/50 tracking-wider z-20">
                                    {{ speakerName() }}
                                </div>
                             }
                             
                             <!-- Texto do Diálogo -->
                             <p class="text-[11px] leading-snug text-slate-100 font-medium font-sans mt-1 drop-shadow-sm line-clamp-3 text-left">
                                 {{ dialogueText() }}
                             </p>
                         </div>
                     </div>
                 }
             </div>

             <!-- Caption (Handwritten style) -->
             @if (!showUi() && sceneName()) {
                 <div class="absolute bottom-3 left-0 right-0 text-center">
                     <span class="text-sm font-bold text-slate-700 font-serif italic truncate px-6 block opacity-90" style="font-family: 'Dancing Script', cursive, serif;">
                        {{ sceneName() }}
                     </span>
                 </div>
             }
         </div>
    </div>
  `
})
export class EndingCardComponent {
  vnService = inject(VnService);
  sceneId = input.required<string>();
  showUi = input(false);
  index = input<number>(0);

  sceneData = computed(() => this.vnService.scenes().find(s => s.id === this.sceneId()));
  
  sceneName = computed(() => this.sceneData()?.name);
  isVideo = computed(() => this.sceneData()?.isVideo || false);
  backgroundUrl = computed(() => this.vnService.getAssetUrl(this.sceneData()?.backgroundId));
  
  // Computa a posição exata (bgX, bgY) para replicar o enquadramento original
  bgPosition = computed(() => {
      const s = this.sceneData();
      return `${s?.bgX ?? 50}% ${s?.bgY ?? 50}%`;
  });
  
  characterUrl = computed(() => {
      const s = this.sceneData();
      if (!s || !s.characters.length) return null;
      return this.vnService.getAssetUrl(s.characters[0].assetId);
  });

  dialogueText = computed(() => this.vnService.getLocalizedText(this.sceneData()!, 'dialogueText'));
  speakerName = computed(() => this.vnService.getLocalizedText(this.sceneData()!, 'speakerName'));

  // Lógica de Randomização Determinística
  private getPseudoRandom(seedExtras: number = 0) {
      const idStr = this.sceneId() || '';
      const idxStr = this.index() || 0;
      const str = String(idStr) + String(idxStr) + seedExtras;
      
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          hash |= 0; 
      }
      return Math.abs(hash);
  }

  // Lógica de Rotação: Aleatória (Esquerda, Direita ou Reta)
  rotationStyle = computed(() => {
      const rand = this.getPseudoRandom();
      const state = rand % 3;
      const variance = (rand % 40) / 10; // 0 a 4 graus

      let angle = 0;
      if (state === 0) {
          angle = -(2 + variance);
      } else if (state === 1) {
          angle = 2 + variance;
      } else {
          angle = (rand % 3) - 1.5;
      }

      return `rotate(${angle}deg)`;
  });

  // Posição do "Durex"
  tapePosition = computed(() => {
      const rand = this.getPseudoRandom(99);
      // Retorna apenas número (30 a 70), pois o template usa [style.left.%]
      return 30 + (rand % 40);
  });

  // Rotação do Durex
  tapeRotation = computed(() => {
      const rand = this.getPseudoRandom(55);
      const angle = (rand % 10) - 5; 
      return `translateX(-50%) rotate(${angle}deg)`;
  });
}