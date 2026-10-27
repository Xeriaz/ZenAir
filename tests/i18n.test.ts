import { describe, it, expect } from 'vitest';
import { translations, type Language } from '../src/i18n/translations';
import { formatReadableDate } from '../src/utils/dates';

describe('i18n Localization Engine', () => {
  it('should have complete translations for both en and lt', () => {
    const languages: Language[] = ['en', 'lt'];
    for (const lang of languages) {
      const t = translations[lang];
      expect(t).toBeDefined();

      // Navigation
      expect(t.nav.habits).toBeTruthy();
      expect(t.nav.breathing).toBeTruthy();
      expect(t.nav.analytics).toBeTruthy();
      expect(t.nav.settings).toBeTruthy();

      // Habits
      expect(t.habits.todayHabits).toBeTruthy();
      expect(t.habits.quickAddPlaceholder).toBeTruthy();
      expect(t.habits.modalHabitTitle).toBeTruthy();

      // Breathing
      expect(t.breathing.sessionCompletedTitle).toBeTruthy();
      expect(t.breathing.standards.box.name).toBeTruthy();
      expect(t.breathing.standards.relax_478.name).toBeTruthy();
      expect(t.breathing.standards.wim_hof.name).toBeTruthy();
      expect(t.breathing.standards.coherent_55.name).toBeTruthy();
      expect(t.breathing.standards.physio_sigh.name).toBeTruthy();

      // Settings
      expect(t.settings.languageTitle).toBeTruthy();
      expect(t.settings.resetTitle).toBeTruthy();
      expect(t.settings.generateDemoBtn).toBeTruthy();
    }
  });

  it('should translate readable dates in Lithuanian', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(formatReadableDate(today, 'lt')).toBe('Šiandien');
    expect(formatReadableDate(today, 'en')).toBe('Today');
  });
});
