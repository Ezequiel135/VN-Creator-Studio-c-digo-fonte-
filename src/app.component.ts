
import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router'; // Import RouterOutlet e Router
import { VnService } from './services/vn.service';
import { SceneEditorComponent } from './components/scene-editor.component';
import { GamePlayerComponent } from './components/game-player.component';
import { SettingsModalComponent } from './components/modals/settings-modal.component';
import { ProjectManagerComponent } from './components/modals/project-manager.component';
import { AchievementManagerComponent } from './components/modals/achievement-manager.component';
import { TutorialModalComponent } from './components/modals/tutorial-modal.component';
import { toggleDocumentFullscreen } from './utils/fullscreen.utils';
import { ENGINE_TERMS_HTML } from './data/engine-terms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
      CommonModule, 
      FormsModule, 
      RouterOutlet, // Adicionado aos imports
      SceneEditorComponent, 
      GamePlayerComponent, 
      SettingsModalComponent, 
      ProjectManagerComponent,
      AchievementManagerComponent,
      TutorialModalComponent
  ],
  template: `
    <div class="h-[100dvh] w-screen bg-zinc-950 flex flex-col text-slate-200 overflow-hidden font-sans">
      
      <!-- Top Bar (Persistent) -->
      <header class="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 select-none z-50 shrink-0">
         <div class="flex items-center gap-3">
           <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg text-xs md:text-base transform rotate-3">VN</div>
           <h1 class="font-bold text-slate-300 hidden sm:block text-sm md:text-base tracking-tight">{{ activeProjectName() }}</h1>
         </div>

         <div class="flex items-center gap-2 md:gap-4">
            
            <!-- PLATFORM BUTTON -->
            <button (click)="goToPlatform()" class="hidden md:flex items-center gap-2 px-3 py-1 bg-indigo-900/30 hover:bg-indigo-600 border border-indigo-500/30 rounded-lg text-xs font-bold text-indigo-300 hover:text-white transition-all mr-2">
                <span>☁️</span> Nuvem / Publicar
            </button>

            <div class="flex bg-zinc-800/50 p-1 rounded-xl border border-zinc-700/50">
               <button (click)="trySwitchToEdit()" 
                       class="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                       [class.bg-slate-600]="viewMode() === 'edit'"
                       [class.text-white]="viewMode() === 'edit'"
                       [class.shadow-md]="viewMode() === 'edit'"
                       [class.text-slate-400]="viewMode() !== 'edit'">
                  Editor
               </button>
               <button (click)="playFromStart()" 
                       class="px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                       [class.bg-emerald-600]="viewMode() === 'play'"
                       [class.text-white]="viewMode() === 'play'"
                       [class.shadow-md]="viewMode() === 'play'"
                       [class.text-slate-400]="viewMode() !== 'play'">
                  ▶ Testar
               </button>
            </div>

            <button (click)="showTutorial.set(true)" class="p-2 hover:bg-zinc-800 rounded-full transition-colors text-cyan-400 font-bold border border-cyan-900/30 bg-cyan-900/10" title="Manual / Tutorial">
                ?
            </button>

            <button (click)="handleFullscreen()" 
                    class="p-2 hover:bg-zinc-800 rounded-full transition-colors active:bg-zinc-700 text-slate-300 hover:text-white" 
                    title="Alternar Tela Cheia">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>

            <!-- Main Dropdown Menu (Only in Edit Mode) -->
            @if (viewMode() === 'edit') {
                <div class="relative">
                  <button (click)="toggleMenu()" class="p-2 hover:bg-zinc-800 rounded-full transition-colors active:bg-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>

                  @if (menuOpen()) {
                    <div class="absolute right-0 top-full mt-2 w-72 bg-zinc-800/95 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl py-2 z-[100] animate-in slide-in-from-top-2 fade-in duration-200 overflow-hidden">
                      <div class="grid grid-cols-2 gap-2 px-3 pb-2 border-b border-zinc-700/50">
                          <button (click)="vnService.undo(); menuOpen.set(false)" class="p-2 bg-zinc-700/50 hover:bg-zinc-600 rounded-lg text-xs text-slate-300 font-medium">↩ Desfazer</button>
                          <button (click)="vnService.redo(); menuOpen.set(false)" class="p-2 bg-zinc-700/50 hover:bg-zinc-600 rounded-lg text-xs text-slate-300 font-medium">↪ Refazer</button>
                      </div>
                      
                      <div class="px-2 py-2 space-y-1">
                          <button (click)="goToPlatform()" class="w-full text-left px-4 py-2 hover:bg-zinc-700/50 rounded-lg text-sm font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">☁️ Plataforma / Publicar</button>
                          <button (click)="showProjectManager.set(true); menuOpen.set(false)" class="w-full text-left px-4 py-2 hover:bg-zinc-700/50 rounded-lg text-sm font-bold text-white bg-cyan-500/10 border border-cyan-500/20">📂 Projetos Locais</button>
                          <button (click)="showSettings.set(true); menuOpen.set(false)" class="w-full text-left px-4 py-2 hover:bg-zinc-700/50 rounded-lg text-sm text-slate-200">⚙️ Configurações</button>
                          <button (click)="openSetPassword()" class="w-full text-left px-4 py-2 hover:bg-zinc-700/50 rounded-lg text-sm text-slate-200">🔐 Segurança</button>
                          <button (click)="showAchievements.set(true); menuOpen.set(false)" class="w-full text-left px-4 py-2 hover:bg-zinc-700/50 rounded-lg text-sm text-slate-200">🏆 Conquistas</button>
                      </div>
                      
                      <div class="h-px bg-zinc-700/50 mx-2 my-1"></div>
                      
                      <!-- Quick Scene Switcher -->
                      <div class="px-3 py-2">
                        <input type="text" [(ngModel)]="searchTerm" class="w-full bg-black/30 border border-zinc-600/50 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500/50 outline-none" placeholder="Buscar cena...">
                      </div>
                      <div class="px-2 pb-2 max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
                          @for (scene of filteredScenes(); track scene.id) {
                            <div class="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-zinc-700/50 transition-colors cursor-pointer">
                              <button (click)="selectScene(scene.id)" class="text-left text-xs truncate flex-1 hover:text-cyan-400 text-slate-300 font-medium">
                                  {{ scene.name }}
                              </button>
                              <button (click)="deleteSceneFromMenu(scene.id, scene.name, $event)" 
                                      class="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                      title="Apagar Cena">
                                  ✕
                              </button>
                            </div>
                          }
                      </div>
                      
                      <div class="h-px bg-zinc-700/50 mx-2 my-1"></div>
                      
                      <!-- Import/Export -->
                      <div class="px-2 py-2 space-y-1">
                          <button (click)="triggerJsonUpload()" class="w-full text-left px-4 py-2 hover:bg-zinc-700/50 rounded-lg text-xs text-yellow-100/70">Importar Projeto (.json)</button>
                          <input #jsonInput type="file" accept=".json" class="hidden" (change)="handleJsonProject($event)">
                          <button (click)="vnService.exportProjectAsJson(); menuOpen.set(false)" class="w-full text-left px-4 py-2 hover:bg-zinc-700/50 rounded-lg text-xs text-yellow-100/70">Exportar Projeto (.json)</button>
                          <button (click)="triggerZipUpload()" class="w-full text-left px-4 py-2 hover:bg-zinc-700/50 rounded-lg text-xs text-cyan-100/70">Importar Assets (.zip)</button>
                          <input #zipInput type="file" accept=".zip" class="hidden" (change)="handleZip($event)">
                      </div>
                      <div class="h-px bg-zinc-700/50 mx-2 my-1"></div>
                      <div class="px-2 pb-2">
                          <button (click)="showTutorial.set(true); menuOpen.set(false)" class="w-full text-left px-4 py-2 hover:bg-zinc-700/50 rounded-lg text-xs text-slate-400">📚 Manual / Tutorial</button>
                          <button (click)="showEngineTerms.set(true); menuOpen.set(false)" class="w-full text-left px-4 py-2 hover:bg-zinc-700/50 rounded-lg text-xs text-slate-400">📄 Termos da Engine</button>
                          <button (click)="startWipeFlow()" class="w-full text-left px-4 py-2 hover:bg-red-900/30 rounded-lg text-xs font-bold text-red-400">🗑️ Resetar Tudo</button>
                      </div>
                    </div>
                  }
                  @if (menuOpen()) { <div class="fixed inset-0 z-[90]" (click)="menuOpen.set(false)"></div> }
                </div>
            }
         </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-hidden relative flex flex-col h-full w-full">
        <!-- Conditional View: If URL is root, show Editor. If auth/dashboard, use router -->
        @if (router.url === '/') {
            @if (viewMode() === 'edit') {
               <app-scene-editor class="h-full w-full block"></app-scene-editor>
            } @else {
               <app-game-player class="h-full w-full block" (exit)="trySwitchToEdit()"></app-game-player>
            }
        } @else {
            <router-outlet></router-outlet>
        }
      </main>

      <!-- MODALS (Settings, Managers, etc.) -->
      @if (showSettings()) {
          <app-settings-modal (close)="showSettings.set(false)" (openPassword)="openSetPassword()"></app-settings-modal>
      }

      @if (showProjectManager()) {
          <app-project-manager (close)="showProjectManager.set(false)"></app-project-manager>
      }

      @if (showAchievements()) {
         <app-achievement-manager (close)="showAchievements.set(false)"></app-achievement-manager>
      }
      
      @if (showTutorial()) {
          <app-tutorial-modal (close)="showTutorial.set(false)"></app-tutorial-modal>
      }

      <!-- App Terms of Use Modal -->
      @if (showEngineTerms()) {
          <div class="fixed inset-0 z-[250] bg-black/90 flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
              <div class="bg-slate-900 w-full max-w-3xl h-[85vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                  <div class="p-4 border-b border-slate-700 bg-slate-950 flex justify-between items-center">
                      <h2 class="font-bold text-white text-lg">⚖️ Termos de Uso - VN Creator Studio</h2>
                      <button (click)="showEngineTerms.set(false)" class="text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800">✕</button>
                  </div>
                  
                  <div class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-900" 
                       [innerHTML]="engineTermsContent">
                  </div>

                  <div class="p-4 border-t border-slate-700 bg-slate-950 flex justify-end">
                      <button (click)="showEngineTerms.set(false)" class="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors">Fechar</button>
                  </div>
              </div>
          </div>
      }

      <!-- Password / Security Modal -->
      @if (showPasswordModal()) {
         <div class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
             <div class="bg-slate-800 w-full max-w-md rounded-xl border border-slate-600 shadow-2xl overflow-hidden">
                 <div class="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                     <h2 class="text-lg font-bold text-white flex items-center gap-2">
                         🔐 {{ passwordMode() === 'set' ? 'Central de Segurança' : 'Acesso Restrito' }}
                     </h2>
                     <button (click)="showPasswordModal.set(false)" class="text-slate-500 hover:text-white">✕</button>
                 </div>
                 <div class="p-6">
                     @if (passwordMode() === 'set') {
                         <div class="space-y-6">
                             <div class="p-3 bg-blue-900/20 border border-blue-800 rounded text-xs text-blue-200">Aqui você define as senhas para proteger seu projeto.</div>
                             <div>
                                 <label class="block text-sm font-bold text-slate-300 mb-1">Senha do Editor</label>
                                 <input type="password" [(ngModel)]="tempEditorPassword" class="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-cyan-500 outline-none transition-colors" placeholder="Deixe em branco para remover">
                                 <p class="text-[10px] text-slate-500 mt-1">Bloqueia o acesso à tela de edição deste projeto.</p>
                             </div>
                             <div class="border-t border-slate-700 pt-4">
                                 <label class="block text-sm font-bold text-slate-300 mb-1">Senha do Projeto (Execução)</label>
                                 <input type="text" [(ngModel)]="tempProjectPassword" class="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-cyan-500 outline-none transition-colors" placeholder="Opcional">
                                 <p class="text-[10px] text-slate-500 mt-1">Se definido, jogadores precisarão desta senha para iniciar o jogo.</p>
                             </div>
                         </div>
                         <div class="mt-8 flex gap-3">
                             <button (click)="handlePasswordSubmit()" class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded shadow-lg transition-transform active:scale-95">Salvar Proteções</button>
                         </div>
                     } @else {
                         <div class="text-center mb-6">
                             <div class="text-4xl mb-4">🔒</div>
                             <p class="text-slate-400 text-sm">Este projeto está protegido. Digite a senha de edição para continuar.</p>
                         </div>
                         <input type="password" [(ngModel)]="tempEditorPassword" (keyup.enter)="handlePasswordSubmit()" class="w-full bg-slate-900 border border-slate-500 rounded p-4 text-center text-xl text-white tracking-widest focus:border-cyan-500 outline-none mb-6 shadow-inner" placeholder="••••••" autofocus>
                         <button (click)="handlePasswordSubmit()" class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded shadow-lg transition-transform active:scale-95">Desbloquear Editor</button>
                     }
                 </div>
             </div>
         </div>
      }

      <!-- Wipe Confirmation -->
      @if (wipeStep() !== 'none') {
           <div class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
                <div class="bg-slate-800 p-6 rounded text-white border border-red-900 text-center max-w-sm">
                    <div class="text-4xl mb-4">🗑️</div>
                    <h3 class="text-xl font-bold mb-4">Resetar Tudo?</h3>
                    <p class="text-slate-400 mb-6 text-sm">Isso apagará TODOS os projetos, assets e configurações do navegador. Esta ação é irreversível.</p>
                    <div class="flex gap-4 justify-center">
                        <button (click)="justWipe()" class="bg-red-600 hover:bg-red-500 px-6 py-3 rounded font-bold transition-colors">Confirmar e Apagar</button>
                        <button (click)="wipeStep.set('none')" class="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded transition-colors font-bold">Cancelar</button>
                    </div>
                </div>
           </div>
      }
    </div>
  `
})
export class AppComponent {
  vnService = inject(VnService);
  router = inject(Router);
  
  viewMode = signal<'edit' | 'play'>('edit');
  menuOpen = signal(false);
  
  showSettings = signal(false);
  showProjectManager = signal(false);
  showAchievements = signal(false);
  showPasswordModal = signal(false);
  showEngineTerms = signal(false);
  showTutorial = signal(false);
  
  searchTerm = '';
  
  wipeStep = signal<'none'|'confirm'>('none');
  
  passwordMode = signal<'set'|'enter'>('enter');
  tempEditorPassword = '';
  tempProjectPassword = '';

  engineTermsContent = ENGINE_TERMS_HTML;
  
  activeProjectName = computed(() => {
      const id = this.vnService.activeProjectId();
      return this.vnService.projectList().find(p => p.id === id)?.name || 'VN Studio';
  });

  filteredScenes = computed(() => {
      const term = this.searchTerm.toLowerCase();
      return this.vnService.scenes().filter(s => s.name.toLowerCase().includes(term));
  });

  @ViewChild('jsonInput') jsonInput!: ElementRef<HTMLInputElement>;
  @ViewChild('zipInput') zipInput!: ElementRef<HTMLInputElement>;
  
  goToPlatform() {
      this.menuOpen.set(false);
      this.router.navigate(['/auth']);
  }

  trySwitchToEdit() {
      if (this.vnService.isLocked() && this.viewMode() === 'play') {
          this.passwordMode.set('enter');
          this.tempEditorPassword = '';
          this.showPasswordModal.set(true);
      } else {
          this.viewMode.set('edit');
      }
  }

  playFromStart() {
      this.viewMode.set('play');
  }

  handleFullscreen() {
      toggleDocumentFullscreen();
  }

  toggleMenu() { this.menuOpen.update(v => !v); }
  
  selectScene(id: string) {
      this.vnService.currentSceneId.set(id);
      this.menuOpen.set(false);
  }

  deleteSceneFromMenu(id: string, name: string, event: Event) {
      event.stopPropagation();
      if (confirm(`Apagar a cena "${name}"?`)) {
          this.vnService.deleteScene(id);
      }
  }

  openSetPassword() {
      this.passwordMode.set('set');
      this.tempEditorPassword = this.vnService.settings().password || '';
      this.tempProjectPassword = this.vnService.settings().projectPassword || '';
      this.showPasswordModal.set(true);
      this.menuOpen.set(false);
  }

  handlePasswordSubmit() {
      if (this.passwordMode() === 'set') {
          this.vnService.settings.update(s => ({ 
              ...s, 
              password: this.tempEditorPassword,
              projectPassword: this.tempProjectPassword
          }));
          this.vnService.isLocked.set(!!this.tempEditorPassword);
          this.showPasswordModal.set(false);
          alert('Segurança atualizada!');
      } else {
          if (this.tempEditorPassword === this.vnService.settings().password) {
              this.viewMode.set('edit');
              this.showPasswordModal.set(false);
          } else {
              alert('Senha incorreta!');
          }
      }
  }
  
  triggerJsonUpload() { this.jsonInput.nativeElement.click(); }
  async handleJsonProject(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files?.length) {
          const success = await this.vnService.loadProjectFromJson(input.files[0]);
          if(success) this.menuOpen.set(false);
          else alert('Erro ao carregar projeto.');
          input.value = '';
      }
  }

  triggerZipUpload() { this.zipInput.nativeElement.click(); }
  async handleZip(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files?.length) {
          const success = await this.vnService.importZip(input.files[0]);
          if(success) { alert('Assets importados com sucesso!'); this.menuOpen.set(false); }
          else alert('Erro ao importar ZIP.');
          input.value = '';
      }
  }

  startWipeFlow() {
      this.menuOpen.set(false);
      this.wipeStep.set('confirm');
  }

  async justWipe() {
      await this.vnService.performFullAppReset();
      this.wipeStep.set('none');
  }
}
