# Enhanced Dashboards - Quick Reference Card

## 🚀 Quick Start

### Access Dashboards
- **Candidate**: `/candidate/dashboard-enhanced`
- **Employer**: `/employer/dashboard-enhanced`
- **Admin**: `/admin/dashboard-enhanced`

### Menu Navigation
- Candidate: "Enhanced Dashboard" (sidebar)
- Employer: "Talent Discovery" (sidebar)
- Admin: "System Health" (sidebar)

---

## 📊 Candidate Dashboard

### What You See
1. **Profile Strength** - Your profile completion (0-100%)
2. **AI Scores** - Your interview performance
3. **Applications** - All job applications with status

### Key Metrics
- Profile Strength: 0-100%
- Average Score: 0-100%
- Total Applications: Count
- Completed Interviews: Count

### Color Coding
- 🟢 Green: 80-100% (Excellent)
- 🔵 Blue: 60-79% (Good)
- 🟡 Yellow: 40-59% (Fair)
- 🔴 Red: <40% (Poor)

### Actions
- View recommendations to improve profile
- Check interview scores
- Track application status
- Monitor interview history

---

## 👥 Employer Dashboard

### What You See
1. **Applicants List** - Candidates sorted by AI score
2. **Video & Resume** - Side-by-side viewer

### How to Use
1. Enter Job ID
2. View applicants (sorted by score)
3. Click applicant to view video + resume
4. Download resume if needed

### Sorting Options
- By AI Score (default, highest first)
- By Name (A-Z)

### Scores Displayed
- AI Score: Overall performance
- Technical Score: Technical skills
- Communication Score: Communication ability

### Actions
- Sort applicants
- Watch interview video
- Download resume
- Compare candidates

---

## ⚙️ Admin Dashboard

### What You See
1. **System Health** - Server status & memory
2. **API Usage** - Top endpoints & errors
3. **User Growth** - Registration trends
4. **Error Tracking** - Critical errors

### Key Metrics
- Database: Connected/Disconnected
- Memory: Heap usage %
- API Calls: Last 24 hours
- Total Users: All time
- New Users: This month
- Critical Errors: Count

### Monitoring
- System Health: Auto-refresh 30s
- Error Tracking: Real-time
- User Growth: Daily updates
- API Usage: Hourly updates

### Actions
- Monitor system health
- Review API performance
- Track user growth
- Filter and review errors

---

## 🔐 Security & Access

### Role-Based Access
- **Candidate**: Candidate dashboard only
- **Employer**: Employer dashboard only
- **Admin**: All dashboards

### Authentication
- Login required
- JWT token-based
- Token auto-refresh
- Logout clears session

### Authorization
- Middleware-level checks
- Route-level protection
- Component-level verification
- Activity logging

---

## 📱 Device Support

### Desktop
- Full multi-column layout
- All features available
- Optimal performance

### Tablet
- Two-column layout
- Touch-friendly controls
- Responsive design

### Mobile
- Single column layout
- Optimized for small screens
- Touch-optimized buttons

---

## ⚡ Performance Tips

1. **Faster Loading**
   - Clear browser cache
   - Close unused tabs
   - Use modern browser

2. **Better Performance**
   - Use filters to narrow results
   - Refresh periodically
   - Monitor memory usage

3. **Troubleshooting**
   - Refresh page
   - Clear cache
   - Try different browser
   - Check internet connection

---

## 🎯 Common Tasks

### Candidate
```
View Profile Strength
→ Dashboard → Profile Strength Indicator

Check Interview Scores
→ Dashboard → AI Score Visualization

Track Applications
→ Dashboard → Application Tracker
```

### Employer
```
View Applicants
→ Talent Discovery → Enter Job ID → View List

Watch Interview
→ Click Applicant → Video Player

Download Resume
→ Click Applicant → Download Button
```

### Admin
```
Check System Health
→ System Health & Analytics → System Health

Review API Usage
→ System Health & Analytics → API Usage

Monitor Errors
→ System Health & Analytics → Error Tracking
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Dashboard not loading | Refresh page, clear cache |
| Video not playing | Check bandwidth, try download |
| Scores not updating | Refresh page, wait 30 seconds |
| Permission denied | Check user role, verify login |
| Slow performance | Close tabs, clear cache, refresh |
| API errors | Check internet, verify server status |

---

## 📞 Support

### Quick Help
- Check this guide
- Review help center
- Contact support team

### Report Issues
- Screenshot the error
- Note the time it occurred
- Describe what you were doing
- Contact admin

---

## 🎓 Learning Resources

- **User Guide**: ENHANCED_DASHBOARDS_GUIDE.md
- **Technical Docs**: ENHANCED_DASHBOARDS_IMPLEMENTATION.md
- **Deployment**: DEPLOYMENT_CHECKLIST.md
- **Full Summary**: IMPLEMENTATION_SUMMARY.md

---

## 📋 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| R | Refresh dashboard |
| S | Sort applicants (Employer) |
| F | Filter errors (Admin) |
| ? | Show help |

---

## 🌐 API Endpoints

### Candidate
- `GET /api/dashboard-enhanced/candidate`

### Employer
- `GET /api/dashboard-enhanced/employer`
- `GET /api/dashboard-enhanced/employer/job/:jobId/applicants`
- `GET /api/dashboard-enhanced/employer/applicant/:applicantId/video-resume`

### Admin
- `GET /api/dashboard-enhanced/admin`
- `GET /api/dashboard-enhanced/admin/system-health`

---

## 📊 Data Refresh Rates

| Component | Refresh Rate |
|-----------|--------------|
| System Health | 30 seconds |
| API Usage | 1 minute |
| User Growth | 1 hour |
| Error Tracking | Real-time |
| Applicants | On demand |
| Profile Strength | On demand |

---

## ✅ Checklist

### Before Using
- [ ] Logged in
- [ ] Correct role
- [ ] Internet connected
- [ ] Browser updated

### During Use
- [ ] Check data accuracy
- [ ] Monitor performance
- [ ] Report issues
- [ ] Provide feedback

### After Use
- [ ] Logout
- [ ] Clear sensitive data
- [ ] Close browser tabs
- [ ] Report any issues

---

**Version**: 1.0
**Last Updated**: April 18, 2026
**Status**: Production Ready
