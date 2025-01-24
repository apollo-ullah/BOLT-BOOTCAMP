// App-wide constants
export const APP_NAME = 'ConsultMatch';
export const APP_DESCRIPTION = 'Connecting consultants with projects';

// Role definitions
export const ROLES = {
  CONSULTANT: 'consultant',
  PM: 'pm',
  PARTNER: 'partner',
  ADMIN: 'admin',
} as const;

export type UserRole = keyof typeof ROLES;

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PROJECTS: '/projects',
  CONSULTANT_PORTAL: '/consultant',
  PM_PORTAL: '/pm',
  PARTNER_PORTAL: '/partner',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  PROJECTS: '/api/projects',
  CONSULTANTS: '/api/consultants',
  PARTNERS: '/api/partners',
} as const;

// Firebase collection names
export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  PROPOSALS: 'proposals',
} as const;

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PROJECT_TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

// UI constants
export const UI = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  ANIMATION_DURATION: 300,
} as const; 