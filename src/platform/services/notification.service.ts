
import { Injectable, inject, signal, effect, OnDestroy } from '@angular/core';
import { MockBackendService } from './mock-backend.service';
import { DbNotification } from '../types/admin.types';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private backend = inject(MockBackendService);
  
  // Estado local das notificações
  notifications = signal<DbNotification[]>([]);
  unreadCount = signal(0);
  
  private pollingInterval: any;
  private readIds = new Set<string>(); // Armazena IDs lidos localmente na sessão

  constructor() {
    // Inicia Polling se houver usuário logado
    effect(() => {
        const user = this.backend.currentUser();
        if (user) {
            this.startPolling(user.id);
        } else {
            this.stopPolling();
            this.notifications.set([]);
            this.unreadCount.set(0);
        }
    });
  }

  private startPolling(userId: string) {
      this.stopPolling();
      // Fetch inicial
      this.fetch(userId);
      // Polling a cada 10 segundos (Simulando Real-time / Socket)
      this.pollingInterval = setInterval(() => this.fetch(userId), 10000); 
  }

  private stopPolling() {
      if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  private async fetch(userId: string) {
      const list = await this.backend.fetchMyNotifications(userId);
      
      // Filtra visualmente as que já marcamos como lidas nesta sessão
      const processed = list.map(n => ({
          ...n,
          readAt: this.readIds.has(n.id) ? new Date() : n.readAt
      }));

      this.notifications.set(processed);
      this.unreadCount.set(processed.filter(n => !n.readAt).length);
  }

  markAsRead(id: string) {
      this.readIds.add(id);
      // Atualiza UI instantaneamente
      this.notifications.update(list => list.map(n => n.id === id ? { ...n, readAt: new Date() } : n));
      this.unreadCount.set(this.notifications().filter(n => !n.readAt).length);
      
      // Em prod, enviaria request para o backend marcar no banco
      // await this.http.post('/api/notifications/read', { id });
  }

  markAllRead() {
      const list = this.notifications();
      list.forEach(n => this.readIds.add(n.id));
      this.notifications.update(l => l.map(n => ({ ...n, readAt: new Date() })));
      this.unreadCount.set(0);
  }

  ngOnDestroy() {
      this.stopPolling();
  }
}
