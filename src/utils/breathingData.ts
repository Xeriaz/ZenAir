import type { BreathingExerciseId, BreathingStandard } from '../types';

export interface BreathingPhaseStep {
  name: string;
  cue: string;
  durationSeconds: number;
  type: 'inhale' | 'inhale_topup' | 'hold' | 'exhale' | 'hold_empty' | 'retention_hold' | 'recovery_hold';
  scaleStart: number;
  scaleEnd: number;
  color: string;
}

export interface BreathingConfig extends BreathingStandard {
  cyclesPerSession?: number;
  isCustomStateFlow?: boolean; // For Wim Hof method
  steps: BreathingPhaseStep[];
}

export const BREATHING_STANDARDS: Record<BreathingExerciseId, BreathingConfig> = {
  box: {
    id: 'box',
    name: 'Box Breathing',
    tagline: '4-4-4-4 Equal Quad Cadence',
    description: 'Navy SEAL-tested protocol to rapidly downregulate the nervous system, lower cortisol, and regain mental clarity under pressure.',
    defaultDurationMinutes: 3,
    benefits: ['Regulates heart rate variability (HRV)', 'Sharpened focus and mental presence', 'Reduces acute stress'],
    steps: [
      { name: 'Inhale', cue: 'Breathe In Deeply', durationSeconds: 4, type: 'inhale', scaleStart: 1.0, scaleEnd: 1.6, color: '#06b6d4' },
      { name: 'Hold', cue: 'Hold with Lungs Full', durationSeconds: 4, type: 'hold', scaleStart: 1.6, scaleEnd: 1.6, color: '#3b82f6' },
      { name: 'Exhale', cue: 'Slowly Exhale Empty', durationSeconds: 4, type: 'exhale', scaleStart: 1.6, scaleEnd: 1.0, color: '#8b5cf6' },
      { name: 'Hold', cue: 'Hold on Empty Lungs', durationSeconds: 4, type: 'hold_empty', scaleStart: 1.0, scaleEnd: 1.0, color: '#6366f1' }
    ]
  },
  relax_478: {
    id: 'relax_478',
    name: '4-7-8 Relaxing Breath',
    tagline: 'Dr. Andrew Weil Parasympathetic Activator',
    description: 'Natural tranquilizer for the autonomic nervous system. The prolonged exhale stimulates the vagus nerve to slow heart rate.',
    defaultDurationMinutes: 5,
    benefits: ['Induces deep physical relaxation', 'Ideal before bedtime and sleep', 'Calms racing anxious thoughts'],
    steps: [
      { name: 'Inhale', cue: 'Quiet Inhale Through Nose', durationSeconds: 4, type: 'inhale', scaleStart: 1.0, scaleEnd: 1.65, color: '#10b981' },
      { name: 'Hold', cue: 'Hold Breath Gently', durationSeconds: 7, type: 'hold', scaleStart: 1.65, scaleEnd: 1.65, color: '#06b6d4' },
      { name: 'Exhale', cue: 'Whoosh Exhale Through Mouth', durationSeconds: 8, type: 'exhale', scaleStart: 1.65, scaleEnd: 1.0, color: '#8b5cf6' }
    ]
  },
  wim_hof: {
    id: 'wim_hof',
    name: 'Wim Hof Method',
    tagline: '30 Power Breaths + Retention Hold + Recovery',
    description: 'Immune and energy-boosting hyper-oxygenation technique. 30 deep conscious breaths followed by an unforced breath retention hold and a 15-second recovery lock.',
    defaultDurationMinutes: 5,
    isCustomStateFlow: true,
    benefits: ['Elevates energy and alertness', 'Strengthens immune resilience', 'Deep mind-body alkaline reset'],
    steps: [
      { name: 'Power Inhale', cue: 'Deep Inhale — Belly to Chest', durationSeconds: 2, type: 'inhale', scaleStart: 1.0, scaleEnd: 1.7, color: '#f59e0b' },
      { name: 'Let Go', cue: 'Release Gently (Don’t Force)', durationSeconds: 1.5, type: 'exhale', scaleStart: 1.7, scaleEnd: 1.1, color: '#06b6d4' }
    ]
  },
  coherent_55: {
    id: 'coherent_55',
    name: 'Coherent (Equal) 5-5',
    tagline: 'Cardiorespiratory Resonance Breathing',
    description: 'Paced breathing at approximately 6 breaths per minute. Aligns heart rate, blood pressure, and brain wave rhythms in optimal coherence.',
    defaultDurationMinutes: 5,
    benefits: ['Optimal Heart Rate Variability (HRV)', 'Emotional balance and inner stability', 'Sustainable calm focus during work'],
    steps: [
      { name: 'Inhale', cue: 'Smooth Continuous Inhale', durationSeconds: 5, type: 'inhale', scaleStart: 1.0, scaleEnd: 1.6, color: '#38bdf8' },
      { name: 'Exhale', cue: 'Smooth Continuous Exhale', durationSeconds: 5, type: 'exhale', scaleStart: 1.6, scaleEnd: 1.0, color: '#a855f7' }
    ]
  },
  physio_sigh: {
    id: 'physio_sigh',
    name: 'Physiological Sigh',
    tagline: 'Huberman Double Inhale + Extended Exhale',
    description: 'The fastest biological mechanism to quell acute autonomic arousal in real-time. Re-inflates collapsed pulmonary alveoli and expels excess CO2.',
    defaultDurationMinutes: 2,
    benefits: ['Instant nervous system relief in seconds', 'Relieves chest tightness and sighing dyspnea', 'Reset during high-stress spikes'],
    steps: [
      { name: 'Deep Inhale', cue: 'First Inhale Deeply', durationSeconds: 2, type: 'inhale', scaleStart: 1.0, scaleEnd: 1.45, color: '#06b6d4' },
      { name: 'Top-Up Inhale', cue: 'Extra Inhale at the Top!', durationSeconds: 1, type: 'inhale_topup', scaleStart: 1.45, scaleEnd: 1.7, color: '#38bdf8' },
      { name: 'Long Exhale', cue: 'Slow Emptying Sigh', durationSeconds: 6, type: 'exhale', scaleStart: 1.7, scaleEnd: 1.0, color: '#818cf8' }
    ]
  }
};
