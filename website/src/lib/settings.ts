// Site-wide settings, edited in Tina under "Site settings"
// (content/settings/site.json). Typed by hand to match tina/config.ts.
import site from '../../content/settings/site.json';

export interface Link {
  label?: string;
  href?: string;
}

export interface SiteSettings {
  footer?: {
    tagline?: string;
    cta?: Link;
    /** Short column next to the brand, e.g. tech and marketing work. */
    about?: { logo?: string; heading?: string; text?: string; link?: Link };
  };
}

export const settings = site as SiteSettings;
