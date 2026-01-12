
import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VnService } from '../../services/vn.service';
import { Scene, HiddenObject } from '../../types';
import { HiddenObjectConfigComponent } from '../editor-ui/hidden-object-config.component';

@Component({
  selector: 'app-tab-hidden-objects',
  standalone: true,
  imports: [CommonModule, HiddenObjectConfigComponent],
  template: `
    <div class="flex flex-col h-full p-4 overflow-y-auto custom-scrollbar">
        <div class="flex justify-between items-center mb-4 shrink-0">
             <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <span>🔍</span> Itens & Áreas Ocultas
             </h3>
             <button (click)="addObject()" class="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors">
                 + Adicionar
             </button>
        </div>

        @if ((scene().hiddenObjects || []).length === 0) {
            <div class="flex flex-col items-center justify-center py-8 text-slate-600 border-2 border-dashed border-slate-800 rounded bg-slate-900/30">
                <span class="text-2xl mb-2">🕵️</span>
                <span class="text-xs font-bold text-center">Nenhum objeto nesta cena.</span>
                <span class="text-[10px] mt-1 text-center px-4 text-slate-500">Defina áreas clicáveis para o jogador encontrar itens.</span>
            </div>
        } @else {
            <div class="space-y-4">
                @for (obj of (scene().hiddenObjects || []); track obj.id) {
                    <app-hidden-object-config 
                        [object]="obj" 
                        [sceneId]="scene().id" 
                        (remove)="removeObject($event)">
                    </app-hidden-object-config>
                }
            </div>
        }
    </div>
  `
})
export class TabHiddenObjectsComponent {
  vnService = inject(VnService);
  scene = input.required<Scene>();

  addObject() {
      const newObj: HiddenObject = {
          id: crypto.randomUUID(),
          name: 'Novo Item',
          x: 40, y: 40, width: 20, height: 20,
          itemImageId: null,
          message: 'Você encontrou algo!',
          once: true
      };
      const current = this.scene().hiddenObjects || [];
      this.vnService.updateScene(this.scene().id, { hiddenObjects: [...current, newObj] });
  }

  removeObject(id: string) {
      if(confirm('Remover este objeto?')) {
          const current = this.scene().hiddenObjects || [];
          this.vnService.updateScene(this.scene().id, { hiddenObjects: current.filter(x => x.id !== id) });
      }
  }
}
