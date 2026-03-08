# Dashboard Communication - Real-World Examples

## Example 1: Job Approval Workflow

### Scenario
Admin approves a job posting. The employer and candidates should be notified.

### Implementation

**Admin Dashboard:**
```typescript
import { useDashboardCommunication } from '../../hooks/useDashboardCommunication';

const AdminDashboard: React.FC = () => {
  const { notifyStatusChange, sendNotification, requestAction } = useDashboardCommunication({
    role: 'admin',
  });

  const handleApproveJob = async (jobId: string, jobTitle: string, employerId: string) => {
    try {
      // Approve job in database
      await adminAPI.approveJob(jobId);

      // Notify employer about approval
      requestAction('employer', 'job-approved', {
        jobId,
        jobTitle,
        approvedAt: new Date().toISOString(),
      });

      // Notify all dashboards of status change
      notifyStatusChange('job-approved', {
        jobId,
        jobTitle,
        employerId,
      });

      // Send notification
      sendNotification(`Job "${jobTitle}" has been approved`, 'high');

      toast.success('Job approved successfully');
    } catch (error) {
      sendNotification('Failed to approve job', 'critical');
      toast.error('Failed to approve job');
    }
  };

  return (
    <button onClick={() => handleApproveJob(jobId, jobTitle, employerId)}>
      Approve Job
    </button>
  );
};
```

**Employer Dashboard:**
```typescript
const EmployerDashboard: React.FC = () => {
  const { broadcastDataUpdate } = useDashboardCommunication({
    role: 'employer',
    onActionRequired: (event) => {
      if (event.payload.action === 'job-approved') {
        const { jobId, jobTitle } = event.payload.data;
        
        // Refresh dashboard data
        fetchDashboardData();
        
        // Show notification
        toast.success(`Your job "${jobTitle}" has been approved!`);
      }
    },
  });

  return (
    // Dashboard UI
  );
};
```

**Candidate Dashboard:**
```typescript
const CandidateDashboard: React.FC = () => {
  const { requestSync } = useDashboardCommunication({
    role: 'candidate',
    onStatusChange: (event) => {
      if (event.payload.status === 'job-approved') {
        // Refresh to see newly approved job
        requestSync();
        toast.info('New job opportunities available');
      }
    },
  });

  return (
    // Dashboard UI
  );
};
```

---

## Example 2: Interview Scheduling

### Scenario
Employer schedules an interview. Candidate and admin should be notified.

### Implementation

**Employer Dashboard:**
```typescript
const EmployerDashboard: React.FC = () => {
  const { requestAction, notifyStatusChange, sendNotification } = useDashboardCommunication({
    role: 'employer',
  });

  const handleScheduleInterview = async (
    candidateId: string,
    candidateName: string,
    jobId: string,
    jobTitle: string,
    interviewDate: Date
  ) => {
    try {
      // Schedule interview in database
      const response = await interviewAPI.scheduleInterview({
        candidateId,
        jobId,
        scheduledDate: interviewDate,
      });

      // Request candidate to accept interview
      requestAction('candidate', 'interview-scheduled', {
        candidateId,
        candidateName,
        jobTitle,
        interviewDate: interviewDate.toISOString(),
        interviewId: response.data.data.id,
      });

      // Notify admin
      notifyStatusChange('interview-scheduled', {
        candidateId,
        jobId,
        interviewDate: interviewDate.toISOString(),
      });

      sendNotification(
        `Interview scheduled with ${candidateName} for ${jobTitle}`,
        'high'
      );

      toast.success('Interview scheduled successfully');
    } catch (error) {
      sendNotification('Failed to schedule interview', 'critical');
      toast.error('Failed to schedule interview');
    }
  };

  return (
    <button onClick={() => handleScheduleInterview(...)}>
      Schedule Interview
    </button>
  );
};
```

**Candidate Dashboard:**
```typescript
const CandidateDashboard: React.FC = () => {
  const { broadcastDataUpdate } = useDashboardCommunication({
    role: 'candidate',
    onActionRequired: (event) => {
      if (event.payload.action === 'interview-scheduled') {
        const { jobTitle, interviewDate, interviewId } = event.payload.data;
        
        // Refresh interviews list
        fetchDashboardData();
        
        // Show prominent notification
        toast.success(
          `Interview scheduled for ${jobTitle} on ${new Date(interviewDate).toLocaleDateString()}`
        );
        
        // Optionally navigate to interview details
        // navigate(`/candidate/interviews/${interviewId}`);
      }
    },
  });

  return (
    // Dashboard UI with interview list
  );
};
```

**Admin Dashboard:**
```typescript
const AdminDashboard: React.FC = () => {
  const { broadcastDataUpdate } = useDashboardCommunication({
    role: 'admin',
    onStatusChange: (event) => {
      if (event.payload.status === 'interview-scheduled') {
        // Refresh admin dashboard to show new interview
        fetchDashboardData();
      }
    },
  });

  return (
    // Dashboard UI showing all interviews
  );
};
```

---

## Example 3: Application Status Update

### Scenario
Employer updates application status (shortlist/reject). Candidate should be notified.

### Implementation

**Employer Dashboard:**
```typescript
const EmployerDashboard: React.FC = () => {
  const { requestAction, notifyStatusChange } = useDashboardCommunication({
    role: 'employer',
  });

  const handleUpdateApplicationStatus = async (
    applicationId: string,
    candidateId: string,
    candidateName: string,
    jobTitle: string,
    newStatus: 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED'
  ) => {
    try {
      // Update in database
      await applicationAPI.updateApplicationStatus(applicationId, newStatus);

      // Notify candidate
      requestAction('candidate', 'application-status-updated', {
        applicationId,
        candidateId,
        candidateName,
        jobTitle,
        newStatus,
        updatedAt: new Date().toISOString(),
      });

      // Notify admin
      notifyStatusChange('application-status-updated', {
        applicationId,
        candidateId,
        newStatus,
      });

      toast.success(`Application ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  return (
    <div>
      <button onClick={() => handleUpdateApplicationStatus(..., 'SHORTLISTED')}>
        Shortlist
      </button>
      <button onClick={() => handleUpdateApplicationStatus(..., 'REJECTED')}>
        Reject
      </button>
    </div>
  );
};
```

**Candidate Dashboard:**
```typescript
const CandidateDashboard: React.FC = () => {
  const { broadcastDataUpdate } = useDashboardCommunication({
    role: 'candidate',
    onActionRequired: (event) => {
      if (event.payload.action === 'application-status-updated') {
        const { jobTitle, newStatus } = event.payload.data;
        
        // Refresh applications
        fetchDashboardData();
        
        // Show appropriate notification
        if (newStatus === 'SHORTLISTED') {
          toast.success(`You've been shortlisted for ${jobTitle}!`);
        } else if (newStatus === 'REJECTED') {
          toast.info(`Your application for ${jobTitle} was not selected`);
        } else if (newStatus === 'ACCEPTED') {
          toast.success(`Congratulations! You've been accepted for ${jobTitle}!`);
        }
      }
    },
  });

  return (
    // Dashboard UI with applications list
  );
};
```

---

## Example 4: Payment Processing

### Scenario
Payment is processed. All dashboards should be notified of the transaction.

### Implementation

**Payment Service (triggered from any dashboard):**
```typescript
const handlePaymentSuccess = async (
  paymentData: any,
  userId: string,
  userRole: 'employer' | 'candidate'
) => {
  const { broadcastDataUpdate, notifyStatusChange, sendNotification } = useDashboardCommunication({
    role: userRole,
  });

  try {
    // Process payment
    const response = await paymentAPI.verifyPayment(paymentData.txRef);

    // Broadcast to all dashboards
    broadcastDataUpdate({
      ...paymentData,
      status: 'completed',
      processedAt: new Date().toISOString(),
    });

    // Notify status change
    notifyStatusChange('payment-processed', {
      userId,
      amount: paymentData.amount,
      reference: paymentData.txRef,
      timestamp: new Date().toISOString(),
    });

    // Send notification
    sendNotification(
      `Payment of ${paymentData.amount} processed successfully`,
      'high'
    );

    toast.success('Payment processed successfully');
  } catch (error) {
    sendNotification('Payment processing failed', 'critical');
    toast.error('Payment processing failed');
  }
};
```

**Admin Dashboard:**
```typescript
const AdminDashboard: React.FC = () => {
  const { broadcastDataUpdate } = useDashboardCommunication({
    role: 'admin',
    onStatusChange: (event) => {
      if (event.payload.status === 'payment-processed') {
        // Refresh revenue analytics
        fetchDashboardData();
        
        console.log('Payment processed:', event.payload);
      }
    },
  });

  return (
    // Dashboard showing payment analytics
  );
};
```

---

## Example 5: System-Wide Synchronization

### Scenario
Critical data change requires all dashboards to refresh.

### Implementation

**Any Dashboard:**
```typescript
const handleCriticalChange = async () => {
  const { requestSync, sendNotification } = useDashboardCommunication({
    role: 'admin', // or any role
  });

  try {
    // Make critical change
    await adminAPI.updateSystemSettings(newSettings);

    // Request all dashboards to sync
    requestSync('all');

    // Send critical notification
    sendNotification('System settings updated. Refreshing all dashboards...', 'critical');

    toast.success('System updated successfully');
  } catch (error) {
    sendNotification('Critical update failed', 'critical');
    toast.error('Update failed');
  }
};
```

**All Dashboards:**
```typescript
const Dashboard: React.FC = () => {
  const { requestSync } = useDashboardCommunication({
    role: 'admin', // or 'employer' or 'candidate'
    onSyncRequest: (event) => {
      console.log('Sync requested by:', event.source);
      
      // Refresh dashboard data
      fetchDashboardData();
      
      // Show notification
      toast.info('Dashboard synchronized');
    },
  });

  return (
    // Dashboard UI
  );
};
```

---

## Example 6: Error Handling and Recovery

### Scenario
Handle errors gracefully and notify other dashboards.

### Implementation

```typescript
const Dashboard: React.FC = () => {
  const { sendNotification, notifyStatusChange } = useDashboardCommunication({
    role: 'admin',
  });

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getAdminDashboard();
      setData(response.data.data);
    } catch (error) {
      // Notify other dashboards of error
      sendNotification(
        'Admin dashboard failed to load. Please refresh.',
        'critical'
      );

      // Notify status change
      notifyStatusChange('dashboard-error', {
        dashboard: 'admin',
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      // Log error
      console.error('Dashboard error:', error);
    }
  };

  return (
    // Dashboard UI with error handling
  );
};
```

---

## Example 7: Monitoring Dashboard Communication

### Scenario
Monitor all dashboard communications for debugging.

### Implementation

```typescript
import dashboardService from '../../services/dashboardService';

const DashboardMonitor: React.FC = () => {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [health, setHealth] = useState(dashboardService.getHealthStatus());

  useEffect(() => {
    // Listen to all events
    dashboardService.onAnyEvent((event) => {
      setEvents((prev) => [...prev.slice(-49), event]); // Keep last 50
      setHealth(dashboardService.getHealthStatus());
    });

    return () => {
      dashboardService.off('dashboard:event', () => {});
    };
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2 className="text-lg font-bold mb-4">Dashboard Communication Monitor</h2>
      
      {/* Health Status */}
      <div className="mb-4 p-3 bg-white rounded">
        <p className="font-semibold">Service Health</p>
        <p>Registered Dashboards: {health.registeredDashboards}</p>
        <p>Event History Size: {health.eventHistorySize}</p>
        <p>Status: {health.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}</p>
      </div>

      {/* Event Log */}
      <div className="p-3 bg-white rounded">
        <p className="font-semibold mb-2">Recent Events</p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.map((event, idx) => (
            <div key={idx} className="text-sm p-2 bg-gray-50 rounded border">
              <p className="font-mono">
                [{event.source}] {event.type} → {event.target || 'all'}
              </p>
              <p className="text-gray-600 text-xs">
                {new Date(event.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardMonitor;
```

---

## Best Practices Summary

1. **Always handle errors** - Use try-catch and send notifications
2. **Use appropriate priorities** - Match event importance to priority level
3. **Keep payloads small** - Only send necessary data
4. **Clean up listeners** - Hook handles this automatically
5. **Monitor communication** - Use event history for debugging
6. **Test workflows** - Verify communication between dashboards
7. **Document changes** - Keep track of new event types
8. **Performance** - Monitor event history size and clean up if needed
