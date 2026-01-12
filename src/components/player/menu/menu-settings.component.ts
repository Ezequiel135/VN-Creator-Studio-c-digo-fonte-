
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../../services/vn.service';

@Component({
  selector: 'app-menu-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 p-4 h-full overflow-y-auto custom-scrollbar">
        
        <!-- Audio Section -->
        <div class="space-y-4">
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-2">Áudio</h4>
            
            <!-- Music Volume -->
            <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-bold text-white flex items-center gap-2">
                        <span>🎵</span> {{ loc().musicLabel || 'Música' }}
                    </label>
                    <span class="text-xs text-cyan-400 font-mono">{{ Math.round(vnService.userPrefs().musicVolume * 100) }}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" 
                       [ngModel]="vnService.userPrefs().musicVolume" 
                       (ngModelChange)="updateMusic($event)" 
                       class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400">
            </div>

            <!-- Voice Volume -->
            <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-bold text-white flex items-center gap-2">
                        <span>🗣️</span> {{ loc().voiceLabel || 'Voz / Narração' }}
                    </label>
                    <span class="text-xs text-cyan-400 font-mono">{{ Math.round(vnService.userPrefs().voiceVolume * 100) }}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" 
                       [ngModel]="vnService.userPrefs().voiceVolume" 
                       (ngModelChange)="updateVoice($event)" 
                       class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400">
            </div>
        </div>

        <!-- Text Section -->
        <div class="space-y-4">
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-2">Texto</h4>
            
            <!-- Text Speed -->
            <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-bold text-white flex items-center gap-2">
                        <span>⚡</span> {{ loc().speedLabel || 'Velocidade' }}
                    </label>
                    <span class="text-xs text-cyan-400">{{ getSpeedLabel() }}</span>
                </div>
                <!-- Reversed direction for logical feel (Right = Faster) -->
                <input type="range" min="0" max="60" step="10" 
                       [ngModel]="60 - vnService.userPrefs().textSpeed" 
                       (ngModelChange)="updateSpeed(60 - $event)" 
                       class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400">
                <div class="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
                    <span>Lento</span>
                    <span>Rápido</span>
                    <span>Instantâneo</span>
                </div>
            </div>
        </div>

        <!-- Language Section -->
        <div class="space-y-4">
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-2">Geral</h4>
            
            <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                 <label class="text-sm font-bold text-white flex items-center gap-2 mb-2">
                    <span>🌐</span> {{ loc().languageLabel || 'Idioma' }}
                 </label>
                 <div class="grid grid-cols-2 gap-2">
                     @for (lang of vnService.settings().languages; track lang.id) {
                         <button (click)="vnService.playLanguage.set(lang.id)"
                                 class="px-3 py-2 rounded text-xs font-bold transition-all border"
                                 [class.bg-cyan-600]="vnService.playLanguage() === lang.id"
                                 [class.text-white]="vnService.playLanguage() === lang.id"
                                 [class.border-cyan-500]="vnService.playLanguage() === lang.id"
                                 [class.bg-slate-800]="vnService.playLanguage() !== lang.id"
                                 [class.text-slate-400]="vnService.playLanguage() !== lang.id"
                                 [class.border-slate-700]="vnService.playLanguage() !== lang.id"
                                 [class.hover:border-slate-500]="vnService.playLanguage() !== lang.id">
                             {{ lang.name }}
                         </button>
                     }
                 </div>
            </div>
        </div>
    </div>
  `
})
export class MenuSettingsComponent {
  vnService = inject(VnService);
  Math = Math;

  loc = computed(() => this.vnService.getLocalizedSettings().gameplayMenu || {});

  updateMusic(v: number) { this.vnService.updateUserPref({ musicVolume: v }); }
  updateVoice(v: number) { this.vnService.updateUserPref({ voiceVolume: v }); }
  updateSpeed(v: number) { this.vnService.updateUserPref({ textSpeed: v }); }

  getSpeedLabel() {
      const s = this.vnService.userPrefs().textSpeed;
      if (s === 0) return 'Instantâneo';
      if (s < 20) return 'Muito Rápido';
      if (s < 40) return 'Normal';
      return 'Lento';
  }
}
