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
    for (const key of ['name','vendor','vendor_id','product_id','type','edition','svg_status']) assert(app[key].trim(), `${app.id}.${key} is empty`);
    assert(['http:', 'https:'].includes(new URL(app.website).protocol), `Website URL: ${app.id}`);
    for (const key of ['aliases','platforms','interfaces']) {
      assert(Array.isArray(app[key]) && app[key].every(v => typeof v === 'string' && v.length), `${app.id}.${key}`);
      assert.equal(new Set(app[key]).size, app[key].length, `Duplicate ${app.id}.${key}`);
    }
    assert.equal(app.interfaces.length, 1, `One interaction form per application: ${app.id}`);
    assert(['GUI','CLI','IDE 插件','Web','浏览器插件','小程序'].includes(app.interfaces[0]), `Invalid interaction form: ${app.id}`);
    if (app.icon) {
      assert(/^icons\/[a-z0-9-]+\.svg$/.test(app.icon), `Nonportable SVG path: ${app.icon}`);
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
  const svgs = {};
  for (const path of [...iconPaths].sort()) {
    const svg = await readFile(resolve(root, 'assets', path), 'utf8');
    assert(/<svg\b/i.test(svg) && /<\/svg\s*>/i.test(svg), `Not an SVG: ${path}`);
    assert(!/<(?:script|foreignObject|image|iframe|object|embed)\b|\bon[a-z]+\s*=|<!ENTITY/i.test(svg), `Active or raster content: ${path}`);
    for (const match of svg.matchAll(/\b(?:href|xlink:href)\s*=\s*["']([^"']*)["']/gi)) assert(match[1].startsWith('#'), `External resource: ${path}`);
    for (const match of svg.matchAll(/\burl\(([^)]*)\)/gi)) assert(/^(?:#|data:font\/truetype;charset=utf-8;base64,)/.test(match[1].trim().replace(/^["']|["']$/g, '')), `External CSS resource: ${path}`);
    svgs[path] = svg;
  }
  assert.deepEqual((await readdir(resolve(root, 'assets/icons'))).filter(name => name.endsWith('.svg')).sort(), [...iconPaths].map(path => path.slice(6)).sort(), 'Unreferenced or missing SVG assets');
  assert(Number.isInteger(metadata.schemaVersion) && typeof metadata.dataVersion === 'string');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(metadata.snapshotDate));
  await validateOpenSource(apps);
  await validateCommercial(apps);
  return { apps, evidence, collections, metadata, svgs };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { apps, svgs } = await validateData();
  console.log(`Validated ${apps.length} records, ${new Set(apps.map(app => app.product_id)).size} products, ${Object.keys(svgs).length} SVG assets`);
}
