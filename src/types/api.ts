// API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  totalEarned: number;
  coins?: number;
  dailyEarnings?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserResponse {
  user: User;
}

export interface RewardTransaction {
  id: string;
  amount: number;
  description: string;
  timestamp: string;
  type: 'earn' | 'spend';
}

export interface RewardResponse {
  amount: number;
  newBalance: number;
}

export interface CooldownResponse {
  message: string;
  cooldownRemaining: number;
}

export interface HistoryResponse {
  transactions: RewardTransaction[];
}

export interface EarnTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
}