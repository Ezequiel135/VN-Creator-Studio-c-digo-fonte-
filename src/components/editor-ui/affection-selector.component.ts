
import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { AffectionReward } from '../../types';

@Component({
  selector: 'app-affection-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gradient-to-br from-pink-900/30 to-slate-900 p-4 rounded-lg border border-pink-500/30 flex flex-col md:flex-row md:items-center gap-4">
        
        <!-- Header / Portrait (Mobile Stacked) -->
        <div class="flex items-center gap-3 shrink-0">
            <div class="w-12 h-12 rounded-full bg-black border border-pink-500/50 overflow-hidden shrink-0 flex items-center justify-center relative shadow-lg">
                @if(selectedCharUrl()) {
                    <img [src]="selectedCharUrl()" class="w-full h-full object-cover">
                } @else {
                    <span class="text-pink-500 text-xl opacity-50">?</span>
                }
            </div>
            <div class="flex flex-col">
                <label class="text-[10px] font-bold text-pink-400 uppercase flex items-center gap-1">
                    <span>❤️</span> Recompensa de Afeto
                </label>
                <span class="text-[9px] text-slate-400">Ganha/Perde pontos</span>
            </div>
        </div>

        <!-- Controls -->
        <div class="flex-1 flex gap-2 w-full">
            <select [ngModel]="reward()?.characterId" (ngModelChange)="updateChar($event)" 
                    class="flex-1 bg-slate-950 border border-slate-600 rounded-lg text-sm text-white p-3 focus:border-pink-500 outline-none cursor-pointer h-12 md:h-auto">
                <option [ngValue]="null">-- Ninguém --</option>
                @for(char of characters(); track char.id) {
                    <option [value]="char.id">{{ char.name }}</option>
                }
            </select>
            
            <div class="flex items-center bg-slate-950 border border-slate-600 rounded-lg h-12 md:h-auto">
                <button (click)="increment(-1)" [disabled]="!reward()?.characterId" class="px-3 h-full text-slate-400 hover:text-white disabled:opacity-30 border-r border-slate-700 font-bold">-</button>
                <input type="number" [ngModel]="reward()?.amount || 0" (ngModelChange)="updateAmt($event)"
                       [disabled]="!reward()?.characterId"
                       class="w-14 bg-transparent text-center text-white focus:outline-none font-bold appearance-none m-0" 
                       [class.text-green-400]="(reward()?.amount || 0) > 0"
                       [class.text-red-400]="(reward()?.amount || 0) < 0">
                <button (click)="increment(1)" [disabled]="!reward()?.characterId" class="px-3 h-full text-slate-400 hover:text-white disabled:opacity-30 border-l border-slate-700 font-bold">+</button>
            </div>
        </div>
    </div>
  `
})
export class AffectionSelectorComponent {
  vnService = inject(VnService);
  reward = input<AffectionReward | null | undefined>(null);
  rewardChange = output<AffectionReward | null>();

  characters = computed(() => this.vnService.assets().filter(a => a.type === 'character'));
  
  selectedCharUrl = computed(() => {
      const id = this.reward()?.characterId;
      if(!id) return null;
      return this.vnService.getAssetUrl(id);
  });

  updateChar(id: string) {
      if (!id) {
          this.rewardChange.emit(null);
      } else {
          this.rewardChange.emit({ characterId: id, amount: this.reward()?.amount || 1 });
      }
  }

  updateAmt(amt: number) {
      if (this.reward()?.characterId) {
          this.rewardChange.emit({ ...this.reward()!, amount: amt });
      }
  }

  increment(delta: number) {
      if(this.reward()?.characterId) {
          const current = this.reward()?.amount || 0;
          this.updateAmt(current + delta);
      }
  }
}
