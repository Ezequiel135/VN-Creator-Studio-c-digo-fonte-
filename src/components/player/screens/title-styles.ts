
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsTranslation } from '../../../types';

// BASE COMPONENT INTERFACE
export interface TitleStyleProps {
  loc: any;
  config: any;
}

// 1. MODERN (Default)
@Component({
  selector: 'app-title-modern',
  standalone: true,
  imports: [CommonModule],
  template: `
     <div class="flex flex-col items-center justify-center h-full w-full text-center animate-fade-in-up gap-6 md:gap-10 p-6 md:p-20 overflow-y-auto custom-scrollbar" [style.color]="config().textColor" [style.font-family]="config().fontFamily">
        <div class="mb-2 shrink-0 w-full max-w-5xl px-4 flex flex-col items-center">
            <!-- Título com quebra de linha e tamanho responsivo seguro -->
            <h1 class="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter drop-shadow-2xl leading-tight break-words whitespace-normal w-full max-w-full">{{ loc().titleScreen?.title }}</h1>
            <div class="h-1 w-24 bg-current mx-auto mt-6 rounded-full opacity-50"></div>
            <p class="text-sm md:text-xl font-light mt-6 opacity-90 tracking-[0.2em] uppercase break-words whitespace-normal w-full max-w-3xl">{{ loc().titleScreen?.subtitle }}</p>
        </div>
        <div class="flex flex-col gap-4 w-72 max-w-full shrink-0 z-20">
            <button (click)="start.emit()" class="py-4 bg-white text-black font-bold uppercase tracking-[0.15em] hover:scale-105 transition-transform shadow-xl rounded text-sm break-words whitespace-normal px-2">{{ loc().titleScreen?.buttonText }}</button>
            <button (click)="load.emit()" class="py-4 border border-current hover:bg-white/10 font-bold uppercase tracking-[0.15em] transition-colors rounded text-sm break-words whitespace-normal px-2">{{ loc().titleScreen?.loadButtonText }}</button>
            <div class="flex gap-3 mt-2">
                <button (click)="achievements.emit()" class="flex-1 py-3 text-[10px] border border-current/40 hover:bg-white/10 uppercase rounded tracking-wider break-words whitespace-normal">{{ loc().titleScreen?.achievementsButtonText }}</button>
                <button (click)="terms.emit()" class="flex-1 py-3 text-[10px] border border-current/40 hover:bg-white/10 uppercase rounded tracking-wider break-words whitespace-normal">{{ loc().titleScreen?.termsButtonText }}</button>
            </div>
        </div>
     </div>
  `
})
export class TitleModernComponent {
  loc = input.required<SettingsTranslation>();
  config = input.required<any>();
  start = output<void>(); load = output<void>(); achievements = output<void>(); terms = output<void>();
}

// 2. CLASSIC (Novel Style)
@Component({
  selector: 'app-title-classic',
  standalone: true,
  imports: [CommonModule],
  template: `
     <div class="flex flex-col justify-end h-full pb-24 pl-6 md:pl-32 pr-6 md:pr-12 animate-fade-in text-left overflow-y-auto" [style.color]="config().textColor" [style.font-family]="config().fontFamily">
        <div class="bg-black/60 p-6 md:p-10 border-l-4 border-current backdrop-blur-sm max-w-2xl w-full shadow-2xl">
            <h1 class="text-4xl md:text-6xl font-serif font-bold italic mb-4 leading-tight break-words whitespace-normal w-full">{{ loc().titleScreen?.title }}</h1>
            <p class="text-base md:text-xl opacity-80 mb-10 font-serif italic border-b border-white/20 pb-6 inline-block break-words whitespace-normal w-full">{{ loc().titleScreen?.subtitle }}</p>
            <div class="flex flex-col items-start gap-4 pl-2 w-full">
                <button (click)="start.emit()" class="text-xl md:text-2xl hover:translate-x-3 transition-transform hover:text-cyan-400 font-bold text-left break-words w-full whitespace-normal">➤ {{ loc().titleScreen?.buttonText }}</button>
                <button (click)="load.emit()" class="text-base md:text-lg opacity-80 hover:translate-x-3 transition-transform hover:text-cyan-400 text-left break-words w-full whitespace-normal">{{ loc().titleScreen?.loadButtonText }}</button>
                <button (click)="achievements.emit()" class="text-sm md:text-base opacity-70 hover:translate-x-3 transition-transform hover:text-cyan-400 text-left break-words w-full whitespace-normal">{{ loc().titleScreen?.achievementsButtonText }}</button>
                <button (click)="terms.emit()" class="text-xs md:text-sm opacity-60 hover:translate-x-3 transition-transform hover:text-cyan-400 text-left break-words w-full whitespace-normal">{{ loc().titleScreen?.termsButtonText }}</button>
            </div>
        </div>
     </div>
  `
})
export class TitleClassicComponent {
  loc = input.required<SettingsTranslation>();
  config = input.required<any>();
  start = output<void>(); load = output<void>(); achievements = output<void>(); terms = output<void>();
}

// 3. CINEMATIC (Minimal UI)
@Component({
  selector: 'app-title-cinematic',
  standalone: true,
  imports: [CommonModule],
  template: `
     <div class="flex flex-col items-center justify-between py-10 md:py-32 h-full animate-fade-in p-6 md:p-12 overflow-y-auto" [style.color]="config().textColor" [style.font-family]="'Cinzel, serif'">
        <div class="mt-4 md:mt-10 text-center w-full max-w-6xl px-4">
             <h1 class="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-bold tracking-widest uppercase drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] opacity-90 break-words whitespace-normal leading-tight w-full">{{ loc().titleScreen?.title }}</h1>
             <p class="text-sm md:text-xl mt-6 tracking-[0.3em] md:tracking-[0.5em] uppercase opacity-70 break-words whitespace-normal w-full">{{ loc().titleScreen?.subtitle }}</p>
        </div>
        
        <div class="flex flex-col items-center w-full px-4">
            <button (click)="start.emit()" class="group flex flex-col items-center gap-4 opacity-80 hover:opacity-100 transition-opacity mt-10">
                <div class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="ml-1"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <span class="text-sm md:text-base uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-center break-words max-w-xs whitespace-normal">{{ loc().titleScreen?.buttonText }}</span>
            </button>

            <div class="flex flex-wrap justify-center gap-6 md:gap-12 text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-60 mt-10 w-full px-4 text-center">
                <button (click)="load.emit()" class="hover:text-white hover:opacity-100 border-b border-transparent hover:border-white/50 pb-1 transition-all break-words whitespace-normal">{{ loc().titleScreen?.loadButtonText }}</button>
                <button (click)="achievements.emit()" class="hover:text-white hover:opacity-100 border-b border-transparent hover:border-white/50 pb-1 transition-all break-words whitespace-normal">{{ loc().titleScreen?.achievementsButtonText }}</button>
                <button (click)="terms.emit()" class="hover:text-white hover:opacity-100 border-b border-transparent hover:border-white/50 pb-1 transition-all break-words whitespace-normal">{{ loc().titleScreen?.termsButtonText }}</button>
            </div>
        </div>
     </div>
  `
})
export class TitleCinematicComponent {
  loc = input.required<SettingsTranslation>();
  config = input.required<any>();
  start = output<void>(); load = output<void>(); achievements = output<void>(); terms = output<void>();
}

// 4. RETRO (Pixel/Arcade)
@Component({
  selector: 'app-title-retro',
  standalone: true,
  imports: [CommonModule],
  template: `
     <div class="flex flex-col items-center justify-center h-full animate-pulse p-4 md:p-12 overflow-y-auto" [style.color]="config().textColor" style="font-family: 'Press Start 2P', cursive;">
        <h1 class="text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-center text-yellow-400 drop-shadow-[4px_4px_0_#b91c1c] md:drop-shadow-[6px_6px_0_#b91c1c] leading-relaxed mb-8 md:mb-16 break-words whitespace-normal w-full max-w-5xl">{{ loc().titleScreen?.title }}</h1>
        <div class="bg-blue-900/90 border-4 border-white p-4 md:p-8 rounded-none shadow-[10px_10px_0_rgba(0,0,0,0.5)] flex flex-col gap-4 md:gap-6 w-full max-w-md">
            <button (click)="start.emit()" class="text-white hover:text-yellow-300 text-xs md:text-base text-center blink-hover break-words leading-loose whitespace-normal">{{ loc().titleScreen?.buttonText }}</button>
            <button (click)="load.emit()" class="text-slate-300 hover:text-yellow-300 text-[10px] md:text-xs text-center break-words leading-loose whitespace-normal">> {{ loc().titleScreen?.loadButtonText }}</button>
            <button (click)="achievements.emit()" class="text-slate-300 hover:text-yellow-300 text-[10px] md:text-xs text-center break-words leading-loose whitespace-normal">> {{ loc().titleScreen?.achievementsButtonText }}</button>
            <button (click)="terms.emit()" class="text-slate-300 hover:text-yellow-300 text-[8px] md:text-[10px] text-center mt-2 break-words leading-loose whitespace-normal">{{ loc().titleScreen?.termsButtonText }}</button>
        </div>
        <p class="mt-8 md:mt-12 text-[8px] md:text-xs text-white opacity-70 break-words text-center px-4 whitespace-normal">© 2025 {{ loc().titleScreen?.subtitle }}</p>
     </div>
     <style>.blink-hover:hover { animation: blink 0.2s infinite; } @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }</style>
  `
})
export class TitleRetroComponent {
  loc = input.required<SettingsTranslation>();
  config = input.required<any>();
  start = output<void>(); load = output<void>(); achievements = output<void>(); terms = output<void>();
}

// 5. SPLIT (Modern Sidebar)
@Component({
  selector: 'app-title-split',
  standalone: true,
  imports: [CommonModule],
  template: `
     <div class="flex h-full w-full">
         <div class="flex-1 hidden md:block"></div> <!-- Spacer for background visibility -->
         <div class="w-full md:w-[450px] bg-white/95 backdrop-blur-md h-full flex flex-col justify-center px-8 md:px-16 shadow-2xl animate-slide-in-from-right shrink-0 overflow-y-auto" [style.font-family]="config().fontFamily">
             <div class="mb-auto mt-10 md:mt-20"></div>
             <h1 class="text-4xl md:text-5xl font-black text-slate-900 mb-4 uppercase leading-none break-words whitespace-normal w-full">{{ loc().titleScreen?.title }}</h1>
             <p class="text-xs md:text-sm text-slate-500 mb-10 md:mb-16 uppercase tracking-wide font-medium break-words whitespace-normal w-full">{{ loc().titleScreen?.subtitle }}</p>
             
             <div class="flex flex-col gap-0 border-l-4 border-slate-200 pl-6 md:pl-8">
                 <button (click)="start.emit()" class="text-left py-4 text-slate-900 font-black hover:text-cyan-600 transition-colors uppercase text-base md:text-lg tracking-wide break-words whitespace-normal">
                    {{ loc().titleScreen?.buttonText }}
                 </button>
                 <button (click)="load.emit()" class="text-left py-3 text-slate-400 font-bold hover:text-slate-800 transition-colors uppercase text-xs md:text-sm tracking-wide break-words whitespace-normal">
                    {{ loc().titleScreen?.loadButtonText }}
                 </button>
                 <button (click)="achievements.emit()" class="text-left py-3 text-slate-400 font-bold hover:text-slate-800 transition-colors uppercase text-xs md:text-sm tracking-wide break-words whitespace-normal">
                    {{ loc().titleScreen?.achievementsButtonText }}
                 </button>
                 <button (click)="terms.emit()" class="text-left py-3 text-slate-300 hover:text-slate-800 text-[10px] md:text-xs mt-4 md:mt-8 uppercase tracking-widest break-words whitespace-normal">
                    {{ loc().titleScreen?.termsButtonText }}
                 </button>
             </div>
             <div class="mb-auto"></div>
         </div>
     </div>
  `
})
export class TitleSplitComponent {
  loc = input.required<SettingsTranslation>();
  config = input.required<any>();
  start = output<void>(); load = output<void>(); achievements = output<void>(); terms = output<void>();
}
