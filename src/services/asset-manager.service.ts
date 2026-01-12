
import { Injectable } from '@angular/core';
import { Asset, AssetType } from '../types';

@Injectable({
  providedIn: 'root'
})
export class AssetManagerService {

  // Processa arquivos normais (selecionados da galeria) em lotes
  async processFileList(files: FileList): Promise<Asset[]> {
    const assets: Asset[] = [];
    const fileArray = Array.from(files);
    
    // Chunk size 10 conforme solicitado para não travar
    const chunkSize = 10;
    
    for (let i = 0; i < fileArray.length; i += chunkSize) {
       const chunk = fileArray.slice(i, i + chunkSize);
       
       // Processa o lote atual
       const promises = chunk.map(f => this.processSingleFile(f));
       const results = await Promise.all(promises);
       
       results.forEach(r => { if(r) assets.push(r); });
       
       // Pausa vital para a UI atualizar e não congelar (50ms)
       await new Promise(r => setTimeout(r, 50));
    }
    return assets;
  }

  private async processSingleFile(f: File): Promise<Asset | null> {
    const id = crypto.randomUUID();
    const url = URL.createObjectURL(f);
    
    if (f.type.startsWith('audio/')) return { id, name: f.name, type: 'audio', url };
    
    // Vídeos são backgrounds/cenas
    if (f.type.startsWith('video/')) return { id, name: f.name, type: 'video', url };
    
    // Imagens (JPG, PNG, GIF, WEBP)
    if (f.type.startsWith('image/')) {
        // Lógica Principal solicitada:
        // Se tem transparência -> Personagem
        // Se não tem (opaco) -> Fundo (Background)
        const isTransparent = await this.checkTransparency(url);
        return { id, name: f.name, type: isTransparent ? 'character' : 'background', url };
    }
    
    URL.revokeObjectURL(url);
    return null;
  }

  // Processa arquivo ZIP corrigindo o erro de referência e usando lotes
  async processZip(file: File): Promise<Asset[]> {
    const JSZip = (window as any).JSZip;

    if (!JSZip) {
        alert("Erro: Biblioteca JSZip não carregada. Verifique sua conexão com a internet para importar ZIPs.");
        console.error('JSZip not found in window scope');
        return [];
    }

    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      
      // Filtra arquivos (ignora pastas e arquivos de sistema do Mac)
      const files = Object.keys(content.files).filter(x => !content.files[x].dir && !x.includes('__MACOSX'));
      
      const assets: Asset[] = [];
      const chunkSize = 10; // Processa 10 arquivos do ZIP por vez

      for (let i = 0; i < files.length; i += chunkSize) {
          const chunk = files.slice(i, i + chunkSize);
          
          const promises = chunk.map(async (filename) => {
              const zipObj = content.files[filename];
              // Converte para Blob
              const blob = await zipObj.async('blob');
              const url = URL.createObjectURL(blob);
              const mime = blob.type;
              const nameLower = filename.toLowerCase();
              
              let type: AssetType | null = null;
              
              // Detecção de tipo baseada em MIME ou Extensão
              if (mime.startsWith('audio/') || nameLower.match(/\.(mp3|wav|ogg|m4a)$/)) type = 'audio';
              else if (mime.startsWith('video/') || nameLower.match(/\.(mp4|webm|ogv)$/)) type = 'video';
              else if (mime.startsWith('image/') || nameLower.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
                  // Verifica transparência para decidir se é Personagem ou Fundo
                  const isTrans = await this.checkTransparency(url);
                  type = isTrans ? 'character' : 'background';
              }

              if (type) {
                  // Retorna o Asset com a URL temporária (Blob URL)
                  return { id: crypto.randomUUID(), name: filename, type, url } as Asset;
              }
              
              URL.revokeObjectURL(url); // Limpa memória se não for asset válido
              return null;
          });

          // Aguarda o lote atual terminar
          const results = await Promise.all(promises);
          results.forEach(r => { if(r) assets.push(r); });
          
          // Pausa para evitar travamento da UI durante extração pesada
          await new Promise(res => setTimeout(res, 50));
      }
      return assets;
    } catch (e) {
      console.error('AssetManager: ZIP Import failed', e);
      alert('Falha ao ler o arquivo ZIP. Verifique se ele é válido.');
      return [];
    }
  }

  private checkTransparency(url: string): Promise<boolean> {
    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Crucial para não ter erro de canvas taint se for URL externa
        img.onload = () => {
            // Se for JPG, nunca tem transparência ( Atalho de performance )
            if (url.toLowerCase().endsWith('.jpg') || url.toLowerCase().endsWith('.jpeg')) {
                return resolve(false);
            }

            const canvas = document.createElement('canvas');
            // Reduz tamanho para check mais rápido (não precisamos de precisão 4k)
            const w = Math.min(img.width, 100);
            const h = Math.min(img.height, 100);
            
            canvas.width = w;
            canvas.height = h;
            
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return resolve(false);
            
            ctx.drawImage(img, 0, 0, w, h);
            
            try {
                const imageData = ctx.getImageData(0, 0, w, h).data;
                
                // Checa os cantos primeiro (normalmente onde o fundo aparece)
                const corners = [
                    0, // Top Left
                    (w - 1) * 4, // Top Right
                    (h - 1) * w * 4, // Bottom Left
                    ((h - 1) * w + (w - 1)) * 4 // Bottom Right
                ];

                for(let c of corners) {
                    if (imageData[c + 3] < 250) return resolve(true); // Encontrou transparência num canto
                }

                // Se cantos são sólidos, faz varredura rápida
                // Pula pixels para performance (stride)
                for (let i = 3; i < imageData.length; i += 40) { // Check every 10th pixel alpha
                    if (imageData[i] < 250) { 
                        return resolve(true); // Transparente!
                    }
                }
            } catch(e) {
                // Se der erro (ex: CORS), assume Fundo por segurança
            }
            
            // Se varreu tudo e não achou alpha < 250, é opaco (Fundo)
            resolve(false);
        };
        img.onerror = () => resolve(false);
        img.src = url;
    });
  }

  async createExportBlob(settings: any, scenes: any, achievements: any, assets: Asset[]): Promise<string> {
      const embeddedAssets = [];
      const chunkSize = 10;

      // Exportação também em lotes para não estourar a memória do navegador
      for (let i = 0; i < assets.length; i += chunkSize) {
          const chunk = assets.slice(i, i + chunkSize);
          
          for (const asset of chunk) {
              try {
                  const response = await fetch(asset.url);
                  const blob = await response.blob();
                  const reader = new FileReader();
                  const base64 = await new Promise<string>(resolve => {
                      reader.onload = () => resolve(reader.result as string);
                      reader.readAsDataURL(blob);
                  });
                  embeddedAssets.push({ ...asset, data: base64, url: undefined });
              } catch (e) {
                  console.warn(`Failed to export asset: ${asset.name}`);
              }
          }
          // Pausa na exportação
          await new Promise(r => setTimeout(r, 20));
      }

      const projectData = {
          ...settings,
          scenes,
          achievements,
          embeddedAssets
      };

      return URL.createObjectURL(new Blob([JSON.stringify(projectData)], { type: 'application/json' }));
  }

  async parseImportedJson(file: File): Promise<any> {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const rebuiltAssets: Asset[] = [];
      if (data.embeddedAssets) {
          const chunkSize = 10;
          for (let i = 0; i < data.embeddedAssets.length; i += chunkSize) {
             const chunk = data.embeddedAssets.slice(i, i + chunkSize);
             
             for (const raw of chunk) {
                 const res = await fetch(raw.data);
                 const blob = await res.blob();
                 rebuiltAssets.push({
                     id: raw.id,
                     name: raw.name,
                     type: raw.type,
                     url: URL.createObjectURL(blob)
                 });
             }
             // Pausa na importação do JSON
             await new Promise(r => setTimeout(r, 20));
          }
      }
      return { data, assets: rebuiltAssets };
  }
}
