import { apiService } from './api';
import { ApiResponse } from '../types/models';

// Report service for analytics and reporting
export const reportService = {
  // Get child development report
  getChildReport: (childId: string) => {
    return apiService.get(`/reports/child/${childId}`);
  },
  
  // Get admin summary report
  getSummaryReport: () => {
    return apiService.get('/reports/summary');
  },
  
  // Get volunteer performance report
  getVolunteerReport: (volunteerId: string) => {
    return apiService.get(`/reports/volunteer/${volunteerId}`);
  }
};
