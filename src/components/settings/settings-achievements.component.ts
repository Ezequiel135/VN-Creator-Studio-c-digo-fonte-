
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { ACHIEVEMENT_STYLES, ACHIEVEMENT_POSITIONS } from '../../config/achievement-styles';

@Component({
  selector: 'app-settings-achievements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-4">
        
        <!-- Style Selector -->
        <div>
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Estilo Visual</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                @for(st of styles; track st.value) {
                    <button (click)="update('style', st.value)"
                            class="p-3 rounded-lg border text-left transition-all flex flex-col gap-1 relative overflow-hidden group"
                            [class.bg-cyan-900_30]="current().style === st.value"
                            [class.border-cyan-500]="current().style === st.value"
                            [class.bg-slate-900]="current().style !== st.value"
                            [class.border-slate-700]="current().style !== st.value">
                        
                        <div class="flex justify-between items-start z-10 relative">
                            <span class="text-sm font-bold text-white">{{ st.label }}</span>
                            @if(current().style === st.value) { <span class="text-cyan-400 text-xs">●</span> }
                        </div>
                        <span class="text-[10px] text-slate-400 z-10 relative">{{ st.description }}</span>
                        
                        <!-- Hover Glow -->
                        <div class="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                }
            </div>
        </div>

        <div class="h-px bg-slate-700/50 w-full"></div>

        <!-- Position & Duration -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">Posição na Tela</label>
                <select [ngModel]="current().position" (ngModelChange)="update('position', $event)" 
                        class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs outline-none focus:border-cyan-500">
                    @for(pos of positions; track pos.value) {
                        <option [value]="pos.value">{{ pos.label }}</option>
                    }
                </select>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">Duração (ms)</label>
                <input type="number" [ngModel]="current().duration" (ngModelChange)="update('duration', $event)" 
                       class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs outline-none focus:border-cyan-500">
            </div>
        </div>

        <!-- Preview Button -->
        <div class="mt-4 pt-4 border-t border-slate-700 flex justify-center">
            <button (click)="testPopup()" class="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-bold text-sm shadow-lg shadow-yellow-900/20 transition-transform active:scale-95 flex items-center gap-2">
                <span>🧪</span> Testar Notificação
            </button>
        </div>
        <p class="text-center text-[10px] text-slate-500 mt-2">Clique para ver como ficará no jogo.</p>
    </div>
  `
})
export class SettingsAchievementsComponent {
  vnService = inject(VnService);
  
  styles = ACHIEVEMENT_STYLES;
  positions = ACHIEVEMENT_POSITIONS;

  current() {
      return this.vnService.settings().achievementPopup || { style: 'standard', position: 'top-center', duration: 4000, soundEnabled: true };
  }

  update(key: string, val: any) {
      const current = this.current();
      this.vnService.settings.update(s => ({
          ...s,
          achievementPopup: { ...current, [key]: val }
      }));
  }

  testPopup() {
      this.vnService.achievementNotification.set({
          name: 'Conquista de Teste',
          description: 'É assim que o jogador verá sua notificação.',
          iconUrl: undefined // Uses default trophy
      });
      
      setTimeout(() => {
          this.vnService.achievementNotification.set(null);
      }, this.current().duration);
  }
}
