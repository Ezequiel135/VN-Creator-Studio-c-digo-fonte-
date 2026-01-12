
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
        <!-- Bell Icon -->
        <button (click)="toggleOpen()" class="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
            
            <!-- Badge -->
            @if (notifService.unreadCount() > 0) {
                <span class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm animate-pulse">
                    {{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}
                </span>
            }
        </button>

        <!-- Dropdown -->
        @if (isOpen()) {
            <div class="fixed inset-0 z-40" (click)="isOpen.set(false)"></div> <!-- Backdrop -->
            
            <div class="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div class="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <h3 class="text-xs font-bold text-white uppercase tracking-wider">Notificações</h3>
                    @if (notifService.unreadCount() > 0) {
                        <button (click)="notifService.markAllRead()" class="text-[10px] text-cyan-400 hover:underline cursor-pointer">Marcar lidas</button>
                    }
                </div>

                <div class="max-h-80 overflow-y-auto custom-scrollbar">
                    @if (notifService.notifications().length === 0) {
                        <div class="p-8 text-center text-slate-500 text-xs">
                            <span class="text-2xl block mb-2 opacity-50">🔕</span>
                            Nenhuma notificação.
                        </div>
                    } @else {
                        @for (notif of notifService.notifications(); track notif.id) {
                            <div (click)="notifService.markAsRead(notif.id)" 
                                 class="p-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer group relative">
                                
                                <div class="flex gap-3 items-start">
                                    <div class="mt-1">
                                        @if(notif.type === 'ban' || notif.type === 'warning') { <span class="text-lg">⚠️</span> }
                                        @else if (notif.type === 'system') { <span class="text-lg">🛠️</span> }
                                        @else { <span class="text-lg">ℹ️</span> }
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-start">
                                            <h4 class="text-sm font-bold text-slate-200" [class.text-red-400]="notif.type === 'ban'">{{ notif.title }}</h4>
                                            @if (!notif.readAt) { <span class="w-2 h-2 bg-cyan-500 rounded-full mt-1.5"></span> }
                                        </div>
                                        <p class="text-xs text-slate-400 mt-1 leading-relaxed">{{ notif.message }}</p>
                                        <span class="text-[9px] text-slate-600 mt-2 block">{{ formatDate(notif.createdAt) }}</span>
                                    </div>
                                </div>
                            </div>
                        }
                    }
                </div>
            </div>
        }
    </div>
  `
})
export class NotificationBellComponent {
  notifService = inject(NotificationService);
  isOpen = signal(false);

  toggleOpen() { this.isOpen.update(v => !v); }

  formatDate(d: Date) {
      return new Date(d).toLocaleDateString() + ' ' + new Date(d).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  }
}
