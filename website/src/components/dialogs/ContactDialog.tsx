import InstagramIcon from '@mui/icons-material/Instagram';
import PhoneIcon from '@mui/icons-material/Phone';
import Alert from '@mui/material/Alert';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { type FormEvent, useState } from 'react';

import {
  errorMessage,
  FormActions,
  Honeypot,
  PrivacyNote,
  postForm,
  SentMessage,
  SiteDialog,
  type Status,
  useDialogTrigger,
} from './shared';

/**
 * Contact dialog: Instagram and phone up top, then a message form. Opened by
 * any `[data-contact]` element (the nav and footer Contact links; without JS
 * they go to the footer). Submits to /api/contact, emailed via Resend.
 */

export interface ContactDetails {
  phone?: string;
  instagramHandle?: string;
  instagramHref?: string;
}

const linkSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  color: 'text.primary',
  fontWeight: 700,
  textDecorationColor: '#FF35B3',
  textDecorationThickness: 2,
  textUnderlineOffset: 4,
} as const;

function ContactLinks({ phone, instagramHandle, instagramHref }: ContactDetails) {
  if (!phone && !instagramHandle) return null;
  return (
    <>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: { xs: 1.5, sm: 3 } }}>
        {instagramHandle && instagramHref && (
          <Link href={instagramHref} target="_blank" rel="noopener noreferrer" sx={linkSx}>
            <InstagramIcon /> @{instagramHandle}
          </Link>
        )}
        {phone && (
          <Link href={`tel:${phone.replace(/[^\d+]/g, '')}`} sx={linkSx}>
            <PhoneIcon /> {phone}
          </Link>
        )}
      </Stack>
      <Divider sx={{ my: 2.5 }} />
    </>
  );
}

function ContactForm({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus({ kind: 'sending' });
    try {
      await postForm('/api/contact', {
        name: form.get('name'),
        email: form.get('email'),
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
        heading="Thanks, message sent."
        text="We'll get back to you soon."
        onClose={onClose}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent sx={{ pt: 0 }}>
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
          <TextField name="message" label="Message" multiline minRows={4} required fullWidth />
          <Honeypot />
          <PrivacyNote />
          {status.kind === 'error' && <Alert severity="error">{status.message}</Alert>}
        </Stack>
      </DialogContent>
      <FormActions onCancel={onClose} sending={status.kind === 'sending'} label="Send message" />
    </form>
  );
}

export default function ContactDialog(details: ContactDetails) {
  const { open, key, close } = useDialogTrigger('[data-contact]');
  return (
    <SiteDialog
      id="contact-dialog"
      open={open}
      onClose={close}
      title="Get in touch"
      subtitle="Message us here, or reach out directly."
    >
      <DialogContent sx={{ pt: 1, pb: 0 }}>
        <ContactLinks {...details} />
      </DialogContent>
      <ContactForm key={key} onClose={close} />
    </SiteDialog>
  );
}
