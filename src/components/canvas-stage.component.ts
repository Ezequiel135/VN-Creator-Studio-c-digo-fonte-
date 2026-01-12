
import { Component, input, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VnService } from '../services/vn.service';
import { Scene } from '../types';
import { LayoutPortrait } from '../config/layout-portrait';
import { LayoutLandscape } from '../config/layout-landscape';
import { HiddenObjectLayerComponent } from './player/layers/hidden-object-layer.component';

@Component({
  selector: 'app-canvas-stage',
  standalone: true,
  imports: [CommonModule, HiddenObjectLayerComponent],
  template: `
    <!-- Wrapper to center the stage. -->
    <div class="w-full h-full flex items-center justify-center relative p-0 overflow-hidden bg-black/20"
         (window:mousemove)="onDragMove($event)"
         (window:mouseup)="onDragEnd()"
         (window:touchmove)="onDragMove($event)"
         (window:touchend)="onDragEnd()">
        
        <!-- The Stage Container -->
        <div class="relative flex items-center justify-center shadow-2xl ring-1 ring-white/10 rounded-none overflow-hidden transition-all duration-300 ease-in-out"
             style="max-width: 100%; max-height: 100%;"
             [class.cursor-crosshair]="isPickingPosition()">
             
             <!-- Spacer SVG (Invisible) to force dimensions based on layout settings -->
             <svg [attr.viewBox]="currentViewBox()" class="block w-auto h-auto max-w-full max-h-full opacity-0 pointer-events-none" style="min-height: 200px; min-width: 200px;"></svg>

             <!-- ACTUAL CONTENT OVERLAY -->
             <div #stageRef
                  class="absolute inset-0 bg-zinc-900 select-none overflow-hidden"
                  (click)="onStageClick($event)">
                  
                  <!-- 1. Background Layer -->
                  <div class="absolute inset-0 cursor-move bg-zinc-800 group z-0" 
                       (mousedown)="startDrag('background', null, $event)"
                       (touchstart)="startDrag('background', null, $event)">
                      
                      @if (scene().isVideo) {
                         <video [src]="getAssetUrl(scene().backgroundId)" 
                                class="w-full h-full object-cover pointer-events-none opacity-100"
                                [muted]="true" loop autoplay playsinline
                                [style.object-position]="(scene().bgX || 50) + '% ' + (scene().bgY || 50) + '%'"></video>
                      } @else {
                         @let bgUrl = getAssetUrl(scene().backgroundId);
                         @if (bgUrl) {
                             <div class="w-full h-full bg-cover bg-no-repeat pointer-events-none" 
                                  [style.background-image]="'url(' + bgUrl + ')'"
                                  [style.background-position]="(scene().bgX || 50) + '% ' + (scene().bgY || 50) + '%'"></div>
                         } @else {
                             <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none bg-[radial-gradient(circle,_#334155_1px,_transparent_1px)] bg-[length:20px_20px]">
                                 <span class="text-xs uppercase font-bold tracking-widest bg-slate-800/80 px-3 py-1.5 rounded border border-slate-600">Sem Fundo</span>
                             </div>
                         }
                      }
                      
                      <!-- Hint -->
                      @if (!isPickingPosition()) {
                          <div class="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 font-medium">
                              ARRASTAR FUNDO
                          </div>
                      }
                  </div>

                  <!-- 2. Hidden Objects Layer (Editor Only) -->
                  <app-hidden-object-layer 
                      [scene]="scene()" 
                      [isEditor]="true"
                      (dragStart)="startDrag('hidden-object', $event.id, $event.event)">
                  </app-hidden-object-layer>

                  <!-- 3. Characters Layer (Full Height to prevent clipping) -->
                  <div class="absolute inset-0 pointer-events-none z-20">
                      @for (char of scene().characters; track char.id) {
                          @if (getAssetUrl(char.assetId); as url) {
                              <div class="absolute cursor-move group hover:z-30 flex items-end justify-center pointer-events-auto"
                                   [style.left.%]="char.x" 
                                   [style.bottom.%]="(char.y || 50) - 50"
                                   [style.height]="currentCharHeight()" 
                                   [style.transform]="'translateX(-50%)'"
                                   [ngClass]="getAnimClass(char.animation)"
                                   (mousedown)="startDrag('character', char.id, $event)"
                                   (touchstart)="startDrag('character', char.id, $event)">
                                  
                                  <img [src]="url" 
                                       class="unsqueezed-img pointer-events-none drop-shadow-xl select-none filter group-hover:brightness-110 transition-all h-full w-auto max-w-none" 
                                       [style.transform]="'scale(' + char.scale + ')'"
                                       [style.transform-origin]="'bottom center'"
                                       [class.scale-x-[-1]]="char.isFlipped">
                                  
                                  <!-- Character Hint -->
                                  <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-cyan-600/90 text-white text-[9px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-lg scale-90 group-hover:scale-100">
                                     POS: {{ Math.round(char.x) }},{{ Math.round(char.y || 50) }}
                                  </div>
                              </div>
                          }
                      }
                  </div>

                  <!-- 4. Mini-Game Preview (Overlay) -->
                  @if (scene().miniGame; as game) {
                      <div class="absolute inset-0 z-30 flex items-center justify-center p-10 pointer-events-none">
                          <div class="bg-slate-900/90 backdrop-blur-sm border-2 border-slate-600 rounded-xl p-6 shadow-2xl w-full max-w-md text-center opacity-90 relative overflow-hidden">
                              
                              <div class="absolute top-0 left-0 right-0 h-1 bg-cyan-500/50"></div>
                              <div class="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">PREVIEW: {{ game.type }}</div>
                              
                              <!-- Type Specific Visuals -->
                              @if(game.type === 'quiz') {
                                  <div class="text-sm font-bold text-white mb-3">"{{ game.question || 'Pergunta...' }}"</div>
                                  <div class="flex flex-col gap-2 opacity-50">
                                      <div class="h-8 bg-slate-700 rounded w-full"></div>
                                      <div class="h-8 bg-slate-700 rounded w-full"></div>
                                  </div>
                              }
                              
                              @if(game.type === 'mash') {
                                  <div class="w-20 h-20 rounded-full bg-red-600 border-b-4 border-red-800 mx-auto flex items-center justify-center text-white font-black text-xs shadow-lg">SMASH</div>
                                  <div class="mt-2 text-[10px] text-slate-400">Target: {{ game.mashTarget }}</div>
                              }

                              @if(game.type === 'password') {
                                  <div class="bg-black border border-green-500/50 p-2 rounded text-green-500 font-mono text-sm tracking-widest">_ _ _ _ _</div>
                                  <div class="text-[10px] text-yellow-500 mt-1">Dica: {{ game.passwordHint }}</div>
                              }

                              @if(game.type === 'quick-click') {
                                  <div class="relative h-24 bg-slate-800 rounded border border-slate-700/50 overflow-hidden">
                                      <div class="absolute w-8 h-8 bg-red-500 rounded-full border-2 border-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_red]"></div>
                                  </div>
                              }

                              @if(game.type === 'sequence') {
                                  <div class="flex justify-center gap-2">
                                      <div class="w-8 h-8 rounded bg-red-500/50 border-2 border-red-500"></div>
                                      <div class="w-8 h-8 rounded bg-blue-500/50 border-2 border-blue-500"></div>
                                      <div class="w-8 h-8 rounded bg-green-500/50 border-2 border-green-500"></div>
                                      <div class="w-8 h-8 rounded bg-yellow-500/50 border-2 border-yellow-500"></div>
                                  </div>
                              }

                              @if(game.type === 'find') {
                                  <div class="relative h-24 bg-slate-800 rounded border border-slate-700/50 overflow-hidden bg-[url('https://transparent-textures.patterns.velomo.de/subtle_dots.png')]">
                                      <div class="absolute border-2 border-red-500/50 rounded-full w-8 h-8"
                                           [style.left.%]="(game.targetX || 50) - 5" 
                                           [style.top.%]="(game.targetY || 50) - 10"></div>
                                      <div class="absolute inset-0 flex items-center justify-center text-[10px] text-white/20 font-bold uppercase">Área do Alvo</div>
                                  </div>
                              }

                              @if(game.type === 'timing') {
                                  <div class="h-4 bg-slate-800 rounded-full border border-slate-600 relative overflow-hidden mt-2">
                                      <div class="absolute top-0 bottom-0 bg-green-500/50 w-1/5 left-1/2 -translate-x-1/2"></div>
                                      <div class="absolute top-0 bottom-0 w-1 bg-white left-1/3"></div>
                                  </div>
                              }

                              @if(game.type === 'memory') {
                                  <div class="grid grid-cols-4 gap-1 opacity-50">
                                      <div class="bg-slate-700 h-8 rounded"></div><div class="bg-slate-700 h-8 rounded"></div>
                                      <div class="bg-slate-700 h-8 rounded"></div><div class="bg-slate-700 h-8 rounded"></div>
                                  </div>
                              }

                              @if(game.type === 'math') {
                                  <div class="bg-slate-800 px-4 py-2 rounded text-white font-bold text-lg mb-2 border border-slate-600">2 + 2 = ?</div>
                                  <div class="grid grid-cols-2 gap-2 opacity-50">
                                      <div class="bg-slate-700 h-6 rounded"></div><div class="bg-slate-700 h-6 rounded"></div>
                                  </div>
                              }

                              @if(game.type === 'balance') {
                                  <div class="h-1 bg-slate-600 rounded relative mt-4">
                                      <div class="absolute -top-1.5 w-3 h-3 bg-yellow-500 rounded-full left-1/2 -translate-x-1/2 shadow-[0_0_5px_yellow]"></div>
                                  </div>
                                  <div class="flex justify-between mt-2 px-4 opacity-50">
                                      <div class="w-6 h-6 bg-slate-700 rounded-full"></div>
                                      <div class="w-6 h-6 bg-slate-700 rounded-full"></div>
                                  </div>
                              }
                          </div>
                      </div>
                  }

                  <!-- 5. Dialogue Box Preview (Refined) -->
                  <!-- HIDE if miniGame is present OR hideDialogueBox is true -->
                  @if (!scene().hideDialogueBox && !scene().miniGame) {
                      <div class="absolute bottom-[4%] left-[4%] right-[4%] min-h-[25%] flex flex-col p-4 pointer-events-none z-30 group transition-colors"
                           [ngStyle]="getDialogueStyles()"
                           [class]="getDialogueClasses()">
                          <!-- Speaker -->
                          <div class="text-[10px] px-3 py-1 self-start rounded mb-2 border border-cyan-500/30 font-bold opacity-80 group-hover:opacity-100"
                               [style.background-color]="dialogueCfg().nameColor"
                               [style.border-color]="dialogueCfg().borderColor"
                               [style.color]="isLightColor(dialogueCfg().nameColor) ? '#000' : '#fff'">
                             {{ getSpeaker() || 'Nome do Personagem' }}
                          </div>
                          <!-- Text -->
                          <div class="text-[11px] leading-relaxed font-medium drop-shadow-sm whitespace-pre-wrap">
                             {{ getDialogue() || 'O diálogo aparecerá nesta área...' }}
                          </div>
                          <!-- Tag -->
                          <div class="absolute top-2 right-2 text-[8px] text-white/20 uppercase font-bold tracking-widest border border-white/10 px-1 rounded">Preview</div>
                      </div>
                  }
             </div>
        </div>
    </div>
  `
})
export class CanvasStageComponent {
  vnService = inject(VnService);
  scene = input.required<Scene>();
  Math = Math;
  
  @ViewChild('stageRef') stageRef!: ElementRef<HTMLDivElement>;

  dragType = signal<'background'|'character'|'hidden-object'|null>(null);
  dragId = signal<string|null>(null);
  
  startX = 0; startY = 0; initX = 0; initY = 0;
  rect: DOMRect | null = null;
  draggedEl: HTMLElement | null = null;

  isPickingPosition = computed(() => !!this.vnService.editorInteraction());

  // Determine layout based on Project Settings, not just device
  effectiveLayout = computed(() => {
      const platform = this.vnService.settings().targetPlatform;
      if (platform === 'mobile') return LayoutPortrait;
      return LayoutLandscape;
  });

  dialogueCfg = computed(() => this.vnService.settings().dialogueBox || {
      style: 'modern',
      backgroundColor: '#0f172a',
      backgroundOpacity: 0.9,
      borderColor: '#334155',
      textColor: '#ffffff',
      nameColor: '#0891b2',
      fontFamily: 'Inter'
  });

  currentViewBox = computed(() => this.effectiveLayout().editorViewBox);
  currentCharHeight = computed(() => this.effectiveLayout().characterHeight);

  getAssetUrl(id: string|null|undefined) { return this.vnService.getAssetUrl(id); }
  getSpeaker() { return this.vnService.getLocalizedText(this.scene(), 'speakerName'); }
  getDialogue() { return this.vnService.getLocalizedText(this.scene(), 'dialogueText'); }

  getAnimClass(anim?: string) {
      if (anim === 'slide-left') return 'char-enter-slide-left';
      if (anim === 'slide-right') return 'char-enter-slide-right';
      if (anim === 'pop') return 'char-enter-pop';
      if (anim === 'shake') return 'animate-shake';
      if (anim === 'none') return '';
      return 'char-enter-fade';
  }

  // Pick Position Logic
  onStageClick(e: MouseEvent) {
      const interaction = this.vnService.editorInteraction();
      if (interaction?.type === 'pick-hidden-object') {
          const rect = this.stageRef.nativeElement.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          let pctX = (x / rect.width) * 100;
          let pctY = (y / rect.height) * 100;
          
          const obj = this.scene().hiddenObjects?.find(o => o.id === interaction.itemId);
          if (obj) {
              pctX -= (obj.width || 20) / 2;
              pctY -= (obj.height || 20) / 2;
          }

          pctX = Math.max(0, Math.min(100, pctX));
          pctY = Math.max(0, Math.min(100, pctY));

          const newObjs = (this.scene().hiddenObjects || []).map(o => 
              o.id === interaction.itemId ? { ...o, x: Math.round(pctX), y: Math.round(pctY) } : o
          );
          
          this.vnService.updateScene(this.scene().id, { hiddenObjects: newObjs });
          this.vnService.editorInteraction.set(null); // Stop picking
      }
  }

  // Helper to extract position from either Mouse or Touch event
  private getClientPos(e: MouseEvent | TouchEvent) {
      if ((e as TouchEvent).touches && (e as TouchEvent).touches.length > 0) {
          return { x: (e as TouchEvent).touches[0].clientX, y: (e as TouchEvent).touches[0].clientY };
      }
      return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  }

  startDrag(type: 'background'|'character'|'hidden-object', id: string|null, e: MouseEvent | TouchEvent) {
      // Don't drag if we are picking a position
      if (this.isPickingPosition()) return;

      if (e.cancelable) e.preventDefault(); // Prevent scrolling on mobile
      e.stopPropagation();
      
      this.dragType.set(type);
      this.dragId.set(id);
      
      const pos = this.getClientPos(e);
      this.startX = pos.x;
      this.startY = pos.y;
      
      this.rect = this.stageRef.nativeElement.getBoundingClientRect();
      this.draggedEl = e.currentTarget as HTMLElement;

      if(type === 'character') {
          const c = this.scene().characters.find(x => x.id === id);
          this.initX = c ? c.x : 50;
          this.initY = c && c.y !== undefined ? c.y : 50;
      } else if (type === 'hidden-object') {
          const o = this.scene().hiddenObjects?.find(x => x.id === id);
          this.initX = o ? o.x : 50;
          this.initY = o ? o.y : 50;
      } else {
          this.initX = this.scene().bgX;
          this.initY = this.scene().bgY;
      }
  }

  onDragMove(e: MouseEvent | TouchEvent) {
      if(!this.dragType() || !this.rect || !this.draggedEl) return;
      
      if (e.type === 'touchmove') e.preventDefault();
      
      const pos = this.getClientPos(e);
      const dxPct = ((pos.x - this.startX) / this.rect.width) * 100;
      const dyPct = ((pos.y - this.startY) / this.rect.height) * 100;

      if(this.dragType() === 'character') {
          const nx = Math.max(0, Math.min(100, this.initX + dxPct));
          const ny = Math.max(0, Math.min(100, this.initY - dyPct));
          
          this.draggedEl.style.left = `${nx}%`;
          this.draggedEl.style.bottom = `${ny - 50}%`;
          
          this.draggedEl.dataset['tx'] = nx.toString();
          this.draggedEl.dataset['ty'] = ny.toString();
      } else if (this.dragType() === 'hidden-object') {
          const nx = Math.max(0, Math.min(100, this.initX + dxPct));
          const ny = Math.max(0, Math.min(100, this.initY + dyPct));
          
          this.draggedEl.style.left = `${nx}%`;
          this.draggedEl.style.top = `${ny}%`;
          
          this.draggedEl.dataset['hx'] = nx.toString();
          this.draggedEl.dataset['hy'] = ny.toString();
      } else {
          const nx = Math.max(0, Math.min(100, this.initX - dxPct));
          const ny = Math.max(0, Math.min(100, this.initY - dyPct));
          
          const v = this.draggedEl.querySelector('video');
          const d = this.draggedEl.querySelector('div.bg-cover') as HTMLElement;
          const p = `${nx}% ${ny}%`;
          if(v) v.style.objectPosition = p;
          if(d) d.style.backgroundPosition = p;

          this.draggedEl.dataset['bx'] = nx.toString();
          this.draggedEl.dataset['by'] = ny.toString();
      }
  }

  onDragEnd() {
      if(!this.dragType()) return;
      
      if(this.draggedEl) {
          // FIX: Add default '0' fallback to all dataset access to satisfy Type 'string | undefined'
          if(this.dragType() === 'character' && this.draggedEl.dataset['tx']) {
              const x = parseFloat(this.draggedEl.dataset['tx'] || '0');
              const y = parseFloat(this.draggedEl.dataset['ty'] || '50');
              if(!isNaN(x) && this.dragId()) {
                  this.vnService.updateCharacter(this.scene().id, this.dragId()!, {x, y});
              }
              this.draggedEl.style.left = ''; 
              this.draggedEl.style.bottom = '';
          } 
          else if(this.dragType() === 'hidden-object' && this.draggedEl.dataset['hx']) {
              const x = parseFloat(this.draggedEl.dataset['hx'] || '0');
              const y = parseFloat(this.draggedEl.dataset['hy'] || '50');
              if(!isNaN(x) && this.dragId()) {
                  const newObjs = (this.scene().hiddenObjects || []).map(o => 
                      o.id === this.dragId() ? { ...o, x, y } : o
                  );
                  this.vnService.updateScene(this.scene().id, { hiddenObjects: newObjs });
              }
              this.draggedEl.style.left = ''; 
              this.draggedEl.style.top = '';
          }
          else if (this.dragType() === 'background' && this.draggedEl.dataset['bx']) {
              const x = parseFloat(this.draggedEl.dataset['bx'] || '0');
              const y = parseFloat(this.draggedEl.dataset['by'] || '0');
              if(!isNaN(x)) this.vnService.updateScene(this.scene().id, {bgX: x, bgY: y});
              
              const v = this.draggedEl.querySelector('video');
              const d = this.draggedEl.querySelector('div.bg-cover') as HTMLElement;
              if(v) v.style.objectPosition = '';
              if(d) d.style.backgroundPosition = '';
          }
      }

      this.dragType.set(null);
      this.draggedEl = null;
  }

  getDialogueStyles() {
      const c = this.dialogueCfg();
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
      return 'border rounded-lg backdrop-blur'; 
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