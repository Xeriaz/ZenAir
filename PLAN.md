# ZenAir PWA — Implementation & Architectural Plan

A production-ready, local-first Progressive Web App (PWA) for **Habit Tracking, Time Planning, and Stress Relief**, engineered with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Dexie.js (IndexedDB)**, and **Recharts**.

---

## 1. Technical Stack & Environment

| Layer | Library / Version | Role & Configuration |
|---|---|---|
| **Core & Build** | React `^19.0.0`, TypeScript `^5.7.3`, Vite `^6.2.0`, `@vitejs/plugin-react` `^4.3.4` | Strict TypeScript, modern ESM, React 19 fast refresh |
| **Target Deployment** | GitHub Pages (`base: './'`) | Relative paths for zero-config deployment to any repo subpath |
| **Styling & UI** | Tailwind CSS `^4.0.9` (`@tailwindcss/vite`), `lucide-react` `^1.16.0` | Dark-mode native palette, CSS custom properties, Lucide icons |
| **Typography** | Google Fonts `Roboto` (300, 400, 500, 700) | Loaded in `index.html`, set as global `font-sans` |
| **Local Database** | `dexie` `^4.0.11`, `dexie-react-hooks` `^1.1.7` | Zero external backend, reactive `useLiveQuery` UI updates |
| **Date & Time** | `date-fns` `^4.1.0` | Streak calculations, daily resets, heatmaps, time-block groupings |
| **Visualizations**| `recharts` `^2.15.1` | Responsive Bar, Area, Pie, Radar charts, custom SVG Heatmap |
| **PWA / Offline**| `vite-plugin-pwa` `^0.21.1`, `workbox-window` `^7.3.0` | Offline caching, `display: 'standalone'`, dark theme color |
| **Testing** | `vitest` `^5.0.5`, `jsdom` `^30.1.3`, `@testing-library/react` `^16.3.3`, `fake-indexeddb` `^6.2.6` | In-memory Dexie testing, calculation unit tests, component tests |

---

## 2. Architecture & File Structure

```
ZenAir/
├── public/
│   ├── favicon.svg
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── apple-touch-icon.png
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx             # Gamification & User Stats Bar
│   │   │   ├── BottomNav.tsx          # Mobile navigation with safe-area-inset
│   │   │   ├── Modal.tsx              # Reusable accessible dialog
│   │   │   └── Toast.tsx              # Level up & reward notifications
│   │   ├── habits/
│   │   │   ├── HabitQuickAdd.tsx      # Zero-friction top quick-input bar
│   │   │   ├── HabitCard.tsx          # 1-tap completion & +/- buttons
│   │   │   ├── HabitList.tsx          # Time-of-day grouped lists
│   │   │   └── HabitFormModal.tsx     # Advanced edit / difficulty settings
│   │   ├── tasks/
│   │   │   ├── TaskTimeline.tsx       # Daily time-blocked schedule
│   │   │   └── TaskQuickAdd.tsx       # Inline task creation
│   │   ├── analytics/
│   │   │   ├── CompletionChart.tsx    # 7-day & 30-day Area / Bar chart
│   │   │   ├── TimeDistribution.tsx   # Radar / Pie chart of habit balance
│   │   │   └── ConsistencyHeatmap.tsx # 90-day GitHub-style contribution grid
│   │   ├── breathing/
│   │   │   ├── BreathingPacer.tsx     # 60fps CSS-variable driven animation
│   │   │   ├── BreathingControls.tsx  # Duration, start/pause/reset
│   │   │   └── BreathingSelector.tsx  # 5 standards selection & favoriting
│   │   └── settings/
│   │       ├── DataBackup.tsx         # JSON Export / Import engine
│   │       └── UserPreferences.tsx    # Theme & defaults configuration
│   ├── db/
│   │   ├── db.ts                      # Dexie database class & schema
│   │   └── backup.ts                  # Export & import serialization helpers
│   ├── hooks/
│   │   ├── useGamification.ts         # XP, Gold, Level-up, Streak logic
│   │   └── useBreathingSession.ts     # Pacer state machine & phase transitions
│   ├── types/
│   │   └── index.ts                   # Strongly-typed models & interfaces
│   ├── utils/
│   │   ├── dates.ts                   # date-fns helper functions
│   │   └── gamification.ts            # Mathematical curves & reward formulas
│   ├── App.tsx                        # Root layout with tab routing
│   ├── index.css                      # Tailwind v4 import & keyframe animations
│   └── main.tsx                       # React 19 bootstrap & PWA registration
├── tests/
│   ├── db.test.ts                     # Dexie CRUD & backup tests
│   ├── gamification.test.ts           # XP, streak & freeze mechanics
│   └── breathing.test.ts              # Phase timings & state machine tests
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Database Schema & Data Models (`src/db/db.ts`)

```typescript
// Tables & Indexing
db.version(1).stores({
  habits: '++id, title, type, timeOfDay, scheduledTime, streak, bestStreak, difficulty, createdAt, archived',
  habitLogs: '++id, habitId, date, count, xpEarned, timestamp, [habitId+date]',
  tasks: '++id, title, date, startTime, durationMinutes, completed, createdAt, [date+completed]',
  breathingLogs: '++id, exerciseId, durationSeconds, completedAt',
  userProfile: '++id, level, xp, gold, streakFreezes, defaultBreathingId, preferredSessionMinutes, theme'
});
```

### Gamification & State Mechanics
- **XP Calculation:**
  - Easy: `+10 XP`, `+5 Gold`
  - Medium: `+20 XP`, `+10 Gold`
  - Hard: `+35 XP`, `+20 Gold`
  - Breathing session: `+50 XP`, `+15 Gold`
- **Level Curve:** `XP_REQUIRED = Level * 75 + 100` (e.g., Level 1 = 175 XP, Level 2 = 250 XP).
- **Streak Freeze Token:**
  - Every 7 consecutive active days awards `+1 Streak Freeze` (or purchasable for 100 Gold).
  - Automatically consumes a freeze token if a day is missed, preventing the streak from resetting to 0.
- **Negative Reinforcement Habits:**
  - Negative clicks deduct XP (`-10 XP`, clamped to 0 of current level) to promote behavioral self-correction without harsh frustration.

---

## 4. Breathing Pacer Architecture (60fps Non-Jank)

To guarantee 60fps performance without main-thread jank:
1. **Zero JS animation frame rendering:** React does not manage scale/opacity tick-by-tick via `requestAnimationFrame` or `setInterval`.
2. **Pure CSS Animation Engine:**
   - Single CSS class per phase (`.inhale`, `.hold`, `.exhale`, `.hold-empty`, `.recovery`).
   - Dynamic CSS variables set on the parent element:
     ```css
     --phase-duration: 4s;
     --scale-start: 1;
     --scale-end: 1.65;
     --timing-function: cubic-bezier(0.4, 0, 0.2, 1);
     ```
   - Hardware-accelerated CSS properties only: `transform: scale(...)` and `opacity`.
3. **Phase State Machine:**
   - A lightweight `setTimeout` or `animationend` listener triggers phase changes in React state, swapping the active CSS class and updating the textual cue.
4. **5 Pre-configured Protocols:**
   - **Box Breathing:** 4s Inhale → 4s Hold → 4s Exhale → 4s Hold
   - **4-7-8 Relaxing Breath:** 4s Inhale → 7s Hold → 8s Exhale
   - **Wim Hof Method:** 30 cycles (2s Inhale / 1.5s Exhale) → Retention Hold (manual tap) → 15s Recovery Hold
   - **Coherent (5-5):** 5s Inhale → 5s Exhale
   - **Physiological Sigh:** 2s Inhale → 1s Inhale Top-Up → 6s Exhale

---

## 5. Phased Execution Roadmap

### Phase 1: Project Setup & Database Layer
- Initial scaffolding of `ZenAir` with React 19, TypeScript, Tailwind v4, Vite 6, and PWA plugin.
- Configuration of GitHub Pages deployment path (`base: './'`).
- `src/db/db.ts` implementation with Dexie v4 schemas, seed initializers, and JSON export/import utilities.
- Google Fonts `Roboto` integration and native iOS safe-area styling rules.

### Phase 2: Core Dashboard & Gamification UI
- App shell with responsive layout, mobile bottom navigation (`env(safe-area-inset-bottom)`), and User Stats Header (Level, XP bar, Gold, Streaks).
- Low-friction Habit Dashboard:
  - Inline Quick-Add input bar.
  - 1-tap completion toggles with instant optimistic `useLiveQuery` updates.
  - Positive/Negative (+/-) reinforcement habits.
  - Time-of-day tabs/filters (`Morning`, `Afternoon`, `Evening`, `Anytime`).
  - Daily timeline view for scheduled tasks.
- Settings view with JSON backup & restore utilities.

### Phase 3: Visual Analytics & Diagrams
- Weekly / Monthly completion trends with Recharts (`AreaChart` and `BarChart`).
- Habit category / time-of-day distribution radar/pie chart.
- 90-day GitHub-style consistency contribution heatmap with dynamic intensity shading.

### Phase 4: Guided Stress-Relief Breathing Page
- Interactive 60fps CSS-variable visual pacer with circular expanding/contracting glow.
- Implementation of all 5 breathing standards (including Wim Hof retention hold stopwatch).
- Persistent user favorites and session duration timers.
- Session completion reward modal awarding XP and calmness points.

### Phase 5: Testing Suite
- Setup of Vitest with `fake-indexeddb` and `@testing-library/react`.
- Unit tests for Dexie CRUD operations and live query subscriptions.
- Unit tests for XP progression, streak freezing, and daily reset logic.
- Integration test for JSON backup export and data restoration.
