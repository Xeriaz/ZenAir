/**
 * Utility for device vibration / haptic cues in ZenAir.
 * Uses the Web Vibration API (navigator.vibrate).
 * Supported in Android browsers & Android PWAs.
 * Safely no-ops in unsupported environments (e.g., iOS WebKit/Safari or desktop).
 */

export function isVibrationSupported(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

export function triggerVibration(pattern: number | number[] = 50): boolean {
  if (!isVibrationSupported()) return false;
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

export function cancelVibration(): void {
  if (!isVibrationSupported()) return;
  try {
    navigator.vibrate(0);
  } catch {
    // ignore
  }
}

export const HAPTIC_PATTERNS = {
  sessionStart: 50,              // 50ms gentle tap on start
  phaseChange: 60,               // 60ms light cue on phase transition
  wimHofRetention: [80, 60, 80], // Double pulse before retention hold
  sessionComplete: [70, 70, 120],// Multi-tap celebration cue
  testPulse: 70                  // Test pulse in settings
};
