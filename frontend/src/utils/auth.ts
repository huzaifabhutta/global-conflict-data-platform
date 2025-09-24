import Cookies from 'js-cookie';
import { User } from './api';

export const setAuthToken = (token: string): void => {
  Cookies.set('auth-token', token, { expires: 1 }); // 1 day
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get('auth-token');
};

export const removeAuthToken = (): void => {
  Cookies.remove('auth-token');
};

export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

export const logout = (): void => {
  removeAuthToken();
  removeUser();
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};