import { apiService } from './api';
import { Visit, ApiResponse } from '../types/models';

export const visitService = {
  // Create visit record
  createVisit: (visitData: Partial<Visit>) => {
    return apiService.post<Visit>('/visits', visitData);
  },
  
  // Get visit by ID
  getVisitById: (id: string) => {
    return apiService.get<Visit>(`/visits/${id}`);
  },
  
  // Get all visits for a child
  getVisitsByChild: (childId: string, startDate?: string, endDate?: string) => {
    let query = '';
    if (startDate) query += `?startDate=${startDate}`;
    if (endDate) query += `${query ? '&' : '?'}endDate=${endDate}`;
    
    return apiService.get<Visit[]>(`/visits/child/${childId}${query}`);
  },
  
  // Get all visits by a volunteer
  getVisitsByVolunteer: (volunteerId: string, startDate?: string, endDate?: string) => {
    let query = '';
    if (startDate) query += `?startDate=${startDate}`;
    if (endDate) query += `${query ? '&' : '?'}endDate=${endDate}`;
    
    return apiService.get<Visit[]>(`/visits/volunteer/${volunteerId}${query}`);
  },
  
  // Update visit
  updateVisit: (id: string, visitData: Partial<Visit>) => {
    return apiService.put<Visit>(`/visits/${id}`, visitData);
  }
};
