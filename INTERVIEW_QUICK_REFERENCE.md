# Interview System Quick Reference

## File Locations

### Frontend Components
```
client/src/pages/candidate/Practice.tsx              # Phase 1: Selection
client/src/components/InterviewLobby.tsx             # Phase 2: Setup/Lobby
client/src/components/PracticeInterviewEnvironment.tsx # Phase 3: Interview
client/src/components/InterviewResults.tsx           # Phase 4: Results
```

### Backend
```
server/controllers/practiceController.js             # Practice logic
server/routes/practice.js                            # Practice routes
server/routes/index.js                               # Routes registration
```

### API
```
client/src/utils/api.ts                              # practiceAPI object
```

## Component Props

### Practice.tsx
No props - standalone page component

### InterviewLobby.tsx
```typescript
interface InterviewLobbyProps {
  sessionType: string;      // e.g., "Technical Interview"
  duration: number;         // Minutes
  questionCount: number;    // Number of questions
  onBegin: () => void;      // Called when "Begin Interview" clicked
  onCancel: () => void;     // Called when "Cancel" clicked
}
```

### PracticeInterviewEnvironment.tsx
```typescript
interface PracticeInterviewEnvironmentProps {
  sessionType: string;      // e.g., "Technical Interview"
  questions: Question[];    // Array of questions
  duration: number;         // Minutes
  onComplete: (responses: any[]) => void;  // Called when session ends
  onCancel: () => void;     // Called when "End Session" clicked
}
```

### InterviewResults.tsx
```typescript
interface InterviewResultsProps {
  sessionType: string;      // e.g., "Technical Interview"
  responses: Response[];    // Array of responses
  totalTime: number;        // Total time in seconds
  onHome: () => void;       // Called when "Back to Home" clicked
  onRetry: () => void;      // Called when "Try Again" clicked
}
```

## State Management

### Practice.tsx State
```typescript
const [phase, setPhase] = useState<InterviewPhase>('selection');
const [selectedSession, setSelectedSession] = useState<any>(null);
const [questions, setQuestions] = useState<Question[]>([]);
const [responses, setResponses] = useState<any[]>([]);
const [totalTime, setTotalTime] = useState(0);
const [loading, setLoading] = useState(false);
```

### InterviewLobby.tsx State
```typescript
const [micStatus, setMicStatus] = useState<'checking' | 'ready' | 'error'>('checking');
const [cameraStatus, setCameraStatus] = useState<'checking' | 'ready' | 'error'>('checking');
const [micVolume, setMicVolume] = useState(0);
const [errorMessage, setErrorMessage] = useState<string>('');
const [permissionDenied, setPermissionDenied] = useState(false);
```

### PracticeInterviewEnvironment.tsx State
```typescript
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [timeLeft, setTimeLeft] = useState(duration * 60);
const [isRecording, setIsRecording] = useState(false);
const [recordingTime, setRecordingTime] = useState(0);
const [responses, setResponses] = useState<any[]>([]);
const [micVolume, setMicVolume] = useState(0);
```

### InterviewResults.tsx State
```typescript
const [scores, setScores] = useState({
  overall: 0,
  communication: 0,
  clarity: 0,
  confidence: 0,
  pacing: 0
});
const [feedback, setFeedback] = useState('');
const [loading, setLoading] = useState(true);
```

## API Endpoints

### Practice API
```typescript
practiceAPI.getSessions()                    // GET /practice/sessions
practiceAPI.createSession(data)              // POST /practice/sessions
practiceAPI.getSessionDetails(sessionId)     // GET /practice/sessions/:sessionId
practiceAPI.submitAnswer(sessionId, data)    // POST /practice/sessions/:sessionId/answer
practiceAPI.endSession(sessionId)            // POST /practice/sessions/:sessionId/end
practiceAPI.getStats()                       // GET /practice/stats
```

## Phase Transitions

```
Selection → Lobby → Interview → Results
   ↓                                ↓
   └────────────────────────────────┘
         (Cancel or Retry)
```

## Recording Implementation

### Start Recording
```typescript
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9'
});
mediaRecorder.start();
```

### Stop Recording
```typescript
mediaRecorder.stop();
```

### Submit Recording
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

### Request Permissions
```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: { ideal: 1280 }, height: { ideal: 720 } },
  audio: true
});
```

### Handle Errors
```typescript
try {
  // Request permissions
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // Permission denied
  } else if (error.name === 'NotFoundError') {
    // Hardware not found
  } else if (error.name === 'NotReadableError') {
    // Hardware in use
  }
}
```

## Question Types

### Technical Questions
```typescript
const technicalQuestions = [
  'Explain the concept of closures in JavaScript...',
  'How would you optimize a slow database query?...',
  'Describe the difference between SQL and NoSQL...',
  'What is the time complexity of binary search?...',
  'How would you handle authentication and authorization?...'
];
```

### Behavioral Questions
```typescript
const behavioralQuestions = [
  'Tell us about a time when you had to work with a difficult team member...',
  'Describe a situation where you failed...',
  'How do you prioritize tasks when you have multiple deadlines?...',
  'Tell us about your greatest professional achievement...',
  'How do you stay updated with the latest industry trends?...'
];
```

### Case Study Questions
```typescript
const caseStudyQuestions = [
  'A startup wants to build a ride-sharing app...',
  'Design a system to handle real-time notifications...',
  'How would you scale an e-commerce platform...'
];
```

## Scoring Colors

```typescript
const getScoreColor = (score: number) => {
  if (score >= 85) return 'text-emerald-600';      // Excellent
  if (score >= 70) return 'text-blue-600';         // Good
  if (score >= 60) return 'text-amber-600';        // Fair
  return 'text-red-600';                           // Needs Improvement
};
```

## Time Formatting

```typescript
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
```

## Common Tasks

### Add New Question Type
1. Add questions array to `generateMockQuestion()`
2. Add condition to return questions based on type
3. Update Practice.tsx to include new type

### Change Scoring Algorithm
1. Modify score generation in InterviewResults.tsx
2. Update color coding if needed
3. Update feedback options

### Modify Timer Duration
1. Change `duration` prop in Practice.tsx
2. Update `setTotalTime(duration * 60)` in PracticeInterviewEnvironment.tsx

### Add New Metric
1. Add to scores object in InterviewResults.tsx
2. Add to metric cards in render
3. Update scoring algorithm

### Change Recording Codec
1. Modify `mimeType` in PracticeInterviewEnvironment.tsx
2. Update blob type if needed

## Debugging Tips

### Check Hardware Status
```typescript
console.log('Camera:', cameraStatus);
console.log('Microphone:', micStatus);
console.log('Volume:', micVolume);
```

### Check Recording
```typescript
console.log('Recording:', isRecording);
console.log('Recording time:', recordingTime);
console.log('Chunks:', chunksRef.current.length);
```

### Check Timer
```typescript
console.log('Time left:', timeLeft);
console.log('Current question:', currentQuestionIndex);
console.log('Total questions:', questions.length);
```

### Check Responses
```typescript
console.log('Responses:', responses);
console.log('Response count:', responses.length);
```

## Browser DevTools

### Check Permissions
1. Open DevTools (F12)
2. Go to Application tab
3. Check Cookies → Permissions
4. Look for camera/microphone entries

### Check Network
1. Open DevTools (F12)
2. Go to Network tab
3. Look for API calls to /practice/
4. Check response status and data

### Check Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check for warnings

## Performance Optimization

### Memoization
```typescript
const isReady = useMemo(() => 
  micStatus === 'ready' && cameraStatus === 'ready',
  [micStatus, cameraStatus]
);
```

### Debouncing
```typescript
const debouncedVolumeUpdate = useCallback(
  debounce((volume: number) => setMicVolume(volume), 100),
  []
);
```

### Cleanup
```typescript
useEffect(() => {
  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };
}, []);
```

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| NotAllowedError | Permission denied | Click Retry, then Allow |
| NotFoundError | Hardware not found | Check physical connection |
| NotReadableError | Hardware in use | Close other apps |
| Black camera | Permission blocked | Check browser settings |
| No microphone | Muted or blocked | Check mute, permissions |
| Timer frozen | Tab inactive | Click tab, refresh |
| Recording not saving | Not started/stopped | Check recording status |

## Documentation Files

- `INTERVIEW_WORKFLOW_GUIDE.md` - User guide
- `INTERVIEW_SYSTEM_ARCHITECTURE.md` - Technical architecture
- `INTERVIEW_TROUBLESHOOTING.md` - Troubleshooting guide
- `INTERVIEW_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `INTERVIEW_QUICK_REFERENCE.md` - This file

## Useful Commands

### Run Development Server
```bash
npm run dev          # Client
npm start            # Server
```

### Run Tests
```bash
npm test             # Run tests
npm run test:watch   # Watch mode
```

### Build for Production
```bash
npm run build        # Client
```

### Check Diagnostics
```bash
npm run lint         # Lint code
npm run type-check   # Type checking
```

## Resources

- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript](https://www.typescriptlang.org/)

## Contact & Support

For issues or questions:
1. Check INTERVIEW_TROUBLESHOOTING.md
2. Check browser console for errors
3. Check network tab for API issues
4. Contact development team with error details
