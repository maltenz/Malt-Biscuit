import type { APIRoute } from 'astro';

import { checkContactFields, json, readBody, sendEnquiry, text } from '../../lib/enquiry';

// Booking enquiries from the Book Now dialog
// (src/components/dialogs/BookingDialog.tsx). Email setup: src/lib/enquiry.ts.
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await readBody(request);
  if (body instanceof Response) return body;

  const name = text(body.name);
  const email = text(body.email);
  const message = text(body.message);
  const date = text(body.date);
  const rig = body.rig === true;

  if (!name || !email || !message || !date) {
    return json({ error: 'Please fill in your name, email, event date and message.' }, 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: 'Please pick a valid event date.' }, 400);
  }
  const problem = checkContactFields(name, email, message);
  if (problem) return json({ error: problem }, 400);

  const prettyDate = new Date(`${date}T00:00:00Z`).toLocaleDateString('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return sendEnquiry({
    kind: 'Booking',
    heading: 'New booking enquiry',
    subject: `Booking enquiry: ${name}, ${prettyDate}`,
    replyTo: email,
    rows: [
      ['Name', name],
      ['Email', email],
      ['Event date', prettyDate],
      ['Malt Biscuit rig', rig ? 'Yes, bring the rig' : 'No, DJ only'],
    ],
    message,
  });
};
