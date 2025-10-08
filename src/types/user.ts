// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'client' | 'artist' | 'admin';
  phone?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Export the User interface for use in components
export type { User };
