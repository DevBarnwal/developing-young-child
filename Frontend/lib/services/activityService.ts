import { apiService } from './api';
import { Activity, ApiResponse } from '../types/models';

export const activityService = {
  // Create activity (admin only)
  createActivity: (activityData: Partial<Activity>) => {
    return apiService.post<Activity>('/activities', activityData);
  },
  
  // Get all activities (with filters)
  getActivities: (filters?: {
    domain?: string;
    language?: string;
    tags?: string[];
    difficultyLevel?: string;
  }) => {
    let query = '';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.domain) params.append('domain', filters.domain);
      if (filters.language) params.append('language', filters.language);
      if (filters.tags && filters.tags.length) params.append('tags', filters.tags.join(','));
      if (filters.difficultyLevel) params.append('difficultyLevel', filters.difficultyLevel);
      
      query = `?${params.toString()}`;
    }
    
    return apiService.get<Activity[]>(`/activities${query}`);
  },
  
  // Get activities by age group
  getActivitiesByAge: (ageInMonths: number, domain?: string, language?: string) => {
    let query = '';
    if (domain || language) {
      const params = new URLSearchParams();
      if (domain) params.append('domain', domain);
      if (language) params.append('language', language);
      query = `?${params.toString()}`;
    }
    
    return apiService.get<Activity[]>(`/activities/age/${ageInMonths}${query}`);
  },
  
  // Get activity by ID
  getActivityById: (id: string) => {
    return apiService.get<Activity>(`/activities/${id}`);
  },
  
  // Update activity (admin only)
  updateActivity: (id: string, activityData: Partial<Activity>) => {
    return apiService.put<Activity>(`/activities/${id}`, activityData);
  }
};
