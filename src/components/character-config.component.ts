
import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../services/vn.service';
import { GameCharacter } from '../types';

@Component({
  selector: 'app-character-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 p-3 rounded border border-slate-700 space-y-3">
       <div class="flex justify-between items-center border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
              <span class="text-lg">👤</span>
              <span class="text-xs font-bold text-white truncate max-w-[120px]" title="{{ getAssetName(character().assetId) }}">
                  {{ getAssetName(character().assetId) }}
              </span>
          </div>
          <button (click)="handleRemove($event)" class="bg-red-900/20 hover:bg-red-900/50 text-red-400 hover:text-red-200 text-xs p-1.5 rounded transition-colors" title="Remover Personagem">
             🗑️
          </button>
       </div>
       
       <!-- Controls -->
       <div class="space-y-2">
           <!-- Scale Control Removed as requested -->

           <!-- Animation Entrance -->
           <div class="flex items-center gap-2">
               <span class="text-[9px] font-bold text-slate-500 uppercase w-12">Entrada</span>
               <select [ngModel]="character().animation || 'fade'" (ngModelChange)="updateAnim($event)" 
                       class="flex-1 bg-slate-950 border border-slate-700 rounded text-[10px] text-white py-1 px-2 outline-none focus:border-cyan-500 cursor-pointer">
                   <option value="none">Nenhuma (Corte)</option>
                   <option value="fade">Fade In (Suave)</option>
                   <option value="slide-left">Slide Esquerda</option>
                   <option value="slide-right">Slide Direita</option>
                   <option value="pop">Pop In (Pulo)</option>
                   <option value="shake">Shake (Tremer)</option>
               </select>
           </div>
           
           <!-- Animation Exit (Conceptual/Configuration) -->
           <div class="flex items-center gap-2">
               <span class="text-[9px] font-bold text-slate-500 uppercase w-12">Saída</span>
               <select [ngModel]="character().exitAnimation || 'none'" (ngModelChange)="updateExitAnim($event)" 
                       class="flex-1 bg-slate-950 border border-slate-700 rounded text-[10px] text-white py-1 px-2 outline-none focus:border-cyan-500 cursor-pointer">
                   <option value="none">Nenhuma (Corte)</option>
                   <option value="fade">Fade Out</option>
               </select>
           </div>

           <!-- Flip -->
           <button (click)="toggleFlip()" 
                   class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded py-1.5 flex items-center justify-center gap-2 transition-colors border border-slate-700"
                   [class.text-cyan-400]="character().isFlipped"
                   [class.border-cyan-900]="character().isFlipped">
               <span>↔️</span> {{ character().isFlipped ? 'Virado (Espelhado)' : 'Normal' }}
           </button>
       </div>
    </div>
  `
})
export class CharacterConfigComponent {
  vnService = inject(VnService);
  character = input.required<GameCharacter>();
  sceneId = input.required<string>();
  remove = output<string>();
  Math = Math;

  getAssetName(id: string) {
      return this.vnService.assets().find(a => a.id === id)?.name || 'Personagem';
  }

  updateAnim(val: any) {
      this.vnService.updateCharacter(this.sceneId(), this.character().id, { animation: val });
  }
  
  updateExitAnim(val: any) {
      this.vnService.updateCharacter(this.sceneId(), this.character().id, { exitAnimation: val });
  }

  toggleFlip() {
      this.vnService.updateCharacter(this.sceneId(), this.character().id, { isFlipped: !this.character().isFlipped });
  }

  handleRemove(event: Event) {
      event.stopPropagation();
      this.remove.emit(this.character().id);
  }
}
