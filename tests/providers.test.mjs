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
  assert.equal(metadata.dataVersion, '0.36');
  assert.equal(new Set(providers.map(p => p.id)).size, providers.length);
  assert(providers.length >= 50, 'seed should include reachable sample stations');
});

test('provider URLs, type and status enumerations', () => {
  const types = schema.items.properties.type.enum;
  const statuses = schema.items.properties.status.enum;
  for (const provider of providers) {
    assert(types.includes(provider.type), provider.id);
    assert(statuses.includes(provider.status), provider.id);
    assert.equal(new URL(provider.website).protocol, 'https:');
    for (const url of provider.api_base_urls) assert.equal(new URL(url).protocol, 'https:');
    for (const url of provider.related_sites) assert.equal(new URL(url).protocol, 'https:');
    assert.equal(new URL(provider.discovery_source.url).protocol, 'https:');
  }
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
