import { apiService } from './api';
import { Milestone, ApiResponse } from '../types/models';

export const milestoneService = {
  // Create milestone
  createMilestone: (milestoneData: Partial<Milestone>) => {
    return apiService.post<Milestone>('/milestones', milestoneData);
  },
  
  // Get milestone by ID
  getMilestoneById: (id: string) => {
    return apiService.get<Milestone>(`/milestones/${id}`);
  },
  
  // Get all milestones for a child
  getMilestonesByChild: (childId: string) => {
    return apiService.get<Milestone[]>(`/milestones/child/${childId}`);
  },
  
  // Update milestone
  updateMilestone: (id: string, milestoneData: Partial<Milestone>) => {
    return apiService.put<Milestone>(`/milestones/${id}`, milestoneData);
  }
};
