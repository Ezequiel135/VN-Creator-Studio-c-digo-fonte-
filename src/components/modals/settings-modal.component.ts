
import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VnService } from '../../services/vn.service';

// Import newly created sub-components
import { SettingsGeneralComponent } from '../settings/settings-general.component';
import { SettingsLanguagesComponent } from '../settings/settings-languages.component';
import { SettingsTitleComponent } from '../settings/settings-title.component';
import { SettingsLoadingComponent } from '../settings/settings-loading.component';
import { SettingsEndingComponent } from '../settings/settings-ending.component';
import { SettingsGameplayMenuComponent } from '../settings/settings-gameplay-menu.component';
import { SettingsDialogueComponent } from '../settings/settings-dialogue.component';
import { SettingsAchievementsComponent } from '../settings/settings-achievements.component';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [
      CommonModule, 
      SettingsGeneralComponent, 
      SettingsLanguagesComponent,
      SettingsTitleComponent,
      SettingsLoadingComponent,
      SettingsEndingComponent,
      SettingsGameplayMenuComponent,
      SettingsDialogueComponent,
      SettingsAchievementsComponent
  ],
  template: `
    <div class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
       <div class="bg-slate-800 w-full max-w-lg md:rounded-xl h-full md:h-auto md:max-h-[90vh] border-0 md:border border-slate-600 shadow-2xl flex flex-col overflow-hidden">
          
          <div class="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center shrink-0">
              <h2 class="text-lg font-bold flex items-center gap-2 text-white">
                 ⚙️ Configurações
                 @if(vnService.editorLanguage() !== 'default') {
                     <span class="text-[10px] text-yellow-500 border border-yellow-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider hidden sm:inline">
                         {{ getLangName() }}
                     </span>
                 }
              </h2>
              <button (click)="close.emit()" class="text-slate-400 hover:text-white w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-slate-700 transition-colors border border-white/10">✕</button>
          </div>

          <!-- Tabs -->
          <div class="flex gap-0 border-b border-slate-700 bg-slate-900/50 overflow-x-auto no-scrollbar shrink-0">
             @for(tab of tabs; track tab.id) {
                 <button (click)="activeTab.set(tab.id)" 
                         class="px-4 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all whitespace-nowrap hover:bg-slate-800"
                         [class.border-cyan-500]="activeTab() === tab.id"
                         [class.text-cyan-400]="activeTab() === tab.id"
                         [class.border-transparent]="activeTab() !== tab.id"
                         [class.text-slate-500]="activeTab() !== tab.id">
                     {{ tab.label }}
                 </button>
             }
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar p-5 bg-slate-800 pb-20 md:pb-5">
             
             @switch (activeTab()) {
                 @case ('general') { <app-settings-general (openPassword)="openPassword.emit()"></app-settings-general> }
                 @case ('dialogue') { <app-settings-dialogue></app-settings-dialogue> }
                 @case ('achievements') { <app-settings-achievements></app-settings-achievements> }
                 @case ('languages') { <app-settings-languages></app-settings-languages> }
                 @case ('title') { <app-settings-title></app-settings-title> }
                 @case ('loading') { <app-settings-loading></app-settings-loading> }
                 @case ('ending') { <app-settings-ending></app-settings-ending> }
                 @case ('menu') { <app-settings-gameplay-menu></app-settings-gameplay-menu> }
             }
             
          </div>

          <!-- Footer Mobile Close Button -->
          <div class="p-4 border-t border-slate-700 bg-slate-900 md:hidden shrink-0">
              <button (click)="close.emit()" class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg uppercase tracking-wider text-sm">
                  Fechar Opções
              </button>
          </div>
       </div>
    </div>
  `
})
export class SettingsModalComponent {
  vnService = inject(VnService);
  close = output<void>();
  openPassword = output<void>();

  activeTab = signal<'general'|'dialogue'|'achievements'|'languages'|'title'|'loading'|'ending'|'menu'>('general');
  
  tabs: { id: any, label: string }[] = [
      { id: 'general', label: 'Geral' },
      { id: 'dialogue', label: 'Texto' },
      { id: 'achievements', label: 'Conquistas' },
      { id: 'languages', label: 'Idiomas' },
      { id: 'title', label: 'Título' },
      { id: 'loading', label: 'Load' },
      { id: 'ending', label: 'Final' },
      { id: 'menu', label: 'Menu' }
  ];

  getLangName() { return this.vnService.settings().languages.find(l => l.id === this.vnService.editorLanguage())?.name || ''; }
}
