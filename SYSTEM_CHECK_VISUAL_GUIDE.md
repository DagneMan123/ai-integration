# System Check - Visual Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                    System Check                              │
│         Verify your setup before starting an interview       │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ✓ All systems ready!                                    │ │
│  │ You're ready to start your interview                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 📷 Camera                                           ✓   │ │
│  │ Camera working                                          │ │
│  │ Camera is accessible and ready                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🎤 Microphone                                       ✓   │ │
│  │ Microphone working                                      │ │
│  │ Microphone is accessible and ready                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 📡 Internet Connection                              ✓   │ │
│  │ Internet connected                                      │ │
│  │ Your connection is stable and ready                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🌐 Browser Compatibility                            ✓   │ │
│  │ Browser compatible                                      │ │
│  │ Chrome is fully supported                               │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │ 🔄 Re-check          │  │ ▶ Start Interview            │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ℹ️ Need help?                                               │
│  All checks must pass before you can start an interview.     │
│  If you're having issues, try the suggested fixes above      │
│  or contact support.                                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Status States

### All Checks Passed (Green)
```
┌─────────────────────────────────────┐
│ ✓ All systems ready!                │
│ You're ready to start your interview │
└─────────────────────────────────────┘
```

### Some Checks Failed (Amber)
```
┌─────────────────────────────────────┐
│ ⚠ Some checks need attention        │
│ 3/4 checks passed                   │
└─────────────────────────────────────┘
```

### Critical Issues (Red)
```
┌─────────────────────────────────────┐
│ ✗ Critical issues found             │
│ Please fix critical issues before    │
│ proceeding                           │
└─────────────────────────────────────┘
```

## Check Card States

### Success State
```
┌─────────────────────────────────────┐
│ 📷 Camera                        ✓   │
│ Camera working                       │
│ Camera is accessible and ready       │
└─────────────────────────────────────┘
```

### Warning State
```
┌─────────────────────────────────────┐
│ 📷 Camera                        ⚠   │
│ Camera permission denied             │
│ Please allow camera access in        │
│ browser settings                     │
│                                      │
│ ▼ How to fix:                        │
│   1. Check if camera is connected    │
│   2. Allow camera permission...      │
└─────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────┐
│ 📷 Camera                        ✗   │
│ Camera not available                 │
│ Camera is not connected or not       │
│ accessible                           │
│                                      │
│ ▼ How to fix:                        │
│   1. Check if camera is connected    │
│   2. Allow camera permission...      │
└─────────────────────────────────────┘
```

### Pending State
```
┌─────────────────────────────────────┐
│ 📷 Camera                        ⟳   │
│ Checking camera access...            │
└─────────────────────────────────────┘
```

## Expandable Section

### Collapsed
```
┌─────────────────────────────────────┐
│ 📷 Camera                        ⚠   │
│ Camera permission denied             │
│ Please allow camera access...        │
│                                      │
│ ▼ How to fix:                        │
└─────────────────────────────────────┘
```

### Expanded
```
┌─────────────────────────────────────┐
│ 📷 Camera                        ⚠   │
│ Camera permission denied             │
│ Please allow camera access...        │
│                                      │
│ ▲ How to fix:                        │
│   1. Check if camera is connected    │
│   2. Allow camera permission in      │
│      browser                         │
│   3. Disable camera blocking         │
│      software                        │
│   4. Try a different browser         │
└─────────────────────────────────────┘
```

## Color Scheme

### Success (Green)
```
Background: #f0fdf4 (emerald-50)
Border:     #dcfce7 (emerald-200)
Text:       #166534 (emerald-900)
Icon:       #16a34a (emerald-600)
```

### Warning (Amber)
```
Background: #fffbeb (amber-50)
Border:     #fef3c7 (amber-200)
Text:       #78350f (amber-900)
Icon:       #d97706 (amber-600)
```

### Error (Red)
```
Background: #fef2f2 (red-50)
Border:     #fee2e2 (red-200)
Text:       #7f1d1d (red-900)
Icon:       #dc2626 (red-600)
```

### Pending (Gray)
```
Background: #f9fafb (gray-50)
Border:     #e5e7eb (gray-200)
Text:       #111827 (gray-900)
Icon:       #9ca3af (gray-400)
```

## Icons Used

```
✓ CheckCircle      - Success status
⚠ AlertCircle      - Warning/Error status
⟳ Loader           - Pending status (spinning)
📷 Video           - Camera check
🎤 Mic             - Microphone check
📡 Wifi            - Internet check
🌐 Globe           - Browser check
🔄 RefreshCw       - Re-check button
ℹ️ HelpCircle      - Help information
▼ ChevronDown      - Expand section
▲ ChevronUp        - Collapse section
```

## Button States

### Re-check Button

#### Idle
```
┌──────────────────┐
│ 🔄 Re-check      │
└──────────────────┘
```

#### Checking
```
┌──────────────────┐
│ ⟳ Checking...    │
└──────────────────┘
```

### Start Interview Button

#### Disabled (Not Ready)
```
┌──────────────────────────────────┐
│ ▶ Start Interview (disabled)     │
└──────────────────────────────────┘
```

#### Enabled (Ready)
```
┌──────────────────────────────────┐
│ ▶ Start Interview                │
└──────────────────────────────────┘
```

## Responsive Breakpoints

### Mobile (< 768px)
```
┌─────────────────┐
│ System Check    │
│ Verify setup... │
├─────────────────┤
│ ✓ All ready!    │
├─────────────────┤
│ 📷 Camera   ✓   │
├─────────────────┤
│ 🎤 Microphone ✓ │
├─────────────────┤
│ 📡 Internet  ✓  │
├─────────────────┤
│ 🌐 Browser   ✓  │
├─────────────────┤
│ [Re-check]      │
│ [Start]         │
├─────────────────┤
│ ℹ️ Need help?   │
└─────────────────┘
```

### Tablet (768px - 1023px)
```
┌──────────────────────────────────┐
│ System Check                      │
│ Verify your setup...              │
├──────────────────────────────────┤
│ ✓ All systems ready!              │
│ You're ready to start...           │
├──────────────────────────────────┤
│ 📷 Camera              ✓          │
│ 🎤 Microphone          ✓          │
│ 📡 Internet            ✓          │
│ 🌐 Browser             ✓          │
├──────────────────────────────────┤
│ [Re-check]  [Start Interview]    │
├──────────────────────────────────┤
│ ℹ️ Need help?                     │
│ All checks must pass...            │
└──────────────────────────────────┘
```

### Desktop (1024px+)
```
┌────────────────────────────────────────────┐
│ System Check                               │
│ Verify your setup before starting...       │
├────────────────────────────────────────────┤
│ ✓ All systems ready!                       │
│ You're ready to start your interview       │
├────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐   │
│ │ 📷 Camera                        ✓   │   │
│ │ Camera working                       │   │
│ │ Camera is accessible and ready       │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ ┌──────────────────────────────────────┐   │
│ │ 🎤 Microphone                    ✓   │   │
│ │ Microphone working                   │   │
│ │ Microphone is accessible and ready   │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ ┌──────────────────────────────────────┐   │
│ │ 📡 Internet Connection           ✓   │   │
│ │ Internet connected                   │   │
│ │ Your connection is stable and ready  │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ ┌──────────────────────────────────────┐   │
│ │ 🌐 Browser Compatibility         ✓   │   │
│ │ Browser compatible                   │   │
│ │ Chrome is fully supported            │   │
│ └──────────────────────────────────────┘   │
├────────────────────────────────────────────┤
│ [Re-check]              [Start Interview]  │
├────────────────────────────────────────────┤
│ ℹ️ Need help?                              │
│ All checks must pass before you can start  │
│ an interview. If you're having issues...   │
└────────────────────────────────────────────┘
```

## User Flow Diagram

```
┌─────────────────┐
│  Page Loads     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Auto-Run Checks         │
│ ├─ Camera Check         │
│ ├─ Microphone Check     │
│ ├─ Internet Check       │
│ └─ Browser Check        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Display Results         │
│ ├─ Success: Green       │
│ ├─ Warning: Amber       │
│ └─ Error: Red           │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
┌────────┐  ┌──────────────┐
│ All    │  │ Some Failed  │
│ Pass   │  │              │
└───┬────┘  └──────┬───────┘
    │              │
    │              ▼
    │         ┌──────────────────┐
    │         │ View Details     │
    │         │ Read Fixes       │
    │         │ Try Fixes        │
    │         │ Re-check         │
    │         └────────┬─────────┘
    │                  │
    │         ┌────────▼─────────┐
    │         │ All Pass Now?    │
    │         └────────┬─────────┘
    │                  │
    │         ┌────────▼─────────┐
    │         │ Yes              │
    │         └────────┬─────────┘
    │                  │
    └──────────┬───────┘
               │
               ▼
        ┌─────────────────┐
        │ Start Interview │
        │ Button Enabled  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Click Button    │
        │ Navigate to     │
        │ Interview Start │
        └─────────────────┘
```

## Summary

The System Check page provides:
- ✅ Clear visual feedback
- ✅ Professional design
- ✅ Intuitive layout
- ✅ Responsive design
- ✅ Color-coded status
- ✅ Expandable sections
- ✅ Easy troubleshooting
- ✅ Smooth animations

**Status: ✅ VISUALLY COMPLETE & PROFESSIONAL**
