
import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VnService } from '../../services/vn.service';
import { Scene } from '../../types';
import { CharacterConfigComponent } from '../character-config.component';

@Component({
  selector: 'app-tab-characters',
  standalone: true,
  imports: [CommonModule, CharacterConfigComponent],
  template: `
    <div class="flex flex-col h-full p-4 overflow-y-auto custom-scrollbar">
        
        <div class="flex justify-between items-center mb-4 shrink-0">
             <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Personagens em Cena</h3>
             <span class="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-500">{{ scene().characters.length }} Ativos</span>
        </div>

        @if (scene().characters.length === 0) {
            <div class="flex flex-col items-center justify-center py-8 text-slate-600 border-2 border-dashed border-slate-800 rounded bg-slate-900/30">
                <span class="text-2xl mb-2">👥</span>
                <span class="text-xs font-bold">Nenhum Personagem</span>
                <span class="text-[10px] mt-1 text-center px-4">Use o botão "+" na barra superior para adicionar.</span>
            </div>
        } @else {
            <div class="space-y-3">
                @for (char of scene().characters; track char.id) {
                    <app-character-config 
                        [character]="char" 
                        [sceneId]="scene().id" 
                        (remove)="removeChar($event)">
                    </app-character-config>
                }
            </div>
        }
    </div>
  `
})
export class TabCharactersComponent {
  vnService = inject(VnService);
  scene = input.required<Scene>();

  removeChar(charId: string) {
      if(confirm('Remover este personagem da cena?')) {
          this.vnService.removeCharacter(this.scene().id, charId);
      }
  }
}
