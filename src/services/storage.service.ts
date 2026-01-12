
import { Injectable } from '@angular/core';
import { ProjectData, ProjectSummary, Asset, UserPreferences } from '../types';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbName = 'VNCreatorStudioDB';
  // Bump version to 2 to create the new store
  private dbVersion = 2;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('IndexedDB Error:', event);
        reject('Erro ao abrir banco de dados');
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        // Store para Metadados dos Projetos (Lista)
        if (!db.objectStoreNames.contains('projects_meta')) {
          db.createObjectStore('projects_meta', { keyPath: 'id' });
        }
        // Store para Dados Completos do Projeto (Cenas, Configs)
        if (!db.objectStoreNames.contains('projects_data')) {
          db.createObjectStore('projects_data', { keyPath: 'id' });
        }
        // Store para Assets (Imagens, Áudios - Blobs pesados)
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }
        // Store para Saves de Jogo
        if (!db.objectStoreNames.contains('game_saves')) {
          db.createObjectStore('game_saves', { keyPath: 'key' }); // key = slotId-projectId
        }
        // Store para Preferências
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
        // NOVA STORE: Conquistas Desbloqueadas (Persistência Robusta)
        if (!db.objectStoreNames.contains('earned_achievements')) {
          db.createObjectStore('earned_achievements', { keyPath: 'projectId' });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    await this.initDB();
    return this.db!;
  }

  // --- GENERIC HELPERS ---

  private async putItem(storeName: string, item: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getItem<T>(storeName: string, key: string): Promise<T | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllItems<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteItem(storeName: string, key: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- SPECIFIC METHODS ---

  async getProjectList(): Promise<ProjectSummary[]> {
    return this.getAllItems<ProjectSummary>('projects_meta');
  }

  async saveProjectList(list: ProjectSummary[]): Promise<void> {
    // Save individually to update meta
    const db = await this.getDB();
    const transaction = db.transaction(['projects_meta'], 'readwrite');
    const store = transaction.objectStore('projects_meta');
    list.forEach(p => store.put(p));
    return new Promise((resolve) => {
        transaction.oncomplete = () => resolve();
    });
  }

  async loadProjectData(id: string): Promise<ProjectData | undefined> {
    return this.getItem<ProjectData>('projects_data', id);
  }

  async saveProjectData(id: string, data: ProjectData): Promise<void> {
    // Separate assets from data to ensure lightweight JSON logic
    // Assets are saved via saveAssetBlob independently
    return this.putItem('projects_data', data);
  }

  async deleteProjectData(id: string): Promise<void> {
    await this.deleteItem('projects_data', id);
    await this.deleteItem('projects_meta', id);
    // Note: Assets associated strictly with this project should be cleaned up,
    // but in this simple implementation we keep them to avoid deleting shared assets.
    // A robust system would check reference counts.
    
    // Clean saves
    for (let i = 1; i <= 3; i++) {
      await this.deleteItem('game_saves', `${i}-${id}`);
    }
    // Clean achievements
    await this.deleteItem('earned_achievements', id);
  }

  // --- ASSET MANAGEMENT (BLOB STORAGE) ---

  async saveAssetBlob(assetId: string, blob: Blob): Promise<void> {
    return this.putItem('assets', { id: assetId, blob: blob });
  }

  async getAssetBlob(assetId: string): Promise<Blob | null> {
    const item = await this.getItem<{id: string, blob: Blob}>('assets', assetId);
    return item ? item.blob : null;
  }

  async deleteAssetBlob(assetId: string): Promise<void> {
    return this.deleteItem('assets', assetId);
  }

  // --- GAME SAVES ---

  async saveGameSlot(slotId: number, projectId: string, data: any): Promise<void> {
    return this.putItem('game_saves', { key: `${slotId}-${projectId}`, data });
  }

  async loadGameSlot(slotId: number, projectId: string): Promise<any | null> {
    const result = await this.getItem<{key: string, data: any}>('game_saves', `${slotId}-${projectId}`);
    return result ? result.data : null;
  }

  async deleteGameSlot(slotId: number, projectId: string): Promise<void> {
    return this.deleteItem('game_saves', `${slotId}-${projectId}`);
  }

  // --- PREFS ---

  async loadUserPrefs(): Promise<UserPreferences> {
    const result = await this.getItem<{key: string, prefs: UserPreferences}>('preferences', 'user_main');
    return result ? result.prefs : { musicVolume: 0.5, voiceVolume: 1.0, textSpeed: 30 };
  }

  async saveUserPrefs(prefs: UserPreferences): Promise<void> {
    return this.putItem('preferences', { key: 'user_main', prefs });
  }

  // --- EARNED ACHIEVEMENTS (NEW) ---
  
  async saveEarnedAchievements(projectId: string, achievementIds: string[]): Promise<void> {
      return this.putItem('earned_achievements', { projectId, ids: achievementIds });
  }

  async loadEarnedAchievements(projectId: string): Promise<string[]> {
      const res = await this.getItem<{projectId: string, ids: string[]}>('earned_achievements', projectId);
      return res ? res.ids : [];
  }

  async wipeAllData(): Promise<void> {
      const db = await this.getDB();
      db.close();
      return new Promise((resolve, reject) => {
          const req = indexedDB.deleteDatabase(this.dbName);
          req.onsuccess = () => resolve();
          req.onerror = () => reject();
      });
  }
}
