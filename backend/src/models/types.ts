// Type definitions for the application

export interface ConflictData {
  id: string;
  title: string;
  description?: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  date: Date;
  fatalities?: number;
  eventType: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ConflictResponse {
  conflicts: ConflictData[];
  pagination: PaginationInfo;
}