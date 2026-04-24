# Interview Security Implementation - Anti-Cheating Measures

## Overview

A comprehensive anti-cheating system has been implemented to prevent candidates from cheating during interviews through:
- Text selection and copying prevention
- Right-click context menu blocking
- Keyboard shortcut blocking (Ctrl+C, Ctrl+V, Ctrl+X, F12, etc.)
- Tab-switching detection
- Window blur/focus loss detection
- Paste blocking on input fields

---

## Features Implemented

### 1. Text Selection Prevention ✅

**CSS-Based Approach:**
- Disables text selection globally during interview
- Allows selection only on answer input fields
- Prevents drag and drop operations
- Blocks image dragging

**Files:**
- `client/src/styles/interviewSecurity.css`

**CSS Classes:**
```css
.interview-secure {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.answer-input {
  user-select: text;  /* Allow selection only here */
}
```

---

### 2. Right-Click Context Menu Blocking ✅

**Implementation:**
- Prevents right-click context menu from appearing
- Logs all right-click attempts
- Shows warning message to user

**Code:**
```javascript
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  logViolation({
    type: 'right_click',
    timestamp: new Date(),
    details: 'Right-click context menu attempted'
  });
  return false;
};

document.addEventListener('contextmenu', handleContextMenu);
```

---

### 3. Keyboard Shortcut Blocking ✅

**Blocked Shortcuts:**
- `Ctrl+C` - Copy
- `Ctrl+V` - Paste
- `Ctrl+X` - Cut
- `Ctrl+A` - Select All
- `F12` - Developer Tools
- `Ctrl+Shift+I` - Developer Tools
- `Ctrl+Shift+J` - Developer Tools

**Implementation:**
```javascript
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
    e.preventDefault();
    logViolation({
      type: 'keyboard_shortcut',
      details: 'Ctrl+C (Copy) attempted'
    });
  }
  // ... similar for other shortcuts
};

document.addEventListener('keydown', handleKeyDown);
```

---

### 4. Tab-Switching Detection ✅

**Implementation:**
- Detects when user switches away from interview tab
- Detects when user minimizes window
- Logs each tab switch with timestamp
- Shows warning message

**Code:**
```javascript
const handleVisibilityChange = () => {
  const isVisible = document.visibilityState === 'visible';
  
  if (!isVisible) {
    tabSwitchCountRef.current++;
    logViolation({
      type: 'tab_switch',
      details: `Tab switched away (count: ${tabSwitchCountRef.current})`
    });
  }
};

document.addEventListener('visibilitychange', handleVisibilityChange);
```

**Triggers:**
- User clicks on another tab
- User minimizes browser window
- User switches to another application
- User locks screen

---

### 5. Blur Detection ✅

**Implementation:**
- Detects when browser window loses focus
- Detects when user clicks outside browser
- Logs each blur event with timestamp
- Shows warning message

**Code:**
```javascript
const handleBlur = () => {
  blurCountRef.current++;
  logViolation({
    type: 'blur',
    details: `Window blur detected (count: ${blurCountRef.current})`
  });
};

window.addEventListener('blur', handleBlur);
```

**Triggers:**
- User clicks on another window
- User switches to another application
- User clicks on taskbar
- User uses Alt+Tab

---

### 6. Paste Blocking on Input Fields ✅

**Implementation:**
- Prevents pasting into answer input fields
- Allows typing normally
- Shows visual feedback (red highlight)
- Logs paste attempts

**Code:**
```javascript
const handlePaste = (e: ClipboardEvent) => {
  const target = e.target as HTMLElement;
  
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    e.preventDefault();
    logViolation({
      type: 'paste',
      details: `Paste attempted on ${target.tagName}`
    });
    
    // Visual feedback
    target.style.backgroundColor = '#ffcccc';
    setTimeout(() => {
      target.style.backgroundColor = originalBg;
    }, 500);
  }
};

document.addEventListener('paste', handlePaste);
```

---

## Files Created

### 1. client/src/hooks/useInterviewSecurity.ts
**Purpose:** React hook that enforces all security measures

**Key Methods:**
- `useInterviewSecurity(options)` - Main hook
- Handles all event listeners
- Logs violations to backend
- Returns security stats

**Options:**
```typescript
interface UseInterviewSecurityOptions {
  interviewId: number;
  onViolation?: (violation: SecurityViolation) => void;
  enableTextSelection?: boolean;
  enableRightClick?: boolean;
  enablePaste?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableTabSwitchDetection?: boolean;
  enableBlurDetection?: boolean;
}
```

### 2. client/src/styles/interviewSecurity.css
**Purpose:** CSS rules to prevent text selection and copying

**Key Classes:**
- `.interview-secure` - Main security wrapper
- `.answer-input` - Allow selection only here
- `.paste-blocked` - Visual feedback for paste attempts

### 3. client/src/components/InterviewSecurityWrapper.tsx
**Purpose:** React component that wraps interview content with security

**Features:**
- Security status bar showing violation count
- Warning toast messages
- Violation log (dev mode only)
- Automatic status updates (secure → warning → critical)

**Props:**
```typescript
interface InterviewSecurityWrapperProps {
  interviewId: number;
  children: React.ReactNode;
  onSecurityViolation?: (violation: any) => void;
  showSecurityStatus?: boolean;
  maxViolations?: number;
  onMaxViolationsReached?: () => void;
}
```

### 4. server/routes/interviewSecurity.js
**Purpose:** Backend routes for logging and reporting security violations

**Endpoints:**
- `POST /api/interview-security/security-violation` - Log violation
- `GET /api/interview-security/:interviewId/security-report` - Get report

---

## Integration Guide

### Step 1: Import CSS
```typescript
import '../styles/interviewSecurity.css';
```

### Step 2: Wrap Interview Component
```typescript
import InterviewSecurityWrapper from '../components/InterviewSecurityWrapper';

<InterviewSecurityWrapper
  interviewId={interviewId}
  maxViolations={5}
  onMaxViolationsReached={() => {
    // Handle max violations reached
    completeInterview();
  }}
>
  {/* Interview content */}
</InterviewSecurityWrapper>
```

### Step 3: Use Hook (if needed)
```typescript
import useInterviewSecurity from '../hooks/useInterviewSecurity';

const securityStats = useInterviewSecurity({
  interviewId,
  onViolation: (violation) => {
    console.log('Violation:', violation);
  }
});
```

---

## Violation Types and Penalties

| Violation Type | Penalty | Logged | Backend Notified |
|---|---|---|---|
| Text Selection | Prevented | ✅ | ✅ |
| Copy (Ctrl+C) | Prevented | ✅ | ✅ |
| Paste (Ctrl+V) | Prevented | ✅ | ✅ |
| Cut (Ctrl+X) | Prevented | ✅ | ✅ |
| Right-Click | Prevented | ✅ | ✅ |
| Tab Switch | Logged | ✅ | ✅ |
| Window Blur | Logged | ✅ | ✅ |
| Developer Tools | Prevented | ✅ | ✅ |

---

## Integrity Score Calculation

**Formula:**
```
Score = 100
Score -= (copyPasteAttempts × 5)
Score -= (rightClickAttempts × 3)
Score -= (keyboardShortcutAttempts × 4)
Score -= (tabSwitches × 10)
Score -= (blurEvents × 8)
Score = max(0, min(100, Score))
```

**Risk Levels:**
- **80-100:** LOW - No suspicious activity
- **60-79:** MEDIUM - Minor suspicious activity
- **40-59:** HIGH - Multiple violations detected
- **0-39:** CRITICAL - Significant cheating indicators

---

## API Endpoints

### Log Security Violation
```
POST /api/interview-security/security-violation
Content-Type: application/json

{
  "interviewId": 123,
  "violationType": "copy",
  "details": "Ctrl+C (Copy) attempted",
  "timestamp": "2024-01-15T10:30:00Z",
  "violationCount": 1
}

Response:
{
  "success": true,
  "data": {
    "interviewId": 123,
    "violationType": "copy",
    "antiCheatData": {
      "copyPasteAttempts": 1,
      "tabSwitches": 0,
      "blurEvents": 0,
      "suspiciousActivities": [...]
    },
    "integrityScore": 95
  }
}
```

### Get Security Report
```
GET /api/interview-security/:interviewId/security-report

Response:
{
  "success": true,
  "data": {
    "interviewId": 123,
    "candidateId": "user123",
    "jobId": 456,
    "status": "COMPLETED",
    "antiCheatData": {...},
    "integrityScore": 95,
    "integrityRisk": "LOW",
    "violations": {
      "copyPasteAttempts": 1,
      "rightClickAttempts": 0,
      "keyboardShortcutAttempts": 0,
      "tabSwitches": 0,
      "blurEvents": 0,
      "totalViolations": 1
    },
    "suspiciousActivities": [...],
    "recommendation": "TRUSTWORTHY - No suspicious activity detected"
  }
}
```

---

## Security Status Display

### Status Bar States

**Secure (Green)**
```
✓ Interview Secure
Violations: 0 / 5
```

**Warning (Yellow)**
```
⚠️ Security Warning
Violations: 3 / 5
```

**Critical (Red)**
```
❌ Critical Security Alert
Violations: 5 / 5 - Maximum violations reached
```

---

## Warning Messages

| Event | Message |
|---|---|
| Copy attempt | ❌ Text copying is not allowed during the interview |
| Paste attempt | ❌ Pasting is not allowed during the interview |
| Right-click | ❌ Right-click is disabled during the interview |
| Tab switch | ⚠️ Tab switching detected and logged |
| Window blur | ⚠️ Window focus lost and logged |
| Keyboard shortcut | ❌ This keyboard shortcut is not allowed |

---

## Development Mode

In development mode (`NODE_ENV === 'development'`), a violation log is displayed at the bottom of the page showing:
- Violation type
- Details
- Timestamp
- Violation count

This helps with testing and debugging.

---

## Testing Checklist

- [ ] Text selection is disabled on question text
- [ ] Text selection is allowed on answer input
- [ ] Right-click context menu is blocked
- [ ] Ctrl+C is blocked
- [ ] Ctrl+V is blocked
- [ ] Ctrl+X is blocked
- [ ] Tab switching is detected
- [ ] Window blur is detected
- [ ] Paste on input fields is blocked
- [ ] Violations are logged to backend
- [ ] Security status bar updates correctly
- [ ] Warning messages appear
- [ ] Integrity score is calculated correctly
- [ ] Security report can be retrieved

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Text Selection | ✅ | ✅ | ✅ | ✅ |
| Right-Click | ✅ | ✅ | ✅ | ✅ |
| Keyboard Shortcuts | ✅ | ✅ | ✅ | ✅ |
| Tab Switch Detection | ✅ | ✅ | ✅ | ✅ |
| Blur Detection | ✅ | ✅ | ✅ | ✅ |
| Paste Blocking | ✅ | ✅ | ✅ | ✅ |

---

## Limitations

1. **Client-Side Only:** All measures are client-side and can be bypassed by determined users
2. **Developer Tools:** Determined users can still access developer tools through other means
3. **Screen Recording:** Cannot prevent external screen recording
4. **Mobile:** Some features may not work on mobile devices
5. **Accessibility:** May impact users with accessibility needs

---

## Recommendations

1. **Combine with Proctoring:** Use with video proctoring for maximum security
2. **Backend Validation:** Validate all answers on backend
3. **Time Limits:** Enforce strict time limits per question
4. **Randomized Questions:** Use randomized questions to prevent memorization
5. **Manual Review:** Manually review suspicious interviews
6. **Integrity Threshold:** Set minimum integrity score for passing

---

## Future Enhancements

1. **AI-Based Detection:** Use AI to detect suspicious patterns
2. **Biometric Verification:** Verify candidate identity with biometrics
3. **Network Monitoring:** Monitor network activity for suspicious patterns
4. **Keystroke Dynamics:** Analyze typing patterns for anomalies
5. **Eye Tracking:** Track eye movement to detect cheating
6. **Audio Monitoring:** Monitor audio for external help

---

## Support

For issues or questions about the interview security system, refer to:
- `client/src/hooks/useInterviewSecurity.ts` - Hook implementation
- `client/src/components/InterviewSecurityWrapper.tsx` - Component implementation
- `server/routes/interviewSecurity.js` - Backend implementation
