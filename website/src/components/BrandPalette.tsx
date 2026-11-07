import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MailIcon from '@mui/icons-material/Mail';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import { getContrastRatio, type PaletteColor, rgbToHex, useTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import type { SwatchNote } from '../lib/content';
import { type SwatchName, swatches } from '../theme/theme';
import { makeStyles } from '../theme/tss';
import MuiProvider from './MuiProvider';

const names = Object.keys(swatches) as SwatchName[];

/** MUI generates `light`/`dark` as `rgb()` strings; show everything as hex. */
const toHex = (color: string) => (color.startsWith('#') ? color : rgbToHex(color)).toUpperCase();

const useStyles = makeStyles()((theme) => ({
  strip: {
    display: 'flex',
    height: 72,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: theme.spacing(4),
  },
  stripCell: {
    flex: 1,
    border: 0,
    padding: 0,
    cursor: 'pointer',
    transition: 'flex 0.2s ease',
    '&:hover, &:focus-visible': { flex: 1.6 },
  },
  grid: {
    display: 'grid',
    gap: theme.spacing(2.5),
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    overflow: 'hidden',
    background: theme.palette.background.paper,
    boxShadow: '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px rgb(0 0 0 / 0.06)',
  },
  hero: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 140,
    padding: theme.spacing(2, 1, 2, 2.5),
  },
  tones: { display: 'flex' },
  tone: {
    flex: 1,
    border: 0,
    cursor: 'pointer',
    padding: theme.spacing(1, 1.5),
    font: 'inherit',
    fontSize: 12,
    textAlign: 'left',
    lineHeight: 1.3,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2, 2.5, 2.5),
    flex: 1,
  },
  token: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12.5,
    padding: theme.spacing(0.25, 0.75),
    borderRadius: 6,
    background: theme.palette.action.hover,
  },
  playground: {
    marginTop: theme.spacing(5),
    padding: theme.spacing(3),
    borderRadius: 16,
    background: theme.palette.background.paper,
    boxShadow: '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px rgb(0 0 0 / 0.06)',
  },
}));

interface BrandPaletteProps {
  notes: SwatchNote[];
}

function Palette({ notes }: BrandPaletteProps) {
  const { classes } = useStyles();
  const theme = useTheme();
  const [copied, setCopied] = useState<string | null>(null);
  const [active, setActive] = useState<SwatchName>('sky');

  const copy = (value: string) => {
    navigator.clipboard?.writeText(value).then(
      () => setCopied(value),
      () => setCopied(null),
    );
  };

  const color = (name: SwatchName): PaletteColor => theme.palette[name];

  return (
    <div>
      <div className={classes.strip}>
        {names.map((name) => (
          <Tooltip key={name} title={`${name} · ${toHex(color(name).main)}`}>
            <button
              type="button"
              aria-label={`Copy ${name} ${toHex(color(name).main)}`}
              className={classes.stripCell}
              style={{ background: color(name).main }}
              onClick={() => copy(toHex(color(name).main))}
            />
          </Tooltip>
        ))}
      </div>

      <div className={classes.grid}>
        {names.map((name) => {
          const c = color(name);
          const note = notes.find((n) => n.swatch === name);
          const ratio = getContrastRatio(c.main, c.contrastText);
          const passes = ratio >= 4.5;
          return (
            <article key={name} className={classes.card}>
              <div className={classes.hero} style={{ background: c.main, color: c.contrastText }}>
                <div>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {note?.role ? `${note.role} · ` : ''}
                    {toHex(c.main)}
                  </Typography>
                </div>
                <IconButton
                  aria-label={`Copy ${toHex(c.main)}`}
                  onClick={() => copy(toHex(c.main))}
                  sx={{ color: 'inherit' }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </div>

              <div className={classes.tones}>
                {(['light', 'main', 'dark'] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    className={classes.tone}
                    style={{ background: c[tone], color: theme.palette.getContrastText(c[tone]) }}
                    onClick={() => copy(toHex(c[tone]))}
                    aria-label={`Copy ${name} ${tone} ${toHex(c[tone])}`}
                  >
                    <strong>{tone}</strong>
                    <br />
                    {toHex(c[tone])}
                  </button>
                ))}
              </div>

              <div className={classes.body}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography
                    component="span"
                    sx={{
                      px: 1,
                      borderRadius: 1,
                      fontWeight: 700,
                      bgcolor: `${name}.main`,
                      color: `${name}.contrastText`,
                    }}
                  >
                    Aa
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ratio.toFixed(1)}:1 with {toHex(c.contrastText)}
                  </Typography>
                  <Chip
                    size="small"
                    label={passes ? 'AA' : 'Large text only'}
                    color={passes ? 'mint' : 'lemon'}
                  />
                </Stack>

                {note?.usage && <Typography variant="body2">{note.usage}</Typography>}

                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 'auto' }}>
                  <code className={classes.token}>color="{name}"</code>
                  <code className={classes.token}>'{name}.main'</code>
                </Stack>
              </div>
            </article>
          );
        })}
      </div>

      <section className={classes.playground}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}
        >
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
            In components
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={active}
            onChange={(_, next: SwatchName | null) => next && setActive(next)}
            aria-label="Colour to preview"
          >
            {names.map((name) => (
              <ToggleButton key={name} value={name} sx={{ textTransform: 'none', px: 1.5 }}>
                {name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Button variant="contained" color={active}>
            Contained
          </Button>
          <Button variant="outlined" color={active}>
            Outlined
          </Button>
          <Button variant="text" color={active}>
            Text
          </Button>
          <Chip label="Chip" color={active} />
          <Chip label="Outlined chip" variant="outlined" color={active} />
          <Badge badgeContent={4} color={active}>
            <MailIcon color="action" />
          </Badge>
          <IconButton color={active} aria-label="Favourite">
            <FavoriteIcon />
          </IconButton>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          <code className={classes.token}>{`<Button variant="contained" color="${active}">`}</code>
        </Typography>
      </section>

      <Snackbar
        open={copied !== null}
        autoHideDuration={1600}
        onClose={() => setCopied(null)}
        message={`Copied ${copied ?? ''}`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
}

/** Brand palette widget: swatches, tones, contrast checks and a live component preview. */
export default function BrandPalette(props: BrandPaletteProps) {
  return (
    <MuiProvider>
      <Palette {...props} />
    </MuiProvider>
  );
}
