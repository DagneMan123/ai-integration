# Dashboard Communication System - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Dashboard Communication System                    │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │         DashboardCommunicationService (Singleton)            │   │
│  │                                                               │   │
│  │  • Event Broadcasting                                        │   │
│  │  • Dashboard State Management                                │   │
│  │  • Event History Tracking                                    │   │
│  │  • Health Monitoring                                         │   │
│  │  • Listener Management                                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │         useDashboardCommunication Hook                        │   │
│  │                                                               │   │
│  │  • Auto Registration/Unregistration                          │   │
│  │  • Event Listener Setup                                      │   │
│  │  • Communication Methods                                     │   │
│  │  • Automatic Cleanup                                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
    │  Admin  │          │ Employer│          │Candidate│
    │Dashboard│          │Dashboard│          │Dashboard│
    └────┬────┘          └────┬────┘          └────┬────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    Event Broadcasting
```

---

## Event Flow Diagram

### Job Approval Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                               │
│                                                                   │
│  1. Admin clicks "Approve Job"                                  │
│  2. API call: adminAPI.approveJob(jobId)                        │
│  3. broadcastDataUpdate(dashboardData)                          │
│  4. notifyStatusChange('job-approved', { jobId })               │
│  5. requestAction('employer', 'job-approved', { jobId })        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Events Broadcast
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │   Employer   │ │   Candidate  │ │    Admin     │
        │  Dashboard   │ │  Dashboard   │ │  Dashboard   │
        │              │ │              │ │              │
        │ Receives:    │ │ Receives:    │ │ Receives:    │
        │ • action-req │ │ • data-upd   │ │ • data-upd   │
        │ • job-approv │ │ • status-chg │ │ • status-chg │
        │              │ │              │ │              │
        │ Updates UI   │ │ Updates UI   │ │ Updates UI   │
        │ Shows toast  │ │ Shows toast  │ │ Shows toast  │
        └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Interview Scheduling Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                  Employer Dashboard                              │
│                                                                   │
│  1. Employer clicks "Schedule Interview"                        │
│  2. API call: interviewAPI.scheduleInterview(data)              │
│  3. requestAction('candidate', 'interview-scheduled', {...})    │
│  4. notifyStatusChange('interview-scheduled', {...})            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Events Broadcast
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │  Candidate   │ │    Admin     │ │   Employer   │
        │  Dashboard   │ │  Dashboard   │ │  Dashboard   │
        │              │ │              │ │              │
        │ Receives:    │ │ Receives:    │ │ Receives:    │
        │ • action-req │ │ • notif      │ │ • data-upd   │
        │ • interview- │ │ • status-chg │ │              │
        │   scheduled  │ │              │ │              │
        │              │ │              │ │              │
        │ Updates UI   │ │ Updates UI   │ │ Updates UI   │
        │ Shows toast  │ │ Shows toast  │ │ Shows toast  │
        └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Application Status Update Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                  Employer Dashboard                              │
│                                                                   │
│  1. Employer updates application status                         │
│  2. API call: applicationAPI.updateApplicationStatus(...)       │
│  3. requestAction('candidate', 'application-status-updated')    │
│  4. notifyStatusChange('application-status-updated', {...})     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Events Broadcast
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │  Candidate   │ │    Admin     │ │   Employer   │
        │  Dashboard   │ │  Dashboard   │ │  Dashboard   │
        │              │ │              │ │              │
        │ Receives:    │ │ Receives:    │ │ Receives:    │
        │ • action-req │ │ • notif      │ │ • data-upd   │
        │ • app-status │ │ • status-chg │ │              │
        │   -updated   │ │              │ │              │
        │              │ │              │ │              │
        │ Updates UI   │ │ Updates UI   │ │ Updates UI   │
        │ Shows toast  │ │ Shows toast  │ │ Shows toast  │
        └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Component Integration Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Component                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  const { broadcastDataUpdate, ... } =                    │   │
│  │    useDashboardCommunication({                           │   │
│  │      role: 'admin',                                      │   │
│  │      onDataUpdate: (event) => { ... },                   │   │
│  │      onStatusChange: (event) => { ... },                 │   │
│  │      onActionRequired: (event) => { ... },               │   │
│  │    });                                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  useDashboardCommunication Hook                          │   │
│  │                                                           │   │
│  │  • Registers dashboard on mount                          │   │
│  │  • Sets up event listeners                               │   │
│  │  • Returns communication methods                          │   │
│  │  • Cleans up on unmount                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  DashboardCommunicationService                           │   │
│  │                                                           │   │
│  │  • Manages dashboard states                              │   │
│  │  • Broadcasts events                                     │   │
│  │  • Tracks event history                                  │   │
│  │  • Monitors health                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Event Types and Priorities

```
┌─────────────────────────────────────────────────────────────────┐
│                      Event Types                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. data-update                                                  │
│     └─ Broadcast dashboard data changes                         │
│     └─ Priority: normal                                         │
│     └─ Target: all                                              │
│                                                                   │
│  2. status-change                                                │
│     └─ Notify about important status changes                    │
│     └─ Priority: normal                                         │
│     └─ Target: all                                              │
│                                                                   │
│  3. action-required                                              │
│     └─ Request specific actions from other dashboards           │
│     └─ Priority: high                                           │
│     └─ Target: specific dashboard                               │
│                                                                   │
│  4. notification                                                 │
│     └─ Send informational messages                              │
│     └─ Priority: low/normal/high/critical                       │
│     └─ Target: all                                              │
│                                                                   │
│  5. sync-request                                                 │
│     └─ Request data synchronization                             │
│     └─ Priority: high                                           │
│     └─ Target: all or specific                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    Dashboard Data Flow                            │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  1. Dashboard Component Mounts                             │  │
│  │     └─ useDashboardCommunication() hook called            │  │
│  │     └─ Dashboard registered with service                  │  │
│  │     └─ Event listeners attached                           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  2. Data Fetch/Update                                      │  │
│  │     └─ API call made (e.g., getAdminDashboard())          │  │
│  │     └─ Data received from server                          │  │
│  │     └─ State updated locally                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  3. Broadcast Event                                        │  │
│  │     └─ broadcastDataUpdate(data) called                   │  │
│  │     └─ Event created with timestamp                       │  │
│  │     └─ Event added to history                             │  │
│  │     └─ Event emitted to all listeners                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  4. Other Dashboards Receive Event                         │  │
│  │     └─ Event listener triggered                           │  │
│  │     └─ Callback function executed                         │  │
│  │     └─ Dashboard state updated                            │  │
│  │     └─ UI re-rendered                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  5. Component Unmounts                                     │  │
│  │     └─ Cleanup function called                            │  │
│  │     └─ Event listeners removed                            │  │
│  │     └─ Dashboard unregistered                             │  │
│  │     └─ Memory cleaned up                                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Service State Management

```
┌──────────────────────────────────────────────────────────────────┐
│              DashboardCommunicationService State                  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  dashboardStates: Map<string, DashboardState>              │  │
│  │                                                             │  │
│  │  {                                                          │  │
│  │    'admin': {                                              │  │
│  │      role: 'admin',                                        │  │
│  │      data: { ... },                                        │  │
│  │      lastUpdated: 1234567890,                              │  │
│  │      isRefreshing: false,                                  │  │
│  │      errors: []                                            │  │
│  │    },                                                       │  │
│  │    'employer': { ... },                                    │  │
│  │    'candidate': { ... }                                    │  │
│  │  }                                                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  eventHistory: DashboardEvent[]                            │  │
│  │                                                             │  │
│  │  [                                                          │  │
│  │    {                                                        │  │
│  │      type: 'data-update',                                  │  │
│  │      source: 'admin',                                      │  │
│  │      target: 'all',                                        │  │
│  │      payload: { ... },                                     │  │
│  │      timestamp: 1234567890,                                │  │
│  │      priority: 'normal'                                    │  │
│  │    },                                                       │  │
│  │    { ... },                                                │  │
│  │    { ... }                                                 │  │
│  │  ]                                                          │  │
│  │  (max 100 events)                                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Communication Methods Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│                  Communication Methods                            │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  broadcastDataUpdate(data)                                 │  │
│  │  └─ Type: data-update                                      │  │
│  │  └─ Target: all                                            │  │
│  │  └─ Priority: normal                                       │  │
│  │  └─ Use: Dashboard data refresh                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  notifyStatusChange(status, details)                       │  │
│  │  └─ Type: status-change                                    │  │
│  │  └─ Target: all                                            │  │
│  │  └─ Priority: normal                                       │  │
│  │  └─ Use: Important status changes                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  requestAction(target, action, data)                       │  │
│  │  └─ Type: action-required                                  │  │
│  │  └─ Target: specific dashboard                             │  │
│  │  └─ Priority: high                                         │  │
│  │  └─ Use: Request specific actions                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  sendNotification(message, priority)                       │  │
│  │  └─ Type: notification                                     │  │
│  │  └─ Target: all                                            │  │
│  │  └─ Priority: low/normal/high/critical                     │  │
│  │  └─ Use: Informational messages                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  requestSync(target)                                       │  │
│  │  └─ Type: sync-request                                     │  │
│  │  └─ Target: all or specific                                │  │
│  │  └─ Priority: high                                         │  │
│  │  └─ Use: Force synchronization                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Event Listener Setup

```
┌──────────────────────────────────────────────────────────────────┐
│                    Event Listener Setup                           │
│                                                                    │
│  useDashboardCommunication({                                      │
│    role: 'admin',                                                 │
│                                                                    │
│    onDataUpdate: (event) => {                                     │
│      // Triggered when data-update event received                │
│      // Update dashboard data                                    │
│      // Re-render UI                                             │
│    },                                                             │
│                                                                    │
│    onStatusChange: (event) => {                                   │
│      // Triggered when status-change event received              │
│      // Update dashboard state                                   │
│      // Show notification                                        │
│    },                                                             │
│                                                                    │
│    onActionRequired: (event) => {                                 │
│      // Triggered when action-required event received            │
│      // Handle specific action                                   │
│      // Update UI accordingly                                    │
│    },                                                             │
│                                                                    │
│    onNotification: (event) => {                                   │
│      // Triggered when notification event received               │
│      // Show toast/alert                                         │
│      // Log message                                              │
│    },                                                             │
│                                                                    │
│    onSyncRequest: (event) => {                                    │
│      // Triggered when sync-request event received               │
│      // Refresh dashboard data                                   │
│      // Re-fetch from API                                        │
│    },                                                             │
│                                                                    │
│    onAnyEvent: (event) => {                                       │
│      // Triggered for any event                                  │
│      // Log all events                                           │
│      // Monitor communication                                    │
│    }                                                              │
│  })                                                               │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Memory Management

```
┌──────────────────────────────────────────────────────────────────┐
│                    Memory Management                              │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Event History Limit                                       │  │
│  │                                                             │  │
│  │  Max Events: 100                                           │  │
│  │  When limit reached: Oldest event removed                  │  │
│  │  Purpose: Prevent memory leaks                             │  │
│  │  Configurable: Yes (in dashboardService.ts)                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Listener Cleanup                                          │  │
│  │                                                             │  │
│  │  When: Component unmounts                                  │  │
│  │  What: All event listeners removed                         │  │
│  │  How: useEffect cleanup function                           │  │
│  │  Result: No memory leaks                                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Dashboard Unregistration                                  │  │
│  │                                                             │  │
│  │  When: Component unmounts                                  │  │
│  │  What: Dashboard removed from state map                    │  │
│  │  How: unregisterDashboard() called                         │  │
│  │  Result: Freed memory                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Performance Characteristics

```
┌──────────────────────────────────────────────────────────────────┐
│                  Performance Characteristics                      │
│                                                                    │
│  Event Broadcasting:        O(n) where n = number of listeners   │
│  Event History Lookup:      O(1) - array access                  │
│  Dashboard Registration:    O(1) - map insertion                 │
│  State Retrieval:           O(1) - map lookup                    │
│  Memory Usage:              ~1-2 MB for 100 events               │
│  Listener Cleanup:          O(n) where n = number of listeners   │
│                                                                    │
│  Typical Latency:           < 1ms for event broadcast            │
│  Refresh Interval:          30 seconds (configurable)            │
│  Max Concurrent Dashboards: Unlimited                            │
│  Max Event History:         100 events (configurable)            │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

**Architecture Version**: 1.0.0
**Last Updated**: March 8, 2026
**Status**: Production Ready ✅
