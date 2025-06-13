import { apiService } from './api';
import { Child, ApiResponse } from '../types/models';

export const childService = {
  // Create child
  createChild: (childData: Partial<Child>) => {
    return apiService.post<Child>('/children', childData);
  },
  
  // Get all children (filtered by user role)
  getChildren: () => {
    return apiService.get<Child[]>('/children');
  },
  
  // Get child by ID
  getChildById: (id: string) => {
    return apiService.get<Child>(`/children/${id}`);
  },
  
  // Update child
  updateChild: (id: string, childData: Partial<Child>) => {
    return apiService.put<Child>(`/children/${id}`, childData);
  },
  
  // Delete child (admin only)
  deleteChild: (id: string) => {
    return apiService.delete<null>(`/children/${id}`);
  }
};
