export interface BrandColors {
  /** Main brand color (hex) — navy/ethos */
  primary: string;
  /** Secondary brand color — teal/logos */
  secondary: string;
  /** Body text color */
  text: string;
  /** Accent/highlight color — gold/pathos */
  accent: string;
  /** Light background */
  background: string;
  /** Neutral/muted */
  neutral: string;
}

export interface BrandFonts {
  /** Body text font family */
  body: string;
  /** Heading font family. Defaults to body if omitted */
  heading?: string;
}

export interface BrandConfig {
  /** Brand name */
  name: string;
  /** Brand tagline */
  tagline?: string;
  /** Brand domain (e.g. "example.com") */
  domain?: string;
  /** Brand color palette */
  colors: BrandColors;
  /** Brand typography */
  fonts: BrandFonts;
}
