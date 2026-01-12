
import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VnService } from '../services/vn.service';

@Component({
  selector: 'app-achievement-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed z-[300] pointer-events-none flex flex-col items-center w-full"
         [ngClass]="posClass()">
         
         <!-- Container with entry animation -->
         <div class="animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500 ease-out">
             
             <!-- 1. STANDARD (Modern Dark/Gold) -->
             @if (config().style === 'standard') {
                <div class="bg-slate-900/90 backdrop-blur-md border border-yellow-500/30 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-3 pr-6 flex items-center gap-4 max-w-sm w-full mx-auto relative overflow-hidden group">
                    <div class="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-50"></div>
                    
                    <div class="w-12 h-12 bg-slate-950 rounded-xl shrink-0 flex items-center justify-center border border-slate-800 shadow-inner relative z-10 overflow-hidden">
                        @if (iconUrl()) { <img [src]="iconUrl()" class="w-full h-full object-cover" [style.object-position]="iconPos()"> } @else { <span class="text-2xl filter drop-shadow">🏆</span> }
                    </div>
                    <div class="flex-1 min-w-0 relative z-10">
                        <div class="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> Conquista
                        </div>
                        <h3 class="text-white font-bold text-sm truncate leading-tight">{{ name() }}</h3>
                        <p class="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{{ description() }}</p>
                    </div>
                </div>
             }

             <!-- 2. XBOX STYLE (Green Pill) -->
             @if (config().style === 'xbox') {
                 <div class="flex items-center gap-3 bg-[#107c10] text-white rounded-full p-1.5 pr-6 shadow-xl max-w-md mx-auto ring-2 ring-white/10">
                     <div class="w-10 h-10 rounded-full bg-[#0d6b0d] flex items-center justify-center shrink-0 border border-white/20 overflow-hidden shadow-inner">
                         @if (iconUrl()) { <img [src]="iconUrl()" class="w-full h-full object-cover" [style.object-position]="iconPos()"> } @else { <span class="text-lg">🏆</span> }
                     </div>
                     <div class="flex flex-col">
                         <span class="text-[9px] font-bold uppercase tracking-wider opacity-90">Conquista Desbloqueada</span>
                         <span class="text-sm font-bold truncate max-w-[200px]">{{ name() }}</span>
                     </div>
                     <div class="ml-auto w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-bold border border-white/10">G</div>
                 </div>
             }

             <!-- 3. PLAYSTATION STYLE (Sleek White/Black) -->
             @if (config().style === 'playstation') {
                 <div class="bg-white/95 text-black rounded-xl p-3 pr-5 flex items-center gap-4 shadow-2xl max-w-sm border-l-4 border-blue-600 font-sans mx-auto">
                     <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden relative border border-slate-200">
                         @if (iconUrl()) { <img [src]="iconUrl()" class="w-full h-full object-cover" [style.object-position]="iconPos()"> } @else { <span class="text-xl">🏆</span> }
                     </div>
                     <div class="flex flex-col">
                         <span class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Você ganhou um troféu!</span>
                         <span class="text-sm font-bold">{{ name() }}</span>
                     </div>
                 </div>
             }

             <!-- 4. STEAM STYLE (Classic Blue Box) -->
             @if (config().style === 'steam') {
                 <div class="bg-[#1b2838] text-[#c7d5e0] p-3 flex gap-3 shadow-[0_0_15px_rgba(102,192,244,0.4)] border border-[#3e6c93] max-w-xs mx-auto rounded-sm relative overflow-hidden">
                     <div class="absolute inset-0 bg-gradient-to-br from-[#2a475e] to-transparent opacity-50 pointer-events-none"></div>
                     <div class="w-12 h-12 bg-black shrink-0 border border-[#3e6c93] overflow-hidden relative z-10">
                         @if (iconUrl()) { <img [src]="iconUrl()" class="w-full h-full object-cover" [style.object-position]="iconPos()"> } @else { <span class="text-2xl flex h-full items-center justify-center">🏆</span> }
                     </div>
                     <div class="flex flex-col justify-center min-w-0 relative z-10">
                         <div class="text-[10px] uppercase font-bold text-[#66c0f4] mb-0.5">Conquista Desbloqueada</div>
                         <div class="text-xs font-bold truncate text-white">{{ name() }}</div>
                         <div class="text-[10px] opacity-70 truncate">{{ description() }}</div>
                     </div>
                 </div>
             }

             <!-- 5. RETRO PIXEL (8-bit) -->
             @if (config().style === 'retro') {
                 <div class="bg-blue-800 text-white p-2 px-4 border-4 border-white shadow-[4px_4px_0_rgba(0,0,0,0.5)] max-w-sm mx-auto font-[monospace] tracking-tight image-pixelated">
                     <div class="flex items-center gap-4">
                         <div class="text-2xl animate-bounce">⭐</div>
                         <div>
                             <div class="text-[8px] uppercase text-yellow-300 mb-1 leading-none">Level Up!</div>
                             <div class="text-xs font-bold">{{ name() }}</div>
                         </div>
                     </div>
                 </div>
             }

             <!-- 6. MINIMAL (Clean Glass) -->
             @if (config().style === 'minimal') {
                 <div class="bg-white/80 backdrop-blur-xl text-slate-800 px-6 py-2.5 rounded-full shadow-lg border border-white/50 flex items-center gap-3 mx-auto">
                     <span class="text-xl">🏆</span>
                     <span class="text-sm font-bold">{{ name() }}</span>
                 </div>
             }

             <!-- 7. GOLDEN (Luxury) -->
             @if (config().style === 'golden') {
                 <div class="bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-600 text-white p-[2px] rounded-xl shadow-[0_0_25px_rgba(234,179,8,0.5)] mx-auto max-w-sm">
                     <div class="bg-slate-900 rounded-[10px] p-3 flex items-center gap-4 relative overflow-hidden">
                         <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                         <div class="w-10 h-10 rounded-full border-2 border-yellow-400 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_10px_orange] relative z-10 bg-black">
                             @if (iconUrl()) { <img [src]="iconUrl()" class="w-full h-full object-cover" [style.object-position]="iconPos()"> } @else { <span class="text-lg">👑</span> }
                         </div>
                         <div class="relative z-10">
                             <div class="text-[9px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400 uppercase tracking-[0.2em] mb-0.5">Conquista Rara</div>
                             <div class="font-bold text-white text-sm leading-tight">{{ name() }}</div>
                         </div>
                     </div>
                 </div>
             }
         </div>
    </div>
  `
})
export class AchievementToastComponent {
  vnService = inject(VnService);
  name = input.required<string>();
  description = input.required<string>();
  iconUrl = input<string | undefined>();
  // We need to fetch the achievement object to get X/Y, but the notification signal in VnService currently only stores name/desc/url.
  // Ideally, we'd refactor the signal to store the full object or ID. 
  // For now, to keep it clean without massive refactors, I will try to find the achievement by name (since names are unique-ish enough for visual lookups)
  
  fullData = computed(() => this.vnService.achievements().find(a => a.name === this.name()));
  
  iconPos = computed(() => {
      const a = this.fullData();
      return `${a?.iconX ?? 50}% ${a?.iconY ?? 50}%`;
  });

  config = computed(() => this.vnService.settings().achievementPopup || { style: 'standard', position: 'top-center', duration: 4000 });

  // Forced Top Alignment as requested ("só aparece na parte de cima")
  posClass = computed(() => {
      const p = this.config().position;
      if (p.includes('left')) return 'top-6 left-6 items-start';
      if (p.includes('right')) return 'top-6 right-6 items-end';
      return 'top-6 left-0 right-0 items-center';
  });
}
