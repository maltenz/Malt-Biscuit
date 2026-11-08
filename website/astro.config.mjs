import { rm } from 'node:fs/promises';

import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// public/fonts/genty/ holds the original Genty download, with its personal-use
// licence file. The site serves its own copy (public/fonts/genty.otf, under
// the commercial licence), so drop that folder from every build.
const dropDevOnlyFonts = {
  name: 'drop-dev-only-fonts',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await rm(new URL('fonts/genty/', dir), { recursive: true, force: true });
    },
  },
};

export default defineConfig({
  // SST deploys the Worker (not wrangler), so skip the adapter's auto-provisioned
  // bindings: optimise images at build time instead of via the IMAGES binding,
  // and leave sessions off (no SESSION KV). Re-enable either and add the matching
  // binding in sst.config.ts if you need them.
  adapter: cloudflare({ imageService: 'compile' }),
  session: false,
  integrations: [react(), dropDevOnlyFonts],
  output: 'server',
  server: {
    port: 3000,
  },
  vite: {
    // Pre-bundle MUI together so shared internals (e.g. roving-tab-index
    // context) are instantiated once across islands.
    optimizeDeps: {
      include: ['@mui/material', '@mui/icons-material/RocketLaunch'],
    },
    resolve: {
      dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled', '@mui/material'],
    },
  },
});
