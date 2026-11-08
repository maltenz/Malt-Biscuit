import { createTheme } from '@mui/material/styles';

// "Summer party" palette. Each swatch is a full MUI palette colour (main /
// light / dark / contrastText), so it works anywhere MUI takes a colour:
//   <Button color="flamingo">   sx={{ bgcolor: 'sky.main', color: 'sky.contrastText' }}
//   theme.palette.mint.dark
export const swatches = {
  black: '#000000',
  sky: '#4EB6F7',
  mint: '#11ED7F',
  lemon: '#FFF02E',
  flamingo: '#FF35B3',
} as const;

export type SwatchName = keyof typeof swatches;
type SwatchPalette = Record<SwatchName, import('@mui/material/styles').PaletteColor>;
type SwatchPaletteOptions = Partial<
  Record<SwatchName, import('@mui/material/styles').PaletteColorOptions>
>;
type SwatchOverrides = Record<SwatchName, true>;

declare module '@mui/material/styles' {
  interface Palette extends SwatchPalette {}
  interface PaletteOptions extends SwatchPaletteOptions {}
}
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides extends SwatchOverrides {}
}
declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides extends SwatchOverrides {}
}
declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides extends SwatchOverrides {}
}
declare module '@mui/material/Badge' {
  interface BadgePropsColorOverrides extends SwatchOverrides {}
}
declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides extends SwatchOverrides {}
}

const base = createTheme();
const black = base.palette.augmentColor({
  color: { main: swatches.black, contrastText: '#ffffff' },
  name: 'black',
});
// The four bright swatches are too light for white text, so they use black.
const bright = (name: Exclude<SwatchName, 'black'>) =>
  base.palette.augmentColor({
    color: { main: swatches[name], contrastText: swatches.black },
    name,
  });

// Colours mirror the global palette in BaseLayout.astro so MUI islands sit
// visually flush with the static Astro markup around them.
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    black,
    sky: bright('sky'),
    mint: bright('mint'),
    lemon: bright('lemon'),
    flamingo: bright('flamingo'),
    // MUI components default to `primary` (and a few to `secondary`), so those
    // two still need a value; they simply alias the named swatches.
    primary: bright('sky'),
    secondary: bright('flamingo'),
    text: { primary: swatches.black, secondary: '#525252' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  shape: { borderRadius: 10 },
});

export default theme;
