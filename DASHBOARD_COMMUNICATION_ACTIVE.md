# Active Dashboard Communication System

## Overview

The three dashboards (Admin, Employer, Candidate) now actively communicate and transfer information with each other in real-time. This creates a unified platform experience where changes in one dashboard are immediately reflected across all dashboards.

## Key Features

### 1. Real-Time Data Synchronization

**Admin Dashboard → All Dashboards**
- Platform statistics (total users, active jobs, pending applications, completed interviews)
- System alerts and notifications
- Data refresh triggers
- Infrastructure updates

**Employer Dashboard → Admin & Candidate Dashboards**
- Job posting updates
- Application status changes
- Interview scheduling
- Candidate feedback

**Candidate Dashboard → Admin & Employer Dashboards**
- Application submissions
- Interview completion status
- Profile updates
- Performance metrics

### 2. New Components

#### DashboardNotifications Component
- Displays cross-dashboard messages
- Shows unread message count
- Color-coded by message type
- Real-time updates

**Location:** `client/src/components/DashboardNotifications.tsx`

#### DashboardInfoPanel Component
- Shows shared platform statistics
- Role-specific data display
- Real-time stat updates
- Last updated timestamp

**Location:** `client/src/components/DashboardInfoPanel.tsx`

#### CrossDashboardSync Component
- Monitors sync events between dashboards
- Shows data transfer history
- Real-time sync status
- Event logging

**Location:** `client/src/components/CrossDashboardSync.tsx`

### 3. Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                          │
│  - Monitors all platform activity                           │
│  - Broadcasts system-wide updates                           │
│  - Manages shared statistics                                │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ↓                 ↓
┌──────────────────┐  ┌──────────────────┐
│ Employer         │  │ Candidate        │
│ Dashboard        │  │ Dashboard        │
│                  │  │                  │
│ - Job updates    │  │ - Application    │
│ - Applications   │  │   status         │
│ - Interviews     │  │ - Interview      │
│ - Candidates     │  │   results        │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ↓                       ↓
   Sync Events          Shared Statistics
   - Message sent       - Total Users
   - Data updated       - Active Jobs
   - Alert broadcast    - Applications
   - Request received   - Interviews
```

### 4. Data Transfer Examples

#### Admin Refreshes Platform Data
```typescript
// Admin Dashboard
const handleRefresh = async () => {
  setRefreshing(true);
  await fetchDashboardData();
  
  // Automatically updates shared stats
  updateStats({
    totalUsers: 2847,
    activeJobs: 156,
    completedInterviews: 1234
  });
  
  // Notifies all dashboards
  sendMessage('all', 'data-update', 'System Update', 'Platform data refreshed');
};
```

#### Employer Posts New Job
```typescript
// Employer Dashboard
const handlePostJob = async (jobData) => {
  // Post job to backend
  await createJob(jobData);
  
  // Notify candidates about new job
  sendMessage('candidate', 'notification', 'New Job Posted', 
    `Check out: ${jobData.title}`);
  
  // Update admin with job count
  sendMessage('admin', 'data-update', 'Job Posted', 
    `New job: ${jobData.title}`);
};
```

#### Candidate Applies for Job
```typescript
// Candidate Dashboard
const handleApplyJob = async (jobId) => {
  // Submit application
  await submitApplication(jobId);
  
  // Notify employer
  sendMessage('employer', 'notification', 'New Application', 
    'You have a new application');
  
  // Update admin
  sendMessage('admin', 'data-update', 'Application Submitted', 
    'New application received');
};
```

### 5. Shared Statistics

All dashboards have access to real-time platform statistics:

```typescript
interface DashboardStats {
  totalUsers: number;           // Total registered users
  activeJobs: number;           // Active job postings
  pendingApplications: number;  // Applications awaiting review
  completedInterviews: number;  // Completed AI interviews
  platformRevenue: string;      // Total platform revenue
  lastUpdated: Date;            // Last update timestamp
}
```

### 6. Message Types

- **notification**: General notifications between dashboards
- **data-update**: Shared data updates (stats, metrics)
- **alert**: System-wide alerts and warnings
- **request**: Data requests from one dashboard to another

### 7. Integration Points

#### Admin Dashboard
- View shared statistics button
- Sync platform data button
- Notification bell with unread count
- Cross-dashboard sync monitor

#### Employer Dashboard
- View shared statistics button
- Request candidate data
- Send job updates to candidates
- Notification bell with unread count

#### Candidate Dashboard
- View shared statistics button
- Request job information
- Send application updates to employers
- Notification bell with unread count

## Usage in Components

### Using the Hook

```typescript
import { useDashboardCommunication } from '../../hooks/useDashboardCommunication';

const MyComponent = () => {
  const { 
    messages,           // Array of messages
    unreadCount,        // Number of unread messages
    stats,              // Shared statistics
    sendMessage,        // Send message to dashboard
    markAsRead,         // Mark message as read
    requestData,        // Request data from dashboard
    broadcastAlert,     // Broadcast alert to all
    updateStats         // Update shared statistics
  } = useDashboardCommunication('admin');

  return (
    <div>
      <DashboardNotifications 
        messages={messages} 
        role="admin" 
        onMarkAsRead={markAsRead} 
      />
    </div>
  );
};
```

### Adding Components to Dashboard

```typescript
import DashboardNotifications from '../../components/DashboardNotifications';
import DashboardInfoPanel from '../../components/DashboardInfoPanel';
import CrossDashboardSync from '../../components/CrossDashboardSync';

const Dashboard = () => {
  const { messages, stats, markAsRead } = useDashboardCommunication('admin');
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  return (
    <>
      <DashboardNotifications 
        messages={messages} 
        role="admin" 
        onMarkAsRead={markAsRead} 
      />
      <DashboardInfoPanel 
        stats={stats} 
        role="admin" 
        onClose={() => setShowInfoPanel(false)} 
        isOpen={showInfoPanel} 
      />
      <CrossDashboardSync role="admin" />
    </>
  );
};
```

## Real-Time Features

### Automatic Sync
- Dashboards sync every 60 seconds
- Manual refresh available
- Real-time message delivery
- Instant stat updates

### Event Tracking
- All cross-dashboard events logged
- Sync history maintained
- Event timestamps recorded
- Status indicators (success/pending/error)

### Notifications
- Unread message count
- Color-coded by type
- Auto-dismiss after 5 seconds
- Manual dismiss option

## Benefits

1. **Unified Experience**: All dashboards stay in sync
2. **Real-Time Updates**: Changes propagate instantly
3. **Better Collaboration**: Dashboards communicate seamlessly
4. **Data Consistency**: Single source of truth for statistics
5. **User Awareness**: Always know what's happening across platform
6. **Audit Trail**: All communications logged and tracked

## Performance Considerations

- Messages older than 24 hours auto-cleared
- Efficient event subscription system
- Minimal network overhead
- Optimized re-renders
- Lazy loading of components

## Future Enhancements

- WebSocket integration for true real-time updates
- Persistent message storage in database
- Advanced filtering and search
- User preferences for notification types
- Message templates for common notifications
- Analytics dashboard for communication patterns
- Two-way data binding for live updates
- Conflict resolution for simultaneous updates
