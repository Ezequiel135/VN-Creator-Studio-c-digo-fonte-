
import { Injectable, signal } from '@angular/core';
import { DbUser, DbProject, ApiResult } from '../types/database.types';
import { DbAdmin, DbNotification, DbAdminLog } from '../types/admin.types';
import { ProjectVersion, SupportTicket, TicketMessage, AdminStats, SecurityLog, IntegrationLog } from '../types/advanced-platform.types';

@Injectable({
  providedIn: 'root'
})
export class MockBackendService {
  // "BANCO DE DADOS" EM MEMÓRIA
  private usersTable: DbUser[] = [];
  private projectsTable: DbProject[] = [];
  private adminsTable: DbAdmin[] = [];
  private notificationsTable: DbNotification[] = [];
  private adminLogsTable: DbAdminLog[] = [];
  
  // NOVAS TABELAS
  private projectVersionsTable: ProjectVersion[] = [];
  private ticketsTable: SupportTicket[] = [];
  private securityLogsTable: SecurityLog[] = [];
  private integrationLogsTable: IntegrationLog[] = [];
  private blockedIps = new Set<string>();

  // Sessão Atual
  currentUser = signal<DbUser | null>(null);
  currentAdmin = signal<DbAdmin | null>(null);

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    // Usuário Demo
    this.usersTable.push({
      id: 'user_1',
      name: 'Criador Demo',
      email: 'demo@vn.com',
      passwordHash: '12345',
      status: 'active',
      createdAt: new Date(),
      lastLogin: new Date(),
      executorProfileId: 'exec_user_99'
    });

    // Admin Demo
    this.adminsTable.push({
        id: 'admin_1',
        name: 'Super Admin',
        email: 'admin@system.com',
        passwordHash: 'root',
        accessLevel: 'super_admin',
        apiToken: 'SECRET_ADMIN_TOKEN_123',
        lastLogin: new Date()
    });

    // Ticket Demo
    this.ticketsTable.push({
        id: 'ticket_1',
        userId: 'user_1',
        subject: 'Erro ao publicar projeto',
        category: 'bug',
        priority: 'high',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
            { id: 'msg_1', ticketId: 'ticket_1', senderId: 'user_1', senderRole: 'user', message: 'Tento enviar e dá erro 500.', timestamp: new Date() }
        ]
    });
  }

  // =========================
  // AUTH
  // =========================

  async login(email: string, pass: string): Promise<ApiResult<DbUser>> {
    await this.delay();
    
    // Simulação de check de IP
    const mockIp = '192.168.1.1';
    if (this.blockedIps.has(mockIp)) {
        this.logSecurity(mockIp, null, 'LOGIN_ATTEMPT_BLOCKED', 'critical', true);
        return { success: false, error: 'IP Bloqueado temporariamente por atividade suspeita.' };
    }

    const user = this.usersTable.find(u => u.email === email && u.passwordHash === pass);
    
    if (user) {
      if (user.status === 'banned') return { success: false, error: 'Conta suspensa.' };
      
      const sessionUser = { ...user, token: 'fake_jwt_' + Date.now() };
      this.currentUser.set(sessionUser);
      this.logSecurity(mockIp, user.id, 'LOGIN_SUCCESS', 'info');
      return { success: true, data: sessionUser };
    }
    
    this.logSecurity(mockIp, null, 'LOGIN_FAIL', 'warning');
    return { success: false, error: 'Credenciais inválidas.' };
  }

  async register(name: string, email: string, pass: string): Promise<ApiResult<DbUser>> {
    await this.delay();
    if (this.usersTable.find(u => u.email === email)) {
      return { success: false, error: 'Email já cadastrado.' };
    }

    const newUser: DbUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: pass, // Nota: Num backend real, usar bcrypt!
      status: 'active',
      createdAt: new Date(),
      lastLogin: new Date()
    };

    this.usersTable.push(newUser);
    return this.login(email, pass); // Auto-login
  }

  async adminLogin(token: string): Promise<ApiResult<DbAdmin>> {
      await this.delay();
      const admin = this.adminsTable.find(a => a.apiToken === token);
      if (admin) {
          this.currentAdmin.set(admin);
          return { success: true, data: admin };
      }
      return { success: false, error: 'Token Inválido' };
  }

  logout() {
    this.currentUser.set(null);
    this.currentAdmin.set(null);
  }

  // =========================
  // PROJETOS & VERSIONAMENTO
  // =========================

  async getMyProjects(): Promise<ApiResult<DbProject[]>> {
    const user = this.currentUser();
    if (!user) return { success: false, error: 'Auth required' };
    return { success: true, data: this.projectsTable.filter(p => p.userId === user.id && !p.adminDeleted) };
  }

  async createProject(name: string, description: string, visibility: 'public'|'private', initialData: any): Promise<ApiResult<DbProject>> {
    const user = this.currentUser();
    if (!user) return { success: false, error: 'Auth required' };

    const newProj: DbProject = {
      id: crypto.randomUUID(),
      userId: user.id,
      name, description, visibility,
      data: initialData,
      publishStatus: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projectsTable.push(newProj);
    
    // Cria versão inicial
    this.saveProjectVersion(newProj.id, user.id, 'Versão Inicial', initialData);

    return { success: true, data: newProj };
  }

  async updateProject(id: string, updates: Partial<DbProject>): Promise<ApiResult<DbProject>> {
      const idx = this.projectsTable.findIndex(p => p.id === id);
      if(idx === -1) return {success: false};
      
      const oldData = this.projectsTable[idx];
      const updated = { ...oldData, ...updates, updatedAt: new Date() };
      this.projectsTable[idx] = updated;

      // Se houve mudança nos dados, salva versão
      if (updates.data) {
          this.saveProjectVersion(id, oldData.userId, 'Auto-save', updates.data);
      }

      return { success: true, data: updated };
  }

  async deleteProject(id: string): Promise<ApiResult<void>> {
      // Soft Delete para usuários, Hard Delete só Admin
      const p = this.projectsTable.find(x => x.id === id);
      if (p && p.userId === this.currentUser()?.id) {
          this.projectsTable = this.projectsTable.filter(x => x.id !== id);
          return { success: true };
      }
      return { success: false, error: 'Erro' };
  }

  // --- VERSIONAMENTO ---
  private saveProjectVersion(projectId: string, userId: string, label: string, data: any) {
      const versions = this.projectVersionsTable.filter(v => v.projectId === projectId);
      const nextNum = versions.length + 1;
      
      this.projectVersionsTable.push({
          id: crypto.randomUUID(),
          projectId,
          versionNumber: nextNum,
          label,
          dataSnapshot: JSON.parse(JSON.stringify(data)), // Deep copy
          createdAt: new Date(),
          createdByUserId: userId
      });
  }

  async getProjectVersions(projectId: string): Promise<ApiResult<ProjectVersion[]>> {
      const user = this.currentUser();
      const admin = this.currentAdmin();
      // Permite se for dono ou admin
      const proj = this.projectsTable.find(p => p.id === projectId);
      
      if (!proj) return { success: false, error: 'Not found' };
      if (proj.userId !== user?.id && !admin) return { success: false, error: 'Access denied' };

      const versions = this.projectVersionsTable.filter(v => v.projectId === projectId).sort((a,b) => b.versionNumber - a.versionNumber);
      return { success: true, data: versions };
  }

  async restoreVersion(projectId: string, versionId: string): Promise<ApiResult<void>> {
      const user = this.currentUser();
      const projIdx = this.projectsTable.findIndex(p => p.id === projectId);
      
      if(projIdx === -1) return { success: false };
      if(this.projectsTable[projIdx].userId !== user?.id) return { success: false, error: 'Acesso Negado' };

      const version = this.projectVersionsTable.find(v => v.id === versionId);
      if(!version) return { success: false, error: 'Versão não encontrada' };

      // Restaura dados
      this.projectsTable[projIdx].data = JSON.parse(JSON.stringify(version.dataSnapshot));
      this.projectsTable[projIdx].updatedAt = new Date();
      
      // Cria nova versão indicando restauração
      this.saveProjectVersion(projectId, user.id, `Restaurado da V${version.versionNumber}`, this.projectsTable[projIdx].data);

      return { success: true };
  }

  // =========================
  // SUPORTE (TICKETS)
  // =========================

  async createTicket(subject: string, message: string, category: any, priority: any): Promise<ApiResult<void>> {
      const user = this.currentUser();
      if (!user) return { success: false };

      const ticketId = crypto.randomUUID();
      this.ticketsTable.push({
          id: ticketId,
          userId: user.id,
          subject,
          category,
          priority,
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [{
              id: crypto.randomUUID(),
              ticketId,
              senderId: user.id,
              senderRole: 'user',
              message,
              timestamp: new Date()
          }]
      });
      return { success: true };
  }

  async getMyTickets(): Promise<ApiResult<SupportTicket[]>> {
      const user = this.currentUser();
      if (!user) return { success: false };
      return { success: true, data: this.ticketsTable.filter(t => t.userId === user.id) };
  }

  async addTicketMessage(ticketId: string, message: string): Promise<ApiResult<void>> {
      const user = this.currentUser();
      const admin = this.currentAdmin();
      
      const ticket = this.ticketsTable.find(t => t.id === ticketId);
      if (!ticket) return { success: false };

      // Verifica permissão
      const isOwner = user && ticket.userId === user.id;
      const isAdmin = !!admin;

      if (!isOwner && !isAdmin) return { success: false, error: 'Denied' };

      ticket.messages.push({
          id: crypto.randomUUID(),
          ticketId,
          senderId: isAdmin ? admin!.id : user!.id,
          senderRole: isAdmin ? (admin!.accessLevel === 'support' ? 'support' : 'admin') : 'user',
          message,
          timestamp: new Date()
      });
      
      ticket.updatedAt = new Date();
      if (isAdmin) ticket.status = 'answered';
      else ticket.status = 'open'; // Reabre se usuário respondeu

      return { success: true };
  }

  // =========================
  // ADMIN DASHBOARD & STATS
  // =========================

  async getAdminStats(token: string): Promise<ApiResult<AdminStats>> {
      if (!this.currentAdmin()) return { success: false, error: 'Admin only' };

      return {
          success: true,
          data: {
              totalUsers: this.usersTable.length,
              activeUsersLast24h: this.usersTable.filter(u => (new Date().getTime() - u.lastLogin.getTime()) < 86400000).length,
              totalProjects: this.projectsTable.length,
              publicProjects: this.projectsTable.filter(p => p.visibility === 'public').length,
              privateProjects: this.projectsTable.filter(p => p.visibility === 'private').length,
              openTickets: this.ticketsTable.filter(t => t.status === 'open').length,
              integrationQueueSize: Math.floor(Math.random() * 5) // Mock queue size
          }
      };
  }

  async getAllTickets(token: string): Promise<ApiResult<SupportTicket[]>> {
      if (!this.currentAdmin()) return { success: false };
      return { success: true, data: this.ticketsTable };
  }

  async closeTicket(token: string, ticketId: string): Promise<ApiResult<void>> {
      if (!this.currentAdmin()) return { success: false };
      const t = this.ticketsTable.find(x => x.id === ticketId);
      if(t) t.status = 'closed';
      return { success: true };
  }

  // =========================
  // SEGURANÇA & LOGS
  // =========================

  private logSecurity(ip: string, userId: string | null, action: string, severity: 'info'|'warning'|'critical', blocked = false) {
      this.securityLogsTable.push({
          id: crypto.randomUUID(),
          ipAddress: ip,
          userId: userId || undefined,
          action,
          severity,
          blocked,
          timestamp: new Date()
      });
  }

  async getSecurityLogs(token: string): Promise<ApiResult<SecurityLog[]>> {
      if (!this.currentAdmin()) return { success: false };
      return { success: true, data: this.securityLogsTable.slice(-50).reverse() }; // Last 50
  }

  // =========================
  // NOTIFICATION POLLING & UTILS
  // =========================
  
  async fetchMyNotifications(userId: string): Promise<DbNotification[]> {
      return this.notificationsTable.filter(n => n.targetUserId === null || n.targetUserId === userId)
          .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  _internal_getAdmins() { return this.adminsTable; }
  _internal_getAllProjects() { return this.projectsTable; }
  _internal_getAllUsers() { return this.usersTable; }
  _internal_pushLog(log: DbAdminLog) { this.adminLogsTable.push(log); }
  _internal_pushNotification(notif: DbNotification) { this.notificationsTable.push(notif); }
  _internal_updateUserStatus(id: string, status: 'active' | 'banned') {
      const u = this.usersTable.find(x => x.id === id);
      if(u) u.status = status;
  }
  _internal_deleteProject(id: string) {
      const p = this.projectsTable.find(x => x.id === id);
      if(p) { p.adminDeleted = true; p.publishStatus = 'error'; }
  }

  private delay() { return new Promise(r => setTimeout(r, 400)); }
}
