// Worker bindings, read in server routes via `import { env } from 'cloudflare:workers'`.
// Set through SST secrets (sst.config.ts); locally in website/.env.
declare module 'cloudflare:workers' {
  export const env: {
    RESEND_API_KEY?: string;
    BOOKING_TO?: string;
    BOOKING_FROM?: string;
  };
}
