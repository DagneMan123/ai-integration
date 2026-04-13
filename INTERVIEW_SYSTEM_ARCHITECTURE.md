# Interview System Architecture

## System Overview

The interview system is a 4-phase professional workflow that guides candidates through practice interviews with AI-powered feedback.

## Component Structure

### Frontend Components

#### 1. Practice.tsx (Main Container)
- **Location**: `client/src/pages/candidate/Practice.tsx`
- **Responsibility**: Manages phase transitions and session state
- **Phases**:
  - `selection`: Display practice type options
  - `lobby`: Hardware check and interview brief
  - `interview`: Main interview environment
  - `results`: Results and feedback display
- **State Management**:
  - `phase`: Current interview phase
  - `selectedSession`: Selected practice type
  - `questions`: Array of interview questions
  - `responses`: Array of user responses
  - `totalTime`: Total time spent in interview
  - `loading`: Loading state

#### 2. InterviewLobby.tsx (Phase 2)
- **Location**: `client/src/components/InterviewLobby.tsx`
- **Responsibility**: Pre-interview setup and hardware verification
- **Features**:
  - Camera feed preview
  - Microphone volume monitoring
  - Hardware status indicators
  - Interview brief with expectations
  - Privacy disclaimer
  - Permission error handling with retry
- **State Management**:
  - `micStatus`: 'checking' | 'ready' | 'error'
  - `cameraStatus`: 'checking' | 'ready' | 'error'
  - `micVolume`: Current microphone volume (0-100)
  - `errorMessage`: Detailed error description
  - `permissionDenied`: Boolean flag for permission errors
- **Error Handling**:
  - NotAllowedError: Permission denied
  - NotFoundError: Hardware not found
  - NotReadableError: Hardware in use
  - Generic errors with helpful messages

#### 3. PracticeInterviewEnvironment.tsx (Phase 3)
- **Location**: `client/src/components/PracticeInterviewEnvironment.tsx`
- **Responsibility**: Main interview UI and recording
- **Features**:
  - Split-screen layout (question + video)
  - Real-time recording with MediaRecorder API
  - Timer countdown with warnings
  - Microphone volume indicator
  - Progress tracking
  - Recording controls (start/stop/submit)
- **State Management**:
  - `currentQuestionIndex`: Current question number
  - `timeLeft`: Remaining time in seconds
  - `isRecording`: Recording state
  - `recordingTime`: Current recording duration
  - `responses`: Array of submitted responses
  - `micVolume`: Current microphone volume
- **Recording Details**:
  - Codec: WebM with VP9
  - Includes both video and audio
  - Stored as Blob for submission
  - Recording time tracked per response

#### 4. InterviewResults.tsx (Phase 4)
- **Location**: `client/src/components/InterviewResults.tsx`
- **Responsibility**: Display results and AI feedback
- **Features**:
  - Overall performance score (0-100)
  - Detailed metric scores (communication, clarity, confidence, pacing)
  - AI-generated feedback
  - Session statistics
  - Improvement recommendations
  - Action buttons (home, retry, download)
- **State Management**:
  - `scores`: Object with all metric scores
  - `feedback`: AI-generated feedback text
  - `loading`: Analysis loading state
- **Scoring**:
  - Simulated AI analysis (2-second delay)
  - Random scores between 70-100 for demo
  - Color-coded score display

### Backend Components

#### 1. practiceController.js
- **Location**: `server/controllers/practiceController.js`
- **Endpoints**:
  - `GET /practice/sessions` - Get user's practice sessions
  - `POST /practice/sessions` - Create new practice session
  - `GET /practice/sessions/:sessionId` - Get session details
  - `POST /practice/sessions/:sessionId/answer` - Submit answer
  - `POST /practice/sessions/:sessionId/end` - End session
  - `GET /practice/stats` - Get user statistics
- **Database Model**: `practiceSession` (Prisma)
- **Fields**:
  - `id`: Session ID
  - `userId`: User ID (foreign key)
  - `topic`: Practice topic
  - `difficulty`: Difficulty level
  - `status`: 'active' | 'completed'
  - `startedAt`: Session start time
  - `endedAt`: Session end time
  - `createdAt`: Creation timestamp
  - `updatedAt`: Last update timestamp

#### 2. practice.js (Routes)
- **Location**: `server/routes/practice.js`
- **Middleware**: `authenticateToken` (all routes)
- **Route Mapping**:
  - GET `/sessions` → `getPracticeSessions`
  - POST `/sessions` → `createPracticeSession`
  - GET `/sessions/:sessionId` → `getPracticeSessionDetails`
  - POST `/sessions/:sessionId/answer` → `submitPracticeAnswer`
  - POST `/sessions/:sessionId/end` → `endPracticeSession`
  - GET `/stats` → `getPracticeStats`

### API Integration

#### practiceAPI (client/src/utils/api.ts)
```typescript
export const practiceAPI = {
  getSessions: () => request.get('/practice/sessions'),
  createSession: (data: object) => request.post('/practice/sessions', data),
  getSessionDetails: (sessionId: string) => request.get(`/practice/sessions/${sessionId}`),
  submitAnswer: (sessionId: string, data: object) => request.post(`/practice/sessions/${sessionId}/answer`, data),
  endSession: (sessionId: string) => request.post(`/practice/sessions/${sessionId}/end`),
  getStats: () => request.get('/practice/stats'),
};
```

## Data Flow

### Phase 1: Selection
1. User selects practice type from 3 options
2. `handleStartPractice()` is called
3. `selectedSession` state is updated
4. Phase transitions to 'lobby'

### Phase 2: Lobby
1. `InterviewLobby` component mounts
2. `checkHardware()` is called automatically
3. Camera and microphone permissions are requested
4. Hardware status is checked and displayed
5. User clicks "Begin Interview"
6. `handleBeginInterview()` is called
7. Mock questions are generated
8. Phase transitions to 'interview'

### Phase 3: Interview
1. `PracticeInterviewEnvironment` component mounts
2. Camera stream is initialized
3. Timer countdown begins
4. User records answers to questions
5. Each response is stored in `responses` array
6. User submits response and moves to next question
7. When all questions answered or timer reaches 0:
   - `handleCompleteInterview()` is called
   - `responses` and `totalTime` are passed to results
   - Phase transitions to 'results'

### Phase 4: Results
1. `InterviewResults` component mounts
2. AI analysis simulation begins (2-second delay)
3. Scores are generated
4. Feedback is selected
5. Results are displayed
6. User can:
   - Click "Back to Home" → Phase returns to 'selection'
   - Click "Try Again" → Phase returns to 'selection'
   - Click "Download Report" → Report is generated

## Recording Implementation

### MediaRecorder Setup
```typescript
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9'
});

mediaRecorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    chunksRef.current.push(event.data);
  }
};

mediaRecorder.start();
```

### Recording Submission
```typescript
const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
const response = {
  questionId: currentQuestion.id,
  questionText: currentQuestion.text,
  videoBlob,
  recordingTime,
  timestamp: new Date()
};
```

## Permission Handling

### Permission Request Flow
1. `navigator.mediaDevices.getUserMedia()` is called
2. Browser shows permission prompt
3. User clicks "Allow" or "Block"
4. If allowed: Stream is returned
5. If blocked: NotAllowedError is thrown

### Error Handling
```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: true
  });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // Handle permission denied
  } else if (error.name === 'NotFoundError') {
    // Handle hardware not found
  } else if (error.name === 'NotReadableError') {
    // Handle hardware in use
  }
}
```

## State Management

### Practice.tsx State
- `phase`: Tracks current interview phase
- `selectedSession`: Stores selected practice type
- `questions`: Array of interview questions
- `responses`: Array of user responses
- `totalTime`: Total time spent
- `loading`: Loading state

### InterviewLobby.tsx State
- `micStatus`: Microphone status
- `cameraStatus`: Camera status
- `micVolume`: Microphone volume level
- `errorMessage`: Error description
- `permissionDenied`: Permission error flag

### PracticeInterviewEnvironment.tsx State
- `currentQuestionIndex`: Current question
- `timeLeft`: Remaining time
- `isRecording`: Recording state
- `recordingTime`: Recording duration
- `responses`: Submitted responses
- `micVolume`: Microphone volume

### InterviewResults.tsx State
- `scores`: Performance scores
- `feedback`: AI feedback text
- `loading`: Analysis loading state

## Question Generation

### Mock Questions
Questions are generated based on session type:

**Technical Questions**:
- Closures in JavaScript
- Database query optimization
- SQL vs NoSQL
- Binary search complexity
- Authentication and authorization

**Behavioral Questions**:
- Difficult team member experience
- Failure and learning
- Task prioritization
- Greatest achievement
- Staying updated with trends

**Case Study Questions**:
- Ride-sharing app architecture
- Real-time notification system
- E-commerce scaling

## Scoring Algorithm

### Current Implementation
- Simulated AI analysis with 2-second delay
- Random scores between 70-100
- Color-coded based on score ranges:
  - 85-100: Emerald (Excellent)
  - 70-84: Blue (Good)
  - 60-69: Amber (Fair)
  - Below 60: Red (Needs Improvement)

### Future Enhancement
- Real AI analysis using OpenAI GPT-4
- Transcript analysis for communication metrics
- Video analysis for confidence and pacing
- Actual performance-based scoring

## Browser Compatibility

### Supported Browsers
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

### Required APIs
- MediaDevices API (getUserMedia)
- MediaRecorder API
- AudioContext API
- WebRTC

## Performance Considerations

### Optimization
- Lazy load components
- Memoize expensive calculations
- Debounce volume monitoring
- Clean up streams on unmount
- Cancel animation frames on unmount

### Resource Management
- Stop all tracks when session ends
- Clear blob chunks after submission
- Release audio context resources
- Cleanup event listeners

## Security Considerations

### Data Protection
- All API calls require authentication
- User ID is extracted from JWT token
- Session data is user-scoped
- Recordings are stored securely

### Permission Handling
- Permissions are requested explicitly
- User can revoke permissions anytime
- No fallback if permissions denied
- Clear error messages for users

## Testing Checklist

- [ ] Hardware check works correctly
- [ ] Permission errors are handled gracefully
- [ ] Camera feed displays properly
- [ ] Microphone volume monitoring works
- [ ] Recording starts and stops correctly
- [ ] Timer countdown functions properly
- [ ] Questions display correctly
- [ ] Responses are saved properly
- [ ] Phase transitions work smoothly
- [ ] Results display correctly
- [ ] Retry and home buttons work
- [ ] All error messages are clear
- [ ] Mobile responsiveness works
- [ ] Browser compatibility verified

## Future Enhancements

1. **Real AI Analysis**
   - Integrate OpenAI GPT-4 for feedback
   - Implement speech-to-text for transcripts
   - Add video analysis for body language

2. **Advanced Features**
   - Code editor for technical questions
   - Whiteboard for case studies
   - Peer comparison analytics
   - Progress tracking over time

3. **Performance Improvements**
   - Implement video compression
   - Add progressive upload
   - Cache questions locally
   - Optimize bundle size

4. **User Experience**
   - Add practice tips during interview
   - Implement question hints
   - Add pause functionality (with time adjustment)
   - Support multiple languages
