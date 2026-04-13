# AI Video Interview - Quick Reference Guide

## 🚀 Quick Start (5 minutes)

### 1. Start Backend
```bash
cd server
npm start
```
Server runs on `http://localhost:5000`

### 2. Start Frontend
```bash
cd client
npm start
```
Client runs on `http://localhost:3000`

### 3. Login & Test
- Navigate to `http://localhost:3000`
- Login with candidate credentials
- Go to Interviews section
- Start a video interview

## 📁 Key Files

| File | Purpose | Status |
|------|---------|--------|
| `server/controllers/aiInterviewController.js` | Video interview logic | ✅ NEW |
| `server/routes/ai.js` | API endpoints | ✅ UPDATED |
| `server/middleware/upload.js` | File upload handling | ✅ UPDATED |
| `client/src/components/AIVideoInterview.tsx` | Video UI component | ✅ UPDATED |
| `client/src/pages/candidate/InterviewSession.tsx` | Interview page | ✅ UPDATED |
| `client/src/services/aiInterviewService.ts` | API client | ✅ EXISTING |

## 🔌 API Endpoints

### Generate Questions
```bash
POST /api/ai/generate-questions
Body: { jobId: 1, difficulty: "medium", count: 5 }
```

### Start Interview
```bash
POST /api/ai/video-interview/start
Body: { interviewId: 1 }
```

### Submit Video
```bash
POST /api/ai/video-interview/submit-response
Body: FormData with video file
```

### Get Analysis
```bash
GET /api/ai/video-interview/1/analysis/0
```

### Complete Interview
```bash
POST /api/ai/video-interview/1/complete
```

### Get Report
```bash
GET /api/ai/video-interview/1/report
```

## 🎥 Video Interview Flow

```
1. Start Interview
   ↓
2. Click "Start Camera"
   ↓
3. Read Question
   ↓
4. Click "Start Recording"
   ↓
5. Speak Answer
   ↓
6. Click "Stop Recording"
   ↓
7. Click "Submit Response"
   ↓
8. View AI Analysis
   ↓
9. Next Question or Complete
```

## 🛡️ Anti-Cheat Events

| Event | Severity | Action |
|-------|----------|--------|
| Tab Switch | HIGH | Logged immediately |
| Copy-Paste | HIGH | Logged immediately |
| Window Blur | MEDIUM | Logged on focus loss |
| No Face | MEDIUM | Logged if detected |
| Multiple Faces | HIGH | Logged if detected |
| Background Change | LOW | Logged if detected |

## 📊 Scoring Breakdown

- **Overall Score**: Average of all metrics (0-100)
- **Technical Score**: Technical knowledge assessment
- **Communication Score**: Clarity and articulation
- **Problem-Solving Score**: Approach and methodology
- **Soft Skills Score**: Professionalism and confidence

## 🐛 Troubleshooting

### Camera Not Working
```
1. Check browser permissions
2. Allow camera access
3. Restart browser
4. Try different browser
```

### Upload Fails
```
1. Check file size (<100MB)
2. Check internet connection
3. Check server logs
4. Verify upload directory exists
```

### Analysis Not Showing
```
1. Check network tab (F12)
2. Verify API response
3. Check server logs
4. Refresh page
```

## 📝 Database Queries

### View Interview Records
```sql
SELECT id, candidate_id, status, overall_score, created_at 
FROM interviews 
WHERE interview_mode = 'video' 
ORDER BY created_at DESC;
```

### View Anti-Cheat Events
```sql
SELECT id, anti_cheat_data 
FROM interviews 
WHERE anti_cheat_data IS NOT NULL;
```

### View Video Responses
```sql
SELECT id, responses 
FROM interviews 
WHERE responses IS NOT NULL;
```

## 🔐 Security Checklist

- [x] All endpoints require JWT token
- [x] User authorization verified
- [x] File uploads validated
- [x] Input sanitized
- [x] Error messages safe
- [x] Sensitive data protected

## 📈 Performance Tips

1. **Optimize Video Quality**
   - Reduce resolution for slower connections
   - Use WebM codec (already configured)

2. **Improve Upload Speed**
   - Compress video before upload
   - Use chunked upload for large files

3. **Enhance Analysis Speed**
   - Cache results
   - Use async processing
   - Implement background jobs

## 🎨 UI Customization

### Colors
- Primary: Blue (#2563eb)
- Success: Emerald (#10b981)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)

### Components
- Buttons: Rounded with hover effects
- Cards: Gradient backgrounds
- Badges: Color-coded by type
- Icons: Lucide React icons

## 📚 Documentation Files

| File | Content |
|------|---------|
| `AI_VIDEO_INTERVIEW_IMPLEMENTATION.md` | Detailed implementation guide |
| `VIDEO_INTERVIEW_QUICK_START.md` | Step-by-step setup and testing |
| `VIDEO_INTERVIEW_ARCHITECTURE.md` | System architecture and design |
| `AI_VIDEO_INTERVIEW_SUMMARY.md` | Project overview and status |
| `IMPLEMENTATION_CHECKLIST.md` | Complete checklist of all items |
| `QUICK_REFERENCE.md` | This file - quick lookup |

## 🔄 Common Tasks

### Add New Question Type
```javascript
// In aiInterviewController.js
const generateMockQuestions = (jobTitle, count, difficulty) => {
  // Add your custom questions here
};
```

### Customize AI Analysis
```javascript
// In aiInterviewController.js
const analysis = {
  score: calculateScore(),
  feedback: generateFeedback(),
  metrics: calculateMetrics()
};
```

### Change Video Codec
```javascript
// In AIVideoInterview.tsx
const mediaRecorder = new MediaRecorder(streamRef.current, {
  mimeType: 'video/webm;codecs=vp9' // Change codec here
});
```

## 🚨 Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Verify JWT token |
| 403 | Forbidden | Check user permissions |
| 404 | Not Found | Verify resource ID |
| 500 | Server Error | Check server logs |

## 📞 Support Resources

- **Server Logs**: `server/logs/combined.log`
- **Error Logs**: `server/logs/error.log`
- **Browser Console**: F12 → Console
- **Network Tab**: F12 → Network
- **Database**: PostgreSQL on localhost:5432

## ✅ Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] No database errors
- [ ] Video uploads working
- [ ] AI analysis functional
- [ ] Anti-cheat logging
- [ ] Reports generating
- [ ] Performance acceptable
- [ ] Security validated
- [ ] Documentation complete

## 🎯 Success Criteria

✅ Video recording works
✅ Upload completes successfully
✅ AI analysis displays
✅ Scores calculated correctly
✅ Anti-cheat events logged
✅ Report generates
✅ No errors in logs
✅ Performance acceptable

## 📞 Quick Help

**Q: How do I test video recording?**
A: Start interview → Click "Start Camera" → "Start Recording" → Speak → "Stop Recording"

**Q: Where are videos stored?**
A: `server/uploads/videos/` (local) or cloud storage (production)

**Q: How do I view anti-cheat logs?**
A: Check `interviews.anti_cheat_data` in database

**Q: Can I customize questions?**
A: Yes, edit `generateMockQuestions()` in aiInterviewController.js

**Q: How do I enable real AI analysis?**
A: Replace mock analysis with real AI service (OpenAI, Google Cloud, etc.)

---

**Last Updated**: April 11, 2024
**Status**: ✅ Ready for Use
**Version**: 1.0
