export const APP_CONFIG = {
  name: 'STEAMS Education',
  version: '1.0.0',
  description: 'A comprehensive educational platform for special needs children',
};

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
  },
  users: {
    profile: '/api/users/profile',
    update: '/api/users/update',
  },
  learning: {
    paths: '/api/learning/paths',
    lessons: '/api/learning/lessons',
    progress: '/api/learning/progress',
  },
  communication: {
    messages: '/api/communication/messages',
    notifications: '/api/communication/notifications',
  },
};

export const SUBJECTS = [
  'science',
  'technology',
  'engineering',
  'arts',
  'sports',
] as const;

export const USER_TYPES = {
  CHILD: 'child',
  PARENT: 'parent',
  EDUCATOR: 'educator',
} as const;

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;
