
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { DIALOGUE_STYLES, TYPING_EFFECTS, FONTS } from '../../config/dialogue-styles';
import { CHOICE_STYLES } from '../../config/choice-styles';

@Component({
  selector: 'app-settings-dialogue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-4">
        
        <!-- Style Selector -->
        <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Modelo da Caixa de Texto</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                @for(style of styles; track style.value) {
                    <button (click)="update('style', style.value)"
                            class="p-3 rounded-lg border text-left transition-all flex flex-col gap-1"
                            [class.bg-cyan-900_30]="current().style === style.value"
                            [class.border-cyan-500]="current().style === style.value"
                            [class.bg-slate-900]="current().style !== style.value"
                            [class.border-slate-700]="current().style !== style.value">
                        <span class="text-sm font-bold text-white">{{ style.label }}</span>
                        <span class="text-[10px] text-slate-400">{{ style.description }}</span>
                    </button>
                }
            </div>
        </div>

        <div class="h-px bg-slate-700/50 w-full"></div>

        <!-- NEW: Choice Button Style -->
        <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Modelo dos Botões de Escolha</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                @for(key of choiceStyleKeys; track key) {
                    <button (click)="update('choiceButtonStyle', key)"
                            class="p-3 rounded-lg border text-left transition-all"
                            [class.bg-cyan-900_30]="(current().choiceButtonStyle || 'modern') === key"
                            [class.border-cyan-500]="(current().choiceButtonStyle || 'modern') === key"
                            [class.bg-slate-900]="(current().choiceButtonStyle || 'modern') !== key"
                            [class.border-slate-700]="(current().choiceButtonStyle || 'modern') !== key">
                        <span class="text-xs font-bold text-white block mb-2">{{ choiceStyles[key].label }}</span>
                        <!-- Mini Preview -->
                        <div class="px-2 py-1 text-[10px] text-center pointer-events-none" [ngClass]="choiceStyles[key].containerClass">
                            Exemplo de Opção
                        </div>
                    </button>
                }
            </div>
        </div>

        <div class="h-px bg-slate-700/50 w-full"></div>

        <!-- Colors & Opacity -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cor do Fundo</label>
                <div class="flex items-center gap-2">
                    <input type="color" [ngModel]="current().backgroundColor" (ngModelChange)="update('backgroundColor', $event)" class="h-8 w-12 bg-transparent cursor-pointer rounded">
                    <input type="text" [ngModel]="current().backgroundColor" (ngModelChange)="update('backgroundColor', $event)" class="flex-1 bg-slate-900 border border-slate-600 rounded text-xs p-1.5 text-white">
                </div>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cor da Borda</label>
                <div class="flex items-center gap-2">
                    <input type="color" [ngModel]="current().borderColor" (ngModelChange)="update('borderColor', $event)" class="h-8 w-12 bg-transparent cursor-pointer rounded">
                    <input type="text" [ngModel]="current().borderColor" (ngModelChange)="update('borderColor', $event)" class="flex-1 bg-slate-900 border border-slate-600 rounded text-xs p-1.5 text-white">
                </div>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cor do Texto</label>
                <div class="flex items-center gap-2">
                    <input type="color" [ngModel]="current().textColor" (ngModelChange)="update('textColor', $event)" class="h-8 w-12 bg-transparent cursor-pointer rounded">
                    <input type="text" [ngModel]="current().textColor" (ngModelChange)="update('textColor', $event)" class="flex-1 bg-slate-900 border border-slate-600 rounded text-xs p-1.5 text-white">
                </div>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cor do Nome</label>
                <div class="flex items-center gap-2">
                    <input type="color" [ngModel]="current().nameColor" (ngModelChange)="update('nameColor', $event)" class="h-8 w-12 bg-transparent cursor-pointer rounded">
                    <input type="text" [ngModel]="current().nameColor" (ngModelChange)="update('nameColor', $event)" class="flex-1 bg-slate-900 border border-slate-600 rounded text-xs p-1.5 text-white">
                </div>
            </div>
        </div>

        <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">Opacidade do Fundo: {{ Math.round(current().backgroundOpacity * 100) }}%</label>
            <input type="range" min="0" max="1" step="0.05" [ngModel]="current().backgroundOpacity" (ngModelChange)="update('backgroundOpacity', $event)" class="w-full accent-cyan-500">
        </div>

        <div class="h-px bg-slate-700/50 w-full"></div>

        <!-- Typography & Animation -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fonte</label>
                <select [ngModel]="current().fontFamily" (ngModelChange)="update('fontFamily', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs">
                    @for(f of fonts; track f.value) { <option [value]="f.value">{{ f.label }}</option> }
                </select>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Efeito de Digitação</label>
                <select [ngModel]="current().typingEffect" (ngModelChange)="update('typingEffect', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs">
                    @for(e of effects; track e.value) { <option [value]="e.value">{{ e.label }}</option> }
                </select>
            </div>
        </div>

        <!-- Preview -->
        <div class="mt-4 p-4 rounded-lg bg-[url('https://transparent-textures.patterns.velomo.de/subtle_dots.png')] border border-slate-700 relative overflow-hidden h-32 flex items-end justify-center">
            <!-- Simulated Dialog Box -->
            <div class="w-full relative p-3 flex flex-col"
                 [style.background-color]="hexToRgba(current().backgroundColor, current().backgroundOpacity)"
                 [style.border-color]="current().borderColor"
                 [style.color]="current().textColor"
                 [style.font-family]="current().fontFamily"
                 [ngClass]="getPreviewClass(current().style)">
                 
                 <div class="absolute -top-3 left-4 text-xs font-bold px-2 py-0.5 rounded shadow-sm border"
                      [style.background-color]="current().nameColor"
                      [style.color]="isLight(current().nameColor) ? '#000' : '#fff'"
                      [style.border-color]="current().borderColor">
                     Personagem
                 </div>
                 
                 <p class="text-sm mt-1 leading-relaxed">
                     Esta é uma prévia de como o texto ficará no jogo.
                 </p>
            </div>
        </div>
    </div>
  `
})
export class SettingsDialogueComponent {
  vnService = inject(VnService);
  Math = Math;
  
  styles = DIALOGUE_STYLES;
  effects = TYPING_EFFECTS;
  fonts = FONTS;
  
  choiceStyles = CHOICE_STYLES;
  choiceStyleKeys = Object.keys(CHOICE_STYLES);

  current() {
      // Return safe object even if config missing
      return this.vnService.settings().dialogueBox || {
          style: 'modern',
          backgroundColor: '#0f172a',
          backgroundOpacity: 0.9,
          borderColor: '#334155',
          textColor: '#ffffff',
          nameColor: '#0891b2',
          fontFamily: 'Inter',
          typingEffect: 'typewriter',
          choiceButtonStyle: 'modern'
      };
  }

  update(key: string, val: any) {
      const current = this.current();
      this.vnService.settings.update(s => ({
          ...s,
          dialogueBox: { ...current, [key]: val }
      }));
  }

  // Helper helper to convert hex to rgba for preview
  hexToRgba(hex: string, alpha: number) {
      if(!hex) return `rgba(0,0,0,${alpha})`;
      let c: any;
      if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
          c = hex.substring(1).split('');
          if(c.length === 3){ c = [c[0], c[0], c[1], c[1], c[2], c[2]]; }
          c = '0x' + c.join('');
          return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
      }
      return hex;
  }

  isLight(color: string) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return ((r * 299) + (g * 587) + (b * 114)) / 1000 > 155;
  }

  getPreviewClass(style: string) {
      if (style === 'retro') return 'border-4 rounded-none shadow-none';
      if (style === 'paper') return 'border-2 rounded-sm shadow-md';
      if (style === 'neon') return 'border rounded-lg shadow-[0_0_10px_currentColor]';
      if (style === 'cinematic') return 'border-t border-b-0 border-l-0 border-r-0 rounded-none w-full bg-gradient-to-t from-black to-transparent';
      if (style === 'clean') return 'border-none shadow-none bg-transparent !bg-opacity-0 text-shadow-md';
      return 'border rounded-lg shadow-lg backdrop-blur'; // modern
  }
}
