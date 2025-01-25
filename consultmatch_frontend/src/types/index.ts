export type UserRole = 'consultant' | 'pm' | 'partner';

export interface IConsultant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  gender?: string;
  seniority_level: string;
  skill1: string;
  skill2: string;
  skill3: string;
  years_of_experience: number;
  current_availability: string;
  location_flexibility: string;
  past_project_industry: string;
  hobbies?: string;
  certifications?: string;
  ethnic?: string;
  preferred_industries?: string;
}

export interface IProject {
  id: number;
  project_name: string;
  preferred_industry: string;
  start_date: string;
  end_date: string;
  location_city: string;
  location_country: string;
  difficulty: string;
  description: string;
  required_skill1: string;
  required_skill2: string;
  required_skill3: string;
}

export interface IMatch {
  consultantId: string;
  projectId: string;
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface RecommendedMatch {
  consultant: IConsultant;
  match_score: number;
  match_reasons: string[];
}

// Type aliases for backward compatibility
export type Project = IProject;
export type Consultant = IConsultant; 