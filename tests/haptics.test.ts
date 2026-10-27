import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isVibrationSupported,
  getVibrationSupportType,
  isIosDevice,
  triggerVibration,
  cancelVibration,
  ensureIosSwitchDOM,
  HAPTIC_PATTERNS
} from '../src/utils/haptics';
import { INITIAL_USER_PROFILE } from '../src/db/db';

describe('Haptics and Vibration Engine', () => {
  const originalVibrate = navigator.vibrate;
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    vi.restoreAllMocks();
    const switchEl = document.getElementById('zenair-ios-haptic-label');
    if (switchEl) switchEl.remove();
  });

  afterEach(() => {
    if (originalVibrate) {
      navigator.vibrate = originalVibrate;
    } else {
      // @ts-expect-error cleanup mock
      delete navigator.vibrate;
    }
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    });
  });

  it('detects native vibration support when navigator.vibrate exists', () => {
    navigator.vibrate = vi.fn().mockReturnValue(true);
    expect(getVibrationSupportType()).toBe('native');
    expect(isVibrationSupported()).toBe(true);
  });

  it('detects iOS switch support when navigator.vibrate is undefined on iPhone', () => {
    // @ts-expect-error simulate unsupported navigator.vibrate
    delete navigator.vibrate;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      configurable: true
    });

    expect(isIosDevice()).toBe(true);
    expect(getVibrationSupportType()).toBe('ios-switch');
    expect(isVibrationSupported()).toBe(true);
  });

  it('detects none when neither vibrate nor iOS is present', () => {
    // @ts-expect-error simulate unsupported
    delete navigator.vibrate;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      configurable: true
    });

    expect(isIosDevice()).toBe(false);
    expect(getVibrationSupportType()).toBe('none');
    expect(isVibrationSupported()).toBe(false);
  });

  it('triggers native vibration when navigator.vibrate is available', () => {
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

  it('triggers iOS switch hack when on iOS device and navigator.vibrate is missing', () => {
    // @ts-expect-error simulate missing vibrate
    delete navigator.vibrate;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15',
      configurable: true
    });

    const label = ensureIosSwitchDOM();
    expect(label).toBeTruthy();
    const clickSpy = vi.spyOn(label!, 'click');

    const res = triggerVibration(60);
    expect(res).toBe(true);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('cancels vibration by sending 0 to native vibrate and clearing timeouts', () => {
    const vibrateMock = vi.fn().mockReturnValue(true);
    navigator.vibrate = vibrateMock;

    cancelVibration();
    expect(vibrateMock).toHaveBeenCalledWith(0);
  });

  it('has vibrationEnabled enabled by default in INITIAL_USER_PROFILE', () => {
    expect(INITIAL_USER_PROFILE.vibrationEnabled).toBe(true);
  });
});
