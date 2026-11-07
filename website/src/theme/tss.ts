// Shared TSS entry point. `tss-react/mui` wires the `makeStyles` hook to MUI's
// `useTheme`, so every `useStyles` callback receives the same theme returned by
// `src/theme/theme.ts` (as long as the component sits inside <MuiProvider>).
//
//   import { makeStyles } from "../theme/tss";
//
//   const useStyles = makeStyles()((theme) => ({
//     root: { color: theme.palette.text.primary },
//   }));

export { keyframes } from 'tss-react';
export { makeStyles, tss, useStyles } from 'tss-react/mui';
