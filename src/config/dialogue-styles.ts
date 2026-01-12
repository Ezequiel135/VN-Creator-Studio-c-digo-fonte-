
import { DialogueStyle, TypingEffect } from '../types';

export const DIALOGUE_STYLES: { value: DialogueStyle; label: string; description: string }[] = [
    { value: 'modern', label: 'Moderno (Padrão)', description: 'Arredondado, semi-transparente, limpo.' },
    { value: 'retro', label: 'Retro / Pixel', description: 'Quadrado, bordas grossas, estilo 8-bit.' },
    { value: 'paper', label: 'Papel / Visual Novel', description: 'Textura clara, borda clássica, texto escuro.' },
    { value: 'neon', label: 'Cyber / Neon', description: 'Preto profundo, bordas brilhantes.' },
    { value: 'cinematic', label: 'Cinemático', description: 'Faixa preta na parte inferior, sem bordas.' },
    { value: 'clean', label: 'Clean / Minimalista', description: 'Sem fundo (apenas texto com sombra).' },
];

export const TYPING_EFFECTS: { value: TypingEffect; label: string }[] = [
    { value: 'typewriter', label: 'Máquina de Escrever (Padrão)' },
    { value: 'fade', label: 'Fade Suave' },
    { value: 'instant', label: 'Instantâneo' },
];

export const FONTS: { value: string; label: string }[] = [
    { value: 'Inter', label: 'Inter (Padrão)' },
    { value: 'Roboto Mono', label: 'Roboto Mono (Code)' },
    { value: 'Press Start 2P', label: 'Pixel Art' },
    { value: 'Cinzel', label: 'Cinzel (Fantasia)' },
    { value: 'Dancing Script', label: 'Manuscrito' },
];
