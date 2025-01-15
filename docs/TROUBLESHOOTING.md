# STEAMS Education Platform - Troubleshooting Guide

## 🔍 Common Issues and Solutions

### Installation Issues

#### `npm install` Fails
```bash
Error: ENOENT: no such file or directory, open 'package.json'
```

**Solution:**
1. Verify you're in the correct directory
2. Check if package.json exists
3. Try removing node_modules and package-lock.json:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Fails
```bash
Error: Could not connect to PostgreSQL database
```

**Solution:**
1. Check if PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Ensure database exists:
```bash
psql -l  # List databases
createdb steams_db  # Create database if missing
```

### Authentication Issues

#### JWT Token Invalid
```typescript
Error: jwt malformed
```

**Solution:**
1. Check NEXTAUTH_SECRET in .env
2. Clear browser cookies and local storage
3. Sign out and sign in again

#### Session Expires Too Quickly
**Solution:**
1. Update session configuration:
```typescript
// pages/api/auth/[...nextauth].ts
export default NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
```

### Performance Issues

#### Slow Page Load Times
**Solution:**
1. Enable performance monitoring:
```typescript
// next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
};
```

2. Implement code splitting:
```typescript
// Use dynamic imports
const DynamicComponent = dynamic(() => import('@/components/Heavy'), {
  loading: () => <LoadingSpinner />,
});
```

3. Optimize images:
```typescript
import Image from 'next/image';

function OptimizedImage() {
  return (
    <Image
      src="/large-image.jpg"
      width={800}
      height={600}
      placeholder="blur"
      priority={true}
    />
  );
}
```

#### Memory Leaks
**Solution:**
1. Clean up subscriptions:
```typescript
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

2. Use proper cleanup in custom hooks:
```typescript
function useCustomHook() {
  useEffect(() => {
    const interval = setInterval(() => {}, 1000);
    return () => clearInterval(interval);
  }, []);
}
```

### WebSocket Issues

#### Connection Drops
**Solution:**
1. Implement reconnection logic:
```typescript
function useWebSocket() {
  useEffect(() => {
    const socket = io({
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    return () => socket.close();
  }, []);
}
```

#### Message Queue Overflow
**Solution:**
1. Implement message batching:
```typescript
function batchMessages(messages: Message[], batchSize = 50) {
  return messages.reduce((batches, message, index) => {
    const batchIndex = Math.floor(index / batchSize);
    if (!batches[batchIndex]) {
      batches[batchIndex] = [];
    }
    batches[batchIndex].push(message);
    return batches;
  }, [] as Message[][]);
}
```

### Push Notification Issues

#### Notifications Not Showing
**Solution:**
1. Check permission status:
```typescript
async function checkNotificationPermission() {
  if (!('Notification' in window)) {
    console.error('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission denied');
    return false;
  }

  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return true;
}
```

2. Verify service worker registration:
```typescript
async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });
    return subscription;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}
```

### Database Issues

#### Migration Fails
**Solution:**
1. Reset database and migrations:
```bash
# Reset database
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name init
```

2. Handle schema conflicts:
```bash
# Save current changes
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql
```

### Analytics Issues

#### Export Fails
**Solution:**
1. Handle large datasets:
```typescript
async function exportLargeDataset(data: AnalyticsData) {
  // Split into chunks
  const chunks = splitIntoChunks(data, 1000);
  
  // Process chunks
  for (const chunk of chunks) {
    await processChunk(chunk);
  }
}
```

2. Implement timeout handling:
```typescript
function exportWithTimeout(timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Export timed out'));
    }, timeoutMs);

    exportData()
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}
```

### Accessibility Issues

#### Screen Reader Compatibility
**Solution:**
1. Add proper ARIA labels:
```typescript
function AccessibleButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-label="Submit answer"
      role="button"
      tabIndex={0}
    >
      {children}
    </button>
  );
}
```

2. Implement keyboard navigation:
```typescript
function KeyboardNav({ onSelect }) {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyPress={handleKeyPress}
      onClick={onSelect}
    >
      Clickable Element
    </div>
  );
}
```

## 📝 Logging and Debugging

### Enable Debug Logging
```typescript
// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  localStorage.setItem('debug', 'app:*');
}

const debug = require('debug')('app:component');
```

### Error Boundary Implementation
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## 🔧 Development Tools

### Recommended VS Code Extensions
- ESLint
- Prettier
- Debug for Chrome
- Jest Runner
- Prisma
- Tailwind CSS IntelliSense

### Browser Extensions
- React Developer Tools
- Redux DevTools
- Accessibility Insights
- Lighthouse

## 📞 Support Channels

### Getting Help
1. GitHub Issues
2. Discord Community
3. Stack Overflow
4. Documentation

### Reporting Bugs
1. Check existing issues
2. Provide reproduction steps
3. Include error messages
4. Share environment details

## 🔄 Recovery Procedures

### Database Recovery
```bash
# Backup database
pg_dump steams_db > backup.sql

# Restore database
psql steams_db < backup.sql
```

### Cache Clear
```typescript
// Clear all caches
async function clearCaches() {
  // Clear browser cache
  await caches.keys().then(keys => {
    return Promise.all(
      keys.map(key => caches.delete(key))
    );
  });

  // Clear local storage
  localStorage.clear();

  // Clear session storage
  sessionStorage.clear();
}
```

### Reset Application State
```typescript
async function resetAppState() {
  // Clear auth
  await signOut();

  // Clear cached data
  await clearCaches();

  // Reset store
  dispatch({ type: 'RESET_STATE' });

  // Reload application
  window.location.reload();
}
```
