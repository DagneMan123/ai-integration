# Dashboard Communication System

## Overview

The Dashboard Communication System enables professional inter-dashboard communication between Admin, Employer, and Candidate dashboards. It provides a centralized event-driven architecture for real-time data synchronization and action coordination.

## Architecture

### Components

1. **DashboardCommunicationService** (`client/src/services/dashboardService.ts`)
   - Singleton service managing all dashboard communications
   - Event broadcasting and listening
   - State management for each dashboard
   - Event history tracking

2. **useDashboardCommunication Hook** (`client/src/hooks/useDashboardCommunication.ts`)
   - React hook for dashboard integration
   - Automatic registration/unregistration
   - Event listener management
   - Communication methods

3. **Updated Dashboards**
   - Admin Dashboard
   - Employer Dashboard
   - Candidate Dashboard

## Event Types

### 1. Data Update (`data-update`)
Broadcasted when a dashboard's data is refreshed or updated.

```typescript
{
  type: 'data-update',
  source: 'admin' | 'employer' | 'candidate',
  target: 'all',
  payload: {
    role: string,
    dataKeys: string[],
    timestamp: number
  },
  priority: 'normal'
}
```

**Use Cases:**
- Dashboard data refresh
- Real-time metrics updates
- Analytics data synchronization

### 2. Status Change (`status-change`)
Notifies about important status changes in the system.

```typescript
{
  type: 'status-change',
  source: 'admin' | 'employer' | 'candidate',
  target: 'all',
  payload: {
    status: string,
    details: any
  },
  priority: 'normal'
}
```

**Use Cases:**
- Job approval/rejection
- Application status changes
- Interview completion
- Payment processing

### 3. Action Required (`action-required`)
Requests specific action from another dashboard.

```typescript
{
  type: 'action-required',
  source: 'admin' | 'employer' | 'candidate',
  target: 'admin' | 'employer' | 'candidate',
  payload: {
    action: string,
    data: any
  },
  priority: 'high'
}
```

**Use Cases:**
- Admin approving jobs
- Employer scheduling interviews
- Candidate accepting offers

### 4. Notification (`notification`)
Sends informational messages to dashboards.

```typescript
{
  type: 'notification',
  source: 'admin' | 'employer' | 'candidate',
  target: 'all',
  payload: {
    message: string
  },
  priority: 'low' | 'normal' | 'high' | 'critical'
}
```

**Use Cases:**
- System alerts
- Important announcements
- Error notifications

### 5. Sync Request (`sync-request`)
Requests data synchronization between dashboards.

```typescript
{
  type: 'sync-request',
  source: 'admin' | 'employer' | 'candidate',
  target: 'admin' | 'employer' | 'candidate' | 'all',
  payload: {
    requestedAt: number
  },
  priority: 'high'
}
```

**Use Cases:**
- Force refresh after critical changes
- Consistency checks
- Data reconciliation

## Usage Guide

### Basic Setup

```typescript
import { useDashboardCommunication } from '../../hooks/useDashboardCommunication';

const MyDashboard: React.FC = () => {
  const {
    broadcastDataUpdate,
    notifyStatusChange,
    requestAction,
    sendNotification,
    requestSync,
    getDashboardState,
    getAllDashboardStates,
    getEventHistory,
  } = useDashboardCommunication({
    role: 'admin', // or 'employer' or 'candidate'
    onDataUpdate: (event) => {
      console.log('Data updated:', event);
    },
    onStatusChange: (event) => {
      console.log('Status changed:', event);
    },
    onActionRequired: (event) => {
      console.log('Action required:', event);
    },
    onNotification: (event) => {
      console.log('Notification:', event);
    },
    onSyncRequest: (event) => {
      console.log('Sync requested:', event);
    },
    onAnyEvent: (event) => {
      console.log('Any event:', event);
    },
  });

  return (
    // Your dashboard JSX
  );
};
```

### Broadcasting Data Updates

```typescript
// When dashboard data is refreshed
const handleRefresh = async () => {
  const response = await analyticsAPI.getAdminDashboard();
  const dashboardData = response.data.data;
  
  // Broadcast to other dashboards
  broadcastDataUpdate(dashboardData);
};
```

### Notifying Status Changes

```typescript
// When a job is approved
const handleApproveJob = async (jobId: string) => {
  await adminAPI.approveJob(jobId);
  
  // Notify other dashboards
  notifyStatusChange('job-approved', {
    jobId,
    timestamp: new Date().toISOString(),
  });
};
```

### Requesting Actions

```typescript
// Admin requesting employer to review something
const handleRequestReview = (employerId: string, data: any) => {
  requestAction('employer', 'review-required', {
    employerId,
    ...data,
  });
};
```

### Sending Notifications

```typescript
// Send critical notification
sendNotification('System maintenance scheduled for tonight', 'critical');

// Send normal notification
sendNotification('New job applications received', 'normal');
```

### Requesting Synchronization

```typescript
// Force sync after critical change
const handleCriticalChange = async () => {
  // Make the change
  await makeImportantChange();
  
  // Request all dashboards to sync
  requestSync();
};
```

## Communication Flows

### Job Approval Flow

```
Admin Dashboard
    ↓
[Admin approves job]
    ↓
broadcastDataUpdate() + notifyStatusChange('job-approved')
    ↓
Employer Dashboard receives event
    ↓
[Employer dashboard updates UI]
    ↓
Candidate Dashboard receives event
    ↓
[Candidate sees job is now active]
```

### Interview Scheduling Flow

```
Employer Dashboard
    ↓
[Employer schedules interview]
    ↓
requestAction('candidate', 'interview-scheduled')
    ↓
Candidate Dashboard receives action
    ↓
[Candidate notified of interview]
    ↓
Admin Dashboard receives notification
    ↓
[Admin sees interview scheduled]
```

### Data Synchronization Flow

```
Any Dashboard
    ↓
[Critical change made]
    ↓
requestSync('all')
    ↓
All Dashboards
    ↓
[Fetch latest data]
    ↓
broadcastDataUpdate()
    ↓
[All dashboards synchronized]
```

## API Reference

### DashboardCommunicationService

#### Methods

- `registerDashboard(role)` - Register a dashboard instance
- `unregisterDashboard(role)` - Unregister a dashboard instance
- `broadcastEvent(event)` - Broadcast an event to all dashboards
- `updateDashboardData(role, data)` - Update dashboard data
- `notifyStatusChange(source, status, details)` - Notify status change
- `requestAction(source, target, action, data)` - Request action
- `sendNotification(source, message, priority)` - Send notification
- `requestSync(source, target)` - Request synchronization
- `getDashboardState(role)` - Get dashboard state
- `getAllDashboardStates()` - Get all dashboard states
- `getEventHistory(limit)` - Get event history
- `onDashboardEvent(eventType, callback)` - Listen to specific event
- `onAnyEvent(callback)` - Listen to all events
- `offDashboardEvent(eventType, callback)` - Remove event listener
- `clearEventHistory()` - Clear event history
- `getHealthStatus()` - Get service health status
- `destroy()` - Cleanup service

### useDashboardCommunication Hook

#### Returns

- `broadcastDataUpdate(data)` - Broadcast data update
- `notifyStatusChange(status, details)` - Notify status change
- `requestAction(target, action, data)` - Request action
- `sendNotification(message, priority)` - Send notification
- `requestSync(target)` - Request synchronization
- `getDashboardState()` - Get current dashboard state
- `getAllDashboardStates()` - Get all dashboard states
- `getEventHistory(limit)` - Get event history

## Best Practices

### 1. Event Naming
Use clear, descriptive event names:
- ✅ `job-approved`, `interview-scheduled`, `payment-processed`
- ❌ `update`, `change`, `event`

### 2. Priority Levels
Use appropriate priority levels:
- `critical` - System errors, security issues
- `high` - Important actions, approvals
- `normal` - Regular updates, status changes
- `low` - Informational messages

### 3. Error Handling
Always handle errors gracefully:

```typescript
try {
  const response = await analyticsAPI.getAdminDashboard();
  broadcastDataUpdate(response.data.data);
} catch (error) {
  sendNotification('Failed to load dashboard data', 'high');
}
```

### 4. Memory Management
Clean up listeners when components unmount:

```typescript
useEffect(() => {
  // Listeners are automatically cleaned up by the hook
  return () => {
    // Cleanup happens here
  };
}, []);
```

### 5. Event History
Monitor event history for debugging:

```typescript
const history = getEventHistory(50);
console.log('Recent events:', history);
```

## Monitoring and Debugging

### Check Service Health

```typescript
import dashboardService from '../../services/dashboardService';

const health = dashboardService.getHealthStatus();
console.log('Service health:', health);
// Output:
// {
//   isHealthy: true,
//   registeredDashboards: 3,
//   eventHistorySize: 45,
//   lastEventTime: 1234567890
// }
```

### View Event History

```typescript
const recentEvents = dashboardService.getEventHistory(20);
recentEvents.forEach(event => {
  console.log(`[${event.source}] ${event.type}:`, event.payload);
});
```

### Monitor Specific Events

```typescript
dashboardService.onDashboardEvent('action-required', (event) => {
  console.log('Action required:', event);
  // Log to monitoring service
});
```

## Performance Considerations

1. **Event History Limit**: Maximum 100 events stored (configurable)
2. **Refresh Interval**: 30 seconds between dashboard refreshes
3. **Event Listeners**: Automatically cleaned up on component unmount
4. **Memory Usage**: Minimal overhead with singleton pattern

## Troubleshooting

### Events Not Being Received

1. Check if dashboard is registered:
   ```typescript
   const state = dashboardService.getDashboardState('admin');
   console.log('Admin dashboard registered:', !!state);
   ```

2. Verify event listeners are attached:
   ```typescript
   const history = dashboardService.getEventHistory();
   console.log('Recent events:', history);
   ```

### Data Not Synchronizing

1. Check if data update is being broadcast:
   ```typescript
   broadcastDataUpdate(data);
   ```

2. Verify other dashboards are listening:
   ```typescript
   const states = dashboardService.getAllDashboardStates();
   console.log('Registered dashboards:', Array.from(states.keys()));
   ```

### Memory Leaks

1. Ensure cleanup on unmount:
   ```typescript
   useEffect(() => {
     return () => {
       // Cleanup happens automatically
     };
   }, []);
   ```

2. Monitor event history size:
   ```typescript
   const health = dashboardService.getHealthStatus();
   if (health.eventHistorySize > 100) {
     dashboardService.clearEventHistory();
   }
   ```

## Future Enhancements

1. **Persistent Event Storage** - Store events in database
2. **Real-time Notifications** - WebSocket integration
3. **Event Filtering** - Advanced event filtering options
4. **Analytics** - Track communication patterns
5. **Audit Trail** - Complete audit logging
6. **Performance Metrics** - Monitor communication performance

## Support

For issues or questions about the Dashboard Communication System, refer to:
- Event logs in browser console
- Service health status
- Event history
- Component documentation
