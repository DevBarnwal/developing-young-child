
// Child model
export interface Child {
  id: any;
  _id: string;
  name: string;
  dob: Date | string;
  gender: 'Male' | 'Female' | 'Other';
  parentId: string | User;
  volunteerId?: string | User;
  specialNeeds?: string;
  developmentalNotes?: string;
  lastVisitDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// User model with different roles
export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'parent' | 'volunteer';
  isEmailVerified: boolean;
  avatar?: string;
  method?: 'local' | 'google' | 'facebook';
  parentProfile?: ParentProfile;
  volunteerProfile?: VolunteerProfile;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ParentProfile {
  phone?: string;
  address?: string;
  children?: string[] | Child[];
}

export interface VolunteerProfile {
  phone?: string;
  experience?: string;
  availability?: string;
  specialties?: string[];
  trainingCompleted?: boolean;
  status?: 'Active' | 'Inactive' | 'Training' | 'Suspended';
  supervisor?: string | User;
  assignedChildren?: string[] | Child[];
}

// Milestone model
export interface Milestone {
  _id: string;
  childId: string | Child;
  domain: 'Motor' | 'Cognitive' | 'Language' | 'Social' | 'Emotional' | 'Other';
  title: string;
  description: string;
  ageInMonths: number;
  isAchieved: boolean;
  achievedDate?: Date | string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Visit model
export interface Visit {
  _id: string;
  volunteerId: string | User;
  childId: string | Child;
  visitDate: Date | string;
  duration: number; // in minutes
  location: 'Home' | 'Center' | 'School' | 'Other';
  locationDetails?: string;
  activitiesConducted?: VisitActivity[];
  milestonesAssessed?: MilestoneAssessment[];
  notes?: string;
  recommendations?: string;
  nextVisitDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface VisitActivity {
  title: string;
  description?: string;
  domain?: 'Motor' | 'Cognitive' | 'Language' | 'Social' | 'Emotional' | 'Other';
  duration?: number;
  resources?: string[];
}

export interface MilestoneAssessment {
  milestoneId: string | Milestone;
  status: 'Achieved' | 'In Progress' | 'Not Started';
  notes?: string;
}

// Activity model (for suggested activities)
export interface Activity {
  _id: string;
  title: string;
  description: string;
  domain: 'Motor' | 'Cognitive' | 'Language' | 'Social' | 'Emotional' | 'Other';
  ageRange: {
    min: number; // in months
    max: number; // in months
  };
  instructions: string;
  materials?: string[];
  benefits?: string[];
  duration?: number; // in minutes
  difficultyLevel?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
  language?: string;
  isApproved: boolean;
  isDeleted: boolean;
  createdBy: string | User;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  token?: string;
  redirectUrl?: string;
}
