# maltbiscuit

A starter template: Astro 7 + React 19 islands, MUI 9 (Emotion + `tss-react`), TinaCMS,
deployed to Cloudflare Workers with SST 4. Bun workspaces, Biome for lint/format.

```
.
├── .github/workflows/ci.yml   # Biome + astro check, then deploy main to Cloudflare
├── sst.config.ts              # Cloudflare Worker (SST)
└── website/                   # Astro app (workspace)
    ├── content/               # Tina-managed content (markdown/json)
    ├── public/                # static assets; Tina builds /admin here
    ├── src/
    │   ├── components/        # React islands (MuiProvider, Welcome demo)
    │   ├── helpers/           # shared types/utilities
    │   ├── layouts/           # Astro layouts
    │   ├── lib/               # content loaders
    │   ├── pages/             # routes (index, /admin redirect)
    │   └── theme/             # MUI theme + tss-react entry point
    └── tina/config.ts         # Tina schema
```

## Start

```sh
nvm use          # Node 24 (Astro 7 needs >= 22.23.4)
bun install
cp .env.example .env && cp website/.env.example website/.env   # fill in values
bun run site:tina   # Astro dev + Tina, http://localhost:3000 and /admin/index.html
```

`bun run site:dev` runs Astro alone (no CMS).

## Scripts

| Root                 | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `bun run site:tina`  | Astro dev server with local Tina GraphQL + admin     |
| `bun run site:build` | `tinacms build` → `astro check` → `astro build`      |
| `bun run deploy`     | Build, then `sst deploy` (personal stage)            |
| `bun run lint`       | Biome check                                          |

`tinacms build` needs `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` (TinaCloud). Without them,
build the admin against local content with
`bunx tinacms build --local --skip-indexing --skip-cloud-checks` from `website/`.

## Deploy

Push to `main`: CI runs Biome + `astro check`, then deploys the `production` stage. TinaCloud
saves (commit message `TinaCMS content update…`) take a fast path that skips the checks.

Repository secrets needed: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_DEFAULT_ACCOUNT_ID`,
`NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`. Set a custom domain in `sst.config.ts`.

## Notes on versions

- **TypeScript is pinned to 6.x.** `astro check` / `@astrojs/check` does not support TypeScript 7 yet.
- **`overrides` pins `@emnapi/*` to 1.x.** Otherwise Bun hoists a 2.0 beta (pulled in by
  rolldown's WASM binding) that breaks `@astrojs/check`'s compiler at load.
- **Cloudflare adapter v14** emits `dist/server/entry.mjs` + `dist/client/` (not
  `dist/_worker.js`). Sessions are off and images compile at build time so the Worker needs no
  KV/Images bindings; see `website/astro.config.mjs` to change that.
- **MUI 9** removed system shorthand props (`fontWeight`, `alignItems`, …) on components; use `sx`.
