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
  // A circle: square box, 50% corners (via the frame's radius variable).
  // No padding: the content is centred and sized to the circle (see h1).
  '--circle': 'clamp(400px, 42vw, 540px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: 'var(--circle)',
  height: 'var(--circle)',
  padding: 0,
  '--frame-radius': '50%',
  // Heading scales with the circle, not the viewport, so it always fits.
  '& h1': { fontSize: 'calc(var(--circle) * 0.11)' },
  textAlign: 'center',
  // Vinyl record in yellow. Top layer: the centre label, a deeper shade of
  // lemon with a thin dark edge. Under it: faint grooves around the outside.
  '--lemon': theme.palette.lemon.main,
  '--label': 'color-mix(in srgb, var(--lemon), #ff9a00 18%)',
  '--groove': 'color-mix(in srgb, var(--lemon), #000 7%)',
  background: `
    radial-gradient(circle closest-side,
      var(--label) 0 72%,
      var(--groove) 72% calc(72% + 2px),
      transparent calc(72% + 2px)),
    repeating-radial-gradient(circle,
      var(--lemon) 0 7px,
      var(--groove) 7px 8px),
    var(--lemon)`,
  color: theme.palette.lemon.contrastText,
  // Border and offset shadow come from the global `.frame` class
  // (BaseLayout.astro), shared with the main content panel.
  // Phones: too narrow for title, text and buttons inside a circle, so it
  // goes back to a rounded card.
  [theme.breakpoints.down('sm')]: {
    width: 'auto',
    height: 'auto',
    maxWidth: 640,
    padding: theme.spacing(4.5, 3, 4),
    '--frame-radius': '22px',
    background: 'var(--lemon)',
    '& h1': { fontSize: 'clamp(2.25rem, 7.5vw, 4.25rem)' },
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
  const [firstWord, restOfTitle] = title.trim().split(/\s+(.*)/);
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
          {/* "Malt Biscuit" stacks on two lines: break after the first word. */}
          {firstWord}
          {restOfTitle && <br />}
          {restOfTitle}
        </Typography>
        <Typography sx={{ mt: 2.5, fontSize: '1.125rem', lineHeight: 1.6, textWrap: 'pretty' }}>
          {description}
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1.5, mt: 4 }}>
          {primaryAction?.label && (
            <Button
              // Opens the booking dialog (BookingDialog.tsx); /#book without JS.
              {...linkProps(primaryAction.href || '/#book')}
              data-booking
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
