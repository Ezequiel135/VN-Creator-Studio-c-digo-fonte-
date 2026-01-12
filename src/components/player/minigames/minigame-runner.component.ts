
import { Component, input, output, signal, effect, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MiniGame } from '../../../types';

@Component({
  selector: 'app-minigame-runner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="absolute inset-0 z-30 flex items-center justify-center p-4 select-none pointer-events-auto" (click)="$event.stopPropagation()">
        
        <!-- Game Container -->
        <div class="bg-slate-900/95 backdrop-blur-xl border-2 border-slate-600 rounded-2xl p-6 shadow-2xl max-w-lg w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            <!-- Timer Bar -->
            @if (timeLeft() !== null) {
                <div class="absolute top-0 left-0 right-0 h-2 bg-slate-800">
                    <div class="h-full bg-cyan-500 transition-all duration-100 ease-linear" [style.width.%]="(timeLeft()! / maxTime()!) * 100"></div>
                </div>
            }

            <!-- Header -->
            <div class="text-center mb-6 mt-2">
                <h3 class="text-xl font-black text-white uppercase tracking-widest">{{ gameTypeLabel() }}</h3>
                <p class="text-sm text-slate-400">{{ instruction() }}</p>
            </div>

            <!-- GAME CONTENT -->
            <div class="min-h-[200px] flex flex-col items-center justify-center relative">
                
                <!-- 1. QUIZ -->
                @if (config().type === 'quiz') {
                    <div class="w-full space-y-4">
                        <div class="text-lg font-bold text-white text-center mb-4">{{ config().question }}</div>
                        <div class="grid gap-2">
                            @for (opt of config().options; track $index) {
                                <button (click)="handleQuiz($index)" class="w-full py-3 px-4 bg-slate-800 hover:bg-cyan-700 text-white rounded border border-slate-600 transition-colors font-bold text-left">
                                    {{ opt }}
                                </button>
                            }
                        </div>
                    </div>
                }

                <!-- 2. QUICK CLICK -->
                @if (config().type === 'quick-click') {
                    <div class="relative w-full h-64 bg-slate-800 rounded border border-slate-700 overflow-hidden cursor-crosshair">
                        <button (click)="handleWin()" 
                                class="absolute rounded-full bg-red-500 border-2 border-white shadow-[0_0_15px_red] active:scale-90 transition-transform"
                                [style.left.%]="qcX" [style.top.%]="qcY"
                                [style.width.%]="config().targetSize || 15" [style.height.%]="config().targetSize || 15">
                            !
                        </button>
                    </div>
                }

                <!-- 3. MASH -->
                @if (config().type === 'mash') {
                    <div class="w-full flex flex-col items-center gap-4">
                        <div class="w-full h-6 bg-slate-800 rounded-full border border-slate-600 overflow-hidden">
                            <div class="h-full bg-yellow-500 transition-all duration-100" [style.width.%]="(mashCount() / (config().mashTarget || 20)) * 100"></div>
                        </div>
                        <button (mousedown)="handleMash($event)" (touchstart)="handleMash($event)" class="w-32 h-32 rounded-full bg-red-600 border-b-8 border-red-800 text-white font-black text-2xl active:border-b-0 active:translate-y-2 shadow-lg transition-all select-none">
                            SMASH!
                        </button>
                    </div>
                }

                <!-- 4. SEQUENCE -->
                @if (config().type === 'sequence') {
                    <div class="flex flex-col items-center gap-6">
                        <div class="flex gap-2 mb-4">
                            @for(i of [0,1,2,3]; track i) {
                                <div class="w-16 h-16 rounded border-4 transition-all duration-100 cursor-pointer"
                                     [class.bg-red-500]="i===0" [class.border-red-700]="i===0"
                                     [class.bg-blue-500]="i===1" [class.border-blue-700]="i===1"
                                     [class.bg-green-500]="i===2" [class.border-green-700]="i===2"
                                     [class.bg-yellow-500]="i===3" [class.border-yellow-700]="i===3"
                                     [class.brightness-150]="litIndex() === i"
                                     [class.scale-110]="litIndex() === i"
                                     (click)="handleSeqClick(i)"></div>
                            }
                        </div>
                        <div class="text-xs text-slate-400 font-mono">{{ seqStatus() }}</div>
                    </div>
                }

                <!-- 5. PASSWORD -->
                @if (config().type === 'password') {
                    <div class="w-full space-y-4">
                        <div class="p-3 bg-slate-800 rounded border border-slate-700 text-center text-yellow-400 text-sm font-mono">
                            DICA: {{ config().passwordHint || '???' }}
                        </div>
                        <input type="text" [(ngModel)]="passInput" (keyup.enter)="checkPass()" class="w-full bg-black border border-green-500/50 rounded p-4 text-green-400 font-mono text-center text-xl uppercase outline-none focus:shadow-[0_0_10px_rgba(0,255,0,0.3)]" placeholder="PASSWORD">
                        <button (click)="checkPass()" class="w-full py-3 bg-green-900/50 hover:bg-green-800 text-green-400 border border-green-700 rounded font-mono font-bold">ENTER</button>
                    </div>
                }

                <!-- 6. FIND ITEM -->
                @if (config().type === 'find') {
                    <div class="relative w-full aspect-video bg-slate-800 rounded border border-slate-700 overflow-hidden cursor-crosshair">
                        <!-- Simulated BG - Ideally this would overlay scene but for isolation we keep it contained or transparent -->
                        <div class="absolute inset-0 opacity-20 bg-[url('https://transparent-textures.patterns.velomo.de/subtle_dots.png')]"></div>
                        <div class="text-center mt-10 text-slate-600 font-bold opacity-50">CLIQUE NA ÁREA CORRETA</div>
                        
                        <!-- Invisible Target -->
                        <div (click)="handleWin()" 
                             class="absolute bg-red-500/0 hover:bg-red-500/10 cursor-pointer rounded-full"
                             [style.left.%]="(config().targetX || 50) - ((config().targetSize || 10)/2)" 
                             [style.top.%]="(config().targetY || 50) - ((config().targetSize || 10)/2)"
                             [style.width.%]="config().targetSize || 10" 
                             [style.height.%]="config().targetSize || 10">
                        </div>
                    </div>
                }

                <!-- 7. TIMING -->
                @if (config().type === 'timing') {
                    <div class="w-full flex flex-col items-center gap-6">
                        <div class="w-full h-12 bg-slate-800 rounded-full border-4 border-slate-700 relative overflow-hidden">
                            <!-- Zone -->
                            <div class="absolute top-0 bottom-0 bg-green-500/30 border-l-2 border-r-2 border-green-500"
                                 [style.left.%]="50 - ((config().timingZoneSize || 20)/2)"
                                 [style.width.%]="config().timingZoneSize || 20"></div>
                            <!-- Bar -->
                            <div class="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_white]"
                                 [style.left.%]="timingPos()"></div>
                        </div>
                        <button (mousedown)="checkTiming($event)" (touchstart)="checkTiming($event)" class="px-8 py-4 bg-slate-700 hover:bg-white hover:text-black text-white font-black uppercase tracking-widest rounded-full transition-colors border-2 border-white select-none">STOP!</button>
                    </div>
                }

                <!-- 8. MEMORY -->
                @if (config().type === 'memory') {
                    <div class="grid gap-2" [style.grid-template-columns]="'repeat(' + (config().gridSize === 8 ? 4 : (config().gridSize === 6 ? 3 : 2)) + ', 1fr)'">
                        @for (card of memoryCards(); track $index) {
                            <div (click)="flipCard($index)" 
                                 class="w-16 h-20 md:w-20 md:h-24 rounded cursor-pointer transition-all duration-300 transform perspective-1000"
                                 [class.rotate-y-180]="card.flipped || card.solved">
                                 <div class="w-full h-full flex items-center justify-center text-2xl font-bold rounded border-2 select-none"
                                      [class.bg-slate-700]="!card.flipped && !card.solved"
                                      [class.border-slate-600]="!card.flipped && !card.solved"
                                      [class.bg-cyan-900]="card.flipped || card.solved"
                                      [class.border-cyan-500]="card.flipped || card.solved"
                                      [class.text-white]="card.flipped || card.solved"
                                      [class.text-transparent]="!card.flipped && !card.solved">
                                     {{ card.val }}
                                 </div>
                            </div>
                        }
                    </div>
                }

                <!-- 9. MATH -->
                @if (config().type === 'math') {
                    <div class="flex flex-col items-center gap-6">
                        <div class="text-4xl font-black text-white bg-slate-800 px-8 py-4 rounded border border-slate-600 shadow-inner">
                            {{ mathEq() }}
                        </div>
                        <div class="grid grid-cols-2 gap-4 w-full">
                            @for (opt of mathOptions(); track opt) {
                                <button (click)="checkMath(opt)" class="py-4 bg-slate-700 hover:bg-cyan-600 text-white font-bold text-xl rounded border border-slate-600">{{ opt }}</button>
                            }
                        </div>
                    </div>
                }

                <!-- 10. BALANCE -->
                @if (config().type === 'balance') {
                    <div class="w-full flex flex-col items-center gap-4">
                        <div class="w-64 h-2 bg-slate-700 rounded relative">
                            <div class="absolute -top-1 w-2 h-4 bg-white/50 left-1/2 -translate-x-1/2"></div> <!-- Center Marker -->
                            <div class="absolute -top-3 w-6 h-6 bg-yellow-500 rounded-full shadow-[0_0_10px_yellow] transition-all duration-75"
                                 [style.left.%]="balancePos()"></div>
                        </div>
                        <div class="flex gap-12 mt-4">
                            <button (mousedown)="pushBalance(-1, $event)" (touchstart)="pushBalance(-1, $event)" class="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600 text-2xl select-none">⬅️</button>
                            <button (mousedown)="pushBalance(1, $event)" (touchstart)="pushBalance(1, $event)" class="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600 text-2xl select-none">➡️</button>
                        </div>
                    </div>
                }

                <!-- 11. LOCKPICK (NEW) -->
                @if (config().type === 'lockpick') {
                    <div class="flex flex-col items-center gap-4 w-full">
                        <div class="flex gap-2 mb-4">
                            @for(pin of lockpickPins; track $index) {
                                <div class="w-8 h-12 border-2 rounded transition-colors bg-slate-800"
                                     [class.border-green-500]="$index < currentPin"
                                     [class.bg-green-900_30]="$index < currentPin"
                                     [class.border-white]="$index === currentPin"
                                     [class.border-slate-600]="$index > currentPin">
                                     
                                     <!-- Tumbler -->
                                     @if($index === currentPin) {
                                         <div class="w-full bg-yellow-500 absolute transition-all duration-75"
                                              style="height: 4px;"
                                              [style.marginTop.px]="lockpickVal * 0.4"></div>
                                     }
                                </div>
                            }
                        </div>
                        
                        <div class="w-64 h-32 bg-slate-800 rounded-t-full border-4 border-slate-600 relative overflow-hidden flex justify-center">
                             <!-- Bar moving up/down -->
                             <div class="absolute bottom-0 w-2 bg-red-500 h-full origin-bottom transition-transform"
                                  [style.height.%]="lockpickVal"></div>
                             
                             <!-- Target Zone -->
                             <div class="absolute bottom-0 w-full h-2 bg-green-500/50" [style.bottom.%]="lockpickTarget"></div>
                        </div>

                        <button (mousedown)="attemptPin($event)" (touchstart)="attemptPin($event)" class="w-full py-4 bg-slate-700 hover:bg-white hover:text-black text-white font-bold rounded-lg uppercase tracking-widest select-none">
                            CLICK NOW!
                        </button>
                    </div>
                }

                <!-- 12. RHYTHM (NEW) -->
                @if (config().type === 'rhythm') {
                    <div class="flex flex-col items-center gap-6 w-full">
                        <div class="flex gap-4">
                            @for(k of rhythmKeys; track k) {
                                <div class="w-16 h-16 border-4 rounded-lg flex items-center justify-center text-2xl font-bold bg-slate-800 transition-colors cursor-pointer select-none"
                                     (click)="hitRhythm(k)"
                                     [class.border-white]="k === activeRhythmKey"
                                     [class.bg-cyan-600]="k === activeRhythmKey"
                                     [class.scale-110]="k === activeRhythmKey">
                                    {{ k }}
                                </div>
                            }
                        </div>
                        <div class="text-xs text-slate-400">Score: {{ rhythmScore }}/{{ rhythmTarget }}</div>
                    </div>
                }

            </div>
        </div>
    </div>
  `
})
export class MiniGameRunnerComponent implements OnDestroy {
  config = input.required<MiniGame>();
  win = output<void>();
  lose = output<void>();

  // State
  timeLeft = signal<number|null>(null);
  maxTime = signal<number|null>(null);
  intervalId: any;
  gameLoopId: any;

  // -- Game Specific States --
  
  // Quick Click
  qcX = 50; qcY = 50;

  // Mash
  mashCount = signal(0);

  // Sequence
  sequence: number[] = [];
  playerSeq: number[] = [];
  litIndex = signal<number|null>(null);
  isShowingSeq = false;
  seqStatus = signal('Observe...');

  // Password
  passInput = '';

  // Timing
  timingVal = 0;
  timingDir = 1;

  // Memory
  memoryCards = signal<{id:number, val:string, flipped:boolean, solved:boolean}[]>([]);
  flippedIndices: number[] = [];

  // Math
  mathEq = signal('');
  mathAns = 0;
  mathOptions = signal<number[]>([]);

  // Balance
  balancePos = signal(50);
  balanceVel = 0;

  // Lockpick
  currentPin = 0;
  lockpickPins: number[] = [];
  lockpickVal = 0;
  lockpickDir = 1;
  lockpickTarget = 0;

  // Rhythm
  rhythmKeys = ['A', 'B', 'C'];
  activeRhythmKey = '';
  rhythmScore = 0;
  rhythmTarget = 10;
  rhythmTimer: any;

  constructor() {
      effect(() => {
          const cfg = this.config();
          this.initGame(cfg);
      });
  }

  initGame(cfg: MiniGame) {
      clearInterval(this.intervalId);
      clearInterval(this.rhythmTimer);
      cancelAnimationFrame(this.gameLoopId);
      
      // Timer setup
      if (cfg.timeLimit) {
          this.maxTime.set(cfg.timeLimit);
          this.timeLeft.set(cfg.timeLimit);
          this.intervalId = setInterval(() => {
              this.timeLeft.update(t => {
                  if (t === null) return null;
                  if (t <= 0.1) {
                      // CRITICAL FIX: Handle Survival Games vs Timeout Games
                      if (cfg.type === 'balance') {
                          this.handleWin(); // Survival Success!
                      } else {
                          this.handleLose(); // Time's Up!
                      }
                      return 0;
                  }
                  return t - 0.1;
              });
          }, 100);
      } else {
          this.timeLeft.set(null);
      }

      // Specific Init
      switch(cfg.type) {
          case 'quick-click': 
              this.qcX = Math.random() * 80 + 10; 
              this.qcY = Math.random() * 80 + 10; 
              break;
          case 'sequence': 
              this.initSequence(cfg.sequenceLength || 4); 
              break;
          case 'timing': 
              this.startTimingLoop(cfg.timingSpeed || 5); 
              break;
          case 'memory': 
              this.initMemory(cfg.gridSize || 4); 
              break;
          case 'math': 
              this.initMath(cfg.mathDifficulty || 'easy'); 
              break;
          case 'balance': 
              this.startBalanceLoop(cfg.balanceStability || 5); 
              break;
          case 'lockpick':
              this.initLockpick(cfg.lockpickPins || 3);
              break;
          case 'rhythm':
              this.initRhythm(cfg.rhythmSpeed || 5);
              break;
      }
  }

  // --- Handlers ---

  handleWin() { this.cleanup(); this.win.emit(); }
  handleLose() { this.cleanup(); this.lose.emit(); }
  
  cleanup() {
      clearInterval(this.intervalId);
      clearInterval(this.rhythmTimer);
      cancelAnimationFrame(this.gameLoopId);
  }

  ngOnDestroy() { this.cleanup(); }

  gameTypeLabel() {
      const map: any = { 
          'quiz':'Quiz', 'quick-click':'Reflexo', 'mash':'Esmagar', 'sequence':'Senha Visual', 
          'password':'Senha', 'find':'Encontre', 'timing':'Precisão', 'memory':'Memória', 
          'math':'Matemática', 'balance':'Equilíbrio', 'lockpick':'Arrombar', 'rhythm':'Ritmo' 
      };
      return map[this.config().type] || 'Mini-Game';
  }

  instruction() {
      const map: any = {
          'quiz':'Escolha a resposta correta.',
          'quick-click':'Clique no alvo antes que o tempo acabe!',
          'mash':'Clique no botão repetidamente!',
          'sequence':'Repita a sequência de cores.',
          'password':'Descubra a senha.',
          'find':'Encontre o item escondido na tela.',
          'timing':'Pare a barra na zona verde.',
          'memory':'Encontre os pares.',
          'math':'Resolva a equação.',
          'balance':'Mantenha a bola no centro até o tempo acabar.',
          'lockpick':'Pare a barra na zona verde para cada pino.',
          'rhythm':'Toque nos botões quando acenderem.'
      };
      return map[this.config().type] || '';
  }

  // 1. Quiz
  handleQuiz(idx: number) {
      if (idx === this.config().correctOptionIndex) this.handleWin();
      else this.handleLose();
  }

  // 3. Mash
  handleMash(e?: Event) {
      if(e) e.preventDefault();
      e?.stopPropagation();
      this.mashCount.update(c => c + 1);
      if (this.mashCount() >= (this.config().mashTarget || 20)) this.handleWin();
  }

  // 4. Sequence
  initSequence(len: number) {
      this.sequence = Array.from({length: len}, () => Math.floor(Math.random() * 4));
      this.playerSeq = [];
      this.isShowingSeq = true;
      this.seqStatus.set('Memorize...');
      
      let i = 0;
      const show = setInterval(() => {
          this.litIndex.set(this.sequence[i]);
          setTimeout(() => this.litIndex.set(null), 500);
          i++;
          if(i >= len) {
              clearInterval(show);
              setTimeout(() => {
                  this.isShowingSeq = false;
                  this.seqStatus.set('Sua vez!');
              }, 800);
          }
      }, 1000);
  }

  handleSeqClick(i: number) {
      if (this.isShowingSeq) return;
      
      this.litIndex.set(i);
      setTimeout(() => this.litIndex.set(null), 200);

      const expected = this.sequence[this.playerSeq.length];
      if (i !== expected) {
          this.seqStatus.set('Errado!');
          setTimeout(() => this.handleLose(), 500);
          return;
      }
      
      this.playerSeq.push(i);
      if (this.playerSeq.length === this.sequence.length) {
          this.seqStatus.set('Correto!');
          setTimeout(() => this.handleWin(), 500);
      }
  }

  // 5. Password
  checkPass() {
      if (this.passInput.toUpperCase() === (this.config().password || 'SENHA').toUpperCase()) {
          this.handleWin();
      } else {
          this.passInput = '';
          // Shake effect logic typically handled by class binding triggers, kept simple here
      }
  }

  // 7. Timing
  startTimingLoop(speed: number) {
      const tick = () => {
          this.timingVal += this.timingDir * (speed * 0.5);
          if (this.timingVal > 100) { this.timingVal = 100; this.timingDir = -1; }
          if (this.timingVal < 0) { this.timingVal = 0; this.timingDir = 1; }
          this.gameLoopId = requestAnimationFrame(tick);
      };
      tick();
  }
  timingPos() { return this.timingVal; }
  checkTiming(e?: Event) {
      if(e) e.preventDefault();
      e?.stopPropagation();
      cancelAnimationFrame(this.gameLoopId);
      const zoneSize = this.config().timingZoneSize || 20;
      const center = 50;
      const half = zoneSize / 2;
      if (this.timingVal >= center - half && this.timingVal <= center + half) this.handleWin();
      else this.handleLose();
  }

  // 8. Memory
  initMemory(size: number) {
      const icons = ['🍎','🍌','🍇','🍒','🥝','🥥','🍋','🍉'];
      const pairs = icons.slice(0, size/2);
      const deck = [...pairs, ...pairs]
          .sort(() => Math.random() - 0.5)
          .map((val, i) => ({ id: i, val, flipped: false, solved: false }));
      this.memoryCards.set(deck);
  }
  flipCard(idx: number) {
      const cards = this.memoryCards();
      if (cards[idx].flipped || cards[idx].solved || this.flippedIndices.length >= 2) return;

      const newCards = [...cards];
      newCards[idx].flipped = true;
      this.memoryCards.set(newCards);
      this.flippedIndices.push(idx);

      if (this.flippedIndices.length === 2) {
          const [a, b] = this.flippedIndices;
          if (newCards[a].val === newCards[b].val) {
              newCards[a].solved = true;
              newCards[b].solved = true;
              this.memoryCards.set(newCards);
              this.flippedIndices = [];
              if (newCards.every(c => c.solved)) setTimeout(() => this.handleWin(), 500);
          } else {
              setTimeout(() => {
                  const reset = [...this.memoryCards()];
                  reset[a].flipped = false;
                  reset[b].flipped = false;
                  this.memoryCards.set(reset);
                  this.flippedIndices = [];
              }, 1000);
          }
      }
  }

  // 9. Math
  initMath(diff: string) {
      let a, b, op, ans;
      if (diff === 'easy') {
          a = Math.floor(Math.random() * 20) + 1;
          b = Math.floor(Math.random() * 20) + 1;
          if (Math.random() > 0.5) { op = '+'; ans = a + b; } 
          else { op = '-'; if(a<b)[a,b]=[b,a]; ans = a - b; }
      } else {
          a = Math.floor(Math.random() * 10) + 2;
          b = Math.floor(Math.random() * 10) + 2;
          if (Math.random() > 0.5) { op = 'x'; ans = a * b; } 
          else { ans = a; a = a * b; op = '/'; } // Clean division
      }
      this.mathEq.set(`${a} ${op} ${b} = ?`);
      this.mathAns = ans;
      
      const opts = new Set<number>([ans]);
      while(opts.size < 4) {
          const offset = Math.floor(Math.random() * 10) - 5;
          if (offset !== 0) opts.add(ans + offset);
      }
      this.mathOptions.set(Array.from(opts).sort(() => Math.random() - 0.5));
  }
  checkMath(val: number) {
      if (val === this.mathAns) this.handleWin();
      else this.handleLose();
  }

  // 10. Balance
  startBalanceLoop(stability: number) {
      // Lower stability number = harder (faster jitter) in config, but logic uses it inversely
      const difficulty = (11 - stability) * 0.05; 
      
      const tick = () => {
          // Add random jitter
          this.balanceVel += (Math.random() - 0.5) * difficulty;
          // Apply velocity
          this.balancePos.update(p => p + this.balanceVel);
          
          const p = this.balancePos();
          if (p < 0 || p > 100) {
              this.handleLose();
              return;
          }
          
          // WIN CONDITION IS TIME RUNNING OUT (Handled in main timer loop)

          this.gameLoopId = requestAnimationFrame(tick);
      };
      tick();
  }
  pushBalance(dir: number, e?: Event) {
      if(e) e.preventDefault();
      e?.stopPropagation();
      this.balanceVel += dir * 1.5;
  }

  // 11. Lockpick Logic
  initLockpick(pins: number) {
      this.currentPin = 0;
      this.lockpickPins = Array(pins).fill(0);
      this.resetPinTarget();
      this.startLockpickLoop();
  }
  resetPinTarget() {
      this.lockpickTarget = Math.random() * 60 + 20; // 20-80%
      this.lockpickVal = 0;
      this.lockpickDir = 1;
  }
  startLockpickLoop() {
      const speed = 2;
      const tick = () => {
          this.lockpickVal += this.lockpickDir * speed;
          if (this.lockpickVal > 100) { this.lockpickVal = 100; this.lockpickDir = -1; }
          if (this.lockpickVal < 0) { this.lockpickVal = 0; this.lockpickDir = 1; }
          this.gameLoopId = requestAnimationFrame(tick);
      };
      tick();
  }
  attemptPin(e?: Event) {
      if(e) e.preventDefault();
      e?.stopPropagation();
      
      // Check hit (tolerance +/- 10)
      if (Math.abs(this.lockpickVal - this.lockpickTarget) < 10) {
          this.currentPin++;
          if (this.currentPin >= this.lockpickPins.length) {
              this.handleWin();
          } else {
              this.resetPinTarget();
          }
      } else {
          this.handleLose();
      }
  }

  // 12. Rhythm Logic
  initRhythm(speed: number) {
      this.rhythmScore = 0;
      // Interval depends on speed (higher speed = lower ms)
      const interval = 2000 - (speed * 150); 
      this.rhythmTarget = 5 + Math.floor(speed);
      
      this.rhythmTimer = setInterval(() => {
          const randKey = this.rhythmKeys[Math.floor(Math.random() * this.rhythmKeys.length)];
          this.activeRhythmKey = randKey;
          
          setTimeout(() => {
              // If key wasn't hit in time (cleared), punish
              if (this.activeRhythmKey === randKey) {
                  this.handleLose();
              }
          }, interval * 0.9); // Generous window (90% of interval)
          
      }, interval);
  }
  hitRhythm(key: string) {
      if (key === this.activeRhythmKey) {
          this.rhythmScore++;
          this.activeRhythmKey = ''; // Clear so user can't spam
          if (this.rhythmScore >= this.rhythmTarget) {
              this.handleWin();
          }
      } else {
          this.handleLose();
      }
  }
}
