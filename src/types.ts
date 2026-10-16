export interface ToolItem {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  iconKey?: string;
  category: string;
  isPinned?: boolean;
  order?: number;
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = 'public' | 'admin';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}
