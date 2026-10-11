import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { apps, getApp, getEvidence, searchApps } from '../dist/esm/index.js';
const read = name => readFile(new URL('../'+name, import.meta.url), 'utf8');
const report = JSON.parse(await read('docs/research/pr-1-absorption-2026-10-11.json'));
const source = JSON.parse(await read('data/open-source.json'));
test('PR absorption preserves main IDs and maps duplicates without restoring mobile or edition fields', () => {
 for (const id of [...report.preserved_previous_ids, ...report.added_ids]) assert(getApp(id), id);
 for (const id of report.excluded_mobile_ids) assert.equal(getApp(id), undefined, id);
 for (const [old, id] of Object.entries(report.mapped_ids)) {
  assert(getApp(id), id);
  assert.equal(getApp(old), undefined, old);
 }
 assert(apps.every(a=>a.interfaces.length===1&&!Object.hasOwn(a,'edition')));
 assert.equal(getApp('aiderdesk-cli').product_id,getApp('aider-desk-desktop').product_id);
 assert.equal(getApp('pochi-cli').product_id,getApp('pochi-vscode').product_id);
 assert.equal(getApp('moxby-browser').name,'Moxby');
 assert.deepEqual(searchApps('kogdciljkfifplhdainlinbppfpeenii').map(a=>a.id),['moxby-browser']);
});
test('package licensing, distribution scope and hosted-service boundaries are retained', () => {
 assert.equal(source['pochi-vscode'].source_model,'source-available');
 assert.match(source['pochi-vscode'].license,/All rights reserved/);
 assert.equal(source['pochi-cli'].license,'Apache-2.0');
 assert.equal(source['monkeycode-web'].license,'AGPL-3.0');
 assert.equal(source['monkeycode-work-desktop'].license,'AGPL-3.0');
 assert.equal(source['mistral-vibe'],undefined);
 assert.equal(source['mistral-vibe-cli'].license,'Apache-2.0');
 assert.match(getEvidence('neovate-ide').notes,/Marketplace.*未核实/);
 assert.match(getEvidence('rovo-dev-ide').notes,/日期待定/);
});
test('all absorbed official SVGs preserve recorded source hashes and per-application provenance',async()=>{
 for(const item of report.svg_assets){
  const bytes=await readFile(new URL('../assets/icons/'+item.file,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
  const records=apps.filter(a=>a.icon==='icons/'+item.file);assert(records.length,item.file);
  for(const app of records)assert(getEvidence(app.id).sources.some(s=>s.url===item.url));
 }
 assert.equal((await read('licenses/pochi-vscode.txt')).trim(),'© 2025 TabbyML, Inc. All rights reserved.');
});
