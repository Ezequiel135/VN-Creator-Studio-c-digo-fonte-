
import { Component, inject, output, signal, computed, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VnService } from '../../../services/vn.service';
import { MenuModernComponent, MenuSidebarComponent, MenuMinimalComponent, MenuGridComponent, MenuBookComponent } from './menu-styles';

@Component({
  selector: 'app-game-menu',
  standalone: true,
  imports: [CommonModule, MenuModernComponent, MenuSidebarComponent, MenuMinimalComponent, MenuGridComponent, MenuBookComponent],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in">
        @switch (loc().style) {
            @case ('sidebar') {
                <app-menu-sidebar 
                    [activeTab]="activeTab()" 
                    (tabChange)="activeTab.set($event)" 
                    [loc]="loc()" 
                    [saves]="saves()" 
                    [isTitle]="isTitleScreen()" 
                    (close)="close.emit()" 
                    (returnTitle)="returnTitle.emit()" 
                    (loadGame)="loadGame.emit($event)">
                </app-menu-sidebar>
            }
            @case ('minimal') {
                <app-menu-minimal 
                    [activeTab]="activeTab()" 
                    (tabChange)="activeTab.set($event)" 
                    [loc]="loc()" 
                    [saves]="saves()" 
                    [isTitle]="isTitleScreen()" 
                    (close)="close.emit()" 
                    (returnTitle)="returnTitle.emit()" 
                    (loadGame)="loadGame.emit($event)">
                </app-menu-minimal>
            }
            @case ('grid') {
                <app-menu-grid 
                    [activeTab]="activeTab()" 
                    (tabChange)="activeTab.set($event)" 
                    [loc]="loc()" 
                    [saves]="saves()" 
                    [isTitle]="isTitleScreen()" 
                    (close)="close.emit()" 
                    (returnTitle)="returnTitle.emit()" 
                    (loadGame)="loadGame.emit($event)">
                </app-menu-grid>
            }
            @case ('book') {
                <app-menu-book 
                    [activeTab]="activeTab()" 
                    (tabChange)="activeTab.set($event)" 
                    [loc]="loc()" 
                    [saves]="saves()" 
                    [isTitle]="isTitleScreen()" 
                    (close)="close.emit()" 
                    (returnTitle)="returnTitle.emit()" 
                    (loadGame)="loadGame.emit($event)">
                </app-menu-book>
            }
            @default {
                <app-menu-modern 
                    [activeTab]="activeTab()" 
                    (tabChange)="activeTab.set($event)" 
                    [loc]="loc()" 
                    [saves]="saves()" 
                    [isTitle]="isTitleScreen()" 
                    (close)="close.emit()" 
                    (returnTitle)="returnTitle.emit()" 
                    (loadGame)="loadGame.emit($event)">
                </app-menu-modern>
            }
        }
    </div>
  `
})
export class GameMenuComponent implements OnInit {
  vnService = inject(VnService);
  close = output<void>();
  returnTitle = output<void>();
  loadGame = output<string>();
  
  isTitleScreen = input(false);
  startTab = input<'history' | 'settings' | 'save'>('settings');

  activeTab = signal<'history' | 'settings' | 'save'>('settings');
  
  // Saves are now a signal that we manually update, because getSlots is async
  saves = signal<any[]>([]);
  loc = computed(() => this.vnService.getLocalizedSettings().gameplayMenu || {style: 'modern'});

  ngOnInit() {
      this.activeTab.set(this.startTab());
      this.refreshSaves();
  }

  async refreshSaves() {
      // Triggered manually or by effects in parent if needed
      const slots = await this.vnService.getSlots();
      this.saves.set(slots);
  }
}
