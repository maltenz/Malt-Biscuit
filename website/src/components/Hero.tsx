import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { keyframes, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

import { soundCloudPlayerUrl, useSoundCloudPlayback } from '../lib/soundcloud';
import MuiProvider from './MuiProvider';

/** Profile photo on the record label; clicking it flips the record. */
const PROFILE_IMAGE = '/images/profile.jpg';
/** Video on the back of the record (portrait 576×672; cropped to the circle). */
const BACK_VIDEO = { src: '/videos/mb-dj-ai.mp4', poster: '/videos/mb-dj-ai-poster.jpg' };
/** SoundCloud track that plays while the video side is showing ("Sheep House"). */
const BACK_TRACK = 'https://api.soundcloud.com/tracks/2348390879';
/** Where the track starts on the first flip, in ms (1:35). */
const BACK_TRACK_START = (60 + 35) * 1000;

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

/** One full turn of the record (timing set where it's used). */
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

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
  // Subpages: a short band, just tall enough for the nav and the title.
  '&.compact': {
    minHeight: 0,
    padding: `calc(104px + ${theme.spacing(4)}) ${theme.spacing(3)} calc(var(--hero-overlap) + ${theme.spacing(5)})`,
    [theme.breakpoints.down('sm')]: {
      padding: `calc(96px + ${theme.spacing(2)}) ${theme.spacing(2)} calc(var(--hero-overlap) + ${theme.spacing(4)})`,
    },
  },
}));

/** Subpage title: pink, black outline and hard shadow, like the nav's Contact link. */
const PageTitle = styled('h1')({
  margin: 0,
  color: '#ff35b3',
  fontFamily: 'inherit',
  fontSize: 'clamp(2.5rem, 7vw, 5rem)',
  fontWeight: 900,
  lineHeight: 1.05,
  letterSpacing: '-0.01em',
  textAlign: 'center',
  textWrap: 'balance',
  WebkitTextStroke: 'clamp(2px, 0.35vw, 4px) #000',
  paintOrder: 'stroke fill',
  textShadow: 'clamp(4px, 0.6vw, 7px) clamp(4px, 0.6vw, 7px) 0 #000',
});

/** Record grooves: faint darker rings on lemon. Needs --lemon and --groove (set on Group). */
const GROOVES = `repeating-radial-gradient(circle,
    var(--lemon) 0 7px,
    var(--groove) 7px 8px),
  var(--lemon)`;

/** Full record: deeper-yellow centre label with a thin edge, over the grooves. Needs --label too. */
const RECORD = `radial-gradient(circle closest-side,
    var(--label) 0 72%,
    var(--groove) 72% calc(72% + 2px),
    transparent calc(72% + 2px)),
  ${GROOVES}`;

/** Card-flip timing, shared by the main record and the photo. */
const FLIP_TRANSITION = 'transform 0.8s cubic-bezier(0.3, 0.8, 0.3, 1)';

// Flip: Scene sets the 3D perspective, Flipper turns 180° on the Y axis, and
// the two faces (the record and the video) sit back to back inside it.
// Positioned and stacked above the profile photo, which tucks in behind it.
const Scene = styled('div')({ position: 'relative', zIndex: 1, perspective: '1800px' });

const Flipper = styled('div')({
  position: 'relative',
  display: 'grid',
  transformStyle: 'preserve-3d',
  transition: FLIP_TRANSITION,
  '&.flipped': { transform: 'rotateY(180deg)' },
  '& > *': { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
});

/** Back face: the dummy video, filling the same shape as the record. */
const Back = styled('div')(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  transform: 'rotateY(180deg)',
  overflow: 'hidden',
  '--frame-radius': '50%',
  background: theme.palette.black.main,
  '& video': {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    // Portrait clip: favour the top so the head stays inside the circle.
    objectPosition: 'center 30%',
    borderRadius: 'inherit',
  },
  [theme.breakpoints.down('sm')]: { '--frame-radius': '22px' },
}));

/** Round profile photo button, with a small play badge as the hint. */
const Avatar = styled('button')(({ theme }) => ({
  // Side by side (tablet and up): the same size as the record, tucked behind
  // its right edge, pulling back across the group's gap plus 30% of the photo.
  '--size': 'var(--circle)',
  position: 'relative',
  zIndex: 0,
  flex: 'none',
  [theme.breakpoints.up('md')]: {
    marginLeft: 'calc(-1 * clamp(24px, 3vw, 48px) - var(--size) * 0.3)',
  },
  // Stacked above the record on narrower screens: smaller (badge to match, below).
  [theme.breakpoints.down('md')]: { '--size': 'calc(var(--circle) * 0.38)' },
  width: 'var(--size)',
  height: 'var(--size)',
  padding: 0,
  border: 0,
  borderRadius: '50%',
  background: 'none',
  // Two faces that flip with the main record: the photo, and on the back a
  // yellow record like the main one.
  perspective: '1800px',
  '& .flip': {
    position: 'absolute',
    inset: 0,
    transformStyle: 'preserve-3d',
    transition: FLIP_TRANSITION,
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  '&[aria-pressed="true"] .flip': { transform: 'rotateY(180deg)' },
  '& .face': {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    // Same border and hard offset shadow as the record (the global .frame values).
    border: 'var(--frame-width) solid var(--frame-color)',
    borderRadius: '50%',
    boxShadow: 'var(--frame-offset) var(--frame-offset) 0 var(--frame-color)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  },
  // Front: the photo. Mirrored on an inner layer: mirroring the face itself
  // would count as turning it round, and backface-visibility would hide it.
  '& .photo::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    // Whole photo (portrait), anchored near the top so the head stays in frame.
    background: `center 20% / cover no-repeat url(${PROFILE_IMAGE})`,
    transform: 'scaleX(-1)',
  },
  // Back: a yellow record, matching the main one, with the name dead centre.
  // It spins slowly while showing (aria-pressed), like it's playing.
  '& .record': {
    transform: 'rotateY(180deg)',
  },
  '& .disc': {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    background: RECORD,
    color: theme.palette.lemon.contrastText,
    fontFamily: 'var(--font-brand)',
    fontSize: 'calc(var(--size) * 0.11)',
    lineHeight: 1.05,
    textAlign: 'center',
    // Slower than a real LP (33⅓ rpm would be 1.8s) so the name stays readable.
    animation: `${spin} 6s linear infinite`,
    animationPlayState: 'paused',
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  },
  '&[aria-pressed="true"] .disc': { animationPlayState: 'running' },
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': { transform: 'rotate(-3deg) scale(1.02)' },
  '&:focus-visible': { outline: '3px solid #4eb6f7', outlineOffset: 3 },
  // Play badge centred on the photo's ring at the bottom-right 45° point
  // (50% + 50% × cos 45° ≈ 85.4%), not the square box's corner.
  '& .badge': {
    position: 'absolute',
    left: '85.4%',
    top: '85.4%',
    translate: '-50% -50%',
    display: 'grid',
    placeItems: 'center',
    // Sized from the record, not the photo, so it stays button-sized.
    width: 'calc(var(--circle) * 0.18)',
    height: 'calc(var(--circle) * 0.18)',
    // Stacked above the record, the photo is small, so the badge is too.
    [theme.breakpoints.down('md')]: {
      width: 'calc(var(--size) * 0.32)',
      height: 'calc(var(--size) * 0.32)',
    },
    zIndex: 1,
    border: `3px solid ${theme.palette.black.main}`,
    borderRadius: '50%',
    background: theme.palette.flamingo.main,
    color: theme.palette.black.main,
  },
  '& .badge svg': {
    fontSize: 'calc(var(--circle) * 0.12)',
    [theme.breakpoints.down('md')]: { fontSize: 'calc(var(--size) * 0.2)' },
  },
  [theme.breakpoints.down('sm')]: { '--size': '128px' },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
}));

/**
 * The record and the profile photo beside it, centred on the page as one
 * group. Sets --circle (the record's size), which the photo scales from too.
 * Below tablet width there's no room side by side: the photo goes on top.
 */
const Group = styled('div')(({ theme }) => ({
  '--circle': 'clamp(400px, 42vw, 540px)',
  // Record colours, shared by the main record and the photo record.
  '--lemon': theme.palette.lemon.main,
  '--groove': 'color-mix(in srgb, var(--lemon), #000 7%)',
  '--label': 'color-mix(in srgb, var(--lemon), #ff9a00 18%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'clamp(24px, 3vw, 48px)',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column-reverse',
    gap: theme.spacing(3),
  },
  // Phones: the record becomes a full-width card; the photo stays centred.
  [theme.breakpoints.down('sm')]: {
    alignItems: 'stretch',
    width: '100%',
    '& > button': { alignSelf: 'center' },
  },
}));

const Card = styled('div')(({ theme }) => ({
  // A circle: square box, 50% corners (via the frame's radius variable).
  // No padding: the content is centred and sized to the circle (see h1).
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: 'var(--circle)',
  height: 'var(--circle)',
  padding: 0,
  '--frame-radius': '50%',
  // Heading scales with the circle, not the viewport, so it always fits.
  // --title-scale shrinks long titles (set per title in HeroSection).
  '& h1': { fontSize: 'calc(var(--circle) * var(--title-scale, 0.11))' },
  textAlign: 'center',
  // Vinyl record in yellow. Top layer: the centre label, a deeper shade of
  // lemon with a thin dark edge. Under it: faint grooves around the outside.
  background: RECORD,
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
  /**
   * The profile photo beside the record, and the video/track on its back.
   * On by default (home page). Off on subpages, which get a short band with
   * just the title (no record).
   */
  profile?: boolean;
}

/** Link props for a button: external links open in a new tab; no link yet → "#". */
const linkProps = (href?: string | null) => {
  const url = href?.trim() || '#';
  return /^https?:\/\//.test(url)
    ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
    : { href: url };
};

function HeroSection({
  title,
  description,
  primaryAction,
  secondaryAction,
  profile = true,
}: HeroProps) {
  const [firstWord, restOfTitle] = title.trim().split(/\s+(.*)/);
  // Title size on the record: 11% of the circle (as for "Malt Biscuit"), or
  // smaller when a line is long ("and Conditions") so it stays on the label.
  const longestLine = Math.max(firstWord.length, restOfTitle?.length ?? 0);
  // Script letters average ~0.6em wide; keep the longest line within ~70% of the circle.
  const titleScale = Math.min(0.11, 0.7 / (Math.max(longestLine, 1) * 0.6));
  const [flipped, setFlipped] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // The SoundCloud player loads on the first flip only, so visitors who never
  // flip the record make no requests to SoundCloud. It stays mounted after.
  const [trackLoaded, setTrackLoaded] = useState(false);
  const trackRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (flipped) setTrackLoaded(true);
  }, [flipped]);
  useSoundCloudPlayback(trackRef, flipped, trackLoaded, BACK_TRACK_START);

  // Play the video while its side is showing; pause and rewind when flipped back.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (flipped) {
      video.play().catch(() => {
        // Autoplay blocked: the poster stays up; nothing else to do.
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [flipped]);

  // Subpages: no record, just the title over a short zebra band.
  if (!profile) {
    return (
      <Section className="compact">
        <PageTitle>{title}</PageTitle>
      </Section>
    );
  }

  return (
    <Section>
      <Group>
        <Scene>
          <Flipper className={flipped ? 'flipped' : undefined}>
            <Card
              className="frame"
              inert={flipped}
              style={{ '--title-scale': titleScale } as CSSProperties}
            >
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
              <Typography
                sx={{ mt: 2.5, fontSize: '1.125rem', lineHeight: 1.6, textWrap: 'pretty' }}
              >
                {description}
              </Typography>
              <Stack
                direction="row"
                sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1.5, mt: 4 }}
              >
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
            {profile && (
              <Back className="frame" inert={!flipped}>
                <video
                  ref={videoRef}
                  src={BACK_VIDEO.src}
                  poster={BACK_VIDEO.poster}
                  muted
                  loop
                  playsInline
                  preload="none"
                />
                {trackLoaded && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      bottom: '12%',
                      transform: 'translateX(-50%)',
                      width: '68%',
                      p: '6px 14px',
                      border: '3px solid #000',
                      borderRadius: 999,
                      bgcolor: '#fff',
                      '& iframe': { display: 'block', width: '100%', height: 20, border: 0 },
                    }}
                  >
                    <iframe
                      ref={trackRef}
                      title="Sheep House by Malt Biscuit on SoundCloud"
                      src={soundCloudPlayerUrl(BACK_TRACK)}
                      allow="autoplay; encrypted-media"
                      scrolling="no"
                    />
                  </Box>
                )}
              </Back>
            )}
          </Flipper>
        </Scene>
        {/* Beside the record: flips it to the video and back. */}
        {profile && (
          <Avatar
            type="button"
            aria-label={flipped ? 'Flip the record back' : 'Flip the record: play video'}
            aria-pressed={flipped}
            onClick={() => setFlipped((f) => !f)}
          >
            <span className="flip" aria-hidden="true">
              <span className="face photo" />
              <span className="face record">
                <span className="disc">
                  <span>
                    {firstWord}
                    {restOfTitle && <br />}
                    {restOfTitle}
                  </span>
                </span>
              </span>
            </span>
            <span className="badge" aria-hidden="true">
              {flipped ? <ReplayIcon /> : <PlayArrowIcon />}
            </span>
          </Avatar>
        )}
      </Group>
    </Section>
  );
}

/**
 * Full-page home hero: a yellow record over a slowly drifting zebra pattern.
 * Hydrated on the client (client:load in index.astro) for the profile-photo
 * flip; the record itself is server-rendered, so it's laid out from the start.
 */
export default function Hero(props: HeroProps) {
  return (
    <MuiProvider>
      <HeroSection {...props} />
    </MuiProvider>
  );
}
