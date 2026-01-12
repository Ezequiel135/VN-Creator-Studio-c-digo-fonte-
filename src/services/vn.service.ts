
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Asset, Scene, GameCharacter, ProjectData, Choice, Achievement, ProjectSettings, MiniGame, ProjectSummary, UserPreferences, GameHistoryEntry, MiniGameType, AffectionReward } from '../types';
import { StorageService } from './storage.service';
import { AssetManagerService } from './asset-manager.service';
import { AffectionService } from './affection.service';
import { InventoryService } from './inventory.service';
import { DEFAULT_SETTINGS, DEFAULT_TERMS, DEFAULT_CREDITS } from '../data/defaults';

export type EditorInteraction = { type: 'pick-hidden-object', itemId: string } | null;

@Injectable({
  providedIn: 'root'
})
export class VnService {
  private storage = inject(StorageService);
  private assetManager = inject(AssetManagerService);
  public affectionService = inject(AffectionService); 
  public inventoryService = inject(InventoryService); 

  assets = signal<Asset[]>([]);
  scenes = signal<Scene[]>([]);
  achievements = signal<Achievement[]>([]);
  settings = signal<ProjectSettings>({ ...DEFAULT_SETTINGS });
  
  projectList = signal<ProjectSummary[]>([]);
  activeProjectId = signal<string>('');
  isLocked = signal(false); 
  
  editorInteraction = signal<EditorInteraction>(null); 

  playerName = signal<string>('Jogador'); 
  userPrefs = signal<UserPreferences>({ musicVolume: 0.5, voiceVolume: 1.0, textSpeed: 30 });
  currentSceneId = signal<string | null>(null);
  gameHistory = signal<GameHistoryEntry[]>([]);
  earnedAchievements = signal<Set<string>>(new Set()); 
  
  editorLanguage = signal<string>('default');
  playLanguage = signal<string>('default');
  achievementNotification = signal<{name: string, description: string, iconUrl?: string} | null>(null);
  saveSystemUpdate = signal<number>(Date.now()); 

  private historyStack: string[] = []; 
  private historyIndex = -1;
  private isUndoing = false;
  private saveTimeout: any;

  currentScene = computed(() => this.scenes().find(s => s && s.id === this.currentSceneId()) || null);

  assetMap = computed(() => {
      const map = new Map<string, string>();
      for (const a of this.assets()) {
          if (a.url) map.set(a.id, a.url);
      }
      return map;
  });

  constructor() {
    this.initSystem();
    
    effect(() => {
      const _activeId = this.activeProjectId();
      if (!_activeId) return;
      
      // Dependências para acionar o save
      const s = this.scenes(); 
      const st = this.settings(); 
      const a = this.achievements(); 
      // Assets changes usually trigger internal saves, but we watch structure changes here
      const as = this.assets().length; 

      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => { 
          this.forceSaveToStorage(); 
      }, 1000); // 1s delay to debounce writes
    });
  }

  private async initSystem() {
      // 1. Load Prefs
      const prefs = await this.storage.loadUserPrefs();
      if(prefs) this.userPrefs.set({...this.userPrefs(), ...prefs});

      // 2. Load Project List
      const list = await this.storage.getProjectList();
      this.projectList.set(list);

      if(list.length > 0) {
          const sorted = list.sort((a,b) => b.lastModified - a.lastModified);
          await this.loadProject(sorted[0].id);
      } else {
          await this.createNewProject('Novo Projeto');
      }
  }

  async createNewProject(name: string) {
      const id = crypto.randomUUID();
      // Não setamos o activeProjectId ainda para não disparar o efeito de save automático prematuramente
      
      this.scenes.set([]);
      this.assets.set([]);
      this.achievements.set([]);
      this.settings.set(JSON.parse(JSON.stringify(DEFAULT_SETTINGS))); 
      this.settings.update(s => ({...s, titleScreen: {...s.titleScreen, title: name}}));
      
      this.currentSceneId.set(null);
      this.historyStack = [];
      this.historyIndex = -1;
      
      // Reseta conquistas para novo projeto
      this.earnedAchievements.set(new Set());
      
      this.addScene('Cena Inicial');
      
      // Update Index first
      await this.updateProjectIndex(id, name);
      
      // Now enable active project
      this.activeProjectId.set(id);
      this.forceSaveToStorage();
  }

  async loadProject(id: string) {
      const data = await this.storage.loadProjectData(id);
      if(!data) {
          console.error("Project data not found");
          return;
      }

      // 1. Stop current auto-save
      this.activeProjectId.set('');

      // 2. Load basic data
      const validScenes = Array.isArray(data.scenes) 
          ? data.scenes.filter(s => s && s.id).map(s => ({
              ...s,
              characters: s.characters || [],
              choices: s.choices || [],
              hiddenObjects: s.hiddenObjects || [], 
              videoLoop: s.videoLoop !== undefined ? s.videoLoop : true
          })) 
          : [];
      
      this.scenes.set(validScenes);

      const mergedSettings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
      // Deep merge critical sections
      mergedSettings.titleScreen = { ...DEFAULT_SETTINGS.titleScreen, ...(data.settings?.titleScreen || {}) };
      mergedSettings.loadingScreen = { ...DEFAULT_SETTINGS.loadingScreen, ...(data.settings?.loadingScreen || {}) };
      mergedSettings.endingScreen = { ...DEFAULT_SETTINGS.endingScreen, ...(data.settings?.endingScreen || {}) };
      mergedSettings.achievementPopup = { ...DEFAULT_SETTINGS.achievementPopup, ...(data.settings?.achievementPopup || {}) };
      
      this.settings.set(mergedSettings);
      this.achievements.set(Array.isArray(data.achievements) ? data.achievements : []);
      
      // 3. Re-hydrate Assets (Blobs)
      // data.assets contains metadata (id, name, type). We need to fetch the Blobs and create URLs.
      const rawAssets = Array.isArray(data.assets) ? data.assets : [];
      const hydratedAssets: Asset[] = [];

      for (const meta of rawAssets) {
          const blob = await this.storage.getAssetBlob(meta.id);
          if (blob) {
              const url = URL.createObjectURL(blob);
              hydratedAssets.push({ ...meta, url });
          } else {
              // Asset record exists but blob is gone? Keep record but empty url
              hydratedAssets.push({ ...meta, url: '' });
          }
      }
      this.assets.set(hydratedAssets);

      // 4. Set state
      if(validScenes.length) {
          const startId = data.startSceneId || validScenes[0].id;
          this.currentSceneId.set(validScenes.some(s => s.id === startId) ? startId : validScenes[0].id);
      } else {
          this.currentSceneId.set(null);
      }

      this.isLocked.set(!!mergedSettings.password);
      this.historyStack = [];
      this.historyIndex = -1;

      // 5. Load Persisted Achievements for this project (Persistence!)
      await this.loadPersistedAchievements(id);

      // 6. Resume tracking
      this.activeProjectId.set(id);
  }

  async updateProjectIndex(id: string, name: string) {
      const list = [...this.projectList()];
      const idx = list.findIndex(p => p.id === id);
      const entry = { id, name, lastModified: Date.now() };
      
      if(idx >= 0) list[idx] = entry;
      else list.push(entry);
      
      this.projectList.set(list);
      await this.storage.saveProjectList(list);
  }

  async forceSaveToStorage() {
      const id = this.activeProjectId();
      if (!id) return;
      
      // Save metadata and structure
      const data: ProjectData = {
          id,
          name: this.projectList().find(p => p.id === id)?.name || 'Project',
          settings: this.settings(),
          scenes: this.scenes(),
          achievements: this.achievements(),
          // Don't save URLs, just asset metadata
          assets: this.assets().map(a => ({ id: a.id, name: a.name, type: a.type })), 
          startSceneId: this.scenes()[0]?.id || '',
          version: 2
      };

      if (!this.isUndoing) {
          // Simple history snapshot (omits assets for memory reasons)
          const json = JSON.stringify(data);
          this.addToHistory(json);
      }
      
      await this.storage.saveProjectData(id, data);
      await this.updateProjectIndex(id, data.name);
  }

  async deleteProject(id: string) {
      try {
          await this.storage.deleteProjectData(id);
          
          const list = this.projectList().filter(p => p.id !== id);
          this.projectList.set(list);
          await this.storage.saveProjectList(list);

          if (this.activeProjectId() === id) {
              this.activeProjectId.set(''); 
              this.scenes.set([]); 
              this.assets.set([]);
              this.settings.set({ ...DEFAULT_SETTINGS });
              this.currentSceneId.set(null);
              this.earnedAchievements.set(new Set());
              
              if (list.length > 0) {
                  await this.loadProject(list[0].id);
              } else {
                  await this.createNewProject('Novo Projeto');
              }
          }
      } catch (e) {
          console.error("Erro fatal ao deletar projeto:", e);
      }
  }

  async deleteProjectWithExport(id: string) {
      const data = await this.storage.loadProjectData(id);
      if (data) {
           const url = await this.assetManager.createExportBlob(data.settings, data.scenes, data.achievements, this.assets());
           const a = document.createElement("a");
           a.href = url;
           a.download = `${data.name}-backup.json`;
           a.click();
           URL.revokeObjectURL(url);
      }
      await this.deleteProject(id);
  }

  async updateProjectNameInList(id: string, name: string) {
      await this.updateProjectIndex(id, name);
      const data = await this.storage.loadProjectData(id);
      if(data) {
          data.name = name;
          await this.storage.saveProjectData(id, data);
      }
  }

  // --- ASSET HANDLING UPDATED ---

  async importFiles(files: FileList): Promise<Asset[]> {
      const processed = await this.assetManager.processFileList(files);
      const newAssets: Asset[] = [];

      // Save blobs to DB immediately
      for (const p of processed) {
          try {
              const res = await fetch(p.url);
              const blob = await res.blob();
              await this.storage.saveAssetBlob(p.id, blob);
              newAssets.push(p);
          } catch(e) {
              console.error("Error saving asset blob", e);
          }
      }

      if (newAssets.length) {
          this.assets.update(c => [...c, ...newAssets]);
      }
      return newAssets;
  }

  async importZip(file: File) {
      const newAssets = await this.assetManager.processZip(file);
      for (const asset of newAssets) {
          try {
              const res = await fetch(asset.url);
              const blob = await res.blob();
              await this.storage.saveAssetBlob(asset.id, blob);
          } catch (e) {
              console.error("Error persisting zip asset", e);
          }
      }

      if (newAssets.length) {
          this.assets.update(c => [...c, ...newAssets]);
          return true;
      }
      return false;
  }

  async exportProjectAsJson() {
      const url = await this.assetManager.createExportBlob(this.settings(), this.scenes(), this.achievements(), this.assets());
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.json';
      a.click();
  }

  async loadProjectFromJson(file: File): Promise<boolean> {
      try {
          const { data, assets } = await this.assetManager.parseImportedJson(file);
          const id = crypto.randomUUID();
          
          // Save all imported asset blobs to DB
          for (const asset of assets) {
              const res = await fetch(asset.url);
              const blob = await res.blob();
              await this.storage.saveAssetBlob(asset.id, blob);
          }

          // Setup state
          this.activeProjectId.set(id);
          this.scenes.set(data.scenes || []);
          this.achievements.set(data.achievements || []);
          this.settings.set({ ...DEFAULT_SETTINGS, ...(data.settings || {}) });
          this.assets.set(assets);
          
          // Clear achievements for new imported project
          this.earnedAchievements.set(new Set());
          
          await this.updateProjectIndex(id, data.name || 'Imported');
          await this.forceSaveToStorage();
          return true;
      } catch (e) {
          console.error(e);
          return false;
      }
  }
  
  async deleteAsset(id: string) {
      await this.storage.deleteAssetBlob(id); 
      
      this.assets.update(curr => curr.filter(a => a.id !== id));
      
      this.scenes.update(scenes => scenes.map(s => {
          const o = {...s};
          if(o.backgroundId === id) o.backgroundId = null;
          if(o.musicId === id) o.musicId = null;
          if(o.soundId === id) o.soundId = null;
          if(o.voiceoverId === id) o.voiceoverId = null;
          if(o.narratorId === id) o.narratorId = null;
          o.characters = o.characters.filter(c => c.assetId !== id);
          return o;
      }));

      this.settings.update(s => {
          const t = {...s.titleScreen}, e = {...s.endingScreen};
          if(t.backgroundId === id) t.backgroundId = null;
          if(t.musicId === id) t.musicId = null;
          if(e.backgroundId === id) e.backgroundId = null;
          let g = s.globalMusicId;
          if(g === id) g = null;
          return {...s, titleScreen: t, endingScreen: e, globalMusicId: g};
      });

      this.achievements.update(a => a.map(x => x.iconAssetId === id ? {...x, iconAssetId: null} : x));
      
      this.forceSaveToStorage();
  }

  getAssetUrl(id: string | null | undefined) {
      if (!id) return undefined;
      return this.assetMap().get(id);
  }

  addScene(name = 'Nova Cena'): string {
      const id = crypto.randomUUID();
      const newScene: Scene = {
          id, name, type: 'standard', backgroundId: null, bgX: 50, bgY: 50,
          characters: [], dialogueText: '...', speakerName: '', hideDialogueBox: false,
          choices: [], nextSceneId: null, transition: 'fade', effect: 'none',
          videoLoop: true, hiddenObjects: []
      };
      this.scenes.update(s => [...s, newScene]);
      if(!this.currentSceneId()) this.currentSceneId.set(id);
      return id;
  }
  
  addSceneLinked(parentId: string | null) {
      const id = this.addScene(`Cena ${this.scenes().length + 1}`);
      
      if(parentId) {
          this.updateScene(parentId, { nextSceneId: id });
          const parent = this.scenes().find(s => s.id === parentId);
          if (parent) {
              const inheritedChars = parent.characters.map(c => ({
                  ...c,
                  id: crypto.randomUUID(),
                  animation: 'none' as any 
              }));

              this.updateScene(id, {
                  backgroundId: parent.backgroundId,
                  bgX: parent.bgX,
                  bgY: parent.bgY,
                  isVideo: parent.isVideo,
                  videoLoop: parent.videoLoop,
                  videoMuted: parent.videoMuted,
                  musicId: parent.musicId, 
                  effect: parent.effect,
                  characters: inheritedChars,
                  speakerName: parent.speakerName
              });
          }
      }
      this.currentSceneId.set(id);
      return id;
  }

  updateScene(id: string, update: Partial<Scene>) {
      this.scenes.update(list => list.map(s => s.id === id ? { ...s, ...update } : s));
  }

  deleteScene(id: string) {
      const isCurrent = this.currentSceneId() === id;
      this.scenes.update(list => list.filter(s => s.id !== id));
      this.scenes.update(list => list.map(s => {
          const o = {...s};
          if(o.nextSceneId === id) o.nextSceneId = null;
          if(o.choices.some(c => c.targetSceneId === id)) {
              o.choices = o.choices.map(c => c.targetSceneId === id ? {...c, targetSceneId: null} : c);
          }
          return o;
      }));
      
      this.settings.update(s => {
          const ending = { ...s.endingScreen };
          let changed = false;
          if (ending.gallery?.some(g => g.sceneId === id)) { ending.gallery = ending.gallery.filter(g => g.sceneId !== id); changed = true; }
          if (ending.bonusScenes?.some(b => b.sceneId === id)) { ending.bonusScenes = ending.bonusScenes.filter(b => b.sceneId !== id); changed = true; }
          if (changed) return { ...s, endingScreen: ending };
          return s;
      });

      this.deleteGameSavesForScene(id);
      if(isCurrent) {
          const remaining = this.scenes();
          this.currentSceneId.set(remaining.length > 0 ? remaining[0].id : null);
      }
      this.forceSaveToStorage();
  }

  private async deleteGameSavesForScene(sceneId: string) {
      const p = this.activeProjectId();
      let saveUpdated = false;
      for(let i=1; i<=3; i++) {
          const slot = await this.storage.loadGameSlot(i, p);
          if(slot && slot.sceneId === sceneId) {
              await this.storage.deleteGameSlot(i, p);
              saveUpdated = true;
          }
      }
      if(saveUpdated) this.saveSystemUpdate.set(Date.now());
  }

  addCharacterToScene(sceneId: string, assetId: string) {
      const s = this.scenes().find(x => x.id === sceneId);
      if(!s) return;
      this.updateScene(sceneId, { 
          characters: [...s.characters, { id: crypto.randomUUID(), assetId, x: 50, y: 50, scale: 1 }] 
      });
  }
  updateCharacter(sceneId: string, charId: string, u: Partial<GameCharacter>) {
      const s = this.scenes().find(x => x.id === sceneId);
      if(!s) return;
      this.updateScene(sceneId, { 
          characters: s.characters.map(c => c.id === charId ? { ...c, ...u } : c) 
      });
  }
  removeCharacter(sceneId: string, charId: string) {
      const s = this.scenes().find(x => x.id === sceneId);
      if(!s) return;
      this.updateScene(sceneId, { 
          characters: s.characters.filter(c => c.id !== charId) 
      });
  }

  addChoice(sceneId: string) {
      const s = this.scenes().find(x => x.id === sceneId);
      if(!s) return;
      this.updateScene(sceneId, { 
          choices: [...s.choices, { id: crypto.randomUUID(), text: 'Opção', targetSceneId: null }] 
      });
  }
  updateChoice(sceneId: string, choiceId: string, u: Partial<Choice>) {
      const s = this.scenes().find(x => x.id === sceneId);
      if(!s) return;
      this.updateScene(sceneId, { 
          choices: s.choices.map(c => c.id === choiceId ? { ...c, ...u } : c) 
      });
  }
  removeChoice(sceneId: string, choiceId: string) {
      const s = this.scenes().find(x => x.id === sceneId);
      if(!s) return;
      this.updateScene(sceneId, { 
          choices: s.choices.filter(c => c.id !== choiceId) 
      });
  }

  addMiniGameToScene(sceneId: string, type: MiniGameType) {
      const s = this.scenes().find(x => x.id === sceneId);
      if(!s) return;
      
      const gameSceneId = this.addScene(`Mini-Game (${type})`);
      const gameConfig: MiniGame = { type, winMessage: 'Sucesso!', loseMessage: 'Tente novamente.' };
      
      if(type === 'quiz') Object.assign(gameConfig, { question: '?', options: ['A','B'], correctOptionIndex: 0 });
      if(type === 'lockpick') Object.assign(gameConfig, { lockpickPins: 3 });
      if(type === 'balance') Object.assign(gameConfig, { timeLimit: 10, balanceStability: 5 }); 
      if(type === 'mash') Object.assign(gameConfig, { timeLimit: 5, mashTarget: 15 }); 
      if(type === 'quick-click') Object.assign(gameConfig, { timeLimit: 3, targetSize: 15 });
      if(type === 'memory') Object.assign(gameConfig, { timeLimit: 30, gridSize: 4 });
      if(type === 'rhythm') Object.assign(gameConfig, { rhythmSpeed: 5 });
      if(type === 'timing') Object.assign(gameConfig, { timingSpeed: 5, timingZoneSize: 20 });
      if(type === 'find') Object.assign(gameConfig, { targetSize: 15, targetX: 50, targetY: 50 });
      
      const postSceneId = this.addScene(`Pós-Game`);
      
      this.updateScene(gameSceneId, {
          miniGame: gameConfig,
          backgroundId: s.backgroundId,
          bgX: s.bgX, bgY: s.bgY,
          dialogueText: 'Prepare-se...',
          nextSceneId: postSceneId
      });

      this.updateScene(postSceneId, {
          backgroundId: s.backgroundId,
          bgX: s.bgX, bgY: s.bgY,
          dialogueText: 'Desafio completado!',
          speakerName: s.speakerName
      });

      this.updateScene(sceneId, {
          nextSceneId: gameSceneId
      });

      this.currentSceneId.set(gameSceneId);
  }
  
  removeMiniGame(sceneId: string) {
      this.updateScene(sceneId, { miniGame: null });
  }

  addAchievement() {
      this.achievements.update(a => [...a, { id: crypto.randomUUID(), name: 'Nova', description: 'Desc', iconAssetId: null }]);
  }
  updateAchievement(id: string, u: Partial<Achievement>) {
      this.achievements.update(a => a.map(x => x.id === id ? { ...x, ...u } : x));
  }
  deleteAchievement(id: string) {
      this.achievements.update(a => a.filter(x => x.id !== id));
      this.scenes.update(s => s.map(z => z.awardAchievementId === id ? { ...z, awardAchievementId: null } : z));
      this.forceSaveToStorage();
  }
  
  // -- PERSISTENCE LOGIC START --
  
  private async loadPersistedAchievements(projectId: string) {
      try {
          // Use IndexedDB via StorageService instead of localStorage
          const list = await this.storage.loadEarnedAchievements(projectId);
          if (Array.isArray(list)) {
              this.earnedAchievements.set(new Set(list));
          } else {
              this.earnedAchievements.set(new Set());
          }
      } catch (e) {
          console.error("Failed to load achievements from DB", e);
          this.earnedAchievements.set(new Set());
      }
  }

  private async saveEarnedAchievements() {
      const projectId = this.activeProjectId();
      if (!projectId) return;
      try {
          const list = Array.from(this.earnedAchievements());
          // Save to IndexedDB
          await this.storage.saveEarnedAchievements(projectId, list);
      } catch (e) {
          console.error("Failed to save achievements to DB", e);
      }
  }

  unlockAchievement(id: string) {
      if(!this.earnedAchievements().has(id)) {
          this.earnedAchievements.update(s => new Set(s).add(id));
          
          // Trigger async save
          this.saveEarnedAchievements();

          const ach = this.achievements().find(x => x.id === id);
          if(ach) {
              const cfg = this.settings().achievementPopup;
              const duration = cfg ? cfg.duration : 4000;
              
              this.achievementNotification.set({ 
                  name: ach.name, 
                  description: ach.description, 
                  iconUrl: this.getAssetUrl(ach.iconAssetId) 
              });
              setTimeout(() => this.achievementNotification.set(null), duration);
          }
      }
  }

  // -- PERSISTENCE LOGIC END --

  resetRuntimeState() {
      // NOTE: We do NOT reset earnedAchievements anymore so they persist across replays
      // this.earnedAchievements.set(new Set()); <--- THIS WAS REMOVED TO PERSIST ACHIEVEMENTS
      
      this.achievementNotification.set(null);
      this.gameHistory.set([]);
      this.affectionService.reset();
      this.inventoryService.reset();
  }
  
  async performFullAppReset() {
      try {
          await this.storage.wipeAllData();
      } catch(e) {
          console.error("Reset Failed: ", e);
      } finally {
          window.location.reload();
      }
  }

  async saveGameToSlot(slotId: number) {
      const s = this.currentSceneId();
      if(!s) return;
      const c = this.scenes().find(x => x.id === s);
      const data = {
          slotId, timestamp: Date.now(),
          sceneId: s, sceneName: c?.name || '?',
          playerName: this.playerName(),
          affectionMap: this.affectionService.exportState(), 
          collectedItems: this.inventoryService.exportState() 
      };
      await this.storage.saveGameSlot(slotId, this.activeProjectId(), data);
      this.saveSystemUpdate.set(Date.now());
  }
  
  async loadGameFromSlot(slotId: number): Promise<string | null> {
      const data = await this.storage.loadGameSlot(slotId, this.activeProjectId());
      if(data && this.scenes().some(s => s.id === data.sceneId)) {
          this.playerName.set(data.playerName || 'Jogador');
          this.currentSceneId.set(data.sceneId);
          this.affectionService.importState(data.affectionMap); 
          this.inventoryService.importState(data.collectedItems); 
          return data.sceneId;
      }
      return null;
  }
  
  async getSlots() {
      const slots = [];
      const pid = this.activeProjectId();
      for(let i=1; i<=3; i++) {
          slots.push(await this.storage.loadGameSlot(i, pid));
      }
      return slots;
  }

  async updateUserPref(u: Partial<UserPreferences>) {
      const n = { ...this.userPrefs(), ...u };
      this.userPrefs.set(n);
      await this.storage.saveUserPrefs(n);
  }

  addToHistory(json: string) {
      if(this.historyIndex >= 0 && this.historyStack[this.historyIndex] === json) return;
      if(this.historyIndex < this.historyStack.length - 1) {
          this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
      }
      if(this.historyStack.length > 15) this.historyStack.shift();
      else this.historyIndex++;
      this.historyStack.push(json);
  }
  undo() {
      if(this.historyIndex > 0) {
          this.isUndoing = true;
          this.historyIndex--;
          this.restoreState(this.historyStack[this.historyIndex]);
          setTimeout(() => this.isUndoing = false, 0);
      }
  }
  redo() {
      if(this.historyIndex < this.historyStack.length - 1) {
          this.isUndoing = true;
          this.historyIndex++;
          this.restoreState(this.historyStack[this.historyIndex]);
          setTimeout(() => this.isUndoing = false, 0);
      }
  }
  private restoreState(json: string) {
      try {
          const d = JSON.parse(json);
          if(d.scenes) this.scenes.set(d.scenes);
          if(d.settings) this.settings.set(d.settings);
          if(d.achievements) this.achievements.set(d.achievements);
      } catch(e) { console.error(e); }
  }
  
  addToGameHistory(e: any) { this.gameHistory.update(h => [...h, e]); }
  
  addLanguage(i: string, n: string) { 
      if(this.settings().languages.some(l => l.id === i)) return;
      this.settings.update(s => ({...s, languages: [...s.languages, {id: i, name: n, isDefault: false}]}));
  }
  updateLanguageName(i: string, n: string) {
      this.settings.update(s => ({...s, languages: s.languages.map(l => l.id === i ? {...l, name: n} : l)}));
  }
  removeLanguage(i: string) {
      if(i === 'default') return;
      this.settings.update(s => ({...s, languages: s.languages.filter(l => l.id !== i), translations: {...s.translations, [i]: undefined}}));
  }

  getLocalizedText(s: Scene, k: any): string {
      const l = this.playLanguage();
      if(l === 'default') return s[k as keyof Scene] as string;
      return (s.translations?.[l] as any)?.[k] || s[k as keyof Scene];
  }
  getLocalizedVoice(s: Scene) {
      const l = this.playLanguage();
      return l === 'default' ? s.voiceoverId : (s.translations?.[l]?.voiceoverId !== undefined ? s.translations?.[l]?.voiceoverId : s.voiceoverId);
  }
  getLocalizedNarrator(s: Scene) {
      const l = this.playLanguage();
      return l === 'default' ? s.narratorId : (s.translations?.[l]?.narratorId !== undefined ? s.translations?.[l]?.narratorId : s.narratorId);
  }
  getLocalizedChoiceText(s: Scene, id: string, def: string) {
      const l = this.playLanguage();
      return l === 'default' ? def : (s.translations?.[l]?.choices?.[id] || def);
  }
  
  getLocalizedSettings() {
      const s = this.settings();
      const l = this.playLanguage();
      if(l === 'default') return s;
      const t = s.translations?.[l];
      if(!t) return s;
      return { 
          ...s, 
          titleScreen: {...s.titleScreen, ...t.titleScreen},
          loadingScreen: {...s.loadingScreen, ...t.loadingScreen},
          endingScreen: {...s.endingScreen, ...t.endingScreen},
          gameplayMenu: {...s.gameplayMenu, ...t.gameplayMenu},
          termsOfUse: t.termsOfUse || s.termsOfUse 
      };
  }

  // --- MISSING GETTERS FIXED HERE ---
  getLocalizedTitleSetting(key: string) { return this.getLocSettingValue('titleScreen', key); }
  getLocalizedEndingSetting(key: string) { return this.getLocSettingValue('endingScreen', key); }
  getLocalizedLoadingSetting(key: string) { return this.getLocSettingValue('loadingScreen', key); }
  getLocalizedMenuSetting(key: string) { return this.getLocSettingValue('gameplayMenu', key); }

  private getLocSettingValue(section: string, key: string): any {
      const lang = this.editorLanguage();
      if (lang === 'default') {
          return (this.settings() as any)[section]?.[key];
      } else {
          return (this.settings().translations?.[lang] as any)?.[section]?.[key] || '';
      }
  }

  updateLocalizedTitleSetting(k: string, v: string) { this.updateLocSetting('titleScreen', k, v); }
  updateLocalizedEndingSetting(k: string, v: string) { this.updateLocSetting('endingScreen', k, v); }
  updateLocalizedLoadingSetting(k: string, v: string) { this.updateLocSetting('loadingScreen', k, v); }
  updateLocalizedMenuSetting(k: string, v: string) { this.updateLocSetting('gameplayMenu', k, v); }

  private updateLocSetting(section: string, key: string, val: any) {
      const lang = this.editorLanguage();
      if (lang === 'default') {
          // generic update
          const s = this.settings() as any;
          this.settings.update(curr => ({...curr, [section]: {...s[section], [key]: val}}));
      } else {
          // translation update
          const allTrans = this.settings().translations || {};
          const langTrans = allTrans[lang] || {};
          const secTrans = (langTrans as any)[section] || {};
          
          this.settings.update(curr => ({
              ...curr,
              translations: {
                  ...allTrans,
                  [lang]: {
                      ...langTrans,
                      [section]: { ...secTrans, [key]: val }
                  }
              }
          }));
      }
  }
}
