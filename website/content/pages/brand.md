---
title: Brand
description: The maltbiscuit colour palette, with live MUI examples and usage guidance.
swatchNotes:
  - swatch: black
    role: Ink
    usage: Body text, headings and dark surfaces. Use white text on black.
  - swatch: sky
    role: Primary
    usage: The default action colour. Buttons, links and focus states use sky unless told otherwise.
  - swatch: mint
    role: Positive
    usage: Success states, confirmations and "go" actions.
  - swatch: lemon
    role: Highlight
    usage: Badges, highlights and warnings. Too light to carry text on its own background, so pair it with black text.
  - swatch: flamingo
    role: Accent
    usage: Secondary actions and moments that should pop. Use sparingly, at most one flamingo element per view.
---

## Using the palette

Every colour is registered in the MUI theme as a full palette colour, with `main`, `light`, `dark` and `contrastText`. The names are typed, so they autocomplete and a typo fails the build.

Pass a colour name as a component's `color` prop:

```tsx
<Button variant="contained" color="mint">Save</Button>
<Chip label="New" color="lemon" />
```

Use the dotted path in `sx`:

```tsx
<Box sx={{ bgcolor: 'black.main', color: 'black.contrastText' }} />
```

Read it from the theme in `tss-react` styles:

```ts
const useStyles = makeStyles()((theme) => ({
  card: { borderColor: theme.palette.sky.dark },
}));
```

## Text on colour

Always use the colour's `contrastText` for text placed on it. Black takes white text; the four bright colours take black text. The widget above shows each pairing's contrast ratio: 4.5:1 or higher passes WCAG AA for body text.

## Changing colours

Colour values live in `website/src/theme/theme.ts`. Edit the hex value there and every component, along with this page, updates. The role and usage notes above are edited in Tina, under **Pages → Brand**.
