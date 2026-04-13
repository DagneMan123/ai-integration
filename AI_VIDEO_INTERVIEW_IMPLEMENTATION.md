# AI Video Interview Implementation Guide

## Overview
This document outlines the complete implementation of AI-powered video interviews with real-time feedback, anti-cheat detection, and professional UI.

## What's Been Implemented

### 1. Backend Components

#### AI Interview Controller (`server/controllers/aiInterviewController.js`)
- **startVideoInterview**: Initiates a video interview session
- **submitVideoResponse**: Handles video file uploads and storage
- **analyzeVideoResponse**: Provides AI analysis of video responses
- **getRealTimeFeedback**: Delivers real-time feedback during interview
- **completeVideoInterview**: Finalizes interview and calculates scores
- **getInterviewReport**: Generates comprehensive interview report
- **reportSuspiciousActivity**: Logs anti-cheat events
- **getInterviewInsights**: Provides personalized insights and recommendations
- **generateQuestions**: Creates AI-powered interview questions based on job

#### AI Routes (`server/routes/ai.js`)
All endpoints are protected with `authenticateToken` middleware:
- `POST /api/ai/generate-questions` - Generate interview questions
- `POST /api/ai/video-interview/start` - Start video session
- `POST /api/ai/video-interview/submit-response` - Submit video response
- `GET /api/ai/video-interview/:interviewId/analysis/:questionId` - Get AI analysis
- `GET /api/ai/video-interview/:interviewId/feedback` - Get real-time feedback
- `POST /api/ai/video-interview/:interviewId/complete` - Complete interview
- `GET /api/ai/video-interview/:interviewId/report` - Get interview report
- `POST /api/ai/anti-cheat/report` - Report suspicious activity
- `GET /api/ai/interview/:interviewId/insights` - Get interview insights

### 2. Frontend Components

#### AIVideoInterview Component (`client/src/components/AIVideoInterview.tsx`)
Professional video interview UI with:
- **Camera & Microphone Controls**: Toggle on/off with visual indicators
- **Recording Controls**: Start/stop recording with timer
- **Video Preview**: Real-time video feed with recording indicator
- **AI Analysis Display**: Shows score and feedback overlay
- **Interview Tips**: Helpful guidelines for candidates
- **Question Display**: Clear presentation of interview questions
- **Response Submission**: Submit recorded video for analysis

#### AI Interview Service (`client/src/services/aiInterviewService.ts`)
API client methods:
- `generateQuestions()` - Fetch AI-generated questions
- `startVideoInterview()` - Initialize video session
- `submitVideoResponse()` - Upload video response
- `analyzeVideoResponse()` - Get AI analysis
- `getRealTimeFeedback()` - Fetch real-time feedback
- `completeVideoInterview()` - Finalize interview
- `getInterviewReport()` - Retrieve full report
- `reportSuspiciousActivity()` - Log anti-cheat events
- `getInterviewInsights()` - Get personalized insights

#### Interview Session Integration (`client/src/pages/candidate/InterviewSession.tsx`)
- Detects interview mode (text vs. video)
- Renders AIVideoInterview component for video mode
- Maintains timer and progress tracking
- Handles question navigation
- Displays job information sidebar

### 3. Database Schema
Interview model includes:
- `interviewMode`: 'text', 'audio', or 'video'
- `responses`: JSON storing video paths and metadata
- `antiCheatData`: Logs suspicious activities
- `overallScore`, `technicalScore`, `communicationScore`: Scoring metrics
- `startedAt`, `completedAt`: Timestamps

## How to Use

### For Candidates

1. **Start Interview**
   - Navigate to interview session
   - System detects if it's a video interview
   - Click "Start Camera" to initialize

2. **Record Response**
   - Camera and microphone will activate
   - Read the question carefully
   - Click "Start Recording" when ready
   - Speak clearly and maintain eye contact
   - Click "Stop Recording" when done

3. **Submit Response**
   - Review your recording
   - Click "Submit Response"
   - AI analyzes your response in real-time
   - View feedback and score

4. **Complete Interview**
   - Answer all questions
   - System calculates overall score
   - View comprehensive report

### For Developers

#### Setting Up Video Storage
Currently, videos are stored locally in `server/uploads/videos/`. For production:

```javascript
// Update aiInterviewController.js to use cloud storage (S3, GCS, etc.)
// Example with AWS S3:
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const uploadToS3 = async (videoBuffer, fileName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `interviews/${fileName}`,
    Body: videoBuffer,
    ContentType: 'video/webm'
  };
  return s3.upload(params).promise();
};
```

#### Enabling AI Analysis
The current implementation uses mock analysis. To enable real AI:

```javascript
// In aiInterviewController.js
const analyzeVideoResponse = async (req, res, next) => {
  // Use video analysis API (e.g., Google Cloud Video Intelligence)
  // or extract audio and use speech-to-text + NLP analysis
  
  const audioExtracted = await extractAudio(videoPath);
  const transcript = await speechToText(audioExtracted);
  const analysis = await aiService.evaluateFinalPerformance(
    interview.job,
    [{ role: 'user', content: transcript }]
  );
};
```

#### Anti-Cheat Detection
Events logged:
- Tab switching
- Copy-paste attempts
- Window blur/focus loss
- Multiple faces detected
- No face detected
- Background changes

Extend with:
```javascript
// client/src/components/AIVideoInterview.tsx
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    aiInterviewService.reportSuspiciousActivity(
      interviewId,
      'window_blur',
      { timestamp: new Date() }
    );
  }
});
```

## API Response Examples

### Start Video Interview
```json
{
  "success": true,
  "data": {
    "interviewId": 1,
    "status": "IN_PROGRESS",
    "startedAt": "2024-04-11T10:30:00Z",
    "message": "Video interview session started"
  }
}
```

### Submit Video Response
```json
{
  "success": true,
  "data": {
    "interviewId": 1,
    "questionId": 0,
    "videoUrl": "/uploads/videos/interview_1_q0_1712847000000.webm",
    "message": "Video response submitted successfully"
  }
}
```

### Analyze Video Response
```json
{
  "success": true,
  "data": {
    "questionId": 0,
    "score": 82,
    "feedback": "Good response with clear explanation. Consider adding more specific examples.",
    "metrics": {
      "clarity": 85,
      "confidence": 78,
      "relevance": 88,
      "completeness": 80
    },
    "suggestions": [
      "Speak more clearly and at a steady pace",
      "Provide specific examples from your experience",
      "Maintain eye contact with the camera"
    ]
  }
}
```

### Complete Interview
```json
{
  "success": true,
  "data": {
    "interviewId": 1,
    "status": "COMPLETED",
    "overallScore": 82,
    "technicalScore": 85,
    "communicationScore": 80,
    "problemSolvingScore": 81,
    "completedAt": "2024-04-11T10:45:00Z",
    "message": "Interview completed successfully"
  }
}
```

## Testing

### Manual Testing Steps

1. **Test Video Recording**
   ```bash
   # Start server
   cd server && npm start
   
   # Start client
   cd client && npm start
   
   # Navigate to interview session
   # Click "Start Camera" → "Start Recording" → "Stop Recording"
   ```

2. **Test API Endpoints**
   ```bash
   # Generate questions
   curl -X POST http://localhost:5000/api/ai/generate-questions \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"jobId": 1}'
   
   # Start video interview
   curl -X POST http://localhost:5000/api/ai/video-interview/start \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"interviewId": 1}'
   ```

3. **Test Anti-Cheat**
   - Switch tabs during recording
   - Check console for anti-cheat events
   - Verify events logged in database

## Next Steps

1. **Production Deployment**
   - Set up cloud video storage (AWS S3, Google Cloud Storage)
   - Configure video CDN for streaming
   - Set up video processing pipeline

2. **Enhanced AI Analysis**
   - Integrate speech-to-text API
   - Implement NLP-based response evaluation
   - Add facial expression analysis
   - Implement plagiarism detection

3. **Advanced Features**
   - Real-time transcription display
   - Emotion detection
   - Accent and pronunciation analysis
   - Skill-based scoring rubrics

4. **Performance Optimization**
   - Implement video compression
   - Add progressive upload
   - Cache analysis results
   - Optimize database queries

## Troubleshooting

### Camera Not Accessing
- Check browser permissions
- Ensure HTTPS in production
- Verify getUserMedia support

### Video Upload Fails
- Check file size limits
- Verify upload directory permissions
- Check disk space

### AI Analysis Not Working
- Verify API keys configured
- Check network connectivity
- Review error logs

## File Structure
```
server/
├── controllers/
│   └── aiInterviewController.js (NEW)
├── routes/
│   └── ai.js (UPDATED)
├── uploads/
│   └── videos/ (NEW - for local storage)

client/
├── src/
│   ├── components/
│   │   └── AIVideoInterview.tsx (UPDATED)
│   ├── services/
│   │   └── aiInterviewService.ts (EXISTING)
│   └── pages/
│       └── candidate/
│           └── InterviewSession.tsx (UPDATED)
```

## Support
For issues or questions, refer to:
- Backend logs: `server/logs/`
- Frontend console: Browser DevTools
- Database: Check `interviews` table for interview records
