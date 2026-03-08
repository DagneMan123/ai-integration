# Dashboard Communication - Quick Reference Card

## 🚀 Quick Start

### Import the Hook
```typescript
import { useDashboardCommunication } from '../../hooks/useDashboardCommunication';
```

### Initialize in Your Dashboard
```typescript
const { 
  broadcastDataUpdate,
  notifyStatusChange,
  requestAction,
  sendNotification,
  requestSync,
} = useDashboardCommunication({
  role: 'admin', // or 'employer' or 'candidate'
  onDataUpdate: (event) => { /* handle */ },
  onStatusChange: (event) => { /* handle */ },
  onActionRequired: (event) => { /* handle */ },
  onNotification: (event) => { /* handle */ },
  onSyncRequest: (event) => { /* handle */ },
});
```

---

## 📡 Communication Methods

### 1. Broadcast Data Update
```typescript
broadcastDataUpdate(dashboardData);
```
**When**: Dashboard data is refreshed or updated
**Who receives**: All dashboards

### 2. Notify Status Change
```typescript
notifyStatusChange('job-approved', {
  jobId: '123',
  timestamp: new Date().toISOString(),
});
```
**When**: Important status changes occur
**Who receives**: All dashboards

### 3. Request Action
```typescript
requestAction('employer', 'job-approved', {
  jobId: '123',
  jobTitle: 'Senior Developer',
});
```
**When**: Need specific action from another dashboard
**Who receives**: Specified dashboard

### 4. Send Notification
```typescript
sendNotification('Job approved successfully', 'high');
```
**Priorities**: `'low'` | `'normal'` | `'high'` | `'critical'`
**When**: Need to inform dashboards
**Who receives**: All dashboards

### 5. Request Sync
```typescript
requestSync('all'); // or specific role
```
**When**: Critical change requires all dashboards to refresh
**Who receives**: All dashboards or specified one

---

## 🎯 Common Workflows

### Job Approval
```typescript
// Admin approves job
await adminAPI.approveJob(jobId);
notifyStatusChange('job-approved', { jobId });
requestAction('employer', 'job-approved', { jobId, jobTitle });
```

### Interview Scheduling
```typescript
// Employer schedules interview
await interviewAPI.scheduleInterview(data);
requestAction('candidate', 'interview-scheduled', { 
  jobTitle, 
  interviewDate 
});
```

### Application Status Update
```typescript
// Employer updates application
await applicationAPI.updateApplicationStatus(appId, status);
requestAction('candidate', 'application-status-updated', { 
  jobTitle, 
  newStatus 
});
```

### Payment Processing
```typescript
// Process payment
await paymentAPI.verifyPayment(txRef);
broadcastDataUpdate(paymentData);
notifyStatusChange('payment-processed', { amount, reference });
```

---

## 👂 Event Listeners

### Listen to Data Updates
```typescript
onDataUpdate: (event) => {
  console.log('Data from:', event.source);
  console.log('Updated keys:', event.payload.dataKeys);
}
```

### Listen to Status Changes
```typescript
onStatusChange: (event) => {
  console.log('Status:', event.payload.status);
  console.log('Details:', event.payload.details);
}
```

### Listen to Action Requests
```typescript
onActionRequired: (event) => {
  console.log('Action:', event.payload.action);
  console.log('Data:', event.payload.data);
}
```

### Listen to Notifications
```typescript
onNotification: (event) => {
  console.log('Message:', event.payload.message);
  console.log('Priority:', event.priority);
}
```

### Listen to Sync Requests
```typescript
onSyncRequest: (event) => {
  console.log('Sync requested by:', event.source);
  // Refresh dashboard data
}
```

---

## 🔍 Debugging

### Check Service Health
```typescript
import dashboardService from '../../services/dashboardService';

const health = dashboardService.getHealthStatus();
console.log(health);
// {
//   isHealthy: true,
//   registeredDashboards: 3,
//   eventHistorySize: 45,
//   lastEventTime: 1234567890
// }
```

### View Event History
```typescript
const events = dashboardService.getEventHistory(20);
events.forEach(e => {
  console.log(`[${e.source}] ${e.type}:`, e.payload);
});
```

### Monitor All Events
```typescript
dashboardService.onAnyEvent((event) => {
  console.log('Event:', event);
});
```

---

## 📊 Event Structure

```typescript
{
  type: 'data-update' | 'status-change' | 'action-required' | 'notification' | 'sync-request',
  source: 'admin' | 'employer' | 'candidate',
  target: 'admin' | 'employer' | 'candidate' | 'all',
  payload: any,
  timestamp: number,
  priority: 'low' | 'normal' | 'high' | 'critical'
}
```

---

## ⚡ Best Practices

✅ **DO**
- Use appropriate priority levels
- Handle errors gracefully
- Send notifications for important events
- Clean up listeners (automatic with hook)
- Monitor event history for debugging

❌ **DON'T**
- Send large payloads
- Forget to handle errors
- Use wrong priority levels
- Create memory leaks (hook handles cleanup)
- Ignore event history

---

## 🎓 Real-World Examples

### Example 1: Admin Approves Job
```typescript
const handleApproveJob = async (jobId: string, jobTitle: string) => {
  try {
    await adminAPI.approveJob(jobId);
    
    // Notify employer
    requestAction('employer', 'job-approved', { jobId, jobTitle });
    
    // Notify all dashboards
    notifyStatusChange('job-approved', { jobId });
    
    toast.success('Job approved');
  } catch (error) {
    sendNotification('Failed to approve job', 'critical');
  }
};
```

### Example 2: Employer Schedules Interview
```typescript
const handleScheduleInterview = async (candidateId, jobId, date) => {
  try {
    const response = await interviewAPI.scheduleInterview({
      candidateId,
      jobId,
      scheduledDate: date,
    });
    
    // Notify candidate
    requestAction('candidate', 'interview-scheduled', {
      jobTitle: 'Senior Developer',
      interviewDate: date.toISOString(),
    });
    
    toast.success('Interview scheduled');
  } catch (error) {
    sendNotification('Failed to schedule interview', 'critical');
  }
};
```

### Example 3: Candidate Receives Notification
```typescript
const { broadcastDataUpdate } = useDashboardCommunication({
  role: 'candidate',
  onActionRequired: (event) => {
    if (event.payload.action === 'interview-scheduled') {
      const { jobTitle, interviewDate } = event.payload.data;
      
      // Refresh data
      fetchDashboardData();
      
      // Show notification
      toast.success(
        `Interview scheduled for ${jobTitle} on ${new Date(interviewDate).toLocaleDateString()}`
      );
    }
  },
});
```

---

## 📚 Documentation

- **Full Guide**: `DASHBOARD_COMMUNICATION_GUIDE.md`
- **Examples**: `DASHBOARD_COMMUNICATION_EXAMPLES.md`
- **Setup**: `DASHBOARD_COMMUNICATION_SETUP_COMPLETE.md`

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Events not received | Check if dashboard is registered: `dashboardService.getDashboardState('admin')` |
| Data not syncing | Ensure `broadcastDataUpdate()` is called after data changes |
| Memory leak | Hook automatically cleans up listeners on unmount |
| Events not in history | Check event history size: `dashboardService.getEventHistory()` |
| Service unhealthy | Check registered dashboards: `dashboardService.getHealthStatus()` |

---

## 🔗 File Locations

- **Service**: `client/src/services/dashboardService.ts`
- **Hook**: `client/src/hooks/useDashboardCommunication.ts`
- **Admin Dashboard**: `client/src/pages/admin/Dashboard.tsx`
- **Employer Dashboard**: `client/src/pages/employer/Dashboard.tsx`
- **Candidate Dashboard**: `client/src/pages/candidate/Dashboard.tsx`

---

**Last Updated**: March 8, 2026
**Status**: ✅ Production Ready
