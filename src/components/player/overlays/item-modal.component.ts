
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" (click)="close.emit()">
        <div class="bg-slate-900 border-2 border-yellow-500/50 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(234,179,8,0.3)] text-center relative overflow-hidden transform transition-all scale-100" (click)="$event.stopPropagation()">
            
            <!-- Shine Effect -->
            <div class="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent pointer-events-none"></div>
            
            <h3 class="text-xl font-black text-yellow-400 uppercase tracking-widest mb-6 drop-shadow-md">Parabéns!</h3>
            
            <div class="w-40 h-40 mx-auto bg-black rounded-xl border border-slate-700 flex items-center justify-center mb-6 shadow-inner relative group">
                <div class="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.1)_0%,_transparent_70%)] opacity-50"></div>
                @if (imageUrl()) {
                    <img [src]="imageUrl()" class="max-w-full max-h-full object-contain drop-shadow-2xl animate-in zoom-in duration-500">
                } @else {
                    <span class="text-6xl">🎁</span>
                }
            </div>
            
            <p class="text-white font-bold text-lg mb-8 leading-relaxed">{{ message() }}</p>
            
            <button (click)="close.emit()" class="w-full py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-transform active:scale-95">
                Continuar
            </button>
        </div>
    </div>
  `
})
export class ItemModalComponent {
  imageUrl = input<string | undefined>();
  message = input.required<string>();
  close = output<void>();
}
