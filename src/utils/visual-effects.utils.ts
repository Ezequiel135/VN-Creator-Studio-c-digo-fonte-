
import { SceneEffect } from '../types';

export function getEffectClass(effect?: SceneEffect): string {
  switch (effect) {
      case 'rain': return 'fx-rain';
      case 'hard-rain': return 'fx-hard-rain';
      case 'snow': return 'fx-snow';
      case 'fog': return 'fx-fog';
      case 'night': return 'fx-night';
      case 'sunset': return 'fx-sunset';
      case 'sepia': return 'fx-sepia';
      case 'flash': return 'fx-flash';
      default: return '';
  }
}
