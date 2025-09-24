import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Conflict {
  id: string;
  title: string;
  description?: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  date: string;
  fatalities?: number;
  eventType: string;
  source: string;
  createdAt: string;
}

export interface ConflictStats {
  totalConflicts: number;
  totalFatalities: number;
  recentConflicts: number;
  conflictsByRegion: Array<{
    region: string;
    count: number;
  }>;
  conflictsByEventType: Array<{
    eventType: string;
    count: number;
  }>;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }),

  register: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/register', { email, password }),
};

// Conflicts API
export const conflictsApi = {
  getConflicts: (params?: any) =>
    api.get<{conflicts: Conflict[], pagination: any}>('/api/conflicts', { params }),

  getConflict: (id: string) =>
    api.get<Conflict>(`/api/conflicts/${id}`),

  getStats: () =>
    api.get<ConflictStats>('/api/conflicts/stats'),

  exportData: (format = 'json') =>
    api.get(`/api/conflicts/export`, { params: { format } }),
};

// Regions API
export const regionsApi = {
  getRegions: () =>
    api.get<{regions: any[], countries: any[]}>('/api/regions'),

  getRegionConflicts: (region: string) =>
    api.get(`/api/regions/${region}/conflicts`),
};