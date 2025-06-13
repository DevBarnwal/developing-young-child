import { apiService } from './api';
import { User, ApiResponse } from '../types/models';

// User service for admin operations
export const userService = {
  // Get all users (admin only)
  getAllUsers: (role?: string) => {
    const query = role ? `?role=${role}` : '';
    return apiService.get<User[]>(`/users${query}`);
  },
  
  // Get user by ID
  getUserById: (id: string) => {
    return apiService.get<User>(`/users/${id}`);
  },
  
  // Update user
  updateUser: (id: string, data: Partial<User>) => {
    return apiService.put<User>(`/users/${id}`, data);
  },
  
  // Delete user (admin only)
  deleteUser: (id: string) => {
    return apiService.delete<null>(`/users/${id}`);
  },
  
  // Update user role (admin only)
  updateUserRole: (userId: string, role: 'user' | 'admin' | 'parent' | 'volunteer') => {
    return apiService.put<User>(`/auth/role/${userId}`, { role });
  }
};
