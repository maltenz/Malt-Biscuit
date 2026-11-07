import type { MarkdownInstance } from 'astro';

import type { PageQuery } from '../../tina/__generated__/types';
import type { StripNull } from '../helpers/types';

type PageData = StripNull<Omit<PageQuery['page'], '__typename' | 'id' | '_sys' | 'body'>>;

export type SwatchNote = StripNull<NonNullable<NonNullable<PageData['swatchNotes']>[number]>>;

export type Page = Omit<PageData, 'swatchNotes'> & {
  slug: string;
  swatchNotes: SwatchNote[];
  /** The rendered markdown body (Tina's `body` field). */
  Content: MarkdownInstance<PageData>['Content'];
};

const modules = import.meta.glob<MarkdownInstance<PageData>>('../../content/pages/*.md', {
  eager: true,
});

/** Every Tina "page" document, keyed by the slug derived from its filename. */
export function getPages(): Page[] {
  return Object.entries(modules).map(([path, mod]) => ({
    ...mod.frontmatter,
    swatchNotes: (mod.frontmatter.swatchNotes ?? []).filter(
      (note): note is SwatchNote => !!note?.swatch,
    ),
    slug: path.split('/').pop()!.replace(/\.md$/, ''),
    Content: mod.Content,
  }));
}

export function getPage(slug: string): Page | undefined {
  return getPages().find((page) => page.slug === slug);
}
