export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned'
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  dob: string;
  photoURL?: string;
  role: 'user' | 'admin';
  status: UserStatus;
  createdAt: string; // ISO String
}

export interface ApiKey {
  id: string;
  key: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  usageLimit: number;
  currentUsage: number;
  scope: 'READ_ONLY' | 'FULL_ACCESS';
  status: 'active' | 'revoked';
}

export interface CustomEndpoint {
  id: string;
  name: string;
  description: string;
  targetUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  category: string;
  requiresAuth: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
}