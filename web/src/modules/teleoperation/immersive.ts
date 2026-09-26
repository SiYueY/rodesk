let active = false;
let requestId = 0;

function isTouchDevice(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

export async function enterTeleoperationImmersiveMode(): Promise<void> {
  if (!isTouchDevice()) return;
  active = true;
  const currentRequest = ++requestId;
  let enteredFullscreen = false;

  try {
    if (!document.fullscreenElement) {
      // Start this request directly inside the user's click handler.
      await document.documentElement.requestFullscreen();
      enteredFullscreen = true;
    }
  } catch {
    // Fullscreen may be unavailable or denied by the browser.
  }

  if (currentRequest !== requestId) {
    if (!active && enteredFullscreen && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
    return;
  }

  try {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (type: 'landscape') => Promise<void>;
    };
    await orientation?.lock?.('landscape');
    if (currentRequest !== requestId) orientation?.unlock();
  } catch {
    // Orientation locking is not supported in every mobile browser.
  }
}

export function leaveTeleoperationImmersiveMode(): void {
  if (!isTouchDevice()) return;
  active = false;
  requestId++;
  screen.orientation?.unlock();
  if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
}
