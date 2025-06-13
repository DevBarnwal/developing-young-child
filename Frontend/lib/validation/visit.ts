import { ActivityDomain } from '@/lib/types/visit'

interface VisitActivityFormData {
  title: string;
  description: string;
  domain: ActivityDomain;
  duration: number;
}

export interface VisitFormData {
  childId: string;
  visitDate: string;
  duration: number;
  location: 'Home' | 'Center' | 'School' | 'Other';
  locationDetails: string;
  notes: string;
  recommendations: string;
  nextVisitDate: string;
  activities: VisitActivityFormData[];
}

export const validateVisitForm = (data: VisitFormData) => {
  const errors: Record<string, string | Array<Record<string, string>>> = {};

  // Required fields
  if (!data.childId) {
    errors.childId = 'Please select a child';
  }

  if (!data.visitDate) {
    errors.visitDate = 'Visit date is required';
  } else {
    const visitDate = new Date(data.visitDate);
    if (visitDate > new Date()) {
      errors.visitDate = 'Visit date cannot be in the future';
    }
  }

  if (!data.duration) {
    errors.duration = 'Duration is required';
  } else if (data.duration < 1) {
    errors.duration = 'Duration must be greater than 0';
  }

  if (!data.location) {
    errors.location = 'Location is required';
  }

  if (data.location === 'Other' && !data.locationDetails) {
    errors.locationDetails = 'Please specify the location';
  }

  // Validate next visit date if provided
  if (data.nextVisitDate) {
    const visitDate = new Date(data.visitDate);
    const nextVisitDate = new Date(data.nextVisitDate);
    if (nextVisitDate <= visitDate) {
      errors.nextVisitDate = 'Next visit date must be after this visit date';
    }
  }

  // Validate activities
  const activityErrors: Array<Record<string, string>> = [];
  let hasActivityError = false;

  data.activities.forEach((activity, index) => {
    const activityError: Record<string, string> = {};

    if (!activity.title.trim()) {
      activityError.title = 'Activity title is required';
      hasActivityError = true;
    }
    if (!activity.duration || activity.duration < 1) {
      activityError.duration = 'Activity duration must be greater than 0';
      hasActivityError = true;
    }
    if (activity.duration > data.duration) {
      activityError.duration = 'Activity duration cannot exceed visit duration';
      hasActivityError = true;
    }

    activityErrors[index] = activityError;
  });

  if (hasActivityError) {
    errors.activities = activityErrors;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
