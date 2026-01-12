
import { Component, inject, signal, computed, output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';

@Component({
  selector: 'app-achievement-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-300"
         (mouseup)="onDragEnd()" (touchend)="onDragEnd()" (mousemove)="onDragMove($event)" (touchmove)="onDragMove($event)">
         
        <div class="bg-slate-900/95 w-full max-w-5xl h-[100dvh] md:h-[85vh] md:rounded-3xl rounded-none md:border border-white/10 flex flex-col md:flex-row overflow-hidden shadow-2xl relative ring-1 ring-white/5 font-sans">
            
            <!-- Mobile Header with BACK BUTTON -->
            <div class="md:hidden h-14 bg-slate-950 border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-50">
                <button (click)="close.emit()" class="flex items-center gap-2 text-slate-300 hover:text-white font-bold bg-white/5 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                    <span>⬅</span> Voltar
                </button>
                <span class="font-bold text-white">Conquistas</span>
                <div class="w-8"></div> <!-- Spacer for center alignment -->
            </div>

            <!-- Close Button Desktop -->
            <button (click)="close.emit()" class="hidden md:flex absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full items-center justify-center transition-colors z-50">✕</button>

            <!-- Side 1: List (Top on Mobile, Left on Desktop) -->
            <div class="w-full md:w-80 h-[40%] md:h-full border-b md:border-b-0 md:border-r border-white/5 flex flex-col bg-slate-950/50 shrink-0">
                <div class="p-4 md:p-6 shrink-0">
                    <h2 class="text-lg md:text-xl font-black text-white mb-2 md:mb-4 tracking-tight flex items-center gap-2">
                        <span class="bg-yellow-500/20 text-yellow-500 p-1.5 rounded-lg text-lg">🏆</span>
                        <span class="hidden md:inline">Conquistas</span>
                        <span class="md:hidden text-sm font-normal text-slate-400">Lista</span>
                    </h2>
                    <button (click)="vnService.addAchievement()" class="w-full py-2 md:py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/20 active:scale-95">
                        <span>+</span> Criar Nova
                    </button>
                </div>
                
                <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
                    @for (ach of vnService.achievements(); track ach.id) {
                        <div (click)="selectedAchievementId.set(ach.id)"
                             class="p-3 rounded-xl cursor-pointer border transition-all flex items-center gap-3 group relative overflow-hidden"
                             [class.bg-white_10]="selectedAchievementId() === ach.id"
                             [class.border-cyan-500_50]="selectedAchievementId() === ach.id"
                             [class.bg-white_5]="selectedAchievementId() !== ach.id"
                             [class.border-transparent]="selectedAchievementId() !== ach.id"
                             [class.hover:bg-white_10]="selectedAchievementId() !== ach.id">
                             
                             <div class="w-10 h-10 rounded-lg bg-black/40 flex-shrink-0 border border-white/10 flex items-center justify-center overflow-hidden">
                                 @if(ach.iconAssetId) { 
                                     <img [src]="vnService.getAssetUrl(ach.iconAssetId)" class="w-full h-full object-cover" [style.object-position]="(ach.iconX ?? 50) + '% ' + (ach.iconY ?? 50) + '%'"> 
                                 } @else { 
                                     <span class="opacity-50">🏆</span> 
                                 }
                             </div>
                             <div class="min-w-0 flex-1">
                                 <div class="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">{{ ach.name }}</div>
                                 <div class="text-[10px] text-slate-500 truncate">{{ ach.description }}</div>
                             </div>
                             @if(selectedAchievementId() === ach.id) {
                                 <div class="absolute right-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
                             }
                        </div>
                    }
                    @if (vnService.achievements().length === 0) {
                        <div class="text-center p-8 opacity-30">
                            <div class="text-4xl mb-2">🍃</div>
                            <p class="text-xs">Nada por aqui ainda.</p>
                        </div>
                    }
                </div>
            </div>

            <!-- Side 2: Edit (Bottom on Mobile, Right on Desktop) -->
            <div class="flex-1 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col relative h-[60%] md:h-full overflow-hidden">
                
                @if (selectedAchievement(); as activeAch) {
                    <div class="p-6 md:p-12 flex-1 overflow-y-auto custom-scrollbar pb-20 md:pb-12">
                        <div class="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            
                            <div class="flex items-start justify-between border-b border-white/5 pb-4">
                                <div>
                                    <h3 class="text-xl md:text-2xl font-bold text-white mb-1">Editar Detalhes</h3>
                                    <p class="text-xs text-slate-500">Configure como a conquista aparecerá.</p>
                                </div>
                                <button (click)="deleteAchievement(activeAch.id)" class="text-red-400 hover:text-red-300 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-950/50 border border-transparent hover:border-red-900 transition-colors">
                                    Excluir
                                </button>
                            </div>

                            <!-- Icon Picker (Responsive Flex) -->
                            <div class="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                                <!-- DRAGGABLE ICON PREVIEW -->
                                <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-black border-2 border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl relative group cursor-move select-none"
                                     (mousedown)="startDrag($event)" (touchstart)="startDrag($event)"
                                     title="Arraste para ajustar a posição">
                                    
                                    @if(activeAch.iconAssetId) { 
                                        <img [src]="vnService.getAssetUrl(activeAch.iconAssetId)" 
                                             class="w-full h-full object-cover pointer-events-none"
                                             [style.object-position]="(activeAch.iconX ?? 50) + '% ' + (activeAch.iconY ?? 50) + '%'"> 
                                    } @else { 
                                        <span class="text-4xl sm:text-5xl text-slate-700">?</span> 
                                    }
                                    
                                    <!-- Drag Hint -->
                                    <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white/70 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        ARRASTE P/ AJUSTAR
                                    </div>

                                    <!-- Quick Upload Mini Button (Corner) -->
                                    <button (click)="triggerIconUpload(); $event.stopPropagation()" class="absolute top-1 right-1 bg-black/50 hover:bg-cyan-600 text-white w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/20 hover:border-transparent z-10" title="Trocar Imagem">
                                        📂
                                    </button>
                                </div>
                                
                                <div class="flex-1 space-y-3 w-full">
                                    <label class="block text-xs font-bold text-slate-400 uppercase">Ícone da Conquista</label>
                                    <div class="flex gap-2">
                                        <select [ngModel]="activeAch.iconAssetId" (ngModelChange)="vnService.updateAchievement(activeAch.id, {iconAssetId: $event})" class="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs sm:text-sm outline-none focus:border-cyan-500 transition-colors cursor-pointer">
                                            <option [ngValue]="null">--- Padrão (Troféu) ---</option>
                                            @for (a of vnService.assets(); track a.id) { @if(a.type === 'background' || a.type === 'character') { <option [value]="a.id">🖼️ {{ a.name }}</option> } }
                                        </select>
                                        <button (click)="triggerIconUpload()" class="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-xl font-bold border border-slate-600 transition-colors" title="Carregar do dispositivo">
                                            📂
                                        </button>
                                        <input #iconUploadInput type="file" accept="image/*" class="hidden" (change)="handleIconUpload($event, activeAch.id)">
                                    </div>
                                    <p class="text-[10px] text-slate-500">Recomendado: Imagem quadrada (1:1), PNG ou JPG.</p>
                                    <p class="text-[10px] text-cyan-500/70 italic" *ngIf="activeAch.iconAssetId">💡 Dica: Arraste a imagem na caixa ao lado para ajustar o enquadramento.</p>
                                </div>
                            </div>

                            <!-- Text Fields -->
                            <div class="space-y-5">
                                <div class="group">
                                    <label class="block text-xs font-bold text-cyan-500 uppercase mb-2 ml-1">Título</label>
                                    <input [ngModel]="activeAch.name" (ngModelChange)="vnService.updateAchievement(activeAch.id, {name: $event})" 
                                           class="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:bg-slate-800 outline-none transition-all text-lg font-bold placeholder-slate-600"
                                           placeholder="Nome da Conquista">
                                </div>
                                
                                <div class="group">
                                    <label class="block text-xs font-bold text-cyan-500 uppercase mb-2 ml-1">Descrição</label>
                                    <textarea [ngModel]="activeAch.description" (ngModelChange)="vnService.updateAchievement(activeAch.id, {description: $event})" 
                                              class="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white h-24 sm:h-32 resize-none focus:border-cyan-500 focus:bg-slate-800 outline-none transition-all placeholder-slate-600 leading-relaxed"
                                              placeholder="O que o jogador fez para ganhar isso?"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                } @else {
                    <div class="flex-1 flex flex-col items-center justify-center text-slate-600 p-10 text-center">
                        <div class="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-inner">
                            <span class="text-3xl md:text-4xl opacity-50 transform md:-rotate-90 rotate-180">☝️</span>
                        </div>
                        <h3 class="text-lg md:text-xl font-bold text-slate-500 mb-2">Nenhuma Selecionada</h3>
                        <p class="text-xs md:text-sm max-w-xs">Selecione na lista ou crie uma nova para editar.</p>
                    </div>
                }
            </div>
        </div>
    </div>
  `
})
export class AchievementManagerComponent {
  vnService = inject(VnService);
  close = output<void>();

  @ViewChild('iconUploadInput') iconUploadInput!: ElementRef<HTMLInputElement>;

  selectedAchievementId = signal<string|null>(null);
  selectedAchievement = computed(() => this.vnService.achievements().find(a => a.id === this.selectedAchievementId()) || null);

  // Drag Logic Variables
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  initX = 50;
  initY = 50;
  dragRect: DOMRect | null = null;

  deleteAchievement(id: string) {
      if(confirm('Apagar esta conquista?')) {
          this.vnService.deleteAchievement(id);
          this.selectedAchievementId.set(null);
      }
  }

  triggerIconUpload() {
      this.iconUploadInput.nativeElement.click();
  }

  async handleIconUpload(event: Event, achievementId: string) {
      const input = event.target as HTMLInputElement;
      if (input.files?.length) {
          const newAssets = await this.vnService.importFiles(input.files);
          if (Array.isArray(newAssets) && newAssets.length > 0) {
              this.vnService.updateAchievement(achievementId, { iconAssetId: newAssets[0].id });
          }
          input.value = '';
      }
  }

  // --- DRAG IMPLEMENTATION ---
  startDrag(e: MouseEvent | TouchEvent) {
      // Allow click propagation if not dragging, but prevent default drag behavior
      e.preventDefault(); 
      
      const ach = this.selectedAchievement();
      if (!ach || !ach.iconAssetId) return;

      this.isDragging = true;
      const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
      
      this.dragStartX = clientX;
      this.dragStartY = clientY;
      
      this.initX = ach.iconX ?? 50;
      this.initY = ach.iconY ?? 50;
      
      const target = e.currentTarget as HTMLElement;
      this.dragRect = target.getBoundingClientRect();
  }

  onDragMove(e: MouseEvent | TouchEvent) {
      if (!this.isDragging || !this.selectedAchievementId() || !this.dragRect) return;
      
      // Stop touch scrolling while adjusting
      if (window.TouchEvent && e instanceof TouchEvent) e.preventDefault();

      const clientX = e instanceof MouseEvent ? e.clientX : (e.touches ? e.touches[0].clientX : 0);
      const clientY = e instanceof MouseEvent ? e.clientY : (e.touches ? e.touches[0].clientY : 0);
      
      const deltaX = clientX - this.dragStartX;
      const deltaY = clientY - this.dragStartY;
      
      // Convert pixel delta to percentage delta relative to container size
      // We assume dragging right moves the image view right (showing left side) -> reduce X
      const pctX = (deltaX / this.dragRect.width) * 100;
      const pctY = (deltaY / this.dragRect.height) * 100;
      
      // Standard "Pan" feel: Drag Right -> Move Content Right -> Position % decreases (0% is Left)
      let newX = this.initX - pctX;
      let newY = this.initY - pctY;
      
      // Clamp 0-100
      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));
      
      this.vnService.updateAchievement(this.selectedAchievementId()!, { iconX: newX, iconY: newY });
  }

  onDragEnd() {
      this.isDragging = false;
      this.dragRect = null;
  }
}
