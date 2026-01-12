
import { Component, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TUTORIAL_DATA, TutorialSection } from '../../data/tutorial-data';

@Component({
  selector: 'app-tutorial-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[300] bg-black/90 backdrop-blur flex items-center justify-center md:p-4 animate-in fade-in">
        <div class="bg-slate-900 w-full md:max-w-5xl h-full md:h-[85vh] md:rounded-2xl border-0 md:border border-slate-700 shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
            
            <!-- Mobile Close Button (Only visible on Menu View) -->
            <button (click)="close.emit()" 
                    class="md:hidden absolute top-4 right-4 z-50 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-slate-700 shadow-lg"
                    *ngIf="mobileView() === 'menu'">
                ✕
            </button>

            <!-- SIDEBAR / MENU (Visible on Desktop OR Mobile 'menu' state) -->
            <div class="w-full md:w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-300 absolute inset-0 md:relative z-20"
                 [class.translate-x-0]="mobileView() === 'menu'"
                 [class.-translate-x-full]="mobileView() === 'content'"
                 [class.md:translate-x-0]="true">
                
                <div class="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                    <h2 class="font-black text-white text-xl tracking-tight flex items-center gap-3">
                        <span class="text-2xl">📚</span> Manual
                    </h2>
                </div>

                <div class="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar pb-20 md:pb-3">
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-widest px-3 mb-2">Tópicos</p>
                    @for(item of sections; track item.id) {
                        <button (click)="selectSection(item)" 
                                class="w-full text-left p-4 md:py-3 md:px-4 rounded-xl text-sm font-bold transition-all flex items-center gap-4 group border border-transparent"
                                [class.bg-cyan-600]="activeSection().id === item.id && mobileView() !== 'menu'"
                                [class.text-white]="activeSection().id === item.id && mobileView() !== 'menu'"
                                [class.shadow-lg]="activeSection().id === item.id && mobileView() !== 'menu'"
                                [class.bg-slate-900]="activeSection().id !== item.id || mobileView() === 'menu'"
                                [class.border-slate-800]="activeSection().id !== item.id || mobileView() === 'menu'"
                                [class.text-slate-300]="activeSection().id !== item.id">
                            <span class="text-2xl md:text-lg group-hover:scale-110 transition-transform">{{ item.icon }}</span>
                            <span class="flex-1">{{ item.title }}</span>
                            <span class="md:hidden text-slate-500 text-lg">›</span>
                        </button>
                    }
                </div>
            </div>

            <!-- CONTENT AREA (Visible on Desktop OR Mobile 'content' state) -->
            <div class="flex-1 flex flex-col relative bg-slate-900 w-full h-full absolute inset-0 md:relative z-10 transition-transform duration-300 md:translate-x-0"
                 [class.translate-x-full]="mobileView() === 'menu'"
                 [class.translate-x-0]="mobileView() === 'content'">
                
                <!-- Desktop Close -->
                <div class="absolute top-4 right-4 z-10 hidden md:block">
                    <button (click)="close.emit()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors border border-slate-700">✕</button>
                </div>
                
                <!-- Mobile Navigation Header -->
                <div class="md:hidden h-16 bg-slate-950 border-b border-slate-800 flex items-center px-4 shrink-0 gap-3">
                    <button (click)="backToMenu()" class="text-cyan-400 font-bold text-sm flex items-center gap-1 py-2 px-3 bg-cyan-900/20 rounded-lg">
                        <span>⬅</span> Tópicos
                    </button>
                    <h3 class="font-bold text-white truncate">{{ activeSection().title }}</h3>
                </div>

                <!-- Scrollable Content -->
                <div class="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar pb-24 md:pb-10" #contentContainer>
                    <div class="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
                        <!-- Header Icon -->
                        <div class="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
                            <div class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl shadow-inner border border-slate-700">
                                {{ activeSection().icon }}
                            </div>
                            <h2 class="text-2xl md:text-3xl font-black text-white leading-tight">{{ activeSection().title }}</h2>
                        </div>

                        <!-- HTML Body -->
                        <div class="prose prose-invert prose-sm md:prose-base max-w-none text-slate-300 leading-relaxed space-y-4" [innerHTML]="activeSection().content"></div>
                    </div>
                </div>
                
                <!-- Footer Navigation -->
                <div class="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                    <button (click)="prev()" [disabled]="isFirst()" 
                            class="text-slate-400 hover:text-white disabled:opacity-30 font-bold text-xs uppercase tracking-wider flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
                        <span>⬅</span> <span class="hidden sm:inline">Anterior</span>
                    </button>
                    
                    <span class="text-xs font-mono text-slate-600 hidden md:block">
                        {{ sections.indexOf(activeSection()) + 1 }} / {{ sections.length }}
                    </span>

                    <button (click)="next()" [disabled]="isLast()" 
                            class="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg transition-all">
                        <span class="hidden sm:inline">Próximo</span> <span>➡</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  `
})
export class TutorialModalComponent {
  close = output<void>();
  sections = TUTORIAL_DATA;
  activeSection = signal<TutorialSection>(this.sections[0]);
  
  // State for Mobile Navigation
  mobileView = signal<'menu' | 'content'>('menu');

  isFirst() { return this.sections.indexOf(this.activeSection()) === 0; }
  isLast() { return this.sections.indexOf(this.activeSection()) === this.sections.length - 1; }

  selectSection(item: TutorialSection) {
      this.activeSection.set(item);
      this.mobileView.set('content');
      this.scrollToTop();
  }

  backToMenu() {
      this.mobileView.set('menu');
  }

  next() {
      const idx = this.sections.indexOf(this.activeSection());
      if (idx < this.sections.length - 1) {
          this.activeSection.set(this.sections[idx + 1]);
          this.scrollToTop();
      }
  }

  prev() {
      const idx = this.sections.indexOf(this.activeSection());
      if (idx > 0) {
          this.activeSection.set(this.sections[idx - 1]);
          this.scrollToTop();
      }
  }

  scrollToTop() {
      // Find the content container and scroll it
      const container = document.querySelector('.custom-scrollbar');
      if (container) container.scrollTop = 0;
  }
}
