import { defineConfig } from 'tinacms';

import { ICON_NAMES } from '../src/lib/icons';

export default defineConfig({
  branch: process.env.HEAD || process.env.GITHUB_REF_NAME || 'main',
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: { tina: { mediaRoot: '', publicFolder: 'public' } },
  schema: {
    collections: [
      {
        name: 'page',
        label: 'Pages',
        path: 'content/pages',
        format: 'md',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            required: true,
          },
          {
            type: 'object',
            name: 'hero',
            label: 'Hero buttons',
            description:
              'Buttons on the home hero. The heading and text above them are the Title and Description.',
            fields: [
              {
                type: 'object',
                name: 'primaryAction',
                label: 'Main button',
                fields: [
                  { type: 'string', name: 'label', label: 'Label' },
                  {
                    type: 'string',
                    name: 'href',
                    label: 'Link',
                    description: 'A page (/brand), a web address, or mailto:you@example.com.',
                  },
                ],
              },
              {
                type: 'object',
                name: 'secondaryAction',
                label: 'Second button',
                fields: [
                  { type: 'string', name: 'label', label: 'Label' },
                  {
                    type: 'string',
                    name: 'href',
                    label: 'Link',
                    description: 'A page (/brand), a web address, or mailto:you@example.com.',
                  },
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'swatchNotes',
            label: 'Colour usage notes',
            description:
              'Shown on the brand page palette widget. Colour values live in the MUI theme.',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.swatch }) },
            fields: [
              {
                type: 'string',
                name: 'swatch',
                label: 'Colour',
                required: true,
                options: ['black', 'sky', 'mint', 'lemon', 'flamingo'],
              },
              {
                type: 'string',
                name: 'role',
                label: 'Role',
                description: 'One or two words, e.g. "Accent".',
              },
              { type: 'string', name: 'usage', label: 'Usage', ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object',
            name: 'sections',
            label: 'Sections',
            description:
              'Page sections below the hero, top to bottom. Drag to reorder. Feature sections sit in the white panel; Split and Sponsors sections sit on the page background.',
            list: true,
            templates: [
              {
                name: 'feature',
                label: 'Feature (text, points and photo)',
                ui: { itemProps: (item) => ({ label: `Feature: ${item?.heading ?? ''}` }) },
                fields: [
                  {
                    type: 'string',
                    name: 'anchor',
                    label: 'Anchor',
                    description: 'Used in links, e.g. "popups" for /#popups.',
                  },
                  {
                    type: 'string',
                    name: 'eyebrow',
                    label: 'Label',
                    description: 'Small tag above the heading.',
                  },
                  { type: 'string', name: 'heading', label: 'Heading', required: true },
                  { type: 'string', name: 'text', label: 'Intro', ui: { component: 'textarea' } },
                  {
                    type: 'object',
                    name: 'points',
                    label: 'Points',
                    list: true,
                    ui: { itemProps: (item) => ({ label: item?.title }) },
                    fields: [
                      {
                        type: 'string',
                        name: 'icon',
                        label: 'Icon',
                        options: ICON_NAMES,
                      },
                      { type: 'string', name: 'title', label: 'Title', required: true },
                      {
                        type: 'string',
                        name: 'text',
                        label: 'Text',
                        ui: { component: 'textarea' },
                      },
                    ],
                  },
                  {
                    type: 'string',
                    name: 'video',
                    label: 'Video (optional)',
                    description:
                      'Path to a web MP4 (H.264), e.g. /videos/popup.mp4. Shown in place of the photo, paused, with a play button; the photo becomes its poster.',
                  },
                  {
                    type: 'object',
                    name: 'videoTag',
                    label: 'Video watermark (optional)',
                    description:
                      'Small label over the top-left corner of the video, e.g. "Featuring Sencha Sound".',
                    fields: [
                      {
                        type: 'string',
                        name: 'label',
                        label: 'Label',
                        description: 'e.g. "Featuring".',
                      },
                      {
                        type: 'string',
                        name: 'name',
                        label: 'Name',
                        description: 'e.g. "Sencha Sound".',
                      },
                      { type: 'string', name: 'url', label: 'Link (optional)' },
                    ],
                  },
                  {
                    type: 'image',
                    name: 'image',
                    label: 'Photo',
                    description: 'Shown on its own, or as the still before the video plays.',
                  },
                  { type: 'string', name: 'imageAlt', label: 'Photo/video description (alt text)' },
                  {
                    type: 'object',
                    name: 'credit',
                    label: 'Credit tag on the photo',
                    fields: [
                      {
                        type: 'string',
                        name: 'label',
                        label: 'Label',
                        description: 'e.g. "Sound system by".',
                      },
                      {
                        type: 'object',
                        name: 'names',
                        label: 'Names',
                        list: true,
                        ui: { itemProps: (item) => ({ label: item?.name }) },
                        fields: [
                          { type: 'string', name: 'name', label: 'Name', required: true },
                          { type: 'string', name: 'url', label: 'Link (optional)' },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                name: 'split',
                label: 'Split (photo + content, on the page background)',
                ui: { itemProps: (item) => ({ label: `Split: ${item?.heading ?? ''}` }) },
                fields: [
                  {
                    type: 'string',
                    name: 'anchor',
                    label: 'Anchor',
                    description: 'Used in links, e.g. "book" for /#book.',
                  },
                  {
                    type: 'string',
                    name: 'eyebrow',
                    label: 'Label',
                    description: 'Small tag above the heading.',
                  },
                  { type: 'string', name: 'heading', label: 'Heading', required: true },
                  { type: 'string', name: 'text', label: 'Intro', ui: { component: 'textarea' } },
                  { type: 'image', name: 'image', label: 'Photo' },
                  { type: 'string', name: 'imageAlt', label: 'Photo description (alt text)' },
                  {
                    type: 'string',
                    name: 'imageSide',
                    label: 'Photo side',
                    options: ['left', 'right'],
                  },
                  {
                    type: 'string',
                    name: 'background',
                    label: 'Background',
                    description: 'Lemon: a full-width yellow band with black lines top and bottom.',
                    options: ['none', 'lemon'],
                  },
                  {
                    type: 'object',
                    name: 'stat',
                    label: 'Stat sticker on the photo (optional)',
                    description:
                      'A big number in a sticker on the photo corner, e.g. "Up to 500" / "people".',
                    fields: [
                      {
                        type: 'string',
                        name: 'value',
                        label: 'Value',
                        description: 'e.g. "Up to 500".',
                      },
                      {
                        type: 'string',
                        name: 'label',
                        label: 'Label',
                        description: 'e.g. "people".',
                      },
                    ],
                  },
                  {
                    type: 'object',
                    name: 'cards',
                    label: 'Cards',
                    list: true,
                    ui: { itemProps: (item) => ({ label: item?.title }) },
                    fields: [
                      { type: 'string', name: 'icon', label: 'Icon', options: ICON_NAMES },
                      { type: 'string', name: 'title', label: 'Title', required: true },
                      {
                        type: 'string',
                        name: 'text',
                        label: 'Text',
                        ui: { component: 'textarea' },
                      },
                    ],
                  },
                  {
                    type: 'object',
                    name: 'action',
                    label: 'Button',
                    fields: [
                      { type: 'string', name: 'label', label: 'Label' },
                      {
                        type: 'string',
                        name: 'href',
                        label: 'Link',
                        description:
                          'A page, a web address, or mailto:you@example.com. Empty: uses the hero Book Now link.',
                      },
                    ],
                  },
                ],
              },
              {
                name: 'sponsors',
                label: 'Sponsors (black band with logos)',
                ui: { itemProps: (item) => ({ label: `Sponsors: ${item?.heading ?? ''}` }) },
                fields: [
                  {
                    type: 'string',
                    name: 'anchor',
                    label: 'Anchor',
                    description: 'e.g. "sponsors" for /#sponsors.',
                  },
                  {
                    type: 'string',
                    name: 'heading',
                    label: 'Heading',
                    description: 'e.g. "Sponsored by".',
                    // Required like the other sections' headings: Tina queries all
                    // section templates together, and a field shared across them
                    // must have the same nullability.
                    required: true,
                  },
                  {
                    type: 'object',
                    name: 'sponsors',
                    label: 'Sponsors',
                    list: true,
                    ui: { itemProps: (item) => ({ label: item?.name }) },
                    fields: [
                      { type: 'string', name: 'name', label: 'Name', required: true },
                      {
                        type: 'image',
                        name: 'logo',
                        label: 'Logo',
                        description:
                          'Light logo for a black background; SVG or PNG with transparency works best.',
                      },
                      { type: 'string', name: 'url', label: 'Link (optional)' },
                    ],
                  },
                ],
              },
            ],
          },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
      {
        name: 'settings',
        label: 'Site settings',
        path: 'content/settings',
        format: 'json',
        // Single document (site.json): no create/delete in the CMS.
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: 'object',
            name: 'footer',
            label: 'Footer',
            fields: [
              { type: 'string', name: 'tagline', label: 'Tagline' },
              {
                type: 'object',
                name: 'cta',
                label: 'Button',
                fields: [
                  { type: 'string', name: 'label', label: 'Label' },
                  { type: 'string', name: 'href', label: 'Link' },
                ],
              },
              {
                type: 'object',
                name: 'instagram',
                label: 'Instagram',
                description: 'Shown next to the button. Leave the handle empty to hide it.',
                fields: [
                  { type: 'string', name: 'handle', label: 'Handle (without @)' },
                  { type: 'string', name: 'href', label: 'Profile link' },
                ],
              },
              {
                type: 'object',
                name: 'links',
                label: 'Bottom links',
                description: 'Small links next to the copyright line, e.g. Privacy and Terms.',
                list: true,
                ui: { itemProps: (item: { label?: string }) => ({ label: item?.label }) },
                fields: [
                  { type: 'string', name: 'label', label: 'Label' },
                  { type: 'string', name: 'href', label: 'Link', description: 'A page (/privacy) or a web address.' },
                ],
              },
              {
                type: 'object',
                name: 'about',
                label: 'About blurb',
                description: 'Short column next to the brand, e.g. about tech and marketing work.',
                fields: [
                  {
                    type: 'image',
                    name: 'logo',
                    label: 'Logo (optional)',
                    description:
                      'Shown above the heading, linked to the address below. Light logo with a transparent background.',
                  },
                  { type: 'string', name: 'heading', label: 'Heading' },
                  { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
                  {
                    type: 'object',
                    name: 'link',
                    label: 'Link (optional)',
                    description: 'Shown under the text when both a label and an address are set.',
                    fields: [
                      { type: 'string', name: 'label', label: 'Label' },
                      { type: 'string', name: 'href', label: 'Link' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
