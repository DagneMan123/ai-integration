# Interview Security - Quick Start Guide

## What Was Implemented

A comprehensive anti-cheating system with 6 security layers:

1. ✅ **Text Selection Prevention** - CSS-based, prevents highlighting
2. ✅ **Right-Click Blocking** - Disables context menu
3. ✅ **Keyboard Shortcut Blocking** - Blocks Ctrl+C, Ctrl+V, Ctrl+X, F12, etc.
4. ✅ **Tab-Switching Detection** - Logs when user switches tabs
5. ✅ **Blur Detection** - Logs when window loses focus
6. ✅ **Paste Blocking** - Prevents pasting into answer fields

---

## Files Created

### Frontend
1. **client/src/hooks/useInterviewSecurity.ts**
   - React hook for all security measures
   - Logs violations to backend
   - Returns security stats

2. **client/src/components/InterviewSecurityWrapper.tsx**
   - Wrapper component for interview content
   - Shows security status bar
   - Displays warning messages
   - Tracks violation count

3. **client/src/styles/interviewSecurity.css**
   - CSS rules for text selection prevention
   - Styling for security components

### Backend
1. **server/routes/interviewSecurity.js**
   - POST endpoint to log violations
   - GET endpoint to retrieve security report
   - Calculates integrity score

2. **server/index.js** (UPDATED)
   - Added interview security routes

---

## How to Use

### Step 1: Import CSS
```typescript
import '../styles/interviewSecurity.css';
```

### Step 2: Wrap Interview Component
```typescript
import InterviewSecurityWrapper from '../components/InterviewSecurityWrapper';

export const InterviewPage = () => {
  return (
    <InterviewSecurityWrapper
      interviewId={interviewId}
      maxViolations={5}
      showSecurityStatus={true}
      onMaxViolationsReached={() => {
        // Handle max violations - end interview
        completeInterview();
      }}
      onSecurityViolation={(violation) => {
        console.log('Violation detected:', violation);
      }}
    >
      {/* Your interview content here */}
      <div className="interview-content">
        <h2 className="interview-question">Question text here</h2>
        <textarea className="answer-input" placeholder="Your answer here" />
      </div>
    </InterviewSecurityWrapper>
  );
};
```

### Step 3: Apply CSS Classes
```html
<!-- Question (no selection allowed) -->
<h2 class="interview-question">What is React?</h2>

<!-- Answer input (selection allowed) -->
<textarea class="answer-input" placeholder="Your answer"></textarea>
```

---

## Security Features

### Text Selection Prevention
```css
.interview-secure {
  user-select: none;
}

.answer-input {
  user-select: text;  /* Allow selection only here */
}
```

### Blocked Shortcuts
- `Ctrl+C` - Copy
- `Ctrl+V` - Paste
- `Ctrl+X` - Cut
- `Ctrl+A` - Select All
- `F12` - Developer Tools
- `Ctrl+Shift+I` - Developer Tools
- `Ctrl+Shift+J` - Developer Tools

### Detected Events
- Tab switching
- Window blur/focus loss
- Paste attempts
- Right-click attempts

---

## Violation Tracking

### Integrity Score
```
Score = 100
Score -= (copyPasteAttempts × 5)
Score -= (rightClickAttempts × 3)
Score -= (keyboardShortcutAttempts × 4)
Score -= (tabSwitches × 10)
Score -= (blurEvents × 8)
```

### Risk Levels
- **80-100:** LOW - Trustworthy
- **60-79:** MEDIUM - Acceptable
- **40-59:** HIGH - Suspicious
- **0-39:** CRITICAL - Highly suspicious

---

## API Endpoints

### Log Violation
```
POST /api/interview-security/security-violation
{
  "interviewId": 123,
  "violationType": "copy",
  "details": "Ctrl+C attempted",
  "timestamp": "2024-01-15T10:30:00Z",
  "violationCount": 1
}
```

### Get Security Report
```
GET /api/interview-security/:interviewId/security-report

Returns:
{
  "integrityScore": 95,
  "integrityRisk": "LOW",
  "violations": {
    "copyPasteAttempts": 1,
    "tabSwitches": 0,
    "blurEvents": 0,
    "totalViolations": 1
  },
  "recommendation": "TRUSTWORTHY"
}
```

---

## Status Bar Display

### Secure (Green)
```
✓ Interview Secure
Violations: 0 / 5
Tab Switches: 0 | Blurs: 0
```

### Warning (Yellow)
```
⚠️ Security Warning
Violations: 3 / 5
Tab Switches: 1 | Blurs: 2
```

### Critical (Red)
```
❌ Critical Security Alert
Violations: 5 / 5 - Maximum violations reached
Tab Switches: 3 | Blurs: 4
```

---

## Warning Messages

| Event | Message |
|---|---|
| Copy | ❌ Text copying is not allowed during the interview |
| Paste | ❌ Pasting is not allowed during the interview |
| Cut | ❌ Text cutting is not allowed during the interview |
| Right-click | ❌ Right-click is disabled during the interview |
| Tab switch | ⚠️ Tab switching detected and logged |
| Blur | ⚠️ Window focus lost and logged |
| Shortcut | ❌ This keyboard shortcut is not allowed |

---

## Testing

### Test Text Selection
1. Try to select question text → Should not work
2. Try to select answer input → Should work

### Test Copy/Paste
1. Try Ctrl+C → Should be blocked
2. Try Ctrl+V → Should be blocked
3. Try right-click paste → Should be blocked

### Test Tab Switching
1. Click another tab → Should log violation
2. Return to interview → Should show warning

### Test Window Blur
1. Click outside browser → Should log violation
2. Return to browser → Should show warning

### Test Developer Tools
1. Press F12 → Should be blocked
2. Press Ctrl+Shift+I → Should be blocked

---

## Configuration

### Enable/Disable Features
```typescript
const securityStats = useInterviewSecurity({
  interviewId: 123,
  enableTextSelection: true,        // Disable text selection
  enableRightClick: true,           // Disable right-click
  enablePaste: true,                // Disable paste
  enableKeyboardShortcuts: true,    // Disable shortcuts
  enableTabSwitchDetection: true,   // Detect tab switches
  enableBlurDetection: true         // Detect blur events
});
```

### Set Max Violations
```typescript
<InterviewSecurityWrapper
  interviewId={interviewId}
  maxViolations={5}  // End interview after 5 violations
  onMaxViolationsReached={() => {
    // Handle max violations
  }}
>
  {/* Content */}
</InterviewSecurityWrapper>
```

---

## Development Mode

In development, a violation log appears at the bottom showing:
- Violation type
- Details
- Timestamp
- Count

This is hidden in production.

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| All Features | ✅ | ✅ | ✅ | ✅ |

---

## Limitations

⚠️ **Important:** These are client-side measures and can be bypassed by determined users.

**Recommendations:**
1. Combine with video proctoring
2. Validate answers on backend
3. Use randomized questions
4. Manually review suspicious interviews
5. Set minimum integrity score threshold

---

## Troubleshooting

### Text selection still works
- Check CSS is imported
- Verify `.interview-secure` class is applied
- Check browser console for errors

### Violations not logging
- Check backend route is registered
- Verify API endpoint is correct
- Check network tab for failed requests

### Status bar not updating
- Check `maxViolations` prop
- Verify `onSecurityViolation` callback
- Check browser console for errors

---

## Next Steps

1. ✅ Import CSS in interview component
2. ✅ Wrap interview with `InterviewSecurityWrapper`
3. ✅ Apply CSS classes to elements
4. ✅ Test all security features
5. ✅ Configure max violations threshold
6. ✅ Set up violation handling
7. ✅ Deploy to production
8. ✅ Monitor security reports

---

## Support

For detailed documentation, see:
- `INTERVIEW_SECURITY_IMPLEMENTATION.md` - Complete documentation
- `client/src/hooks/useInterviewSecurity.ts` - Hook source code
- `client/src/components/InterviewSecurityWrapper.tsx` - Component source code
- `server/routes/interviewSecurity.js` - Backend source code
