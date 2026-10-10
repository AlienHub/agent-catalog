import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
export async function validateCommercial(apps) {
 const root=new URL('../data/',import.meta.url);
 const entries=JSON.parse(await readFile(new URL('commercial.json',root),'utf8'));
 const schema=JSON.parse(await readFile(new URL('commercial-schema.json',root),'utf8'));
 const ids=new Set(apps.map(a=>a.id));
 for(const[id,entry]of Object.entries(entries)){
  assert(ids.has(id),`Unknown commercial record: ${id}`);
  assert.deepEqual(Object.keys(entry).sort(),[...schema.additionalProperties.required].sort(),`Commercial fields: ${id}`);
  assert(schema.additionalProperties.properties.offer.enum.includes(entry.offer),`Commercial offer: ${id}`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(entry.verified_at)&&Number.isFinite(Date.parse(entry.verified_at)),`Commercial date: ${id}`);
  assert(typeof entry.notes==='string'&&entry.notes.trim(),`Commercial scope: ${id}`);
  assert(Array.isArray(entry.sources)&&entry.sources.length,`Commercial evidence: ${id}`);
  for(const source of entry.sources){
   assert.deepEqual(Object.keys(source).sort(),['title','url']);
   const url=new URL(source.url);assert.equal(url.protocol,'https:');assert(!url.username&&!url.password);
   assert(typeof source.title==='string'&&source.title.trim(),`Commercial source title: ${id}`);
  }
 }
 return entries;
}
