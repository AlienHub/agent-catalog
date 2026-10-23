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
  assert.equal(catalog.catalogMeta.recordCount, raw.length);
  assert.equal(catalog.catalogMeta.productCount, new Set(raw.map(app => app.product_id)).size);
  assert.equal(catalog.catalogMeta.dataVersion, '0.28');
  for (const id of ['qwenwork-desktop-cn', 'qwenwork-web-cn', 'doubao-desktop', 'dropstone-cli', 'muse-code', 'hermes-agent-desktop', 'xxl-ai-web', 'manus-desktop', 'xiryn-web', 'kai-web', 'kai-desktop', 'sugabots-web', 'agency-orchestrator-cli', 'orca-desktop', 'pilotdeck-web', 'openbitfun-desktop', 'craft-agents-desktop', 'openharness-cli', 'talorys-web', 'openmuse-web', 'reason-agent-web', 'viktor-web', 'octop-web', 'lobsterai-desktop', 'starkomand-desktop', 'fade-cli', 'readywhen-web', 'rea-cli', 'openfilm-cli', 'openfilm-web', 'openfilm-desktop', 'craig-cli', 'halis-code-cli', 'halis-code-desktop', 'emdash-desktop']) assert(catalog.getApp(id));
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
  assert.deepEqual(catalog.findApps({ hasSvg: false }), raw.filter(app => !app.icon.endsWith('.svg')));
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
  assert.deepEqual(new Set(catalog.getCollection('chinese_agents').map(a=>a.id)), new Set(catalog.collections.chinese_agents));
  assert.deepEqual(catalog.getCollection('not-a-collection'), []);
  assert.deepEqual(catalog.findApps({ collection: '__proto__' }), []);
  assert.equal(catalog.getEvidence('__proto__'), undefined);
  assert.equal(catalog.getEvidence('constructor'), undefined);
  for (const app of raw) assert(catalog.getEvidence(app.id).sources.length);
});
test('all SVG lookups are bundled and portable, with explicit absence', async () => {
  for (const app of raw) {
    const icon = icons.getAppIcon(app.id);
    if (!app.icon.endsWith('.svg')) { assert.equal(icon, undefined); continue; }
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

test('display names omit form suffixes and China editions use CN', () => {
 assert.equal(catalog.getApp('chatgpt').name,'ChatGPT');
 assert.equal(catalog.getApp('chatgpt-gui').name,'ChatGPT');
 assert.deepEqual(catalog.getApp('chatgpt').interfaces,['Web']);
 assert.deepEqual(catalog.getApp('chatgpt-gui').interfaces,['GUI']);
 assert.equal(catalog.getApp('trae-work-cn').name,'TraeWork CN');
 assert(catalog.apps.every(a => !a.name.includes('中国版') && !/（(?:Web|GUI|CLI|IDE|IDE 插件)）$/.test(a.name)));
});

test('edition field is removed from records and schema', () => {
 assert.equal(catalog.catalogMeta.schemaVersion,7);
 assert(catalog.apps.every(a=>!Object.hasOwn(a,'edition')));
 assert(!catalog.schema.items.required.includes('edition'));
 assert(!Object.hasOwn(catalog.schema.items.properties,'edition'));
});

test('coding logo assets retain verified hashes and provenance across application forms', async () => {
 const { createHash } = await import('node:crypto');
 const review = JSON.parse(await readFile(new URL('../docs/research/coding-logo-assets-2026-10-11.json', import.meta.url)));
 for (const asset of review.assets) {
  const bytes = await readFile(new URL(`../assets/${asset.path}`, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.path);
  for (const id of asset.application_ids) {
   assert.equal(catalog.getApp(id).icon, asset.path, id);
   assert(catalog.getEvidence(id).sources.some(source => source.url === asset.url), id);
   const logo = icons.getAppLogo(id);
   assert.equal(logo.format, asset.format);
   if (asset.format === 'SVG') assert.equal(icons.getAppIcon(id).svg, bytes.toString(), id);
   else {
    assert.equal(icons.getAppIcon(id), undefined);
    assert.equal(icons.getIconSvg(asset.path), undefined);
    assert.equal(logo.mimeType, 'image/png');
    assert(Buffer.from(logo.dataUri.split(',')[1], 'base64').equals(bytes));
    assert(!catalog.findApps({hasSvg:true}).some(app => app.id === id));
    assert(catalog.getApp(id).svg_status.includes('PNG 位图'));
   }
  }
 }
});


test('Web AI additions preserve original asset hashes, format and per-application sources', async () => {
  const { createHash } = await import('node:crypto');
  const audit = JSON.parse(await readFile(new URL('../docs/research/web-ai-assets-2026-10-11.json', import.meta.url)));
  for (const id of audit.new_application_ids) {
    assert.deepEqual(catalog.getApp(id).interfaces, ['Web']);
    assert.equal(catalog.getApp(id).chrome_extension_id, '');
  }
  for (const asset of audit.assets) {
    const bytes = await readFile(new URL(`../assets/${asset.path}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.path);
    for (const id of asset.application_ids) {
      assert.equal(catalog.getApp(id).icon, asset.path);
      assert(catalog.getEvidence(id).sources.some(source => source.url === asset.url));
      assert.equal(icons.getAppLogo(id).format, asset.format);
    }
  }
  assert.equal(catalog.getApp('scispace').icon, 'icons/scispace.svg');
  assert.equal(catalog.getApp('genspark').icon, 'icons/genspark.png');
});

test('2026-10-13 CLI additions and OpenCode version evidence', () => {
  const dropstone = catalog.getApp('dropstone-cli');
  assert.equal(dropstone.vendor_id, 'blankline');
  assert.equal(dropstone.product_id, 'dropstone');
  assert.deepEqual(dropstone.interfaces, ['CLI']);
  assert.equal(dropstone.icon, 'icons/dropstone.png');
  assert.match(catalog.getEvidence('dropstone-cli').notes, /v1\.0\.59/);
  const muse = catalog.getApp('muse-code');
  assert.equal(muse.vendor_id, 'meta');
  assert.equal(muse.product_id, 'muse-code');
  assert.deepEqual(muse.interfaces, ['CLI']);
  assert.notEqual(muse.product_id, catalog.getApp('meta-ai').product_id);
  assert.match(catalog.getEvidence('muse-code').notes, /1\.4\.6/);
  assert.match(catalog.getEvidence('opencode').notes, /v2\.0\.27/);
  assert(catalog.getEvidence('opencode').sources.some(source => source.url === 'https://opencode.ai/changelog'));
});

test('2026-10-13 daily candidates, Manus Studio and logo gap fill', async () => {
  const source = JSON.parse(await readFile(new URL('../data/open-source.json', import.meta.url)));
  const hermes = catalog.getApp('hermes-agent-desktop');
  assert.equal(hermes.product_id, catalog.getApp('hermes-agent-cli').product_id);
  assert.deepEqual(hermes.interfaces, ['GUI']);
  assert.equal(hermes.icon, 'icons/hermes-agent.svg');
  assert.equal(catalog.getApp('xxl-ai-web').product_id, catalog.getApp('xxl-ai-desktop').product_id);
  assert.deepEqual(catalog.getApp('xxl-ai-web').interfaces, ['Web']);
  assert.deepEqual(catalog.getApp('xxl-ai-desktop').interfaces, ['GUI']);
  assert.equal(source['xxl-ai-web'].source_model, 'source-available');
  assert.equal(source['xxl-ai-web'].license, 'GPL-3.0');
  assert.equal(source['guilds-web'].license, 'AGPL-3.0');
  assert.equal(source['warp-terminal'].license, 'AGPL-3.0');
  assert.equal(source['openhands'].license, 'MIT');
  assert.equal(source['tabby'].source_model, 'source-available');
  const manus = catalog.getApp('manus-desktop');
  assert.equal(manus.product_id, catalog.getApp('manus').product_id);
  assert.deepEqual(manus.interfaces, ['GUI']);
  assert.equal(manus.icon, catalog.getApp('manus').icon);
  assert.equal(catalog.getApp('openclaw-cli').icon, 'icons/openclaw.svg');
  assert.equal(catalog.getApp('coze-desktop-cn').icon, 'icons/coze-cn.svg');
  assert.equal(catalog.getApp('astrbot-web').icon, 'icons/astrbot.svg');
  assert.equal(source['gpt4all'].maintenance.status, 'unknown');
  assert.equal(source['roo-code-vscode'].maintenance.status, 'archived');
  assert.match(catalog.getEvidence('openpilot-desktop').notes, /LICENSE/);
  assert.equal(source['openpilot-desktop'], undefined);
});

test('2026-10-14 daily candidates', async () => {
  const source = JSON.parse(await readFile(new URL('../data/open-source.json', import.meta.url)));
  const xiryn = catalog.getApp('xiryn-web');
  assert.deepEqual(xiryn.interfaces, ['Web']);
  assert.equal(xiryn.web_domain_status, 'self-hosted');
  assert.equal(xiryn.icon, 'icons/xiryn.svg');
  assert.equal(source['xiryn-web'].license, 'MIT');
  assert.match(catalog.getEvidence('xiryn-web').notes, /v0\.4\.1/);
  const kaiWeb = catalog.getApp('kai-web');
  const kaiDesk = catalog.getApp('kai-desktop');
  assert.equal(kaiWeb.product_id, kaiDesk.product_id);
  assert.equal(kaiWeb.vendor_id, 'morgen');
  assert.deepEqual(kaiWeb.interfaces, ['Web']);
  assert.deepEqual(kaiDesk.interfaces, ['GUI']);
  assert.deepEqual(kaiDesk.platforms, ['macOS']);
  assert.deepEqual(kaiWeb.web_domains, ['web.hirekai.ai']);
  assert.equal(kaiWeb.web_domain_status, 'verified');
  assert.equal(source['kai-web'], undefined);
  assert.equal(source['kai-desktop'], undefined);
  const suga = catalog.getApp('sugabots-web');
  assert.deepEqual(suga.interfaces, ['Web']);
  assert.equal(suga.web_domain_status, 'self-hosted');
  assert.equal(source['sugabots-web'].license, 'MIT');
  assert.match(catalog.getEvidence('sugabots-web').notes, /v0\.2\.0/);
  const aoCli = catalog.getApp('agency-orchestrator-cli');
  const aoWeb = catalog.getApp('agency-orchestrator-web');
  const aoDesk = catalog.getApp('agency-orchestrator-desktop');
  assert.equal(aoCli.product_id, aoWeb.product_id);
  assert.equal(aoDesk.product_id, aoCli.product_id);
  assert.deepEqual(aoCli.interfaces, ['CLI']);
  assert.deepEqual(aoWeb.interfaces, ['Web']);
  assert.deepEqual(aoDesk.interfaces, ['GUI']);
  assert.equal(aoWeb.web_domain_status, 'self-hosted');
  assert.deepEqual(aoDesk.platforms, ['macOS', 'Linux']);
  assert.equal(source['agency-orchestrator-cli'].license, 'Apache-2.0');
  assert.match(catalog.getEvidence('agency-orchestrator-cli').notes, /0\.20\.0/);
  assert.match(catalog.getEvidence('agency-orchestrator-desktop').notes, /desktop-v0\.4\.12/);
});

test('2026-10-19 daily candidates', async () => {
  const source = JSON.parse(await readFile(new URL('../data/open-source.json', import.meta.url)));
  const orca = catalog.getApp('orca-desktop');
  assert.deepEqual(orca.interfaces, ['GUI']);
  assert.deepEqual(orca.platforms, ['macOS', 'Windows', 'Linux']);
  assert.equal(orca.icon, 'icons/orca.png');
  assert.equal(source['orca-desktop'].license, 'MIT');
  assert.match(catalog.getEvidence('orca-desktop').notes, /v1\.4\.229/);
  assert.equal(catalog.getApp('orca-cli'), undefined);
  const pdWeb = catalog.getApp('pilotdeck-web');
  const pdCli = catalog.getApp('pilotdeck-cli');
  const pdDesk = catalog.getApp('pilotdeck-desktop');
  assert.equal(pdWeb.product_id, pdCli.product_id);
  assert.equal(pdDesk.product_id, pdWeb.product_id);
  assert.deepEqual(pdWeb.interfaces, ['Web']);
  assert.equal(pdWeb.web_domain_status, 'self-hosted');
  assert.deepEqual(pdDesk.interfaces, ['GUI']);
  assert.equal(source['pilotdeck-web'].license, 'AGPL-3.0');
  assert.match(catalog.getEvidence('pilotdeck-desktop').notes, /v2026\.10\.17/);
  const obfDesk = catalog.getApp('openbitfun-desktop');
  const obfCli = catalog.getApp('openbitfun-cli');
  assert.equal(obfDesk.product_id, obfCli.product_id);
  assert.deepEqual(obfCli.platforms, ['Linux']);
  assert.equal(source['openbitfun-desktop'].license, 'MIT');
  assert.match(catalog.getEvidence('openbitfun-desktop').notes, /v1\.0\.6/);
  const craft = catalog.getApp('craft-agents-desktop');
  assert.deepEqual(craft.interfaces, ['GUI']);
  assert.equal(craft.icon, 'icons/craft-agents.svg');
  assert.notEqual(craft.vendor_id, 'craft-rpgs');
  assert.equal(source['craft-agents-desktop'].license, 'Apache-2.0');
  assert.match(catalog.getEvidence('craft-agents-desktop').notes, /v0\.15\.3/);
  const hnDesk = catalog.getApp('openharness-desktop');
  const hnCli = catalog.getApp('openharness-cli');
  assert.equal(hnDesk.product_id, hnCli.product_id);
  assert.deepEqual(hnDesk.platforms, ['macOS', 'Linux']);
  assert.deepEqual(hnCli.interfaces, ['CLI']);
  assert.equal(source['openharness-cli'].license, 'MIT');
  assert.match(catalog.getEvidence('openharness-desktop').notes, /v1\.2\.90_desktop/);
  assert.match(catalog.getEvidence('openharness-cli').notes, /v0\.4\.19_cli/);
  assert.equal(catalog.getApp('openharness-web'), undefined);
  const talorys = catalog.getApp('talorys-web');
  assert.equal(talorys.web_domain_status, 'self-hosted');
  assert.equal(source['talorys-web'].license, 'MIT');
  assert.match(catalog.getEvidence('talorys-web').notes, /0\.1\.7/);
  const muse = catalog.getApp('openmuse-web');
  assert.deepEqual(muse.interfaces, ['Web']);
  assert.equal(muse.web_domain_status, 'self-hosted');
  assert.equal(source['openmuse-web'].license, 'MIT');
  assert.equal(source['openmuse-web'].source_model, 'open-source');
  const reasonWeb = catalog.getApp('reason-agent-web');
  const reasonDesk = catalog.getApp('reason-agent-desktop');
  assert.equal(reasonWeb.product_id, reasonDesk.product_id);
  assert.deepEqual(reasonWeb.web_domains, ['reasonmachines.com']);
  assert.equal(reasonWeb.web_domain_status, 'verified');
  assert.deepEqual(reasonDesk.platforms, ['macOS']);
  assert.equal(source['reason-agent-web'], undefined);
  assert.match(catalog.getEvidence('reason-agent-web').notes, /1\.1/);
  const viktor = catalog.getApp('viktor-web');
  assert.deepEqual(viktor.web_domains, ['app.viktor.com']);
  assert.equal(viktor.vendor_id, 'zeta-ai');
  assert.equal(source['viktor-web'], undefined);
  assert.equal(catalog.getApp('junie-local-desktop'), undefined);
  assert.equal(catalog.getApp('scout-web'), undefined);
  assert.equal(catalog.getApp('agibot-desktop'), undefined);
});

test('2026-10-20 daily candidates', async () => {
  const source = JSON.parse(await readFile(new URL('../data/open-source.json', import.meta.url)));
  const octopWeb = catalog.getApp('octop-web');
  const octopCli = catalog.getApp('octop-cli');
  const octopDesk = catalog.getApp('octop-desktop');
  assert.equal(octopWeb.product_id, octopCli.product_id);
  assert.equal(octopDesk.product_id, octopWeb.product_id);
  assert.notEqual(octopWeb.product_id, catalog.getApp('octo-web').product_id);
  assert.notEqual(octopWeb.vendor_id, catalog.getApp('octo-web').vendor_id);
  assert.deepEqual(octopWeb.interfaces, ['Web']);
  assert.equal(octopWeb.web_domain_status, 'self-hosted');
  assert.deepEqual(octopCli.interfaces, ['CLI']);
  assert.deepEqual(octopDesk.interfaces, ['GUI']);
  assert.deepEqual(octopDesk.platforms, ['macOS', 'Windows', 'Linux']);
  assert.equal(octopWeb.icon, 'icons/octop.svg');
  assert.equal(source['octop-web'].license, 'MIT');
  assert.match(catalog.getEvidence('octop-desktop').notes, /v1\.0\.2/);
  const lobster = catalog.getApp('lobsterai-desktop');
  assert.deepEqual(lobster.interfaces, ['GUI']);
  assert.deepEqual(lobster.platforms, ['macOS', 'Windows']);
  assert.equal(lobster.icon, 'icons/lobsterai.png');
  assert.equal(source['lobsterai-desktop'].license, 'MIT');
  assert.match(catalog.getEvidence('lobsterai-desktop').notes, /2026\.10\.16/);
  const stark = catalog.getApp('starkomand-desktop');
  assert.deepEqual(stark.interfaces, ['GUI']);
  assert.deepEqual(stark.platforms, ['macOS']);
  assert.equal(stark.icon, 'icons/starkomand.svg');
  assert.equal(source['starkomand-desktop'], undefined);
  assert.match(catalog.getEvidence('starkomand-desktop').notes, /v1\.0\.7/);
  const fade = catalog.getApp('fade-cli');
  assert.deepEqual(fade.interfaces, ['CLI']);
  assert.equal(fade.icon, '');
  assert.equal(source['fade-cli'].license, 'MIT');
  assert.match(catalog.getEvidence('fade-cli').notes, /0\.5\.0/);
  const ready = catalog.getApp('readywhen-web');
  assert.deepEqual(ready.web_domains, ['app.readywhen.ai']);
  assert.equal(ready.web_domain_status, 'verified');
  assert.equal(ready.vendor_id, 'oliva-health');
  assert.equal(ready.icon, 'icons/readywhen.svg');
  assert.equal(source['readywhen-web'], undefined);
  assert.equal(catalog.getApp('octop-ide'), undefined);
});

test('2026-10-21 daily candidates', async () => {
  const source = JSON.parse(await readFile(new URL('../data/open-source.json', import.meta.url)));
  const rea = catalog.getApp('rea-cli');
  assert.equal(rea.vendor_id, 'morluto');
  assert.equal(rea.product_id, 'rea');
  assert.deepEqual(rea.interfaces, ['CLI']);
  assert.equal(rea.icon, 'icons/rea.svg');
  assert.equal(source['rea-cli'].license, 'MIT');
  assert.match(catalog.getEvidence('rea-cli').notes, /v6\.7\.0/);
  const filmCli = catalog.getApp('openfilm-cli');
  const filmWeb = catalog.getApp('openfilm-web');
  const filmDesk = catalog.getApp('openfilm-desktop');
  assert.equal(filmCli.product_id, filmWeb.product_id);
  assert.equal(filmDesk.product_id, filmCli.product_id);
  assert.deepEqual(filmCli.interfaces, ['CLI']);
  assert.deepEqual(filmWeb.interfaces, ['Web']);
  assert.equal(filmWeb.web_domain_status, 'self-hosted');
  assert.deepEqual(filmDesk.interfaces, ['GUI']);
  assert.deepEqual(filmDesk.platforms, ['macOS', 'Windows']);
  assert.equal(filmWeb.icon, 'icons/openfilm.svg');
  assert.equal(source['openfilm-desktop'].license, 'MIT');
  assert.match(catalog.getEvidence('openfilm-desktop').notes, /v0\.2\.4/);
  const craig = catalog.getApp('craig-cli');
  assert.equal(craig.vendor_id, 'hallsamuel90');
  assert.deepEqual(craig.interfaces, ['CLI']);
  assert.equal(craig.icon, 'icons/craig.svg');
  assert.equal(source['craig-cli'].license, 'MIT');
  assert.match(catalog.getEvidence('craig-cli').notes, /0\.17\.5/);
  const halisCli = catalog.getApp('halis-code-cli');
  const halisDesk = catalog.getApp('halis-code-desktop');
  assert.equal(halisCli.product_id, halisDesk.product_id);
  assert.deepEqual(halisCli.interfaces, ['CLI']);
  assert.deepEqual(halisDesk.interfaces, ['GUI']);
  assert.deepEqual(halisDesk.platforms, ['macOS', 'Windows', 'Linux']);
  assert.equal(halisCli.icon, 'icons/halis-code.png');
  assert.equal(source['halis-code-cli'].license, 'MIT');
  assert.match(catalog.getEvidence('halis-code-cli').notes, /v1\.0\.0/);
  const emdash = catalog.getApp('emdash-desktop');
  assert.equal(emdash.vendor_id, 'general-action');
  assert.deepEqual(emdash.interfaces, ['GUI']);
  assert.deepEqual(emdash.platforms, ['macOS', 'Windows', 'Linux']);
  assert.equal(emdash.icon, 'icons/emdash.png');
  assert.equal(source['emdash-desktop'].license, 'Apache-2.0');
  assert.match(catalog.getEvidence('emdash-desktop').notes, /v1\.2\.8/);
  assert.equal(catalog.getApp('rea-web'), undefined);
  assert.equal(catalog.getApp('craig-desktop'), undefined);
  assert.equal(catalog.getApp('emdash-cli'), undefined);
  assert.equal(catalog.getApp('openfilm-linux'), undefined);
});

test('Domain-only schema removes Web entry URLs and keeps frozen hostname arrays', () => {
  assert.equal(catalog.catalogMeta.schemaVersion, 7);
  assert(!catalog.schema.items.required.includes('web_url'));
  assert(!Object.hasOwn(catalog.schema.items.properties, 'web_url'));
  assert(!Object.hasOwn(catalog.schema.items.properties, 'web_domain_entries'));
  assert.equal(catalog.schema.items.properties.web_domains.type, 'array');
  assert.equal(catalog.schema.items.properties.web_domains.items.type, 'string');
  for (const app of catalog.apps) {
    assert(!Object.hasOwn(app, 'web_url'), app.id);
    assert(!Object.hasOwn(app, 'web_domain_entries'), app.id);
    assert(Array.isArray(app.web_domains), app.id);
    assert(Object.isFrozen(app.web_domains), app.id);
  }
});
test('Application domains are searchable separately from marketing websites', () => {
  const firefly = catalog.getApp('adobe-firefly');
  assert.deepEqual(firefly.web_domains, ['firefly.adobe.com']);
  assert.notEqual(new URL(firefly.website).hostname, firefly.web_domains[0]);
  assert.deepEqual(catalog.findApps({ webDomain: 'firefly.adobe.com' }), [firefly]);
  assert(catalog.searchApps('app.leonardo.ai').some(a => a.id === 'leonardo-ai'));
  assert.deepEqual(catalog.findApps({ webDomain: 'adobe.com' }), []);
  assert.deepEqual(catalog.findApps({ webDomain: 'www.adobe.com' }), []);
});
test('Shared hosts match multiple applications; self-hosted and unknown domains stay empty', () => {
  const shared = catalog.findApps({ webDomain: 'chatgpt.com' });
  assert(shared.some(a => a.id === 'chatgpt'));
  assert(shared.some(a => a.id === 'codex-web'));
  assert.equal(catalog.getApp('qwen-code-web').web_domain_status, 'self-hosted');
  assert.deepEqual(catalog.getApp('qwen-code-web').web_domains, []);
  assert.equal(catalog.getApp('jetbrains-air-web').web_domain_status, 'unverified');
  assert.deepEqual(catalog.getApp('jetbrains-air-web').web_domains, []);
  assert(catalog.apps.filter(a => a.interfaces[0] !== 'Web').every(a => a.web_domain_status === 'not-applicable' && !a.web_domains.length));
});
test('Chinese Web additions use hostname arrays and retain sourced alternate domains', () => {
  for (const id of ['zhida', 'tongyi-farui', 'shangliang', 'biling', 'tusi']) {
    const app = catalog.getApp(id);
    assert.deepEqual(app.interfaces, ['Web']);
    assert.equal(app.web_domain_status, 'verified');
    for (const host of app.web_domains) {
      assert(catalog.findApps({ webDomain: host }).includes(app));
      assert(catalog.getEvidence(id).sources.some(s => new URL(s.url).hostname === host));
    }
  }
  const kimi = catalog.getApp('kimi');
  assert.deepEqual(kimi.web_domains, ['www.kimi.com', 'kimi.moonshot.cn']);
  assert.deepEqual(catalog.findApps({ webDomain: 'kimi.moonshot.cn' }), [kimi]);
  assert(catalog.searchApps('kimi.moonshot.cn').includes(kimi));
  assert.deepEqual(catalog.getApp('tusi').web_domains, ['tusi.cn', 'tusiart.com']);
  assert.deepEqual(catalog.getApp('trae-work').web_domains, ['work.trae.ai']);
  assert(!catalog.findApps({ webDomain: 'www.trae.ai' }).some(a => a.id === 'trae-work'));
  assert.equal(catalog.getApp('zhida').icon, 'icons/zhida.svg');
  assert.equal(catalog.getApp('tongyi-farui').icon, 'icons/qianwen.svg');
  assert.equal(catalog.getApp('shangliang').icon, '');
  assert.equal(catalog.getApp('biling').icon, 'icons/biling.png');
  assert.equal(catalog.getApp('tusi').icon, 'icons/tusi.png');
  assert.equal(catalog.getApp('iflywrite').icon, 'icons/iflywrite.svg');
});
test('Web audit accounts for every application and new entries have source evidence', async () => {
  const audit = JSON.parse(await readFile(new URL('../docs/research/web-domain-review-2026-10-12.json', import.meta.url)));
  const integration = JSON.parse(await readFile(new URL('../docs/research/chinese-web-domains-integration-2026-10-16.json', import.meta.url)));
  const covered = new Set([...audit.records, ...integration.records].map(a => a.id));
  assert.deepEqual([...covered].sort(), catalog.findApps({ interface: 'Web' }).map(a => a.id).sort());
  for (const record of integration.records) assert.deepEqual(catalog.getApp(record.id).web_domains, record.domains);
  for (const id of ['t3-chat-web','abacus-chatllm-web','dust-web','mem-web','taskade-web']) {
    const app = catalog.getApp(id);
    assert.equal(app.web_domain_status, 'verified');
    assert(catalog.getEvidence(id).sources.some(s => new URL(s.url).hostname === app.web_domains[0]));
  }
});
