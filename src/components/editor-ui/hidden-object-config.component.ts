
import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { HiddenObject } from '../../types';
import { AffectionSelectorComponent } from './affection-selector.component';

@Component({
  selector: 'app-hidden-object-config',
  standalone: true,
  imports: [CommonModule, FormsModule, AffectionSelectorComponent],
  template: `
    <div class="bg-slate-900 border-l-4 border-yellow-500 rounded-r-lg shadow-md mb-4 overflow-hidden">
        
        <!-- Header -->
        <div class="p-3 bg-slate-950/50 flex justify-between items-center border-b border-slate-800">
            <div class="flex items-center gap-2 overflow-hidden">
                <span class="text-lg">🕵️</span>
                <input [ngModel]="object().name" (ngModelChange)="update('name', $event)" 
                       class="bg-transparent text-white font-bold text-sm focus:outline-none focus:border-b border-yellow-500 placeholder-slate-500 w-full"
                       placeholder="Nome do Objeto">
            </div>
            <button (click)="remove.emit(object().id)" class="text-slate-600 hover:text-red-400 p-1 transition-colors" title="Remover Objeto">✕</button>
        </div>

        <div class="p-4 space-y-4">
            
            <!-- Posicionamento -->
            <div class="flex gap-4 items-start">
                <div class="flex-1">
                    <label class="text-[9px] font-bold text-slate-500 uppercase block mb-1">Área de Toque</label>
                    <button (click)="togglePick()" 
                            class="w-full py-2 rounded text-xs font-bold transition-all border flex items-center justify-center gap-2"
                            [class.bg-cyan-600]="isPicking()"
                            [class.text-white]="isPicking()"
                            [class.border-cyan-500]="isPicking()"
                            [class.animate-pulse]="isPicking()"
                            [class.bg-slate-800]="!isPicking()"
                            [class.text-slate-300]="!isPicking()"
                            [class.border-slate-700]="!isPicking()"
                            [class.hover:bg-slate-700]="!isPicking()">
                        <span>{{ isPicking() ? '📍 Clicando...' : '🎯 Definir Posição' }}</span>
                    </button>
                    <div class="grid grid-cols-2 gap-2 mt-2">
                        <div class="relative">
                            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500">W</span>
                            <input type="number" [ngModel]="object().width" (ngModelChange)="update('width', $event)" class="w-full bg-slate-950 border border-slate-700 rounded p-1 pl-5 text-xs text-white text-center" title="Largura %">
                        </div>
                        <div class="relative">
                            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500">H</span>
                            <input type="number" [ngModel]="object().height" (ngModelChange)="update('height', $event)" class="w-full bg-slate-950 border border-slate-700 rounded p-1 pl-5 text-xs text-white text-center" title="Altura %">
                        </div>
                    </div>
                </div>

                <!-- Preview Miniatura -->
                <div class="w-20 shrink-0">
                    <label class="text-[9px] font-bold text-slate-500 uppercase block mb-1 text-center">Imagem Item</label>
                    <div class="w-20 h-20 bg-black rounded border border-slate-700 relative overflow-hidden group cursor-pointer" title="Imagem que aparece ao encontrar">
                        @if(object().itemImageId) {
                            <img [src]="getAssetUrl(object().itemImageId)" class="w-full h-full object-contain">
                        } @else {
                            <span class="absolute inset-0 flex items-center justify-center text-2xl opacity-20">🎁</span>
                        }
                        <select [ngModel]="object().itemImageId" (ngModelChange)="update('itemImageId', $event)" 
                                class="absolute inset-0 opacity-0 cursor-pointer">
                            <option [ngValue]="null">-- Sem Imagem --</option>
                            <optgroup label="Fundos">
                                @for(a of backgrounds(); track a.id) { <option [value]="a.id">{{a.name}}</option> }
                            </optgroup>
                            <optgroup label="Personagens">
                                @for(a of characters(); track a.id) { <option [value]="a.id">{{a.name}}</option> }
                            </optgroup>
                        </select>
                        <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                </div>
            </div>

            <div class="h-px bg-slate-800 w-full"></div>

            <!-- Feedback -->
            <div>
                <label class="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Mensagem ao Encontrar</label>
                <textarea [ngModel]="object().message" (ngModelChange)="update('message', $event)" 
                          class="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white resize-none h-16 focus:border-yellow-500 outline-none transition-colors" 
                          placeholder="Ex: Você encontrou uma chave antiga!"></textarea>
            </div>

            <!-- Affection -->
            <app-affection-selector 
                [reward]="object().affectionReward" 
                (rewardChange)="update('affectionReward', $event)">
            </app-affection-selector>

            <!-- Checkbox -->
            <label class="flex items-center gap-2 cursor-pointer group">
                <div class="relative">
                    <input type="checkbox" [ngModel]="object().once" (ngModelChange)="update('once', $event)" class="peer sr-only">
                    <div class="w-4 h-4 border-2 border-slate-600 rounded bg-slate-900 peer-checked:bg-cyan-600 peer-checked:border-cyan-600 transition-colors"></div>
                    <svg class="w-3 h-3 text-white absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span class="text-xs text-slate-400 group-hover:text-white transition-colors">Item Único (Some após coletar)</span>
            </label>
        </div>
    </div>
  `
})
export class HiddenObjectConfigComponent {
  vnService = inject(VnService);
  object = input.required<HiddenObject>();
  sceneId = input.required<string>();
  remove = output<string>();

  backgrounds = computed(() => this.vnService.assets().filter(a => a.type === 'background'));
  characters = computed(() => this.vnService.assets().filter(a => a.type === 'character'));

  isPicking = computed(() => {
      const interaction = this.vnService.editorInteraction();
      return interaction?.type === 'pick-hidden-object' && interaction.itemId === this.object().id;
  });

  getAssetUrl(id: string|null) { return this.vnService.getAssetUrl(id); }

  togglePick() {
      if (this.isPicking()) {
          this.vnService.editorInteraction.set(null);
      } else {
          this.vnService.editorInteraction.set({ type: 'pick-hidden-object', itemId: this.object().id });
      }
  }

  update(key: keyof HiddenObject, val: any) {
      const s = this.vnService.scenes().find(x => x.id === this.sceneId());
      if (!s || !s.hiddenObjects) return;
      
      const newObjs = s.hiddenObjects.map(o => o.id === this.object().id ? { ...o, [key]: val } : o);
      this.vnService.updateScene(this.sceneId(), { hiddenObjects: newObjs });
  }
}
