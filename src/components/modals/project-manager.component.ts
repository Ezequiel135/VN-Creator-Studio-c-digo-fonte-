
import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { ProjectSummary } from '../../types';

@Component({
  selector: 'app-project-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
        <div class="bg-slate-900/95 w-full max-w-3xl md:rounded-3xl rounded-none p-6 md:p-8 border-0 md:border border-white/10 shadow-2xl flex flex-col h-full md:h-[85vh] overflow-hidden relative ring-1 ring-white/5 font-sans">
            
            <!-- Header -->
            <div class="flex justify-between items-center shrink-0 mb-4 md:mb-8 border-b border-white/5 pb-4">
                <div class="flex items-center gap-3">
                    <span class="bg-cyan-500/20 text-cyan-400 p-2 rounded-xl text-xl md:text-2xl">📂</span>
                    <div>
                        <h2 class="text-xl md:text-2xl font-black text-white tracking-tight">Meus Projetos</h2>
                        <p class="text-xs text-slate-400 font-medium">Gerencie suas histórias visuais</p>
                    </div>
                </div>
                <!-- Large Close Button -->
                <button (click)="close.emit()" class="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-colors border border-white/10">✕</button>
            </div>
            
            <!-- Grid List -->
            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20 md:pb-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for (project of vnService.projectList(); track project.id) {
                        <div class="bg-slate-950/50 p-5 rounded-2xl border transition-all hover:scale-[1.02] group relative overflow-hidden"
                                [class.border-cyan-500]="project.id === vnService.activeProjectId()"
                                [class.bg-cyan-900_10]="project.id === vnService.activeProjectId()"
                                [class.shadow-lg]="project.id === vnService.activeProjectId()"
                                [class.shadow-cyan-900_20]="project.id === vnService.activeProjectId()"
                                [class.border-white_5]="project.id !== vnService.activeProjectId()">
                            
                            <div class="flex justify-between items-start mb-3 relative z-10">
                                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/5"
                                     [class.bg-cyan-500_20]="project.id === vnService.activeProjectId()"
                                     [class.text-cyan-400]="project.id === vnService.activeProjectId()"
                                     [class.bg-slate-900]="project.id !== vnService.activeProjectId()"
                                     [class.text-slate-500]="project.id !== vnService.activeProjectId()">
                                    {{ project.id === vnService.activeProjectId() ? '🌟' : '📁' }}
                                </div>
                                
                                <div class="flex gap-2">
                                    @if (project.id !== vnService.activeProjectId()) {
                                        <button (click)="switchProject(project.id)" class="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 rounded-lg text-[10px] text-white transition-colors font-bold border border-white/10 hover:border-transparent">
                                            Abrir
                                        </button>
                                    } @else {
                                        <span class="px-3 py-1 text-cyan-400 text-[10px] font-black bg-cyan-950 border border-cyan-900 rounded-lg uppercase tracking-wider">Ativo</span>
                                    }
                                    <button (click)="initDeleteProject(project)" class="w-7 h-7 flex items-center justify-center bg-red-900/10 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-900/50" title="Apagar">
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            <div class="relative z-10">
                                @if (editingProjectId() === project.id) {
                                    <div class="flex gap-2 animate-in fade-in">
                                        <input type="text" [(ngModel)]="tempEditName" 
                                                class="flex-1 bg-black/50 border border-cyan-500/50 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                                                (keyup.enter)="confirmEditName()" autofocus>
                                        <button (click)="confirmEditName()" class="bg-green-600 hover:bg-green-500 w-8 flex items-center justify-center rounded-lg text-white text-xs">✓</button>
                                        <button (click)="cancelEditName()" class="bg-slate-700 hover:bg-slate-600 w-8 flex items-center justify-center rounded-lg text-white text-xs">✕</button>
                                    </div>
                                } @else {
                                    <div class="flex items-center gap-2 group/title">
                                        <h3 class="font-bold text-white text-lg cursor-pointer hover:text-cyan-400 truncate transition-colors" (click)="switchProject(project.id)">
                                            {{ project.name }}
                                        </h3>
                                        <button (click)="startEditName(project)" class="text-slate-600 hover:text-cyan-400 opacity-0 group-hover/title:opacity-100 transition-opacity" title="Renomear">
                                            ✏️
                                        </button>
                                    </div>
                                    <p class="text-xs text-slate-500 mt-1 font-mono">
                                        {{ newDate(project.lastModified).toLocaleDateString() }} às {{ newDate(project.lastModified).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) }}
                                    </p>
                                }
                            </div>
                            
                            <!-- Background Decoration -->
                            <div class="absolute -bottom-4 -right-4 text-9xl opacity-[0.03] rotate-12 pointer-events-none select-none">
                                📝
                            </div>
                        </div>
                    }
                </div>
            </div>

            <!-- Footer Create -->
            <div class="mt-auto pt-4 md:mt-6 md:pt-6 border-t border-white/5 shrink-0 bg-slate-900 md:bg-transparent pb-4 md:pb-0">
                @if (isCreatingProject()) {
                    <div class="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 animate-in slide-in-from-bottom-2 fade-in">
                        <label class="block text-xs font-bold text-cyan-500 uppercase mb-2 ml-1">Nome do Novo Projeto</label>
                        <div class="flex gap-3">
                            <input type="text" [(ngModel)]="newProjectName" placeholder="Ex: Minha Aventura Épica" 
                                    class="flex-1 bg-black/30 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                    (keyup.enter)="confirmCreateProject()" autofocus>
                            <button (click)="confirmCreateProject()" class="bg-cyan-600 hover:bg-cyan-500 px-6 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95">Criar</button>
                            <button (click)="isCreatingProject.set(false)" class="bg-slate-800 hover:bg-slate-700 px-4 rounded-xl text-white font-medium transition-colors">Cancelar</button>
                        </div>
                    </div>
                } @else {
                    <button (click)="startCreateProject()" class="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded-2xl transition-all flex items-center justify-center gap-3 font-bold group shadow-lg">
                        <span class="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-lg group-hover:bg-cyan-500 transition-colors shadow">+</span> 
                        Criar Novo Projeto
                    </button>
                }
            </div>
        </div>
        
        <!-- Delete Confirmation Overlay -->
        @if (projectDeleteStep() !== 'none') {
            <div class="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 z-[210] animate-in fade-in duration-200">
                <div class="bg-slate-900 p-8 rounded-3xl border border-red-500/30 max-w-sm w-full text-center shadow-2xl scale-100 ring-1 ring-red-500/10">
                    <div class="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">🗑️</div>
                    <h3 class="text-2xl font-black text-white mb-2 tracking-tight">
                        {{ projectDeleteStep() === 'confirm' ? 'Tem certeza?' : 'Backup?' }}
                    </h3>
                    
                    @if (projectDeleteStep() === 'confirm') {
                        <p class="text-slate-400 text-sm mb-8 leading-relaxed">
                            Você vai apagar <strong class="text-white block mt-1 text-lg">"{{ projectToDelete()?.name }}"</strong>.<br>
                            Isso não pode ser desfeito.
                        </p>
                        <div class="flex flex-col gap-3">
                            <button (click)="projectDeleteStep.set('options')" class="bg-red-600 hover:bg-red-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-900/30 transition-transform active:scale-95">Sim, continuar</button>
                            <button (click)="cancelDeleteProject()" class="bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl font-bold transition-colors">Cancelar</button>
                        </div>
                    } @else {
                        <p class="text-slate-400 text-sm mb-8">Recomendamos baixar um backup antes.</p>
                        <div class="flex flex-col gap-3">
                            <button (click)="confirmDeleteProject(true)" class="bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95">
                                <span>⬇️</span> Baixar Backup e Apagar
                            </button>
                            <button (click)="confirmDeleteProject(false)" class="bg-red-900/50 hover:bg-red-900 text-red-200 py-3.5 rounded-xl font-bold transition-colors border border-red-900">
                                Apagar sem Backup
                            </button>
                            <button (click)="cancelDeleteProject()" class="text-slate-500 hover:text-white py-2 text-xs mt-2 underline">Voltar</button>
                        </div>
                    }
                </div>
            </div>
        }
    </div>
  `
})
export class ProjectManagerComponent {
  vnService = inject(VnService);
  close = output<void>();

  isCreatingProject = signal(false);
  newProjectName = '';
  editingProjectId = signal<string | null>(null);
  tempEditName = '';
  projectDeleteStep = signal<'none' | 'confirm' | 'options'>('none');
  projectToDelete = signal<ProjectSummary | null>(null);

  newDate(ts: number) { return new Date(ts); }

  switchProject(id: string) {
     this.vnService.loadProject(id);
     this.close.emit();
  }

  startCreateProject() {
      this.isCreatingProject.set(true);
      this.newProjectName = '';
  }

  confirmCreateProject() {
      if (this.newProjectName.trim()) {
          this.vnService.createNewProject(this.newProjectName.trim());
          this.isCreatingProject.set(false);
          this.close.emit();
      }
  }

  startEditName(project: ProjectSummary) {
      this.editingProjectId.set(project.id);
      this.tempEditName = project.name;
  }

  confirmEditName() {
      const id = this.editingProjectId();
      if (id && this.tempEditName.trim()) {
          this.vnService.updateProjectNameInList(id, this.tempEditName.trim());
          this.editingProjectId.set(null);
      }
  }

  cancelEditName() {
      this.editingProjectId.set(null);
  }

  initDeleteProject(project: ProjectSummary) {
      this.projectToDelete.set(project);
      this.projectDeleteStep.set('confirm');
  }

  confirmDeleteProject(withDownload: boolean) {
      const p = this.projectToDelete();
      if (!p) return;
      if (withDownload) this.vnService.deleteProjectWithExport(p.id);
      else this.vnService.deleteProject(p.id);
      this.projectDeleteStep.set('none');
      this.projectToDelete.set(null);
  }

  cancelDeleteProject() {
      this.projectDeleteStep.set('none');
      this.projectToDelete.set(null);
  }
}
