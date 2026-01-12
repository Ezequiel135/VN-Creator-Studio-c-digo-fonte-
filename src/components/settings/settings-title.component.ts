
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';

@Component({
  selector: 'app-settings-title',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 animate-fade-in">
       <div class="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-700">
          <span class="text-sm font-bold ml-1">Habilitar Tela Inicial</span>
          <!-- Mudança aqui: div -> label -->
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" [ngModel]="vnService.settings().titleScreen.enabled" (ngModelChange)="updateNested('titleScreen', 'enabled', $event)" class="sr-only peer">
            <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:bg-cyan-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
       </div>

       @if (vnService.settings().titleScreen.enabled) {
           <div class="bg-cyan-900/20 p-3 rounded border border-cyan-800/50 mb-2">
               <label class="block text-xs font-bold text-cyan-400 uppercase mb-1">Layout / Estilo</label>
               <select [ngModel]="vnService.settings().titleScreen.layout" (ngModelChange)="updateNested('titleScreen', 'layout', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm">
                   <option value="modern">Moderno (Padrão)</option>
                   <option value="classic">Clássico (Novel Box)</option>
                   <option value="cinematic">Cinemático (Minimalista)</option>
                   <option value="retro">Retro (Pixel Art)</option>
                   <option value="split">Split (Divisão Lateral)</option>
               </select>
           </div>

           <div>
              <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Texto do Título</label>
              <input [ngModel]="getLocTitle('title')" (ngModelChange)="updLocTitle('title', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm">
           </div>
           <div>
              <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Subtítulo</label>
              <input [ngModel]="getLocTitle('subtitle')" (ngModelChange)="updLocTitle('subtitle', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm">
           </div>
           
           <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <input [ngModel]="getLocTitle('buttonText')" (ngModelChange)="updLocTitle('buttonText', $event)" class="bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm" placeholder="Btn Iniciar">
               <input [ngModel]="getLocTitle('loadButtonText')" (ngModelChange)="updLocTitle('loadButtonText', $event)" class="bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm" placeholder="Btn Carregar">
               <input [ngModel]="getLocTitle('achievementsButtonText')" (ngModelChange)="updLocTitle('achievementsButtonText', $event)" class="bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm" placeholder="Btn Conquistas">
               <input [ngModel]="getLocTitle('termsButtonText')" (ngModelChange)="updLocTitle('termsButtonText', $event)" class="bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm" placeholder="Btn Termos">
           </div>

           <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Fundo</label>
                  <select [ngModel]="vnService.settings().titleScreen.backgroundId" (ngModelChange)="updateNested('titleScreen', 'backgroundId', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm">
                     <option [ngValue]="null">--- Nenhum ---</option>
                     @for(a of vnService.assets(); track a.id) { @if(a.type === 'background') { <option [value]="a.id">{{a.name}}</option> } }
                  </select>
               </div>
               <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Música</label>
                  <select [ngModel]="vnService.settings().titleScreen.musicId" (ngModelChange)="updateNested('titleScreen', 'musicId', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm">
                     <option [ngValue]="null">--- Silêncio ---</option>
                     @for(a of vnService.assets(); track a.id) { @if(a.type === 'audio') { <option [value]="a.id">🎵 {{a.name}}</option> } }
                  </select>
               </div>
           </div>
       }
    </div>
  `
})
export class SettingsTitleComponent {
  vnService = inject(VnService);

  getLocTitle(key: string) { return this.vnService.getLocalizedTitleSetting(key); }
  updLocTitle(key: string, val: string) { this.vnService.updateLocalizedTitleSetting(key, val); }

  updateNested(section: string, key: string, val: any) {
      // Direct access via service to avoid duplication, though slightly generic key access
      const s = this.vnService.settings() as any;
      this.vnService.settings.update(curr => ({
          ...curr,
          [section]: { ...s[section], [key]: val }
      }));
  }
}
