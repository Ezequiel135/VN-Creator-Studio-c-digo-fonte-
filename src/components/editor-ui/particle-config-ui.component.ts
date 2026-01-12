
import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { ParticleConfig } from '../../types';

@Component({
  selector: 'app-particle-config-ui',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-950 p-3 rounded border border-slate-800 shrink-0 space-y-3">
         <div class="flex items-center justify-between">
             <label class="block text-[10px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1">
                 <span>🌸</span> Partículas / Queda
             </label>
             <!-- Mudança aqui: div -> label -->
             <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [ngModel]="config().enabled" (ngModelChange)="update({enabled: $event})" class="sr-only peer">
                <div class="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:bg-pink-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all"></div>
             </label>
         </div>

         @if (config().enabled) {
             <div class="animate-in fade-in space-y-2">
                 <div>
                     <label class="text-[9px] text-slate-500 uppercase font-bold">Tipo de Partícula</label>
                     <select [ngModel]="config().preset" (ngModelChange)="update({preset: $event})"
                             class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-pink-500">
                         <option value="sakura">Pétalas de Sakura (Rosa)</option>
                         <option value="autumn">Folhas de Outono</option>
                         <option value="hearts">Corações Flutuantes</option>
                         <option value="stars">Estrelas Brilhantes</option>
                         <option value="bubbles">Bolhas de Sabão</option>
                         <option value="sparkles">Brilhos Mágicos</option>
                         <option value="snow-flakes">Flocos de Neve (Simples)</option>
                         <option value="custom">Imagem Personalizada (PNG)</option>
                     </select>
                 </div>

                 @if (config().preset === 'custom') {
                     <div>
                         <label class="text-[9px] text-slate-500 uppercase font-bold mb-1 block">Imagem (PNG Transparente)</label>
                         <div class="flex gap-2">
                             <select [ngModel]="config().customAssetId" (ngModelChange)="update({customAssetId: $event})"
                                     class="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-pink-500 min-w-0">
                                 <option [ngValue]="null">-- Selecione --</option>
                                 @for(a of imageAssets(); track a.id) { <option [value]="a.id">{{ a.name }}</option> }
                             </select>
                             
                             <button (click)="fileInput.click()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 rounded" title="Upload PNG">
                                 📂
                             </button>
                             <input #fileInput type="file" accept="image/png,image/gif" class="hidden" (change)="handleFileUpload($event)">
                         </div>
                         <p class="text-[9px] text-slate-500 mt-1">Dica: Use imagens pequenas (ex: 32x32px).</p>
                     </div>
                 }

                 <div class="grid grid-cols-2 gap-2">
                     <div>
                         <label class="text-[9px] text-slate-500 uppercase font-bold">Quantidade (1-5)</label>
                         <input type="range" min="1" max="5" step="1" 
                                [ngModel]="config().density || 3" 
                                (ngModelChange)="update({density: $event})"
                                class="w-full accent-pink-500">
                     </div>
                     <div>
                         <label class="text-[9px] text-slate-500 uppercase font-bold">Velocidade (1-5)</label>
                         <input type="range" min="1" max="5" step="1" 
                                [ngModel]="config().speed || 3" 
                                (ngModelChange)="update({speed: $event})"
                                class="w-full accent-pink-500">
                     </div>
                 </div>
             </div>
         }
    </div>
  `
})
export class ParticleConfigUiComponent {
  vnService = inject(VnService);
  config = input.required<ParticleConfig>();
  configChange = output<ParticleConfig>();

  imageAssets = computed(() => this.vnService.assets().filter(a => a.type === 'character' || a.type === 'background'));

  update(partial: Partial<ParticleConfig>) {
      this.configChange.emit({ ...this.config(), ...partial });
  }

  async handleFileUpload(e: Event) {
      const input = e.target as HTMLInputElement;
      if (input.files?.length) {
          const newAssets = await this.vnService.importFiles(input.files);
          if (newAssets && newAssets.length > 0) {
              // Select the first imported asset
              this.update({ customAssetId: newAssets[0].id });
          }
          input.value = '';
      }
  }
}
