import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateProviders } from '../scripts/validate-providers.mjs';

const providers = JSON.parse(await readFile(new URL('../data/providers.json', import.meta.url)));
const schema = JSON.parse(await readFile(new URL('../data/providers-schema.json', import.meta.url)));
const evidence = JSON.parse(await readFile(new URL('../data/provider-evidence.json', import.meta.url)));
const metadata = JSON.parse(await readFile(new URL('../data/metadata.json', import.meta.url)));

test('provider catalog count, unique IDs and metadata', async () => {
  const validated = await validateProviders();
  assert.equal(validated.providers.length, providers.length);
  assert.equal(metadata.provider_count, providers.length);
  assert.equal(metadata.dataVersion, '0.47');
  assert.equal(new Set(providers.map(p => p.id)).size, providers.length);
  assert(providers.length >= 100, 'taxonomy expansion should keep a substantial operating catalog');
});

test('provider URLs, type and status enumerations', () => {
  const types = schema.items.properties.type.enum;
  const statuses = schema.items.properties.status.enum;
  const trust = schema.items.properties.trust_level.enum;
  assert.deepEqual(types, ['model-vendor', 'third-party', 'relay']);
  assert.deepEqual(trust, ['high', 'medium', 'low']);
  const counts = { 'model-vendor': 0, 'third-party': 0, relay: 0 };
  for (const provider of providers) {
    assert(types.includes(provider.type), provider.id);
    assert(trust.includes(provider.trust_level), provider.id);
    counts[provider.type]++;
    assert(statuses.includes(provider.status), provider.id);
    assert.equal(new URL(provider.website).protocol, 'https:');
    for (const url of provider.api_base_urls) assert.equal(new URL(url).protocol, 'https:');
    for (const url of provider.related_sites) assert.equal(new URL(url).protocol, 'https:');
    assert.equal(new URL(provider.discovery_source.url).protocol, 'https:');
  }
  assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), providers.length);
  assert(counts['model-vendor'] >= 20, 'model-vendor coverage');
  assert(counts['third-party'] >= 50, 'third-party is the expanded majority class');
  assert(counts.relay >= 40, 'relay coverage from legacy community-relay plus greylist');
  assert(!providers.some(p => ['official', 'aggregator', 'third-party-proxy', 'community-relay'].includes(p.type)));
});

test('seed policy: no discovery index, closed whatai, no open-source backends as entries', () => {
  assert(!providers.some(p => /hvoyai\.com/i.test(p.website) || p.related_sites.some(url => /hvoyai\.com/i.test(url))));
  const whatai = providers.find(p => p.id === 'whatai');
  assert.equal(whatai.status, 'closed');
  assert(!providers.some(p => /github\.com\/(?:songquanpeng\/one-api|calcium-ion\/new-api)/i.test(p.website)));
  assert(providers.some(p => p.backend.software === 'new-api/one-api'), 'backend fingerprint is an attribute');
});

test('related IDs resolve and evidence keys match', () => {
  const ids = new Set(providers.map(p => p.id));
  for (const provider of providers) {
    for (const id of provider.related_ids) assert(ids.has(id), `${provider.id} -> ${id}`);
    assert(evidence[provider.id], provider.id);
  }
  assert.deepEqual(Object.keys(evidence).sort(), [...ids].sort());
});
