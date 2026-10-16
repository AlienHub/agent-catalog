# Agent Atlas unified Worker deployment

## Public production deployment

The current user-approved mode is public: the website, downloads and `/v1/repos/*` API allow anonymous access on `https://agent-atlas.pindo.page`. One Worker serves built assets from `cloudflare-dist/`, the API and scheduled collection, with D1 bound as `DB`. Never deploy the `website/` source directory.

Generate the ignored local configuration with `PUBLIC_ACCESS=true`, the verified `D1_DATABASE_ID` and `CLOUDFLARE_ACCOUNT_ID`, then run `node cloudflare/configure.mjs`. Public mode omits Access identity settings and explicitly sets `PUBLIC_ACCESS=true`; omission of this flag preserves the private fail-closed behavior. The hostname must also be removed from any Cloudflare Access application before anonymous visitors can use it.

Use Node 24 and install dependencies with `npm ci`, `npm --prefix website ci`, `npm --prefix services/trends ci`. Build with `npm run build:cloudflare`. Apply D1 migrations and deploy using `services/trends/node_modules/.bin/wrangler` with `--config cloudflare/wrangler.jsonc`. `workers_dev` and preview URLs remain disabled.

Use `npm run deploy:cloudflare` for subsequent deployments. This rebuilds the canonical catalog and compiled React client before uploading, uses the explicit unified Worker configuration, and disables automatic configuration. Do not pass `website/` as a positional argument to Wrangler: it uploads source files as a static-only site, leaving JSX imports, unresolved template placeholders and missing JSON downloads while removing the API/D1 bindings. After deployment, verify `/metadata.json`, `/dataset.json`, `/app.js`, `/health` and the versioned ZIP on the production hostname.

## Cloudflare Workers Builds

Use these commands in the Worker's Settings > Builds configuration, with `/` as the root directory and `main` as the production branch:

- Build command: `npm ci --prefix website && npm ci --prefix services/trends && npm run build:cloudflare:ci`
- Production deploy command: `npm run deploy:cloudflare`
- Non-production command: `npm run preview:cloudflare`

The build command generates the ignored `cloudflare/wrangler.jsonc` from build-time variables and builds the complete website with its canonical downloads. The root `npm run build` only builds the SDK and is insufficient for the hosted website. Both upload commands use the repository's locked Wrangler version and explicit unified Worker configuration. The non-production command uploads a Worker version without promoting it to production; it does not enable public preview URLs or create branch-isolated resources. Do not use the default `npx wrangler preview`: this project has no `previews` block and does not use the separate Worker Previews model.

Set `PUBLIC_ACCESS=true`, the existing `D1_DATABASE_ID`, `CLOUDFLARE_ACCOUNT_ID`, and `ATLAS_ORIGIN=https://agent-atlas.pindo.page` as build-time variables for both production and non-production builds. They can be saved as build variables or prefixed to the final `npm run build:cloudflare:ci` command. Keep `COLLECTION_ENABLED=false` unless collection has been explicitly enabled. These are configuration values; authentication tokens remain in Cloudflare's selected build token and Worker Secrets. Missing access mode or database identity fails configuration generation before upload.

After changing these settings, retry a non-production build to verify the command and then a build of the current `main` commit. A saved settings form or successful local build does not confirm a successful cloud upload.

Keep collection disabled until the public website and API are verified. Configure `GITHUB_TOKEN` through the Worker Secret UI or the hidden `wrangler secret put GITHUB_TOKEN --config cloudflare/wrangler.jsonc` prompt. Never put credential values in code, command arguments or logs. After verification, regenerate with `COLLECTION_ENABLED=true` and deploy; the daily seven-shard Cron is `17-23 3 * * *` (11:17–11:23 Asia/Shanghai). This generates genuine samples only, without fabricating historical data.

The following private-mode reference is retained for optional private deployments; it is not the current production access requirement.

## Private-mode reference

Selected hostname: `agent-atlas.pindo.page` (`https://agent-atlas.pindo.page`).

One Worker serves the website, `/v1/repos/*` API, scheduled collection and the D1 binding. The original Site remains unchanged.

## Privacy boundary

- `run_worker_first: true` ensures every static asset, download and API request reaches the authorization gate. Never turn this off.
- `workers_dev: false` and `preview_urls: false`; deploy only on the intended custom hostname behind Cloudflare Access.
- Require the Access application issuer and exact audience and one owner email. Verify the RS256 signature against the configured team's HTTPS cert endpoint, issuer, audience, expiration, issued-at, optional not-before, subject and owner identity. Plain email headers, CORS and decoded-only JWTs are never authorization.
- Blank settings fail closed with HTTP 403, without touching assets or D1. Missing/forged/expired tokens fail closed. Responses are private/no-store, including downloads and errors. Cert fetch failure also denies access.
- Cloudflare Access must have an owner-only allow policy for the complete custom hostname and all paths, without a bypass policy. Verify anonymous requests to HTML, JS, ZIP, JSON and API are blocked before handing out the new URL.
- Collection is disabled unless explicitly enabled and privacy configuration is complete. No historical samples are fabricated.

## Operator handoff

For an optional private deployment, confirm the owner login identity and establish an owner-only Access application. Credentials belong in the official secure account flow, never source code or a chat message.

For private mode, run the local config generator with `ACCESS_ISSUER`, `ACCESS_AUD`, `ACCESS_OWNER_EMAIL`, `D1_DATABASE_ID`; `ATLAS_ORIGIN` defaults to the approved `https://agent-atlas.pindo.page` and may be set explicitly; add `COLLECTION_ENABLED=true` only when daily collection is approved. The generated `cloudflare/wrangler.jsonc` is ignored.

Build using Node 24: `npm ci`, `npm --prefix website ci`, `npm --prefix services/trends ci`, then `npm run verify:all`. This produces `cloudflare-dist/` with same-origin API config and leaves `website-dist/` on its original disconnected config. Run `node cloudflare/configure.mjs` after setting the verified non-secret deployment values. From the repository root, the locked Wrangler binary in `services/trends/node_modules/.bin/wrangler` accepts `--config cloudflare/wrangler.jsonc` for both `d1 migrations apply agent-atlas-trends --remote` and `deploy`. These commands are operator-only, require separate authorization, and were not executed for this handoff.

The unified ZIP contains source, lockfiles and prebuilt website assets; no credentials or node_modules. The legacy standalone service deployment template is retired. The SDK package does not acquire Cloudflare runtime dependencies.

## Verification limits

Tests use Web Crypto real RSA signatures, mocked Access keys/asset bindings, Node SQLite migrations and HTTP mocks. They are not a Cloudflare account deployment, Access policy end-to-end check or real-browser visual test.

Official references:
- https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
