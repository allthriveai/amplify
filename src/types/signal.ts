// ---------------------------------------------------------------------------
// Signal types — structured event log connecting pipeline stages
// ---------------------------------------------------------------------------

export type SignalType =
  | "moment_captured"
  | "learning_extracted"
  | "recommendation_rejected"
  | "content_posted"
  | "engagement_updated"
  | "cluster_formed"
  | "story_developed"
  | "story_practice"
  | "timeline_created"
  | "video_rendered"
  | "carousel_created"
  | "article_created"
  | "inspiration_added"
  | "challenge_completed"
  | "images_generated";

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

export type Signal =
  | MomentCapturedSignal
  | LearningExtractedSignal
  | RecommendationRejectedSignal
  | ContentPostedSignal
  | EngagementUpdatedSignal
  | ClusterFormedSignal
  | StoryDevelopedSignal
  | StoryPracticeSignal
  | TimelineCreatedSignal
  | VideoRenderedSignal
  | CarouselCreatedSignal
  | ArticleCreatedSignal
  | InspirationAddedSignal
  | ChallengeCompletedSignal
  | ImagesGeneratedSignal;

export interface SignalsFile {
  version: 1;
  signals: Signal[];
}
