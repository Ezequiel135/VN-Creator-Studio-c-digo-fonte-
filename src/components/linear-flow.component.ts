
import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../services/vn.service';

@Component({
  selector: 'app-linear-flow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-800/40 p-2 rounded border border-slate-700/50">
        <label class="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            Próxima Cena (Fluxo Linear)
            <span class="text-slate-600 text-[9px]">(Após acabar diálogo)</span>
        </label>
        <div class="flex gap-1 mt-1">
        <select [ngModel]="nextSceneId()" (ngModelChange)="updateNextScene($event)"
                [disabled]="disabled()"
                [class.opacity-50]="disabled()"
                class="flex-1 bg-slate-900 border border-slate-600 rounded text-xs text-white py-1 px-1 focus:border-cyan-500 outline-none">
            <option [ngValue]="null">--- Fim / Menu ---</option>
            @for(s of vnService.scenes(); track s.id) {
                <!-- Show Real Name -->
                <option [value]="s.id" [class.text-cyan-400]="s.id === nextSceneId()">
                    {{ s.id === currentSceneId() ? '(Atual) ' : '' }}{{ s.name }}
                </option>
            }
        </select>
        </div>
    </div>
  `
})
export class LinearFlowComponent {
  vnService = inject(VnService);
  currentSceneId = input.required<string>();
  nextSceneId = input<string | null>(null);
  disabled = input(false);

  updateNextScene(id: string | null) {
      this.vnService.updateScene(this.currentSceneId(), { nextSceneId: id });
  }
}
