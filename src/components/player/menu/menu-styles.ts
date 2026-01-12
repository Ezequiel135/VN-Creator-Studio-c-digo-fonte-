
import { Component, input, output, computed, inject, Directive, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuHistoryComponent } from './menu-history.component';
import { MenuSettingsComponent } from './menu-settings.component';
import { VnService } from '../../../services/vn.service';

// Shared logic mixin
@Directive()
export class BaseMenu {
    activeTab = input.required<'history'|'settings'|'save'>();
    tabChange = output<'history'|'settings'|'save'>();
    close = output<void>();
    returnTitle = output<void>();
    loadGame = output<string>();

    loc = input.required<any>();
    saves = input.required<any[]>(); // This comes from parent via getSlots(), which is now a promise in parent
    isTitle = input(false);
    
    vnService = inject(VnService); 
    
    shakeId = signal<number | null>(null);

    async saveSlot(id: number) { 
        if(!this.isTitle()) {
            await this.vnService.saveGameToSlot(id);
            // Refresh logic usually handled by parent refreshing 'saves'
        }
    }

    async loadSlot(id: number) { 
        const loadedSceneId = await this.vnService.loadGameFromSlot(id);
        if(loadedSceneId) {
            this.loadGame.emit(loadedSceneId);
            this.close.emit();
        } else {
            this.shakeId.set(id);
            setTimeout(() => this.shakeId.set(null), 500);
        }
    }

    newDate(ts: number) { return new Date(ts); }
}

// 1. MODERN
@Component({
  selector: 'app-menu-modern',
  standalone: true, imports: [CommonModule, MenuHistoryComponent, MenuSettingsComponent],
  template: `
    <div class="bg-slate-900/95 backdrop-blur-xl w-full max-w-5xl h-[80vh] rounded-3xl border border-white/10 shadow-2xl flex overflow-hidden relative font-sans">
        <div class="w-16 md:w-64 bg-slate-950/50 border-r border-white/5 flex flex-col shrink-0 p-3 gap-2">
            <div class="p-4 hidden md:block text-white font-black text-2xl tracking-tight mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{{ loc().title }}</div>
            <button *ngFor="let t of ['history','settings','save']" (click)="tabChange.emit($any(t))" 
                class="p-4 rounded-2xl flex items-center gap-4 transition-all duration-200 group relative overflow-hidden"
                [class.bg-white_10]="activeTab()===t" 
                [class.text-white]="activeTab()===t" 
                [class.text-slate-500]="activeTab()!==t">
                <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" *ngIf="activeTab()!==t"></div>
                <span class="text-xl relative z-10">{{ t==='history'?'📜':t==='settings'?'⚙️':'💾' }}</span>
                <span class="capitalize text-sm font-bold tracking-wide relative z-10 hidden md:block">{{ t === 'save' && isTitle() ? loc().loadLabel : (loc()[t+'Label'] || t) }}</span>
                <div *ngIf="activeTab()===t" class="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-cyan-400 rounded-r-full"></div>
            </button>
            <div class="flex-1"></div>
            <button (click)="returnTitle.emit()" class="p-4 text-red-400 hover:bg-red-950/30 rounded-2xl flex gap-3 items-center text-sm font-bold transition-colors">
                <span>🏠</span> <span class="hidden md:inline">Sair</span>
            </button>
        </div>
        <div class="flex-1 bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden relative">
             <ng-container *ngTemplateOutlet="content"></ng-container>
             <button (click)="close.emit()" class="absolute top-6 right-6 w-10 h-10 bg-black/40 hover:bg-white/10 rounded-full text-white flex items-center justify-center transition-colors z-50 backdrop-blur">✕</button>
        </div>
    </div>
    <ng-template #content>
        @if(activeTab()==='history'){<app-menu-history></app-menu-history>}
        @if(activeTab()==='settings'){<app-menu-settings></app-menu-settings>}
        @if(activeTab()==='save'){ 
            <div class="p-8 h-full overflow-y-auto custom-scrollbar">
                <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span class="text-cyan-400">{{ isTitle() ? loc().loadLabel : loc().saveLabel }}</span>
                    <div class="h-px flex-1 bg-white/10"></div>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div *ngFor="let s of saves(); let i=index" 
                          (click)="isTitle() ? loadSlot(i+1) : saveSlot(i+1)" 
                          [class.animate-shake]="shakeId() === i+1"
                          class="group relative aspect-video rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden flex flex-col hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                         <div class="flex-1 p-5 relative z-10 flex flex-col justify-between">
                             <div class="flex justify-between items-start">
                                 <span class="text-xs font-bold px-2 py-1 rounded bg-black/40 text-cyan-400 border border-cyan-500/20">SLOT {{i+1}}</span>
                                 <span class="text-2xl opacity-50 group-hover:scale-110 transition-transform">{{ s ? '📂' : '💾' }}</span>
                             </div>
                             <div>
                                 <div class="font-bold text-white text-lg truncate">{{ s ? s.sceneName : 'Slot Vazio' }}</div>
                                 <div class="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                    @if(s) { <span>{{ newDate(s.timestamp).toLocaleDateString() }}</span> } @else { <span>--/--/--</span> }
                                 </div>
                             </div>
                         </div>
                         <div *ngIf="!s" class="absolute inset-0 opacity-10 bg-[url('https://transparent-textures.patterns.velomo.de/subtle_dots.png')]"></div>
                         <div *ngIf="s" class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                     </div>
                </div>
            </div> 
        }
    </ng-template>
    <style>.animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; } @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }</style>
  `
})
export class MenuModernComponent extends BaseMenu {}

// 2. SIDEBAR
@Component({
  selector: 'app-menu-sidebar',
  standalone: true, imports: [CommonModule, MenuHistoryComponent, MenuSettingsComponent],
  template: `
    <div class="absolute right-0 top-0 bottom-0 w-full md:w-[450px] bg-white text-slate-900 shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col animate-slide-in-from-right font-sans">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
            <h2 class="font-black text-xl uppercase tracking-widest text-slate-800">{{ loc().title }}</h2>
            <button (click)="close.emit()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-black transition-colors">✕</button>
        </div>
        <div class="flex border-b border-slate-100 px-6 gap-6">
             <button *ngFor="let t of ['history','settings','save']" (click)="tabChange.emit($any(t))" 
                class="py-4 text-xs font-bold uppercase border-b-2 transition-colors tracking-widest"
                [class.border-black]="activeTab()===t" 
                [class.text-black]="activeTab()===t" 
                [class.border-transparent]="activeTab()!==t" 
                [class.text-slate-400]="activeTab()!==t">
                {{ t === 'save' && isTitle() ? loc().loadLabel : (loc()[t+'Label'] || t) }}
            </button>
        </div>
        <div class="flex-1 overflow-hidden bg-slate-50 relative">
             @if(activeTab()==='history'){<div class="p-6 h-full"><app-menu-history></app-menu-history></div>}
             @if(activeTab()==='settings'){<app-menu-settings></app-menu-settings>}
             @if(activeTab()==='save'){ 
                 <div class="p-6 space-y-3 h-full overflow-y-auto">
                     <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Selecione um Arquivo</div>
                     <div *ngFor="let s of saves(); let i=index" 
                          (click)="isTitle() ? loadSlot(i+1) : saveSlot(i+1)" 
                          [class.animate-shake]="shakeId() === i+1"
                          class="bg-white p-5 shadow-sm border-l-4 border-slate-200 rounded-r-lg hover:shadow-md hover:border-black transition-all cursor-pointer group relative overflow-hidden">
                         <div class="flex justify-between items-center mb-2">
                             <span class="text-[10px] font-black uppercase text-slate-400 group-hover:text-black transition-colors">Arquivo {{ i + 1 }}</span>
                             <span *ngIf="s" class="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">SALVO</span>
                         </div>
                         <div class="font-bold text-lg text-slate-800">{{ s ? s.sceneName : 'Vazio' }}</div>
                         <div class="text-xs text-slate-500 mt-1">{{ s ? 'Jogador: ' + s.playerName : 'Toque para salvar...' }}</div>
                         <div *ngIf="s" class="absolute bottom-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><span class="text-4xl">📂</span></div>
                     </div>
                 </div>
             }
        </div>
        <div class="p-4 border-t border-slate-200 bg-white">
            <button (click)="returnTitle.emit()" class="w-full py-4 bg-slate-900 text-white font-bold uppercase text-xs tracking-widest rounded hover:bg-black transition-colors">{{ loc().returnTitleBtn }}</button>
        </div>
    </div>
  `
})
export class MenuSidebarComponent extends BaseMenu {}

// 3. MINIMAL
@Component({
  selector: 'app-menu-minimal',
  standalone: true, imports: [CommonModule, MenuHistoryComponent, MenuSettingsComponent],
  template: `
    <div class="bg-black/90 backdrop-blur-md rounded-none p-12 w-full max-w-3xl text-white border border-white/20 shadow-2xl font-light">
        <div class="flex justify-between items-end border-b border-white/20 pb-4 mb-8">
            <div class="flex gap-8 text-sm tracking-[0.2em] uppercase">
                <button *ngFor="let t of ['history','settings','save']" (click)="tabChange.emit($any(t))" 
                    class="hover:text-cyan-400 transition-colors relative" [class.text-cyan-400]="activeTab()===t">
                    {{ t === 'save' && isTitle() ? loc().loadLabel : (loc()[t+'Label'] || t) }}
                    <span *ngIf="activeTab()===t" class="absolute -bottom-[17px] left-0 right-0 h-px bg-cyan-400"></span>
                </button>
            </div>
            <button (click)="close.emit()" class="text-xs uppercase tracking-widest hover:text-red-400">{{ loc().closeBtn }} [X]</button>
        </div>
        <div class="h-[400px] overflow-y-auto custom-scrollbar pr-4">
             @if(activeTab()==='history'){<app-menu-history></app-menu-history>}
             @if(activeTab()==='settings'){<app-menu-settings></app-menu-settings>}
             @if(activeTab()==='save'){ 
                 <div class="flex flex-col gap-1">
                     <button *ngFor="let s of saves(); let i=index" 
                             (click)="isTitle() ? loadSlot(i+1) : saveSlot(i+1)" 
                             [class.animate-shake]="shakeId() === i+1"
                             class="group flex items-center justify-between p-4 hover:bg-white/5 border-l border-white/10 hover:border-cyan-400 transition-all text-left">
                         <div class="flex items-center gap-6">
                             <span class="text-xs font-mono opacity-50">0{{i+1}}</span>
                             <div>
                                 <div class="text-base tracking-wide group-hover:text-cyan-200 transition-colors">{{ s ? s.sceneName : 'EMPTY SLOT' }}</div>
                                 <div class="text-[10px] uppercase tracking-widest opacity-40 mt-1">{{ s ? newDate(s.timestamp).toLocaleDateString() : '---' }}</div>
                             </div>
                         </div>
                         <div class="opacity-0 group-hover:opacity-100 text-xs tracking-widest uppercase text-cyan-400 transition-opacity">{{ s ? (isTitle() ? 'LOAD >' : 'OVERWRITE >') : 'SAVE >' }}</div>
                     </button>
                 </div>
             }
        </div>
        <div class="mt-8 pt-4 border-t border-white/10 flex justify-end">
            <button (click)="returnTitle.emit()" class="text-[10px] text-red-400 hover:text-red-300 tracking-[0.3em] uppercase">{{ loc().returnTitleBtn }}</button>
        </div>
    </div>
  `
})
export class MenuMinimalComponent extends BaseMenu {}

// 4. GRID
@Component({
  selector: 'app-menu-grid',
  standalone: true, imports: [CommonModule, MenuHistoryComponent, MenuSettingsComponent],
  template: `
    <div class="bg-slate-800 w-full max-w-5xl h-[90vh] rounded-[3rem] p-8 flex flex-col gap-6 border-[8px] border-slate-700 shadow-[0_0_0_10px_#1e293b,0_20px_50px_rgba(0,0,0,0.5)] font-sans">
        <div class="flex gap-4 overflow-x-auto pb-2 shrink-0 justify-center">
            <button *ngFor="let t of ['history','settings','save']" (click)="tabChange.emit($any(t))" 
                class="w-32 h-24 rounded-2xl bg-slate-900 hover:bg-slate-950 flex flex-col items-center justify-center gap-2 border-b-8 transition-all active:border-b-0 active:translate-y-2"
                [class.border-yellow-500]="activeTab()===t" [class.text-yellow-500]="activeTab()===t" 
                [class.border-slate-950]="activeTab()!==t" [class.text-slate-500]="activeTab()!==t">
                <span class="text-3xl filter drop-shadow-md">{{t==='history'?'📜':t==='settings'?'⚙️':'💾'}}</span>
                <span class="text-xs font-black uppercase tracking-wider">{{ t === 'save' && isTitle() ? loc().loadLabel : (loc()[t+'Label'] || t) }}</span>
            </button>
            <div class="w-px bg-slate-700 mx-2"></div>
            <button (click)="close.emit()" class="w-24 h-24 rounded-full bg-red-500 hover:bg-red-400 text-white flex flex-col items-center justify-center gap-1 border-b-8 border-red-700 active:border-b-0 active:translate-y-2 transition-all shadow-lg">
                <span class="text-2xl font-black">B</span>
                <span class="text-[10px] font-bold">{{ loc().closeBtn }}</span>
            </button>
        </div>
        <div class="flex-1 bg-black rounded-3xl p-1 overflow-hidden border-4 border-slate-900 shadow-inner relative">
             <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
             <div class="w-full h-full bg-slate-900/50 rounded-[1.2rem] overflow-hidden relative z-10 p-6">
                 @if(activeTab()==='history'){<app-menu-history></app-menu-history>}
                 @if(activeTab()==='settings'){<app-menu-settings></app-menu-settings>}
                 @if(activeTab()==='save'){ 
                     <div class="grid grid-cols-2 md:grid-cols-3 gap-6 h-full content-center">
                         <button *ngFor="let s of saves(); let i=index" (click)="isTitle() ? loadSlot(i+1) : saveSlot(i+1)" [class.animate-shake]="shakeId() === i+1" class="aspect-[4/3] bg-slate-800 rounded-xl border-4 border-slate-700 hover:border-yellow-400 hover:bg-slate-700 flex flex-col items-center justify-center gap-3 transition-all group relative overflow-hidden">
                             <div class="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 px-3 py-1 rounded-b-lg border border-t-0 border-slate-700 text-[10px] font-bold text-slate-400">MEMORY CARD {{i+1}}</div>
                             <div class="text-5xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{{s ? '👾' : '➖'}}</div>
                             <div class="text-center">
                                 <div class="font-black text-white text-sm uppercase px-2 py-1 bg-black/30 rounded">{{s ? s.sceneName : 'NO DATA'}}</div>
                                 <div class="text-[10px] text-slate-400 mt-1 font-mono">{{s ? newDate(s.timestamp).toLocaleDateString() : 'FREE SPACE'}}</div>
                             </div>
                         </button>
                     </div>
                 }
             </div>
        </div>
        <button (click)="returnTitle.emit()" class="text-center text-slate-500 text-xs font-bold uppercase hover:text-white tracking-widest">{{ loc().returnTitleBtn }}</button>
    </div>
  `
})
export class MenuGridComponent extends BaseMenu {}

// 5. BOOK
@Component({
  selector: 'app-menu-book',
  standalone: true, imports: [CommonModule, MenuHistoryComponent, MenuSettingsComponent],
  template: `
    <div class="bg-[#fdfbf7] text-[#4a4036] w-full max-w-4xl h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex rounded-r-lg overflow-hidden relative font-serif" style="background-image: url('https://www.transparenttextures.com/patterns/paper.png');">
        <div class="w-12 bg-[#3e2b20] h-full shadow-inner flex flex-col items-center justify-center border-r border-[#2a1d15] relative z-20">
            <div class="text-[#c5afa0] rotate-90 whitespace-nowrap font-bold tracking-[0.5em] text-xs uppercase">Journal of Memories</div>
        </div>
        <div class="flex-1 p-8 md:p-12 h-full flex flex-col relative z-10">
            <div class="flex items-center justify-between border-b-2 border-[#4a4036] pb-4 mb-8">
                <h2 class="text-4xl font-bold tracking-tight italic">{{ loc().title }}</h2>
                <div class="text-3xl font-serif italic text-[#8c7b6c]">Cap. {{ activeTab() === 'save' ? 'III' : (activeTab() === 'settings' ? 'II' : 'I') }}</div>
            </div>
            <div class="flex gap-8 mb-8 text-sm font-bold tracking-widest uppercase">
                <button *ngFor="let t of ['history','settings','save']" (click)="tabChange.emit($any(t))" class="hover:text-red-800 transition-colors relative group" [class.text-red-900]="activeTab()===t">
                   <span class="group-hover:mr-2 transition-all">❧</span> {{ t === 'save' && isTitle() ? loc().loadLabel : (loc()[t+'Label'] || t) }}
                   <span *ngIf="activeTab()===t" class="absolute -bottom-1 left-0 w-full h-px bg-red-900"></span>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto pr-4 custom-scrollbar-sepia">
                 @if(activeTab()==='history'){<div class="leading-loose text-lg"><app-menu-history></app-menu-history></div>}
                 @if(activeTab()==='settings'){<app-menu-settings></app-menu-settings>}
                 @if(activeTab()==='save'){ 
                     <div class="grid grid-cols-1 gap-6">
                         <div *ngFor="let s of saves(); let i=index" (click)="isTitle() ? loadSlot(i+1) : saveSlot(i+1)" [class.animate-shake]="shakeId() === i+1" class="border border-[#dcd6cc] bg-[#fdfbf7] p-4 hover:bg-[#f3eee4] hover:shadow-md transition-all cursor-pointer relative group">
                             <div class="absolute -left-3 top-4 w-6 h-6 bg-[#e5e0d8] rounded-full border border-[#dcd6cc] flex items-center justify-center text-xs font-bold text-[#4a4036] group-hover:bg-red-900 group-hover:text-white transition-colors">{{i+1}}</div>
                             <div class="ml-4">
                                 @if(s) {
                                     <div class="font-bold text-xl mb-1 flex justify-between items-baseline"><span class="italic">{{ s.sceneName }}</span><span class="text-xs font-sans text-[#8c7b6c] font-normal uppercase tracking-wider">{{ newDate(s.timestamp).toLocaleDateString() }}</span></div>
                                     <p class="text-sm opacity-80 leading-relaxed font-serif">"Onde {{ s.playerName }} parou sua jornada..."</p>
                                 } @else {
                                     <div class="flex flex-col items-center justify-center py-4 text-[#8c7b6c]/50"><span class="text-2xl mb-1">✎</span><span class="italic text-sm">Página em branco</span></div>
                                 }
                             </div>
                         </div>
                     </div>
                 }
            </div>
            <div class="mt-8 pt-6 border-t border-[#e5e0d8] flex justify-between items-center text-sm font-bold text-[#4a4036]/70">
                <button (click)="returnTitle.emit()" class="hover:text-red-900 hover:underline">{{ loc().returnTitleBtn }}</button>
                <button (click)="close.emit()" class="hover:text-red-900 hover:underline">{{ loc().closeBtn }} ➜</button>
            </div>
        </div>
        <div class="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none"></div>
    </div>
  `
})
export class MenuBookComponent extends BaseMenu {}
