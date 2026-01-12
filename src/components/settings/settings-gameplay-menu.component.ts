
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';

@Component({
  selector: 'app-settings-gameplay-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
     <div class="space-y-4 animate-fade-in">
         <div class="bg-cyan-900/20 p-3 rounded border border-cyan-800/50 mb-2">
            <label class="block text-xs font-bold text-cyan-400 uppercase mb-1">Estilo do Menu</label>
            <select [ngModel]="vnService.settings().gameplayMenu.style" (ngModelChange)="updateMenuSetting('style', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm">
                <option value="modern">Moderno (Abas Esquerda)</option>
                <option value="sidebar">Barra Lateral (Overlay)</option>
                <option value="minimal">Minimalista (Transparente)</option>
                <option value="grid">Grade (Ícones Grandes)</option>
                <option value="book">Livro / Diário</option>
            </select>
         </div>
         
         <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase">Título Menu</label>
                <input [ngModel]="getLocMenu('title')" (ngModelChange)="updLocMenu('title', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs">
             </div>
             <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase">Btn Fechar</label>
                <input [ngModel]="getLocMenu('closeBtn')" (ngModelChange)="updLocMenu('closeBtn', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs">
             </div>
             <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase">Label Música</label>
                <input [ngModel]="getLocMenu('musicLabel')" (ngModelChange)="updLocMenu('musicLabel', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs">
             </div>
             <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase">Label Voz</label>
                <input [ngModel]="getLocMenu('voiceLabel')" (ngModelChange)="updLocMenu('voiceLabel', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs">
             </div>
             <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase">Label Histórico</label>
                <input [ngModel]="getLocMenu('historyLabel')" (ngModelChange)="updLocMenu('historyLabel', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs">
             </div>
             <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase">Label Salvar</label>
                <input [ngModel]="getLocMenu('saveLabel')" (ngModelChange)="updLocMenu('saveLabel', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs">
             </div>
         </div>
     </div>
  `
})
export class SettingsGameplayMenuComponent {
  vnService = inject(VnService);

  getLocMenu(key: string) { return this.vnService.getLocalizedMenuSetting(key); }
  updLocMenu(key: string, val: string) { this.vnService.updateLocalizedMenuSetting(key, val); }
  updateMenuSetting(key: string, val: string) { this.vnService.updateLocalizedMenuSetting(key as any, val); }
}
