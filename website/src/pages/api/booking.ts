import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';

// Booking enquiries from the Book Now dialog (src/components/BookingDialog.tsx),
// emailed to Malt Biscuit via Resend (https://resend.com/docs/api-reference).
//
// Environment (Worker vars, set through SST secrets in sst.config.ts; for local
// dev put them in website/.env):
//   RESEND_API_KEY  Resend API key
//   BOOKING_TO      Where enquiries are sent
//   BOOKING_FROM    Sender, on a domain verified in Resend. Optional: defaults
//                   to Resend's test sender, which only delivers to the
//                   Resend account's own email address.
export const prerender = false;

const MAX = { name: 120, email: 200, message: 5000 };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export const POST: APIRoute = async ({ request }) => {
  const apiKey = env.RESEND_API_KEY;
  const to = env.BOOKING_TO;
  const from = env.BOOKING_FROM || 'Malt Biscuit <onboarding@resend.dev>';
  if (!apiKey || !to) {
    console.error('Booking: RESEND_API_KEY or BOOKING_TO is not set');
    return json(
      { error: "Bookings can't be sent right now. Please message us on Instagram." },
      503,
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Honeypot: bots fill every field. Pretend it worked.
  if (text(body.website)) return json({ ok: true });

  const name = text(body.name);
  const email = text(body.email);
  const message = text(body.message);
  const date = text(body.date);
  const rig = body.rig === true;

  if (!name || !email || !message || !date) {
    return json({ error: 'Please fill in your name, email, event date and message.' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: 'Please pick a valid event date.' }, 400);
  }
  if (name.length > MAX.name || email.length > MAX.email || message.length > MAX.message) {
    return json({ error: 'One of the fields is too long.' }, 400);
  }

  const prettyDate = new Date(`${date}T00:00:00Z`).toLocaleDateString('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const rigLabel = rig ? 'Yes, bring the rig' : 'No, DJ only';

  const rows: [string, string][] = [
    ['Name', name],
    ['Email', email],
    ['Event date', prettyDate],
    ['Malt Biscuit rig', rigLabel],
  ];
  const html = `
    <h2>New booking enquiry</h2>
    <table cellpadding="6">${rows
      .map(([k, v]) => `<tr><th align="left">${k}</th><td>${escapeHtml(v)}</td></tr>`)
      .join('')}</table>
    <h3>Message</h3>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>`;
  const plain = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${message}`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Booking enquiry: ${name}, ${prettyDate}`,
      html,
      text: plain,
    }),
  });

  if (!response.ok) {
    console.error('Booking: Resend error', response.status, await response.text());
    return json({ error: "Your enquiry couldn't be sent. Please try again in a moment." }, 502);
  }
  return json({ ok: true });
};
