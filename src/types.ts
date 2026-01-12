
export type AssetType = 'background' | 'character' | 'audio' | 'video';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
}

export type CharAnimType = 'fade' | 'slide-left' | 'slide-right' | 'pop' | 'shake' | 'none';

export interface GameCharacter {
  id: string; 
  assetId: string;
  x: number;
  y: number;
  scale: number;
  isFlipped?: boolean;
  animation?: CharAnimType; 
  exitAnimation?: CharAnimType;
}

export interface AffectionReward {
    characterId: string;
    amount: number;
}

export interface Choice {
  id: string;
  text: string;
  targetSceneId: string | null;
  affectionReward?: AffectionReward | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconAssetId: string | null;
  iconX?: number; 
  iconY?: number; 
}

export interface GameItem {
    id: string;
    name: string;
    description: string;
    imageAssetId: string | null;
}

export interface HiddenObject {
    id: string;
    x: number; 
    y: number; 
    width: number; 
    height: number; 
    name: string; 
    itemImageId: string | null; 
    message: string; 
    affectionReward?: AffectionReward | null;
    once: boolean; 
    targetSceneId?: string | null;
}

export type AchievementStyle = 'standard' | 'xbox' | 'playstation' | 'steam' | 'retro' | 'minimal' | 'golden';
export type AchievementPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface AchievementPopupConfig {
    style: AchievementStyle;
    position: AchievementPosition;
    duration: number;
    soundEnabled: boolean;
}

export type MiniGameType = 'quiz' | 'quick-click' | 'mash' | 'sequence' | 'password' | 'find' | 'timing' | 'memory' | 'math' | 'balance' | 'lockpick' | 'rhythm';

export interface MiniGame {
  type: MiniGameType;
  timeLimit?: number; 
  winMessage?: string;
  loseMessage?: string;
  affectionReward?: AffectionReward | null;
  
  question?: string;
  options?: string[];
  correctOptionIndex?: number;
  targetSize?: number; 
  mashTarget?: number; 
  sequenceLength?: number;
  password?: string;
  passwordHint?: string;
  targetX?: number;
  targetY?: number;
  timingSpeed?: number;
  timingZoneSize?: number;
  gridSize?: 4 | 6 | 8;
  mathDifficulty?: 'easy' | 'hard';
  balanceStability?: number; 
  lockpickPins?: number; 
  rhythmSpeed?: number; 
}

export interface CreditLine {
  id: string;
  role: string;
  name: string;
}

export type GalleryPosition = 'center' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-left' | 'center-right';

export interface GalleryItem {
  sceneId: string;
  showUiSnapshot: boolean;
  position: GalleryPosition;
}

export interface BonusSceneItem {
  id: string;
  label: string;
  sceneId: string;
}

export type EndingLayout = 'classic-crawl' | 'centered-static' | 'cards';

export type ParticlePreset = 'sakura' | 'autumn' | 'hearts' | 'stars' | 'snow-flakes' | 'bubbles' | 'sparkles' | 'custom';

export interface ParticleConfig {
  enabled: boolean;
  preset: ParticlePreset;
  customAssetId?: string | null;
  density?: number; 
  speed?: number;   
}

export interface EndingScreenConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  backgroundId: string | null;
  textColor: string;
  buttonText: string;
  fontFamily?: string;
  scrollSpeed?: number;
  scrollDirection?: 'up' | 'down';
  gallery?: GalleryItem[];
  layout?: EndingLayout;
  enableSkip?: boolean; 
  bonusScenes?: BonusSceneItem[]; 
  particleConfig?: ParticleConfig;
}

export interface SceneTranslation {
  dialogueText?: string;
  speakerName?: string;
  voiceoverId?: string | null;
  narratorId?: string | null;
  choices?: { [choiceId: string]: string };
  miniGameQuestion?: string;
  miniGameOptions?: string[];
}

export type MenuStyle = 'modern' | 'minimal' | 'sidebar' | 'grid' | 'book';
export type TitleLayout = 'modern' | 'classic' | 'cinematic' | 'retro' | 'split';
export type LoadingStyle = 'standard' | 'bar' | 'spinner' | 'terminal' | 'minimal';
export type TermsStyle = 'standard' | 'paper' | 'terminal' | 'card' | 'fullscreen';

export type DialogueStyle = 'modern' | 'retro' | 'paper' | 'neon' | 'cinematic' | 'clean';
export type TypingEffect = 'typewriter' | 'fade' | 'instant';

export interface DialogueBoxConfig {
    style: DialogueStyle;
    backgroundColor: string;
    backgroundOpacity: number;
    borderColor: string;
    textColor: string;
    nameColor: string;
    fontFamily?: string;
    typingEffect: TypingEffect;
    customCss?: string; 
    choiceButtonStyle?: string; // NEW: Choice Style
}

export interface GameplayMenuConfig {
    title?: string;
    musicLabel?: string;
    voiceLabel?: string;
    speedLabel?: string;
    historyLabel?: string;
    saveLabel?: string;
    loadLabel?: string; 
    slotLabel?: string; 
    closeBtn?: string;
    returnTitleBtn?: string;
    languageLabel?: string;
    style?: MenuStyle; 
}

export interface SettingsTranslation {
  titleScreen?: { 
      title?: string; 
      subtitle?: string; 
      buttonText?: string;
      loadButtonText?: string; 
      achievementsButtonText?: string; 
      termsButtonText?: string; 
  };
  loadingScreen?: { loadingText?: string; };
  endingScreen?: { title?: string; subtitle?: string; buttonText?: string; };
  gameplayMenu?: GameplayMenuConfig; 
  termsOfUse?: string;
}

export type SceneTransition = 'none' | 'fade' | 'slide-left' | 'slide-right' | 'zoom' | 'dissolve';
export type SceneEffect = 'none' | 'rain' | 'snow' | 'fog' | 'night' | 'sunset' | 'flash' | 'sepia' | 'hard-rain';

export interface Scene {
  id: string;
  name: string;
  type: 'standard' | 'ending';
  backgroundId: string | null;
  bgX: number;
  bgY: number;
  isVideo?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean; 
  characters: GameCharacter[];
  hiddenObjects?: HiddenObject[]; 
  particleConfig?: ParticleConfig | null; 
  musicId?: string | null;
  soundId?: string | null;
  voiceoverId?: string | null;
  narratorId?: string | null; 
  dialogueText: string;
  speakerName: string;
  hideDialogueBox?: boolean;
  choices: Choice[];
  nextSceneId?: string | null;
  transition?: SceneTransition;
  effect?: SceneEffect; 
  miniGame?: MiniGame | null;
  endingConfig?: EndingScreenConfig | null;
  awardAchievementId?: string | null;
  translations?: { [langId: string]: SceneTranslation };
}

export interface TitleScreenConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  backgroundId?: string | null;
  musicId?: string | null;
  textColor: string;
  buttonText: string; 
  loadButtonText?: string; 
  achievementsButtonText?: string; 
  termsButtonText?: string; 
  fontFamily?: string;
  layout?: TitleLayout; 
}

export interface LoadingScreenConfig {
  backgroundColor: string;
  textColor: string;
  loadingText: string;
  fontFamily?: string;
  style?: LoadingStyle; 
}

export interface ProjectSettings {
  targetPlatform: 'mobile' | 'pc' | 'responsive';
  globalMusicId?: string | null; 
  password?: string;
  projectPassword?: string;
  titleScreen: TitleScreenConfig;
  loadingScreen: LoadingScreenConfig;
  endingScreen: EndingScreenConfig;
  dialogueBox: DialogueBoxConfig; 
  achievementPopup: AchievementPopupConfig; 
  gameplayMenu: GameplayMenuConfig; 
  termsOfUse?: string;
  termsStyle?: TermsStyle; 
  languages: Language[];
  translations?: { [langId: string]: SettingsTranslation | undefined }; // Updated to allow undefined
}

export interface SaveSlot {
  slotId: number;
  timestamp: number;
  sceneId: string;
  sceneName: string;
  playerName: string;
  affectionMap?: {[charId: string]: number}; 
  collectedItems?: string[]; 
}

export interface UserPreferences {
  musicVolume: number;
  voiceVolume: number;
  textSpeed: number;
}

export interface GameHistoryEntry {
  type: 'dialogue' | 'choice';
  speaker?: string;
  text: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  lastModified: number;
}

export interface ProjectData {
  id?: string;
  name: string;
  settings: ProjectSettings;
  scenes: Scene[];
  assets: Omit<Asset, 'url'>[];
  achievements: Achievement[];
  startSceneId: string;
  version: number;
}

export interface Language {
  id: string;
  name: string;
  isDefault: boolean;
}
