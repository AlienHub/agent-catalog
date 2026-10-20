import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const file = path => readFile(resolve(root,path));
const dataNames=['dataset','evidence','schema','collections','metadata','open-source','open-source-schema','commercial','commercial-schema','providers','providers-schema','provider-evidence'];
for (const name of dataNames) assert.deepEqual(await file(`website-dist/${name}.json`), await file(`data/${name}.json`), `${name} source parity`);
for (const name of await readdir(resolve(root,'assets/icons'))) assert.deepEqual(await file(`website-dist/icons/${name}`), await file(`assets/icons/${name}`), `${name} source parity`);
for (const name of await readdir(resolve(root,'licenses'))) assert.deepEqual(await file(`website-dist/licenses/${name}`), await file(`licenses/${name}`), `${name} notice parity`);
const html = (await file('website-dist/index.html')).toString();
const metadata = JSON.parse(await file('data/metadata.json'));
assert(html.includes(`data-version="${metadata.dataVersion}"`));
assert(!/__DATA_VERSION__|__SNAPSHOT_DATE__|__BRAND_HASH__/.test(html));
const brand = await file('website/favicon.svg');
assert.deepEqual(await file('website-dist/favicon.svg'), brand, 'Brand SVG is copied byte-for-byte');
const brandHash = createHash('sha256').update(brand).digest('hex').slice(0,12);
assert(html.includes(`href="favicon.svg?v=${brandHash}"`));
assert(html.includes(`data-brand-hash="${brandHash}"`));
assert(html.includes(`href="agent-atlas-v${metadata.dataVersion}.zip" download`));
assert(!html.includes('https://github.com/AlienHub/agent-catalog'));
for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  if (/^(?:https?:|#|\.\/)/.test(match[1])) continue;
  await file(`website-dist/${match[1].split('?')[0]}`);
}
const appJs = (await file('website-dist/app.js')).toString();
for (const match of appJs.matchAll(/\$\(['"]([^'"]+)['"]\)/g)) assert(html.includes(`id="${match[1]}"`), `Missing DOM target ${match[1]}`);
const zip = await file(`website-dist/agent-atlas-v${metadata.dataVersion}.zip`);
assert.equal(zip.readUInt32LE(0), 0x04034b50);
assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50);
assert.equal(zip.readUInt16LE(zip.length - 12), dataNames.length + 3 + 1 + (await readdir(resolve(root,'assets/icons'))).length + (await readdir(resolve(root,'licenses'))).length);
for(const name of ['commercial.json','commercial-schema.json','providers.json','providers-schema.json','provider-evidence.json'])assert(zip.includes(Buffer.from(name)), `Missing ZIP entry: ${name}`);
assert((await file('website-dist/dataset.csv')).toString().startsWith('\uFEFF'));
const csvHeader = (await file('website-dist/dataset.csv')).toString().split('\r\n')[0];
assert(!csvHeader.includes('"web_url"'), 'Removed Web entry URL must not be exported');
assert(csvHeader.includes('"web_domains"'), 'Application domains must remain in CSV');
console.log('PASS: website data, SVG and license source parity; CSV/ZIP exports, version, local links and DOM targets');

assert((await file('website-dist/open-source.csv')).toString().startsWith('\uFEFF'));
assert((await file('website-dist/providers.csv')).toString().startsWith('\uFEFF'));

const trendConfig = JSON.parse((await file('website-dist/trends-config.json')).toString());
assert.deepEqual(trendConfig, JSON.parse((await file('website/trends-config.json')).toString()), 'Trend config source parity');
assert(trendConfig.apiBaseUrl === null || (typeof trendConfig.apiBaseUrl === 'string' && new URL(trendConfig.apiBaseUrl).protocol === 'https:'));
assert(html.includes('Agent Atlas'));
assert(!appJs.includes('Commons Clause') && !appJs.includes('animate-ui'), 'Removed component code must not ship');
