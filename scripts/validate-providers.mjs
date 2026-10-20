import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z][a-z0-9-]*$/;
const TYPES = ['official', 'aggregator', 'third-party-proxy', 'community-relay'];
const STATUSES = ['active', 'unstable', 'dead', 'closed'];
const COMPAT = ['openai', 'anthropic', 'gemini'];
const BLOCKED_PROJECTS = [
  'github.com/songquanpeng/one-api',
  'github.com/calcium-ion/new-api',
  'github.com/new-api',
  'github.com/one-api',
];

function httpsUrl(value, label) {
  assert.equal(typeof value, 'string', label);
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', label);
  assert(!url.username && !url.password, label);
  return url;
}

function uniqueStrings(values, label) {
  assert(Array.isArray(values) && values.every(v => typeof v === 'string' && v.length), label);
  assert.equal(new Set(values).size, values.length, label);
}

export async function validateProviders() {
  const root = new URL('../data/', import.meta.url);
  const providers = JSON.parse(await readFile(new URL('providers.json', root), 'utf8'));
  const schema = JSON.parse(await readFile(new URL('providers-schema.json', root), 'utf8'));
  const evidence = JSON.parse(await readFile(new URL('provider-evidence.json', root), 'utf8'));
  const metadata = JSON.parse(await readFile(new URL('metadata.json', root), 'utf8'));
  const required = schema.items.required;
  assert(Array.isArray(providers) && providers.length > 0, 'providers.json must be a nonempty array');
  assert.equal(metadata.provider_count, providers.length, 'metadata.provider_count must match providers.json');

  const ids = new Set();
  const websites = new Set();
  for (const provider of providers) {
    assert.deepEqual(Object.keys(provider).sort(), [...required].sort(), `Provider fields: ${provider.id}`);
    assert(ID.test(provider.id), `Invalid provider ID: ${provider.id}`);
    assert(!ids.has(provider.id), `Duplicate provider ID: ${provider.id}`);
    ids.add(provider.id);
    assert(typeof provider.name === 'string' && provider.name.trim(), `Name: ${provider.id}`);
    assert(typeof provider.operator === 'string' && provider.operator.trim(), `Operator: ${provider.id}`);
    uniqueStrings(provider.aliases, `Aliases: ${provider.id}`);
    assert(TYPES.includes(provider.type), `Type: ${provider.id}`);
    httpsUrl(provider.website, `Website: ${provider.id}`);
    websites.add(new URL(provider.website).hostname.replace(/^www\./, ''));
    uniqueStrings(provider.api_base_urls, `API URLs: ${provider.id}`);
    for (const url of provider.api_base_urls) httpsUrl(url, `API URL: ${provider.id}`);
    assert(provider.api_compat.every(value => COMPAT.includes(value)), `Compat: ${provider.id}`);
    assert.equal(new Set(provider.api_compat).size, provider.api_compat.length, `Compat dup: ${provider.id}`);
    uniqueStrings(provider.models, `Models: ${provider.id}`);
    assert.deepEqual(Object.keys(provider.pricing).sort(), ['ratio_note', 'unit']);
    assert.equal(typeof provider.pricing.unit, 'string');
    assert.equal(typeof provider.pricing.ratio_note, 'string');
    uniqueStrings(provider.payment_methods, `Payment: ${provider.id}`);
    assert.deepEqual(Object.keys(provider.backend).sort(), ['detected_by', 'software', 'version']);
    for (const key of ['software', 'version', 'detected_by']) assert.equal(typeof provider.backend[key], 'string');
    assert(typeof provider.region === 'string' && provider.region.trim(), `Region: ${provider.id}`);
    assert(STATUSES.includes(provider.status), `Status: ${provider.id}`);
    assert(DATE.test(provider.first_seen) && Number.isFinite(Date.parse(provider.first_seen)), `first_seen: ${provider.id}`);
    assert(DATE.test(provider.last_checked) && Number.isFinite(Date.parse(provider.last_checked)), `last_checked: ${provider.id}`);
    assert.deepEqual(Object.keys(provider.discovery_source).sort(), ['channel', 'url']);
    assert(provider.discovery_source.channel.trim(), `Discovery channel: ${provider.id}`);
    httpsUrl(provider.discovery_source.url, `Discovery URL: ${provider.id}`);
    uniqueStrings(provider.related_ids, `related_ids: ${provider.id}`);
    assert(!provider.related_ids.includes(provider.id), `Self related_id: ${provider.id}`);
    uniqueStrings(provider.related_sites, `related_sites: ${provider.id}`);
    for (const url of provider.related_sites) httpsUrl(url, `related_site: ${provider.id}`);
    assert.equal(typeof provider.icon, 'string');
    if (provider.icon) assert(/^icons\/[a-z0-9-]+\.(?:svg|png)$/.test(provider.icon), `Icon: ${provider.id}`);
    assert(typeof provider.risk_notes === 'string' && provider.risk_notes.trim(), `risk_notes: ${provider.id}`);
    assert(provider.evidence.length > 0, `Evidence: ${provider.id}`);
    for (const item of provider.evidence) {
      assert.deepEqual(Object.keys(item).sort(), ['api_status', 'checked_at', 'http', 'title', 'url']);
      httpsUrl(item.url, `Evidence URL: ${provider.id}`);
      assert(item.title.trim(), `Evidence title: ${provider.id}`);
      assert(DATE.test(item.checked_at), `Evidence date: ${provider.id}`);
      assert(Number.isInteger(item.http) && item.http >= 0 && item.http <= 599, `Evidence HTTP: ${provider.id}`);
      assert.equal(typeof item.api_status, 'string');
    }
    const host = new URL(provider.website).hostname.toLowerCase();
    assert(!BLOCKED_PROJECTS.some(project => host.includes('github.com') && provider.website.includes(project)), `Open-source project catalogued as provider: ${provider.id}`);
    assert(!/hvoyai\.com$/i.test(host), `Discovery index catalogued as provider: ${provider.id}`);
    assert(Object.hasOwn(evidence, provider.id), `Missing provider evidence: ${provider.id}`);
  }

  for (const provider of providers) {
    for (const id of provider.related_ids) assert(ids.has(id), `Unknown related_id ${id} on ${provider.id}`);
  }

  assert.deepEqual(Object.keys(evidence).sort(), [...ids].sort(), 'provider-evidence IDs must exactly match providers');
  for (const [id, entry] of Object.entries(evidence)) {
    assert.deepEqual(Object.keys(entry).sort(), ['checked_at', 'notes', 'probes', 'sources'], `Evidence fields: ${id}`);
    assert(typeof entry.notes === 'string' && entry.notes.trim(), `Evidence notes: ${id}`);
    assert(DATE.test(entry.checked_at), `Evidence checked_at: ${id}`);
    assert(Array.isArray(entry.sources) && entry.sources.length, `Evidence sources: ${id}`);
    for (const source of entry.sources) {
      assert.deepEqual(Object.keys(source).sort(), ['title', 'url']);
      httpsUrl(source.url, `Evidence source: ${id}`);
      assert(source.title.trim(), `Evidence source title: ${id}`);
    }
    assert(Array.isArray(entry.probes) && entry.probes.length, `Evidence probes: ${id}`);
    for (const probe of entry.probes) {
      assert.deepEqual(Object.keys(probe).sort(), ['api_status', 'checked_at', 'error', 'final_url', 'http', 'models_http', 'title', 'url']);
      httpsUrl(probe.url, `Probe URL: ${id}`);
      assert(typeof probe.title === 'string' && probe.title.trim(), `Probe title: ${id}`);
      assert(DATE.test(probe.checked_at), `Probe date: ${id}`);
      assert(Number.isInteger(probe.http) && probe.http >= 0 && probe.http <= 599, `Probe HTTP: ${id}`);
      assert.equal(typeof probe.api_status, 'string');
      assert(probe.models_http === null || (Number.isInteger(probe.models_http) && probe.models_http >= 0 && probe.models_http <= 599), `Probe models: ${id}`);
      assert.equal(typeof probe.error, 'string');
      assert.equal(typeof probe.final_url, 'string');
    }
  }
  return { providers, evidence };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { providers } = await validateProviders();
  console.log(`Validated ${providers.length} providers`);
}
