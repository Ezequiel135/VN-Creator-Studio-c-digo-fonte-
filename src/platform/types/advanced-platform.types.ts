
import { DbUser, DbProject } from './database.types';

// --- CONTROLE DE PROJETO ---
export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  label: string; // Ex: "Antes da mudança X" ou "Auto-save"
  dataSnapshot: any; // Cópia completa do JSON do projeto
  createdAt: Date;
  createdByUserId: string;
}

// --- SISTEMA DE SUPORTE ---
export type TicketStatus = 'open' | 'answered' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string; // User ID ou Admin ID
  senderRole: 'user' | 'support' | 'admin';
  message: string;
  timestamp: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: 'bug' | 'account' | 'content' | 'other';
  createdAt: Date;
  updatedAt: Date;
  messages: TicketMessage[];
}

// --- ESTATÍSTICAS E LOGS ---
export interface AdminStats {
  totalUsers: number;
  activeUsersLast24h: number;
  totalProjects: number;
  publicProjects: number;
  privateProjects: number;
  openTickets: number;
  integrationQueueSize: number;
}

export interface SecurityLog {
  id: string;
  ipAddress: string;
  userId?: string;
  action: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  blocked: boolean;
}

export interface IntegrationLog {
  id: string;
  platform: 'executor-player';
  action: 'publish' | 'sync' | 'update';
  status: 'success' | 'failed';
  projectId: string;
  timestamp: Date;
  responseCode?: number;
}
