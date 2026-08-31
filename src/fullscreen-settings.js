export async function applyFullscreenPreference(
  enabled,
  documentRef = globalThis.document,
) {
  try {
    if (enabled) {
      if (!documentRef?.fullscreenElement) {
        await documentRef?.documentElement?.requestFullscreen?.();
      }
    } else if (documentRef?.fullscreenElement) {
      await documentRef.exitFullscreen?.();
    }
    return true;
  } catch {
    // Browsers can reject fullscreen during startup because it lacks a user gesture.
    return false;
  }
}
