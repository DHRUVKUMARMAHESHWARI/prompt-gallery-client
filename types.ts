
export type Role = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  token?: string; // For auth
  aiCredits?: number;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  spaceId: string;
  authorId: string;
  createdAt: number | string;
  updatedAt: number | string;
  isFavorite: boolean; // Computed on frontend based on current user
  version: number;
  variables?: string[];
}

export interface Space {
  id: string;
  name: string;
  type: 'PRIVATE' | 'TEAM' | 'PUBLIC';
  description?: string;
  joinCode?: string;
  memberCount: number;
  promptCount: number;
  role: Role;
  icon: string;
  color: string;
  createdBy?: string;
}

export interface Stats {
  totalPrompts: number;
  favorites: number;
  teamPrompts: number;
  savedThisWeek: number;
}

export interface Notification {
  id: string;
  recipient: string;
  message: string;
  type: 'JOIN' | 'SYSTEM' | 'INFO';
  read: boolean;
  createdAt: string;
}
