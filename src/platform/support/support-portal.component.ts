
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockBackendService } from '../services/mock-backend.service';
import { SupportTicket, TicketMessage } from '../types/advanced-platform.types';

@Component({
  selector: 'app-support-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 md:p-10">
        <div class="max-w-5xl mx-auto">
            
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-black text-white flex items-center gap-3">
                        <span class="text-pink-500">🆘</span> Central de Suporte
                    </h1>
                    <p class="text-slate-400 text-sm mt-1">Precisa de ajuda? Abra um chamado.</p>
                </div>
                <a routerLink="/dashboard" class="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-white font-bold transition-colors">Voltar ao Dashboard</a>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- LEFT: Create Ticket & List -->
                <div class="lg:col-span-1 space-y-6">
                    
                    <!-- Create Form -->
                    <div class="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl">
                        <h2 class="font-bold text-white mb-4 text-sm uppercase tracking-wider">Novo Chamado</h2>
                        <div class="space-y-3">
                            <input [(ngModel)]="newSubject" type="text" placeholder="Assunto (Ex: Erro no login)" class="w-full bg-slate-950 border border-slate-600 rounded p-3 text-sm text-white focus:border-pink-500 outline-none">
                            
                            <div class="flex gap-2">
                                <select [(ngModel)]="newCategory" class="flex-1 bg-slate-950 border border-slate-600 rounded p-3 text-sm text-slate-300">
                                    <option value="bug">🐛 Bug / Erro</option>
                                    <option value="account">👤 Conta</option>
                                    <option value="content">📄 Conteúdo</option>
                                    <option value="other">❓ Outro</option>
                                </select>
                                <select [(ngModel)]="newPriority" class="flex-1 bg-slate-950 border border-slate-600 rounded p-3 text-sm text-slate-300">
                                    <option value="low">Baixa</option>
                                    <option value="medium">Média</option>
                                    <option value="high">Alta</option>
                                </select>
                            </div>

                            <textarea [(ngModel)]="newMessage" rows="4" placeholder="Descreva seu problema..." class="w-full bg-slate-950 border border-slate-600 rounded p-3 text-sm text-white resize-none focus:border-pink-500 outline-none"></textarea>
                            
                            <button (click)="createTicket()" [disabled]="!newSubject || !newMessage || loading()" class="w-full py-3 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all">
                                {{ loading() ? 'Enviando...' : 'Abrir Ticket' }}
                            </button>
                        </div>
                    </div>

                    <!-- Ticket List -->
                    <div class="space-y-2">
                        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Seus Tickets</h3>
                        @if(myTickets().length === 0) {
                            <div class="text-center p-6 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-slate-500 text-sm">
                                Nenhum ticket aberto.
                            </div>
                        }
                        @for(t of myTickets(); track t.id) {
                            <div (click)="selectTicket(t)" 
                                 class="p-4 bg-slate-900 border cursor-pointer hover:bg-slate-800 transition-colors rounded-xl group relative overflow-hidden"
                                 [class.border-pink-500]="selectedTicket()?.id === t.id"
                                 [class.border-slate-800]="selectedTicket()?.id !== t.id">
                                 
                                <div class="flex justify-between items-start mb-1">
                                    <span class="font-bold text-slate-200 text-sm truncate w-32">{{ t.subject }}</span>
                                    <span class="text-[10px] px-2 py-0.5 rounded uppercase font-bold"
                                          [class.bg-green-900_30]="t.status === 'answered'"
                                          [class.text-green-400]="t.status === 'answered'"
                                          [class.bg-slate-800]="t.status === 'open'"
                                          [class.text-slate-400]="t.status === 'open'">
                                        {{ t.status }}
                                    </span>
                                </div>
                                <div class="text-[10px] text-slate-500">{{ formatDate(t.updatedAt) }} • {{ t.category }}</div>
                            </div>
                        }
                    </div>
                </div>

                <!-- RIGHT: Chat / Details -->
                <div class="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-2xl flex flex-col h-[600px] overflow-hidden shadow-2xl relative">
                    
                    @if(selectedTicket(); as ticket) {
                        <!-- Header -->
                        <div class="p-4 border-b border-slate-700 bg-slate-950 flex justify-between items-center shrink-0">
                            <div>
                                <h3 class="font-bold text-white">{{ ticket.subject }}</h3>
                                <span class="text-xs text-slate-400">ID: {{ ticket.id.split('-')[0] }}</span>
                            </div>
                            <div class="text-xs font-mono px-3 py-1 rounded bg-slate-800 text-slate-300">
                                Prioridade: {{ ticket.priority | uppercase }}
                            </div>
                        </div>

                        <!-- Chat Area -->
                        <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/20">
                            @for(msg of ticket.messages; track msg.id) {
                                <div class="flex gap-3" [class.flex-row-reverse]="msg.senderRole === 'user'">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0"
                                         [class.bg-pink-600]="msg.senderRole === 'user'"
                                         [class.bg-cyan-600]="msg.senderRole !== 'user'">
                                        {{ msg.senderRole === 'user' ? 'EU' : 'SUP' }}
                                    </div>
                                    <div class="max-w-[80%]">
                                        <div class="p-3 rounded-2xl text-sm leading-relaxed"
                                             [class.bg-pink-900_20]="msg.senderRole === 'user'"
                                             [class.border]="msg.senderRole === 'user'"
                                             [class.border-pink-500_30]="msg.senderRole === 'user'"
                                             [class.text-pink-100]="msg.senderRole === 'user'"
                                             [class.bg-slate-800]="msg.senderRole !== 'user'"
                                             [class.text-slate-200]="msg.senderRole !== 'user'">
                                            {{ msg.message }}
                                        </div>
                                        <div class="text-[9px] text-slate-600 mt-1 px-1" [class.text-right]="msg.senderRole === 'user'">
                                            {{ formatDate(msg.timestamp) }}
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                        <!-- Reply Box -->
                        @if(ticket.status !== 'closed') {
                            <div class="p-4 border-t border-slate-700 bg-slate-950 shrink-0">
                                <div class="flex gap-2">
                                    <input [(ngModel)]="replyText" (keyup.enter)="sendReply()" type="text" placeholder="Digite sua resposta..." class="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 text-sm text-white focus:border-pink-500 outline-none">
                                    <button (click)="sendReply()" class="bg-pink-600 hover:bg-pink-500 text-white px-4 rounded-lg font-bold">➤</button>
                                </div>
                            </div>
                        } @else {
                            <div class="p-4 bg-red-900/20 text-red-300 text-center text-sm font-bold border-t border-red-900/30">
                                Este ticket foi encerrado.
                            </div>
                        }

                    } @else {
                        <div class="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <span class="text-4xl mb-4 opacity-50">💬</span>
                            <p>Selecione um ticket para ver a conversa.</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    </div>
  `
})
export class SupportPortalComponent implements OnInit {
  backend = inject(MockBackendService);
  
  myTickets = signal<SupportTicket[]>([]);
  selectedTicket = signal<SupportTicket | null>(null);
  
  newSubject = '';
  newCategory: any = 'bug';
  newPriority: any = 'medium';
  newMessage = '';
  loading = signal(false);
  replyText = '';

  ngOnInit() {
      this.loadTickets();
  }

  async loadTickets() {
      const res = await this.backend.getMyTickets();
      if(res.success) {
          this.myTickets.set(res.data!.sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
      }
  }

  async createTicket() {
      if(!this.newSubject || !this.newMessage) return;
      this.loading.set(true);
      await this.backend.createTicket(this.newSubject, this.newMessage, this.newCategory, this.newPriority);
      this.newSubject = ''; this.newMessage = '';
      this.loading.set(false);
      this.loadTickets();
  }

  selectTicket(t: SupportTicket) {
      this.selectedTicket.set(t);
  }

  async sendReply() {
      if(!this.replyText || !this.selectedTicket()) return;
      await this.backend.addTicketMessage(this.selectedTicket()!.id, this.replyText);
      this.replyText = '';
      this.loadTickets();
      // Refresh local view
      const updated = this.myTickets().find(t => t.id === this.selectedTicket()!.id);
      if(updated) this.selectedTicket.set(updated);
  }

  formatDate(d: Date) {
      return new Date(d).toLocaleString();
  }
}
