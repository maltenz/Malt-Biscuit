import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { Dayjs } from 'dayjs';
import { type FormEvent, useEffect, useState } from 'react';

import MuiProvider from './MuiProvider';

/**
 * Booking enquiry dialog, mounted once per page (BaseLayout.astro). Any element
 * with a `data-booking` attribute opens it (the nav, hero and footer Book Now
 * buttons); those are still plain links to /#book without JavaScript.
 * Submits to /api/booking, which emails the enquiry via Resend.
 */

type Status = { kind: 'idle' | 'sending' | 'sent' } | { kind: 'error'; message: string };

const pill = {
  fontWeight: 800,
  textTransform: 'none',
  borderRadius: 999,
  px: 3,
  border: '3px solid',
  borderColor: 'black.main',
  boxShadow: '4px 4px 0 #000',
  '&:hover': { boxShadow: '6px 6px 0 #000', borderWidth: 3 },
} as const;

function BookingForm({ onClose }: { onClose: () => void }) {
  const [date, setDate] = useState<Dayjs | null>(null);
  const [rig, setRig] = useState('yes');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    // The date picker isn't a native input, so the browser can't enforce it.
    if (!date?.isValid()) {
      setStatus({ kind: 'error', message: 'Please pick the date of your event.' });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          date: date.format('YYYY-MM-DD'),
          rig: rig === 'yes',
          message: form.get('message'),
          website: form.get('website'), // honeypot: real people leave it empty
        }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }
      setStatus({ kind: 'sent' });
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
    }
  }

  if (status.kind === 'sent') {
    return (
      <>
        <DialogContent>
          <Typography variant="h6" component="p" sx={{ fontWeight: 800, mb: 1 }}>
            Thanks, your enquiry is in.
          </Typography>
          <Typography>We'll get back to you soon about your date and setup.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="contained" color="lemon" onClick={onClose} sx={pill}>
            Close
          </Button>
        </DialogActions>
      </>
    );
  }

  const sending = status.kind === 'sending';

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2.5}>
          <TextField name="name" label="Name" required autoComplete="name" fullWidth />
          <TextField
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            fullWidth
          />
          <DatePicker
            label="Event date"
            value={date}
            onChange={setDate}
            disablePast
            format="DD/MM/YYYY"
            slotProps={{ textField: { required: true, fullWidth: true, name: 'date' } }}
          />
          <FormControl>
            <FormLabel id="booking-rig-label" sx={{ color: 'text.primary', fontWeight: 700 }}>
              Include the Malt Biscuit rig?
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="booking-rig-label"
              name="rig"
              value={rig}
              onChange={(event) => setRig(event.target.value)}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes, bring the rig" />
              <FormControlLabel value="no" control={<Radio />} label="No, DJ only" />
            </RadioGroup>
          </FormControl>
          <TextField
            name="message"
            label="Message"
            placeholder="Where is it, roughly how many people, and anything else we should know?"
            multiline
            minRows={4}
            required
            fullWidth
          />
          {/* Honeypot for bots: hidden from people and screen readers. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
          />
          {status.kind === 'error' && <Alert severity="error">{status.message}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} color="black" sx={{ fontWeight: 700, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="flamingo" disabled={sending} sx={pill}>
          {sending ? 'Sending…' : 'Send enquiry'}
        </Button>
      </DialogActions>
    </form>
  );
}

function BookingDialogInner() {
  const [open, setOpen] = useState(false);
  // Remount the form each time it opens, so it starts empty after a send.
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const trigger = (event.target as Element | null)?.closest('[data-booking]');
      if (!trigger) return;
      event.preventDefault();
      setFormKey((key) => key + 1);
      setOpen(true);
    };
    // Capture phase: run before Astro's <ClientRouter /> click handler, which
    // would otherwise take over the /#book link and navigate. Once this
    // handler calls preventDefault, the router leaves the click alone.
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  const close = () => setOpen(false);

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="sm"
      aria-labelledby="booking-title"
      slotProps={{
        paper: {
          sx: {
            border: '3px solid #000',
            borderRadius: '22px',
            boxShadow: '10px 10px 0 #000',
          },
        },
      }}
    >
      <DialogTitle id="booking-title" sx={{ pr: 7, pt: 3, fontWeight: 800, fontSize: '1.5rem' }}>
        Book Malt Biscuit
        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
          Tell us about your event and we'll get back to you.
        </Typography>
      </DialogTitle>
      <IconButton
        aria-label="Close"
        onClick={close}
        sx={{ position: 'absolute', right: 12, top: 12 }}
      >
        <CloseIcon />
      </IconButton>
      <BookingForm key={formKey} onClose={close} />
    </Dialog>
  );
}

export default function BookingDialog() {
  return (
    <MuiProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BookingDialogInner />
      </LocalizationProvider>
    </MuiProvider>
  );
}
