
import { Injectable } from '@angular/core';
import { DbProject, ApiResult } from '../types/database.types';

@Injectable({
  providedIn: 'root'
})
export class ExecutorBridgeService {
  
  // CONFIGURAÇÃO DA API EXTERNA
  private readonly API_BASE_URL = 'https://api.executorplayer.com/v1'; // Exemplo
  private readonly API_KEY = 'YOUR_API_KEY_HERE'; // Deve vir de environment.ts em prod

  /**
   * Envia um projeto local para a plataforma Executor Player.
   */
  async publishProject(project: DbProject, userToken: string): Promise<ApiResult<{ externalId: string }>> {
    console.log(`[ExecutorBridge] Iniciando publicação do projeto: ${project.name}`);

    // 1. Validar dados antes de enviar
    if (!project.data || !project.data.scenes || project.data.scenes.length === 0) {
      return { success: false, error: 'O projeto está vazio ou inválido.' };
    }

    // 2. Preparar Payload (Estrutura que a API externa espera)
    const payload = {
      title: project.name,
      description: project.description,
      author_id: project.userId, // Vincula ao perfil
      visibility: project.visibility,
      content_json: JSON.stringify(project.data), // O jogo em si
      tags: ['visual-novel', 'vn-creator'],
      api_key: this.API_KEY
    };

    try {
      // SIMULAÇÃO DA CHAMADA HTTP REAL
      // const response = await fetch(`${this.API_BASE_URL}/projects/publish`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${userToken}` 
      //   },
      //   body: JSON.stringify(payload)
      // });
      // const result = await response.json();

      // MOCK DE RESPOSTA (Simulando delay de rede)
      await new Promise(r => setTimeout(r, 2000));
      
      const mockSuccess = true; // Mude para testar erros

      if (mockSuccess) {
        console.log('[ExecutorBridge] Publicação realizada com sucesso!');
        return { 
          success: true, 
          data: { externalId: `ext_${crypto.randomUUID().split('-')[0]}` } 
        };
      } else {
        throw new Error('API Externa recusou a conexão (Erro 403)');
      }

    } catch (e: any) {
      console.error('[ExecutorBridge] Falha na publicação:', e);
      return { success: false, error: e.message || 'Erro de conexão com Executor Player' };
    }
  }

  /**
   * Verifica o status de uma publicação (Polling)
   */
  async checkStatus(externalId: string): Promise<string> {
    // Implementação futura para checar se o processamento do vídeo/jogo terminou lá fora
    return 'active';
  }
}
