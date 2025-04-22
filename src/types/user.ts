export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  role?: 'user' | 'admin';  // Add this line
  // ... other fields
}