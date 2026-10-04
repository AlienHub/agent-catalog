import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url));
const file = path => readFile(resolve(root,path));
for (const name of ['dataset','evidence','schema','collections','metadata']) assert.deepEqual(await file(`website-dist/${name}.json`), await file(`data/${name}.json`), `${name} source parity`);
for (const name of await readdir(resolve(root,'assets/icons'))) assert.deepEqual(await file(`website-dist/icons/${name}`), await file(`assets/icons/${name}`), `${name} source parity`);
for (const name of await readdir(resolve(root,'licenses'))) assert.deepEqual(await file(`website-dist/licenses/${name}`), await file(`licenses/${name}`), `${name} notice parity`);
const html = (await file('website-dist/index.html')).toString();
const metadata = JSON.parse(await file('data/metadata.json'));
assert(html.includes(`data-version="${metadata.dataVersion}"`));
assert(!/__DATA_VERSION__|__SNAPSHOT_DATE__/.test(html));
assert(html.includes(`href="ai-data-lib-v${metadata.dataVersion}.zip" download`));
assert(!html.includes('https://github.com/AlienHub/agent-catalog'));
for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  if (/^(?:https?:|#|\.\/)/.test(match[1])) continue;
  await file(`website-dist/${match[1]}`);
}
const appJs = (await file('website-dist/app.js')).toString();
for (const match of appJs.matchAll(/\$\(['"]([^'"]+)['"]\)/g)) assert(html.includes(`id="${match[1]}"`), `Missing DOM target ${match[1]}`);
const zip = await file(`website-dist/ai-data-lib-v${metadata.dataVersion}.zip`);
assert.equal(zip.readUInt32LE(0), 0x04034b50);
assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50);
assert.equal(zip.readUInt16LE(zip.length - 12), 5 + 1 + 1 + (await readdir(resolve(root,'assets/icons'))).length + (await readdir(resolve(root,'licenses'))).length);
assert((await file('website-dist/dataset.csv')).toString().startsWith('\uFEFF'));
console.log('PASS: website data, SVG and license source parity; CSV/ZIP exports, version, local links and DOM targets');
