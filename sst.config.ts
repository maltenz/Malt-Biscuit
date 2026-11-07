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
    // Astro's Cloudflare adapter (v14+) emits the Worker to dist/server and
    // static assets to dist/client during `bun run site:build`.
    // Set `domain` for the "production" stage (the one CI deploys) once you
    // have one; other stages get a plain *.workers.dev URL.
    new sst.cloudflare.Worker("Maltbiscuit", {
      handler: "website/dist/server/entry.mjs",
      url: true,
      // domain: $app.stage === "production" ? "example.com" : undefined,
      assets: {
        directory: "website/dist/client",
      },
    });
  },
});
