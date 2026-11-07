import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { type ReactNode, useState } from 'react';
import { TssCacheProvider } from 'tss-react';

import theme from '../theme/theme';

/**
 * Wrap any MUI-powered React island in this provider so it picks up the shared
 * theme and the two Emotion styling engines (MUI itself + `tss-react`):
 *
 *   ---
 *   import MuiProvider from "../components/MuiProvider";
 *   import Widget from "../components/Widget";
 *   ---
 *   <MuiProvider client:load>
 *     <Widget client:load />
 *   </MuiProvider>
 *
 * MUI's cache uses `prepend: true` so its <style> tags land at the top of
 * <head>, keeping Astro's global styles and `tss-react`'s `makeStyles` output
 * (inserted afterwards, so it wins specificity ties) predictably layered.
 */
export default function MuiProvider({ children }: { children: ReactNode }) {
  const [{ muiCache, tssCache }] = useState(() => ({
    muiCache: createCache({ key: 'mui', prepend: true }),
    tssCache: createCache({ key: 'tss' }),
  }));

  return (
    <CacheProvider value={muiCache}>
      <TssCacheProvider value={tssCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </TssCacheProvider>
    </CacheProvider>
  );
}
