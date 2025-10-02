// Types pour la gestion des menus PDF des établissements

export interface EstablishmentMenu {
  id: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  order: number;
  isActive: boolean;
  establishmentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMenuRequest {
  name: string;
  description?: string;
  file: File;
}

export interface UpdateMenuRequest {
  id: string;
  name?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface MenuUploadResponse {
  success: boolean;
  menu?: EstablishmentMenu;
  error?: string;
}

export interface MenuListResponse {
  success: boolean;
  menus: EstablishmentMenu[];
  error?: string;
}

export interface MenuDeleteResponse {
  success: boolean;
  error?: string;
}

// Constantes pour la validation
export const MENU_CONSTRAINTS = {
  MAX_FILES: 2,
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
  ALLOWED_MIME_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf']
} as const;

// Types pour l'affichage public
export interface PublicMenuDisplay {
  id: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  order: number;
}
