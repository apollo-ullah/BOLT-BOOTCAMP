export type UserRole = 'consultant' | 'pm' | 'partner';

export interface IConsultant {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: number;
  availability: {
    startDate: Date;
    endDate: Date;
  };
  resume: string;
}

export interface IProject {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  duration: number;
  status: 'open' | 'in-progress' | 'completed';
}

export interface IMatch {
  consultantId: string;
  projectId: string;
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected';
} 