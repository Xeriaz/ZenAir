/**
 * Utility for device vibration / haptic cues in ZenAir.
 * 
 * Supports:
 * 1. Web Vibration API (navigator.vibrate) on Android browsers & Android PWAs.
 * 2. WebKit Taptic Engine Switch Workaround (<input type="checkbox" switch>) on iOS Safari 17.4+ / iOS PWAs.
 * 3. Tactile low-frequency sub-bass micro-transient via Web Audio API for iOS audio-haptic resonance.
 */

let switchLabel: HTMLLabelElement | null = null;
let activeTimeouts: number[] = [];
let audioCtx: AudioContext | null = null;

export function isIosDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIosUA = /iPad|iPhone|iPod/.test(ua);
  const isIpadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const hasSwitch = typeof HTMLInputElement !== 'undefined' && 'switch' in HTMLInputElement.prototype;
  return isIosUA || isIpadOS || hasSwitch;
}

export function getVibrationSupportType(): 'native' | 'ios-switch' | 'none' {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'none';
  if (typeof navigator.vibrate === 'function') return 'native';
  if (isIosDevice()) return 'ios-switch';
  return 'none';
}

export function isVibrationSupported(): boolean {
  return getVibrationSupportType() !== 'none';
}

export function ensureIosSwitchDOM(): HTMLLabelElement | null {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  if (switchLabel && document.body.contains(switchLabel)) return switchLabel;

  try {
    const id = 'zenair-ios-haptic-switch';
    let input = document.getElementById(id) as HTMLInputElement | null;
    let label = input?.parentElement as HTMLLabelElement | null;

    if (!label || !input) {
      label = document.createElement('label');
      label.id = 'zenair-ios-haptic-label';
      label.htmlFor = id;
      label.setAttribute('aria-hidden', 'true');
      // Kept in render tree with tiny size and low opacity so WebKit triggers Taptic Engine
      label.style.position = 'fixed';
      label.style.top = '-9999px';
      label.style.left = '-9999px';
      label.style.width = '1px';
      label.style.height = '1px';
      label.style.opacity = '0.01';
      label.style.pointerEvents = 'none';
      label.style.zIndex = '-9999';

      input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', ''); // WebKit switch attribute
      input.id = id;
      input.style.appearance = 'auto';

      label.appendChild(input);
      document.body.appendChild(label);
    }

    switchLabel = label;
    return switchLabel;
  } catch {
    return null;
  }
}

function triggerTactileAudioClick(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    // A 20ms quick micro-transient (sub-bass 150Hz -> 30Hz) giving a tactile bump
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.02);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  } catch {
    // Ignore audio errors
  }
}

function triggerSingleIosHaptic(): boolean {
  const label = ensureIosSwitchDOM();
  let triggered = false;
  if (label) {
    try {
      label.click();
      triggered = true;
    } catch {
      // Ignore
    }
  }
  triggerTactileAudioClick();
  return triggered;
}

export function triggerVibration(pattern: number | number[] = 50): boolean {
  cancelVibration();

  const hasNative = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  if (hasNative) {
    try {
      return navigator.vibrate(pattern);
    } catch {
      // Fallback to iOS switch / audio if native vibrate throws
    }
  }

  if (isIosDevice()) {
    if (typeof pattern === 'number') {
      return triggerSingleIosHaptic();
    }
    if (Array.isArray(pattern) && pattern.length > 0) {
      let delay = 0;
      triggerSingleIosHaptic();
      for (let i = 0; i < pattern.length; i++) {
        delay += pattern[i];
        if (i % 2 === 1 && i + 1 < pattern.length) {
          const tId = window.setTimeout(() => {
            triggerSingleIosHaptic();
          }, delay);
          activeTimeouts.push(tId);
        }
      }
      return true;
    }
  }

  return false;
}

export function cancelVibration(): void {
  activeTimeouts.forEach((id) => clearTimeout(id));
  activeTimeouts = [];

  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(0);
    } catch {
      // ignore
    }
  }
}

export const HAPTIC_PATTERNS = {
  sessionStart: 50,              // 50ms gentle tap on start
  phaseChange: 60,               // 60ms light cue on phase transition
  wimHofRetention: [80, 60, 80], // Double pulse before retention hold
  sessionComplete: [70, 70, 120],// Multi-tap celebration cue
  testPulse: 70                  // Test pulse in settings
};
