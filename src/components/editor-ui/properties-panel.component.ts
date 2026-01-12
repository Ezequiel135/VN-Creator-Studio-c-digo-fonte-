
import { Component, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scene } from '../../types';
import { VnService } from '../../services/vn.service';
import { TabTextComponent } from '../editor-tabs/tab-text.component';
import { TabChoicesComponent } from '../editor-tabs/tab-choices.component';
import { TabAudioComponent } from '../editor-tabs/tab-audio.component';
import { TabGameComponent } from '../editor-tabs/tab-game.component';
import { TabCharactersComponent } from '../editor-tabs/tab-characters.component';
import { TabSceneOptionsComponent } from '../editor-tabs/tab-scene-options.component';
import { TabHiddenObjectsComponent } from '../editor-tabs/tab-hidden-objects.component'; // NEW

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [
      CommonModule, 
      TabTextComponent, 
      TabChoicesComponent, 
      TabAudioComponent, 
      TabGameComponent, 
      TabCharactersComponent,
      TabSceneOptionsComponent,
      TabHiddenObjectsComponent
  ],
  template: `
    <div class="flex flex-col h-[280px] landscape:h-[130px] md:landscape:h-[280px] bg-slate-900/95 backdrop-blur border-t border-slate-700 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] transition-all duration-300">
        
        <!-- Tab Header -->
        <div class="flex items-center bg-slate-900 border-b border-slate-700 h-[40px] shrink-0 overflow-x-auto no-scrollbar">
             <!-- Tabs -->
             <button *ngFor="let tab of tabs" 
                     (click)="activeTab.set(tab.id)"
                     class="px-5 h-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap border-b-2 hover:bg-slate-800"
                     [class.border-cyan-500]="activeTab() === tab.id"
                     [class.text-cyan-400]="activeTab() === tab.id"
                     [class.border-transparent]="activeTab() !== tab.id"
                     [class.text-slate-500]="activeTab() !== tab.id"
                     [class.hover:text-slate-300]="activeTab() !== tab.id">
                 <span>{{ tab.icon }}</span>
                 {{ tab.label }}
             </button>
        </div>

        <!-- Tab Body -->
        @if (scene()) {
            <div class="flex-1 overflow-hidden relative bg-slate-900">
                @switch (activeTab()) {
                    @case ('text') { <app-tab-text [scene]="scene()!"></app-tab-text> }
                    @case ('characters') { <app-tab-characters [scene]="scene()!"></app-tab-characters> }
                    @case ('options') { <app-tab-scene-options [scene]="scene()!"></app-tab-scene-options> }
                    @case ('choices') { <app-tab-choices [scene]="scene()!"></app-tab-choices> }
                    @case ('audio') { <app-tab-audio [scene]="scene()!"></app-tab-audio> }
                    @case ('game') { <app-tab-game [scene]="scene()!"></app-tab-game> }
                    @case ('objects') { <app-tab-hidden-objects [scene]="scene()!"></app-tab-hidden-objects> }
                }
            </div>
        }
    </div>
  `
})
export class PropertiesPanelComponent {
  vnService = inject(VnService);
  scene = input.required<Scene | null>();
  
  activeTab = signal<'text' | 'characters' | 'options' | 'choices' | 'audio' | 'game' | 'objects'>('text');

  tabs: {id: any, label: string, icon: string}[] = [
      { id: 'text', label: 'Texto', icon: '💬' },
      { id: 'characters', label: 'Personagens', icon: '👤' },
      { id: 'options', label: 'Opções', icon: '⚙️' },
      { id: 'choices', label: 'Escolhas', icon: '🔀' },
      { id: 'objects', label: 'Objetos', icon: '🔍' }, // NEW
      { id: 'audio', label: 'Áudio', icon: '🔊' },
      { id: 'game', label: 'Game', icon: '🎮' },
  ];
}
