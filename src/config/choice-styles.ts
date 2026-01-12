
export interface ChoiceStyleConfig {
    containerClass: string;
    label: string;
}

export const CHOICE_STYLES: { [key: string]: ChoiceStyleConfig } = {
    'modern': {
        label: 'Moderno (Padrão)',
        containerClass: 'bg-white/90 hover:bg-white text-slate-900 border-l-4 border-cyan-500 rounded shadow-lg'
    },
    'retro': {
        label: 'Retro / Pixel',
        containerClass: 'bg-blue-800 text-white border-4 border-white rounded-none shadow-none font-[Press_Start_2P] text-xs hover:bg-blue-700'
    },
    'neon': {
        label: 'Cyber / Neon',
        containerClass: 'bg-black/80 text-cyan-400 border border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] rounded-lg hover:bg-cyan-900/30'
    },
    'paper': {
        label: 'Papel / Novel',
        containerClass: 'bg-[#fdfbf7] text-[#4a4036] border-2 border-[#4a4036] rounded-sm shadow-md font-serif hover:bg-[#f3eee4]'
    },
    'clean': {
        label: 'Minimalista / Dark',
        containerClass: 'bg-slate-900/80 backdrop-blur text-white border border-slate-600 rounded-full hover:bg-slate-800 hover:border-white transition-all text-center justify-center'
    },
    'glass': {
        label: 'Vidro / Glassmorphism',
        containerClass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl hover:bg-white/20'
    }
};
