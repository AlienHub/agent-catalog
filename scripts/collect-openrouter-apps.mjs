import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const sourceUrl = 'https://openrouter.ai/apps';

// Parse the public server payload as JSON; never evaluate page scripts.
export function extractMarketplace(html) {
  for (const match of html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g)) {
    const payload = JSON.parse(match[1]);
    if (typeof payload[1] !== 'string') continue;
    for (const line of payload[1].split('\n')) {
      const separator = line.indexOf(':');
      if (separator < 0 || line[separator + 1] !== '[') continue;
      let row;
      try { row = JSON.parse(line.slice(separator + 1)); } catch { continue; }
      const data = row?.[3]?.data;
      if (Array.isArray(data?.popular) && data?.globalRankingMap?.day) return data;
    }
  }
  throw new Error('OpenRouter marketplace payload changed or missing; no snapshot written');
}

export function normalizeMarketplace(data) {
  const apps = new Map();
  const collect = (entries, list) => {
    if (!Array.isArray(entries)) throw new Error(`Invalid list: ${list}`);
    entries.forEach((entry, index) => {
      const app = entry.app ?? entry.appAnalytics?.app;
      if (!Number.isSafeInteger(app?.id) || typeof app.title !== 'string') throw new Error(`Invalid app in ${list}`);
      const candidate = apps.get(app.id) ?? {
        openrouter_app_id: app.id,
        title: app.title,
        reported_url: app.main_url || app.origin_url || null,
        reported_repository_url: app.source_code_url || null,
        reported_categories: app.categories ?? [],
        source_url: app.slug ? `${sourceUrl}/${encodeURIComponent(app.slug)}` : `${sourceUrl}/url/${encodeURIComponent(app.origin_url || app.main_url || '')}`,
        observed_lists: [],
        review_status: 'candidate',
      };
      candidate.observed_lists.push({ list, position: index + 1 });
      apps.set(app.id, candidate);
    });
  };
  collect(data.popular, 'popular');
  collect(data.trending, 'trending');
  for (const [category, entries] of Object.entries(data.leaderboards ?? {})) collect(entries, `category:${category}`);
  for (const [period, entries] of Object.entries(data.globalRankingMap)) collect(entries, `global:${period}`);
  return [...apps.values()];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!outputPath) throw new Error('Usage: node scripts/collect-openrouter-apps.mjs <saved-html|--fetch> <output.json>');
  let html;
  if (inputPath === '--fetch') {
    const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`OpenRouter HTTP ${response.status}`);
    html = await response.text();
  } else html = await readFile(inputPath, 'utf8');
  const candidates = normalizeMarketplace(extractMarketplace(html));
  const snapshot = {
    source_url: sourceUrl,
    collected_at: new Date().toISOString(),
    source_html_sha256: createHash('sha256').update(html).digest('hex'),
    scope: 'Public server payload: popular, trending, category lists and day/week/month global lists; not all OpenRouter applications or all AI applications.',
    policy: 'Discovery candidates only. Reported names, categories and URLs are unverified. Never automatically import into the catalog or request candidate URLs. OpenRouter usage is opt-in and is not total market usage.',
    candidate_count: candidates.length,
    candidates,
  };
  await writeFile(outputPath, JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx' });
  console.log(`Saved ${candidates.length} discovery candidates to ${outputPath}`);
}
