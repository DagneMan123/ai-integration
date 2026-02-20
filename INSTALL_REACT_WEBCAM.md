# Install react-webcam - Complete Guide

## Problem
The `WebcamVerification.tsx` component requires `react-webcam` which is not installed.

```
Error: Cannot find module 'react-webcam'
```

## Solution

### Option 1: Automatic Installation (Recommended)
Run the batch script:
```bash
install-webcam.bat
```

This will automatically:
1. Navigate to the client directory
2. Install `react-webcam` with `--legacy-peer-deps` flag
3. Install TypeScript types for react-webcam

### Option 2: Manual Installation

#### Step 1: Navigate to client directory
```bash
cd client
```

#### Step 2: Install react-webcam with legacy peer deps
```bash
npm install react-webcam --legacy-peer-deps
```

#### Step 3: Install TypeScript types (optional but recommended)
```bash
npm install --save-dev @types/react-webcam
```

#### Step 4: Verify installation
Check that `react-webcam` appears in `client/package.json`:
```json
{
  "dependencies": {
    "react-webcam": "^7.2.0"
  },
  "devDependencies": {
    "@types/react-webcam": "^3.0.0"
  }
}
```

## Why --legacy-peer-deps?

The `--legacy-peer-deps` flag is needed because:
- `react-webcam` has peer dependency requirements
- `react-scripts` expects specific versions
- This flag allows npm to bypass strict peer dependency checks
- It's safe to use in this case

## What Gets Installed

### Main Package
- **react-webcam** (^7.2.0) - React component for webcam access

### Type Definitions
- **@types/react-webcam** (^3.0.0) - TypeScript type definitions

## After Installation

1. **Restart the development server:**
   ```bash
   cd client
   npm start
   ```

2. **The WebcamVerification component will now work:**
   - Can be imported: `import WebcamVerification from '../components/WebcamVerification'`
   - Can be used in interview sessions
   - Provides identity verification via webcam

## Troubleshooting

### If installation fails:

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   cd client
   rm -r node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

3. **Check Node.js version:**
   ```bash
   node --version
   ```
   (Should be v14 or higher)

### If TypeScript errors persist:

1. **Restart TypeScript server** in your IDE
2. **Clear TypeScript cache:**
   ```bash
   rm -r node_modules/.cache
   ```
3. **Rebuild:**
   ```bash
   npm run build
   ```

## Features Enabled

After installation, the WebcamVerification component provides:

✅ **Webcam Access**
- Real-time video feed from user's camera
- Automatic permission requests

✅ **Identity Verification**
- Capture screenshots from webcam
- Send to backend for verification
- Track verification status

✅ **Error Handling**
- Graceful fallback if camera unavailable
- User-friendly error messages
- Permission denial handling

✅ **Auto-Capture**
- Optional periodic capture during interviews
- Configurable capture intervals
- Background verification

## Files Updated

- `client/package.json` - Added react-webcam dependency
- `client/src/components/WebcamVerification.tsx` - Uses react-webcam

## Next Steps

1. Run installation script or manual commands
2. Restart development server
3. Test WebcamVerification component in interview flow
4. Verify webcam access works in browser

---

**Status**: Ready to install
**Installation Time**: ~2-3 minutes
**Disk Space**: ~5MB
