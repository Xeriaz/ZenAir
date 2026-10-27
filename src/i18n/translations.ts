import type { BreathingExerciseId } from '../types';

export type Language = 'en' | 'lt';

export interface TranslationSchema {
  common: {
    appName: string;
    awakening: string;
    loading: string;
    loadingBreathing: string;
    loadingAnalytics: string;
    loadingSettings: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
  };
  nav: {
    habits: string;
    tasks: string;
    breathing: string;
    analytics: string;
    settings: string;
  };
  habits: {
    todayHabits: string;
    done: string;
    all: string;
    morning: string;
    afternoon: string;
    evening: string;
    anytime: string;
    quickAddPlaceholder: string;
    add: string;
    advanced: string;
    noHabitsTitle: string;
    noHabitsDesc: string;
    streak: string;
    best: string;
    difficulty: string;
    difficultyEasy: string;
    difficultyMedium: string;
    difficultyHard: string;
    archive: string;
    unarchive: string;
    modalNewTitle: string;
    modalEditTitle: string;
    modalHabitTitle: string;
    modalPlaceholder: string;
    modalType: string;
    modalTypeDaily: string;
    modalTypeCounter: string;
    modalTimeOfDay: string;
    modalScheduledTime: string;
    modalDifficulty: string;
    modalDaysOfWeek: string;
    daysEveryday: string;
    daysWeekdays: string;
    daysWeekends: string;
    restDay: string;
    habitBadge: string;
    timelineSchedule: string;
    modalSaving: string;
    deleteConfirm: string;
  };
  tasks: {
    title: string;
    completedBlocks: string;
    addPlaceholder: string;
    blockBtn: string;
    startLabel: string;
    durationLabel: string;
    min15: string;
    min30: string;
    min45: string;
    min60: string;
    min90: string;
    min120: string;
    noTasksTitle: string;
    noTasksDesc: string;
    deleteConfirm: string;
  };
  breathing: {
    selectMethod: string;
    defaultTooltip: string;
    defaultActiveTooltip: string;
    holdPrefix: string;
    inhaleAndEndRetention: string;
    pause: string;
    resume: string;
    beginPacer: string;
    reset: string;
    about: string;
    sessionCompletedTitle: string;
    sessionCompletedDesc: string;
    continueJourney: string;
    cycleOf: string;
    powerInhale: string;
    letItGo: string;
    retentionHold: string;
    holdOnEmptyRelax: string;
    recoveryHold: string;
    inhaleFullAndHold15s: string;
    standards: Record<
      BreathingExerciseId,
      {
        name: string;
        tagline: string;
        description: string;
        benefits: string[];
        steps: { name: string; cue: string }[];
      }
    >;
  };
  analytics: {
    habitsDone: string;
    tasksDone: string;
    calmTime: string;
    consistencyAndCompletion: string;
    days7: string;
    days30: string;
    completion: string;
    habitsDoneTooltip: string;
    timeOfDayHabits: string;
    difficultyBalance: string;
    consistencyGrid: string;
    past3Months: string;
    less: string;
    more: string;
    completedLegend: string;
    timeMorning: string;
    timeAfternoon: string;
    timeEvening: string;
    timeAnytime: string;
    diffEasy: string;
    diffMedium: string;
    diffHard: string;
    today: string;
    yesterday: string;
  };
  settings: {
    languageTitle: string;
    languageDesc: string;
    english: string;
    lithuanian: string;
    backupTitle: string;
    backupDesc: string;
    exportJson: string;
    exporting: string;
    importJson: string;
    importing: string;
    resetTitle: string;
    resetDesc: string;
    resetBtn: string;
    resetting: string;
    resetConfirm: string;
    resetSuccess: string;
    resetError: string;
    sampleDemoTitle: string;
    sampleDemoDesc: string;
    generateDemoBtn: string;
    generating: string;
    generateDemoSuccess: string;
    generateDemoError: string;
    loadSampleHabitsBtn: string;
    loadSampleConfirm: string;
    loadSampleSuccess: string;
    securityModalTitle: string;
    securityModalDesc: string;
    enterPasswordPlaceholder: string;
    incorrectPasswordError: string;
    exportSuccess: string;
    exportError: string;
    importSuccess: string;
    importError: string;
    invalidBackupFile: string;
    appArchitecture: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    common: {
      appName: 'ZenAir',
      awakening: 'Awakening ZenAir...',
      loading: 'Loading...',
      loadingBreathing: 'Loading Breathing Guide...',
      loadingAnalytics: 'Loading Analytics...',
      loadingSettings: 'Loading Settings...',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save Habit',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close'
    },
    nav: {
      habits: 'Habits',
      tasks: 'Timeline',
      breathing: 'Breathe',
      analytics: 'Analytics',
      settings: 'Settings'
    },
    habits: {
      todayHabits: "Today's Habits",
      done: 'Done',
      all: 'All Habits',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      anytime: 'Anytime',
      quickAddPlaceholder: 'Add a habit (e.g. Morning Water, Meditation)...',
      add: 'Add',
      advanced: 'Advanced',
      noHabitsTitle: 'No habits in this category yet',
      noHabitsDesc: 'Click "+ Add" to create your first habit.',
      streak: 'Streak',
      best: 'Best',
      difficulty: 'Difficulty',
      difficultyEasy: 'Easy',
      difficultyMedium: 'Medium',
      difficultyHard: 'Hard',
      archive: 'Archive',
      unarchive: 'Unarchive',
      modalNewTitle: 'New Habit',
      modalEditTitle: 'Edit Habit',
      modalHabitTitle: 'Habit Title',
      modalPlaceholder: 'e.g. 20-minute daily reading',
      modalType: 'Type',
      modalTypeDaily: 'Daily Checklist',
      modalTypeCounter: 'Positive / Negative (+/-)',
      modalTimeOfDay: 'Time of Day',
      modalScheduledTime: 'Scheduled Time (Optional)',
      modalDifficulty: 'Difficulty',
      modalDaysOfWeek: 'Days of the Week',
      daysEveryday: 'Every day',
      daysWeekdays: 'Weekdays',
      daysWeekends: 'Weekends',
      restDay: 'Rest day',
      habitBadge: 'Habit',
      timelineSchedule: 'Timeline & Schedule',
      modalSaving: 'Saving...',
      deleteConfirm: 'Are you sure you want to delete this habit?'
    },
    tasks: {
      title: 'Time-Blocked Timeline',
      completedBlocks: 'Done ({completed} / {total})',
      addPlaceholder: 'Plan a time-blocked task (e.g. Deep Work Sprint)...',
      blockBtn: 'Block',
      startLabel: 'Start:',
      durationLabel: 'Duration:',
      min15: '15 min',
      min30: '30 min',
      min45: '45 min',
      min60: '60 min',
      min90: '90 min',
      min120: '2 hours',
      noTasksTitle: 'No time blocks scheduled for today',
      noTasksDesc: 'Add your first task block above to structure your day with intention.',
      deleteConfirm: 'Delete this scheduled block?'
    },
    breathing: {
      selectMethod: 'Select Breathing Method',
      defaultTooltip: 'Star as default',
      defaultActiveTooltip: 'Default Preferred Protocol',
      holdPrefix: 'Hold:',
      inhaleAndEndRetention: 'Inhale & End Retention',
      pause: 'Pause',
      resume: 'Resume',
      beginPacer: 'Begin Pacer',
      reset: 'Reset',
      about: 'About',
      sessionCompletedTitle: 'Session Completed!',
      sessionCompletedDesc: 'You downregulated your nervous system and enhanced heart-rate coherence.',
      continueJourney: 'Continue Journey',
      cycleOf: 'Cycle',
      powerInhale: 'Power Inhale',
      letItGo: 'Let It Go',
      retentionHold: 'Retention Hold',
      holdOnEmptyRelax: 'Hold on Empty — Relax',
      recoveryHold: 'Recovery Hold',
      inhaleFullAndHold15s: 'Inhale Full & Hold 15s',
      standards: {
        box: {
          name: 'Box Breathing',
          tagline: '4-4-4-4 Equal Quad Cadence',
          description: 'Navy SEAL-tested protocol to rapidly downregulate the nervous system, lower cortisol, and regain mental clarity under pressure.',
          benefits: ['Regulates heart rate variability (HRV)', 'Sharpened focus and mental presence', 'Reduces acute stress'],
          steps: [
            { name: 'Inhale', cue: 'Breathe In Deeply' },
            { name: 'Hold', cue: 'Hold with Lungs Full' },
            { name: 'Exhale', cue: 'Slowly Exhale Empty' },
            { name: 'Hold', cue: 'Hold on Empty Lungs' }
          ]
        },
        relax_478: {
          name: '4-7-8 Relaxing Breath',
          tagline: 'Dr. Andrew Weil Parasympathetic Activator',
          description: 'Natural tranquilizer for the autonomic nervous system. The prolonged exhale stimulates the vagus nerve to slow heart rate.',
          benefits: ['Induces deep physical relaxation', 'Ideal before bedtime and sleep', 'Calms racing anxious thoughts'],
          steps: [
            { name: 'Inhale', cue: 'Quiet Inhale Through Nose' },
            { name: 'Hold', cue: 'Hold Breath Gently' },
            { name: 'Exhale', cue: 'Whoosh Exhale Through Mouth' }
          ]
        },
        wim_hof: {
          name: 'Wim Hof Method',
          tagline: '30 Power Breaths + Retention Hold + Recovery',
          description: 'Immune and energy-boosting hyper-oxygenation technique. 30 deep conscious breaths followed by an unforced breath retention hold and a 15-second recovery lock.',
          benefits: ['Elevates energy and alertness', 'Strengthens immune resilience', 'Deep mind-body alkaline reset'],
          steps: [
            { name: 'Power Inhale', cue: 'Deep Inhale — Belly to Chest' },
            { name: 'Let Go', cue: 'Release Gently (Don’t Force)' }
          ]
        },
        coherent_55: {
          name: 'Coherent (Equal) 5-5',
          tagline: 'Cardiorespiratory Resonance Breathing',
          description: 'Paced breathing at approximately 6 breaths per minute. Aligns heart rate, blood pressure, and brain wave rhythms in optimal coherence.',
          benefits: ['Optimal Heart Rate Variability (HRV)', 'Emotional balance and inner stability', 'Sustainable calm focus during work'],
          steps: [
            { name: 'Inhale', cue: 'Smooth Continuous Inhale' },
            { name: 'Exhale', cue: 'Smooth Continuous Exhale' }
          ]
        },
        physio_sigh: {
          name: 'Physiological Sigh',
          tagline: 'Huberman Double Inhale + Extended Exhale',
          description: 'The fastest biological mechanism to quell acute autonomic arousal in real-time. Re-inflates collapsed pulmonary alveoli and expels excess CO2.',
          benefits: ['Instant nervous system relief in seconds', 'Relieves chest tightness and sighing dyspnea', 'Reset during high-stress spikes'],
          steps: [
            { name: 'Deep Inhale', cue: 'First Inhale Deeply' },
            { name: 'Top-Up Inhale', cue: 'Extra Inhale at the Top!' },
            { name: 'Long Exhale', cue: 'Slow Emptying Sigh' }
          ]
        }
      }
    },
    analytics: {
      habitsDone: 'Habits Done',
      tasksDone: 'Tasks Done',
      calmTime: 'Calm Time',
      consistencyAndCompletion: 'Consistency & Completion',
      days7: '7 Days',
      days30: '30 Days',
      completion: 'Completion',
      habitsDoneTooltip: 'Habits Done',
      timeOfDayHabits: 'Time-of-Day Habits',
      difficultyBalance: 'Difficulty Balance',
      consistencyGrid: '90-Day Consistency Grid',
      past3Months: 'Past 3 Months',
      less: 'Less',
      more: 'More',
      completedLegend: 'completed',
      timeMorning: 'Morning',
      timeAfternoon: 'Afternoon',
      timeEvening: 'Evening',
      timeAnytime: 'Anytime',
      diffEasy: 'Easy',
      diffMedium: 'Medium',
      diffHard: 'Hard',
      today: 'Today',
      yesterday: 'Yesterday'
    },
    settings: {
      languageTitle: 'Language / Kalba',
      languageDesc: 'Choose your preferred app display language.',
      english: 'English',
      lithuanian: 'Lietuvių',
      backupTitle: 'Local Backup & Restore (JSON)',
      backupDesc: 'ZenAir operates 100% client-side with IndexedDB. Export a local JSON backup anytime so you never lose your progress even if Safari or iOS storage purges.',
      exportJson: 'Export JSON',
      exporting: 'Exporting...',
      importJson: 'Import JSON',
      importing: 'Importing...',
      resetTitle: 'Reset All Data',
      resetDesc: 'Erase all habits, time-blocked tasks, habit history, and breathing logs, restoring your profile to a clean initial state.',
      resetBtn: 'Reset All Data',
      resetting: 'Resetting Data...',
      resetConfirm: 'Are you sure you want to reset all data? This will permanently delete all habits, time-blocked tasks, logs, and reset your user profile. This action cannot be undone.',
      resetSuccess: 'All data has been reset to a clean state!',
      resetError: 'Failed to reset all data.',
      sampleDemoTitle: 'Sample & Demo Data',
      sampleDemoDesc: 'Optional testing tools to populate sample habits or simulate 50 days of tracking history.',
      generateDemoBtn: 'Generate ~50 Days Tracking Data',
      generating: 'Generating...',
      generateDemoSuccess: 'Generated ~50 days of tracking data & analytics history!',
      generateDemoError: 'Failed to generate demo data.',
      loadSampleHabitsBtn: 'Load Starter Sample Habits',
      loadSampleConfirm: 'Load recommended starter habits? This will add standard starter habits to your routine.',
      loadSampleSuccess: 'Recommended starter habits loaded!',
      securityModalTitle: 'Security Confirmation',
      securityModalDesc: 'Generating dummy data will populate ~50 days of tracking history. Enter password test to confirm.',
      enterPasswordPlaceholder: 'Enter password...',
      incorrectPasswordError: 'Incorrect password. Please enter "test" to proceed.',
      exportSuccess: 'Database exported successfully as JSON!',
      exportError: 'Failed to export database.',
      importSuccess: 'Data restored successfully! Refreshing UI...',
      importError: 'Import failed:',
      invalidBackupFile: 'Invalid backup JSON file',
      appArchitecture: 'ZenAir PWA • Local-First Architecture'
    }
  },
  lt: {
    common: {
      appName: 'ZenAir',
      awakening: 'ZenAir prabunda...',
      loading: 'Kraunama...',
      loadingBreathing: 'Kraunamas kvėpavimo gidas...',
      loadingAnalytics: 'Kraunama analitika...',
      loadingSettings: 'Kraunami nustatymai...',
      cancel: 'Atšaukti',
      confirm: 'Patvirtinti',
      save: 'Išsaugoti įprotį',
      delete: 'Ištrinti',
      edit: 'Redaguoti',
      close: 'Uždaryti'
    },
    nav: {
      habits: 'Įpročiai',
      tasks: 'Dienotvarkė',
      breathing: 'Kvėpuoti',
      analytics: 'Analitika',
      settings: 'Nustatymai'
    },
    habits: {
      todayHabits: 'Šiandienos įpročiai',
      done: 'Atlikta',
      all: 'Visi įpročiai',
      morning: 'Rytas',
      afternoon: 'Diena',
      evening: 'Vakaras',
      anytime: 'Bet kada',
      quickAddPlaceholder: 'Pridėkite įprotį (pvz., Rytinis vanduo, Meditacija)...',
      add: 'Pridėti',
      advanced: 'Išplėstinis',
      noHabitsTitle: 'Šioje kategorijoje įpročių dar nėra',
      noHabitsDesc: 'Spustelėkite „+ Pridėti“, kad sukurtumėte savo pirmąjį įprotį.',
      streak: 'Serija',
      best: 'Geriausia',
      difficulty: 'Sudėtingumas',
      difficultyEasy: 'Lengvas',
      difficultyMedium: 'Vidutinis',
      difficultyHard: 'Sunkus',
      archive: 'Archyvuoti',
      unarchive: 'Išarchyvuoti',
      modalNewTitle: 'Naujas įprotis',
      modalEditTitle: 'Redaguoti įprotį',
      modalHabitTitle: 'Įpročio pavadinimas',
      modalPlaceholder: 'pvz., 20 min. kasdienis skaitymas',
      modalType: 'Tipas',
      modalTypeDaily: 'Kasdienis kontrolinis sąrašas',
      modalTypeCounter: 'Teigiamas / Neigiamas (+/-)',
      modalTimeOfDay: 'Paros laikas',
      modalScheduledTime: 'Numatytas laikas (neprivaloma)',
      modalDifficulty: 'Sudėtingumas',
      modalDaysOfWeek: 'Savaitės dienos',
      daysEveryday: 'Kasdien',
      daysWeekdays: 'Darbo d.',
      daysWeekends: 'Savaitgaliai',
      restDay: 'Poilsio d.',
      habitBadge: 'Įprotis',
      timelineSchedule: 'Dienotvarkė ir laikas',
      modalSaving: 'Išsaugoma...',
      deleteConfirm: 'Ar tikrai norite ištrinti šį įprotį?'
    },
    tasks: {
      title: 'Suplanuota dienotvarkė',
      completedBlocks: 'Atlikta ({completed} iš {total})',
      addPlaceholder: 'Suplanuokite laiko bloką (pvz., Gilus darbas)...',
      blockBtn: 'Pridėti bloką',
      startLabel: 'Pradžia:',
      durationLabel: 'Trukmė:',
      min15: '15 min',
      min30: '30 min',
      min45: '45 min',
      min60: '60 min (1 val.)',
      min90: '90 min (1.5 val.)',
      min120: '2 valandos',
      noTasksTitle: 'Šiandienai laiko blokų dar nesuplanuota',
      noTasksDesc: 'Pridėkite pirmąjį laiko bloką aukščiau ir sąmoningai suplanuokite savo dieną.',
      deleteConfirm: 'Ištrinti šį suplanuotą bloką?'
    },
    breathing: {
      selectMethod: 'Pasirinkite kvėpavimo metodą',
      defaultTooltip: 'Pažymėti kaip pagrindinį',
      defaultActiveTooltip: 'Numatytasis protokolas',
      holdPrefix: 'Sulaikymas:',
      inhaleAndEndRetention: 'Įkvėpkite ir baikite sulaikymą',
      pause: 'Pauzė',
      resume: 'Tęsti',
      beginPacer: 'Pradėti kvėpavimą',
      reset: 'Atstatyti',
      about: 'Apie',
      sessionCompletedTitle: 'Sesija baigta!',
      sessionCompletedDesc: 'Sumažinote nervų sistemos įtampą ir padidinote širdies ritmo koherentiškumą.',
      continueJourney: 'Tęsti kelionę',
      cycleOf: 'Ciklas',
      powerInhale: 'Gilus įkvėpimas',
      letItGo: 'Paleiskite orą',
      retentionHold: 'Kvėpavimo sulaikymas',
      holdOnEmptyRelax: 'Sulaikykite iškvėpę — atsipalaiduokite',
      recoveryHold: 'Atstatomasis sulaikymas',
      inhaleFullAndHold15s: 'Giliai įkvėpkite ir sulaikykite 15s',
      standards: {
        box: {
          name: 'Kvadratinis kvėpavimas',
          tagline: '4-4-4-4 lygių fazių ritmas',
          description: 'Specialiųjų pajėgų išbandytas protokolas, skirtas greitai nuraminti nervų sistemą, sumažinti kortizolio kiekį ir atgauti proto aiškumą patiriant spaudimą.',
          benefits: ['Reguliuoja širdies ritmo kintamumą (HRV)', 'Aštresnis dėmesys ir proto aiškumas', 'Greitai sumažina ūmų stresą'],
          steps: [
            { name: 'Įkvėpimas', cue: 'Giliai įkvėpkite' },
            { name: 'Sulaikymas', cue: 'Sulaikykite pilnais plaučiais' },
            { name: 'Iškvėpimas', cue: 'Lėtai pilnai iškvėpkite' },
            { name: 'Sulaikymas', cue: 'Sulaikykite tuščiais plaučiais' }
          ]
        },
        relax_478: {
          name: '4-7-8 Atpalaiduojantis kvėpavimas',
          tagline: 'Dr. Andrew Weil parasimpatinės sistemos aktyvatorius',
          description: 'Natūralus raminamasis nervų sistemai. Ilgas iškvėpimas stimuliuoja klajoklį nervą ir sulėtina širdies ritmą.',
          benefits: ['Suteikia gilų fizinį atsipalaidavimą', 'Idealu prieš miegą ir poilsiui', 'Nuramina lekiančias neramias mintis'],
          steps: [
            { name: 'Įkvėpimas', cue: 'Tylus įkvėpimas pro nosį' },
            { name: 'Sulaikymas', cue: 'Švelniai sulaikykite kvėpavimą' },
            { name: 'Iškvėpimas', cue: 'Iškvėpkite garsu pro burną' }
          ]
        },
        wim_hof: {
          name: 'Wim Hof metodas',
          tagline: '30 gilių įkvėpimų + sulaikymas + atstatymas',
          description: 'Imunitetą ir energiją stiprinanti hiper-deguonies technika. 30 sąmoningų gilių įkvėpimų, po kurių seka natūralus kvėpavimo sulaikymas ir 15 sekundžių atstatomasis įkvėpimas.',
          benefits: ['Pakelia energiją ir budrumą', 'Stiprina imuninį atsparumą', 'Gilus organizmo ir proto atstatymas'],
          steps: [
            { name: 'Gilus įkvėpimas', cue: 'Gilus įkvėpimas — pilvu ir krūtine' },
            { name: 'Paleidimas', cue: 'Paleiskite švelniai (nespauskite)' }
          ]
        },
        coherent_55: {
          name: 'Koherentinis (Tolygus) 5-5',
          tagline: 'Širdies ir kvėpavimo rezonansinis ritmas',
          description: 'Kvėpavimas maždaug 6 kartus per minutę. Suderina širdies ritmą, kraujospūdį ir smegenų bangas optimaliam koherentiškumui.',
          benefits: ['Optimalus širdies ritmo kintamumas (HRV)', 'Emocinė pusiausvyra ir vidinė ramybė', 'Tolygi rami koncentracija dirbant'],
          steps: [
            { name: 'Įkvėpimas', cue: 'Tolygus nepertraukiamas įkvėpimas' },
            { name: 'Iškvėpimas', cue: 'Tolygus nepertraukiamas iškvėpimas' }
          ]
        },
        physio_sigh: {
          name: 'Fiziologinis atodūsis',
          tagline: 'Huberman dvigubas įkvėpimas + prailgintas iškvėpimas',
          description: 'Greičiausias biologinis būdas sumažinti ūmų stresą realiu laiku. Vėl išskleidžia subliuškusias plaučių alveoles ir pašalina CO2 perteklių.',
          benefits: ['Akimirksniu palengvina nervų sistemos įtampą', 'Pašalina krūtinės sunkumą ir dusulį', 'Greitas atsistatymas streso šuolių metu'],
          steps: [
            { name: 'Pirmas įkvėpimas', cue: 'Pirmas gilus įkvėpimas' },
            { name: 'Papildomas įkvėpimas', cue: 'Papildomas trumpas įkvėpimas viršuje!' },
            { name: 'Ilgas iškvėpimas', cue: 'Lėtas atodūsis iškvepiant' }
          ]
        }
      }
    },
    analytics: {
      habitsDone: 'Atlikti įpročiai',
      tasksDone: 'Atliktos užduotys',
      calmTime: 'Ramybės laikas',
      consistencyAndCompletion: 'Nuoseklumas ir atlikimas',
      days7: '7 dienos',
      days30: '30 dienų',
      completion: 'Atlikimas',
      habitsDoneTooltip: 'Atlikti įpročiai',
      timeOfDayHabits: 'Įpročiai pagal paros laiką',
      difficultyBalance: 'Sudėtingumo pasiskirstymas',
      consistencyGrid: '90 dienų nuoseklumo tinklelis',
      past3Months: 'Pastarieji 3 mėnesiai',
      less: 'Mažiau',
      more: 'Daugiau',
      completedLegend: 'atlikta',
      timeMorning: 'Rytas',
      timeAfternoon: 'Diena',
      timeEvening: 'Vakaras',
      timeAnytime: 'Bet kada',
      diffEasy: 'Lengvas',
      diffMedium: 'Vidutinis',
      diffHard: 'Sunkus',
      today: 'Šiandien',
      yesterday: 'Vakar'
    },
    settings: {
      languageTitle: 'Kalba / Language',
      languageDesc: 'Pasirinkite norimą programėlės rodymo kalbą.',
      english: 'English',
      lithuanian: 'Lietuvių',
      backupTitle: 'Vietinė atsarginė kopija ir atkūrimas (JSON)',
      backupDesc: 'ZenAir veikia 100% naršyklėje su IndexedDB. Bet kada eksportuokite vietinę JSON kopiją, kad neprarastumėte duomenų net išvalius naršyklės atmintį.',
      exportJson: 'Eksportuoti JSON',
      exporting: 'Eksportuojama...',
      importJson: 'Importuoti JSON',
      importing: 'Importuojama...',
      resetTitle: 'Išvalyti visus duomenis',
      resetDesc: 'Ištrinkite visus įpročius, suplanuotus laiko blokus, istorijos žurnalus ir grąžinkite profilį į švarią pradinę būseną.',
      resetBtn: 'Išvalyti visus duomenis',
      resetting: 'Valomi duomenys...',
      resetConfirm: 'Ar tikrai norite išvalyti visus duomenis? Tai visam laikui ištrins visus įpročius, laiko blokus, istoriją ir atstatys jūsų profilį. Šio veiksmo negalima atšaukti.',
      resetSuccess: 'Visi duomenys sėkmingai išvalyti!',
      resetError: 'Nepavyko išvalyti duomenų.',
      sampleDemoTitle: 'Pavyzdiniai ir demonstraciniai duomenys',
      sampleDemoDesc: 'Papildomi testavimo įrankiai pavyzdiniams įpročiams įkelti arba 50 dienų istorijai sugeneruoti.',
      generateDemoBtn: 'Generuoti ~50 d. sekimo istoriją',
      generating: 'Generuojama...',
      generateDemoSuccess: 'Sugeneruota ~50 dienų sekimo duomenų ir analitikos istorija!',
      generateDemoError: 'Nepavyko sugeneruoti demonstracinių duomenų.',
      loadSampleHabitsBtn: 'Įkelti pradinius pavyzdinius įpročius',
      loadSampleConfirm: 'Įkelti rekomenduojamus pradinius įpročius? Tai papildys jūsų dienotvarkę standartiniais įpročiais.',
      loadSampleSuccess: 'Rekomenduojami pradiniai įpročiai įkelti!',
      securityModalTitle: 'Saugumo patvirtinimas',
      securityModalDesc: 'Generuojant demonstracinius duomenis bus sukurta ~50 d. istorija. Įveskite slaptažodį test patvirtinimui.',
      enterPasswordPlaceholder: 'Įveskite slaptažodį...',
      incorrectPasswordError: 'Neteisingas slaptažodis. Įveskite „test“ norėdami tęsti.',
      exportSuccess: 'Duomenų bazė sėkmingai eksportuota kaip JSON!',
      exportError: 'Nepavyko eksportuoti duomenų bazės.',
      importSuccess: 'Duomenys sėkmingai atkurti! Puslapis perkraunamas...',
      importError: 'Importavimas nepavyko:',
      invalidBackupFile: 'Neteisingas atsarginės kopijos JSON failas',
      appArchitecture: 'ZenAir PWA • Vietinė architektūra'
    }
  }
};
