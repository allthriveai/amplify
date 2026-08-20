// ---------------------------------------------------------------------------
// Signal types — structured event log connecting pipeline stages
// ---------------------------------------------------------------------------

export type SignalType =
  | "moment_captured"
  | "recommendation_rejected"
  | "content_posted"
  | "engagement_updated"
  | "story_developed"
  | "story_practice"
  | "timeline_created"
  | "video_rendered"
  | "carousel_created"
  | "article_created"
  | "inspiration_added"
  | "challenge_completed"
  | "images_generated"
  | "diagram_created"
  | "diagram_video_rendered"
  | "audio_generated"
  | "meeting_synced"
  | "journal_entry"
  | "target_touched"
  | "week_reviewed";

interface BaseSignal {
  id: string;
  type: SignalType;
  timestamp: string;
}

export interface MomentCapturedSignal extends BaseSignal {
  type: "moment_captured";
  data: {
    filename: string;
    themes: string[];
    storyPotential: string;
    momentType: string;
    fiveSecondMoment: string;
  };
}

export interface RecommendationRejectedSignal extends BaseSignal {
  type: "recommendation_rejected";
  data: {
    reason: string;
    pillar: string;
    sourceContent: string;
  };
}

export interface ContentPostedSignal extends BaseSignal {
  type: "content_posted";
  data: {
    platform: string;
    url: string;
    scriptFilename: string;
    pillar: string;
  };
}

export interface EngagementUpdatedSignal extends BaseSignal {
  type: "engagement_updated";
  data: {
    platform: string;
    url: string;
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

export interface StoryDevelopedSignal extends BaseSignal {
  type: "story_developed";
  data: {
    storyFilename: string;
    sourceMoment: string;
    craftStatus: string;
  };
}

export interface StoryPracticeSignal extends BaseSignal {
  type: "story_practice";
  data: {
    momentTitle: string;
    element: string;
  };
}

export interface TimelineCreatedSignal extends BaseSignal {
  type: "timeline_created";
  data: {
    slug: string;
    storySource: string;
    hook: string;
    structure: string;
    platform: string;
    shotCount: number;
    targetDuration: number;
  };
}

export interface VideoRenderedSignal extends BaseSignal {
  type: "video_rendered";
  data: {
    slug: string;
    outputPath: string;
    platform: string;
    duration: number;
  };
}

export interface CarouselCreatedSignal extends BaseSignal {
  type: "carousel_created";
  data: {
    slug: string;
    storySource: string;
    hook: string;
    structure: string;
    platform: string;
    cardCount: number;
  };
}

export interface ArticleCreatedSignal extends BaseSignal {
  type: "article_created";
  data: {
    slug: string;
    storySource: string;
    hook: string;
    structure: string;
    platform: string;
    wordCount: number;
  };
}

export interface InspirationAddedSignal extends BaseSignal {
  type: "inspiration_added";
  data: {
    person: string;
    tags: string[];
    backLinks: number;
    path: string;
  };
}

export interface ChallengeCompletedSignal extends BaseSignal {
  type: "challenge_completed";
  data: {
    idea: string;
    prompts: string[];
    promoted: boolean;
    path: string;
  };
}

export interface ImagesGeneratedSignal extends BaseSignal {
  type: "images_generated";
  data: {
    slug: string;
    format: string;
    sourceFile: string;
    imageCount: number;
    imagePaths: string[];
  };
}

export interface DiagramCreatedSignal extends BaseSignal {
  type: "diagram_created";
  data: {
    slug: string;
    diagramType: string;
    storySource: string;
    nodeCount: number;
    edgeCount: number;
    htmlPath: string;
    pngPath: string;
  };
}

export interface DiagramVideoRenderedSignal extends BaseSignal {
  type: "diagram_video_rendered";
  data: {
    slug: string;
    diagramType: string;
    format: string;
    outputPath: string;
    nodeCount: number;
    duration: number;
  };
}

export interface AudioGeneratedSignal extends BaseSignal {
  type: "audio_generated";
  data: {
    sourceNote: string;
    audioFile: string;
    durationEstimate: string;
  };
}

export interface MeetingSyncedSignal extends BaseSignal {
  type: "meeting_synced";
  data: {
    title: string;
    date: string;
    source: "plaud" | "manual";
    plaudFileId?: string;
    path: string;
  };
}

export interface JournalEntrySignal extends BaseSignal {
  type: "journal_entry";
  data: {
    /** YYYY-MM-DD of the note */
    date: string;
    path: string;
    /** "morning" creates the note, "evening" closes it out */
    run: "morning" | "evening";
    /** Days since the previous entry. Null on the first entry ever. */
    gapDays: number | null;
    tasksCarried: number;
    tasksCompleted: number;
    tasksOpen: number;
    currentStreak: number;
  };
}

export interface TargetTouchedSignal extends BaseSignal {
  type: "target_touched";
  data: {
    target: string;
    cadence: string | null;
    /** Days since the target was last touched, before this stamp */
    daysSince: number | null;
  };
}

export interface WeekReviewedSignal extends BaseSignal {
  type: "week_reviewed";
  data: {
    /** Monday that starts the reviewed week */
    weekOf: string;
    path: string;
    daysJournaled: number;
    tasksCompleted: number;
    tasksOpen: number;
    momentsCaptured: number;
    targetsMoved: number;
  };
}

export type Signal =
  | MomentCapturedSignal
  | RecommendationRejectedSignal
  | ContentPostedSignal
  | EngagementUpdatedSignal
  | StoryDevelopedSignal
  | StoryPracticeSignal
  | TimelineCreatedSignal
  | VideoRenderedSignal
  | CarouselCreatedSignal
  | ArticleCreatedSignal
  | InspirationAddedSignal
  | ChallengeCompletedSignal
  | ImagesGeneratedSignal
  | DiagramCreatedSignal
  | DiagramVideoRenderedSignal
  | AudioGeneratedSignal
  | MeetingSyncedSignal
  | JournalEntrySignal
  | TargetTouchedSignal
  | WeekReviewedSignal;

export interface SignalsFile {
  version: 1;
  signals: Signal[];
}
