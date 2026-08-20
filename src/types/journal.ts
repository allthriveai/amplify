// ---------------------------------------------------------------------------
// Journal types — daily notes, tasks, and goal targets
// ---------------------------------------------------------------------------

/** A markdown checkbox task inside a daily note */
export interface Task {
  /** Task text, stripped of the checkbox and the age marker */
  text: string;
  done: boolean;
  /** Days this task has been carried forward. 0 means it was written today. */
  age: number;
  /** #goal/* tags found in the task text */
  goalTags: string[];
  /** The original source line */
  raw: string;
}

/** A parsed daily note */
export interface DailyNote {
  /** YYYY-MM-DD */
  date: string;
  path: string;
  content: string;
  tasks: Task[];
}

export type Cadence = "daily" | "weekly" | "monthly" | "quarterly";

/** Days allowed to pass before a target of each cadence is considered overdue */
export const CADENCE_DAYS: Record<Cadence, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
};

/** A target parsed from the `## Active Targets` section of Goals.md */
export interface Target {
  /** Target text, stripped of the checkbox and inline key:value tags */
  text: string;
  cadence: Cadence | null;
  /** YYYY-MM-DD of the last time this target was touched */
  last: string | null;
  goalTags: string[];
  done: boolean;
  raw: string;
}

/** A target with freshness computed against a reference date */
export interface TargetStatus extends Target {
  /** Days since `last`. Null when the target has never been touched. */
  daysSince: number | null;
  /** True when daysSince exceeds the cadence window, or last is unset */
  overdue: boolean;
}

/** Journaling history, computed from the daily notes folder */
export interface JournalStats {
  /** YYYY-MM-DD of the most recent entry before today, if any */
  lastEntryDate: string | null;
  /** Day gap between the last entry and today. Null when there is no prior entry. */
  daysSinceLastEntry: number | null;
  /** Consecutive days journaled, counting back from today or yesterday */
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

// ---------------------------------------------------------------------------
// Drift — what the coach notices across entries, not within one
// ---------------------------------------------------------------------------

/** A theme that keeps recurring in captured moments */
export interface DriftTheme {
  theme: string;
  /** How many moments in the window carried this theme */
  count: number;
  /** YYYY-MM-DD of the most recent moment carrying it */
  lastSeen: string;
}

/**
 * Patterns visible only across many entries. These are facts, not judgments —
 * the skill turns them into a question, the code just counts.
 */
export interface Drift {
  /** Tasks carried longer than the stale threshold */
  staleTasks: Task[];
  /** Targets overdue by more than twice their cadence */
  quietTargets: TargetStatus[];
  /** Themes recurring across recent moments */
  repeatedThemes: DriftTheme[];
  /** Days since the last captured moment */
  daysSinceLastMoment: number | null;
  /** Days in the trailing window with no daily note */
  silentDays: number;
  /** Length of the trailing window used for silentDays */
  windowDays: number;
}

// ---------------------------------------------------------------------------
// Weekly review
// ---------------------------------------------------------------------------

/** A moment, reduced to what a weekly review needs */
export interface WeekMoment {
  filename: string;
  date: string;
  themes: string[];
  momentType: string;
  storyPotential: string;
}

/** Everything the weekly reckoning draws on */
export interface WeekData {
  /** Monday that starts the week, YYYY-MM-DD */
  weekOf: string;
  /** Sunday that ends it */
  weekEnd: string;
  /** Days in the week that have already happened */
  daysElapsed: number;
  /** Days with a daily note */
  daysJournaled: number;
  entries: DailyNote[];
  completed: Task[];
  stillOpen: Task[];
  /** The task that has been carried longest, if any */
  oldestOpen: Task | null;
  moments: WeekMoment[];
  targets: TargetStatus[];
  /** Target texts stamped during the week, from signals */
  targetsTouched: string[];
  drift: Drift;
}
