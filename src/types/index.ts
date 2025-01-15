export interface User {
  id: string;
  type: 'child' | 'parent' | 'educator';
  name: string;
  email: string;
  profile: UserProfile;
}

export interface UserProfile {
  age?: number;
  specialNeeds?: string[];
  interests?: string[];
  learningStyle?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subjects: ('science' | 'technology' | 'engineering' | 'arts' | 'sports')[];
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'video' | 'interactive' | 'exercise';
  content: any;
}

export interface Progress {
  userId: string;
  lessonId: string;
  completed: boolean;
  score?: number;
  timeSpent: number;
  timestamp: Date;
}

export interface Communication {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  read: boolean;
}
