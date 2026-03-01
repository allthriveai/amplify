// ---------------------------------------------------------------------------
// Signal types — structured event log connecting pipeline stages
// ---------------------------------------------------------------------------

export type SignalType =
  | "moment_captured"
  | "learning_extracted"
  | "script_drafted"
  | "recommendation_rejected"
  | "content_posted"
  | "engagement_updated"
  | "cluster_formed"
  | "story_developed"
  | "story_practice"
  | "timeline_created"
  | "video_rendered";

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

export interface LearningExtractedSignal extends BaseSignal {
  type: "learning_extracted";
  data: {
    filename: string;
    pillar: string;
    topicTags: string[];
    sourceResearch: string;
  };
}

export interface ScriptDraftedSignal extends BaseSignal {
  type: "script_drafted";
  data: {
    filename: string;
    platform: string[];
    pillar: string;
    sourceContent: string;
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

export interface ClusterFormedSignal extends BaseSignal {
  type: "cluster_formed";
  data: {
    topicTag: string;
    learningCount: number;
    learningFilenames: string[];
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

export type Signal =
  | MomentCapturedSignal
  | LearningExtractedSignal
  | ScriptDraftedSignal
  | RecommendationRejectedSignal
  | ContentPostedSignal
  | EngagementUpdatedSignal
  | ClusterFormedSignal
  | StoryDevelopedSignal
  | StoryPracticeSignal
  | TimelineCreatedSignal
  | VideoRenderedSignal;

export interface SignalsFile {
  version: 1;
  signals: Signal[];
}
