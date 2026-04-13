# Interview System Troubleshooting Guide

## Quick Troubleshooting Checklist

### Permission Denied Error

**Error**: "NotAllowedError: Permission dismissed" or "Camera and microphone permissions are required"

**Quick Fix**:
1. Click the "Retry" button in the setup screen
2. When prompted, click "Allow" to grant permissions
3. If still not working, follow browser-specific steps below

**Chrome/Edge**:
```
1. Click the lock icon in the address bar
2. Click "Site settings"
3. Find "Camera" and "Microphone"
4. Change from "Block" to "Allow"
5. Refresh the page
6. Click "Retry" button
```

**Firefox**:
```
1. Click the lock icon in the address bar
2. Click the arrow next to "Permissions"
3. Click "Clear" next to camera/microphone
4. Refresh the page
5. Allow access when prompted
6. Click "Retry" button
```

**Safari**:
```
1. Go to Safari → Preferences → Websites
2. Select "Camera" from left sidebar
3. Find this website and change to "Allow"
4. Select "Microphone" from left sidebar
5. Find this website and change to "Allow"
6. Refresh the page
7. Click "Retry" button
```

---

### Camera Not Showing

**Symptoms**: Black screen in camera preview

**Possible Causes**:
- Camera is blocked by permissions
- Camera is in use by another application
- Camera is disabled in system settings
- Camera driver is not installed

**Solutions**:
1. **Check Permissions**:
   - Follow permission steps above
   - Click "Retry" button

2. **Close Other Apps**:
   - Close Zoom, Teams, Google Meet
   - Close other browser tabs with camera access
   - Close screen recording software
   - Close any other app using camera

3. **Check System Settings**:
   - Windows: Settings → Privacy & Security → Camera
   - Mac: System Preferences → Security & Privacy → Camera
   - Linux: Check device permissions

4. **Restart Browser**:
   - Close all browser windows
   - Reopen browser
   - Navigate back to practice page
   - Click "Retry" button

5. **Update Drivers**:
   - Windows: Device Manager → Cameras → Update driver
   - Mac: Software Update
   - Linux: Update system packages

---

### Microphone Not Working

**Symptoms**: Microphone volume bar not moving, no audio recording

**Possible Causes**:
- Microphone is muted
- Microphone is blocked by permissions
- Microphone is in use by another application
- Microphone is disabled in system settings
- Microphone is not selected as default device

**Solutions**:
1. **Check Microphone Mute**:
   - Check physical mute button on microphone
   - Check system volume settings
   - Check browser volume settings

2. **Check Permissions**:
   - Follow permission steps above
   - Click "Retry" button

3. **Close Other Apps**:
   - Close Zoom, Teams, Google Meet
   - Close other browser tabs with microphone access
   - Close any other app using microphone

4. **Select Default Microphone**:
   - Windows: Settings → Sound → Input devices
   - Mac: System Preferences → Sound → Input
   - Linux: Settings → Sound → Input Device

5. **Test Microphone**:
   - Windows: Settings → Sound → Input → Test your microphone
   - Mac: System Preferences → Sound → Input → Check levels
   - Linux: Use system sound settings

---

### Hardware Not Found Error

**Error**: "Camera or microphone not found"

**Possible Causes**:
- Hardware is not connected
- Hardware is disabled
- Hardware drivers are not installed
- Wrong device selected

**Solutions**:
1. **Check Physical Connection**:
   - Ensure camera/microphone is plugged in
   - Try different USB port
   - Check cable connections

2. **Enable Hardware**:
   - Windows: Device Manager → Enable device
   - Mac: System Preferences → Security & Privacy
   - Linux: Check device permissions

3. **Install Drivers**:
   - Windows: Download from manufacturer website
   - Mac: Usually automatic
   - Linux: Install via package manager

4. **Select Correct Device**:
   - Windows: Settings → Sound → Input devices
   - Mac: System Preferences → Sound → Input
   - Linux: Settings → Sound → Input Device

5. **Restart Computer**:
   - Restart to reset hardware detection
   - Reconnect devices
   - Try again

---

### Hardware In Use Error

**Error**: "Camera or microphone is already in use"

**Possible Causes**:
- Another application is using the hardware
- Another browser tab has camera/microphone access
- System resource conflict

**Solutions**:
1. **Close Other Applications**:
   - Close Zoom, Teams, Google Meet
   - Close Skype, Discord
   - Close OBS, Streamlabs
   - Close any video conferencing app

2. **Close Other Browser Tabs**:
   - Close other tabs with camera access
   - Close other browser windows
   - Close browser completely and reopen

3. **Check System Processes**:
   - Windows: Task Manager → End unnecessary processes
   - Mac: Activity Monitor → Force quit apps
   - Linux: System Monitor → Kill processes

4. **Restart Browser**:
   - Close all browser windows
   - Reopen browser
   - Navigate back to practice page
   - Click "Retry" button

5. **Restart Computer**:
   - Restart to reset all resources
   - Try again

---

### Timer Not Counting Down

**Symptoms**: Timer appears frozen or not updating

**Possible Causes**:
- Browser tab is not active
- JavaScript is not running
- Browser performance issue

**Solutions**:
1. **Make Tab Active**:
   - Click on the browser tab
   - Ensure tab is in focus

2. **Refresh Page**:
   - Press F5 or Ctrl+R
   - Wait for page to load
   - Click "Retry" button

3. **Clear Browser Cache**:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Develop → Empty Caches
   - Refresh page

4. **Try Different Browser**:
   - Try Chrome, Firefox, Safari, or Edge
   - See if issue persists

---

### Recording Not Saving

**Symptoms**: "Submit & Next" button doesn't work, response not saved

**Possible Causes**:
- Recording was not started
- Recording was not stopped
- Browser storage is full
- JavaScript error

**Solutions**:
1. **Check Recording Status**:
   - Ensure "Start Recording" was clicked
   - Ensure "Stop Recording" was clicked
   - Look for red recording indicator

2. **Free Up Storage**:
   - Clear browser cache
   - Delete old files
   - Free up disk space

3. **Check Browser Console**:
   - Press F12 to open developer tools
   - Go to Console tab
   - Look for error messages
   - Report errors to support

4. **Try Again**:
   - Click "End Session"
   - Start new practice session
   - Try recording again

---

### Session Auto-Submitted

**Symptoms**: Interview ended unexpectedly, session auto-submitted

**Possible Causes**:
- Timer reached 0
- Browser tab became inactive
- Network connection lost
- Browser crashed

**Solutions**:
1. **Check Timer**:
   - Ensure you have enough time
   - Answer questions quickly
   - Don't spend too long on one question

2. **Keep Tab Active**:
   - Don't switch to other tabs
   - Keep browser window in focus
   - Minimize other windows

3. **Check Internet Connection**:
   - Ensure stable WiFi or ethernet
   - Move closer to router
   - Restart router if needed

4. **Use Stable Browser**:
   - Use Chrome or Firefox (most stable)
   - Close other browser tabs
   - Close other applications

---

### Results Not Loading

**Symptoms**: Results page shows loading spinner indefinitely

**Possible Causes**:
- Network connection issue
- Server error
- Browser cache issue

**Solutions**:
1. **Check Internet Connection**:
   - Ensure you're connected to internet
   - Try opening another website
   - Restart router if needed

2. **Refresh Page**:
   - Press F5 or Ctrl+R
   - Wait for page to load

3. **Clear Browser Cache**:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Develop → Empty Caches
   - Refresh page

4. **Try Different Browser**:
   - Try Chrome, Firefox, Safari, or Edge
   - See if issue persists

5. **Check Server Status**:
   - Try accessing other pages
   - Check if server is running
   - Contact support if server is down

---

### Can't Download Report

**Symptoms**: "Download Report" button doesn't work

**Possible Causes**:
- Browser blocked download
- Disk space full
- JavaScript error

**Solutions**:
1. **Check Browser Settings**:
   - Chrome: Settings → Privacy and security → Site settings → Downloads
   - Firefox: Preferences → Files & Applications
   - Safari: Preferences → General → File download location
   - Allow downloads from this site

2. **Free Up Disk Space**:
   - Delete unnecessary files
   - Empty trash/recycle bin
   - Free up at least 100MB

3. **Try Different Browser**:
   - Try Chrome, Firefox, Safari, or Edge
   - See if download works

4. **Check Downloads Folder**:
   - File might have downloaded
   - Check Downloads folder
   - Look for "interview-report.pdf"

---

### Performance Issues

**Symptoms**: Lag, stuttering, slow response

**Possible Causes**:
- Too many browser tabs open
- Low system resources
- Network latency
- Browser performance issue

**Solutions**:
1. **Close Other Tabs**:
   - Close unnecessary browser tabs
   - Close other applications
   - Free up system memory

2. **Restart Browser**:
   - Close all browser windows
   - Reopen browser
   - Navigate back to practice page

3. **Check Internet Speed**:
   - Run speed test at speedtest.net
   - Ensure minimum 2 Mbps
   - Move closer to router

4. **Update Browser**:
   - Chrome: Help → About Google Chrome
   - Firefox: Help → About Firefox
   - Safari: App Store → Updates
   - Edge: Help and feedback → About Microsoft Edge

5. **Restart Computer**:
   - Restart to free up resources
   - Close background applications
   - Try again

---

### Mobile/Tablet Issues

**Symptoms**: Interview doesn't work on mobile or tablet

**Note**: Interview system is optimized for desktop/laptop

**Solutions**:
1. **Use Desktop Browser**:
   - Use Chrome, Firefox, Safari, or Edge on desktop
   - Mobile browsers have limited WebRTC support

2. **If Must Use Mobile**:
   - Use Chrome on Android
   - Use Safari on iOS
   - Ensure camera and microphone permissions are granted
   - Use landscape orientation for better layout

---

## Advanced Troubleshooting

### Check Browser Console for Errors

1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for red error messages
4. Note the error message and line number
5. Report to support with screenshot

### Check Network Tab

1. Press F12 to open Developer Tools
2. Go to Network tab
3. Refresh page
4. Look for failed requests (red)
5. Check response status codes
6. Report to support with details

### Check Application Storage

1. Press F12 to open Developer Tools
2. Go to Application tab
3. Check Local Storage
4. Check Session Storage
5. Check Cookies
6. Clear if necessary and refresh

---

## When to Contact Support

Contact support if:
- Error persists after trying all solutions
- Error message is unclear
- Hardware is working but still getting errors
- Multiple browsers have the same issue
- Server appears to be down
- Need additional assistance

**Provide**:
- Error message (exact text)
- Browser and version
- Operating system
- Steps to reproduce
- Screenshots of error
- Browser console errors

---

## Useful Links

- [WebRTC Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Browser Compatibility](https://caniuse.com/mediarecorder)

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Permission denied | Click "Retry" button, then "Allow" |
| Camera not showing | Close other apps, click "Retry" |
| Microphone not working | Check mute, close other apps, click "Retry" |
| Hardware not found | Check physical connection, restart computer |
| Hardware in use | Close other apps, restart browser |
| Timer frozen | Refresh page, click "Retry" |
| Recording not saving | Ensure recording was started and stopped |
| Results not loading | Refresh page, check internet connection |
| Performance lag | Close other tabs, restart browser |
| Mobile issues | Use desktop browser instead |
