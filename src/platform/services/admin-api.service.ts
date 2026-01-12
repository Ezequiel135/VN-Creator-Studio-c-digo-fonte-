
import { Injectable, inject } from '@angular/core';
import { MockBackendService } from './mock-backend.service';
import { ApiResult } from '../types/database.types';
import { DbUser, DbProject } from '../types/database.types';
import { NotificationType } from '../types/admin.types';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  // Conecta ao "Banco" (Backend) para realizar as operações
  private backend = inject(MockBackendService);

  // Token fixo para simulação (em prod viria de header/env)
  private readonly MASTER_KEY = 'SECRET_ADMIN_TOKEN_123';

  // Helper para validar acesso
  private validateAccess(token: string): boolean {
      // Verifica se o token existe na tabela de admins
      const admin = this.backend._internal_getAdmins().find(a => a.apiToken === token);
      return !!admin;
  }

  // ==========================================
  // 1. GERENCIAMENTO DE USUÁRIOS
  // ==========================================

  async getAllUsers(adminToken: string): Promise<ApiResult<DbUser[]>> {
      if (!this.validateAccess(adminToken)) return { success: false, error: 'Acesso Negado: Token inválido' };
      
      const users = this.backend._internal_getAllUsers();
      // Retorna dados sensíveis apenas para admin
      return { success: true, data: users };
  }

  async banUser(adminToken: string, userId: string): Promise<ApiResult<void>> {
      if (!this.validateAccess(adminToken)) return { success: false, error: 'Acesso Negado' };

      this.backend._internal_updateUserStatus(userId, 'banned');
      
      this.logAction(adminToken, 'BAN_USER', userId, 'Usuário banido via API Admin');
      
      // Envia notificação de banimento
      this.sendNotification(adminToken, {
          title: 'Conta Suspensa',
          message: 'Sua conta foi suspensa por violação dos termos de uso.',
          type: 'ban',
          targetUserId: userId
      });

      return { success: true };
  }

  async unbanUser(adminToken: string, userId: string): Promise<ApiResult<void>> {
      if (!this.validateAccess(adminToken)) return { success: false, error: 'Acesso Negado' };
      this.backend._internal_updateUserStatus(userId, 'active');
      this.logAction(adminToken, 'UNBAN_USER', userId, 'Usuário reativado');
      return { success: true };
  }

  // ==========================================
  // 2. GERENCIAMENTO DE PROJETOS
  // ==========================================

  async getAllProjects(adminToken: string): Promise<ApiResult<DbProject[]>> {
      if (!this.validateAccess(adminToken)) return { success: false, error: 'Acesso Negado' };
      return { success: true, data: this.backend._internal_getAllProjects() };
  }

  async forceDeleteProject(adminToken: string, projectId: string, reason: string): Promise<ApiResult<void>> {
      if (!this.validateAccess(adminToken)) return { success: false, error: 'Acesso Negado' };

      const project = this.backend._internal_getAllProjects().find(p => p.id === projectId);
      if (!project) return { success: false, error: 'Projeto não encontrado' };

      this.backend._internal_deleteProject(projectId);
      
      this.logAction(adminToken, 'DELETE_PROJECT', projectId, reason);

      // Avisa o dono
      this.sendNotification(adminToken, {
          title: 'Projeto Removido',
          message: `Seu projeto "${project.name}" foi removido pela administração. Motivo: ${reason}`,
          type: 'warning',
          targetUserId: project.userId
      });

      return { success: true };
  }

  // ==========================================
  // 3. NOTIFICAÇÕES (Sistema de Push)
  // ==========================================

  async sendNotification(adminToken: string, payload: { title: string, message: string, targetUserId?: string | null, type?: NotificationType }): Promise<ApiResult<void>> {
      if (!this.validateAccess(adminToken)) return { success: false, error: 'Acesso Negado' };

      this.backend._internal_pushNotification({
          id: crypto.randomUUID(),
          title: payload.title,
          message: payload.message,
          targetUserId: payload.targetUserId || null, // null = Global
          type: payload.type || 'system',
          createdAt: new Date()
      });

      this.logAction(adminToken, 'SEND_NOTIF', payload.targetUserId || 'GLOBAL', payload.title);
      return { success: true };
  }

  // ==========================================
  // 4. LOGS E UTILITÁRIOS
  // ==========================================

  private logAction(token: string, action: string, target: string, details: string) {
      const admin = this.backend._internal_getAdmins().find(a => a.apiToken === token);
      if(admin) {
          this.backend._internal_pushLog({
              id: crypto.randomUUID(),
              adminId: admin.id,
              action,
              targetId: target,
              details,
              timestamp: new Date()
          });
      }
  }
}
