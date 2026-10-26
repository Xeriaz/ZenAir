import { describe, it, expect } from 'vitest';
import { BREATHING_STANDARDS } from '../src/utils/breathingData';

describe('Guided Breathing Engine Standards', () => {
  it('should have all 5 pre-configured standards defined', () => {
    const keys = Object.keys(BREATHING_STANDARDS);
    expect(keys).toContain('box');
    expect(keys).toContain('relax_478');
    expect(keys).toContain('wim_hof');
    expect(keys).toContain('coherent_55');
    expect(keys).toContain('physio_sigh');
  });

  it('should verify Box Breathing (4-4-4-4) cadence', () => {
    const box = BREATHING_STANDARDS.box;
    expect(box.steps.length).toBe(4);
    expect(box.steps[0].durationSeconds).toBe(4); // Inhale
    expect(box.steps[1].durationSeconds).toBe(4); // Hold
    expect(box.steps[2].durationSeconds).toBe(4); // Exhale
    expect(box.steps[3].durationSeconds).toBe(4); // Hold Empty
  });

  it('should verify 4-7-8 Relaxing Breath cadence', () => {
    const relax = BREATHING_STANDARDS.relax_478;
    expect(relax.steps.length).toBe(3);
    expect(relax.steps[0].durationSeconds).toBe(4); // Inhale
    expect(relax.steps[1].durationSeconds).toBe(7); // Hold
    expect(relax.steps[2].durationSeconds).toBe(8); // Exhale
  });

  it('should verify Physiological Sigh double-inhale cadence', () => {
    const sigh = BREATHING_STANDARDS.physio_sigh;
    expect(sigh.steps.length).toBe(3);
    expect(sigh.steps[0].type).toBe('inhale');
    expect(sigh.steps[0].durationSeconds).toBe(2);
    expect(sigh.steps[1].type).toBe('inhale_topup');
    expect(sigh.steps[1].durationSeconds).toBe(1);
    expect(sigh.steps[2].type).toBe('exhale');
    expect(sigh.steps[2].durationSeconds).toBe(6);
  });
});
