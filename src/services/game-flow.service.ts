
import { Injectable, inject, signal } from '@angular/core';
import { VnService } from './vn.service';
import { Scene, Choice } from '../types';

@Injectable({
  providedIn: 'root'
})
export class GameFlowService {
  private vnService = inject(VnService);

  // Runtime State Signals
  videoEnded = signal(false);
  isTyping = signal(true);
  
  // Reseta o estado ao entrar em nova cena
  resetSceneState(scene: Scene) {
      this.videoEnded.set(false);
      
      // Se não tem diálogo, não está digitando
      const hasDialogue = !!this.vnService.getLocalizedText(scene, 'dialogueText');
      this.isTyping.set(hasDialogue);
  }

  /**
   * A LÓGICA MESTRA DE INTERAÇÃO (O "Cérebro" do clique)
   * Decide o que acontece quando o jogador clica na tela.
   */
  handleScreenClick(scene: Scene): 'wait' | 'advance' | 'finish-typing' {
      // 1. Se estiver digitando texto, o clique apenas termina o texto imediatamente.
      if (this.isTyping()) {
          this.isTyping.set(false);
          return 'finish-typing';
      }

      // 2. Se houver escolhas (botões), o clique na tela é bloqueado.
      // O jogador DEVE clicar num botão de escolha.
      if (scene.choices && scene.choices.length > 0) {
          return 'wait';
      }

      // 3. Lógica de Vídeo
      if (scene.isVideo) {
          const isLooping = scene.videoLoop !== false; // Padrão é true se undefined

          if (!isLooping) {
              // Se NÃO for loop, o vídeo deve terminar antes de avançar.
              if (!this.videoEnded()) {
                  return 'wait'; // Bloqueia clique enquanto vídeo roda
              }
              // Se já terminou, avança (mas isso geralmente é tratado pelo evento 'ended')
              return 'advance';
          } else {
              // Se FOR loop, o clique avança a cena normalmente
              return 'advance';
          }
      }

      // 4. Cena normal (Imagem/Fundo)
      return 'advance';
  }

  /**
   * Lógica executada quando um vídeo termina de tocar
   */
  handleVideoEnd(scene: Scene): 'advance' | 'loop' {
      this.videoEnded.set(true);
      
      const isLooping = scene.videoLoop !== false;

      if (!isLooping) {
          // Se não é loop, avança automaticamente quando acaba
          this.advance(scene);
          return 'advance';
      }
      
      // Se é loop, o player de vídeo HTML cuida do replay, nada a fazer aqui
      return 'loop';
  }

  /**
   * Lógica para processar uma escolha
   */
  makeChoice(scene: Scene, choice: Choice) {
      // Registra no histórico
      this.vnService.addToGameHistory({ 
          type: 'choice', 
          text: this.vnService.getLocalizedChoiceText(scene, choice.id, choice.text) 
      });
      
      // Navega
      this.vnService.currentSceneId.set(choice.targetSceneId || null);
  }

  /**
   * Lógica para avançar para a próxima cena (Fluxo Linear)
   */
  advance(scene: Scene) {
      if (scene.nextSceneId) {
          this.vnService.currentSceneId.set(scene.nextSceneId);
      } else {
          this.vnService.currentSceneId.set(null); // Fim do jogo / Menu
      }
  }
}
