import { env } from 'cloudflare:workers';

// Shared server code for the site's forms (src/pages/api/*): reading and
// checking the JSON body, and emailing the result to Malt Biscuit via Resend
// (https://resend.com/docs/api-reference).
//
// Environment (Worker vars, set through SST secrets in sst.config.ts; for local
// dev put them in website/.env):
//   RESEND_API_KEY  Resend API key
//   BOOKING_TO      Where enquiries are sent
//   BOOKING_FROM    Sender, on a domain verified in Resend. Optional: defaults
//                   to Resend's test sender, which only delivers to the
//                   Resend account's own email address.

export const MAX = { name: 120, email: 200, message: 5000 };

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Parse the request body. Returns a Response to send back straight away when
 * the body is invalid or came from a bot (honeypot filled: pretend success).
 */
export async function readBody(request: Request): Promise<Record<string, unknown> | Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  if (text(body.website)) return json({ ok: true });
  return body;
}

/** Common checks for name, email and message. Returns an error message or null. */
export function checkContactFields(name: string, email: string, message: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
  if (name.length > MAX.name || email.length > MAX.email || message.length > MAX.message) {
    return 'One of the fields is too long.';
  }
  return null;
}

/**
 * Email an enquiry to Malt Biscuit: a table of fields plus the message, with
 * reply-to set to the sender so replying goes straight back to them.
 */
export async function sendEnquiry(opts: {
  kind: string;
  heading: string;
  subject: string;
  replyTo: string;
  rows: [string, string][];
  message: string;
}): Promise<Response> {
  const apiKey = env.RESEND_API_KEY;
  const to = env.BOOKING_TO;
  const from = env.BOOKING_FROM || 'Malt Biscuit <onboarding@resend.dev>';
  if (!apiKey || !to) {
    console.error(`${opts.kind}: RESEND_API_KEY or BOOKING_TO is not set`);
    return json(
      { error: "Messages can't be sent right now. Please message us on Instagram." },
      503,
    );
  }

  const html = `
    <h2>${escapeHtml(opts.heading)}</h2>
    <table cellpadding="6">${opts.rows
      .map(([k, v]) => `<tr><th align="left">${k}</th><td>${escapeHtml(v)}</td></tr>`)
      .join('')}</table>
    <h3>Message</h3>
    <p style="white-space:pre-wrap">${escapeHtml(opts.message)}</p>`;
  const plain = `${opts.rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${opts.message}`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: opts.replyTo,
      subject: opts.subject,
      html,
      text: plain,
    }),
  });

  if (!response.ok) {
    console.error(`${opts.kind}: Resend error`, response.status, await response.text());
    return json({ error: "Your message couldn't be sent. Please try again in a moment." }, 502);
  }
  return json({ ok: true });
}
