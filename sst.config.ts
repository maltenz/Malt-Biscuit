/// <reference path="./sst-env.d.ts" />

export default $config({
  app(input) {
    return {
      name: "maltbiscuit",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "cloudflare",
    };
  },
  async run() {
    // Booking form email (website/src/pages/api/booking.ts). Set per stage:
    //   bunx sst secret set ResendApiKey re_xxx --stage production
    //   bunx sst secret set BookingTo you@example.com --stage production
    //   bunx sst secret set BookingFrom "Malt Biscuit <bookings@your-domain>" --stage production
    const resendApiKey = new sst.Secret("ResendApiKey");
    const bookingTo = new sst.Secret("BookingTo");
    const bookingFrom = new sst.Secret("BookingFrom", "Malt Biscuit <onboarding@resend.dev>");

    // Astro's Cloudflare adapter (v14+) emits the Worker to dist/server and
    // static assets to dist/client during `bun run site:build`.
    new sst.cloudflare.Worker("Maltbiscuit", {
      handler: "website/dist/server/entry.mjs",
      url: true,
      environment: {
        RESEND_API_KEY: resendApiKey.value,
        BOOKING_TO: bookingTo.value,
        BOOKING_FROM: bookingFrom.value,
      },
      // Production serves maltbiscuit.com (zone on the same Cloudflare
      // account); other stages get a plain *.workers.dev URL.
      domain: $app.stage === "production" ? "maltbiscuit.com" : undefined,
      assets: {
        directory: "website/dist/client",
      },
    });
  },
});
