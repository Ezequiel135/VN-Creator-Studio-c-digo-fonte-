
import { CharAnimType } from '../types';

export function getCharAnimClass(anim?: CharAnimType): string {
  switch (anim) {
      case 'slide-left': return 'char-enter-slide-left';
      case 'slide-right': return 'char-enter-slide-right';
      case 'pop': return 'char-enter-pop';
      case 'shake': return 'char-enter-shake';
      case 'fade': return 'char-enter-fade';
      case 'none': return '';
      default: return 'char-enter-fade'; // Default fallback
  }
}
