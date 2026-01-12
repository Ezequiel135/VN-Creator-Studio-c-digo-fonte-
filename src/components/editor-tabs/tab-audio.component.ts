
import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { Scene } from '../../types';

@Component({
  selector: 'app-tab-audio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-4 h-full p-4">
        
        <!-- Music Selection -->
        <div class="bg-slate-950 p-4 rounded border border-slate-700 shadow-sm">
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider flex items-center gap-2">
                <span>🎵</span> Música de Fundo (Loop)
            </label>
            <div class="relative">
                <select [ngModel]="scene().musicId" (ngModelChange)="updateMusic($event)"
                        [disabled]="vnService.editorLanguage() !== 'default'"
                        class="w-full bg-slate-900 border border-slate-600 rounded text-sm text-white p-2.5 appearance-none focus:border-cyan-500 outline-none cursor-pointer">
                    <option [ngValue]="null">--- Usar Música Global ---</option>
                    @for(a of audioAssets(); track a.id) { <option [value]="a.id">{{a.name}}</option> }
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
            <p class="text-[9px] text-slate-500 mt-1 ml-1">Se "Usar Música Global", a música definida nas configurações do projeto tocará.</p>
        </div>

        <!-- SFX Selection -->
        <div class="bg-slate-950 p-4 rounded border border-slate-700 shadow-sm">
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider flex items-center gap-2">
                <span>🔊</span> Efeito Sonoro (Ao Entrar)
            </label>
            <div class="relative">
                <select [ngModel]="scene().soundId" (ngModelChange)="updateSound($event)"
                        [disabled]="vnService.editorLanguage() !== 'default'"
                        class="w-full bg-slate-900 border border-slate-600 rounded text-sm text-white p-2.5 appearance-none focus:border-cyan-500 outline-none cursor-pointer">
                    <option [ngValue]="null">--- Nenhum ---</option>
                    @for(a of audioAssets(); track a.id) { <option [value]="a.id">🔊 {{a.name}}</option> }
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
        </div>

        <!-- Voice Selection -->
        <div class="bg-slate-950 p-4 rounded border border-slate-700 shadow-sm">
            <div class="flex justify-between items-center mb-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span>🗣️</span> Dublagem / Voz (Personagem)
                </label>
                @if (vnService.editorLanguage() !== 'default') {
                    <span class="text-[9px] text-yellow-500 border border-yellow-800 bg-yellow-900/20 px-1.5 rounded">
                        Específico: {{vnService.editorLanguage()}}
                    </span>
                }
            </div>
            
            <div class="relative">
                <select [ngModel]="getVoice()" (ngModelChange)="updateVoice($event)"
                        class="w-full bg-slate-900 border border-slate-600 rounded text-sm text-white p-2.5 appearance-none focus:border-cyan-500 outline-none cursor-pointer">
                    <option [ngValue]="null">--- Sem Voz ---</option>
                    @for(a of audioAssets(); track a.id) { <option [value]="a.id">{{a.name}}</option> }
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
        </div>
        
        <!-- Narrator Selection (NEW) -->
        <div class="bg-slate-950 p-4 rounded border border-slate-700 shadow-sm">
            <div class="flex justify-between items-center mb-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span>🎙️</span> Áudio do Narrador (Voz de Fundo)
                </label>
                @if (vnService.editorLanguage() !== 'default') {
                    <span class="text-[9px] text-yellow-500 border border-yellow-800 bg-yellow-900/20 px-1.5 rounded">
                        Específico: {{vnService.editorLanguage()}}
                    </span>
                }
            </div>
            
            <div class="relative">
                <select [ngModel]="getNarrator()" (ngModelChange)="updateNarrator($event)"
                        class="w-full bg-slate-900 border border-slate-600 rounded text-sm text-white p-2.5 appearance-none focus:border-cyan-500 outline-none cursor-pointer">
                    <option [ngValue]="null">--- Sem Narrador ---</option>
                    @for(a of audioAssets(); track a.id) { <option [value]="a.id">{{a.name}}</option> }
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
        </div>
    </div>
  `
})
export class TabAudioComponent {
  vnService = inject(VnService);
  scene = input.required<Scene>();
  audioAssets = computed(() => this.vnService.assets().filter(a => a.type === 'audio'));

  updateMusic(id: string | null) { this.vnService.updateScene(this.scene().id, { musicId: id }); }
  updateSound(id: string | null) { this.vnService.updateScene(this.scene().id, { soundId: id }); }
  
  getVoice() { return this.vnService.getLocalizedVoice(this.scene()); }
  getNarrator() { return this.vnService.getLocalizedNarrator(this.scene()); }
  
  updateVoice(id: string | null) {
      const s = this.scene();
      const lang = this.vnService.editorLanguage();
      if (lang === 'default') this.vnService.updateScene(s.id, { voiceoverId: id });
      else {
          const t = s.translations || {};
          const lt = t[lang] || {};
          this.vnService.updateScene(s.id, { translations: { ...t, [lang]: { ...lt, voiceoverId: id } } });
      }
  }

  updateNarrator(id: string | null) {
      const s = this.scene();
      const lang = this.vnService.editorLanguage();
      if (lang === 'default') this.vnService.updateScene(s.id, { narratorId: id });
      else {
          const t = s.translations || {};
          const lt = t[lang] || {};
          this.vnService.updateScene(s.id, { translations: { ...t, [lang]: { ...lt, narratorId: id } } });
      }
  }
}
