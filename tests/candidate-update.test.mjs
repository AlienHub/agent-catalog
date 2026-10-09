import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { apps, getApp, getAppsByProduct, getEvidence } from '../dist/esm/index.js';
const source = JSON.parse(await readFile(new URL('../data/open-source.json', import.meta.url)));

test('candidate update preserves product and surface boundaries', () => {
  for (const id of ['coder-community-web', 'lingcode-desktop', 'lingcode-cli', 'lingcode-web', 'lingcode-mobile', 'lingcode-baby-desktop', 'monkeycode-web', 'monkeycode-selfhosted-web', 'monkeycode-work-desktop', 'monkeycode-mobile', 'workbuddy-mobile-cn']) assert(getApp(id), id);
  assert.equal(getAppsByProduct('lingcode').length, 4);
  assert.equal(getApp('lingcode-baby-desktop').product_id, 'lingcode-baby');
  assert.equal(getAppsByProduct('monkeycode').length, 4);
  assert.equal(getAppsByProduct('kimi-code').length, 4);
  for (const id of ['code-server', 'marvis', 'marvisx', 'monkeycode-cli', 'workbuddy-ai']) assert.equal(getApp(id), undefined, id);
  assert.equal(new Set(apps.map(app => app.id)).size, apps.length);
});

test('WorkBuddy alias updates reuse IDs and preserve regional platform boundaries', () => {
  for (const id of ['workbuddy', 'workbuddy-cn']) assert(getApp(id).aliases.includes('WorkBuddy AI'));
  assert.deepEqual(getApp('workbuddy').platforms, ['macOS', 'Windows']);
  assert.deepEqual(getApp('workbuddy-cn').platforms, ['macOS', 'Windows', 'Linux', 'HarmonyOS PC']);
  assert(getApp('workbuddy-cn').interfaces.includes('小程序'));
  assert.deepEqual(getApp('workbuddy-mobile-cn').platforms, ['iOS', 'Android']);
});

test('platform and source claims remain variant-specific', () => {
  assert.deepEqual(getApp('lingcode-desktop').platforms, ['macOS']);
  assert.deepEqual(getApp('lingcode-cli').platforms, ['macOS', 'Windows', 'Linux']);
  assert.match(getEvidence('lingcode-mobile').notes, /只读/);
  assert.notEqual(getApp('lingcode-mobile').vendor_id, getApp('lingcode-desktop').vendor_id);
  assert.match(getEvidence('monkeycode-work-desktop').notes, /未核实已发布 Linux 安装包/);
  assert.deepEqual(getApp('monkeycode-work-desktop').platforms, ['macOS', 'Windows']);
  assert.equal(source['coder-community-web'].source_model, 'open-source');
  assert.equal(source['coder-community-web'].license, 'AGPL-3.0');
  assert.match(source['coder-community-web'].notes, /enterprise/);
  for (const id of ['monkeycode-selfhosted-web', 'monkeycode-work-desktop', 'monkeycode-mobile']) assert.equal(source[id].license, 'AGPL-3.0');
  for (const id of ['monkeycode-web', 'lingcode-desktop', 'workbuddy-mobile-cn']) assert.equal(source[id], undefined);
});

test('existing-product forms preserve IDs and distinguish desktop Work from coding products', () => {
  assert.equal(getApp('trae-ide-extension').product_id, 'trae');
  assert.match(getApp('trae-ide-extension').website, /MarsCode\.marscode-extension/);
  assert(getApp('trae-ide-extension').aliases.includes('MarsCode Extension'));
  assert.equal(getApp('coze-desktop-cn').product_id, 'coze');
  assert.deepEqual(getApp('coze').platforms, ['Web']);
  assert.deepEqual(getApp('coze-desktop-cn').platforms, ['macOS', 'Windows']);
  assert.equal(getApp('qingyan-desktop').product_id, 'qingyan');
  assert(getApp('kimi').aliases.includes('Kimi Work'));
  assert.equal(getApp('kimi').name, 'Kimi');
  assert.equal(getApp('kimi-work'), undefined);
  assert.equal(getAppsByProduct('kimi-code').length, 4);
  assert.match(getEvidence('kimi').notes, /Apple silicon/i);
});

test('second-batch identity and distribution boundaries avoid duplicate products', () => {
  for (const id of ['deepseek-harness-desktop', 'loomy-desktop', 'qoderwake-cn-local', 'vscode-desktop', 'aiderdesk-desktop', 'command-code-cli', 'crush-cli', 'deep-agents-code-cli', 'forgecode-cli', 'jazz-cli', 'kode-cli', 'moxby-browser', 'neovate-desktop', 'ona-web', 'pochi-ide', 'reasonix-cli', 'rovo-dev-cli', 'tabnine-cli', 'zencoder-ide', 'zenflow-desktop']) assert(getApp(id), id);
  assert.equal(getAppsByProduct('zenflow').length, 1);
  assert.equal(getAppsByProduct('crush').length, 1);
  assert.notEqual(getApp('tabnine-cli').product_id, getApp('tabby').product_id);
  assert.notEqual(getApp('aiderdesk-desktop').product_id, getApp('aider').product_id);
  assert.notEqual(getApp('qoderwake-cn-local').product_id, getApp('qoder-work-cn').product_id);
  assert.notEqual(getApp('deepseek-harness-desktop').product_id, getApp('deepseek').product_id);
  assert.equal(getAppsByProduct('github-copilot').length, 4);
  for (const id of ['code-oss', 'vscode-web', 'bob', 'codemaker', 'codestudio', 'cortex', 'firebender', 'iflow-cli', 'mcpjam', 'mux', 'roo-code', 'terramind', 'tinycloud', 'neovate-code-desktop']) assert.equal(getApp(id), undefined, id);
});

test('new source metadata distinguishes package-specific licenses and unknown products', () => {
  assert.equal(source['crush-cli'].source_model, 'source-available');
  assert.equal(source['crush-cli'].license, 'FSL-1.1-MIT');
  assert.equal(source['pochi-ide'].source_model, 'source-available');
  assert.match(source['pochi-ide'].license_url, /packages\/vscode\/LICENSE\.txt$/);
  assert.equal(source['pochi-cli'].source_model, 'open-source');
  assert.equal(source['pochi-cli'].license, 'Apache-2.0');
  assert.match(source['deep-agents-code-cli'].license_url, /libs\/code\/LICENSE$/);
  for (const id of ['vscode-desktop', 'command-code-cli', 'forgecode-ide', 'rovo-dev-cli', 'tabnine-cli', 'zenflow-desktop']) assert.equal(source[id], undefined, id);
});

test('published OS claims and preview labels keep runtime limitations', () => {
  assert.deepEqual(getApp('aiderdesk-cli').platforms, []);
  assert.deepEqual(getApp('neovate-cli').platforms, []);
  assert.deepEqual(getApp('neovate-desktop').platforms, ['macOS', 'Windows']);
  assert(getEvidence('neovate-desktop').sources.some(s => s.url.endsWith('/releases/tag/v0.1.2')));
  assert.deepEqual(getApp('deepseek-harness-desktop').platforms, ['macOS', 'Windows']);
  assert.match(getApp('deepseek-harness-desktop').edition, /预览/);
  assert.deepEqual(getApp('deep-agents-code-cli').platforms, ['macOS', 'Linux']);
  assert.deepEqual(getApp('loomy-android').platforms, ['Android']);
  assert.match(getApp('reasonix-studio-desktop').edition, /开发线/);
  assert.match(getApp('reasonix-desktop').edition, /稳定维护/);
  assert(getEvidence('reasonix-desktop').sources.some(s => s.url.endsWith('/releases/tag/desktop-v1.39.8')));
  assert.match(getEvidence('reasonix-ide').notes, /1.x/);
});

test('every research candidate has a reviewable mapping independent of the catalog schema', async () => {
  const research = JSON.parse(await readFile(new URL('../docs/research/2026-10-09-full-research.json', import.meta.url)));
  const mapping = JSON.parse(await readFile(new URL('../docs/research/2026-10-09-catalog-mapping.json', import.meta.url)));
  assert.equal(research.length, 41);
  assert.equal(mapping.length, 41);
  assert.equal(research.reduce((n, r) => n + r.variants.length, 0), 99);
  assert.deepEqual(mapping.map(r => r.candidate).sort(), research.map(r => r.candidate).sort());
  assert.equal(mapping.filter(r => r.outcome === 'review-only').length, 13);
  for (const row of mapping) {
    for (const id of row.record_ids) assert(getApp(id), `${row.candidate}: ${id}`);
    for (const id of row.product_ids) assert(getAppsByProduct(id).length, `${row.candidate}: ${id}`);
    if (row.outcome === 'review-only') assert.deepEqual(row.record_ids, []);
  }
});

test('Rovo transition notices do not invent an end-of-life date', async () => {
  const { notices } = await import('../website/catalog-data.js');
  assert.match(notices['rovo-dev-cli'], /终止日期待定/);
  assert.match(notices['rovo-dev-ide'], /日期待定/);
  assert.match(notices['rovo-dev-reviewer'], /2026-12-03.*非停服/);
  for (const id of ['rovo-dev-cli','rovo-dev-ide','rovo-dev-reviewer']) {
    assert(getApp(id));
    assert(getEvidence(id).sources.some(s => s.url === 'https://www.atlassian.com/licensing/rovo-dev'));
  }
});

test('all newly copied official SVGs have exact-byte provenance', async () => {
  const { createHash } = await import('node:crypto');
  const assets = JSON.parse(await readFile(new URL('../docs/research/2026-10-09-svg-sources.json', import.meta.url)));
  assert.equal(assets.length, 7);
  for (const asset of assets) {
    const bytes = await readFile(new URL(`../assets/icons/${asset.file}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
    assert.equal(new URL(asset.url).protocol, 'https:');
    assert.equal(asset.retrieved_at, '2026-10-09');
    assert(apps.some(app => app.icon === `icons/${asset.file}`));
  }
});


test('Pochi packaging omission retains the verified official source without a replacement logo', () => {
  for (const id of ['pochi-ide', 'pochi-cli']) {
    assert.equal(getApp(id).icon, '');
    assert.match(getApp(id).svg_status, /本批未打包/);
    assert(getEvidence(id).sources.some(s => s.url === 'https://raw.githubusercontent.com/TabbyML/pochi/main/packages/vscode/assets/icons/pochi-logo.svg'));
  }
});
