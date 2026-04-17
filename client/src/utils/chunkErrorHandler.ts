/**
 * Handle chunk loading errors and retry logic
 */

let chunkFailedMessage = false;

export {};

window.addEventListener('error', (event) => {
  // Check if it's a chunk loading error
  if (/Loading chunk \d+ failed/g.test(event.message)) {
    if (!chunkFailedMessage) {
      chunkFailedMessage = true;
      
      // Show user-friendly message
      console.warn('A new version of the app is available. Reloading...');
      
      // Reload after a short delay to allow current operations to complete
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
});

// Handle unhandled promise rejections for chunk loading
window.addEventListener('unhandledrejection', (event) => {
  if (/Loading chunk \d+ failed/g.test(event.reason?.message || '')) {
    if (!chunkFailedMessage) {
      chunkFailedMessage = true;
      console.warn('A new version of the app is available. Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
});
