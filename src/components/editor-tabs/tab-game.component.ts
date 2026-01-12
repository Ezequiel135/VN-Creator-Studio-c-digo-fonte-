
import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { Scene, MiniGameType, AffectionReward } from '../../types';
import { AchievementSelectorComponent } from '../editor-ui/achievement-selector.component';
import { AffectionSelectorComponent } from '../editor-ui/affection-selector.component';

@Component({
  selector: 'app-tab-game',
  standalone: true,
  imports: [CommonModule, FormsModule, AchievementSelectorComponent, AffectionSelectorComponent],
  template: `
    <div class="flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar p-4">
        
        <!-- Componente Isolado de Conquista -->
        <app-achievement-selector 
            [selectedAchievementId]="scene().awardAchievementId || null"
            (selectedAchievementIdChange)="updateAchiev($event)">
        </app-achievement-selector>

        <!-- Mini Game Config -->
        <div class="bg-slate-950 p-4 rounded border border-slate-700 shadow-sm flex-1 shrink-0">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-2">
                    <span class="text-lg">🎮</span>
                    <label class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Mini-Game</label>
                </div>
                @if(scene().miniGame) {
                    <button (click)="removeGame()" class="text-red-400 text-[10px] hover:text-red-300 font-bold border border-red-900/50 bg-red-900/20 px-2 py-1 rounded">Remover Jogo</button>
                }
            </div>

            @if (!scene().miniGame) {
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button (click)="addGame('quiz')" class="bg-slate-800 hover:bg-slate-700 p-3 rounded flex flex-col items-center gap-2 border border-slate-600 hover:border-cyan-500 transition-all group">
                        <span class="text-xl group-hover:scale-110 transition-transform">❓</span>
                        <span class="text-[10px] font-bold">Quiz</span>
                    </button>
                    <button (click)="addGame('quick-click')" class="bg-slate-800 hover:bg-slate-700 p-3 rounded flex flex-col items-center gap-2 border border-slate-600 hover:border-cyan-500 transition-all group">
                        <span class="text-xl group-hover:scale-110 transition-transform">⚡</span>
                        <span class="text-[10px] font-bold">Reflexo</span>
                    </button>
                    <button (click)="addGame('mash')" class="bg-slate-800 hover:bg-slate-700 p-3 rounded flex flex-col items-center gap-2 border border-slate-600 hover:border-cyan-500 transition-all group">
                        <span class="text-xl group-hover:scale-110 transition-transform">🔨</span>
                        <span class="text-[10px] font-bold">Mash</span>
                    </button>
                    <button (click)="addGame('sequence')" class="bg-slate-800 hover:bg-slate-700 p-3 rounded flex flex-col items-center gap-2 border border-slate-600 hover:border-cyan-500 transition-all group">
                        <span class="text-xl group-hover:scale-110 transition-transform">🔢</span>
                        <span class="text-[10px] font-bold">Senha</span>
                    </button>
                    <button (click)="addGame('password')" class="bg-slate-800 hover:bg-slate-700 p-3 rounded flex flex-col items-center gap-2 border border-slate-600 hover:border-cyan-500 transition-all group">
                        <span class="text-xl group-hover:scale-110 transition-transform">⌨️</span>
                        <span class="text-[10px] font-bold">Texto</span>
                    </button>
                    <button (click)="addGame('find')" class="bg-slate-800 hover:bg-slate-700 p-3 rounded flex flex-col items-center gap-2 border border-slate-600 hover:border-cyan-500 transition-all group">
                        <span class="text-xl group-hover:scale-110 transition-transform">🔍</span>
                        <span class="text-[10px] font-bold">Achar</span>
                    </button>
                    <button (click)="addGame('timing')" class="bg-slate-800 hover:bg-slate-700 p-3 rounded flex flex-col items-center gap-2 border border-slate-600 hover:border-cyan-500 transition-all group">
                        <span class="text-xl group-hover:scale-110 transition-transform">🎯</span>
                        <span class="text-[10px] font-bold">Timing</span>
                    </button>
                    <button (click)="addGame('memory')" class="bg-slate-800 hover:bg-slate-700 p-3 rounded flex flex-col items-center gap-2 border border-slate-600 hover:border-cyan-500 transition-all group">
                        <span class="text-xl group-hover:scale-110 transition-transform">🃏</span>
                        <span class="text-[10px] font-bold">Memória</span>
                    </button>
                    <button (click)="addGame('math')" class="bg-slate-800 hover:bg-slate-700 p-3 rounded flex flex-col items-center gap-2 border border-slate-600 hover:border-cyan-500 transition-all group">
                        <span class="text-xl group-hover:scale-110 transition-transform">🧮</span>
                        <span class="text-[10px] font-bold">Math</span>
                    </button>
                    <button (click)="addGame('balance')" class="bg-slate-800 hover:bg-slate-700 p-3 rounded flex flex-col items-center gap-2 border border-slate-600 hover:border-cyan-500 transition-all group">
                        <span class="text-xl group-hover:scale-110 transition-transform">⚖️</span>
                        <span class="text-[10px] font-bold">Equilíbrio</span>
                    </button>
                    <button (click)="addGame('lockpick')" class="bg-slate-800 hover:bg-slate-700 p-3 rounded flex flex-col items-center gap-2 border border-slate-600 hover:border-cyan-500 transition-all group">
                        <span class="text-xl group-hover:scale-110 transition-transform">🔓</span>
                        <span class="text-[10px] font-bold">Lockpick</span>
                    </button>
                    <button (click)="addGame('rhythm')" class="bg-slate-800 hover:bg-slate-700 p-3 rounded flex flex-col items-center gap-2 border border-slate-600 hover:border-cyan-500 transition-all group">
                        <span class="text-xl group-hover:scale-110 transition-transform">🥁</span>
                        <span class="text-[10px] font-bold">Ritmo</span>
                    </button>
                </div>
            } @else {
                <div class="bg-slate-900 p-3 rounded border border-slate-700 space-y-4 animate-in fade-in">
                    <div class="flex items-center gap-2 pb-2 border-b border-slate-700">
                         <span class="text-cyan-400 font-bold uppercase text-xs">{{ scene().miniGame?.type }}</span>
                         <span class="text-[10px] text-slate-500 ml-auto">Modo Edição</span>
                    </div>
                    
                    @switch(scene().miniGame?.type) {
                        @case ('quiz') {
                             <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pergunta</label>
                                <input [ngModel]="getQuestion()" (ngModelChange)="updateQuestion($event)" 
                                    placeholder="Digite a pergunta..." class="w-full bg-slate-800 border border-slate-600 rounded text-sm text-white p-2.5 outline-none focus:border-cyan-500 transition-colors">
                             </div>
                             
                             <div class="space-y-2">
                                 <label class="text-[10px] font-bold text-slate-400 uppercase block">Opções (Marque a correta)</label>
                                 @for(opt of (scene().miniGame?.options || []); track $index) {
                                     <div class="flex gap-2 items-center">
                                         <input [ngModel]="getOption($index)" (ngModelChange)="updateOption($index, $event)"
                                                class="flex-1 bg-slate-800 border border-slate-600 rounded text-sm text-white p-2 outline-none focus:border-cyan-500 transition-colors" placeholder="Opção {{$index + 1}}">
                                         <input type="radio" name="corr" [checked]="$index === scene().miniGame?.correctOptionIndex"
                                                (change)="updateGame({correctOptionIndex: $index})" class="accent-green-500 w-5 h-5 cursor-pointer" title="Resposta Correta">
                                     </div>
                                 }
                             </div>
                        }
                        
                        @case ('quick-click') {
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tamanho do Alvo (%)</label>
                                <input type="range" min="5" max="30" [ngModel]="scene().miniGame?.targetSize" (ngModelChange)="updateGame({targetSize: $event})" class="w-full">
                                <div class="text-xs text-right text-slate-400">{{ scene().miniGame?.targetSize }}%</div>
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tempo Limite (seg)</label>
                                <input type="number" [ngModel]="scene().miniGame?.timeLimit" (ngModelChange)="updateGame({timeLimit: $event})" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white">
                            </div>
                        }

                        @case ('mash') {
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cliques Necessários</label>
                                <input type="number" [ngModel]="scene().miniGame?.mashTarget" (ngModelChange)="updateGame({mashTarget: $event})" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white">
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tempo Limite (seg)</label>
                                <input type="number" [ngModel]="scene().miniGame?.timeLimit" (ngModelChange)="updateGame({timeLimit: $event})" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white">
                            </div>
                        }

                        @case ('sequence') {
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tamanho da Sequência</label>
                                <input type="number" min="3" max="10" [ngModel]="scene().miniGame?.sequenceLength" (ngModelChange)="updateGame({sequenceLength: $event})" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white">
                            </div>
                        }

                        @case ('password') {
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Senha Correta</label>
                                <input type="text" [ngModel]="scene().miniGame?.password" (ngModelChange)="updateGame({password: $event})" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white">
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Dica</label>
                                <input type="text" [ngModel]="scene().miniGame?.passwordHint" (ngModelChange)="updateGame({passwordHint: $event})" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white">
                            </div>
                        }

                        @case ('find') {
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Posição X (%)</label>
                                <input type="range" min="0" max="100" [ngModel]="scene().miniGame?.targetX" (ngModelChange)="updateGame({targetX: $event})" class="w-full">
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Posição Y (%)</label>
                                <input type="range" min="0" max="100" [ngModel]="scene().miniGame?.targetY" (ngModelChange)="updateGame({targetY: $event})" class="w-full">
                            </div>
                            <div class="text-[10px] text-slate-500">Use a pré-visualização para ajustar.</div>
                        }

                        @case ('timing') {
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Velocidade (1-10)</label>
                                <input type="range" min="1" max="10" [ngModel]="scene().miniGame?.timingSpeed" (ngModelChange)="updateGame({timingSpeed: $event})" class="w-full">
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tamanho da Zona (%)</label>
                                <input type="range" min="5" max="50" [ngModel]="scene().miniGame?.timingZoneSize" (ngModelChange)="updateGame({timingZoneSize: $event})" class="w-full">
                            </div>
                        }

                        @case ('memory') {
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Número de Cartas</label>
                                <select [ngModel]="scene().miniGame?.gridSize" (ngModelChange)="updateGame({gridSize: +$event})" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-xs">
                                    <option [value]="4">4 (2 Pares) - Fácil</option>
                                    <option [value]="6">6 (3 Pares) - Médio</option>
                                    <option [value]="8">8 (4 Pares) - Difícil</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tempo Limite (seg)</label>
                                <input type="number" [ngModel]="scene().miniGame?.timeLimit" (ngModelChange)="updateGame({timeLimit: $event})" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white">
                            </div>
                        }

                        @case ('math') {
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Dificuldade</label>
                                <select [ngModel]="scene().miniGame?.mathDifficulty" (ngModelChange)="updateGame({mathDifficulty: $event})" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-xs">
                                    <option value="easy">Fácil (Soma/Sub)</option>
                                    <option value="hard">Difícil (Mult/Div)</option>
                                </select>
                            </div>
                        }

                        @case ('balance') {
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Estabilidade (1-10)</label>
                                <input type="range" min="1" max="10" [ngModel]="scene().miniGame?.balanceStability" (ngModelChange)="updateGame({balanceStability: $event})" class="w-full">
                                <div class="text-[10px] text-slate-500">Maior = Mais difícil de cair</div>
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tempo p/ Vencer (seg)</label>
                                <input type="number" [ngModel]="scene().miniGame?.timeLimit" (ngModelChange)="updateGame({timeLimit: $event})" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white">
                            </div>
                        }

                        @case ('lockpick') {
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Número de Pinos</label>
                                <input type="number" min="3" max="5" [ngModel]="scene().miniGame?.lockpickPins" (ngModelChange)="updateGame({lockpickPins: $event})" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white">
                            </div>
                        }

                        @case ('rhythm') {
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Velocidade</label>
                                <input type="range" min="1" max="10" [ngModel]="scene().miniGame?.rhythmSpeed" (ngModelChange)="updateGame({rhythmSpeed: $event})" class="w-full">
                            </div>
                        }
                    }

                    <div class="h-px bg-slate-800 w-full my-2"></div>
                    
                    <app-affection-selector 
                        [reward]="scene().miniGame?.affectionReward"
                        (rewardChange)="updateGame({affectionReward: $event})">
                    </app-affection-selector>
                </div>
            }
        </div>
    </div>
  `
})
export class TabGameComponent {
  vnService = inject(VnService);
  scene = input.required<Scene>();

  updateAchiev(id: string | null) { this.vnService.updateScene(this.scene().id, { awardAchievementId: id }); }
  
  addGame(type: MiniGameType) { this.vnService.addMiniGameToScene(this.scene().id, type); }
  removeGame() { this.vnService.removeMiniGame(this.scene().id); }
  
  updateGame(u: any) { 
      if(this.scene().miniGame) this.vnService.updateScene(this.scene().id, { miniGame: { ...this.scene().miniGame!, ...u } }); 
  }

  getQuestion() { return this.vnService.getLocalizedText(this.scene(), 'miniGameQuestion') || this.scene().miniGame?.question || ''; }
  updateQuestion(q: string) { this.updateGame({question: q}); }
  getOption(i: number) { return this.scene().miniGame?.options?.[i] || ''; }
  updateOption(i: number, v: string) { 
      const opts = [...(this.scene().miniGame?.options || [])]; opts[i] = v; this.updateGame({options: opts}); 
  }
}
