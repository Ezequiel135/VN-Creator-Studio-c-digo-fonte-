
import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';

@Component({
  selector: 'app-achievement-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-950 p-4 rounded border border-slate-700 shadow-sm hover:border-yellow-600/50 transition-colors">
        <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">🏆</span>
            <label class="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Desbloquear Conquista</label>
        </div>
        <p class="text-[9px] text-slate-500 mb-2">Esta conquista será dada ao jogador assim que ele entrar nesta cena.</p>
        
        <div class="relative">
            <select [ngModel]="selectedAchievementId()" (ngModelChange)="selectedAchievementIdChange.emit($event)"
                    class="w-full bg-slate-900 border border-slate-600 rounded text-xs text-white p-2.5 cursor-pointer focus:border-yellow-500 outline-none appearance-none">
                <option [ngValue]="null">--- Nenhuma ---</option>
                @for(ach of vnService.achievements(); track ach.id) {
                    <option [value]="ach.id">{{ach.name}}</option>
                }
            </select>
            <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">▼</div>
        </div>

        @if (vnService.achievements().length === 0) {
            <p class="text-[9px] text-red-400 mt-2 flex items-center gap-1">
                <span>⚠️</span> Nenhuma conquista criada. Vá ao menu "Conquistas".
            </p>
        }
    </div>
  `
})
export class AchievementSelectorComponent {
  vnService = inject(VnService);
  selectedAchievementId = input<string | null>(null);
  selectedAchievementIdChange = output<string | null>();
}
