
// ==========================================
// 1. ESTRUTURA DO BANCO DE DADOS (MODELOS)
// ==========================================

export type ProjectVisibility = 'public' | 'private';
export type PublishStatus = 'draft' | 'pending' | 'published' | 'error';
export type UserStatus = 'active' | 'banned' | 'suspended';

// Tabela: users
export interface DbUser {
  id: string; // UUID
  name: string;
  email: string;
  passwordHash?: string; // Nunca retornado para o front, mas existe no banco
  executorProfileId?: string; // Link com a conta externa do Executor Player
  status?: UserStatus; // NOVO: Controle de acesso
  createdAt: Date;
  lastLogin: Date;
  token?: string; // JWT simulado para sessão
}

// Tabela: projects
export interface DbProject {
  id: string; // UUID
  userId: string; // Foreign Key -> users.id
  name: string;
  description: string;
  visibility: ProjectVisibility;
  thumbnailUrl?: string;
  data: any; // O JSON completo do projeto (Cenas, Assets, Configs)
  createdAt: Date;
  updatedAt: Date;
  
  // Metadados de Publicação
  publishStatus: PublishStatus;
  externalId?: string; // ID no Executor Player após publicar
  lastPublishedAt?: Date;
  
  // NOVO: Controle Admin
  adminFlagged?: boolean; // Se true, foi marcado por infração
  adminDeleted?: boolean; // Soft delete pelo admin
}

// Tabela: executor_posts (Log de publicações)
export interface DbExecutorPost {
  id: string;
  projectId: string;
  sentData: any;
  responseLog: string;
  status: 'success' | 'fail';
  attemptedAt: Date;
}

// ==========================================
// 2. INTERFACES DE API (REQUEST/RESPONSE)
// ==========================================

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PublishRequest {
  projectId: string;
  targetEnvironment: 'production' | 'staging';
}
