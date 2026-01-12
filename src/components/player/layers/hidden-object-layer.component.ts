
import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VnService } from '../../../services/vn.service';
import { Scene, HiddenObject } from '../../../types';

@Component({
  selector: 'app-hidden-object-layer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute inset-0 z-[25] pointer-events-none">
        @for (obj of visibleObjects(); track obj.id) {
            <div (click)="handleClick(obj, $event)"
                 (mousedown)="handleDragStart(obj, $event)"
                 (touchstart)="handleDragStart(obj, $event)"
                 class="absolute transition-all duration-200"
                 [class.cursor-pointer]="!isEditor()"
                 [class.pointer-events-auto]="true"
                 [class.cursor-move]="isEditor()"
                 [class.border-2]="isEditor()" 
                 [class.border-dashed]="isEditor()" 
                 [class.border-yellow-400]="isEditor()"
                 [class.bg-yellow-400_20]="isEditor()"
                 [class.hover:bg-white_10]="!isEditor()"
                 [style.left.%]="obj.x"
                 [style.top.%]="obj.y"
                 [style.width.%]="obj.width"
                 [style.height.%]="obj.height"
                 [title]="isEditor() ? obj.name : ''">
                 
                 @if(isEditor()) {
                     <div class="absolute top-0 left-0 bg-yellow-500 text-black text-[9px] font-bold px-1 select-none">{{ obj.name }}</div>
                 }
            </div>
        }
    </div>
  `
})
export class HiddenObjectLayerComponent {
  vnService = inject(VnService);
  scene = input.required<Scene>();
  isEditor = input(false);
  found = output<{obj: HiddenObject, img: string | undefined}>();
  dragStart = output<{id: string, event: MouseEvent | TouchEvent}>();

  visibleObjects = computed(() => {
      const list = this.scene().hiddenObjects || [];
      if (this.isEditor()) return list;
      // In game mode, filter out collected 'once' items
      return list.filter(o => !o.once || !this.vnService.inventoryService.hasItem(o.id));
  });

  handleClick(obj: HiddenObject, e: Event) {
      // In Editor, prevent triggering find logic
      if (this.isEditor()) return;
      
      e.stopPropagation();

      // Logic
      this.vnService.inventoryService.collectItem(obj.id);
      
      if (obj.affectionReward) {
          this.vnService.affectionService.addAffection(obj.affectionReward.characterId, obj.affectionReward.amount);
      }

      this.found.emit({
          obj,
          img: this.vnService.getAssetUrl(obj.itemImageId)
      });
  }

  handleDragStart(obj: HiddenObject, e: MouseEvent | TouchEvent) {
      if (!this.isEditor()) return;
      this.dragStart.emit({ id: obj.id, event: e });
  }
}
