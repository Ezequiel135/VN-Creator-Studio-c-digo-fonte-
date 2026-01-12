
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../services/admin-api.service';
import { MockBackendService } from '../services/mock-backend.service';
import { DbUser, DbProject } from '../types/database.types';
import { SupportTicket, AdminStats } from '../types/advanced-platform.types';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
        <!-- Admin Header -->
        <header class="h-16 bg-red-950/30 border-b border-red-900/30 flex items-center justify-between px-6 shrink-0">
            <div class="flex items-center gap-3">
                <span class="bg-red-600 text-white font-black px-2 py-1 rounded text-xs">ADMIN</span>
                <h1 class="font-bold text-white">Painel de Controle</h1>
            </div>
            <div class="flex items-center gap-4 text-xs">
                <span class="text-red-300">{{ currentDate | date:'medium' }}</span>
                <button (click)="logout()" class="hover:text-white hover:underline">Sair</button>
            </div>
        </header>

        <!-- Main Area -->
        <div class="flex-1 flex overflow-hidden">
            <!-- Sidebar -->
            <nav class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 gap-2">
                <button (click)="view.set('overview')" class="text-left px-4 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-3"
                        [class.bg-slate-800]="view() === 'overview'" [class.text-white]="view() === 'overview'" [class.text-slate-400]="view() !== 'overview'">
                    <span>📊</span> Visão Geral
                </button>
                <button (click)="view.set('users')" class="text-left px-4 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-3"
                        [class.bg-slate-800]="view() === 'users'" [class.text-white]="view() === 'users'" [class.text-slate-400]="view() !== 'users'">
                    <span>👥</span> Usuários
                </button>
                <button (click)="view.set('projects')" class="text-left px-4 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-3"
                        [class.bg-slate-800]="view() === 'projects'" [class.text-white]="view() === 'projects'" [class.text-slate-400]="view() !== 'projects'">
                    <span>📂</span> Projetos
                </button>
                <button (click)="view.set('tickets')" class="text-left px-4 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-3"
                        [class.bg-slate-800]="view() === 'tickets'" [class.text-white]="view() === 'tickets'" [class.text-slate-400]="view() !== 'tickets'">
                    <span>🆘</span> Suporte @if(openTicketsCount() > 0){ <span class="bg-red-600 text-white text-[10px] px-1.5 rounded-full">{{ openTicketsCount() }}</span> }
                </button>
                <button (click)="view.set('logs')" class="text-left px-4 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-3"
                        [class.bg-slate-800]="view() === 'logs'" [class.text-white]="view() === 'logs'" [class.text-slate-400]="view() !== 'logs'">
                    <span>🛡️</span> Auditoria
                </button>
            </nav>

            <!-- Content -->
            <main class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950">
                
                <!-- VIEW: OVERVIEW -->
                @if (view() === 'overview') {
                    <div class="space-y-8 animate-in fade-in">
                        <h2 class="text-2xl font-bold text-white">Dashboard</h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div class="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                <div class="text-slate-400 text-xs font-bold uppercase mb-1">Total Usuários</div>
                                <div class="text-3xl font-black text-white">{{ stats()?.totalUsers }}</div>
                                <div class="text-xs text-green-400 mt-2">{{ stats()?.activeUsersLast24h }} ativos hoje</div>
                            </div>
                            <div class="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                <div class="text-slate-400 text-xs font-bold uppercase mb-1">Projetos</div>
                                <div class="text-3xl font-black text-white">{{ stats()?.totalProjects }}</div>
                                <div class="text-xs text-slate-500 mt-2">
                                    {{ stats()?.publicProjects }} Públicos • {{ stats()?.privateProjects }} Privados
                                </div>
                            </div>
                            <div class="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                <div class="text-slate-400 text-xs font-bold uppercase mb-1">Tickets Abertos</div>
                                <div class="text-3xl font-black text-white">{{ stats()?.openTickets }}</div>
                                <div class="text-xs text-yellow-500 mt-2">Requer atenção</div>
                            </div>
                            <div class="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                <div class="text-slate-400 text-xs font-bold uppercase mb-1">Fila de Integração</div>
                                <div class="text-3xl font-black text-white">{{ stats()?.integrationQueueSize }}</div>
                                <div class="text-xs text-cyan-500 mt-2">Executor Player Sync</div>
                            </div>
                        </div>

                        <!-- System Notification Sender -->
                        <div class="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-2xl">
                            <h3 class="font-bold text-white mb-4">📢 Enviar Notificação Global</h3>
                            <div class="flex gap-2 mb-2">
                                <input [(ngModel)]="notifTitle" type="text" placeholder="Título" class="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white flex-1 outline-none">
                                <select [(ngModel)]="notifType" class="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300">
                                    <option value="info">ℹ️ Info</option>
                                    <option value="warning">⚠️ Aviso</option>
                                    <option value="system">🛠️ Sistema</option>
                                </select>
                            </div>
                            <textarea [(ngModel)]="notifMsg" rows="2" placeholder="Mensagem para todos os usuários..." class="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white mb-2 outline-none"></textarea>
                            <button (click)="sendGlobalNotif()" class="bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded text-sm font-bold">Enviar Push</button>
                        </div>
                    </div>
                }

                <!-- VIEW: USERS -->
                @if (view() === 'users') {
                    <div>
                        <h2 class="text-2xl font-bold text-white mb-6">Gerenciamento de Usuários</h2>
                        <div class="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                            <table class="w-full text-left text-sm text-slate-400">
                                <thead class="bg-slate-950 text-slate-200 font-bold uppercase text-xs">
                                    <tr>
                                        <th class="p-4">ID / Nome</th>
                                        <th class="p-4">Email</th>
                                        <th class="p-4">Status</th>
                                        <th class="p-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800">
                                    @for(u of users(); track u.id) {
                                        <tr class="hover:bg-slate-800/50 transition-colors">
                                            <td class="p-4">
                                                <div class="font-bold text-white">{{ u.name }}</div>
                                                <div class="text-[10px] font-mono">{{ u.id }}</div>
                                            </td>
                                            <td class="p-4">{{ u.email }}</td>
                                            <td class="p-4">
                                                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase"
                                                      [class.bg-green-900_30]="u.status === 'active'" [class.text-green-400]="u.status === 'active'"
                                                      [class.bg-red-900_30]="u.status === 'banned'" [class.text-red-400]="u.status === 'banned'">
                                                    {{ u.status }}
                                                </span>
                                            </td>
                                            <td class="p-4 flex gap-2">
                                                @if(u.status === 'active') {
                                                    <button (click)="banUser(u.id)" class="text-red-400 hover:text-white border border-red-900/50 bg-red-900/20 px-3 py-1 rounded text-xs">Banir</button>
                                                } @else {
                                                    <button (click)="unbanUser(u.id)" class="text-green-400 hover:text-white border border-green-900/50 bg-green-900/20 px-3 py-1 rounded text-xs">Desbanir</button>
                                                }
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                }

                <!-- VIEW: TICKETS -->
                @if (view() === 'tickets') {
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                        <div class="col-span-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
                            <div class="p-4 bg-slate-950 font-bold border-b border-slate-800">Chamados Abertos</div>
                            <div class="flex-1 overflow-y-auto p-2 space-y-2">
                                @for(t of tickets(); track t.id) {
                                    <div (click)="selectedTicket.set(t)" 
                                         class="p-3 rounded border cursor-pointer hover:bg-slate-800 transition-colors"
                                         [class.bg-slate-800]="selectedTicket()?.id === t.id"
                                         [class.border-cyan-500]="selectedTicket()?.id === t.id"
                                         [class.border-slate-800]="selectedTicket()?.id !== t.id">
                                        <div class="flex justify-between items-start">
                                            <span class="font-bold text-sm text-white truncate">{{ t.subject }}</span>
                                            <span class="text-[10px] bg-slate-950 px-1.5 rounded">{{ t.priority }}</span>
                                        </div>
                                        <div class="text-[10px] text-slate-500 mt-1 flex justify-between">
                                            <span>{{ t.category }}</span>
                                            <span>{{ t.updatedAt | date:'short' }}</span>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>

                        <div class="col-span-2 bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-[600px]">
                            @if(selectedTicket(); as t) {
                                <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                                    <div class="font-bold text-white">{{ t.subject }}</div>
                                    <button (click)="closeTicket(t.id)" class="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded">Marcar Resolvido</button>
                                </div>
                                <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
                                    @for(msg of t.messages; track msg.id) {
                                        <div class="flex gap-3" [class.flex-row-reverse]="msg.senderRole !== 'user'">
                                            <div class="p-3 rounded-lg text-sm max-w-[80%]"
                                                 [class.bg-slate-800]="msg.senderRole === 'user'"
                                                 [class.text-slate-300]="msg.senderRole === 'user'"
                                                 [class.bg-cyan-900_30]="msg.senderRole !== 'user'"
                                                 [class.text-cyan-100]="msg.senderRole !== 'user'"
                                                 [class.border]="msg.senderRole !== 'user'"
                                                 [class.border-cyan-500_30]="msg.senderRole !== 'user'">
                                                <div class="text-[10px] opacity-50 mb-1 font-bold">{{ msg.senderRole | uppercase }}</div>
                                                {{ msg.message }}
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div class="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
                                    <input [(ngModel)]="ticketReply" type="text" class="flex-1 bg-slate-800 border border-slate-700 rounded px-3 text-sm text-white" placeholder="Resposta do suporte...">
                                    <button (click)="replyTicket()" class="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded text-sm font-bold">Enviar</button>
                                </div>
                            } @else {
                                <div class="flex items-center justify-center h-full text-slate-600">Selecione um ticket</div>
                            }
                        </div>
                    </div>
                }
            </main>
        </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  adminApi = inject(AdminApiService);
  backend = inject(MockBackendService); // Direct access for mock ease, in prod use AdminApi strictly
  
  view = signal<'overview'|'users'|'projects'|'tickets'|'logs'>('overview');
  stats = signal<AdminStats | null>(null);
  users = signal<DbUser[]>([]);
  tickets = signal<SupportTicket[]>([]);
  
  // Ticket logic
  selectedTicket = signal<SupportTicket | null>(null);
  ticketReply = '';
  openTicketsCount = signal(0);

  // Notif logic
  notifTitle = '';
  notifMsg = '';
  notifType: any = 'info';

  currentDate = new Date();
  
  // Token Mock
  private token = 'SECRET_ADMIN_TOKEN_123';

  async ngOnInit() {
      // Auto-login as admin for demo
      await this.backend.adminLogin(this.token);
      this.loadAll();
  }

  async loadAll() {
      const s = await this.backend.getAdminStats(this.token);
      if(s.success) this.stats.set(s.data!);

      const u = await this.adminApi.getAllUsers(this.token);
      if(u.success) this.users.set(u.data!);

      const t = await this.backend.getAllTickets(this.token);
      if(t.success) {
          this.tickets.set(t.data!.sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
          this.openTicketsCount.set(t.data!.filter(x => x.status === 'open').length);
      }
  }

  async banUser(id: string) {
      if(confirm('Banir este usuário?')) {
          await this.adminApi.banUser(this.token, id);
          this.loadAll();
      }
  }

  async unbanUser(id: string) {
      await this.adminApi.unbanUser(this.token, id);
      this.loadAll();
  }

  async sendGlobalNotif() {
      if(!this.notifTitle || !this.notifMsg) return;
      await this.adminApi.sendNotification(this.token, {
          title: this.notifTitle,
          message: this.notifMsg,
          type: this.notifType
      });
      alert('Enviado!');
      this.notifTitle = ''; this.notifMsg = '';
  }

  async replyTicket() {
      const t = this.selectedTicket();
      if(!t || !this.ticketReply) return;
      await this.backend.addTicketMessage(t.id, this.ticketReply);
      this.ticketReply = '';
      this.loadAll();
      // Update local view
      const updated = this.tickets().find(x => x.id === t.id);
      this.selectedTicket.set(updated || null);
  }

  async closeTicket(id: string) {
      await this.backend.closeTicket(this.token, id);
      this.loadAll();
      this.selectedTicket.set(null);
  }

  logout() {
      this.backend.logout();
      window.location.reload(); // Simple redirect mock
  }
}
