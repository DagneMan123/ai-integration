# Saved Jobs & Job Alerts - Integration Guide

## Overview
This guide explains how to integrate the Saved Jobs and Job Alerts features with other parts of the application.

## 1. Jobs Page Integration

### Add Save Button to Job Cards
Update `client/src/pages/Jobs.tsx` to include a save button:

```typescript
import { Bookmark } from 'lucide-react';
import savedJobService from '../services/savedJobService';

const JobCard = ({ job }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveJob = async () => {
    try {
      if (isSaved) {
        await savedJobService.removeSavedJob(job.id);
        setIsSaved(false);
      } else {
        await savedJobService.saveJob(job.id);
        setIsSaved(true);
      }
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  return (
    <div className="job-card">
      {/* Job details */}
      <button onClick={handleSaveJob}>
        <Bookmark className={isSaved ? 'fill-current' : ''} />
      </button>
    </div>
  );
};
```

## 2. Job Details Page Integration

### Show Save Status
Update `client/src/pages/JobDetails.tsx`:

```typescript
import savedJobService from '../services/savedJobService';

const JobDetails = ({ jobId }) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [jobId]);

  const checkIfSaved = async () => {
    try {
      const { isSaved } = await savedJobService.isJobSaved(jobId);
      setIsSaved(isSaved);
    } catch (error) {
      console.error('Failed to check if job is saved');
    }
  };

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        await savedJobService.removeSavedJob(jobId);
      } else {
        await savedJobService.saveJob(jobId);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  return (
    <div>
      {/* Job details */}
      <button onClick={handleToggleSave}>
        {isSaved ? 'Remove from Saved' : 'Save Job'}
      </button>
    </div>
  );
};
```

## 3. Dashboard Integration

### Add Saved Jobs Widget
Create `client/src/components/SavedJobsWidget.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import savedJobService from '../services/savedJobService';

const SavedJobsWidget: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const jobs = await savedJobService.getSavedJobs();
      setSavedJobs(jobs.slice(0, 5)); // Show top 5
    } catch (error) {
      console.error('Failed to fetch saved jobs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="flex items-center gap-2 mb-4">
        <Bookmark className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold">Saved Jobs</h3>
      </div>
      {savedJobs.length > 0 ? (
        <div className="space-y-2">
          {savedJobs.map(sj => (
            <div key={sj.id} className="text-sm">
              <p className="font-medium">{sj.job.title}</p>
              <p className="text-gray-500">{sj.job.company.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No saved jobs yet</p>
      )}
    </div>
  );
};

export default SavedJobsWidget;
```

### Add Job Alerts Widget
Create `client/src/components/JobAlertsWidget.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import jobAlertService from '../services/jobAlertService';

const JobAlertsWidget: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await jobAlertService.getJobAlerts();
      setAlerts(data.slice(0, 5)); // Show top 5
    } catch (error) {
      console.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold">Active Alerts</h3>
      </div>
      {alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div key={alert.id} className="text-sm">
              <p className="font-medium">{alert.keyword}</p>
              {alert.location && <p className="text-gray-500">{alert.location}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No active alerts</p>
      )}
    </div>
  );
};

export default JobAlertsWidget;
```

## 4. Sidebar Integration

### Update Candidate Sidebar
Update `client/src/config/menuConfig.tsx` to ensure menu items are properly configured:

```typescript
export const candidateMenu = [
  // ... other menu items
  {
    label: 'Saved Jobs',
    path: '/candidate/saved-jobs',
    icon: 'Bookmark',
  },
  {
    label: 'Job Alerts',
    path: '/candidate/job-alerts',
    icon: 'Bell',
  },
  // ... other menu items
];
```

## 5. Notifications Integration

### Email Notifications for Job Alerts
Create `server/services/jobAlertNotificationService.js`:

```javascript
const nodemailer = require('nodemailer');
const prisma = require('../lib/prisma');

exports.checkAndNotifyAlerts = async () => {
  try {
    const alerts = await prisma.jobAlert.findMany({
      where: { isActive: true },
      include: { user: true },
    });

    for (const alert of alerts) {
      // Find matching jobs
      const matchingJobs = await prisma.job.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { title: { contains: alert.keyword, mode: 'insensitive' } },
            { description: { contains: alert.keyword, mode: 'insensitive' } },
          ],
          ...(alert.location && { location: { contains: alert.location } }),
          ...(alert.experienceLevel && { experienceLevel: alert.experienceLevel }),
          ...(alert.jobType && { jobType: alert.jobType }),
        },
      });

      if (matchingJobs.length > 0) {
        // Send email notification
        await sendAlertEmail(alert.user.email, alert.keyword, matchingJobs);
        
        // Update last triggered
        await prisma.jobAlert.update({
          where: { id: alert.id },
          data: { lastTriggered: new Date() },
        });
      }
    }
  } catch (error) {
    console.error('Error checking job alerts:', error);
  }
};

const sendAlertEmail = async (email, keyword, jobs) => {
  // Implement email sending logic
};
```

## 6. Analytics Integration

### Track Saved Jobs and Alerts
Create `server/services/jobAlertAnalyticsService.js`:

```javascript
const prisma = require('../lib/prisma');

exports.getAlertStats = async (userId) => {
  const totalAlerts = await prisma.jobAlert.count({
    where: { userId },
  });

  const activeAlerts = await prisma.jobAlert.count({
    where: { userId, isActive: true },
  });

  const totalSavedJobs = await prisma.savedJob.count({
    where: { userId },
  });

  return {
    totalAlerts,
    activeAlerts,
    totalSavedJobs,
  };
};

exports.getAlertPerformance = async (alertId) => {
  const alert = await prisma.jobAlert.findUnique({
    where: { id: alertId },
    include: {
      _count: {
        select: { job: true },
      },
    },
  });

  return {
    keyword: alert.keyword,
    matchingJobs: alert._count.job,
    lastTriggered: alert.lastTriggered,
    isActive: alert.isActive,
  };
};
```

## 7. Search Integration

### Enhanced Job Search with Alerts
Update `client/src/pages/Jobs.tsx` to suggest creating alerts:

```typescript
const handleSearch = (query: string) => {
  // ... search logic
  
  // Show suggestion to create alert
  if (results.length === 0) {
    showSuggestion(`Create an alert for "${query}" to get notified when new jobs match`);
  }
};
```

## 8. Mobile Responsiveness

### Ensure Mobile Compatibility
Both pages are already mobile-responsive with:
- Responsive grid layouts
- Touch-friendly buttons
- Mobile-optimized forms
- Proper spacing and sizing

## 9. Accessibility

### ARIA Labels and Semantic HTML
Both pages use:
- Semantic HTML elements
- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigation support

## 10. Performance Optimization

### Lazy Loading
```typescript
const SavedJobs = lazy(() => import('./SavedJobs'));
const JobAlerts = lazy(() => import('./JobAlerts'));
```

### Pagination (Future Enhancement)
```typescript
const [page, setPage] = useState(1);
const [pageSize] = useState(10);

const fetchSavedJobs = async () => {
  const data = await apiService.get(
    `/saved-jobs?page=${page}&pageSize=${pageSize}`
  );
  setSavedJobs(data);
};
```

## Testing Checklist

- [ ] Save job from Jobs page
- [ ] View saved job in Saved Jobs page
- [ ] Remove saved job
- [ ] Search saved jobs
- [ ] Create job alert with all filters
- [ ] Create job alert with only keyword
- [ ] Update job alert
- [ ] Delete job alert
- [ ] Check if job is saved
- [ ] Get matching jobs for alert
- [ ] Test on mobile devices
- [ ] Test keyboard navigation
- [ ] Test with screen readers

## Deployment Checklist

- [ ] Run database migration
- [ ] Restart server
- [ ] Clear browser cache
- [ ] Test all features in production
- [ ] Monitor error logs
- [ ] Verify API endpoints are accessible
- [ ] Test with different user roles

## Troubleshooting

### Common Issues

**Issue**: Saved jobs not persisting
- Check database connection
- Verify migration ran successfully
- Check browser console for errors

**Issue**: Job alerts not triggering
- Verify alert is active
- Check keyword matching logic
- Review server logs

**Issue**: API returns 401 Unauthorized
- Verify user is authenticated
- Check token expiration
- Refresh authentication

## Future Enhancements

1. **Bulk Operations** - Save/unsave multiple jobs
2. **Collections** - Organize saved jobs into folders
3. **Sharing** - Share saved jobs with others
4. **Export** - Export to PDF/CSV
5. **Recommendations** - AI-powered job recommendations
6. **Frequency Control** - Set alert notification frequency
7. **Smart Matching** - ML-based job matching
8. **Webhooks** - Real-time alert notifications

## Support

For questions or issues:
1. Review the main documentation
2. Check API responses in DevTools
3. Review server logs
4. Contact development team

---

**Last Updated**: 2024
**Status**: ✅ Ready for Integration
