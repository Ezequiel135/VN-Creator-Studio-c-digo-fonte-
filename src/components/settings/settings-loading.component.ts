
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';

@Component({
  selector: 'app-settings-loading',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
     <div class="space-y-4 animate-fade-in">
         <div>
             <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Estilo de Carregamento</label>
             <select [ngModel]="vnService.settings().loadingScreen.style" (ngModelChange)="updateNested('loadingScreen', 'style', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm">
                 <option value="standard">Padrão (3 Pontos)</option>
                 <option value="bar">Barra de Progresso</option>
                 <option value="spinner">Spinner Moderno</option>
                 <option value="terminal">Terminal Retro</option>
                 <option value="minimal">Minimalista</option>
             </select>
         </div>
         <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Texto de Carregamento</label>
            <input [ngModel]="getLocLoading('loadingText')" (ngModelChange)="updLocLoading('loadingText', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm">
         </div>
         <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div>
                <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Cor de Fundo</label>
                <input type="color" [ngModel]="vnService.settings().loadingScreen.backgroundColor" (ngModelChange)="updateNested('loadingScreen', 'backgroundColor', $event)" class="w-full h-10 bg-slate-900 border border-slate-600 rounded cursor-pointer">
             </div>
             <div>
                <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Cor do Texto</label>
                <input type="color" [ngModel]="vnService.settings().loadingScreen.textColor" (ngModelChange)="updateNested('loadingScreen', 'textColor', $event)" class="w-full h-10 bg-slate-900 border border-slate-600 rounded cursor-pointer">
             </div>
         </div>
     </div>
  `
})
export class SettingsLoadingComponent {
  vnService = inject(VnService);

  getLocLoading(key: string) { return this.vnService.getLocalizedLoadingSetting(key); }
  updLocLoading(key: string, val: string) { this.vnService.updateLocalizedLoadingSetting(key, val); }

  updateNested(section: string, key: string, val: any) {
      const s = this.vnService.settings() as any;
      this.vnService.settings.update(curr => ({
          ...curr,
          [section]: { ...s[section], [key]: val }
      }));
  }
}
