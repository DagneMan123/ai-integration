# Enhanced Dashboards - User Guide

## Quick Start

### For Candidates
1. Navigate to **Enhanced Dashboard** from the sidebar menu
2. View your **Profile Strength** - Complete missing fields to improve your score
3. Check **AI Interview Scores** - See your performance across all interviews
4. Track **Applications** - Monitor status of all job applications

### For Employers
1. Navigate to **Talent Discovery** from the sidebar menu
2. Enter a **Job ID** to view applicants
3. Applicants are automatically sorted by **AI Score** (highest first)
4. Click on an applicant to view their **Video Interview** and **Resume**
5. Use the sort buttons to switch between score and name sorting

### For Admins
1. Navigate to **System Health & Analytics** from the sidebar menu
2. Monitor **System Health** - Check database connection and memory usage
3. Review **API Usage** - See top endpoints and error rates
4. Track **User Growth** - Monitor new registrations and platform growth
5. Check **Error Tracking** - Review critical errors and alerts

## Features by Dashboard

### Candidate Dashboard

#### Profile Strength Indicator
- **Score**: 0-100% completion
- **Level**: EXCELLENT (80-100%), GOOD (60-79%), FAIR (40-59%), POOR (<40%)
- **Recommendations**: Actionable tips to improve profile
- **Fields Tracked**: Profile picture, resume, skills, experience, etc.

#### AI Score Visualization
- **Average Score**: Your overall interview performance
- **Completed Interviews**: Number of finished interviews
- **Total Interviews**: All interviews (completed + pending)
- **Recent Scores**: Last 5 interviews with progress bars
- **Color Coding**: Green (80+), Blue (60-79), Yellow (40-59), Red (<40)

#### Application Tracker
- **Status Indicators**: ACCEPTED ✓, REJECTED ✗, PENDING ⏱
- **AI Score**: Your score for each application
- **Company & Job**: Full job details
- **Applied Date**: When you applied
- **Sort**: By date (newest first)

### Employer Dashboard

#### Applicants List
- **Default Sort**: By AI Score (highest first)
- **Alternative Sort**: By candidate name (A-Z)
- **Scores Displayed**:
  - AI Score: Overall interview performance
  - Technical Score: Technical skills assessment
  - Communication Score: Communication ability
- **Status**: Interview status (COMPLETED, IN_PROGRESS, PENDING)
- **Profile Picture**: Candidate avatar
- **Contact**: Email address

#### Video & Resume Viewer
- **Video Player**: Full controls (play, pause, seek, volume)
- **Resume**: Download or view in new tab
- **Interview Score**: Overall performance score
- **Side-by-Side Layout**: Compare video and resume simultaneously
- **Responsive**: Works on desktop and tablet

### Admin Dashboard

#### System Health
- **Status**: HEALTHY or UNHEALTHY
- **Database**: Connected or Disconnected
- **Uptime**: Server running time (days, hours, minutes)
- **Memory Usage**: Heap memory utilization with percentage
- **Auto-Refresh**: Updates every 30 seconds

#### API Usage Analytics
- **Total Calls**: API requests in last 24 hours
- **Avg Response Time**: Average latency in milliseconds
- **Total Errors**: Failed requests
- **Top Endpoints**: Most used API endpoints with:
  - Call count
  - Average response time
  - Error rate percentage
  - Error alerts (red if >5%)

#### User Growth Chart
- **Total Users**: All registered users
- **New This Month**: New registrations this month
- **Growth Rate**: Month-over-month percentage
- **Growth Trend**: Visual bar chart showing daily growth
- **User Breakdown**: Candidates vs Employers split

#### Error Tracking
- **Total Errors**: All errors in last 24 hours
- **Critical Errors**: Requires immediate attention
- **Unresolved**: Pending resolution
- **Severity Levels**:
  - CRITICAL: Red - Immediate action needed
  - HIGH: Orange - Important
  - MEDIUM: Yellow - Monitor
  - LOW: Blue - Informational
- **Filters**: All, Critical Only, Unresolved
- **Details**: Error message, endpoint, timestamp, user ID

## Color Coding Reference

### Score Colors
- 🟢 **Green (80-100%)**: Excellent
- 🔵 **Blue (60-79%)**: Good
- 🟡 **Yellow (40-59%)**: Fair
- 🔴 **Red (<40%)**: Poor

### Status Colors
- 🟢 **Green**: ACCEPTED, COMPLETED, HEALTHY
- 🔵 **Blue**: IN_PROGRESS, PENDING
- 🟡 **Yellow**: FAIR, MEDIUM
- 🔴 **Red**: REJECTED, CRITICAL, UNHEALTHY

## Tips & Best Practices

### For Candidates
1. **Improve Profile Strength**: Follow recommendations to reach 100%
2. **Review Scores**: Check feedback on low-scoring interviews
3. **Track Applications**: Monitor status regularly
4. **Practice**: Use practice mode to improve scores before official interviews

### For Employers
1. **Sort by Score**: Always check highest-scoring candidates first
2. **Watch Videos**: Review video responses for communication skills
3. **Check Resume**: Verify qualifications match job requirements
4. **Compare Candidates**: Use side-by-side viewer to compare multiple candidates

### For Admins
1. **Monitor Health**: Check system health daily
2. **Review Errors**: Investigate critical errors immediately
3. **Track Growth**: Monitor user growth trends
4. **Optimize API**: Use API analytics to identify slow endpoints

## Troubleshooting

### Dashboard Not Loading
- Check internet connection
- Clear browser cache
- Refresh the page
- Try a different browser

### Video Not Playing
- Check video file format (MP4 recommended)
- Ensure sufficient bandwidth
- Try downloading the video instead
- Check browser video codec support

### Scores Not Updating
- Refresh the page
- Wait for auto-refresh (30 seconds)
- Check if interview is completed
- Verify database connection

### Permission Denied
- Verify your user role
- Check if you're logged in
- Ensure you have access to the resource
- Contact admin if needed

## Keyboard Shortcuts

- `R` - Refresh dashboard
- `S` - Sort applicants (Employer only)
- `F` - Filter errors (Admin only)
- `?` - Show help (coming soon)

## Mobile Support

All dashboards are fully responsive:
- **Mobile**: Single column layout
- **Tablet**: Two column layout
- **Desktop**: Full multi-column layout

## Performance Tips

1. **Reduce Data**: Filter by date range when possible
2. **Close Unused Tabs**: Reduces memory usage
3. **Clear Cache**: Improves load times
4. **Use Filters**: Narrow down results for faster loading

## Support

For issues or questions:
1. Check this guide first
2. Review the help center
3. Contact support team
4. Check system logs (Admin only)

---
**Last Updated**: April 18, 2026
**Version**: 1.0
