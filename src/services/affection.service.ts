
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AffectionService {
  // Map<CharacterAssetId, Amount>
  private affectionState = signal<Map<string, number>>(new Map());

  getAffection(charId: string): number {
    return this.affectionState().get(charId) || 0;
  }

  addAffection(charId: string, amount: number) {
    if (!charId || amount === 0) return;
    
    this.affectionState.update(map => {
        const current = map.get(charId) || 0;
        const newMap = new Map(map);
        newMap.set(charId, current + amount);
        console.log(`[Affection] ${charId}: ${current} -> ${current + amount}`);
        return newMap;
    });
  }

  reset() {
      this.affectionState.set(new Map());
  }

  exportState(): {[key:string]: number} {
      const obj: any = {};
      this.affectionState().forEach((v, k) => obj[k] = v);
      return obj;
  }

  importState(obj: {[key:string]: number} | undefined) {
      if (!obj) {
          this.reset();
          return;
      }
      const map = new Map<string, number>();
      Object.keys(obj).forEach(k => map.set(k, obj[k]));
      this.affectionState.set(map);
  }
}
