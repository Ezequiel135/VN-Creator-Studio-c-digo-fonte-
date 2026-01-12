
import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { Scene, ParticleConfig } from '../../types';
import { SCENE_TRANSITIONS, SCENE_EFFECTS } from '../../config/scene-options';
import { ParticleConfigUiComponent } from '../editor-ui/particle-config-ui.component';

@Component({
  selector: 'app-tab-scene-options',
  standalone: true,
  imports: [CommonModule, FormsModule, ParticleConfigUiComponent],
  template: `
    <div class="flex flex-col gap-4 h-full p-4 overflow-y-auto custom-scrollbar">
        
        <!-- Scene Transition Settings -->
        <div class="bg-slate-950 p-3 rounded border border-slate-800 shrink-0">
             <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Transição de Cena (Entrada)</label>
             <select [ngModel]="scene().transition || 'fade'" (ngModelChange)="updateTransition($event)"
                     [disabled]="vnService.editorLanguage() !== 'default'"
                     class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2 text-xs text-white focus:border-cyan-500 outline-none">
                 @for(opt of transitions; track opt.value) {
                     <option [value]="opt.value">{{ opt.label }}</option>
                 }
             </select>
        </div>

        <!-- Weather / Effect Settings -->
        <div class="bg-slate-950 p-3 rounded border border-slate-800 shrink-0">
             <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider flex items-center gap-1">
                 <span>🌧️</span> Clima / Efeito Visual
             </label>
             <select [ngModel]="scene().effect || 'none'" (ngModelChange)="updateEffect($event)"
                     [disabled]="vnService.editorLanguage() !== 'default'"
                     class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2 text-xs text-white focus:border-cyan-500 outline-none">
                 @for(opt of effects; track opt.value) {
                     <option [value]="opt.value">{{ opt.label }}</option>
                 }
             </select>
        </div>

        <!-- PARTICLE SYSTEM CONFIG (Refactored) -->
        <app-particle-config-ui 
            [config]="particleConfig()"
            (configChange)="updateParticle($event)">
        </app-particle-config-ui>

        <!-- Video Options Folder -->
        @if (scene().isVideo) {
            <div class="bg-slate-900 rounded-lg overflow-hidden border border-cyan-800/30 shrink-0">
                <div class="bg-gradient-to-r from-cyan-900/40 to-slate-900 p-2 flex items-center gap-2 border-b border-cyan-800/30">
                    <span class="text-lg">🎥</span>
                    <span class="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Controle de Vídeo/GIF</span>
                </div>
                
                <div class="p-3 grid grid-cols-1 gap-1">
                    <!-- Mute Control -->
                    <div class="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded transition-colors cursor-pointer" (click)="toggleMute()">
                        <div class="flex items-center gap-3">
                            <span class="text-xl">{{ scene().videoMuted ? '🔇' : '🔊' }}</span>
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-slate-200">Áudio do Vídeo</span>
                                <span class="text-[9px] text-slate-500">{{ scene().videoMuted ? 'Silenciado' : 'Ativo' }}</span>
                            </div>
                        </div>
                        <div class="relative inline-flex items-center cursor-pointer pointer-events-none">
                            <input type="checkbox" [ngModel]="!scene().videoMuted" class="sr-only peer">
                            <div class="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[0px] after:left-[0px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                        </div>
                    </div>

                    <div class="h-px bg-slate-800 w-full"></div>

                    <!-- Loop Control -->
                    <div class="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded transition-colors cursor-pointer" (click)="toggleLoop()">
                        <div class="flex items-center gap-3">
                            <span class="text-xl">{{ scene().videoLoop !== false ? '🔄' : '🛑' }}</span>
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-slate-200">Loop (Repetição)</span>
                                <span class="text-[9px] text-slate-500">{{ scene().videoLoop !== false ? 'Infinito' : 'Tocar uma vez' }}</span>
                            </div>
                        </div>
                        <div class="relative inline-flex items-center cursor-pointer pointer-events-none">
                            <input type="checkbox" [ngModel]="scene().videoLoop !== false" class="sr-only peer">
                            <div class="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[0px] after:left-[0px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                        </div>
                    </div>
                </div>
            </div>
        }
    </div>
  `
})
export class TabSceneOptionsComponent {
  vnService = inject(VnService);
  scene = input.required<Scene>();

  transitions = SCENE_TRANSITIONS;
  effects = SCENE_EFFECTS;

  // FIX: Explicitly cast the default object to ParticleConfig to match the required type
  particleConfig = computed(() => (this.scene().particleConfig || { enabled: false, preset: 'sakura', density: 3, speed: 3 }) as ParticleConfig);

  updateTransition(val: any) { this.vnService.updateScene(this.scene().id, { transition: val }); }
  updateEffect(val: any) { this.vnService.updateScene(this.scene().id, { effect: val }); }

  updateMute(val: boolean) { this.vnService.updateScene(this.scene().id, { videoMuted: val }); }
  toggleMute() { this.updateMute(!this.scene().videoMuted); }

  updateLoop(val: boolean) { this.vnService.updateScene(this.scene().id, { videoLoop: val }); }
  toggleLoop() { this.updateLoop(this.scene().videoLoop === false); }

  updateParticle(newConfig: ParticleConfig) {
      this.vnService.updateScene(this.scene().id, { particleConfig: newConfig });
  }
}