import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { type ReactNode, useEffect, useState } from 'react';

// Building blocks shared by the site's dialogs (booking, contact).

export type Status = { kind: 'idle' | 'sending' | 'sent' } | { kind: 'error'; message: string };

/** Pill button: black ring and hard offset shadow, like the site's CTAs. */
export const pill = {
  fontWeight: 800,
  textTransform: 'none',
  borderRadius: 999,
  px: 3,
  border: '3px solid',
  borderColor: 'black.main',
  boxShadow: '4px 4px 0 #000',
  '&:hover': { boxShadow: '6px 6px 0 #000', borderWidth: 3 },
} as const;

/**
 * Open state for a dialog triggered by clicks on any element matching
 * `selector`. `key` changes on every open, so a form keyed on it starts empty.
 */
export function useDialogTrigger(selector: string) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target as Element | null)?.closest(selector)) return;
      event.preventDefault();
      setKey((k) => k + 1);
      setOpen(true);
    };
    // Capture phase: run before Astro's <ClientRouter /> click handler, which
    // would otherwise take over the link and navigate. Once this handler calls
    // preventDefault, the router leaves the click alone.
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [selector]);

  return { open, key, close: () => setOpen(false) };
}

/** Dialog in the site's frame style: black ring, rounded, hard shadow. */
export function SiteDialog({
  id,
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby={`${id}-title`}
      slotProps={{
        paper: {
          sx: { border: '3px solid #000', borderRadius: '22px', boxShadow: '10px 10px 0 #000' },
        },
      }}
    >
      <DialogTitle id={`${id}-title`} sx={{ pr: 7, pt: 3, fontWeight: 800, fontSize: '1.5rem' }}>
        {title}
        {subtitle && <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>{subtitle}</Typography>}
      </DialogTitle>
      <IconButton
        aria-label="Close"
        onClick={onClose}
        sx={{ position: 'absolute', right: 12, top: 12 }}
      >
        <CloseIcon />
      </IconButton>
      {children}
    </Dialog>
  );
}

/** Hidden field bots fill in and people never see; the API drops those. */
export function Honeypot() {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
    />
  );
}

/** POST JSON to an API route; throws with the route's error message. */
export async function postForm(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

/** Thank-you state shown after a successful send. */
export function SentMessage({
  heading,
  text,
  onClose,
}: {
  heading: string;
  text: string;
  onClose: () => void;
}) {
  return (
    <>
      <DialogContent>
        <Typography variant="h6" component="p" sx={{ fontWeight: 800, mb: 1 }}>
          {heading}
        </Typography>
        <Typography>{text}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="contained" color="lemon" onClick={onClose} sx={pill}>
          Close
        </Button>
      </DialogActions>
    </>
  );
}

/**
 * Collection notice for the forms (Privacy Act 2020, principle 3): what the
 * details are for, with a link to the policy. Opens in a new tab so the form
 * isn't lost.
 */
export function PrivacyNote() {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      We'll only use your details to reply and to plan your event. See our{' '}
      <Link href="/privacy" target="_blank" rel="noopener" sx={{ color: 'inherit' }}>
        Privacy Policy
      </Link>
      .
    </Typography>
  );
}

/** Cancel + submit row at the bottom of a form. */
export function FormActions({
  onCancel,
  sending,
  label,
}: {
  onCancel: () => void;
  sending: boolean;
  label: string;
}) {
  return (
    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
      <Button onClick={onCancel} color="black" sx={{ fontWeight: 700, textTransform: 'none' }}>
        Cancel
      </Button>
      <Button type="submit" variant="contained" color="flamingo" disabled={sending} sx={pill}>
        {sending ? 'Sending…' : label}
      </Button>
    </DialogActions>
  );
}
