
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingScreenConfig } from '../../../types';
import { LoadingStandardComponent, LoadingBarComponent, LoadingMinimalComponent, LoadingTerminalComponent, LoadingSpinnerComponent } from './loading-styles';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule, LoadingStandardComponent, LoadingBarComponent, LoadingMinimalComponent, LoadingTerminalComponent, LoadingSpinnerComponent],
  template: `
    <div class="absolute inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden" 
         [style.background-color]="config().backgroundColor"
         [style.color]="config().textColor"
         [style.font-family]="config().fontFamily">
         
         @switch (config().style) {
             @case ('bar') { <app-loading-bar [text]="config().loadingText"></app-loading-bar> }
             @case ('minimal') { <app-loading-minimal [text]="config().loadingText"></app-loading-minimal> }
             @case ('terminal') { <app-loading-terminal [text]="config().loadingText"></app-loading-terminal> }
             @case ('spinner') { <app-loading-spinner [text]="config().loadingText"></app-loading-spinner> }
             @default { <app-loading-standard [text]="config().loadingText"></app-loading-standard> }
         }
    </div>
  `
})
export class LoadingScreenComponent {
  config = input.required<LoadingScreenConfig>();
}
