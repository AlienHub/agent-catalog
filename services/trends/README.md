# Agent Atlas trends service

Self-hostable Cloudflare Workers + D1 module. **Not deployed, no Cloudflare resources or credentials created, no production observations included.** Suggested monorepo location: `services/trends`.

## Data contract and accuracy

- Allowlist `src/repos.json` derives from the catalog's 47 open-source variants and contains 35 repository names. Shared forms do not multiply popularity: GitHub numeric repository `id` is the primary key, including after rename/transfer. Names are aliases, not identity.
- Only public repositories are accepted. Stored data is aggregate counts, dates, release metadata and repository identity. No stargazer identity, commit author or raw GitHub response is stored.
- Daily snapshots contain **observed total** stars/forks, actual observation UTC date/time, latest default-branch commit time and GitHub's latest non-prerelease release metadata. A rerun preserves the first successful sample for `(repo_id, UTC date)`.
- 7/30-day growth is an exact endpoint difference of observed daily totals, not a sum of star events. If today's or the exact baseline day's snapshot is absent, the value is `null`. It can be negative. Chart gaps remain gaps; do not interpolate missing observations. First 7-day delta requires eight calendar dates; 30-day delta requires 31.
- Latest metrics are fetched on demand and cached in D1 for 300 seconds (configurable 60–900). They do **not** populate daily history, so traffic cannot distort snapshot cadence. The unified authenticated entry overrides HTTP responses to private/no-store.
- Commit activity comes from `/stats/commit_activity`, weekly aggregates covering the previous year. Its `days` start Sunday. Merge commits are excluded by GitHub. `202` is `pending`, not zero; the next request after `retry_after` re-requests the computation. Otherwise the next daily scheduled observation retries. `204`, unavailable/invalid stats and rate limits do not create zeroes. No tight polling or long-running invocation sleep.
- A transient GitHub error can serve an existing cache value with `stale:true` and its original `observed_at`; no snapshot is invented. A confirmed 404/private response is not served from stale cache. Each Cron repository failure leaves a gap and does not block later repositories.

### Endpoints

`GET /v1/repos/{owner}/{repo}/metrics` returns `Metrics` from `src/api.d.ts`: repo `{id,full_name,url}`, `stars`, `forks`, `last_commit_at`, `last_release`, `observed_at`, `stale`, `growth:{"7d":number|null,"30d":number|null}`, `status`, and `activity:{status,weeks,observed_at,retry_after}`.

`GET /v1/repos/{owner}/{repo}/history?days=30` returns `History`: same repo, ascending `points:[{date,stars,forks,observed_at}]`, `growth`, `source:"daily_snapshots"`, `missing_data`, `status`, `stale`. Window 1–366 days inclusive of today. Growth is computed independently of displayed window length.

`status`: `ready` when a current and 7-day baseline snapshot exist; `accumulating` otherwise; `unavailable` for stale upstream metrics. A missing 30-day delta remains null even when status is ready. `activity.status` is independent: `ready|pending|unavailable`.

Errors: 400 invalid repository/window; 404 unconfigured or unavailable repository; 405 unsupported method; 503 upstream/database error. JSON `{error,status?:"unavailable",retry_after?:number}`. Error retry_after is seconds; activity retry_after is an ISO timestamp. Only configured repository names can be queried. `GET /health` checks routing, not database readiness.

Frontend: `apiBaseUrl:null` means show “尚未连接采集服务”. Never ship fixtures as live data. Use null growth label “积累中”; use pending activity label “GitHub 正在生成统计”; show dates and stale state. The unified entry serves the API on the website origin and requires validated owner Access identity; CORS is not authentication.

## Local validation

Node 24 recommended (tests use built-in SQLite); no package installation or network needed for `npm test`.

```
npm test
```

The Node SQLite adapter tests actual migration/query semantics and mocked HTTP responses; it is not a Cloudflare production runtime test. Local Wrangler and live deployment must still be verified after account setup. Wrangler is pinned to npm-verified 4.147.0 with a generated package-lock.json. Review/pin action references to full SHAs before hardened production deployment.

## Daily UTC collection without assuming a paid plan

Cloudflare currently lists 5 Cron Triggers per Free account; this consumes one (check other account triggers). The example uses **one Cron expression**, `17-23 3 * * *`, dispatching seven deterministic partitions from 03:17 through 03:23 UTC. `SHARD_COUNT=7`, `SHARD_START_MINUTE=17`: each of the 35 configured repository names belongs to one partition of five and is sampled once per UTC day. Stable-ID uniqueness and daily SQL constraints prevent duplicate observations even if aliases overlap or Cron retries. Cron ranges and shard variables must be changed together. Do not reorder the allowlist during the seven-minute collection window. A missed partition leaves visible missing data until the next day; there is no fabricated backfill or claim of exactly-once delivery.

Each partition normally makes 25 external GitHub calls (5/repo) plus D1 writes; redirects may add external calls. Cloudflare documents Free as 50 external subrequests and up to 1,000 internal-service subrequests per invocation. D1 calls are internal subrequests. This keeps the present 35-repo seed within the external budget, with headroom; re-shard/review limits when adding repositories. All partitions total about 175 GitHub requests/day before interactive refreshes/retries. Anonymous GitHub quotas may be inadequate, particularly while collecting all partitions in seven minutes. A server-only GitHub token or wider time spacing is recommended. No paid upgrade is authorized or assumed; actual quotas, abuse, traffic and account plan still need review, so this is **not a guarantee of zero cost**.

The internal API restricts repository names and caches results, but does not provide a global distributed lock or abuse rate limiter. Multiple cold isolates can race to refresh the same repo. Before high-traffic exposure, configure platform rate limits and review account spending controls. Per-isolate coalescing avoids duplicates within a single isolate.

`collection_runs` records per-partition completion counts. Monitor failed counts/Cron failures and snapshot freshness. No secret/raw upstream body appears in logs. If running a paid plan already, a single `17 3 * * *` Cron with `SHARD_COUNT=1`, `SHARD_START_MINUTE=17` samples the entire allowlist; review current per-invocation limits first.

## Deployment

This module is deployed only through the unified private Worker described in [cloudflare/README.md](../../cloudflare/README.md). No standalone deployment is enabled.

## Optional GitHub star-history extension (not enabled)

GitHub introduced `/repos/{owner}/{repo}/stargazers/history` in September 2026. Official documentation describes reverse-chronological calendar-week buckets of stars created, with seven daily counts, pagination up to 30 weeks/page and 100 pages; day/week boundaries are not guaranteed UTC. It is privacy-safe aggregate history, not identities. These event buckets must not be labeled as observed net-star totals or used to backfill this module's daily snapshots. A future separate panel may display “新增 Star 事件（GitHub 周统计）” with its own source and boundary note. This version deliberately neither fetches the endpoint nor reconstructs net history from current stargazers.

## Official references (checked 2026-10-04)

- [GitHub starring / count / history](https://docs.github.com/en/rest/activity/starring?apiVersion=2026-03-10)
- [GitHub history announcement](https://github.blog/changelog/2026-09-04-new-api-endpoint-provides-privacy-safe-star-history-data/)
- [GitHub repository statistics and 202 caching](https://docs.github.com/en/rest/metrics/statistics)
- [Cloudflare Cron UTC](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Cloudflare D1 batching API](https://developers.cloudflare.com/d1/worker-api/d1-database/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers role model](https://developers.cloudflare.com/workers/authorization/workers/)
- [Official GitHub Actions deployment](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)

