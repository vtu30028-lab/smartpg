import api from './api';
import type { User } from '../types';

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const register = (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}) => api.post<AuthResponse>('/register', data);

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/login', { email, password });

export const getProfile = () => api.get<User>('/profile');

export const searchUsers = (query: string, role?: string) =>
  api.get<User[]>('/users/search', { params: { q: query, role } });

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

export const setAuth = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

export const isAuthenticated = () => !!localStorage.getItem('token');
