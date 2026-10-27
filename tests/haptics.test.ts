import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isVibrationSupported, triggerVibration, cancelVibration, HAPTIC_PATTERNS } from '../src/utils/haptics';
import { INITIAL_USER_PROFILE } from '../src/db/db';

describe('Haptics and Vibration Engine', () => {
  const originalVibrate = navigator.vibrate;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalVibrate) {
      navigator.vibrate = originalVibrate;
    } else {
      // @ts-expect-error cleanup mock
      delete navigator.vibrate;
    }
  });

  it('detects vibration support when navigator.vibrate exists', () => {
    navigator.vibrate = vi.fn().mockReturnValue(true);
    expect(isVibrationSupported()).toBe(true);
  });

  it('detects lack of vibration support when navigator.vibrate is undefined (e.g., iOS Safari)', () => {
    // @ts-expect-error simulated unsupported platform
    delete navigator.vibrate;
    expect(isVibrationSupported()).toBe(false);
  });

  it('triggers vibration with provided or default pattern when supported', () => {
    const vibrateMock = vi.fn().mockReturnValue(true);
    navigator.vibrate = vibrateMock;

    const resDefault = triggerVibration();
    expect(resDefault).toBe(true);
    expect(vibrateMock).toHaveBeenCalledWith(50);

    triggerVibration(HAPTIC_PATTERNS.phaseChange);
    expect(vibrateMock).toHaveBeenCalledWith(60);

    triggerVibration(HAPTIC_PATTERNS.sessionComplete);
    expect(vibrateMock).toHaveBeenCalledWith([70, 70, 120]);
  });

  it('safely handles environments where navigator.vibrate throws or is unsupported', () => {
    // @ts-expect-error simulate unsupported
    delete navigator.vibrate;
    expect(triggerVibration(50)).toBe(false);

    navigator.vibrate = vi.fn().mockImplementation(() => {
      throw new Error('NotAllowedError');
    });
    expect(triggerVibration(50)).toBe(false);
  });

  it('cancels vibration by sending 0', () => {
    const vibrateMock = vi.fn().mockReturnValue(true);
    navigator.vibrate = vibrateMock;

    cancelVibration();
    expect(vibrateMock).toHaveBeenCalledWith(0);
  });

  it('has vibrationEnabled enabled by default in INITIAL_USER_PROFILE', () => {
    expect(INITIAL_USER_PROFILE.vibrationEnabled).toBe(true);
  });
});
