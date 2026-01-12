
import { SceneTransition, SceneEffect, MiniGameType } from '../types';

export const SCENE_TRANSITIONS: { value: SceneTransition; label: string }[] = [
  { value: 'none', label: 'Corte Seco (Nenhuma)' },
  { value: 'fade', label: 'Fade In (Suave)' },
  { value: 'slide-left', label: 'Deslizar p/ Esquerda' },
  { value: 'slide-right', label: 'Deslizar p/ Direita' },
  { value: 'zoom', label: 'Zoom In' },
  { value: 'dissolve', label: 'Dissolver' }
];

export const SCENE_EFFECTS: { value: SceneEffect; label: string }[] = [
  { value: 'none', label: '--- Nenhum ---' },
  { value: 'rain', label: 'Chuva Suave' },
  { value: 'hard-rain', label: 'Tempestade' },
  { value: 'snow', label: 'Neve' },
  { value: 'fog', label: 'Neblina / Vento' },
  { value: 'night', label: 'Noite (Filtro Escuro)' },
  { value: 'sunset', label: 'Pôr do Sol (Filtro Laranja)' },
  { value: 'sepia', label: 'Sépia (Flashback)' },
  { value: 'flash', label: 'Flash de Luz (Ao entrar)' }
];

export const MINIGAME_TYPES: { value: MiniGameType; label: string; icon: string }[] = [
  { value: 'quiz', label: 'Quiz', icon: '❓' },
  { value: 'quick-click', label: 'Reflexo', icon: '⚡' },
  { value: 'mash', label: 'Mash', icon: '🔨' },
  { value: 'sequence', label: 'Senha', icon: '🔢' },
  { value: 'password', label: 'Texto', icon: '⌨️' },
  { value: 'find', label: 'Achar', icon: '🔍' },
  { value: 'timing', label: 'Timing', icon: '🎯' },
  { value: 'memory', label: 'Memória', icon: '🃏' },
  { value: 'math', label: 'Math', icon: '🧮' },
  { value: 'balance', label: 'Equilíbrio', icon: '⚖️' }
];
