
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VnService } from '../services/vn.service';
import { Asset } from '../types';

// Components
import { TopBarComponent } from './editor-ui/top-bar.component';
import { PropertiesPanelComponent } from './editor-ui/properties-panel.component';
import { AssetDrawerComponent } from './editor-ui/asset-drawer.component';
import { CanvasStageComponent } from './canvas-stage.component';

@Component({
  selector: 'app-scene-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
      CommonModule, 
      TopBarComponent, PropertiesPanelComponent, AssetDrawerComponent, CanvasStageComponent
  ],
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 overflow-hidden text-slate-200 relative">
      
      <!-- 1. TOP BAR -->
      <app-top-bar 
          (createLinked)="createLinked()"
          (openDrawer)="openDrawer($event)">
      </app-top-bar>

      <!-- 2. MAIN WORKSPACE (CENTER) - Maximized Space -->
      <div class="flex-1 bg-black relative overflow-hidden flex items-center justify-center z-10 p-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
          @if (vnService.currentScene(); as s) {
              <!-- Full Screen Wrapper -->
              <div class="w-full h-full flex items-center justify-center">
                  <app-canvas-stage [scene]="s"></app-canvas-stage>
              </div>
          } @else {
              <div class="flex flex-col items-center text-slate-600 animate-pulse">
                  <span class="text-4xl mb-2">🎬</span>
                  <span class="font-bold uppercase tracking-widest text-xs">Sem Cena Selecionada</span>
              </div>
          }
      </div>

      <!-- 3. PROPERTIES PANEL (BOTTOM) -->
      <app-properties-panel 
          [scene]="vnService.currentScene()" 
          class="z-20 shrink-0 shadow-2xl">
      </app-properties-panel>

      <!-- 4. ASSET DRAWER (MODAL) -->
      @if (showingDrawer()) {
          <app-asset-drawer 
              [type]="drawerType()" 
              (close)="closeDrawer()" 
              (select)="selectAsset($event)">
          </app-asset-drawer>
      }

    </div>
  `
})
export class SceneEditorComponent {
  vnService = inject(VnService);
  
  showingDrawer = signal(false);
  drawerType = signal<'background'|'character'|'audio'>('background');
  
  createLinked() { this.vnService.addSceneLinked(this.vnService.currentScene()?.id || null); }

  openDrawer(type: 'background'|'character'|'audio') {
      this.drawerType.set(type);
      this.showingDrawer.set(true);
  }
  closeDrawer() { this.showingDrawer.set(false); }

  selectAsset(asset: Asset) {
      const s = this.vnService.currentScene();
      if(!s) return;
      
      if(this.drawerType() === 'background') {
          this.vnService.updateScene(s.id, { backgroundId: asset.id, isVideo: asset.type === 'video', bgX: 50, bgY: 50 });
      } else if(this.drawerType() === 'character') {
          this.vnService.addCharacterToScene(s.id, asset.id);
      }
      this.closeDrawer();
  }
}
