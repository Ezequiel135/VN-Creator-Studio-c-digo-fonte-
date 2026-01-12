
import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';

@Component({
  selector: 'app-settings-general',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 animate-fade-in">
       <div>
          <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Plataforma Alvo (Tela)</label>
          <select [ngModel]="vnService.settings().targetPlatform" (ngModelChange)="updateSetting('targetPlatform', $event)"
                  class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors">
             <option value="mobile">Mobile (Retrato 9:16)</option>
             <option value="pc">PC (Widescreen 16:9)</option>
             <option value="responsive">Responsivo (Preenchimento Total)</option>
          </select>
          <p class="text-[10px] text-slate-500 mt-1">Define a proporção da área de visualização do jogo.</p>
       </div>

       <div>
          <label class="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
              <span>🎵</span> Música Global (BGM)
          </label>
          <select [ngModel]="vnService.settings().globalMusicId" (ngModelChange)="updateSetting('globalMusicId', $event)"
                  class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors">
             <option [ngValue]="null">--- Nenhuma ---</option>
             @for(a of vnService.assets(); track a.id) { @if(a.type === 'audio') { <option [value]="a.id">🎵 {{a.name}}</option> } }
          </select>
          <p class="text-[10px] text-slate-500 mt-1">Esta música tocará em loop durante todo o jogo, a menos que uma cena tenha uma música específica.</p>
       </div>
       
       <div>
           <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Estilo dos Termos de Uso</label>
           <select [ngModel]="vnService.settings().termsStyle" (ngModelChange)="updateSetting('termsStyle', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm mb-3">
               <option value="standard">Padrão (Modal Simples)</option>
               <option value="paper">Papel / Carta</option>
               <option value="terminal">Terminal Hacker</option>
               <option value="card">Cartão Moderno</option>
               <option value="fullscreen">Tela Cheia</option>
           </select>

           <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Texto dos Termos de Uso</label>
           <textarea [ngModel]="vnService.settings().termsOfUse"
                     (ngModelChange)="updateSetting('termsOfUse', $event)"
                     class="w-full h-32 bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm resize-y custom-scrollbar font-mono placeholder-slate-600"
                     placeholder="Escreva os termos aqui..."></textarea>
       </div>

       <div class="p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg flex gap-3 items-start">
           <span class="text-lg">🔐</span>
           <div>
               <h4 class="text-xs font-bold text-blue-300 uppercase">Senhas e Segurança</h4>
               <p class="text-[10px] text-blue-200/70 mb-2">Configure senhas para proteger a edição ou execução do seu projeto.</p>
               <button (click)="openPassword.emit()" class="text-[10px] bg-blue-800 hover:bg-blue-700 text-white px-2 py-1 rounded">Gerenciar Senhas</button>
           </div>
       </div>
    </div>
  `
})
export class SettingsGeneralComponent {
  vnService = inject(VnService);
  openPassword = output<void>();

  updateSetting(key: any, val: any) {
      this.vnService.settings.update(s => ({ ...s, [key]: val }));
  }
}
