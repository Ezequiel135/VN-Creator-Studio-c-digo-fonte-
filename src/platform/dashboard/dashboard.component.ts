
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockBackendService } from '../services/mock-backend.service';
import { ExecutorBridgeService } from '../services/executor-bridge.service';
import { VnService } from '../../services/vn.service'; 
import { DbProject } from '../types/database.types';
import { Router, RouterModule } from '@angular/router';
import { NotificationBellComponent } from './notification-bell.component'; 

@Component({
  selector: 'app-platform-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationBellComponent, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      
      <!-- Navbar -->
      <nav class="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-3">
           <div class="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white">VN</div>
           <h1 class="font-bold text-white">Painel do Criador</h1>
        </div>
        <div class="flex items-center gap-4">
           
           <a routerLink="/support" class="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-white font-bold transition-colors flex items-center gap-2">
               <span>🆘</span> Suporte
           </a>

           <app-notification-bell></app-notification-bell>
           
           <div class="h-6 w-px bg-slate-700 mx-1"></div>

           <span class="text-sm text-slate-400">Olá, <strong class="text-white">{{ backend.currentUser()?.name }}</strong></span>
           <button (click)="logout()" class="text-xs border border-slate-700 hover:bg-slate-800 px-3 py-1.5 rounded transition-colors">Sair</button>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
        
        <div class="flex justify-between items-end mb-8">
           <div>
             <h2 class="text-3xl font-black text-white mb-2">Seus Projetos</h2>
             <p class="text-slate-400 text-sm">Gerencie a visibilidade e publicação no Executor Player.</p>
           </div>
           <div class="flex gap-2">
              <button (click)="importFromLocal()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2">
                  <span>📥</span> Importar do Editor Local
              </button>
              <button routerLink="/" class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold text-sm border border-slate-700">
                  Voltar ao Editor
              </button>
           </div>
        </div>

        @if (loading()) {
            <div class="text-center py-20 animate-pulse text-slate-500">Carregando projetos...</div>
        } @else if (projects().length === 0) {
            <div class="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-10 text-center">
                <div class="text-4xl mb-4">📂</div>
                <h3 class="text-xl font-bold text-white mb-2">Nenhum projeto na nuvem</h3>
                <p class="text-slate-400 text-sm mb-6">Importe seu projeto atual do editor para começar a gerenciar.</p>
                <button (click)="importFromLocal()" class="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold">Importar Projeto Atual</button>
            </div>
        } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (proj of projects(); track proj.id) {
                    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all shadow-xl flex flex-col relative group">
                        
                        <!-- Admin Flag Badge -->
                        @if (proj.adminFlagged) {
                            <div class="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 z-10 rounded-bl shadow-lg">⚠️ MODERADO</div>
                        }

                        <!-- Header / Status -->
                        <div class="p-4 border-b border-slate-800 bg-slate-950/30 flex justify-between items-start">
                            <div>
                                <h3 class="font-bold text-white text-lg truncate w-48">{{ proj.name }}</h3>
                                <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                                      [class.bg-green-900_30]="proj.visibility === 'public'" [class.text-green-400]="proj.visibility === 'public'"
                                      [class.bg-slate-800]="proj.visibility === 'private'" [class.text-slate-400]="proj.visibility === 'private'">
                                    {{ proj.visibility === 'public' ? 'Público' : 'Privado' }}
                                </span>
                            </div>
                            <div class="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-lg">🎮</div>
                        </div>

                        <!-- Body -->
                        <div class="p-4 flex-1">
                            <p class="text-xs text-slate-400 line-clamp-3 mb-4 min-h-[3rem]">{{ proj.description || 'Sem descrição.' }}</p>
                            
                            <div class="space-y-3">
                                <!-- Visibility Toggle -->
                                <div class="flex items-center justify-between bg-black/20 p-2 rounded border border-slate-800">
                                    <span class="text-xs font-bold text-slate-300">Visibilidade</span>
                                    <button (click)="toggleVisibility(proj)" class="text-xs px-2 py-1 rounded transition-colors"
                                            [class.text-cyan-400]="proj.visibility === 'private'"
                                            [class.hover:bg-slate-800]="true">
                                        {{ proj.visibility === 'public' ? 'Tornar Privado' : 'Tornar Público' }}
                                    </button>
                                </div>

                                <!-- Publish Status -->
                                <div class="flex items-center justify-between text-xs">
                                    <span class="text-slate-500">Executor Status:</span>
                                    <span class="font-mono" 
                                          [class.text-yellow-500]="proj.publishStatus === 'draft'"
                                          [class.text-green-500]="proj.publishStatus === 'published'"
                                          [class.text-red-500]="proj.publishStatus === 'error'">
                                        {{ proj.publishStatus | uppercase }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
                            <button (click)="publish(proj)" [disabled]="publishingId() === proj.id" 
                                    class="flex-1 bg-cyan-700 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold py-2.5 rounded transition-all flex justify-center items-center gap-2">
                                @if(publishingId() === proj.id) { <span class="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span> Enviando... }
                                @else { <span>🚀</span> Publicar }
                            </button>
                            <button (click)="deleteProject(proj.id)" class="px-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 rounded text-xs">🗑️</button>
                        </div>
                    </div>
                }
            </div>
        }
      </div>
    </div>
  `
})
export class PlatformDashboardComponent implements OnInit {
  backend = inject(MockBackendService);
  executor = inject(ExecutorBridgeService);
  localVn = inject(VnService); 
  router = inject(Router);

  projects = signal<DbProject[]>([]);
  loading = signal(true);
  publishingId = signal<string | null>(null);

  ngOnInit() {
    this.loadProjects();
  }

  async loadProjects() {
    this.loading.set(true);
    const res = await this.backend.getMyProjects();
    if (res.success && res.data) {
      this.projects.set(res.data);
    }
    this.loading.set(false);
  }

  logout() {
    this.backend.logout();
    this.router.navigate(['/auth']);
  }

  async importFromLocal() {
    const localData = {
        settings: this.localVn.settings(),
        scenes: this.localVn.scenes(),
        assets: this.localVn.assets(), 
        achievements: this.localVn.achievements()
    };
    
    const name = this.localVn.projectList().find(p => p.id === this.localVn.activeProjectId())?.name || 'Projeto Importado';

    const res = await this.backend.createProject(name, 'Importado do Editor Local', 'private', localData);
    if (res.success) {
      this.loadProjects(); 
      alert('Projeto importado com sucesso para a Nuvem!');
    }
  }

  async toggleVisibility(proj: DbProject) {
    const newVis = proj.visibility === 'public' ? 'private' : 'public';
    const res = await this.backend.updateProject(proj.id, { visibility: newVis });
    if (res.success) this.loadProjects();
  }

  async deleteProject(id: string) {
    if(confirm('Tem certeza? Isso apaga da nuvem.')) {
        await this.backend.deleteProject(id);
        this.loadProjects();
    }
  }

  async publish(proj: DbProject) {
    this.publishingId.set(proj.id);
    
    const token = this.backend.currentUser()?.token || '';
    const apiRes = await this.executor.publishProject(proj, token);

    if (apiRes.success && apiRes.data) {
        await this.backend.updateProject(proj.id, { 
            publishStatus: 'published',
            externalId: apiRes.data.externalId,
            lastPublishedAt: new Date()
        });
        alert('Publicado com sucesso no Executor Player!');
    } else {
        await this.backend.updateProject(proj.id, { publishStatus: 'error' });
        alert(`Erro na publicação: ${apiRes.error}`);
    }

    this.publishingId.set(null);
    this.loadProjects();
  }
}
