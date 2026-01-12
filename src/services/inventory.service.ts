
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  // Set<ObjectId> - IDs of HiddenObjects found
  private collectedItems = signal<Set<string>>(new Set());

  hasItem(objectId: string): boolean {
      return this.collectedItems().has(objectId);
  }

  collectItem(objectId: string) {
      this.collectedItems.update(s => new Set(s).add(objectId));
  }

  reset() {
      this.collectedItems.set(new Set());
  }

  exportState(): string[] {
      return Array.from(this.collectedItems());
  }

  importState(items: string[] | undefined) {
      this.collectedItems.set(new Set(items || []));
  }
}
