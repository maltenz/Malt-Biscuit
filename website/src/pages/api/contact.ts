import type { APIRoute } from 'astro';

import { checkContactFields, json, readBody, sendEnquiry, text } from '../../lib/enquiry';

// Messages from the Contact dialog (src/components/dialogs/ContactDialog.tsx).
// Email setup: src/lib/enquiry.ts.
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await readBody(request);
  if (body instanceof Response) return body;

  const name = text(body.name);
  const email = text(body.email);
  const message = text(body.message);

  if (!name || !email || !message) {
    return json({ error: 'Please fill in your name, email and message.' }, 400);
  }
  const problem = checkContactFields(name, email, message);
  if (problem) return json({ error: problem }, 400);

  return sendEnquiry({
    kind: 'Contact',
    heading: 'New message from the website',
    subject: `Message from ${name}`,
    replyTo: email,
    rows: [
      ['Name', name],
      ['Email', email],
    ],
    message,
  });
};
