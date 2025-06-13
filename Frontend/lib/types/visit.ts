export type ActivityDomain = 'Cognitive' | 'Motor' | 'Language' | 'Social' | 'Emotional' | 'Other';

export interface VisitActivity {
  title: string;
  description: string;
  domain: ActivityDomain;
  duration: number;
}

export interface Visit {
  _id: string; 
  childId: string;
  volunteerId: string;
  visitDate: string;
  duration: number;
  location: 'Home' | 'Center' | 'School' | 'Other';
  locationDetails?: string;
  activitiesConducted: VisitActivity[];
  notes?: string;
  recommendations?: string;
  nextVisitDate?: string;
  milestonesAssessed?: any[]; // TODO: Define milestone assessment type
  createdAt: string;
  updatedAt: string;
}
