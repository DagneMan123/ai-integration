# Anti-Paste Security Implementation

## Overview
Comprehensive anti-paste and anti-cheat measures have been implemented to prevent users from pasting AI-generated answers or other unauthorized content during interview sessions.

## Changes Made

### 1. Frontend - Anti-Paste Hook (`client/src/hooks/useAntiPaste.ts`)
**New file created** with comprehensive paste prevention:

- **onPaste Handler**: Blocks clipboard paste events
- **onDrop Handler**: Blocks drag-and-drop file/text insertion
- **onContextMenu Handler**: Blocks right-click context menu
- **Global Keyboard Listener**: Catches Ctrl+V, Cmd+V, and Shift+Insert shortcuts
- **Backend Logging**: Sends security violation reports to backend
- **Visual Warnings**: Toast notifications alert users of blocked actions

**Features:**
- Prevents paste via multiple methods (keyboard shortcuts, context menu, drag-drop)
- Logs all paste attempts with timestamp and method
- Tracks paste attempt count
- Triggers callback when cheating detected
- Fully configurable via options

### 2. Frontend - InterviewSession Component Updates
**File: `client/src/pages/candidate/InterviewSession.tsx`**

Changes:
- Added `useAntiPaste` hook import
- Initialized hook with interview ID and cheating detection callback
- Added `onPaste`, `onDrop`, `onContextMenu` handlers to textarea
- Added `autoComplete="off"` to prevent browser autofill
- Added `cheatingDetected` state to disable input when violation occurs
- Updated placeholder text to indicate paste is disabled

### 3. Frontend - ProfessionalInterviewSession Component Updates
**File: `client/src/components/ProfessionalInterviewSession.tsx`**

Changes:
- Added `useAntiPaste` hook import
- Initialized hook with interview ID and violation tracking
- Added `onPaste`, `onDrop`, `onContextMenu` handlers to textarea
- Added `autoComplete="off"` attribute
- Integrated with existing cheating detection system
- Violation count increments on paste attempts

### 4. Frontend - API Service Updates
**File: `client/src/utils/api.ts`**

Added new endpoint:
```typescript
logSecurityViolation: (data: object) => request.post('/interviews/security-violation', data)
```

This endpoint sends security violation data to the backend for logging and flagging.

### 5. Backend - Interview Controller
**File: `server/controllers/interviewController.js`**

Added new endpoint handler `logSecurityViolation`:
- Validates interview ownership
- Logs violation with timestamp and method
- Updates interview's anti-cheat data
- Tracks paste attempt count
- Updates integrity risk level (LOW/MEDIUM/HIGH)
- Returns violation summary

**Violation Tracking:**
- Stores violation type, method, timestamp, and user agent
- Maintains count of copy-paste attempts
- Flags interviews with multiple violations as HIGH risk
- Stores all violations in `antiCheatData.suspiciousActivities` array

### 6. Backend - Interview Routes
**File: `server/routes/interviews.js`**

Added new route:
```javascript
router.post('/security-violation', authorizeRoles('candidate'), interviewController.logSecurityViolation);
```

## Security Features

### Multi-Layer Paste Prevention
1. **Event Handlers**: onPaste, onDrop, onContextMenu
2. **Keyboard Shortcuts**: Ctrl+V, Cmd+V, Shift+Insert
3. **Browser Autofill**: autoComplete="off"
4. **Global Listeners**: Window-level keyboard event capture

### Logging & Tracking
- All paste attempts logged with:
  - Interview ID
  - Violation type (PASTE_ATTEMPT, DRAG_DROP_ATTEMPT, etc.)
  - Method used (onPaste, keyboard_shortcut, shift_insert, onDrop)
  - Timestamp
  - User agent
  - User ID

### Integrity Scoring
- Tracks number of paste attempts
- Updates integrity risk level:
  - **LOW**: 0 violations
  - **MEDIUM**: 1-2 violations
  - **HIGH**: 3+ violations
- Violations stored in interview record for review

### User Feedback
- Toast notifications on blocked actions
- Clear error messages
- Visual indicators of security violations
- Interview termination after multiple violations

## Implementation Details

### Hook Usage
```typescript
const { handlePaste, handleDrop, handleContextMenu } = useAntiPaste({
  interviewId: interview?.id,
  onCheatingDetected: () => {
    setCheatingDetected(true);
    // Handle cheating detection
  },
  enabled: true
});
```

### Textarea Integration
```tsx
<textarea
  onPaste={handlePaste}
  onDrop={handleDrop}
  onContextMenu={handleContextMenu}
  autoComplete="off"
  placeholder="Compose your answer here... (Paste disabled)"
  disabled={cheatingDetected}
/>
```

### Backend Logging
```javascript
await interviewAPI.logSecurityViolation({
  interviewId,
  violationType: 'PASTE_ATTEMPT',
  method: 'onPaste',
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent
});
```

## Database Schema Updates
The existing `antiCheatData` field in the Interview model now stores:
```javascript
{
  tabSwitches: number,
  copyPasteAttempts: number,
  suspiciousActivities: [
    {
      type: string,
      method: string,
      timestamp: Date,
      userAgent: string
    }
  ]
}
```

## Testing Checklist
- [ ] Paste via Ctrl+V is blocked
- [ ] Paste via Cmd+V is blocked (Mac)
- [ ] Paste via Shift+Insert is blocked
- [ ] Drag-and-drop is blocked
- [ ] Right-click context menu is blocked
- [ ] Browser autofill is disabled
- [ ] Toast notifications appear on blocked actions
- [ ] Violations are logged to backend
- [ ] Interview integrity risk updates correctly
- [ ] Multiple violations trigger HIGH risk flag
- [ ] Violations appear in interview report

## Affected Components
1. `InterviewSession` - Text-based interviews
2. `ProfessionalInterviewSession` - Professional interviews
3. `useAntiPaste` hook - Reusable paste prevention logic
4. Interview API - Security violation logging
5. Interview Controller - Backend violation handling
6. Interview Routes - New security endpoint

## Future Enhancements
- Add screenshot detection
- Add screen recording detection
- Add keyboard pattern analysis
- Add AI-generated text detection
- Add real-time proctoring alerts
- Add admin dashboard for violation review
