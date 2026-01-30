# Sage Dashboard Testing Guide

This document outlines comprehensive testing scenarios for the Sage Dashboard application. It covers unit testing, integration testing, end-to-end testing, performance testing, and manual testing procedures.

## Table of Contents
1. [Testing Strategy](#testing-strategy)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)
6. [Manual Testing Checklist](#manual-testing-checklist)
7. [Edge Case Testing](#edge-case-testing)
8. [Error Handling Testing](#error-handling-testing)
9. [Accessibility Testing](#accessibility-testing)
10. [Security Testing](#security-testing)

## Testing Strategy

### Testing Pyramid
```
        E2E Tests (10%)
           /\
          /  \
         /    \
Integration Tests (20%)
        /______\
       /        \
      /          \
  Unit Tests (70%)
```

### Test Environment Setup
```bash
# Development environment
npm run dev

# Test environment variables
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=test-key
NODE_ENV=test
```

## Unit Testing

### Component Testing

#### 1. StatCard Component
```typescript
// Test cases:
- Renders title and value correctly
- Displays loading state
- Shows trend indicator (up/down)
- Applies correct color classes
- Handles missing data gracefully
```

#### 2. ProjectList Component
```typescript
// Test cases:
- Renders empty state when no projects
- Displays project cards with correct data
- Shows loading skeleton
- Handles click events
- Responsive layout at different breakpoints
```

#### 3. CreateProjectModal Component
```typescript
// Test cases:
- Modal opens/closes correctly
- Form validation works
- Submit button disabled when invalid
- Error messages display properly
- Success callback triggers on submit
```

### Hook Testing

#### 1. useRealtimeProjects Hook
```typescript
// Test cases:
- Returns initial loading state
- Fetches projects successfully
- Handles fetch errors
- Updates state on realtime changes
- Cleans up subscriptions on unmount
```

#### 2. useRealtimeTasks Hook
```typescript
// Test cases:
- Filters tasks by projectId
- Handles realtime updates
- Manages loading states
- Returns proper error messages
```

### Utility Function Testing

#### 1. retryWithBackoff Function
```typescript
// Test cases:
- Retries failed operations
- Applies exponential backoff
- Respects max retries limit
- Handles non-retryable errors
- Includes jitter to prevent thundering herd
```

#### 2. ErrorBoundary Component
```typescript
// Test cases:
- Catches rendering errors
- Displays fallback UI
- Provides retry functionality
- Logs errors to console
```

## Integration Testing

### API Integration Tests

#### 1. Supabase Connection
```typescript
// Test scenarios:
- Successful connection to Supabase
- Handles authentication errors
- Manages realtime subscriptions
- Recovers from network interruptions
```

#### 2. Data Synchronization
```typescript
// Test scenarios:
- Real-time updates propagate correctly
- Multiple clients stay in sync
- Conflict resolution works
- Offline data handling
```

### Component Integration Tests

#### 1. Dashboard Page
```typescript
// Test scenarios:
- All stats cards load data
- Project list updates in real-time
- Activity feed shows recent events
- Agent activity displays correctly
```

#### 2. Review Queue Page
```typescript
// Test scenarios:
- Loads pending reviews
- Handles review actions (approve/reject/request changes)
- Updates UI after actions
- Shows appropriate feedback
```

## End-to-End Testing

### User Flow Tests

#### 1. Complete Dashboard Experience
```
Test: User can navigate the entire dashboard
Steps:
1. Visit dashboard
2. View stats cards
3. Browse project list
4. Check activity feed
5. Monitor agent activity
6. Navigate to review queue
7. Perform review actions
8. Return to dashboard

Expected: All features work seamlessly
```

#### 2. Project Management Flow
```
Test: User can create and manage projects
Steps:
1. Click "New Project" button
2. Fill project details
3. Submit form
4. See project in list
5. Click project to view details
6. Add tasks to project
7. Update project status
8. Archive completed project

Expected: Project lifecycle works correctly
```

### Cross-Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Responsiveness Testing
- iPhone SE (320px)
- iPhone 12/13 (390px)
- iPad (768px)
- Desktop (1024px+)

## Performance Testing

### Bundle Size Analysis
```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Analyze bundle
npm run build -- --analyze
```

### Performance Metrics
1. **First Contentful Paint (FCP)**: < 1.5s
2. **Largest Contentful Paint (LCP)**: < 2.5s
3. **Time to Interactive (TTI)**: < 3.5s
4. **Cumulative Layout Shift (CLS)**: < 0.1
5. **Total Blocking Time (TBT)**: < 200ms

### Load Testing Scenarios

#### 1. Normal Load (100 concurrent users)
- Dashboard page load
- Real-time updates
- Form submissions

#### 2. Peak Load (1000 concurrent users)
- Stress test API endpoints
- Database connection pooling
- Memory usage monitoring

#### 3. Endurance Test (24-hour run)
- Memory leak detection
- Connection stability
- Database performance

## Manual Testing Checklist

### Daily Smoke Test (5 minutes)
- [ ] Dashboard loads without errors
- [ ] Stats cards display data
- [ ] Project list shows projects
- [ ] Navigation works correctly
- [ ] Mobile responsive layout

### Weekly Regression Test (30 minutes)
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Real-time updates work
- [ ] Error handling functions
- [ ] Performance meets targets

### Monthly Comprehensive Test (2 hours)
- [ ] Complete user flows
- [ ] Cross-browser compatibility
- [ ] Mobile device testing
- [ ] Accessibility compliance
- [ ] Security vulnerabilities

## Edge Case Testing

### Data States
1. **Empty Database**
   - No projects
   - No tasks
   - No activity
   - No subagent runs

2. **Large Dataset**
   - 1000+ projects
   - 5000+ tasks
   - High activity volume
   - Many concurrent subagents

3. **Mixed Data**
   - Some projects with many tasks
   - Some projects with no tasks
   - Varied project statuses
   - Different priority levels

### Network Conditions
1. **Slow Network (3G)**
   - Throttled to 700kbps
   - High latency (300ms)
   - Test loading states
   - Verify offline capabilities

2. **Intermittent Connection**
   - Random disconnects
   - Reconnection handling
   - Data synchronization
   - Error recovery

3. **Offline Mode**
   - Service worker caching
   - Local data persistence
   - Queue actions for later
   - Sync when back online

### User Interactions
1. **Rapid Clicks**
   - Multiple button presses
   - Form double-submission
   - Navigation spam
   - Concurrent actions

2. **Long Sessions**
   - 8+ hour continuous use
   - Memory usage monitoring
   - Tab management
   - Session persistence

3. **Multiple Tabs**
   - Data consistency
   - Real-time sync
   - Conflict resolution
   - Resource sharing

## Error Handling Testing

### API Error Scenarios
1. **Supabase Unavailable**
   - Connection timeout
   - Authentication failure
   - Rate limiting
   - Maintenance mode

2. **Network Issues**
   - DNS failure
   - SSL errors
   - Proxy issues
   - Firewall blocking

3. **Data Errors**
   - Invalid JSON responses
   - Missing required fields
   - Type mismatches
   - Constraint violations

### User Interface Error Handling
1. **Form Validation**
   - Required fields
   - Input formatting
   - Length limits
   - Type validation

2. **Action Feedback**
   - Loading states
   - Success messages
   - Error notifications
   - Retry options

3. **Recovery Options**
   - Retry failed actions
   - Refresh data
   - Clear cache
   - Report issues

## Accessibility Testing

### WCAG 2.1 AA Compliance
1. **Perceivable**
   - [ ] Text alternatives for images
   - [ ] Captions for multimedia
   - [ ] Content adaptable presentation
   - [ ] Distinguishable content

2. **Operable**
   - [ ] Keyboard accessible
   - [ ] Enough time to read/use
   - [ ] Seizure-safe content
   - [ ] Navigable content

3. **Understandable**
   - [ ] Readable text content
   - [ ] Predictable operation
   - [ ] Input assistance

4. **Robust**
   - [ ] Compatible with assistive tech
   - [ ] Valid HTML/CSS

### Screen Reader Testing
- VoiceOver (macOS/iOS)
- NVDA (Windows)
- JAWS (Windows)
- TalkBack (Android)

### Keyboard Navigation
- Tab order logical
- Focus visible
- Skip navigation links
- Keyboard shortcuts

## Security Testing

### Authentication & Authorization
1. **Session Management**
   - Token expiration
   - Refresh token rotation
   - Logout functionality
   - Session persistence

2. **Access Control**
   - Role-based permissions
   - Route protection
   - API authorization
   - Data isolation

### Data Protection
1. **Input Validation**
   - SQL injection prevention
   - XSS protection
   - CSRF tokens
   - File upload validation

2. **Data Encryption**
   - HTTPS enforcement
   - Sensitive data masking
   - Secure storage
   - Transmission security

### Dependency Security
```bash
# Regular security audits
npm audit
npm audit fix

# Update dependencies
npm update
npm outdated
```

## Test Automation

### CI/CD Pipeline
```yaml
# GitHub Actions example
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
```

### Monitoring & Alerting
1. **Error Tracking**
   - Sentry integration
   - Log aggregation
   - Performance monitoring
   - User feedback

2. **Alert Configuration**
   - Critical errors
   - Performance degradation
   - Security incidents
   - Availability issues

## Test Data Management

### Sample Data Generation
```javascript
// Use add-sample-data.js script
node add-sample-data.js

// Generates:
// - Multiple projects
// - Various tasks
// - Activity logs
// - Subagent runs
```

### Data Reset
```sql
-- Reset to clean state
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE tasks CASCADE;
TRUNCATE TABLE activity_log CASCADE;
TRUNCATE TABLE subagent_runs CASCADE;
```

## Performance Monitoring

### Real User Monitoring (RUM)
- Page load times
- User interactions
- Error rates
- Custom metrics

### Synthetic Monitoring
- Uptime checks
- Transaction monitoring
- API endpoint testing
- Geographic performance

## Release Testing Process

### Pre-release Checklist
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit complete
- [ ] Documentation updated
- [ ] Rollback plan prepared

### Post-release Validation
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify user feedback
- [ ] Update test cases

---

## Appendix

### Test Tools & Libraries
- **Unit Testing**: Vitest, React Testing Library
- **E2E Testing**: Playwright, Cypress
- **Performance**: Lighthouse, WebPageTest
- **Accessibility**: axe-core, Lighthouse
- **Security**: OWASP ZAP, npm audit

### Test Environment URLs
- Development: http://localhost:3000
- Staging: https://staging.sage-dashboard.com
- Production: https://sage-dashboard.com

### Contact Information
- Test Lead: [Name/Email]
- Security Contact: [Name/Email]
- Performance Contact: [Name/Email]

---

*Last Updated: January 30, 2025*  
*Version: 1.0.0*