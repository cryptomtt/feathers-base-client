export interface User {
  id: string;
  email: string;
  createdAt: string;
  // Add other user properties as needed
}

export interface LoginData {
  strategy: string;
  email: string;
  password: string;
} 