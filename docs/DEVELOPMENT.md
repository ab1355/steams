# STEAMS Education Platform - Developer Documentation

## 🏗️ Architecture Overview

### Frontend Architecture
- Next.js 14 App Router
- React Server Components
- Client-side Components for interactivity
- TailwindCSS for styling
- Framer Motion for animations
- Chart.js for analytics visualization

### Backend Architecture
- Next.js API Routes
- Prisma ORM for database operations
- PostgreSQL database
- Socket.IO for real-time features
- Service Workers for offline support

### Authentication Flow
- NextAuth.js for authentication
- JWT tokens
- Role-based access control
- Session management

## 🧩 Component Structure

### Interactive Components

#### TimedQuiz
```typescript
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface TimedQuizProps {
  questions: Question[];
  timeLimit: number; // in seconds
  onComplete: (score: number, maxScore: number) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}
```

#### MatchingPairs
```typescript
interface Pair {
  id: string;
  term: string;
  definition: string;
  termImage?: string;
  definitionImage?: string;
}

interface MatchingPairsProps {
  pairs: Pair[];
  onComplete: (score: number) => void;
  timeLimit?: number;
  showImages?: boolean;
}
```

#### DrawingExercise
```typescript
interface DrawingExerciseProps {
  prompt: string;
  onSave: (imageData: string) => void;
}
```

### Analytics Components

#### AnalyticsChart
```typescript
interface DataPoint {
  date: string;
  value: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  label: string;
  type: 'line' | 'bar';
  color?: string;
}
```

#### DetailedAnalytics
```typescript
interface AnalyticsData {
  timeSpentData: { date: string; value: number }[];
  completionRateData: { date: string; value: number }[];
  subjectDistribution: { subject: string; count: number }[];
  learningStyles: { style: string; percentage: number }[];
  difficultyLevels: { level: string; count: number }[];
  interactionMetrics: {
    avgTimePerLesson: number;
    avgAttemptsPerExercise: number;
    completionRate: number;
    accuracyRate: number;
  };
  progressTrends: {
    daily: { date: string; progress: number }[];
    weekly: { date: string; progress: number }[];
    monthly: { date: string; progress: number }[];
  };
}
```

## 📱 Push Notifications

### Service Worker Registration
```typescript
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}
```

### Notification Templates
```typescript
interface NotificationTemplate {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

// Usage
const notification = generateNotification('achievement', {
  userName: 'John',
  achievementName: 'Quick Learner'
});
```

## 📊 Analytics Export

### PDF Export
```typescript
function exportToPDF(data: AnalyticsData, userName: string) {
  // Creates a PDF with:
  // - Key metrics
  // - Learning style distribution
  // - Subject distribution
  // - Progress trends
}
```

### CSV Export
```typescript
function exportToCSV(data: AnalyticsData, userName: string) {
  // Exports multiple sections:
  // - Key metrics
  // - Learning styles
  // - Subject distribution
  // - Time spent data
  // - Completion rates
  // - Monthly progress
}
```

## 🔐 Authentication

### Protected Routes
```typescript
// middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/lessons/:path*',
    '/messages/:path*',
  ],
};
```

### Role-Based Access
```typescript
// Example of role-based component
function AdminDashboard() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  if (session?.user?.role !== 'ADMIN') {
    return <AccessDenied />;
  }

  return <AdminPanel />;
}
```

## 🗄️ Database Schema

### Core Models
```prisma
model User {
  id              String    @id @default(cuid())
  name            String
  email           String    @unique
  role            Role      @default(STUDENT)
  progress        Progress[]
  messages        Message[]
  notifications   Notification[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Lesson {
  id          String    @id @default(cuid())
  title       String
  content     Json
  type        LessonType
  difficulty  Difficulty
  progress    Progress[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Progress {
  id          String    @id @default(cuid())
  userId      String
  lessonId    String
  completed   Boolean   @default(false)
  score       Int?
  timeSpent   Int       @default(0)
  user        User      @relation(fields: [userId], references: [id])
  lesson      Lesson    @relation(fields: [lessonId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## 🧪 Testing

### Unit Tests
```typescript
// Example test for TimedQuiz component
describe('TimedQuiz', () => {
  it('should display questions and track score', async () => {
    const handleComplete = jest.fn();
    const { getByText, getByRole } = render(
      <TimedQuiz
        questions={mockQuestions}
        timeLimit={300}
        onComplete={handleComplete}
      />
    );

    // Test interaction
    const option = getByText('Correct Answer');
    fireEvent.click(option);

    // Verify score calculation
    await waitFor(() => {
      expect(handleComplete).toHaveBeenCalledWith(100, 100);
    });
  });
});
```

### E2E Tests
```typescript
// Example Cypress test
describe('Learning Path', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  it('should complete a lesson', () => {
    cy.get('[data-testid="lesson-card"]').first().click();
    cy.get('[data-testid="start-lesson"]').click();
    cy.get('[data-testid="quiz-option"]').first().click();
    cy.get('[data-testid="submit-quiz"]').click();
    cy.get('[data-testid="completion-message"]')
      .should('contain', 'Lesson completed');
  });
});
```

## 🔄 State Management

### React Context
```typescript
// Example of NotificationContext
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('newNotification', (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });
    }
  }, [socket]);

  // ... provider implementation
}
```

## 📡 WebSocket Integration

### Socket Setup
```typescript
// hooks/useSocket.ts
export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      const socket = io({
        auth: {
          userId: session.user.id,
        },
      });
      setSocket(socket);
    }
  }, [session]);

  return socket;
}
```

## 🎨 Styling Guidelines

### TailwindCSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
      },
      animation: {
        'fade-in': '...',
        'slide-up': '...',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### Component Styling
```typescript
// Example of consistent styling
function ExerciseCard({ title, description, icon }) {
  return (
    <div className="
      p-6 
      bg-white 
      rounded-lg 
      shadow-sm 
      hover:shadow-md 
      transition-shadow 
      duration-200
    ">
      <div className="flex items-center space-x-4">
        {icon}
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}
```

## 📚 Best Practices

### Code Organization
- Use feature-based folder structure
- Keep components small and focused
- Implement proper error boundaries
- Use TypeScript for type safety
- Follow React hooks best practices

### Performance Optimization
- Implement proper code splitting
- Use React.memo for expensive renders
- Optimize images and assets
- Implement proper caching strategies
- Use proper loading states

### Accessibility
- Follow WCAG 2.1 guidelines
- Implement proper ARIA labels
- Ensure keyboard navigation
- Provide proper color contrast
- Support screen readers

### Security
- Implement proper CSP
- Sanitize user input
- Use proper authentication
- Implement rate limiting
- Follow OWASP guidelines

## 🚀 Deployment

### Environment Variables
```env
# Required
DATABASE_URL=
NEXTAUTH_SECRET=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Optional
NEXT_PUBLIC_SOCKET_URL=
NEXT_PUBLIC_API_URL=
```

### Build Process
```bash
# Production build
npm run build

# Start production server
npm start

# Run with PM2
pm2 start npm --name "steams-education" -- start
```

### Monitoring
- Implement proper logging
- Set up error tracking
- Monitor performance metrics
- Track user analytics
- Monitor server health

## 🤝 Contributing Guidelines

### Pull Request Process
1. Create feature branch
2. Update documentation
3. Add/update tests
4. Create pull request
5. Code review
6. Merge to main

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Follow component naming conventions
- Write proper JSDoc comments
- Follow Git commit conventions
