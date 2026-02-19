# Enhanced AI Features Implementation Guide

## Overview
This document outlines the implementation of advanced AI interview features, anti-cheating mechanisms, and behavioral analysis for the SimuAI platform.

## ✅ What Has Been Created

### 1. Enhanced Database Schema
**File:** `server/prisma/schema.prisma`
- Added behavioral metrics fields
- Added anti-cheating data fields
- Added plagiarism detection fields
- Added confidence and integrity scoring
- Added interview mode support (text/audio/video)

### 2. Enhanced AI Service
**File:** `server/services/enhancedAIService.js`
- Dynamic question generation
- Follow-up question generation based on answers
- AI content detection (plagiarism)
- Speech pattern analysis
- Sentiment analysis
- Enhanced answer evaluation with strictness levels
- Comprehensive report generation

### 3. Anti-Cheat Service
**File:** `server/services/antiCheatService.js`
- Tab switch detection
- Copy-paste attempt tracking
- Identity verification snapshot management
- Browser fingerprinting
- Window blur detection
- Keyboard shortcut monitoring
- Integrity score calculation

## 🔧 Implementation Steps

### Step 1: Update Database Schema
```bash
cd server
npx prisma db push
npx prisma generate
```

### Step 2: Install Additional Dependencies
```bash
cd server
npm install multer-s3 aws-sdk sharp
```

### Step 3: Update Interview Controller

The `interviewController.js` needs to be enhanced with:

1. **Start Interview with Anti-Cheat**
```javascript
const antiCheatService = require('../services/antiCheatService');
const enhancedAI = require('../services/enhancedAIService');

exports.startInterview = async (req, res, next) => {
  // ... existing code ...
  
  // Initialize anti-cheat session
  antiCheatService.initializeSession(interview.id, req.user.id);
  
  // Generate questions with AI
  const questions = await enhancedAI.generateInterviewQuestions(job, 'moderate', 10);
  
  // ... rest of code ...
};
```

2. **Submit Answer with Plagiarism Check**
```javascript
exports.submitAnswer = async (req, res, next) => {
  const { answer, timeTaken, antiCheatEvents } = req.body;
  
  // Check for AI-generated content
  const plagiarismCheck = await enhancedAI.detectAIContent(answer);
  
  // Analyze sentiment
  const sentiment = await enhancedAI.analyzeSentiment(answer);
  
  // Evaluate answer
  const evaluation = await enhancedAI.evaluateAnswer(question, answer, 'moderate');
  
  // Record anti-cheat events
  if (antiCheatEvents) {
    antiCheatEvents.forEach(event => {
      if (event.type === 'TAB_SWITCH') {
        antiCheatService.recordTabSwitch(interviewId, event.timestamp);
      }
      // ... handle other events
    });
  }
  
  // Generate follow-up if needed
  const followUp = await enhancedAI.generateFollowUpQuestion(question, answer, job);
  
  // ... save response with all metrics ...
};
```

### Step 4: Create Frontend Anti-Cheat Component

**File:** `client/src/components/AntiCheatMonitor.tsx`

```typescript
import { useEffect, useRef } from 'react';

interface AntiCheatMonitorProps {
  interviewId: string;
  onEvent: (event: AntiCheatEvent) => void;
}

export const AntiCheatMonitor: React.FC<AntiCheatMonitorProps> = ({ interviewId, onEvent }) => {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onEvent({ type: 'RIGHT_CLICK_ATTEMPT', timestamp: Date.now() });
    };

    // Detect tab switches
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onEvent({ type: 'TAB_SWITCH', timestamp: Date.now() });
      }
    };

    // Detect copy-paste
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      onEvent({ 
        type: 'COPY_PASTE_ATTEMPT', 
        timestamp: Date.now(),
        content: e.clipboardData?.getData('text')
      });
    };

    // Detect keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 'f'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        onEvent({
          type: 'KEYBOARD_SHORTCUT',
          timestamp: Date.now(),
          keys: `${e.ctrlKey ? 'ctrl+' : 'cmd+'}${e.key}`
        });
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [interviewId, onEvent]);

  return null; // This is a monitoring component with no UI
};
```

### Step 5: Create Webcam Identity Verification Component

**File:** `client/src/components/WebcamVerification.tsx`

```typescript
import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

interface WebcamVerificationProps {
  onCapture: (imageData: string) => void;
  interval?: number; // Capture every X milliseconds
}

export const WebcamVerification: React.FC<WebcamVerificationProps> = ({ 
  onCapture, 
  interval = 60000 // Default: every 60 seconds
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Request camera permission
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    // Capture initial snapshot
    captureSnapshot();

    // Set up interval for periodic captures
    const intervalId = setInterval(captureSnapshot, interval);

    return () => clearInterval(intervalId);
  }, [hasPermission, interval]);

  const captureSnapshot = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  };

  if (!hasPermission) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Camera access is required for identity verification.</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden shadow-lg border-2 border-primary">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover"
      />
      <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
    </div>
  );
};
```

### Step 6: Enhanced Interview Session Page

**File:** `client/src/pages/candidate/EnhancedInterviewSession.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AntiCheatMonitor } from '../../components/AntiCheatMonitor';
import { WebcamVerification } from '../../components/WebcamVerification';
import { interviewAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export const EnhancedInterviewSession: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [antiCheatEvents, setAntiCheatEvents] = useState<any[]>([]);

  useEffect(() => {
    loadInterview();
  }, [id]);

  const loadInterview = async () => {
    try {
      const response = await interviewAPI.getInterview(id!);
      setInterview(response.data.data);
      setCurrentQuestion(response.data.data.questions[0]);
    } catch (error) {
      toast.error('Failed to load interview');
    }
  };

  const handleAntiCheatEvent = (event: any) => {
    setAntiCheatEvents(prev => [...prev, event]);
    
    // Show warning for serious violations
    if (event.type === 'TAB_SWITCH') {
      toast.error('Warning: Tab switching detected. This may affect your integrity score.');
    } else if (event.type === 'COPY_PASTE_ATTEMPT') {
      toast.error('Warning: Copy-paste is not allowed during the interview.');
    }
  };

  const handleWebcamCapture = async (imageData: string) => {
    try {
      await interviewAPI.submitIdentitySnapshot(id!, { imageData });
    } catch (error) {
      console.error('Failed to submit identity snapshot');
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setLoading(true);
    try {
      const response = await interviewAPI.submitAnswer(id!, {
        questionIndex: currentQuestion.id - 1,
        answer,
        timeTaken: 0, // Calculate actual time
        antiCheatEvents
      });

      // Clear events after submission
      setAntiCheatEvents([]);
      setAnswer('');

      // Check for follow-up question
      if (response.data.data.followUpQuestion) {
        setCurrentQuestion(response.data.data.followUpQuestion);
        toast.info('Follow-up question generated based on your answer');
      } else if (response.data.data.nextQuestion) {
        setCurrentQuestion(response.data.data.nextQuestion);
      } else {
        // Interview complete
        toast.success('Interview completed!');
        navigate(`/candidate/interview/${id}/report`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Anti-Cheat Monitor */}
      <AntiCheatMonitor interviewId={id!} onEvent={handleAntiCheatEvent} />
      
      {/* Webcam Verification */}
      <WebcamVerification onCapture={handleWebcamCapture} interval={120000} />

      {/* Interview UI */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Question {currentQuestion?.id}
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {currentQuestion?.type}
              </span>
            </div>
            <p className="text-lg text-gray-700">{currentQuestion?.question}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Type your answer here..."
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>⚠️ Anti-cheat monitoring is active</p>
              <p>📹 Identity verification enabled</p>
            </div>
            <button
              onClick={submitAnswer}
              disabled={loading || !answer.trim()}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>
        </div>

        {/* Anti-Cheat Events Display (for debugging) */}
        {antiCheatEvents.length > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              {antiCheatEvents.length} monitoring event(s) recorded
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
```

## 📊 Enhanced Features Summary

### 1. AI Interview Modules ✅
- Text-to-Text responses
- Dynamic follow-up questions
- Real-time AI interaction
- Adaptive difficulty

### 2. Anti-Cheating System ✅
- AI plagiarism detection
- Browser lockdown (copy-paste disabled)
- Tab switch detection
- Identity verification via webcam
- Keyboard shortcut monitoring

### 3. Behavioral Analysis ✅
- Speech pattern analysis (fillers, rate)
- Sentiment analysis
- Confidence scoring
- Professionalism metrics

### 4. Enhanced Scoring ✅
- Technical score
- Soft skills score
- Integrity score with risk levels
- Confidence score
- Fluency score

### 5. Employer Analytics ✅
- Automated candidate ranking
- Comparative analytics
- Risk flagging
- Comprehensive reports

## 🚀 Next Steps

1. **Update Database:**
   ```bash
   cd server
   npx prisma db push
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd client
   npm install react-webcam
   ```

3. **Configure OpenAI API:**
   Add your OpenAI API key to `server/.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

4. **Test the Features:**
   - Start an interview
   - Try switching tabs (should be detected)
   - Try copy-pasting (should be blocked)
   - Submit answers (should get plagiarism check)

## 📝 API Endpoints to Add

### Interview Endpoints
```
POST /api/interviews/:id/anti-cheat-event
POST /api/interviews/:id/identity-snapshot
GET /api/interviews/:id/integrity-report
POST /api/interviews/:id/follow-up
```

### Admin Endpoints
```
GET /api/admin/interviews/flagged
GET /api/admin/integrity-stats
```

## 🎯 Success Metrics

- **For Candidates:** Fair, 24/7 available interviews
- **For Employers:** Cheat-free, merit-based shortlists
- **For Platform:** Automated, scalable, revenue-generating

## 🔒 Security Considerations

1. **Webcam snapshots** should be encrypted and stored securely
2. **Anti-cheat data** should be anonymized for privacy
3. **AI detection** should be used as a flag, not absolute proof
4. **Browser fingerprinting** should comply with privacy regulations

## 📚 Additional Resources

- OpenAI API Documentation: https://platform.openai.com/docs
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- MediaDevices API: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices

---

**Status:** Core services created ✅  
**Next:** Integrate into existing controllers and create frontend components  
**Timeline:** 2-3 days for full integration
