# Agent Atlas unified private deployment

Selected hostname: `agent-atlas.pindo.page` (`https://agent-atlas.pindo.page`). This is the user-approved target only; no DNS, domain binding or deployment has been performed.

One Worker serves the website, `/v1/repos/*` API, scheduled collection and the existing D1 binding. The original private Site remains unchanged. This package has not been deployed to Cloudflare, and no D1, Access application, DNS record or Cron has been created.

## Privacy boundary

- `run_worker_first: true` ensures every static asset, download and API request reaches the authorization gate. Never turn this off.
- `workers_dev: false` and `preview_urls: false`; deploy only on the intended custom hostname behind Cloudflare Access.
- Require the Access application issuer and exact audience and one owner email. Verify the RS256 signature against the configured team's HTTPS cert endpoint, issuer, audience, expiration, issued-at, optional not-before, subject and owner identity. Plain email headers, CORS and decoded-only JWTs are never authorization.
- Blank settings fail closed with HTTP 403, without touching assets or D1. Missing/forged/expired tokens fail closed. Responses are private/no-store, including downloads and errors. Cert fetch failure also denies access.
- Cloudflare Access must have an owner-only allow policy for the complete custom hostname and all paths, without a bypass policy. Verify anonymous requests to HTML, JS, ZIP, JSON and API are blocked before handing out the new URL.
- Collection is disabled unless explicitly enabled and privacy configuration is complete. No historical samples are fabricated.

## Operator handoff

The assistant can finish setup once the Cloudflare account is connected and resource/security changes are approved. The hostname is confirmed; the owner login identity still needs confirmation. Credentials belong in the official secure account flow, never source code or a chat message.

After authorized account setup: establish the owner-only Access app and D1, then run the local config generator with `ACCESS_ISSUER`, `ACCESS_AUD`, `ACCESS_OWNER_EMAIL`, `D1_DATABASE_ID`; `ATLAS_ORIGIN` defaults to the approved `https://agent-atlas.pindo.page` and may be set explicitly; add `COLLECTION_ENABLED=true` only when daily collection is approved. The generated `cloudflare/wrangler.jsonc` is ignored. It is intentionally not included with a default public URL.

Build using Node 24: `npm ci`, `npm --prefix website ci`, `npm --prefix services/trends ci`, then `npm run verify:all`. This produces `cloudflare-dist/` with same-origin API config and leaves `website-dist/` on its original disconnected config. Run `node cloudflare/configure.mjs` after setting the verified non-secret deployment values. From the repository root, the locked Wrangler binary in `services/trends/node_modules/.bin/wrangler` accepts `--config cloudflare/wrangler.jsonc` for both `d1 migrations apply agent-atlas-trends --remote` and `deploy`. These commands are operator-only, require separate authorization, and were not executed for this handoff.

The unified ZIP contains source, lockfiles and prebuilt website assets; no credentials or node_modules. The legacy standalone service deployment template is retired. The SDK package does not acquire Cloudflare runtime dependencies.

## Verification limits

Tests use Web Crypto real RSA signatures, mocked Access keys/asset bindings, Node SQLite migrations and HTTP mocks. They are not a Cloudflare account deployment, Access policy end-to-end check or real-browser visual test.

Official references:
- https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
