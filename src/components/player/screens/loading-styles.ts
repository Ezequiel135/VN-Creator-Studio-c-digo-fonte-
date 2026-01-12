
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. STANDARD (3 Dots)
@Component({
  selector: 'app-loading-standard',
  standalone: true, imports: [CommonModule],
  template: `
     <h2 class="text-3xl font-black tracking-tighter animate-pulse mb-2">{{ text() }}</h2>
     <div class="flex gap-1 justify-center">
        <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0s"></div>
        <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
     </div>
  `
})
export class LoadingStandardComponent { text = input.required<string>(); }

// 2. BAR (Progress)
@Component({
  selector: 'app-loading-bar',
  standalone: true, imports: [CommonModule],
  template: `
     <div class="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
         <div class="h-full bg-current animate-loading-bar w-full origin-left"></div>
     </div>
     <p class="mt-4 text-xs tracking-widest uppercase animate-pulse">{{ text() }}</p>
  `,
  styles: [`@keyframes loadBar { 0% { transform: scaleX(0); } 50% { transform: scaleX(0.7); } 100% { transform: scaleX(1); opacity: 0; } } .animate-loading-bar { animation: loadBar 2s ease-in-out infinite; }`]
})
export class LoadingBarComponent { text = input.required<string>(); }

// 3. MINIMAL (Text only)
@Component({
  selector: 'app-loading-minimal',
  standalone: true, imports: [CommonModule],
  template: `
     <div class="fixed bottom-8 right-8 animate-pulse text-sm font-light tracking-[0.3em] uppercase">{{ text() }}</div>
  `
})
export class LoadingMinimalComponent { text = input.required<string>(); }

// 4. TERMINAL (Retro)
@Component({
  selector: 'app-loading-terminal',
  standalone: true, imports: [CommonModule],
  template: `
     <div class="font-[Roboto_Mono] text-sm md:text-base p-4 border border-current bg-black/50">
         <div class="mb-2 opacity-50">SYSTEM_BOOT_SEQUENCE_INIT</div>
         <div class="flex">
            <span class="mr-2">&gt;</span>
            <span>{{ text() }}</span>
            <span class="animate-blink block w-2 h-4 bg-current inline-block align-middle ml-1"></span>
         </div>
     </div>
  `,
  styles: [`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } } .animate-blink { animation: blink 1s step-end infinite; }`]
})
export class LoadingTerminalComponent { text = input.required<string>(); }

// 5. SPINNER (Modern)
@Component({
  selector: 'app-loading-spinner',
  standalone: true, imports: [CommonModule],
  template: `
     <div class="relative w-16 h-16 mb-6">
         <div class="absolute inset-0 border-4 border-current opacity-20 rounded-full"></div>
         <div class="absolute inset-0 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
         <div class="absolute inset-0 flex items-center justify-center text-[10px] font-bold opacity-50">Loading</div>
     </div>
     <div class="text-xs uppercase font-bold tracking-[0.2em] opacity-80">{{ text() }}</div>
  `
})
export class LoadingSpinnerComponent { text = input.required<string>(); }
