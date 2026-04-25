// ---------------------------------------------------------------------------
// Meeting types — structured meeting notes from Plaud recordings or manual input
// ---------------------------------------------------------------------------

export interface MeetingFrontmatter {
  title: string;
  date: string;
  duration: string;
  attendees: string[];
  source: "plaud" | "manual";
  /** Links back to the Plaud-synced note by file_id */
  plaud_file_id?: string;
  tags: string[];
  /** false = raw from Plaud sync, true = structured by /meeting skill */
  processed: boolean;
}

export interface Meeting {
  filename: string;
  /** Relative path within the vault */
  path: string;
  frontmatter: MeetingFrontmatter;
  content: string;
}
