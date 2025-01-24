export const ROLE_CAPABILITIES = {
  consultant: ['view_projects', 'submit_proposals'],
  pm: ['manage_projects', 'review_proposals', 'assign_consultants'],
  partner: ['create_projects', 'manage_budgets', 'view_analytics'],
  admin: ['manage_users', 'system_config', ...Object.values(ROLE_CAPABILITIES).flat()]
} as const; 