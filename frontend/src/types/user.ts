export type AuthProvider = 'credentials' | 'google';

export interface User {
  _id: string;
  name: string;
  email: string;
  provider: AuthProvider;
  avatarUrl?: string;
  school?: string;
  schoolLocation?: string;
  preferences: {
    darkMode: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
