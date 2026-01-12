
import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 flex items-center px-3 gap-3 justify-between shrink-0 z-30 shadow-sm relative">
       
       <!-- Left: Scene Name -->
       <div class="flex items-center gap-2 min-w-0 flex-1 md:flex-none">
           <div class="flex items-center bg-slate-800/50 rounded-full border border-slate-700/50 p-1 pl-3 overflow-hidden shadow-inner group focus-within:border-cyan-500/50 transition-colors w-full md:w-auto">
               <input type="text" 
                      [ngModel]="vnService.currentScene()?.name" 
                      (ngModelChange)="updateName($event)"
                      class="bg-transparent text-white text-sm focus:outline-none w-full md:w-40 placeholder-slate-500 font-bold"
                      placeholder="Nome da Cena">
               <button (click)="createLinked.emit()" 
                       class="w-7 h-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center ml-1 transition-transform active:scale-90 shadow-lg" 
                       title="Nova Cena Linkada">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
               </button>
           </div>
       </div>

       <!-- Right: Tools -->
       <div class="flex items-center gap-2 md:gap-3 shrink-0">
           
           <!-- Language Selector (Compact on Mobile) -->
           <div class="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 px-2 py-1.5 rounded-full">
               <span class="text-xs select-none">🌐</span>
               <select [ngModel]="vnService.editorLanguage()" (ngModelChange)="vnService.editorLanguage.set($event)"
                       class="bg-transparent text-xs text-slate-300 outline-none border-none font-medium cursor-pointer w-16 md:w-auto">
                   @for(l of vnService.settings().languages; track l.id) { <option [value]="l.id">{{ l.name }}</option> }
               </select>
           </div>
           
           <!-- Asset Buttons -->
           <button (click)="openDrawer.emit('background')" 
                   class="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-full border border-slate-600 flex items-center justify-center text-sm shadow-md transition-transform active:scale-95" 
                   title="Mudar Fundo">
               🖼️
           </button>
           <button (click)="openDrawer.emit('character')" 
                   class="w-9 h-9 bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 rounded-full border border-cyan-500/30 flex items-center justify-center text-sm text-white shadow-md shadow-cyan-900/20 transition-transform active:scale-95" 
                   title="Adicionar Personagem">
               👤
           </button>
           <button (click)="openDrawer.emit('audio')" 
                   class="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-600 rounded-full border border-purple-500/30 flex items-center justify-center text-sm text-white shadow-md shadow-purple-900/20 transition-transform active:scale-95" 
                   title="Adicionar Áudio">
               🎵
           </button>
       </div>
    </div>
  `
})
export class TopBarComponent {
  vnService = inject(VnService);
  createLinked = output<void>();
  openDrawer = output<'background'|'character'|'audio'>();

  updateName(n: string) { 
    if(this.vnService.currentScene()) {
        this.vnService.updateScene(this.vnService.currentScene()!.id, { name: n });
    }
  }
}
