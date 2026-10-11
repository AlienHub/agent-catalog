import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as catalog from '../dist/esm/index.js';
import * as icons from '../dist/esm/icons.js';
const require = createRequire(import.meta.url);
const raw = JSON.parse(await readFile(new URL('../data/dataset.json', import.meta.url)));

test('canonical snapshot preserved, including all record fields and IDs', () => {
  assert.deepEqual(catalog.apps, raw);
  assert.equal(catalog.catalogMeta.recordCount, 297);
  assert.equal(catalog.catalogMeta.productCount, 185);
  assert.equal(catalog.catalogMeta.dataVersion, '0.10');
  for (const id of ['qwenwork-desktop-cn', 'qwenwork-web-cn', 'doubao-desktop']) assert(catalog.getApp(id));
  assert.equal(catalog.getApp('not-an-app'), undefined);
});
test('ESM and CommonJS core exports agree', () => {
  const cjs = require('../dist/cjs/index.js');
  assert.deepEqual(cjs.apps, catalog.apps);
  assert.deepEqual(cjs.catalogMeta, catalog.catalogMeta);
  assert.deepEqual(cjs.searchApps('openai CLI'), catalog.searchApps('openai CLI'));
});
test('Sentra additions preserve product families, renamed aliases and license boundaries', async () => {
  assert.equal(catalog.getApp('qoder-wake-cn-cli').product_id, catalog.getApp('qoder-cn-cli').product_id);
  assert.equal(catalog.getApp('trae-cn-vscode').product_id, catalog.getApp('trae-cn').product_id);
  assert.deepEqual(catalog.getApp('trae-cn-vscode').interfaces, ['IDE 插件']);
  assert(catalog.searchApps('Mux').some(app => app.id === 'xum-desktop'));
  assert.notEqual(catalog.getApp('aider-desk-desktop').product_id, catalog.getApp('aider').product_id);
  assert.notEqual(catalog.getApp('reasonix-cli').vendor_id, 'deepseek');
  const source = JSON.parse(await readFile(new URL('../data/open-source.json', import.meta.url)));
  assert.equal(source['crush-cli'].source_model, 'source-available');
  assert.equal(source['crush-cli'].license, 'FSL-1.1-MIT');
  assert.equal(source['roo-code-vscode'].maintenance.status, 'archived');
  assert.match(catalog.getEvidence('iflow-cli').notes, /2026-04-17/);
});
test('shared data and result arrays are deeply frozen', () => {
  assert(Object.isFrozen(catalog.apps));
  assert(Object.isFrozen(catalog.apps[0]));
  assert(Object.isFrozen(catalog.apps[0].interfaces));
  assert(Object.isFrozen(catalog.evidence.chatgpt.sources[0]));
  assert(Object.isFrozen(catalog.collections.chinese_agents));
  assert(Object.isFrozen(catalog.schema.items.properties));
  assert(Object.isFrozen(catalog.catalogMeta));
  assert.throws(() => { catalog.apps[0].name = 'mutated'; }, TypeError);
  assert.throws(() => catalog.apps[0].interfaces.push('bad'), TypeError);
  assert.throws(() => catalog.findApps().push(catalog.apps[0]), TypeError);
  assert.throws(() => { catalog.evidence.chatgpt.notes = 'bad'; }, TypeError);
});
test('filters AND across fields, OR within arrays, and handle empty arrays', () => {
  const expected = raw.filter(app => app.vendor_id === 'openai' && app.interfaces.includes('CLI'));
  assert.deepEqual(catalog.findApps({ vendorId: 'openai', interface: 'CLI' }), expected);
  assert.deepEqual(catalog.findApps({ productId: ['codex','chatgpt'] }), raw.filter(app => ['codex','chatgpt'].includes(app.product_id)));
  assert.equal(catalog.findApps({ productId: [] }).length, 0);
  assert.deepEqual(catalog.findApps({ edition: '中国版', hasSvg: false }), raw.filter(app => app.edition === '中国版' && !app.icon));
  const app = raw[0];
  assert(catalog.findApps({ type: app.type, platform: app.platforms[0] }).some(item => item.id === app.id));
});
test('product and vendor helpers use stable IDs', () => {
  for (const app of raw) {
    assert(catalog.getAppsByProduct(app.product_id).every(item => item.product_id === app.product_id));
    assert(catalog.getAppsByVendor(app.vendor_id).every(item => item.vendor_id === app.vendor_id));
  }
  assert.deepEqual(catalog.getAppsByVendor('does-not-exist'), []);
});
test('search supports case, aliases, Unicode normalization, Chinese and combined filters', () => {
  assert.deepEqual(catalog.searchApps('ＣＯＤＥＸ'), catalog.searchApps('codex'));
  assert.deepEqual(catalog.searchApps('  '), catalog.apps);
  assert(catalog.searchApps('OpenAI CLI').length > 0);
  assert(catalog.searchApps('OpenAI CLI').every(app => app.vendor_id === 'openai' && app.interfaces.includes('CLI')));
  assert(catalog.searchApps('千问').length > 0);
  const app = raw.find(item => item.aliases.length);
  assert(catalog.searchApps(app.aliases[0]).some(item => item.id === app.id));
  assert(catalog.searchApps('codex', { interface: 'CLI' }).every(app => app.interfaces.includes('CLI')));
  assert.deepEqual(catalog.searchApps('never-matching-unicorn-128392'), []);
});
test('collections and evidence preserve exact provenance and unknown-key behavior', () => {
  assert.equal(catalog.getCollection('chinese_agents').length, 61);
  assert.deepEqual(catalog.getCollection('not-a-collection'), []);
  assert.deepEqual(catalog.findApps({ collection: '__proto__' }), []);
  assert.equal(catalog.getEvidence('__proto__'), undefined);
  assert.equal(catalog.getEvidence('constructor'), undefined);
  for (const app of raw) assert(catalog.getEvidence(app.id).sources.length);
});
test('all SVG lookups are bundled and portable, with explicit absence', async () => {
  for (const app of raw) {
    const icon = icons.getAppIcon(app.id);
    if (!app.icon) { assert.equal(icon, undefined); continue; }
    assert(Object.isFrozen(icon));
    assert.equal(icon.path, app.icon);
    assert.equal(icon.svg, await readFile(new URL(`../assets/${app.icon}`, import.meta.url), 'utf8'));
    assert.equal(decodeURIComponent(icon.dataUri.split(',').slice(1).join(',')), icon.svg);
    assert(icon.dataUri.startsWith('data:image/svg+xml;charset=utf-8,'));
  }
  assert.equal(icons.getAppIcon('unknown'), undefined);
  assert.equal(icons.getIconSvg('__proto__'), undefined);
  assert.equal(icons.getIconSvg('icons/missing.svg'), undefined);
  assert(Object.isFrozen(icons.iconPaths));
  assert.equal(icons.iconPaths.length, catalog.catalogMeta.svgFileCount);
});

test('each application has one canonical form and split applications keep product identity', async () => {
  const forms = new Set(['GUI', 'CLI', 'IDE 插件', 'Web', '浏览器插件', '小程序']);
  for (const app of catalog.apps) {
    assert.equal(app.interfaces.length, 1, app.id);
    assert(forms.has(app.interfaces[0]), app.id);
  }
  assert.deepEqual(catalog.getApp('chatgpt').interfaces, ['Web']);
  assert.deepEqual(catalog.getApp('chatgpt-gui').interfaces, ['GUI']);
  assert.deepEqual(catalog.getApp('chatgpt-browser-extension').interfaces, ['浏览器插件']);
  assert.equal(catalog.getAppsByProduct('chatgpt').length, 3);
  for (const app of catalog.getAppsByProduct('chatgpt')) assert.equal(app.vendor_id, 'openai');
  assert(!catalog.getApp('chatgpt-gui').platforms.includes('Web'));
  assert.deepEqual(catalog.getApp('dify').interfaces, ['Web']);
  assert.equal(catalog.getApp('dify-gui'), undefined);
  const source = JSON.parse(await readFile(new URL('../data/open-source.json', import.meta.url)));
  assert.equal(source['mistral-vibe'], undefined);
  assert.equal(source['mistral-vibe-cli'].source_model, 'open-source');
  assert.equal(source['mistral-vibe-ide-plugin'], undefined);
  assert.equal(catalog.schema.items.properties.interfaces.maxItems, 1);
});

test('extension identities are independent from application IDs and store IDs are searchable', () => {
  const app = catalog.getApp('chatgpt-browser-extension');
  assert.equal(app.name, 'ChatGPT search');
  assert.equal(app.chrome_extension_id, 'ejcfepkfckglbgocfkanmcdngdijcgld');
  assert.equal(app.edge_extension_id, '');
  assert.deepEqual(catalog.searchApps(app.chrome_extension_id), [app]);
  const word = catalog.getApp('wordtune-browser-extension');
  assert.notEqual(word.chrome_extension_id, word.edge_extension_id);
  assert.deepEqual(catalog.searchApps(word.edge_extension_id), [word]);
  assert(catalog.findApps({interface:'浏览器插件'}).every(a => !a.name.includes('（浏览器插件）')));
  assert(catalog.apps.filter(a => a.interfaces[0] !== '浏览器插件').every(a => !a.chrome_extension_id && !a.edge_extension_id));
});

test('catalog excludes mobile applications and keeps desktop HarmonyOS and mini programs', () => {
  for (const id of ['amp-mobile','anythingllm-android','deepseek-gui','meta-ai-gui','replit-mobile','v0-ios','gemini-notebook-gui']) {
    assert.equal(catalog.getApp(id), undefined);
    assert.equal(catalog.getEvidence(id), undefined);
  }
  assert(catalog.apps.every(a => !a.platforms.some(p => ['iOS','iPadOS','Android','Mobile'].includes(p))));
  assert(catalog.getApp('qwenwork-desktop-cn').platforms.includes('HarmonyOS PC'));
  assert.deepEqual(catalog.getApp('workbuddy-cn-mini-program').interfaces, ['小程序']);
});
