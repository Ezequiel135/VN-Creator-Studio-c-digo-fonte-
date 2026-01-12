
import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VnService } from '../../../services/vn.service';
import { TermsStandardComponent, TermsPaperComponent, TermsTerminalComponent, TermsCardComponent, TermsFullscreenComponent } from './terms-styles';

@Component({
  selector: 'app-terms-screen',
  standalone: true,
  imports: [CommonModule, TermsStandardComponent, TermsPaperComponent, TermsTerminalComponent, TermsCardComponent, TermsFullscreenComponent],
  template: `
    <div class="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-4 animate-in fade-in">
         @switch (vnService.settings().termsStyle) {
             @case ('paper') { <app-terms-paper [title]="title()" [text]="text()" (close)="close.emit()"></app-terms-paper> }
             @case ('terminal') { <app-terms-terminal [title]="title()" [text]="text()" (close)="close.emit()"></app-terms-terminal> }
             @case ('card') { <app-terms-card [title]="title()" [text]="text()" (close)="close.emit()"></app-terms-card> }
             @case ('fullscreen') { <app-terms-fullscreen [title]="title()" [text]="text()" (close)="close.emit()"></app-terms-fullscreen> }
             @default { <app-terms-standard [title]="title()" [text]="text()" (close)="close.emit()"></app-terms-standard> }
         }
    </div>
  `
})
export class TermsScreenComponent {
  vnService = inject(VnService);
  close = output<void>();
  title = input.required<string>();
  text = input.required<string>();
}
