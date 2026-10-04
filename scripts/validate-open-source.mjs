import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
export async function validateOpenSource(apps) {
 const root=new URL('../data/',import.meta.url);
 const metadata=JSON.parse(await readFile(new URL('open-source.json',root),'utf8'));
 const schema=JSON.parse(await readFile(new URL('open-source-schema.json',root),'utf8'));
 const ids=new Set(apps.map(a=>a.id));const required=schema.additionalProperties.required;
 const url=value=>{assert.equal(typeof value,'string');assert.equal(new URL(value).protocol,'https:')};
 for(const[id,entry]of Object.entries(metadata)) {
  assert(ids.has(id),`Unknown source metadata ID: ${id}`);
  assert.deepEqual(Object.keys(entry).sort(),[...required].sort(),`Source metadata keys: ${id}`);
  assert(schema.additionalProperties.properties.source_model.enum.includes(entry.source_model),`Source model: ${id}`);
  assert(schema.additionalProperties.properties.classification.enum.includes(entry.classification),`Classification: ${id}`);
  url(entry.repository_url);url(entry.license_url);assert(typeof entry.license==='string'&&entry.license.length);
  if(entry.source_model==='open-source')assert(['MIT','Apache-2.0','AGPL-3.0','GPL-3.0-or-later'].includes(entry.license),`Review new OSI license expression explicitly: ${id}`);
  assert.equal(typeof entry.notes,'string');assert(entry.sources.length>0);
  for(const source of entry.sources){url(source.url);assert(typeof source.title==='string'&&source.title.length)}
  const maintenance=entry.maintenance,definition=schema.additionalProperties.properties.maintenance;
  assert(definition.properties.status.enum.includes(maintenance.status));assert(/^\d{4}-\d{2}-\d{2}$/.test(maintenance.checked_at));
  for(const key of Object.keys(maintenance))assert(Object.hasOwn(definition.properties,key),`Maintenance field ${key}`);
  if(maintenance.github_archived!==undefined)assert.equal(typeof maintenance.github_archived,'boolean');
  if(maintenance.last_push_at!==undefined)assert(Number.isFinite(Date.parse(maintenance.last_push_at)));
 }
 return metadata;
}
