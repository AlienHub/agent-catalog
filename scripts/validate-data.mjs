import { validateCommercial } from './validate-commercial.mjs';
import { validateOpenSource } from './validate-open-source.mjs';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import assert from 'node:assert/strict';
export const root = fileURLToPath(new URL('../', import.meta.url));
const json = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
export async function validateData() {
  const [apps, evidence, collections, schema, metadata] = await Promise.all(['dataset','evidence','collections','schema','metadata'].map(name => json(`data/${name}.json`)));
  assert(Array.isArray(apps) && apps.length > 0, 'Dataset must be a nonempty array');
  const ids = new Set(); const iconPaths = new Set();
  const expectedKeys = [...schema.items.required].sort();
  const stringFields = expectedKeys.filter(key => !['aliases','platforms','interfaces'].includes(key));
  for (const app of apps) {
    assert.deepEqual(Object.keys(app).sort(), expectedKeys, `Schema keys: ${app.id}`);
    assert(/^[a-z][a-z0-9-]*$/.test(app.id), `Invalid ID: ${app.id}`);
    assert(!ids.has(app.id), `Duplicate ID: ${app.id}`); ids.add(app.id);
    for (const key of stringFields) assert.equal(typeof app[key], 'string', `${app.id}.${key}`);
    for (const key of ['name','vendor','vendor_id','product_id','type','svg_status']) assert(app[key].trim(), `${app.id}.${key} is empty`);
    assert(['http:', 'https:'].includes(new URL(app.website).protocol), `Website URL: ${app.id}`);
    for (const key of ['aliases','platforms','interfaces']) {
      assert(Array.isArray(app[key]) && app[key].every(v => typeof v === 'string' && v.length), `${app.id}.${key}`);
      assert.equal(new Set(app[key]).size, app[key].length, `Duplicate ${app.id}.${key}`);
    }
    assert(!app.name.includes('中国版'), `Use CN edition naming: ${app.id}`);
    assert(!/（(?:Web|GUI|CLI|IDE|IDE 插件)）$/.test(app.name), `Interaction form belongs in interfaces: ${app.id}`);
    assert(!app.platforms.some(p => ['iOS','iPadOS','Android','Mobile'].includes(p)), `Mobile platform outside catalog scope: ${app.id}`);
    assert.equal(app.interfaces.length, 1, `One interaction form per application: ${app.id}`);
    assert(['GUI','CLI','IDE 插件','Web','浏览器插件','小程序'].includes(app.interfaces[0]), `Invalid interaction form: ${app.id}`);
    for (const key of ['chrome_extension_id','edge_extension_id']) {
      assert(/^$|^[a-p]{32}$/.test(app[key]), `Invalid store ID: ${app.id}.${key}`);
      if (app.interfaces[0] !== '浏览器插件') assert.equal(app[key], '', `Store ID only belongs to browser plugins: ${app.id}`);
      if (app[key]) {
        const host = key === 'chrome_extension_id' ? 'chromewebstore.google.com' : 'microsoftedge.microsoft.com';
        assert(evidence[app.id]?.sources.some(s => new URL(s.url).hostname === host && new URL(s.url).pathname.split('/').includes(app[key])), `Missing official store evidence: ${app.id}.${key}`);
      }
    }
    if (app.icon) {
      assert(/^icons\/[a-z0-9-]+\.(?:svg|png)$/.test(app.icon), `Nonportable Logo path: ${app.icon}`);
      if (app.icon.endsWith('.png')) assert(app.svg_status.includes('PNG') && app.svg_status.includes('未收录 SVG'), `PNG format status: ${app.id}`);
      iconPaths.add(app.icon);
    }
    assert(Object.hasOwn(evidence, app.id), `Missing evidence: ${app.id}`);
    const ev = evidence[app.id];
    assert.equal(typeof ev.notes, 'string');
    assert(/^\d{4}-\d{2}-\d{2}$/.test(ev.verified_at), `Evidence date: ${app.id}`);
    assert(ev.sources?.length > 0, `Missing sources: ${app.id}`);
    for (const source of ev.sources) {
      assert(typeof source.title === 'string' && source.title.length, `Source title: ${app.id}`);
      assert(['http:', 'https:'].includes(new URL(source.url).protocol), `Source URL: ${app.id}`);
    }
  }
  assert.deepEqual(Object.keys(evidence).sort(), [...ids].sort(), 'Evidence IDs must exactly match records');
  for (const [name, members] of Object.entries(collections)) {
    assert(Array.isArray(members), `Invalid collection: ${name}`);
    assert.equal(new Set(members).size, members.length, `Duplicate collection IDs: ${name}`);
    for (const id of members) assert(ids.has(id), `Unknown collection ID: ${name}/${id}`);
  }
  const svgs = {}; const pngs = {};
  for (const path of [...iconPaths].sort()) {
    const bytes = await readFile(resolve(root, 'assets', path));
    if (path.endsWith('.png')) {
      assert(bytes.length >= 45 && bytes.length <= 5 * 1024 * 1024, `PNG size: ${path}`);
      assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])), `PNG signature: ${path}`);
      assert.equal(bytes.toString('ascii',12,16), 'IHDR', `PNG header: ${path}`);
      assert.equal(bytes.readUInt32BE(8), 13, `PNG IHDR length: ${path}`);
      assert(bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(16) <= 16384 && bytes.readUInt32BE(20) > 0 && bytes.readUInt32BE(20) <= 16384, `PNG dimensions: ${path}`);
      assert(bytes.subarray(-12).equals(Buffer.from([0,0,0,0,73,69,78,68,174,66,96,130])), `PNG end: ${path}`);
      pngs[path] = `data:image/png;base64,${bytes.toString('base64')}`;
      continue;
    }
    const svg = bytes.toString('utf8');
    assert(/<svg\b/i.test(svg) && /<\/svg\s*>/i.test(svg), `Not an SVG: ${path}`);
    assert(!/<(?:script|foreignObject|image|iframe|object|embed)\b|\bon[a-z]+\s*=|<!ENTITY/i.test(svg), `Active or raster content: ${path}`);
    for (const match of svg.matchAll(/\b(?:href|xlink:href)\s*=\s*["']([^"']*)["']/gi)) assert(match[1].startsWith('#'), `External resource: ${path}`);
    for (const match of svg.matchAll(/\burl\(([^)]*)\)/gi)) assert(/^(?:#|data:font\/truetype;charset=utf-8;base64,)/.test(match[1].trim().replace(/^["']|["']$/g, '')), `External CSS resource: ${path}`);
    svgs[path] = svg;
  }
  assert.deepEqual((await readdir(resolve(root, 'assets/icons'))).filter(name => /\.(svg|png)$/.test(name)).sort(), [...iconPaths].map(path => path.slice(6)).sort(), 'Unreferenced or missing Logo assets');
  assert(Number.isInteger(metadata.schemaVersion) && typeof metadata.dataVersion === 'string');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(metadata.snapshotDate));
  await validateOpenSource(apps);
  await validateCommercial(apps);
  return { apps, evidence, collections, metadata, svgs, pngs };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { apps, svgs, pngs } = await validateData();
  console.log(`Validated ${apps.length} records, ${new Set(apps.map(app => app.product_id)).size} products, ${Object.keys(svgs).length} SVG / ${Object.keys(pngs).length} PNG assets`);
}
