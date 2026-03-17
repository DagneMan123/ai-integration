# Session Monitoring & Global Settings Sidebar

## Features Implemented

### 1. Session Monitoring Hook
**File**: `client/src/hooks/useSessionMonitoring.ts`

Tracks user activity and session data:
- **Login Time**: When user logged in
- **Last Activity**: Last user interaction
- **Session Duration**: How long user has been logged in
- **Page Visits**: All pages visited during session
- **Current Page**: Current page user is on
- **Activity Status**: Whether user is active or inactive

**Features**:
- Tracks mouse movement, keyboard input, and clicks
- Auto-detects inactivity (15 minutes)
- Stores session data in localStorage
- Updates session duration every second
- Monitors page navigation

### 2. Global Settings Sidebar
**File**: `client/src/components/SettingsSidebar.tsx`

Accessible from any dashboard page via settings icon in header.

**Settings Available**:
- **Notifications**
  - Push Notifications toggle
  - Email Notifications toggle
- **Preferences**
  - Sound Effects toggle
  - Dark Mode toggle
- **Security**
  - Change Password button
  - Privacy Settings button
- **Session Info**
  - Current status
  - Last activity time
  - Device information

### 3. Updated Dashboard Layout
**File**: `client/src/components/DashboardLayout.tsx`

**Changes**:
- Added Settings button in header
- Integrated session monitoring
- Added SettingsSidebar component
- Settings accessible on all dashboard pages

## How It Works

### Session Monitoring
```typescript
const sessionData = useSessionMonitoring();

// Returns:
{
  userId: 1,
  loginTime: Date,
  lastActivityTime: Date,
  sessionDuration: 3600, // seconds
  pageVisits: ['/candidate/dashboard', '/candidate/profile'],
  currentPage: '/candidate/profile',
  isActive: true
}
```

### Settings Sidebar
```typescript
<SettingsSidebar 
  isOpen={settingsOpen} 
  onClose={() => setSettingsOpen(false)} 
/>
```

## Usage

### For Developers

1. **Access Session Data**:
```typescript
import { useSessionMonitoring } from '../hooks/useSessionMonitoring';

function MyComponent() {
  const sessionData = useSessionMonitoring();
  
  return (
    <div>
      Session Duration: {sessionData?.sessionDuration}s
      Current Page: {sessionData?.currentPage}
    </div>
  );
}
```

2. **Customize Settings**:
Edit `client/src/components/SettingsSidebar.tsx` to add more settings.

### For Users

1. **Access Settings**:
   - Click the Settings icon (gear icon) in the header
   - Settings sidebar slides in from the right

2. **Manage Preferences**:
   - Toggle notifications on/off
   - Enable/disable sound effects
   - Switch to dark mode
   - View session information

3. **Security Options**:
   - Change password
   - Manage privacy settings

## Technical Details

### Session Monitoring
- **Event Listeners**: mousemove, keypress, click, popstate
- **Inactivity Timeout**: 15 minutes
- **Storage**: localStorage (updated every 5 seconds)
- **Duration Update**: Every 1 second

### Settings Sidebar
- **Position**: Fixed right side
- **Width**: 320px (w-80)
- **Overlay**: Semi-transparent on mobile
- **Animation**: Smooth slide-in/out
- **Responsive**: Full width on mobile, fixed on desktop

## Files Created

1. `client/src/hooks/useSessionMonitoring.ts` - Session tracking hook
2. `client/src/components/SettingsSidebar.tsx` - Settings sidebar component

## Files Modified

1. `client/src/components/DashboardLayout.tsx` - Added settings button and sidebar

## Integration Points

### Available on All Dashboard Pages
- Candidate Dashboard
- Employer Dashboard
- Admin Dashboard
- All sub-pages (Profile, Jobs, Applications, etc.)

### Session Data Stored
- localStorage key: `session_{userId}`
- Updated every 5 seconds
- Persists across page refreshes

## Future Enhancements

1. **Backend Integration**:
   - Send session data to server
   - Track sessions in database
   - Generate session reports

2. **Advanced Settings**:
   - Theme customization
   - Language selection
   - Timezone settings
   - Data export options

3. **Activity Analytics**:
   - Time spent per page
   - Most visited pages
   - Peak activity times
   - User behavior patterns

4. **Security Features**:
   - Session timeout warning
   - Device management
   - Login history
   - Two-factor authentication

## Testing

### Test Session Monitoring
1. Login to dashboard
2. Move mouse, type, or click
3. Check localStorage: `session_{userId}`
4. Verify session duration increases
5. Check page visits array

### Test Settings Sidebar
1. Click Settings icon in header
2. Toggle settings on/off
3. Verify toggles work
4. Click "Save Settings"
5. Close sidebar with X button

## Performance Impact

- ✓ Minimal performance impact
- ✓ Event listeners are efficient
- ✓ localStorage updates every 5 seconds (not real-time)
- ✓ No server requests for session tracking (yet)

## Browser Compatibility

- ✓ Chrome/Edge (latest)
- ✓ Firefox (latest)
- ✓ Safari (latest)
- ✓ Mobile browsers

## Security Considerations

1. **Session Data**: Stored in localStorage (client-side only)
2. **Inactivity Detection**: 15-minute timeout
3. **Activity Tracking**: Only tracks user interactions
4. **Privacy**: No sensitive data stored

## Troubleshooting

### Session Data Not Updating
- Check browser console for errors
- Verify localStorage is enabled
- Check user is logged in
- Verify useSessionMonitoring hook is called

### Settings Sidebar Not Opening
- Check Settings button is visible
- Verify onClick handler is working
- Check z-index conflicts
- Verify SettingsSidebar component is imported

### Settings Not Saving
- Implement backend API call
- Add validation before saving
- Show success/error messages
- Add loading state

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are created
3. Check imports are correct
4. Verify component props are passed correctly
