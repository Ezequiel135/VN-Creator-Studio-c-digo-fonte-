
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { GalleryItem, BonusSceneItem, ParticleConfig } from '../../types';
import { ParticleConfigUiComponent } from '../editor-ui/particle-config-ui.component';

@Component({
  selector: 'app-settings-ending',
  standalone: true,
  imports: [CommonModule, FormsModule, ParticleConfigUiComponent],
  template: `
     <div class="space-y-4 animate-fade-in">
         <div class="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-700">
            <span class="text-sm font-bold ml-1">Habilitar Tela Final</span>
            <!-- Mudança aqui: div -> label -->
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [ngModel]="vnService.settings().endingScreen.enabled" (ngModelChange)="updateNested('endingScreen', 'enabled', $event)" class="sr-only peer">
              <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:bg-cyan-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
            </label>
         </div>
         
         <!-- Botão Pular Cena Toggle -->
         <div class="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-700">
            <span class="text-xs font-bold text-slate-400 uppercase ml-1">Botão "Pular Cena"</span>
            <!-- Mudança aqui: div -> label -->
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [ngModel]="vnService.settings().endingScreen.enableSkip" (ngModelChange)="updateNested('endingScreen', 'enableSkip', $event)" class="sr-only peer">
              <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
            </label>
         </div>
         
         <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Título Final</label>
            <input [ngModel]="getLocEnding('title')" (ngModelChange)="updLocEnding('title', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm">
         </div>

         <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Imagem de Fundo (Opcional)</label>
            <select [ngModel]="vnService.settings().endingScreen.backgroundId" (ngModelChange)="updateNested('endingScreen', 'backgroundId', $event)" class="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm">
                 <option [ngValue]="null">--- Fundo Preto (Padrão) ---</option>
                 @for(a of vnService.assets(); track a.id) { @if(a.type === 'background') { <option [value]="a.id">🖼️ {{a.name}}</option> } }
            </select>
         </div>

         <!-- Particle Config (Reused Component) -->
         <app-particle-config-ui 
             [config]="particleConfig()"
             (configChange)="updateNested('endingScreen', 'particleConfig', $event)">
         </app-particle-config-ui>

         <!-- Bonus Scene Manager -->
         <div class="p-4 bg-yellow-900/10 border border-yellow-800/30 rounded">
            <div class="flex justify-between items-center mb-2">
                <label class="text-xs font-bold text-yellow-500 uppercase flex items-center gap-2">
                    <span>🎁</span> Rotas Bônus / Mini-Novels
                </label>
                <span class="text-[9px] text-slate-400">Recompensa por 100% conquistas</span>
            </div>
            
            <div class="flex gap-2 mb-2">
                <input type="text" #bonusLabel placeholder="Título (Ex: Epílogo)" class="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white">
                <select #bonusSceneSelect class="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs">
                     <option value="">-- Selecione a Cena Inicial --</option>
                     @for(s of vnService.scenes(); track s.id) { <option [value]="s.id">🎬 {{s.name}}</option> }
                </select>
                <button (click)="addBonusScene(bonusLabel.value, bonusSceneSelect.value); bonusLabel.value = ''; bonusSceneSelect.value = ''" class="px-3 bg-yellow-700 hover:bg-yellow-600 text-white rounded font-bold text-xs">Add</button>
            </div>

            <div class="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                @if ((vnService.settings().endingScreen.bonusScenes || []).length === 0) {
                     <div class="text-[10px] text-slate-500 italic p-2 border border-dashed border-slate-700 rounded text-center">Nenhuma rota bônus configurada.</div>
                }
                @for (item of (vnService.settings().endingScreen.bonusScenes || []); track item.id) {
                    <div class="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-700">
                        <div class="flex flex-col">
                            <span class="text-xs font-bold text-white">{{ item.label }}</span>
                            <span class="text-[9px] text-slate-500">Inicia em: {{ getSceneName(item.sceneId) }}</span>
                        </div>
                        <button (click)="removeBonusScene(item.id)" class="text-red-400 hover:text-white p-1">✕</button>
                    </div>
                }
            </div>
         </div>

         <!-- Gallery Manager -->
         <div class="bg-slate-900 p-4 rounded border border-slate-700">
             <h4 class="text-xs font-bold text-cyan-400 uppercase mb-3 flex items-center gap-2">
                 <span>📸</span> Galeria de Créditos
             </h4>
             <div class="flex gap-2 mb-3">
                 <select #gallerySelect class="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white text-xs">
                     <option value="">-- Adicionar Cena --</option>
                     @for(s of vnService.scenes(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
                 </select>
                 <button (click)="addGalleryItem(gallerySelect.value); gallerySelect.value = ''" class="px-3 bg-cyan-700 hover:bg-cyan-600 text-white rounded font-bold text-xs">+</button>
             </div>
             
             <div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                 @if ((vnService.settings().endingScreen.gallery || []).length === 0) {
                     <div class="text-[10px] text-slate-500 italic p-2 w-full text-center border border-dashed border-slate-700 rounded">Nenhuma cena na galeria.</div>
                 }
                 @for (item of (vnService.settings().endingScreen.gallery || []); track $index) {
                     <div class="w-24 bg-slate-800 rounded border border-slate-600 shrink-0 relative group overflow-hidden flex flex-col">
                         <div class="text-[9px] text-center p-1 truncate text-slate-300 bg-black/20">{{ getSceneName(item.sceneId) }}</div>
                         <div class="h-10 bg-slate-950 flex items-center justify-center text-xs text-slate-500">IMG {{$index + 1}}</div>
                         
                         <!-- Toggle UI Button (NEW) -->
                         <button (click)="toggleGalleryUi($index)" 
                                 class="h-6 flex items-center justify-center text-[9px] font-bold border-t border-slate-700 hover:bg-slate-700 transition-colors gap-1"
                                 [class.bg-cyan-900_30]="item.showUiSnapshot"
                                 [class.text-cyan-400]="item.showUiSnapshot"
                                 [class.text-slate-500]="!item.showUiSnapshot"
                                 title="Mostrar Diálogo na Cena Final?">
                             <span>💬</span> {{ item.showUiSnapshot ? 'ON' : 'OFF' }}
                         </button>

                         <button (click)="removeGalleryItem($index)" class="absolute top-0 right-0 bg-red-600 text-white w-4 h-4 rounded-bl flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10">✕</button>
                     </div>
                 }
             </div>
         </div>

         <div>
            <div class="flex justify-between items-end mb-1">
                 <label class="block text-xs font-bold text-slate-400 uppercase">Créditos e Agradecimentos</label>
                 <span class="text-[10px] text-cyan-500 cursor-help" title="Use [cena] para inserir a próxima imagem da galeria.">Dicas de Formatação (?)</span>
            </div>
            
            <div class="bg-slate-950 p-2 rounded text-[10px] text-slate-400 font-mono mb-2 border border-slate-700/50">
                Use <b>[cena]</b> para inserir a próxima imagem da galeria.<br>
                Use <b>[cena: 1]</b> para uma específica ou <b>[cena: Nome]</b>.
            </div>

            <textarea [ngModel]="getLocEnding('subtitle')" (ngModelChange)="updLocEnding('subtitle', $event)" class="w-full h-48 bg-slate-900 border border-slate-600 rounded p-3 text-white text-sm resize-y custom-scrollbar font-mono leading-relaxed"></textarea>
         </div>
     </div>
  `
})
export class SettingsEndingComponent {
  vnService = inject(VnService);

  getLocEnding(key: string) { return this.vnService.getLocalizedEndingSetting(key); }
  updLocEnding(key: string, val: string) { this.vnService.updateLocalizedEndingSetting(key, val); }

  particleConfig = computed(() => (this.vnService.settings().endingScreen.particleConfig || { enabled: false, preset: 'sakura', density: 3, speed: 3 }) as ParticleConfig);

  updateNested(section: string, key: string, val: any) {
      const s = this.vnService.settings() as any;
      this.vnService.settings.update(curr => ({
          ...curr,
          [section]: { ...s[section], [key]: val }
      }));
  }

  getSceneName(id: string) { return this.vnService.scenes().find(s => s.id === id)?.name || '???'; }
  
  addGalleryItem(sceneId: string) {
      if(!sceneId) return;
      const current = this.vnService.settings().endingScreen.gallery || [];
      const newItem: GalleryItem = { sceneId, showUiSnapshot: false, position: 'center' };
      this.updateNested('endingScreen', 'gallery', [...current, newItem]);
  }
  
  toggleGalleryUi(index: number) {
      const current = [...(this.vnService.settings().endingScreen.gallery || [])];
      if (current[index]) {
          current[index] = { ...current[index], showUiSnapshot: !current[index].showUiSnapshot };
          this.updateNested('endingScreen', 'gallery', current);
      }
  }

  removeGalleryItem(index: number) {
      const current = [...(this.vnService.settings().endingScreen.gallery || [])];
      current.splice(index, 1);
      this.updateNested('endingScreen', 'gallery', current);
  }

  addBonusScene(label: string, sceneId: string) {
      if(!sceneId || !label.trim()) return;
      const current = this.vnService.settings().endingScreen.bonusScenes || [];
      const newItem: BonusSceneItem = { id: crypto.randomUUID(), label: label.trim(), sceneId };
      this.updateNested('endingScreen', 'bonusScenes', [...current, newItem]);
  }

  removeBonusScene(itemId: string) {
      const current = this.vnService.settings().endingScreen.bonusScenes || [];
      this.updateNested('endingScreen', 'bonusScenes', current.filter(x => x.id !== itemId));
  }
}