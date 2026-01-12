
import { ProjectSettings } from '../types';

export const DEFAULT_CREDITS = `✧･ﾟ: *✧･ﾟ:*  CRÉDITOS  *:･ﾟ✧*:･ﾟ✧

               Direção Criativa • Roteiro • História
                          [Seu Nome]
                             ❥ ❥ ❥

                           [CENA]

                  Arte • Sprites • CGs • Ilustrações
                          [Seu Nome]
                            ✿ ❀ ❀ ✿

                   Cenários • Backgrounds • UI
                          [Seu Nome]
                            🌸 🖼️ ⋆

                 Música • Trilha Sonora • Efeitos
                          [Seu Nome]
                            ♪ ♡ ♫ ♬

                           [CENA]

                         Programação
                    VN Creator Studio
                           ⌨️ ✨ 💻

                   Testes • Polimento • Apoio
                  Amigos Beta-Testers
                            ♡ 🧪 🤗

                           [CENA]

                 Agradecimentos Especiais

Meu jogador querido...

Obrigada por ter caminhado comigo até aqui. 🥹💗
Por cada escolha que você fez com o coração,
por cada emoção que deixou transbordar,
por cada final que desbloqueou e guardou no peito.

Você não só jogou essa história...
Você a tornou real.

   Obrigada por me deixar fazer parte da tua        vida,
   nem que seja por algumas horas.
        Isso significa tudo pra mim.

      Te amo por sentir junto. 🌸❤️

                           [CENA]

              Criado com carinho e alma por
                          [Seu Nome]
                     Usando VN Creator Studio
                          ✧･ﾟ: *✧･ﾟ:*✧

                    Fim dos créditos

             Aperta no botão Joga Novamente
                  ❀ ✨ Vamos de novo? ✨ ❀
                       Eu te espero... ♡`;

export const DEFAULT_TERMS = `TERMOS DE USO E AVISO DE CONTEÚDO

1. Este é um trabalho de ficção.
2. Todo o conteúdo é propriedade intelectual do criador.
3. A discrição do jogador é aconselhada.

Divirta-se!`;

export const DEFAULT_SETTINGS: ProjectSettings = {
  targetPlatform: 'responsive',
  globalMusicId: null,
  password: '',
  projectPassword: '',
  titleScreen: {
    enabled: true,
    title: 'Visual Novel',
    subtitle: 'Criado com VN Studio',
    backgroundId: null,
    musicId: null,
    textColor: '#ffffff',
    buttonText: 'Iniciar',
    loadButtonText: 'Carregar Jogo',
    achievementsButtonText: 'Conquistas',
    termsButtonText: 'Termos de Uso',
    fontFamily: 'Inter',
    layout: 'modern'
  },
  loadingScreen: {
    backgroundColor: '#000000',
    textColor: '#0891b2',
    loadingText: 'Carregando...',
    fontFamily: 'Inter',
    style: 'standard'
  },
  endingScreen: {
    enabled: true,
    title: 'FIM',
    subtitle: DEFAULT_CREDITS,
    backgroundId: null,
    textColor: '#ffffff',
    buttonText: 'Menu',
    fontFamily: 'Inter',
    scrollSpeed: 40,
    scrollDirection: 'up',
    gallery: [],
    layout: 'classic-crawl',
    enableSkip: true, // Padrão: Botão visível
    bonusScenes: [],
    particleConfig: { enabled: false, preset: 'sakura', density: 3, speed: 3 } // NEW: Particles Default
  },
  dialogueBox: {
    style: 'modern',
    backgroundColor: '#0f172a', // slate-900
    backgroundOpacity: 0.9,
    borderColor: '#334155', // slate-700
    textColor: '#ffffff',
    nameColor: '#0891b2', // cyan-600
    fontFamily: 'Inter',
    typingEffect: 'typewriter',
    choiceButtonStyle: 'modern' // NEW
  },
  achievementPopup: {
    style: 'standard',
    position: 'top-center',
    duration: 4000,
    soundEnabled: true
  },
  gameplayMenu: {
    title: 'Configurações',
    musicLabel: 'Música',
    voiceLabel: 'Voz / Narração',
    speedLabel: 'Velocidade Texto',
    historyLabel: 'Histórico',
    saveLabel: 'Salvar',
    loadLabel: 'Carregar Jogo',
    slotLabel: 'Slot',
    closeBtn: 'Fechar',
    returnTitleBtn: 'Voltar ao Título',
    languageLabel: 'Idioma',
    style: 'modern'
  },
  termsStyle: 'standard',
  languages: [{ id: 'default', name: 'Padrão', isDefault: true }],
  translations: {},
  termsOfUse: DEFAULT_TERMS
};
