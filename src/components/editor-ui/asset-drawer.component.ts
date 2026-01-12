
import { Component, input, output, inject, computed, signal, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { Asset } from '../../types';

@Component({
  selector: 'app-asset-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" (click)="close.emit()">
        <div class="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden relative" (click)="$event.stopPropagation()">
            
            <!-- Header -->
            <div class="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700 shadow-inner">
                        {{ icon() }}
                    </div>
                    <div>
                        <h3 class="font-black text-white text-xl tracking-tight">Selecionar {{ typeLabel() }}</h3>
                        <div class="flex items-center gap-2 text-xs text-slate-400 font-mono">
                            <span>Total: {{ filteredAssets().length }}</span>
                            <span>•</span>
                            <span>Página {{ currentPage() + 1 }}/{{ totalPages() || 1 }}</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-3">
                    <input type="file" multiple class="hidden" #fileInput (change)="handleImport($event)">
                    <button (click)="fileInput.click()" class="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-cyan-900/20 transition-all active:scale-95 flex items-center gap-2 border border-cyan-500/50">
                       <span>☁️</span> <span>Importar Arquivos</span>
                    </button>
                    <button (click)="close.emit()" class="w-10 h-10 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors flex items-center justify-center border border-slate-700">✕</button>
                </div>
            </div>

            <!-- Toolbar & Search -->
            <div class="p-3 bg-slate-900 border-b border-slate-800 flex gap-3">
                <div class="relative flex-1">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                    <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="currentPage.set(0)" placeholder="Buscar por nome..." 
                           class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:border-cyan-500 outline-none transition-colors">
                </div>
                
                <!-- Pagination Controls (Top) -->
                <div class="flex items-center gap-1 bg-slate-950 rounded-lg p-1 border border-slate-800">
                    <button (click)="prevPage()" [disabled]="currentPage() === 0" class="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300">◄</button>
                    <span class="text-xs font-mono text-slate-500 min-w-[3rem] text-center">{{ currentPage() + 1 }} / {{ totalPages() || 1 }}</span>
                    <button (click)="nextPage()" [disabled]="currentPage() >= totalPages() - 1" class="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300">►</button>
                </div>
            </div>

            <!-- Grid Area -->
            <div class="flex-1 overflow-y-auto p-6 bg-slate-900/50 custom-scrollbar">
                
                <!-- Grid Container -->
                <div class="grid gap-6" 
                     [ngClass]="getGridClass()">
                    
                    @for(asset of paginatedAssets(); track asset.id) {
                        <div (click)="select.emit(asset)" 
                             class="relative group cursor-pointer bg-slate-800 rounded-xl border border-slate-700 shadow-md hover:border-cyan-500 hover:ring-2 hover:ring-cyan-500/20 hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col"
                             [ngClass]="getAspectClass()">
                             
                             <!-- Image/Content Area -->
                             <div class="flex-1 overflow-hidden relative w-full bg-[url('https://transparent-textures.patterns.velomo.de/subtle_dots.png')]">
                                 @if(asset.type === 'video') { 
                                    <video [src]="asset.url" class="w-full h-full object-cover pointer-events-none opacity-90"></video>
                                    <div class="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <span class="text-3xl drop-shadow-md">🎥</span>
                                    </div>
                                 } @else if(asset.type === 'audio') { 
                                    <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 group-hover:text-cyan-400 bg-slate-900">
                                        <span class="text-4xl">🎵</span>
                                        <span class="text-[10px] uppercase font-bold tracking-widest">Áudio</span>
                                    </div>
                                 } @else { 
                                    <img [src]="asset.url" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                                 }
                             </div>
                             
                             <!-- Footer Info -->
                             <div class="h-9 bg-slate-950/90 border-t border-slate-700 flex items-center justify-between px-3 shrink-0">
                                <span class="text-[10px] font-medium text-slate-300 truncate max-w-[80%]">{{ asset.name }}</span>
                                <button (click)="deleteAsset(asset.id, $event)" class="text-slate-600 hover:text-red-400 transition-colors p-1" title="Excluir">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                             </div>

                             <!-- Selection Indicator -->
                             <div class="absolute inset-0 bg-cyan-500/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    }
                </div>

                <!-- Empty State -->
                @if(filteredAssets().length === 0) {
                    <div class="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                        <div class="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-4xl mb-2">📂</div>
                        <div class="text-center">
                            <p class="text-lg font-bold text-slate-400">Nenhum arquivo encontrado</p>
                            <p class="text-sm">Importe arquivos .JPG, .PNG ou .MP3</p>
                        </div>
                    </div>
                }
            </div>

            <!-- Footer Pagination Summary -->
            @if(totalPages() > 1) {
                <div class="p-3 bg-slate-950 border-t border-slate-800 flex justify-center">
                    <div class="flex gap-2">
                         <button *ngFor="let p of getPageList()" 
                                 (click)="currentPage.set(p)"
                                 class="w-8 h-8 rounded text-xs font-bold transition-colors"
                                 [class.bg-cyan-600]="currentPage() === p"
                                 [class.text-white]="currentPage() === p"
                                 [class.bg-slate-800]="currentPage() !== p"
                                 [class.text-slate-400]="currentPage() !== p"
                                 [class.hover:bg-slate-700]="currentPage() !== p">
                             {{ p + 1 }}
                         </button>
                    </div>
                </div>
            }
        </div>
    </div>
  `
})
export class AssetDrawerComponent {
  vnService = inject(VnService);
  type = input.required<'background'|'character'|'audio'>();
  close = output<void>();
  select = output<Asset>();
  
  searchTerm = signal('');
  currentPage = signal(0);
  itemsPerPage = 24; // Otimizado para grids 4x6

  constructor() {
      // Reset page when type changes
      effect(() => { this.type(); this.currentPage.set(0); });
  }

  icon = computed(() => {
     if(this.type() === 'background') return '🖼️';
     if(this.type() === 'character') return '👤';
     return '🎵';
  });

  typeLabel = computed(() => {
      if(this.type() === 'background') return 'Fundo / Vídeo';
      if(this.type() === 'character') return 'Personagem';
      return 'Áudio / Voz';
  });

  filteredAssets = computed(() => {
     const term = this.searchTerm().toLowerCase();
     const t = this.type();
     let list: Asset[] = [];
     
     if(t === 'character') list = this.vnService.assets().filter(a => a.type === 'character');
     else if(t === 'audio') list = this.vnService.assets().filter(a => a.type === 'audio');
     else list = this.vnService.assets().filter(a => a.type === 'background' || a.type === 'video');

     // Sort newest first usually helps
     list = list.reverse();

     if (term) return list.filter(a => a.name.toLowerCase().includes(term));
     return list;
  });

  // Paginação Lógica
  totalPages = computed(() => Math.ceil(this.filteredAssets().length / this.itemsPerPage));
  
  paginatedAssets = computed(() => {
      const start = this.currentPage() * this.itemsPerPage;
      return this.filteredAssets().slice(start, start + this.itemsPerPage);
  });

  nextPage() { if (this.currentPage() < this.totalPages() - 1) this.currentPage.update(c => c + 1); }
  prevPage() { if (this.currentPage() > 0) this.currentPage.update(c => c - 1); }

  getPageList() {
      const total = this.totalPages();
      const current = this.currentPage();
      let start = Math.max(0, current - 2);
      let end = Math.min(total, start + 5);
      
      if (end - start < 5) {
          start = Math.max(0, end - 5);
      }
      
      const pages = [];
      for(let i = start; i < end; i++) pages.push(i);
      return pages;
  }

  // Estilos Dinâmicos
  getGridClass() {
      if (this.type() === 'audio') return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      if (this.type() === 'background') return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'; // Bigger cards for BG
      return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'; // Smaller cards for Chars
  }

  getAspectClass() {
      if (this.type() === 'background') return 'aspect-video'; // 16:9 for Backgrounds
      if (this.type() === 'character') return 'aspect-[3/4]'; // Portrait for Characters
      return 'aspect-[3/2]'; // Small rect for Audio
  }

  async handleImport(e: Event) {
      const input = e.target as HTMLInputElement;
      if (input.files?.length) {
          await this.vnService.importFiles(input.files);
          this.currentPage.set(0); // Go to first page to see new items (since we reversed list)
      }
  }

  deleteAsset(id: string, e: Event) {
      e.stopPropagation();
      if(confirm('Apagar este arquivo?')) {
          this.vnService.deleteAsset(id);
          // Adjust page if empty
          if (this.paginatedAssets().length === 0 && this.currentPage() > 0) {
              this.currentPage.update(c => c - 1);
          }
      }
  }
}
