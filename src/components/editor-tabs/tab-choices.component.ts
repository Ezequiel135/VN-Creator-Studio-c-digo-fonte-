
import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { Scene, AffectionReward } from '../../types';
import { LinearFlowComponent } from '../linear-flow.component';
import { AffectionSelectorComponent } from '../editor-ui/affection-selector.component';

@Component({
  selector: 'app-tab-choices',
  standalone: true,
  imports: [CommonModule, FormsModule, LinearFlowComponent, AffectionSelectorComponent],
  template: `
    <div class="flex flex-col h-full gap-4 p-4">
        
        <!-- Linear Flow (Always visible) -->
        <app-linear-flow 
            [currentSceneId]="scene().id" 
            [nextSceneId]="scene().nextSceneId || null"
            [disabled]="vnService.editorLanguage() !== 'default'">
        </app-linear-flow>

        <div class="h-px bg-slate-700/50 w-full shrink-0"></div>

        <!-- Choices List -->
        <div class="flex items-center justify-between shrink-0">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opções de Ramificação</label>
            <button (click)="addChoice()" 
                    [disabled]="vnService.editorLanguage() !== 'default'"
                    class="bg-cyan-900/30 hover:bg-cyan-700 text-cyan-400 hover:text-white px-3 py-1.5 rounded text-xs border border-cyan-800 transition-colors disabled:opacity-50 font-bold flex items-center gap-1">
                <span>+</span> Adicionar
            </button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
            @for (choice of scene().choices; track choice.id) {
                <div class="bg-slate-950 p-3 rounded border border-slate-700 flex flex-col gap-3 shadow-sm group hover:border-slate-600 transition-colors">
                    <div>
                        <label class="text-[9px] text-slate-500 font-bold uppercase block mb-1">Texto do Botão</label>
                        <input [ngModel]="getChoiceText(choice.id, choice.text)" (ngModelChange)="updateChoiceText(choice.id, $event)"
                               class="bg-slate-900 border border-slate-700 rounded w-full text-sm text-white focus:border-cyan-500 outline-none px-2 py-1.5 transition-colors"
                               placeholder="Ex: Abrir a porta...">
                    </div>
                    
                    <div>
                        <label class="text-[9px] text-slate-500 font-bold uppercase block mb-1">Destino (Próxima Cena)</label>
                        <div class="flex items-center gap-2">
                            <select [ngModel]="choice.targetSceneId" (ngModelChange)="updateChoiceTarget(choice.id, $event)"
                                    [disabled]="vnService.editorLanguage() !== 'default'"
                                    class="flex-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 py-1.5 px-2 outline-none focus:border-cyan-500 cursor-pointer">
                                <option [ngValue]="null">--- Selecionar Cena ---</option>
                                @for(s of vnService.scenes(); track s.id) { <option [value]="s.id">{{s.name}}</option> }
                            </select>
                            @if(vnService.editorLanguage() === 'default') {
                                <button (click)="removeChoice(choice.id, $event)" class="bg-slate-800 hover:bg-red-900/50 text-slate-500 hover:text-red-400 p-1.5 rounded transition-colors border border-slate-700" title="Remover Opção">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            }
                        </div>
                    </div>

                    <!-- Affection Config -->
                    @if(vnService.editorLanguage() === 'default') {
                        <div class="pt-2 border-t border-slate-800">
                            <app-affection-selector 
                                [reward]="choice.affectionReward" 
                                (rewardChange)="updateAffection(choice.id, $event)">
                            </app-affection-selector>
                        </div>
                    }
                </div>
            }
            @if (scene().choices.length === 0) {
                <div class="h-20 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded bg-slate-900/30">
                    <span class="text-xs italic">Sem escolhas.</span>
                    <span class="text-[10px]">O fluxo seguirá a opção "Linear".</span>
                </div>
            }
        </div>
    </div>
  `
})
export class TabChoicesComponent {
  vnService = inject(VnService);
  scene = input.required<Scene>();

  addChoice() { this.vnService.addChoice(this.scene().id); }
  
  removeChoice(id: string, event: Event) { 
      event.stopPropagation();
      if(confirm('Apagar esta opção de escolha?')) {
          this.vnService.removeChoice(this.scene().id, id); 
      }
  }
  
  updateChoiceTarget(id: string, t: string) { this.vnService.updateChoice(this.scene().id, id, { targetSceneId: t }); }

  getChoiceText(id: string, def: string) { return this.vnService.getLocalizedChoiceText(this.scene(), id, def); }
  
  updateChoiceText(id: string, t: string) {
      const s = this.scene();
      const lang = this.vnService.editorLanguage();
      if (lang === 'default') this.vnService.updateChoice(s.id, id, { text: t });
      else {
          const tr = s.translations || {};
          const lt = tr[lang] || {};
          const ch = lt.choices || {};
          this.vnService.updateScene(s.id, { translations: { ...tr, [lang]: { ...lt, choices: { ...ch, [id]: t } } } });
      }
  }

  updateAffection(choiceId: string, reward: AffectionReward | null) {
      this.vnService.updateChoice(this.scene().id, choiceId, { affectionReward: reward });
  }
}
