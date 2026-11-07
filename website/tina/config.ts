import { defineConfig } from 'tinacms';

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
                options: ['midnight', 'sky', 'mint', 'lemon', 'flamingo'],
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
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
    ],
  },
});
