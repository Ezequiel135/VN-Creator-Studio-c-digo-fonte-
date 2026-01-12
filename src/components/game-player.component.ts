
import { Component, computed, inject, output, signal, effect, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, OnDestroy, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../services/vn.service';
import { DeviceLayoutService } from '../services/device-layout.service';
import { GameFlowService } from '../services/game-flow.service'; 
import { Scene, SceneEffect, DialogueBoxConfig, Choice } from '../types';
import { AchievementToastComponent } from './achievement-toast.component';
import { EndingRollerComponent } from './player/ending-roller.component';
import { LoadingScreenComponent } from './player/screens/loading-screen.component';
import { TitleScreenComponent } from './player/screens/title-screen.component';
import { GameMenuComponent } from './player/menu/game-menu.component';
import { TermsScreenComponent } from './player/screens/terms-screen.component';
import { MiniGameRunnerComponent } from './player/minigames/minigame-runner.component';
import { HiddenObjectLayerComponent } from './player/layers/hidden-object-layer.component';
import { ParticleLayerComponent } from './player/layers/particle-layer.component';
import { ItemModalComponent } from './player/overlays/item-modal.component';

import { getEffectClass } from '../utils/visual-effects.utils';
import { getCharAnimClass } from '../utils/animation.utils';
import { CHOICE_STYLES } from '../config/choice-styles';

@Component({
  selector: 'app-game-player',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
      CommonModule, 
      FormsModule, 
      AchievementToastComponent, 
      EndingRollerComponent,
      LoadingScreenComponent,
      TitleScreenComponent,
      GameMenuComponent,
      TermsScreenComponent,
      MiniGameRunnerComponent,
      HiddenObjectLayerComponent,
      ParticleLayerComponent,
      ItemModalComponent
  ],
  host: {
    class: 'block w-full h-full'
  },
  template: `
    <div class="relative w-full h-full bg-black overflow-hidden select-none touch-none flex items-center justify-center">
      
      <!-- PERSISTENT AUDIO PLAYERS -->
      <audio #bgmPlayer loop></audio>
      <audio #sfxPlayer></audio>
      <audio #voicePlayer></audio>
      <audio #narratorPlayer></audio>

      <!-- Fullscreen Container -->
      <div class="relative overflow-hidden transition-all duration-300 ease-in-out w-full h-full"
           style="max-width: 100%; max-height: 100%;">
           
           <div class="absolute inset-0 bg-black overflow-hidden">
                <!-- 1. LOADING -->
                @if (playerState() === 'loading') {
                    <app-loading-screen [config]="loadingConfig()"></app-loading-screen>
                }

                <!-- 2. TITLE -->
                @if (playerState() === 'title') {
                    <app-title-screen 
                        class="absolute inset-0 w-full h-full"
                        [config]="titleConfig()"
                        [loc]="locSettings()"
                        (start)="openNameInput()"
                        (load)="openMenu('save')"
                        (achievements)="showAchievementsModal.set(true)"
                        (terms)="openTerms()"
                        (settings)="openMenu('settings')">
                    </app-title-screen>

                    @if (showNameInput()) {
                          <div class="absolute inset-0 z-[110] bg-black/80 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
                              <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 shadow-2xl w-full max-w-sm animate-fade-in-up">
                                  <h3 class="text-white font-bold mb-4 text-center">Como devemos te chamar?</h3>
                                  <input type="text" [(ngModel)]="tempPlayerName" class="w-full bg-slate-900 border border-slate-700 rounded px-4 py-3 text-white mb-4 focus:border-cyan-500 outline-none text-center font-bold" placeholder="Seu Nome">
                                  <div class="flex gap-2">
                                      <button (click)="startNewGame()" class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded">Começar</button>
                                      <button (click)="showNameInput.set(false)" class="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                                  </div>
                              </div>
                          </div>
                      }
                }

                <!-- 3. GAMEPLAY -->
                @if (playerState() === 'game' && currentScene(); as scene) {
                  
                  <div class="absolute inset-0 w-full h-full scene-layer bg-black">
                    
                    <!-- BACKGROUND LAYER (Animated Container) -->
                    <div class="absolute inset-0 w-full h-full will-change-transform"
                         [ngClass]="activeAnimationClass()"
                         [style.opacity]="sceneContentReady() ? '1' : '0'">
                         
                        @if (scene.isVideo && getAssetUrl(scene.backgroundId); as vidUrl) {
                           <video [src]="vidUrl" 
                                  #bgVideo
                                  playsinline
                                  [loop]="scene.videoLoop !== false"
                                  (ended)="onVideoEnded(scene)"
                                  (loadeddata)="onContentReady()"
                                  (error)="onContentReady()" 
                                  class="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                  [style.object-position]="(scene.bgX || 50) + '% ' + (scene.bgY || 50) + '%'">
                           </video>
                        } @else {
                          @let bgUrl = getAssetUrl(scene.backgroundId);
                          @if (bgUrl) {
                            <img [src]="bgUrl"
                                 (load)="onContentReady()"
                                 (error)="onContentReady()"
                                 class="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                                 [style.object-position]="(scene.bgX || 50) + '% ' + (scene.bgY || 50) + '%'">
                          } @else {
                            <div class="absolute inset-0 bg-slate-900"></div>
                          }
                        }

                        <!-- PARTICLE LAYER -->
                        @if (scene.particleConfig && scene.particleConfig.enabled) {
                            <app-particle-layer [config]="scene.particleConfig"></app-particle-layer>
                        }

                        <!-- HIDDEN OBJECT LAYER (Ensures interaction) -->
                        <app-hidden-object-layer [scene]="scene" (found)="showItemFound($event)"></app-hidden-object-layer>

                        <!-- CHARACTERS (Separated Logic for cleaner animation) -->
                        <div class="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                           @for (char of scene.characters; track char.id) {
                             @if (getAssetUrl(char.assetId); as url) {
                               <div class="absolute flex items-end justify-center pointer-events-none will-change-transform"
                                    [style.left.%]="char.x"
                                    [style.bottom.%]="(char.y || 50) - 50"
                                    [style.height]="charHeight()" 
                                    [style.transform]="'translateX(-50%)'"
                                    [ngClass]="getCharAnimClass(char.animation)"
                                    style="min-width: 10%;">
                                   <img [src]="url" 
                                        class="unsqueezed-img object-contain h-full w-auto max-w-none filter drop-shadow-xl"
                                        [style.transform]="'scale(' + char.scale + ')'"
                                        [style.transform-origin]="'bottom center'"
                                        [class.scale-x-[-1]]="char.isFlipped"
                                        alt="Character">
                               </div>
                             }
                           }
                        </div>
                    </div>
                    
                    <!-- VISUAL EFFECT OVERLAY -->
                    @if (scene.effect && scene.effect !== 'none') {
                        <div class="absolute inset-0 pointer-events-none z-10" [ngClass]="getEffectClass(scene.effect)"></div>
                    }

                    <!-- INTERACTION & UI -->
                    <div class="absolute inset-0 w-full h-full z-20 pointer-events-none">
                        <!-- Top Menu Button (always accessible) -->
                        <div class="absolute top-4 right-4 z-[80] flex gap-2 pointer-events-auto">
                            <button (click)="openMenu('settings'); $event.stopPropagation()" class="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur transition-colors shadow-lg border border-white/10">⚙️</button>
                        </div>

                        <!-- Clickable Area for Dialogue Advancement -->
                        <div class="absolute inset-0 pointer-events-auto" (click)="onSceneClick(scene, false)"></div>

                        @if (scene.miniGame) {
                            <app-minigame-runner 
                                [config]="scene.miniGame" 
                                (win)="handleMiniGameResult(scene, true)" 
                                (lose)="handleMiniGameResult(scene, false)">
                            </app-minigame-runner>
                        } @else {
                            <div class="absolute inset-0 flex flex-col justify-end p-4 md:p-10 z-20 pointer-events-none">
                              
                              <!-- Choices -->
                              @if (scene.choices && scene.choices.length && !flowService.isTyping()) {
                                    <div class="flex flex-col gap-2 mb-4 animate-fade-in-up items-center pointer-events-auto w-full">
                                       @for (choice of scene.choices; track choice.id) {
                                          <button (click)="handleChoice(scene, choice)"
                                                  class="w-full max-w-xl p-3 text-left transition-all transform hover:scale-105 active:scale-95 whitespace-normal break-words font-bold"
                                                  [ngClass]="getChoiceStyleClass()">
                                             {{ vnService.getLocalizedChoiceText(scene, choice.id, choice.text) }}
                                          </button>
                                       }
                                    </div>
                              }

                              <!-- Dialogue -->
                              @if (shouldShowDialogue(scene)) {
                                    <div class="relative min-h-[120px] pointer-events-auto cursor-pointer flex flex-col p-5 shadow-2xl transition-all"
                                         [class.portrait:min-h-[25vh]]="true"
                                         [ngClass]="dialogueAnimClass()"
                                         [ngStyle]="getDialogueStyles()"
                                         [class]="getDialogueClasses()"
                                         (click)="onSceneClick(scene, true); $event.stopPropagation()">
                                         
                                         @if(vnService.getLocalizedText(scene, 'speakerName'); as speaker) {
                                            @if (speaker.trim()) {
                                                <div class="absolute -top-3 left-4 text-xs font-bold px-3 py-1 rounded shadow border transform -translate-y-1"
                                                     [style.background-color]="dialogueCfg().nameColor"
                                                     [style.border-color]="dialogueCfg().borderColor"
                                                     [style.color]="isLightColor(dialogueCfg().nameColor) ? '#000' : '#fff'">
                                                {{ parseText(speaker) }}
                                                </div>
                                            }
                                         }
                                         <p class="text-base md:text-lg leading-relaxed mt-2 whitespace-pre-wrap font-medium drop-shadow-md break-words">
                                            {{ displayedText() }}
                                            @if(flowService.isTyping()) { <span class="animate-pulse">|</span> }
                                         </p>
                                    </div>
                                 }
                              </div>
                        }
                    </div>
                  </div>

                } @else if (playerState() === 'game' && !currentScene()) {
                   <!-- ENDING SCREEN -->
                   @if (!creditsFinished()) {
                       <app-ending-roller 
                           [config]="endingConfig()"
                           [title]="locSettings().endingScreen.title || 'FIM'"
                           [subtitle]="locSettings().endingScreen.subtitle || ''"
                           (finished)="onCreditsAnimationEnd()">
                       </app-ending-roller>
                   }

                   @if (creditsFinished()) {
                       <!-- Static Ending Modal: Centered with Scroll support -->
                       <div class="absolute inset-0 z-20 bg-black/80 flex items-center justify-center animate-fade-in backdrop-blur-sm p-4 overflow-y-auto">
                           <div class="flex flex-col gap-4 text-center p-6 md:p-8 bg-slate-900/90 rounded-2xl border border-white/10 shadow-2xl w-full max-w-lg my-auto relative">
                               <h2 class="text-3xl md:text-4xl font-black text-white mb-2 uppercase tracking-widest break-words leading-tight">{{ locSettings().endingScreen.title || 'Fim de Jogo' }}</h2>
                               
                               @if (canUnlockBonus()) {
                                   <div class="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar p-2 bg-black/20 rounded border border-white/5">
                                       <div class="text-[10px] text-yellow-500 font-bold uppercase tracking-wider mb-2 sticky top-0 bg-black/80 backdrop-blur pb-1">✨ Rotas Bônus Desbloqueadas</div>
                                       @for (bonus of bonusScenes(); track bonus.id) {
                                           <button (click)="playBonusScene(bonus.sceneId)" class="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-500 text-white font-bold rounded-lg hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(234,179,8,0.3)] border border-yellow-400 flex items-center justify-center gap-2 text-sm w-full animate-bounce break-words whitespace-normal leading-tight">
                                              <span>🌟</span> {{ bonus.label }}
                                           </button>
                                       }
                                   </div>
                               }

                               <button (click)="showAchievementsModal.set(true)" class="w-full py-3 bg-slate-700 text-white font-bold rounded hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm">
                                  <span>🏆</span> {{ locSettings().titleScreen.achievementsButtonText || 'Conquistas' }} ({{ earnedCount() }}/{{ totalAchiv() }})
                               </button>
                               
                               <div class="flex flex-col sm:flex-row gap-2 justify-center w-full">
                                   <button (click)="returnToTitle()" class="flex-1 py-3 border border-white/20 text-white rounded hover:bg-white/10 font-bold uppercase text-xs tracking-wider">{{ locSettings().endingScreen.buttonText || 'Menu' }}</button>
                                   <button (click)="startNewGame()" class="flex-1 py-3 bg-white text-black font-bold rounded hover:bg-cyan-100 uppercase text-xs tracking-wider">Jogar Novamente</button>
                                   <button (click)="exit.emit()" class="flex-none py-3 px-6 bg-red-900/50 hover:bg-red-800 text-white rounded font-bold uppercase text-xs tracking-wider">Sair</button>
                               </div>
                           </div>
                       </div>
                   }
                }
           </div>
      </div>

      <!-- Overlays -->
      @if (vnService.achievementNotification(); as notif) {
          <app-achievement-toast [name]="notif.name" [description]="notif.description" [iconUrl]="notif.iconUrl"></app-achievement-toast>
      }
      
      @if (itemFound(); as item) {
          <app-item-modal [message]="item.obj.message" [imageUrl]="item.img" (close)="itemFound.set(null)"></app-item-modal>
      }
      
      @if (showMenu()) {
          <app-game-menu 
              [startTab]="menuStartTab()"
              (close)="showMenu.set(false)" 
              (returnTitle)="returnToTitle()"
              (loadGame)="onGameLoaded($event)"
              [isTitleScreen]="playerState() === 'title'">
          </app-game-menu>
      }

      @if (showAchievementsModal()) { 
          <div class="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"> 
              <div class="bg-slate-800 w-full max-w-2xl h-[80%] rounded border border-slate-600 flex flex-col shadow-2xl"> 
                  <div class="p-4 border-b border-slate-700 flex justify-between items-center"> 
                      <h3 class="text-white font-bold">{{ locSettings().titleScreen.achievementsButtonText || 'Conquistas' }}</h3> 
                      <button (click)="showAchievementsModal.set(false)" class="text-slate-400 hover:text-white">✕</button> 
                  </div> 
                  <div class="flex-1 overflow-y-auto p-4 space-y-2"> 
                      @for(ach of vnService.achievements(); track ach.id) { 
                          <div class="flex items-center gap-4 p-3 rounded border" 
                               [ngClass]="{
                                   'bg-green-900/20 border-green-600': vnService.earnedAchievements().has(ach.id),
                                   'bg-slate-900 border-slate-700 opacity-50': !vnService.earnedAchievements().has(ach.id)
                               }"> 
                               <div class="w-12 h-12 bg-slate-950 rounded flex items-center justify-center overflow-hidden shrink-0"> 
                                   @if(ach.iconAssetId) { 
                                       <img [src]="getAssetUrl(ach.iconAssetId)" class="w-full h-full object-cover" [style.object-position]="(ach.iconX ?? 50) + '% ' + (ach.iconY ?? 50) + '%'"> 
                                   } @else { 
                                       <span>🏆</span> 
                                   } 
                               </div> 
                               <div> 
                                   <div class="text-white font-bold">{{ ach.name }}</div> 
                                   <div class="text-xs text-slate-400">{{ ach.description }}</div> 
                               </div> 
                          </div> 
                      } 
                  </div> 
              </div> 
          </div> 
      }

      @if (showTerms()) { 
          <app-terms-screen 
              [title]="locSettings().titleScreen.termsButtonText || 'Termos de Uso'"
              [text]="vnService.settings().termsOfUse || 'Sem termos definidos.'"
              (close)="showTerms.set(false)">
          </app-terms-screen>
      }
    </div>
  `
})
export class GamePlayerComponent implements OnInit, OnDestroy {
  vnService = inject(VnService);
  layoutService = inject(DeviceLayoutService);
  flowService = inject(GameFlowService); 
  Math = Math;
  exit = output<void>();
  
  @ViewChild('bgmPlayer') bgmPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('sfxPlayer') sfxPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('voicePlayer') voicePlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('narratorPlayer') narratorPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>; 
  
  playingSceneId = signal<string | null>(null);
  playerState = signal<'loading' | 'title' | 'game'>('loading');
  showNameInput = signal(false);
  tempPlayerName = '';
  showMenu = signal(false);
  menuStartTab = signal<'history'|'settings'|'save'>('settings');
  showAchievementsModal = signal(false);
  showTerms = signal(false);
  displayedText = signal('');
  typewriterTimeout: any;
  loadingTimeout: any;
  creditsFinished = signal(false);
  
  sceneContentReady = signal(false);
  activeAnimationClass = signal('');
  
  dialogueAnimClass = signal('');
  private isDialogueOpen = false;

  itemFound = signal<any>(null);
  
  earnedCount = computed(() => this.vnService.earnedAchievements().size);
  totalAchiv = computed(() => this.vnService.achievements().length);
  bonusScenes = computed(() => this.vnService.settings().endingScreen.bonusScenes || []);
  
  charHeight = computed(() => this.layoutService.currentLayout().characterHeight);

  dialogueCfg = computed(() => this.vnService.settings().dialogueBox || {
      style: 'modern',
      backgroundColor: '#0f172a',
      backgroundOpacity: 0.9,
      borderColor: '#334155',
      textColor: '#ffffff',
      nameColor: '#0891b2',
      fontFamily: 'Inter',
      typingEffect: 'typewriter',
      choiceButtonStyle: 'modern'
  });

  canUnlockBonus = computed(() => {
      const total = this.totalAchiv();
      const list = this.bonusScenes();
      return list.length > 0 && (total === 0 || this.earnedCount() === total);
  });

  loadingConfig = computed(() => this.vnService.settings()?.loadingScreen || { backgroundColor: '#000', textColor: '#fff', loadingText: '...', style: 'standard' });
  
  titleConfig = computed(() => this.vnService.settings()?.titleScreen || { 
      enabled: true, 
      title: '', 
      subtitle: '', 
      textColor: '#fff', 
      buttonText: 'Start',
      musicId: null,
      backgroundId: null
  });
  
  endingConfig = computed(() => this.vnService.settings()?.endingScreen || { enabled: true, title: 'End', subtitle: '', textColor: '#fff', buttonText: 'Menu' });
  
  // Note: getLocalizedSettings merges data so keys like titleScreen are present.
  locSettings = computed(() => this.vnService.getLocalizedSettings());
  
  currentScene = computed(() => this.vnService.scenes().find(s => s.id === this.playingSceneId()) || null);
  
  activeMusicId = computed(() => {
      if (this.playerState() === 'title') return this.titleConfig().musicId;
      if (this.playerState() === 'game') {
          const s = this.currentScene();
          if (s) {
              if (s.musicId) return s.musicId;
              if (s.musicId === null) return this.vnService.settings()?.globalMusicId;
          }
      }
      return null;
  });

  private triggerSceneId = computed(() => {
      return this.playerState() === 'game' ? this.playingSceneId() : null;
  });

  constructor() {
    effect(() => {
       const sceneId = this.triggerSceneId();
       
       untracked(() => {
           if (sceneId) {
               const scene = this.vnService.scenes().find(s => s.id === sceneId);
               if (scene) {
                   this.setupScene(scene);
               } else {
                   this.creditsFinished.set(false);
                   this.isDialogueOpen = false;
               }
           } else {
               this.creditsFinished.set(false);
               this.isDialogueOpen = false;
           }
       });
    });

    effect(() => {
        if (this.playerState() === 'game' && this.sceneContentReady()) {
             const scene = this.currentScene();
             if (scene && scene.isVideo && this.bgVideo) {
                 const vid = this.bgVideo.nativeElement;
                 vid.muted = (scene.videoMuted !== false); 
                 vid.play().catch(e => {
                     if (!vid.muted) {
                         vid.muted = true;
                         vid.play().catch(() => {});
                     }
                 });
             }
        }
    });

    effect(() => {
        const musicId = this.activeMusicId();
        const url = this.getAssetUrl(musicId);
        const player = this.bgmPlayer?.nativeElement;
        if (player) {
            if (url) {
                const currentSrc = player.getAttribute('src'); 
                if (currentSrc !== url) { 
                    player.src = url; 
                    player.play().catch(() => {}); 
                } else if (player.paused) { 
                    player.play().catch(() => {}); 
                }
            } else { 
                player.pause(); 
                player.removeAttribute('src'); 
            }
        }
    });

    effect(() => {
       const musicVol = this.vnService.userPrefs().musicVolume;
       const voiceVol = this.vnService.userPrefs().voiceVolume;
       
       if (this.bgmPlayer) this.bgmPlayer.nativeElement.volume = musicVol;
       if (this.sfxPlayer) this.sfxPlayer.nativeElement.volume = musicVol; 
       if (this.voicePlayer) this.voicePlayer.nativeElement.volume = voiceVol;
       if (this.narratorPlayer) this.narratorPlayer.nativeElement.volume = voiceVol;
       if (this.bgVideo) this.bgVideo.nativeElement.volume = musicVol;
    });
  }

  ngOnInit() { 
      this.startLoadingSequence(); 
  }

  ngOnDestroy() {
      clearTimeout(this.loadingTimeout);
      clearTimeout(this.typewriterTimeout);
  }

  private setupScene(scene: Scene) {
       clearTimeout(this.typewriterTimeout);
       clearTimeout(this.loadingTimeout);
       
       this.sceneContentReady.set(false);
       this.activeAnimationClass.set(''); 
       this.flowService.resetSceneState(scene);
       
       const bgUrl = this.getAssetUrl(scene.backgroundId);
       
       // Force a tiny delay to ensure DOM updates and animations reset correctly between scenes
       // especially if the transition type changes or we reload same component
       setTimeout(() => {
           if (!bgUrl) {
               this.onContentReady();
           } else {
               this.loadingTimeout = setTimeout(() => this.onContentReady(), 100);
           }
       }, 50);

       this.creditsFinished.set(false);
       if (scene.awardAchievementId) this.vnService.unlockAchievement(scene.awardAchievementId);
       
       this.playAudioOneShot(this.sfxPlayer, scene.soundId);
       this.playAudioOneShot(this.voicePlayer, this.vnService.getLocalizedVoice(scene));
       this.playAudioOneShot(this.narratorPlayer, this.vnService.getLocalizedNarrator(scene));

       if (this.shouldShowDialogue(scene) && !scene.miniGame) {
           this.startTypewriter(this.parseText(this.vnService.getLocalizedText(scene, 'dialogueText')));
           if (!this.isDialogueOpen) {
               this.dialogueAnimClass.set('animate-in fade-in slide-in-from-bottom-4 duration-300');
               this.isDialogueOpen = true;
           } else {
               this.dialogueAnimClass.set('');
           }
       } else {
           this.isDialogueOpen = false;
           this.dialogueAnimClass.set('');
       }
  }

  playAudioOneShot(ref: ElementRef<HTMLAudioElement>, assetId: string | null | undefined) {
      if (assetId && ref) {
          const url = this.getAssetUrl(assetId);
          if (url) {
              ref.nativeElement.src = url;
              ref.nativeElement.currentTime = 0;
              ref.nativeElement.play().catch(() => {});
          }
      }
  }
  
  onContentReady() {
      if (this.sceneContentReady()) return;
      this.sceneContentReady.set(true);
      
      const scene = this.currentScene();
      const type = scene?.transition || 'fade';
      
      if (!type || type === 'none') { 
          this.activeAnimationClass.set(''); 
      } else if (type === 'fade') {
          this.activeAnimationClass.set('scene-trans-fade'); 
      } else if (type === 'slide-left') {
          this.activeAnimationClass.set('scene-trans-slide-left'); 
      } else if (type === 'slide-right') {
          this.activeAnimationClass.set('scene-trans-slide-right'); 
      } else if (type === 'zoom') {
          this.activeAnimationClass.set('scene-trans-zoom'); 
      } else if (type === 'dissolve') {
          this.activeAnimationClass.set('scene-trans-dissolve'); 
      } else {
          this.activeAnimationClass.set('scene-trans-fade'); 
      }
  }

  getEffectClass(effect?: SceneEffect) { return getEffectClass(effect); }
  getCharAnimClass(anim?: any) { return getCharAnimClass(anim); }
  
  startLoadingSequence() { 
      this.playerState.set('loading'); 
      setTimeout(() => { 
          if (this.titleConfig().enabled) this.playerState.set('title'); 
          else this.startNewGame(); 
      }, 1500); 
  }

  openNameInput() { this.tempPlayerName = 'Jogador'; this.showNameInput.set(true); }
  openMenu(tab: 'settings' | 'save') { this.menuStartTab.set(tab); this.showMenu.set(true); }
  openTerms() { this.showTerms.set(true); }
  
  startNewGame() { 
      this.vnService.resetRuntimeState(); 
      if (this.tempPlayerName.trim()) this.vnService.playerName.set(this.tempPlayerName); 
      const startId = this.vnService.scenes()[0]?.id; 
      if (startId) { 
          this.playingSceneId.set(startId); 
          this.vnService.currentSceneId.set(startId);
          this.playerState.set('game'); 
          this.showNameInput.set(false); 
      } else {
          alert('Este projeto não tem cenas!');
          this.playerState.set('title');
      }
  }
  
  onGameLoaded(sceneId: string) { 
      this.playingSceneId.set(sceneId); 
      this.vnService.currentSceneId.set(sceneId);
      this.playerState.set('game'); 
      this.showMenu.set(false); 
  }
  
  returnToTitle() { 
      this.playerState.set('title'); 
      this.showMenu.set(false); 
      this.creditsFinished.set(false);
  }
  
  playBonusScene(sceneId: string) { 
      this.playingSceneId.set(sceneId); 
      this.vnService.currentSceneId.set(sceneId); 
      this.playerState.set('game'); 
      this.creditsFinished.set(false); 
  }
  
  startTypewriter(fullText: string) { 
      const scene = this.currentScene(); 
      if(scene) { this.vnService.addToGameHistory({ type: 'dialogue', speaker: this.vnService.getLocalizedText(scene, 'speakerName'), text: fullText }); } 
      
      const config = this.dialogueCfg();
      // Handle 'instant' style or 0 speed preference
      const speed = config.typingEffect === 'instant' ? 0 : this.vnService.userPrefs().textSpeed; 
      
      if (speed === 0) { 
          this.displayedText.set(fullText); 
          this.flowService.isTyping.set(false); 
          return; 
      } 
      
      this.displayedText.set(''); 
      this.flowService.isTyping.set(true); 
      
      let i = 0; 
      const type = () => { 
          if (!this.flowService.isTyping()) {
              this.displayedText.set(fullText);
              return;
          }

          if (i < fullText.length) { 
              this.displayedText.update(t => t + fullText[i]); 
              i++; 
              this.typewriterTimeout = setTimeout(type, speed); 
          } else { 
              this.flowService.isTyping.set(false); 
          } 
      }; 
      type(); 
  }
  
  getAssetUrl(id: string|null|undefined) { return this.vnService.getAssetUrl(id); }
  getVoiceUrl(scene: Scene) { return this.vnService.getAssetUrl(this.vnService.getLocalizedVoice(scene)); }
  getNarratorUrl(scene: Scene) { return this.vnService.getAssetUrl(this.vnService.getLocalizedNarrator(scene)); }
  shouldShowDialogue(scene: Scene): boolean { if (scene.hideDialogueBox) return false; return !!this.vnService.getLocalizedText(scene, 'dialogueText'); }
  
  onVideoEnded(scene: Scene) {
      const action = this.flowService.handleVideoEnd(scene);
      if (action === 'advance') {
          this.playingSceneId.set(this.vnService.currentSceneId());
      }
  }

  // CORRECTED: Ensure we consume the event properly
  handleChoice(scene: Scene, choice: Choice) {
      // 1. Logic via Service
      this.flowService.makeChoice(scene, choice);
      
      // 2. Sync Local State immediately
      // This forces the view to update even if signals have a slight propagation delay
      const nextId = this.vnService.currentSceneId();
      this.playingSceneId.set(nextId);
  }

  onSceneClick(scene: Scene, isDialogueBox = false) { 
      const action = this.flowService.handleScreenClick(scene);

      if (action === 'finish-typing') {
          clearTimeout(this.typewriterTimeout);
          this.displayedText.set(this.parseText(this.vnService.getLocalizedText(scene, 'dialogueText')));
      } else if (action === 'advance') {
          // Lógica solicitada: Só avança se clicar no diálogo (se houver diálogo visível)
          if (this.shouldShowDialogue(scene) && !isDialogueBox) {
              return; 
          }

          this.flowService.advance(scene);
          this.playingSceneId.set(this.vnService.currentSceneId());
      }
  }

  showItemFound(data: any) {
      this.itemFound.set(data);
  }

  onDialogueClick(scene: Scene) { this.onSceneClick(scene, true); }

  handleMiniGameResult(scene: Scene, success: boolean) {
      if (success) {
          if(scene.miniGame?.affectionReward) {
              const {characterId, amount} = scene.miniGame.affectionReward;
              this.vnService.affectionService.addAffection(characterId, amount);
          }

          this.flowService.advance(scene);
          this.playingSceneId.set(this.vnService.currentSceneId());
      } else {
          const prevScene = this.vnService.scenes().find(s => s.nextSceneId === scene.id);
          if (prevScene) {
              this.playingSceneId.set(prevScene.id);
              this.vnService.currentSceneId.set(prevScene.id);
          } else {
              const currentId = this.playingSceneId();
              this.playingSceneId.set(null);
              setTimeout(() => this.playingSceneId.set(currentId), 50);
          }
      }
  }

  onCreditsAnimationEnd() { this.creditsFinished.set(true); }
  parseText(text: string) { if (!text) return ''; const name = this.vnService.playerName(); return text.replace(/{user}/gi, name).replace(/{player}/gi, name); }

  getChoiceStyleClass() {
      const styleKey = this.dialogueCfg().choiceButtonStyle || 'modern';
      return CHOICE_STYLES[styleKey]?.containerClass || CHOICE_STYLES['modern'].containerClass;
  }

  // Helpers for Style Customization
  getDialogueStyles() {
      const c = this.dialogueCfg();
      // Helper to convert hex + opacity
      const hexToRgba = (hex: string, alpha: number) => {
          if(!hex) return `rgba(0,0,0,${alpha})`;
          let r=0,g=0,b=0;
          if(hex.length === 4){r=parseInt(hex[1]+hex[1],16);g=parseInt(hex[2]+hex[2],16);b=parseInt(hex[3]+hex[3],16);}
          else if(hex.length === 7){r=parseInt(hex.slice(1,3),16);g=parseInt(hex.slice(3,5),16);b=parseInt(hex.slice(5,7),16);}
          return `rgba(${r},${g},${b},${alpha})`;
      };

      return {
          'background-color': hexToRgba(c.backgroundColor, c.backgroundOpacity),
          'border-color': c.borderColor,
          'color': c.textColor,
          'font-family': c.fontFamily || 'Inter'
      };
  }

  getDialogueClasses() {
      const style = this.dialogueCfg().style;
      if (style === 'retro') return 'border-4 rounded-none shadow-none';
      if (style === 'paper') return 'border-2 rounded-sm shadow-md';
      if (style === 'neon') return 'border rounded-lg shadow-[0_0_10px_currentColor]';
      if (style === 'cinematic') return 'border-t border-b-0 border-l-0 border-r-0 rounded-none w-full bg-gradient-to-t from-black to-transparent';
      if (style === 'clean') return 'border-none shadow-none bg-transparent !bg-opacity-0 text-shadow-md';
      return 'border rounded-lg backdrop-blur'; // modern
  }

  isLightColor(color: string) {
      if(!color) return false;
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return ((r * 299) + (g * 587) + (b * 114)) / 1000 > 155;
  }
}
