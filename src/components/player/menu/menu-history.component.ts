
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VnService } from '../../../services/vn.service';

@Component({
  selector: 'app-menu-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
        @if (history().length === 0) {
            <div class="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
                <span class="text-4xl mb-2">📜</span>
                <p class="text-sm">Sem histórico recente.</p>
            </div>
        } @else {
            <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                @for (entry of history(); track $index) {
                    <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <!-- Dialogue Entry -->
                        @if (entry.type === 'dialogue') {
                            <div class="flex flex-col gap-1">
                                @if (entry.speaker) {
                                    <span class="text-cyan-400 font-bold text-xs uppercase tracking-wider">{{ parse(entry.speaker) }}</span>
                                }
                                <p class="text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{{ parse(entry.text) }}</p>
                            </div>
                        } 
                        <!-- Choice Entry -->
                        @else {
                            <div class="flex justify-center my-4">
                                <div class="bg-cyan-900/30 border border-cyan-500/30 rounded-full px-4 py-2 text-cyan-200 text-xs font-bold italic flex items-center gap-2">
                                    <span>↪</span> Escolha: {{ entry.text }}
                                </div>
                            </div>
                        }
                    </div>
                    @if ($index < history().length - 1) { <div class="h-px bg-slate-800/50 w-full my-2"></div> }
                }
            </div>
        }
    </div>
  `
})
export class MenuHistoryComponent {
  vnService = inject(VnService);
  history = this.vnService.gameHistory;

  parse(text: string) {
     if (!text) return '';
     const name = this.vnService.playerName();
     return text.replace(/{user}/gi, name).replace(/{player}/gi, name);
  }
}
