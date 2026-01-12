
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockBackendService } from '../services/mock-backend.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-gate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        <div class="text-center mb-8">
          <div class="text-4xl mb-2">🚀</div>
          <h2 class="text-2xl font-black text-white">VN Platform</h2>
          <p class="text-slate-400 text-sm">Gerencie e publique suas Visual Novels</p>
        </div>

        <div class="flex gap-2 mb-6 bg-slate-800 p-1 rounded-lg">
          <button (click)="mode.set('login')" class="flex-1 py-2 text-sm font-bold rounded-md transition-all"
                  [class.bg-cyan-600]="mode() === 'login'" [class.text-white]="mode() === 'login'" [class.text-slate-400]="mode() !== 'login'">Entrar</button>
          <button (click)="mode.set('register')" class="flex-1 py-2 text-sm font-bold rounded-md transition-all"
                  [class.bg-cyan-600]="mode() === 'register'" [class.text-white]="mode() === 'register'" [class.text-slate-400]="mode() !== 'register'">Criar Conta</button>
        </div>

        <div class="space-y-4">
          @if (mode() === 'register') {
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Nome de Usuário</label>
              <input [(ngModel)]="name" type="text" class="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none">
            </div>
          }

          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
            <input [(ngModel)]="email" type="email" class="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Senha</label>
            <input [(ngModel)]="password" type="password" class="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none">
          </div>

          @if (error()) {
            <div class="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-xs flex items-center gap-2">
              <span>⚠</span> {{ error() }}
            </div>
          }

          <button (click)="submit()" [disabled]="loading()" class="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg flex justify-center">
            @if (loading()) { <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> }
            @else { {{ mode() === 'login' ? 'Acessar Painel' : 'Registrar-se' }} }
          </button>
        </div>

        <div class="mt-6 text-center pt-6 border-t border-slate-800">
            <a routerLink="/" class="text-xs text-slate-500 hover:text-white transition-colors">← Voltar ao Editor Offline</a>
        </div>

      </div>
    </div>
  `
})
export class AuthGateComponent {
  backend = inject(MockBackendService);
  router = inject(Router);

  mode = signal<'login' | 'register'>('login');
  loading = signal(false);
  error = signal<string | null>(null);

  name = '';
  email = '';
  password = '';

  async submit() {
    this.loading.set(true);
    this.error.set(null);

    try {
      let res;
      if (this.mode() === 'login') {
        res = await this.backend.login(this.email, this.password);
      } else {
        res = await this.backend.register(this.name, this.email, this.password);
      }

      if (res.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error.set(res.error || 'Erro desconhecido');
      }
    } catch (e) {
      this.error.set('Erro de conexão');
    } finally {
      this.loading.set(false);
    }
  }
}
