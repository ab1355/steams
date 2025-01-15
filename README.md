# STEAMS Education Platform

A modern, interactive learning platform focused on Science, Technology, Engineering, Arts, Mathematics, and Sustainability education.

## 🌟 Features

### Interactive Learning
- **Diverse Exercise Types**
  - Drag and Drop Exercises
  - Memory Games
  - Timed Quizzes
  - Matching Pairs
  - Drawing Exercises
  - Sorting Exercises

### Real-time Engagement
- **Messaging System**
  - Real-time message updates
  - Unread message counts
  - Push notifications
  - Group discussions

### Progress Tracking
- **Analytics Dashboard**
  - Learning progress visualization
  - Time spent analysis
  - Subject distribution
  - Performance metrics
  - Export functionality (PDF/CSV)

### Accessibility
- **Universal Design**
  - Screen reader optimization
  - Keyboard navigation
  - High contrast modes
  - Font size controls
  - Audio feedback
  - Touch-friendly interface

### Mobile Support
- **Push Notifications**
  - Custom notification templates
  - Rich notifications with actions
  - Offline support
  - Multi-device synchronization

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/steams-education.git
cd steams-education
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration.

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## 🛠️ Technologies

- **Frontend**
  - Next.js 14
  - React
  - TailwindCSS
  - Framer Motion
  - Chart.js

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL
  - Socket.IO

- **Authentication**
  - NextAuth.js
  - JWT

- **Testing**
  - Jest
  - React Testing Library
  - Cypress

## 📱 Mobile Features

### Push Notifications
- Course progress updates
- New message alerts
- Achievement notifications
- Learning reminders
- Deadline alerts
- Quiz results
- Weekly digests

### Offline Support
- Service Worker implementation
- Background sync
- Cached content
- Offline exercises

## 🎨 Interactive Exercise Types

### Timed Quiz
```typescript
<TimedQuiz
  questions={questions}
  timeLimit={300}
  onComplete={(score, maxScore) => handleCompletion(score, maxScore)}
/>
```

### Matching Pairs
```typescript
<MatchingPairs
  pairs={pairs}
  showImages={true}
  onComplete={(score) => handleScore(score)}
/>
```

### Memory Game
```typescript
<MemoryGame
  cards={cards}
  onComplete={(score) => handleMemoryScore(score)}
/>
```

### Drawing Exercise
```typescript
<DrawingExercise
  prompt="Draw a circuit diagram"
  onSave={(imageData) => handleDrawing(imageData)}
/>
```

## 📊 Analytics

### Export Options
```typescript
// Export as PDF
exportToPDF(analyticsData, userName);

// Export as CSV
exportToCSV(analyticsData, userName);
```

### Available Metrics
- Time spent learning
- Completion rates
- Subject distribution
- Learning styles
- Difficulty levels
- Interaction metrics
- Progress trends

## 🌐 API Documentation

### Authentication
- POST `/api/auth/signin`
- POST `/api/auth/signout`
- GET `/api/auth/session`

### Learning
- GET `/api/lessons`
- GET `/api/lessons/{id}`
- POST `/api/lessons/{id}/progress`
- GET `/api/progress`

### Messaging
- GET `/api/messages`
- POST `/api/messages`
- GET `/api/messages/unread`

### Notifications
- POST `/api/notifications/subscribe`
- POST `/api/notifications/unsubscribe`
- POST `/api/notifications/send`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Socket.IO](https://socket.io/)
- [Chart.js](https://www.chartjs.org/)
- [Framer Motion](https://www.framer.com/motion/)
