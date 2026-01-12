
import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VnService } from '../../services/vn.service';
import { Scene } from '../../types';

@Component({
  selector: 'app-tab-text',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-4 h-full p-4 overflow-y-auto custom-scrollbar">
        
        <!-- Quem Fala -->
        <div class="shrink-0">
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Quem Fala?</label>
            <input [ngModel]="getSpeaker()" (ngModelChange)="updateSpeaker($event)"
                   class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-3 text-sm text-white focus:border-cyan-500 outline-none placeholder-slate-600 transition-colors shadow-inner"
                   placeholder="Ex: Narrador, {user}, Maria">
        </div>

        <!-- O Que Diz -->
        <div class="flex flex-col shrink-0 pb-2">
            <div class="flex justify-between items-center mb-1">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">O Que Diz?</label>
                <div class="flex items-center gap-2">
                    <label class="text-[10px] text-slate-400 flex items-center gap-2 cursor-pointer select-none bg-slate-950 px-2 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors">
                        <input type="checkbox" [ngModel]="scene().hideDialogueBox" (ngModelChange)="updateHide($event)" class="rounded accent-cyan-600 w-3 h-3 cursor-pointer">
                        Ocultar Box
                    </label>
                </div>
            </div>
            <textarea [ngModel]="getDialogue()" (ngModelChange)="updateDialogue($event)"
                      class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-3 text-sm text-white focus:border-cyan-500 outline-none resize-y placeholder-slate-600 transition-colors custom-scrollbar shadow-inner leading-relaxed min-h-[120px]"
                      placeholder="Digite o diálogo da cena aqui..."></textarea>
        </div>
    </div>
  `
})
export class TabTextComponent {
  vnService = inject(VnService);
  scene = input.required<Scene>();

  getSpeaker() {
      const s = this.scene();
      const lang = this.vnService.editorLanguage();
      if (lang === 'default') return s.speakerName;
      return s.translations?.[lang]?.speakerName || '';
  }

  updateSpeaker(val: string) {
      const s = this.scene();
      const lang = this.vnService.editorLanguage();
      if (lang === 'default') this.vnService.updateScene(s.id, { speakerName: val });
      else {
          const t = s.translations || {};
          const lt = t[lang] || {};
          this.vnService.updateScene(s.id, { translations: { ...t, [lang]: { ...lt, speakerName: val } } });
      }
  }

  getDialogue() {
      const s = this.scene();
      const lang = this.vnService.editorLanguage();
      if (lang === 'default') return s.dialogueText;
      return s.translations?.[lang]?.dialogueText || '';
  }

  updateDialogue(val: string) {
      const s = this.scene();
      const lang = this.vnService.editorLanguage();
      if (lang === 'default') this.vnService.updateScene(s.id, { dialogueText: val });
      else {
          const t = s.translations || {};
          const lt = t[lang] || {};
          this.vnService.updateScene(s.id, { translations: { ...t, [lang]: { ...lt, dialogueText: val } } });
      }
  }

  updateHide(val: boolean) {
      this.vnService.updateScene(this.scene().id, { hideDialogueBox: val });
  }
}
