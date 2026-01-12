
import { AchievementStyle, AchievementPosition } from '../types';

export const ACHIEVEMENT_STYLES: { value: AchievementStyle; label: string; description: string }[] = [
    { value: 'standard', label: 'Padrão', description: 'Escuro com borda dourada, topo.' },
    { value: 'xbox', label: 'Console X', description: 'Verde, circular, parte inferior.' },
    { value: 'playstation', label: 'Console P', description: 'Minimalista, cantos retos, topo esquerdo.' },
    { value: 'steam', label: 'PC Gamer', description: 'Azul escuro, retangular, canto inferior.' },
    { value: 'retro', label: 'Retro Pixel', description: 'Fonte 8-bit, bordas grossas.' },
    { value: 'minimal', label: 'Minimalista', description: 'Branco, limpo, translúcido.' },
    { value: 'golden', label: 'Luxo', description: 'Gradiente dourado brilhante.' },
];

export const ACHIEVEMENT_POSITIONS: { value: AchievementPosition; label: string }[] = [
    { value: 'top-left', label: 'Topo Esquerda' },
    { value: 'top-center', label: 'Topo Centro' },
    { value: 'top-right', label: 'Topo Direita' },
    { value: 'bottom-left', label: 'Baixo Esquerda' },
    { value: 'bottom-center', label: 'Baixo Centro' },
    { value: 'bottom-right', label: 'Baixo Direita' },
];
