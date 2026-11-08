import Alert from '@mui/material/Alert';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';
import { type FormEvent, useState } from 'react';

import {
  errorMessage,
  FormActions,
  Honeypot,
  postForm,
  SentMessage,
  SiteDialog,
  type Status,
  useDialogTrigger,
} from './shared';

/**
 * Booking enquiry dialog. Opened by any `[data-booking]` element (the nav,
 * hero and footer Book Now buttons, plain links to /#book without JS).
 * Submits to /api/booking, which emails the enquiry via Resend.
 */

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
      await postForm('/api/booking', {
        name: form.get('name'),
        email: form.get('email'),
        date: date.format('YYYY-MM-DD'),
        rig: rig === 'yes',
        message: form.get('message'),
        website: form.get('website'),
      });
      setStatus({ kind: 'sent' });
    } catch (error) {
      setStatus({ kind: 'error', message: errorMessage(error) });
    }
  }

  if (status.kind === 'sent') {
    return (
      <SentMessage
        heading="Thanks, your enquiry is in."
        text="We'll get back to you soon about your date and setup."
        onClose={onClose}
      />
    );
  }

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
          <Honeypot />
          {status.kind === 'error' && <Alert severity="error">{status.message}</Alert>}
        </Stack>
      </DialogContent>
      <FormActions onCancel={onClose} sending={status.kind === 'sending'} label="Send enquiry" />
    </form>
  );
}

export default function BookingDialog() {
  const { open, key, close } = useDialogTrigger('[data-booking]');
  return (
    <SiteDialog
      id="booking"
      open={open}
      onClose={close}
      title="Book Malt Biscuit"
      subtitle="Tell us about your event and we'll get back to you."
    >
      <BookingForm key={key} onClose={close} />
    </SiteDialog>
  );
}
