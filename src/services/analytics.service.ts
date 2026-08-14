import api from './api';

export interface DashboardData {
  period_days: number;
  documents: {
    total: number;
    ready: number;
  };
  learning_time_seconds: number;
  storage: {
    used_bytes: number;
    max_bytes: number;
    percentage: number;
  };
  quiz: {
    average_score: number;
    total_attempts: number;
  };
}

export const analyticsService = {
  async getDashboard(days?: number): Promise<DashboardData> {
    const params = days ? { days } : {};
    const response = await api.get<DashboardData>('/analytics/dashboard/', { params });
    return response.data;
  }
};
