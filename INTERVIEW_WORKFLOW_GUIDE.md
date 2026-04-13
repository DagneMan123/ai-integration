# Professional Interview Workflow Guide

## Overview

The interview system implements a 4-phase professional workflow that simulates real-life interview environments. This guide explains each phase and how to troubleshoot common issues.

## 4-Phase Interview Workflow

### Phase 1: Selection
- User selects from 3 practice types:
  - **Technical Interview** (45 min, 5 questions) - Intermediate difficulty
  - **Behavioral Interview** (30 min, 4 questions) - Beginner difficulty
  - **Case Study Analysis** (60 min, 3 questions) - Advanced difficulty
- Each session type has specific benefits and learning outcomes
- User clicks "Start Practice" to proceed to Phase 2

### Phase 2: Setup/Lobby (Pre-Interview)
- **Hardware Check**: System tests camera and microphone
  - Camera feed displays in real-time
  - Microphone volume indicator shows audio levels
  - Both must show "Ready" status before proceeding
- **Interview Brief**: Shows what to expect
  - Number of questions
  - Total time available
  - Timer cannot be paused once started
  - Session will be recorded for AI analysis
- **Privacy Disclaimer**: Informs user about data handling
- User clicks "Begin Interview" to proceed to Phase 3

### Phase 3: Interview Environment
- **Split-Screen Layout**:
  - Left side: Question display + video feed
  - Right side: Tips, session info, and warnings
- **Recording Controls**:
  - "Start Recording" button to begin recording answer
  - "Stop Recording" button to stop recording
  - "Submit & Next" button to save response and move to next question
- **Real-Time Monitoring**:
  - Timer countdown with visual warnings (< 5 min)
  - Microphone volume indicator
  - Progress bar showing question progress
  - Recording time display
- **Auto-Submit**: Session auto-submits when timer reaches 0
- User completes all questions or time runs out

### Phase 4: Results & Analysis
- **Overall Score**: 0-100 rating with visual progress bar
- **Detailed Metrics**:
  - Communication (0-100)
  - Clarity (0-100)
  - Confidence (0-100)
  - Pacing (0-100)
- **AI Feedback**: Personalized feedback based on performance
- **Session Statistics**:
  - Questions answered
  - Total time spent
  - Average response time
- **Recommendations**: Actionable tips for improvement
- **Action Buttons**:
  - "Back to Home" - Return to practice selection
  - "Try Again" - Start a new practice session
  - "Download Report" - Export session report

## Permission Issues & Troubleshooting

### Common Permission Errors

#### 1. NotAllowedError / PermissionDeniedError
**Error Message**: "Camera and microphone permissions are required"

**Causes**:
- User clicked "Block" on the permission prompt
- Browser has previously blocked camera/microphone access
- Permission prompt was dismissed

**Solutions**:
1. **Chrome/Edge**:
   - Click the lock icon in the address bar
   - Find "Camera" and "Microphone"
   - Change from "Block" to "Allow"
   - Refresh the page and try again

2. **Firefox**:
   - Click the lock icon in the address bar
   - Click "Clear" next to camera/microphone permissions
   - Refresh the page and allow access when prompted

3. **Safari**:
   - Go to Safari → Preferences → Websites
   - Select "Camera" and "Microphone"
   - Find this website and change to "Allow"
   - Refresh the page

4. **General**:
   - Click the "Retry" button in the setup screen
   - When prompted, click "Allow" to grant permissions
   - Ensure camera/microphone are not blocked in OS settings

#### 2. NotFoundError
**Error Message**: "Camera or microphone not found"

**Causes**:
- Hardware is not connected
- Hardware drivers are not installed
- Hardware is disabled in system settings

**Solutions**:
1. Check that camera and microphone are physically connected
2. Verify hardware is enabled in system settings
3. Update device drivers
4. Try a different USB port
5. Restart your computer

#### 3. NotReadableError
**Error Message**: "Camera or microphone is already in use"

**Causes**:
- Another application is using the camera/microphone
- Browser tab has camera/microphone locked
- System resource conflict

**Solutions**:
1. Close other applications using camera/microphone:
   - Video conferencing apps (Zoom, Teams, Google Meet)
   - Other browser tabs with camera access
   - Screen recording software
2. Close and reopen the browser
3. Restart your computer
4. Try a different browser

## Recording & Submission

### How Recording Works
- Uses MediaRecorder API with WebM codec
- Records both video and audio
- Automatically stops when you click "Stop Recording"
- Recording time is displayed in real-time

### Submitting Responses
1. Click "Start Recording" to begin
2. Answer the question clearly and concisely
3. Click "Stop Recording" when done
4. Click "Submit & Next" to save and move to next question
5. Repeat for all questions

### Important Notes
- You must record an answer before submitting
- Recording time is tracked for each response
- All responses are saved locally until session ends
- Session auto-submits if timer reaches 0

## AI Analysis & Feedback

### Scoring Metrics
- **Overall Score**: Composite score based on all metrics
- **Communication**: How well you express ideas
- **Clarity**: How clear and understandable your answers are
- **Confidence**: How confident you sound
- **Pacing**: How well you manage speaking speed and pauses

### Feedback Generation
- AI analyzes your recorded responses
- Provides specific, actionable feedback
- Identifies strengths and areas for improvement
- Suggests concrete next steps

### Score Interpretation
- **85-100**: Excellent - Strong performance
- **70-84**: Good - Solid performance with room for improvement
- **60-69**: Fair - Needs improvement in several areas
- **Below 60**: Needs significant improvement

## Best Practices

### Before the Interview
1. Test your camera and microphone beforehand
2. Ensure good lighting (face should be clearly visible)
3. Choose a quiet location with minimal background noise
4. Close other applications to free up system resources
5. Have a stable internet connection
6. Use a professional background or blur your background

### During the Interview
1. Look directly at the camera
2. Speak clearly at a natural pace
3. Take a moment to think before answering
4. Avoid filler words like "um" and "uh"
5. Structure answers with clear beginning, middle, and end
6. Maintain good posture and eye contact
7. Avoid distractions in the background

### After the Interview
1. Review your AI feedback carefully
2. Identify 2-3 key areas for improvement
3. Practice addressing those areas
4. Take another practice session to measure improvement
5. Download and save your report for future reference

## Technical Requirements

### Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

### System Requirements
- Webcam (USB or built-in)
- Microphone (USB or built-in)
- Stable internet connection (minimum 2 Mbps)
- Modern browser with WebRTC support

### Permissions Required
- Camera access
- Microphone access
- Local storage (for session data)

## FAQ

**Q: Can I pause the interview?**
A: No, once you click "Begin Interview", the timer cannot be paused. Plan your time accordingly.

**Q: What happens if my internet disconnects?**
A: Your session will be lost. Ensure a stable connection before starting.

**Q: Can I retake a practice session?**
A: Yes, you can take unlimited practice sessions. Click "Try Again" after completing a session.

**Q: How long are my recordings stored?**
A: Recordings are stored for analysis and feedback generation. They are kept secure and private.

**Q: Can I download my report?**
A: Yes, click "Download Report" on the results page to export your session report.

**Q: What if I don't see my camera feed?**
A: Check camera permissions, ensure camera is not in use by another app, and try the "Retry" button.

**Q: How is my performance scored?**
A: AI analyzes your video and audio to generate scores based on communication, clarity, confidence, and pacing.

## Support

If you encounter issues:
1. Check this guide for troubleshooting steps
2. Try the "Retry" button in the setup screen
3. Close and reopen your browser
4. Clear browser cache and cookies
5. Try a different browser
6. Contact support if issues persist
