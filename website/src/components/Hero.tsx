import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { keyframes, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import MuiProvider from './MuiProvider';

// Styled with MUI `styled`/`sx` (not tss-react `makeStyles`): these styles are
// rendered into the server HTML, so the full-page hero is laid out from the
// first frame instead of after hydration.

/** Stripe scale: size of one unrotated zebra tile (public/zebra.svg, 640×640), in CSS px. */
const STRIPE = 560;
/**
 * public/zebra-45.svg is the same pattern rotated 45°. Its square repeat is √2
 * times the unrotated tile, so that's the tile size and the loop distance;
 * the drift itself stays horizontal.
 */
const TILE = STRIPE * Math.SQRT2;

const drift = keyframes`
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(${TILE}px, 0, 0); }
`;

const Section = styled('section')(({ theme }) => ({
  position: 'relative',
  isolation: 'isolate',
  display: 'grid',
  placeItems: 'center',
  // Full viewport. `svh` keeps it steady while mobile browser bars show/hide.
  minHeight: '100svh',
  overflow: 'hidden',
  // Extra room at the bottom for the content panel that overlaps the hero, so
  // the card stays centred in the part of the hero that's still visible.
  padding: `${theme.spacing(12)} ${theme.spacing(3)} calc(var(--hero-overlap) + ${theme.spacing(8)})`,
  background: '#ffffff',
  // The zebra layer: a black fill cut out by the stripe tile, one tile wider
  // than the hero so it can drift sideways by exactly one tile and loop.
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: `0 0 0 -${TILE}px`,
    zIndex: -1,
    backgroundColor: theme.palette.black.main,
    maskImage: 'url(/zebra-45.svg)',
    maskSize: `${TILE}px ${TILE}px`,
    maskRepeat: 'repeat',
    // 60s per unrotated tile, scaled so the on-screen speed is unchanged.
    animation: `${drift} ${60 * Math.SQRT2}s linear infinite`,
    willChange: 'transform',
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  },
  // Hold the drift while a video on the page is playing (set by the feature
  // section's video script), and pick it up from the same spot afterwards.
  'html[data-video-playing] &::before': {
    animationPlayState: 'paused',
  },
  [theme.breakpoints.down('sm')]: {
    padding: `${theme.spacing(10)} ${theme.spacing(2)} calc(var(--hero-overlap) + ${theme.spacing(6)})`,
  },
}));

const Card = styled('div')(({ theme }) => ({
  maxWidth: 640,
  padding: theme.spacing(6, 6, 5),
  textAlign: 'center',
  background: theme.palette.lemon.main,
  color: theme.palette.lemon.contrastText,
  // Border, corners and offset shadow come from the global `.frame` class
  // (BaseLayout.astro), shared with the main content panel.
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4.5, 3, 4),
  },
}));

const pill = {
  fontWeight: 700,
  textTransform: 'none',
  borderRadius: 999,
  px: 3,
  border: '3px solid',
  borderColor: 'black.main',
  boxShadow: 'none',
  '&:hover': { boxShadow: 'none', borderWidth: 3 },
} as const;

interface Action {
  label?: string | null;
  href?: string | null;
}

export interface HeroProps {
  title: string;
  description: string;
  primaryAction?: Action | null;
  secondaryAction?: Action | null;
}

/** Link props for a button: external links open in a new tab; no link yet → "#". */
const linkProps = (href?: string | null) => {
  const url = href?.trim() || '#';
  return /^https?:\/\//.test(url)
    ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
    : { href: url };
};

function HeroSection({ title, description, primaryAction, secondaryAction }: HeroProps) {
  return (
    <Section>
      <Card className="frame">
        <Typography
          variant="h1"
          // Brand script (global --font-brand, set in BaseLayout.astro).
          sx={{
            fontFamily: 'var(--font-brand)',
            fontWeight: 400,
            letterSpacing: 0,
            lineHeight: 1.05,
            fontSize: 'clamp(2.25rem, 7.5vw, 4.25rem)',
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ mt: 2.5, fontSize: '1.125rem', lineHeight: 1.6, textWrap: 'pretty' }}>
          {description}
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1.5, mt: 4 }}>
          {primaryAction?.label && (
            <Button
              {...linkProps(primaryAction.href)}
              variant="contained"
              color="flamingo"
              size="large"
              startIcon={<EventAvailableIcon />}
              sx={pill}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction?.label && (
            <Button
              {...linkProps(secondaryAction.href)}
              variant="outlined"
              color="black"
              size="large"
              startIcon={<GraphicEqIcon />}
              sx={{ ...pill, bgcolor: '#ffffff' }}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Stack>
      </Card>
    </Section>
  );
}

/**
 * Full-page home hero: a lemon card over a slowly drifting zebra pattern.
 * It has no interactive state, so it renders server-side with no client JS.
 */
export default function Hero(props: HeroProps) {
  return (
    <MuiProvider>
      <HeroSection {...props} />
    </MuiProvider>
  );
}
