# Cross-Dashboard Communication System

## Overview

The cross-dashboard communication system enables real-time information sharing and communication between Admin, Employer, and Candidate dashboards. This allows seamless data synchronization and notifications across all three dashboard types.

## Architecture

### Core Components

1. **DashboardCommunicationService** (`client/src/services/dashboardCommunicationService.ts`)
   - Centralized service managing all inter-dashboard communication
   - Handles message routing, statistics updates, and event broadcasting
   - Singleton pattern ensures single source of truth

2. **useDashboardCommunication Hook** (`client/src/hooks/useDashboardCommunication.ts`)
   - React hook for accessing communication features in components
   - Manages subscriptions and real-time updates
   - Provides methods for sending messages and requesting data

3. **DashboardNotifications Component** (`client/src/components/DashboardNotifications.tsx`)
   - UI component displaying cross-dashboard messages
   - Shows unread message count
   - Allows marking messages as read

## Features

### 1. Message Types

- **notification**: General notifications between dashboards
- **data-update**: Shared data updates (stats, metrics)
- **alert**: System-wide alerts and warnings
- **request**: Data requests from one dashboard to another

### 2. Message Routing

Messages can be sent to:
- Specific dashboard: `sendMessage(to: 'admin' | 'employer' | 'candidate')`
- All dashboards: `sendMessage(to: 'all')`

### 3. Shared Statistics

Real-time statistics shared across all dashboards:
- `totalUsers`: Total platform users
- `activeJobs`: Number of active job postings
- `pendingApplications`: Applications awaiting review
- `completedInterviews`: Completed AI interviews
- `platformRevenue`: Total platform revenue
- `lastUpdated`: Last update timestamp

### 4. Data Requests

Dashboards can request specific data types:
```typescript
const data = await requestData('admin', 'job-stats');
// Returns: { activeJobs, totalJobs }

const data = await requestData('employer', 'candidate-stats');
// Returns: { totalCandidates, activeApplications }

const data = await requestData('admin', 'interview-stats');
// Returns: { completedInterviews, scheduledInterviews }

const data = await requestData('employer', 'revenue-stats');
// Returns: { platformRevenue, monthlyGrowth }
```

## Usage Examples

### Admin Dashboard

```typescript
import { useDashboardCommunication } from '../../hooks/useDashboardCommunication';

const AdminDashboard = () => {
  const { messages, unreadCount, stats, sendMessage, broadcastAlert, updateStats } = 
    useDashboardCommunication('admin');

  // Update shared statistics
  const handleDataRefresh = () => {
    updateStats({
      totalUsers: 2847,
      activeJobs: 156,
      completedInterviews: 1234
    });
  };

  // Broadcast system alert
  const handleSystemAlert = () => {
    broadcastAlert('System Maintenance', 'Scheduled maintenance at 2 AM', 'warning');
  };

  // Send message to specific dashboard
  const notifyEmployers = () => {
    sendMessage('employer', 'notification', 'New Feature', 'Check out our new analytics dashboard');
  };

  return (
    <div>
      <DashboardNotifications messages={messages} role="admin" onMarkAsRead={markAsRead} />
      {/* Rest of dashboard */}
    </div>
  );
};
```

### Employer Dashboard

```typescript
const EmployerDashboard = () => {
  const { messages, stats, sendMessage, requestData } = 
    useDashboardCommunication('employer');

  // Request data from admin
  const getJobStats = async () => {
    const jobStats = await requestData('admin', 'job-stats');
    console.log('Active jobs:', jobStats.activeJobs);
  };

  // Send message to candidates
  const notifyCandidates = () => {
    sendMessage('candidate', 'notification', 'New Job Posted', 'Check out our latest job opening');
  };

  return (
    <div>
      <DashboardNotifications messages={messages} role="employer" onMarkAsRead={markAsRead} />
      {/* Rest of dashboard */}
    </div>
  );
};
```

### Candidate Dashboard

```typescript
const CandidateDashboard = () => {
  const { messages, stats, sendMessage, requestData } = 
    useDashboardCommunication('candidate');

  // Request interview statistics
  const getInterviewStats = async () => {
    const stats = await requestData('admin', 'interview-stats');
    console.log('Completed interviews:', stats.completedInterviews);
  };

  // Send message to employer
  const contactEmployer = () => {
    sendMessage('employer', 'notification', 'Application Status', 'Following up on my application');
  };

  return (
    <div>
      <DashboardNotifications messages={messages} role="candidate" onMarkAsRead={markAsRead} />
      {/* Rest of dashboard */}
    </div>
  );
};
```

## Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│         DashboardCommunicationService (Singleton)           │
│  - Manages all messages and statistics                      │
│  - Routes messages between dashboards                       │
│  - Broadcasts system-wide alerts                            │
└─────────────────────────────────────────────────────────────┘
         ↑                    ↑                    ↑
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
    │  Admin   │          │ Employer │          │Candidate│
    │Dashboard │          │Dashboard │          │Dashboard │
    └────┬────┘          └────┬────┘          └────┬────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    useDashboardCommunication Hook
                              │
                    DashboardNotifications Component
```

## Event Subscriptions

The service supports the following events:

- `message-received`: New message received
- `message-read`: Message marked as read
- `stats-updated`: Shared statistics updated
- `alert-broadcast`: System-wide alert broadcast

## Best Practices

1. **Use the Hook**: Always use `useDashboardCommunication` hook in components for automatic subscription management
2. **Clean Up**: The hook automatically unsubscribes from events on unmount
3. **Message Types**: Use appropriate message types for better organization
4. **Error Handling**: Wrap `requestData` calls in try-catch blocks
5. **Performance**: Messages older than 24 hours are automatically cleared

## Integration with Existing Dashboards

The communication system is already integrated into:
- `client/src/pages/admin/Dashboard.tsx`
- `client/src/pages/employer/Dashboard.tsx`
- `client/src/pages/candidate/Dashboard.tsx`

To add notifications to any dashboard:

```typescript
import DashboardNotifications from '../../components/DashboardNotifications';

// In your dashboard component
<DashboardNotifications 
  messages={messages} 
  role="admin" 
  onMarkAsRead={markAsRead} 
/>
```

## Future Enhancements

- WebSocket integration for real-time updates
- Persistent message storage in database
- Message filtering and search
- User preferences for notification types
- Message templates for common notifications
- Analytics on message patterns and communication flow
