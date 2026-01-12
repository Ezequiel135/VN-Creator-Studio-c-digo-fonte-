
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { Language } from '../../types';

@Component({
  selector: 'app-settings-languages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 animate-fade-in">
        <div class="space-y-2">
            @for(lang of vnService.settings().languages; track lang.id) {
                <div class="bg-slate-900 p-3 rounded-lg border border-slate-700 group hover:border-slate-500 transition-colors min-h-[60px] flex items-center">
                    @if (editingLangId() === lang.id) {
                        <div class="flex items-center gap-2 w-full animate-in fade-in">
                            <span class="text-xs text-slate-500 font-mono select-none">{{ lang.id }}:</span>
                            <input type="text" [(ngModel)]="tempEditLangName" 
                                   class="flex-1 bg-slate-800 border border-slate-500 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                                   (keyup.enter)="confirmEditLang()" placeholder="Nome do Idioma" autofocus>
                            <div class="flex gap-1">
                                <button (click)="confirmEditLang()" class="p-2 bg-green-600 hover:bg-green-500 text-white rounded shadow">✓</button>
                                <button (click)="cancelEditLang()" class="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded shadow">✕</button>
                            </div>
                        </div>
                    } @else {
                        <div class="flex-1 min-w-0 mr-4">
                            <div class="flex items-center gap-2">
                                <div class="font-bold text-white text-sm truncate cursor-pointer hover:text-cyan-400 flex items-center gap-2" (click)="startEditLang(lang)">
                                    {{ lang.name }}
                                    <span class="text-slate-600 opacity-50 text-[10px]">✏️</span>
                                </div>
                            </div>
                            <div class="text-[10px] text-slate-500">{{ lang.id }} {{ lang.isDefault ? '(Padrão)' : '' }}</div>
                        </div>
                        <div class="flex gap-2 shrink-0">
                            <button (click)="selectLanguage(lang.id)" class="px-3 py-1.5 bg-slate-700 hover:bg-cyan-600 rounded text-xs text-white transition-colors font-bold border border-slate-600 hover:border-cyan-500">
                                {{ lang.id === vnService.editorLanguage() ? 'Selecionado' : 'Traduzir' }}
                            </button>
                            @if(!lang.isDefault) {
                                <button (click)="removeLanguage(lang.id)" class="px-2 text-red-400 hover:text-red-300 border border-red-900/30 rounded hover:bg-red-900/20">✕</button>
                            }
                        </div>
                    }
                </div>
            }
        </div>
        <div class="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 border-dashed">
            <h4 class="text-xs font-bold text-slate-400 uppercase mb-2">Adicionar Novo Idioma</h4>
            <div class="flex gap-2">
                <input type="text" [(ngModel)]="tempLangName" placeholder="Nome (Ex: English)" class="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-white outline-none">
                <input type="text" [(ngModel)]="tempLangId" placeholder="ID (Ex: en-US)" class="w-24 bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-white outline-none">
                <button (click)="addNewLanguage()" [disabled]="!tempLangName || !tempLangId" class="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-3 py-1.5 rounded font-bold text-sm">Add</button>
            </div>
        </div>
    </div>
  `
})
export class SettingsLanguagesComponent {
  vnService = inject(VnService);

  tempLangName = ''; 
  tempLangId = '';
  editingLangId = signal<string | null>(null);
  tempEditLangName = '';

  addNewLanguage() {
      if(this.tempLangName && this.tempLangId) {
          this.vnService.addLanguage(this.tempLangId, this.tempLangName);
          this.tempLangName = ''; this.tempLangId = '';
      }
  }

  removeLanguage(id: string) { if(confirm('Remover este idioma?')) this.vnService.removeLanguage(id); }
  selectLanguage(id: string) { this.vnService.editorLanguage.set(id); }

  startEditLang(lang: Language) {
      this.editingLangId.set(lang.id);
      this.tempEditLangName = lang.name;
  }

  confirmEditLang() {
      if (this.editingLangId() && this.tempEditLangName.trim()) {
          this.vnService.updateLanguageName(this.editingLangId()!, this.tempEditLangName.trim());
          this.editingLangId.set(null);
      }
  }

  cancelEditLang() { this.editingLangId.set(null); }
}
