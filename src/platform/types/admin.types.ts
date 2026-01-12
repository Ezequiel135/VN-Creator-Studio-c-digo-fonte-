
// Tipos para o Sistema Administrativo e Notificações

export type AdminAccessLevel = 'moderator' | 'super_admin' | 'support'; // Adicionado support
export type NotificationType = 'info' | 'warning' | 'system' | 'ban';
export type NotificationStatus = 'pending' | 'sent' | 'read';

export interface DbAdmin {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  accessLevel: AdminAccessLevel;
  apiToken: string; // Token fixo ou gerado para autenticação externa
  lastLogin: Date;
}

export interface DbNotification {
  id: string;
  targetUserId: string | null; // null = Global (todos recebem)
  title: string;
  message: string;
  type: NotificationType;
  createdAt: Date;
  readAt?: Date; // Se preenchido, o usuário leu
}

export interface DbAdminLog {
  id: string;
  adminId: string;
  action: string; // "BAN_USER", "DELETE_PROJECT", "SEND_NOTIF"
  targetId?: string; // ID do usuário ou projeto afetado
  details: string;
  timestamp: Date;
}

// Payloads de API
export interface AdminLoginRequest {
  email: string;
  apiToken: string;
}

export interface SendNotificationRequest {
  title: string;
  message: string;
  targetUserId?: string | null; // Opcional (null = global)
  type?: NotificationType;
}
