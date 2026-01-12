
export function toggleDocumentFullscreen() {
  const doc = document as any;
  const docEl = document.documentElement as any;

  // Modern API
  if (docEl.requestFullscreen) {
    if (!doc.fullscreenElement) {
        docEl.requestFullscreen().catch(() => {});
    } else {
        doc.exitFullscreen().catch(() => {});
    }
  } 
  // iOS / Safari
  else if (docEl.webkitRequestFullscreen) {
    if (!doc.webkitFullscreenElement) {
        docEl.webkitRequestFullscreen();
    } else {
        doc.webkitExitFullscreen();
    }
  }
  // Fallbacks
  else if (docEl.mozRequestFullScreen) {
    if (!doc.mozFullScreenElement) {
        docEl.mozRequestFullScreen();
    } else {
        doc.mozCancelFullScreen();
    }
  }
  else if (docEl.msRequestFullscreen) {
    if (!doc.msFullscreenElement) {
        docEl.msRequestFullscreen();
    } else {
        doc.msExitFullscreen();
    }
  }

  // Smart Lock Orientation: 
  // If height > width (Portrait device), try to lock portrait.
  // If width > height, try to lock landscape.
  // Don't force landscape if user is holding vertically.
  try {
      if (screen.orientation && (screen.orientation as any).lock) {
          const isPortrait = window.innerHeight > window.innerWidth;
          const lockType = isPortrait ? 'portrait' : 'landscape';
          (screen.orientation as any).lock(lockType).catch(() => {
              // Fail silently (not all devices support locking)
          });
      }
  } catch(e) {}
}
