# STEAMS Education Platform - Testing Documentation

## 🧪 Testing Strategy

### Test Types
1. **Unit Tests**
   - Individual component testing
   - Function/utility testing
   - Hook testing
   - State management testing

2. **Integration Tests**
   - API integration testing
   - Component integration testing
   - Database integration testing

3. **End-to-End Tests**
   - User flow testing
   - Cross-browser testing
   - Mobile responsiveness testing

4. **Accessibility Tests**
   - WCAG 2.1 compliance testing
   - Screen reader compatibility
   - Keyboard navigation testing

## 🛠️ Testing Tools

### Jest & React Testing Library
```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { TimedQuiz } from '@/components/learning/interactive/TimedQuiz';

describe('TimedQuiz', () => {
  const mockQuestions = [
    {
      id: '1',
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      explanation: 'Basic addition',
      points: 10,
    },
  ];

  it('displays questions and tracks score', () => {
    const handleComplete = jest.fn();
    render(
      <TimedQuiz
        questions={mockQuestions}
        timeLimit={300}
        onComplete={handleComplete}
      />
    );

    // Check if question is displayed
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();

    // Select answer
    fireEvent.click(screen.getByText('4'));

    // Submit answer
    fireEvent.click(screen.getByText('Submit'));

    // Verify callback
    expect(handleComplete).toHaveBeenCalledWith(10, 10);
  });

  it('handles timer expiration', () => {
    jest.useFakeTimers();
    const handleComplete = jest.fn();

    render(
      <TimedQuiz
        questions={mockQuestions}
        timeLimit={300}
        onComplete={handleComplete}
      />
    );

    // Fast-forward timer
    jest.advanceTimersByTime(300000);

    // Verify timeout handling
    expect(handleComplete).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
```

### Cypress E2E Testing
```typescript
// cypress/e2e/learning-path.cy.ts
describe('Learning Path', () => {
  beforeEach(() => {
    cy.login(); // Custom command for authentication
    cy.visit('/dashboard');
  });

  it('completes a lesson successfully', () => {
    // Start lesson
    cy.get('[data-testid="lesson-card"]').first().click();
    cy.get('[data-testid="start-lesson"]').click();

    // Complete quiz
    cy.get('[data-testid="quiz-option"]').first().click();
    cy.get('[data-testid="submit-quiz"]').click();

    // Verify completion
    cy.get('[data-testid="completion-message"]')
      .should('contain', 'Lesson completed');
    
    // Check progress update
    cy.get('[data-testid="progress-bar"]')
      .should('have.attr', 'aria-valuenow', '100');
  });

  it('handles exercise interactions', () => {
    // Navigate to exercise
    cy.get('[data-testid="exercise-section"]').click();
    cy.get('[data-testid="matching-pairs"]').click();

    // Complete matching pairs exercise
    cy.get('[data-testid="term-0"]').click();
    cy.get('[data-testid="definition-0"]').click();

    // Verify match
    cy.get('[data-testid="pair-0"]')
      .should('have.class', 'matched');
  });
});
```

### API Testing with Supertest
```typescript
// __tests__/api/lessons.test.ts
import { createMocks } from 'node-mocks-http';
import lessonsHandler from '@/pages/api/lessons';

describe('Lessons API', () => {
  it('returns lessons list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer mock_token',
      },
    });

    await lessonsHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data.lessons)).toBe(true);
  });

  it('handles lesson creation', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer mock_token',
        'content-type': 'application/json',
      },
      body: {
        title: 'New Lesson',
        content: { /* lesson content */ },
      },
    });

    await lessonsHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.lesson.title).toBe('New Lesson');
  });
});
```

### Accessibility Testing
```typescript
// __tests__/accessibility/navigation.test.ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navigation from '@/components/Navigation';

expect.extend(toHaveNoViolations);

describe('Navigation Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Navigation />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', () => {
    render(<Navigation />);
    const navItems = screen.getAllByRole('link');
    
    // Test keyboard focus
    navItems[0].focus();
    expect(document.activeElement).toBe(navItems[0]);
    
    // Test keyboard navigation
    userEvent.tab();
    expect(document.activeElement).toBe(navItems[1]);
  });
});
```

## 📊 Test Coverage

### Coverage Goals
- Unit Tests: 80% coverage
- Integration Tests: 70% coverage
- E2E Tests: Key user flows covered

### Running Coverage Reports
```bash
# Unit test coverage
npm run test:coverage

# E2E test coverage
npm run cypress:coverage
```

## 🔄 Continuous Integration

### GitHub Actions Workflow
```yaml
name: Test Suite

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run unit tests
      run: npm run test:ci
      
    - name: Run E2E tests
      run: npm run cypress:ci
      
    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

## 🎯 Test Cases

### Authentication
- Sign in with valid credentials
- Sign in with invalid credentials
- Password reset flow
- Session management
- Token refresh

### Learning Path
- Course navigation
- Lesson completion
- Progress tracking
- Quiz submission
- Exercise completion

### Interactive Features
- Drag and drop functionality
- Timer operations
- Real-time updates
- WebSocket connections
- Push notifications

### Analytics
- Data visualization
- Export functionality
- Report generation
- Data filtering
- Chart interactions

## 🐛 Debug Tools

### Browser Extensions
- React Developer Tools
- Redux DevTools
- Accessibility Insights

### Logging
```typescript
// Example debug logging
const debug = require('debug')('app:component:quiz');

function TimedQuiz() {
  debug('Rendering quiz component');
  
  const handleAnswer = (answer: string) => {
    debug('Selected answer:', answer);
    // Handle answer
  };
}
```

### Performance Testing
```typescript
// Example performance test
describe('Performance', () => {
  it('renders large lists efficiently', async () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      title: `Item ${i}`,
    }));

    const startTime = performance.now();
    render(<ItemList items={items} />);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // 100ms threshold
  });
});
```

## 📝 Test Documentation

### Test File Structure
```
__tests__/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── api/
│   └── features/
└── e2e/
    ├── flows/
    └── pages/
```

### Component Test Template
```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });

  // Rendering
  it('renders correctly', () => {
    // Test initial render
  });

  // Interaction
  it('handles user interaction', () => {
    // Test user actions
  });

  // Props
  it('responds to prop changes', () => {
    // Test prop updates
  });

  // Edge Cases
  it('handles edge cases', () => {
    // Test boundary conditions
  });

  // Cleanup
  afterEach(() => {
    // Common cleanup
  });
});
```

## 🔍 Code Review Checklist

### Testing Requirements
- [ ] Unit tests for new components
- [ ] Integration tests for features
- [ ] E2E tests for user flows
- [ ] Accessibility tests
- [ ] Performance tests
- [ ] Test coverage maintained

### Quality Checks
- [ ] No test warnings
- [ ] Meaningful test descriptions
- [ ] Proper test isolation
- [ ] Mock data consistency
- [ ] Error case coverage
- [ ] Browser compatibility
