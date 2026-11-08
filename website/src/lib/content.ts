import type { MarkdownInstance } from 'astro';

import type { PageQuery } from '../../tina/__generated__/types';
import type { StripNull } from '../helpers/types';
import type { IconName } from './icons';

type PageData = StripNull<
  Omit<PageQuery['page'], '__typename' | 'id' | '_sys' | 'body' | 'sections'>
>;

export type SwatchNote = StripNull<NonNullable<NonNullable<PageData['swatchNotes']>[number]>>;

// Tina "sections" blocks, as stored in markdown frontmatter. Each block has a
// `_template` key naming its template in tina/config.ts. Tina's generated
// GraphQL types use `__typename` instead, so these are written by hand: keep
// them in step with the schema when adding fields or templates.
export type { IconName as FeatureIcon } from './icons';

export interface FeatureSection {
  _template: 'feature';
  anchor?: string;
  eyebrow?: string;
  heading: string;
  text?: string;
  points?: { icon?: IconName; title: string; text?: string }[];
  /** Web MP4 that plays in place of the photo; `image` becomes its poster. */
  video?: string;
  /** Watermark over the video's top-left corner, e.g. "Featuring Sencha Sound". */
  videoTag?: { label?: string; name?: string; url?: string };
  image?: string;
  imageAlt?: string;
  credit?: { label?: string; names?: { name: string; url?: string }[] };
}

export interface SplitSection {
  _template: 'split';
  anchor?: string;
  eyebrow?: string;
  heading: string;
  text?: string;
  image?: string;
  imageAlt?: string;
  imageSide?: 'left' | 'right';
  /** 'lemon' renders the section as a full-width yellow band. */
  background?: 'none' | 'lemon';
  /** Sticker on the photo corner, e.g. { value: 'Up to 500', label: 'people' }. */
  stat?: { value?: string; label?: string };
  cards?: { icon?: IconName; title: string; text?: string }[];
  action?: { label?: string; href?: string };
}

export interface SponsorsSection {
  _template: 'sponsors';
  anchor?: string;
  heading?: string;
  sponsors?: { name: string; logo?: string; url?: string }[];
}

export type Section = FeatureSection | SplitSection | SponsorsSection;

type Frontmatter = PageData & { sections?: Section[] | null };

export type Page = Omit<Frontmatter, 'swatchNotes' | 'sections'> & {
  slug: string;
  swatchNotes: SwatchNote[];
  sections: Section[];
  /** The rendered markdown body (Tina's `body` field). */
  Content: MarkdownInstance<Frontmatter>['Content'];
  /** Whether the body has any text, so empty bodies can be skipped. */
  hasBody: boolean;
};

const modules = import.meta.glob<MarkdownInstance<Frontmatter>>('../../content/pages/*.md', {
  eager: true,
});

/** Every Tina "page" document, keyed by the slug derived from its filename. */
export function getPages(): Page[] {
  return Object.entries(modules).map(([path, mod]) => ({
    ...mod.frontmatter,
    swatchNotes: (mod.frontmatter.swatchNotes ?? []).filter(
      (note): note is SwatchNote => !!note?.swatch,
    ),
    sections: mod.frontmatter.sections ?? [],
    slug: path.split('/').pop()!.replace(/\.md$/, ''),
    Content: mod.Content,
    hasBody: mod.rawContent().trim().length > 0,
  }));
}

export function getPage(slug: string): Page | undefined {
  return getPages().find((page) => page.slug === slug);
}
