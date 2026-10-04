import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const html = await read('website/index.html');
const source = await read('website/app.js');
const dataset = JSON.parse(await read('data/dataset.json'));
const evidence = JSON.parse(await read('data/evidence.json'));
const collections = JSON.parse(await read('data/collections.json'));
// Deliberately a DOM logic harness, not a substitute for browser layout/focus QA.
class Element {
  constructor(tag='div', cls='', text='') { this.tagName=tag; this.children=[]; this.className=cls; this.textContent=text; this.value=''; this.checked=false; this.hidden=false; this.open=false; this.style={}; this.attributes={}; this.events={}; }
  append(...nodes) { for(const node of nodes) this.children.push(...(node.tagName==='fragment'?node.children:[node])); }
  replaceChildren(...nodes) { this.children=[]; this.append(...nodes); }
  setAttribute(k,v) { this.attributes[k]=v; }
  addEventListener(k,v) { this.events[k]=v; }
  showModal() { this.open=true; }
  close() { this.open=false; }
  click() { this.onclick?.(); }
}
async function setup() {
  const nodes = Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(([,id])=>[id,new Element()]));
  const files={'dataset.json':dataset,'evidence.json':evidence,'collections.json':collections};
  const context=vm.createContext({document:{getElementById:id=>nodes[id],createElement:tag=>new Element(tag),createDocumentFragment:()=>new Element('fragment')},Option:class extends Element{constructor(text,value){super('option','',text);this.value=value}},fetch:async name=>({ok:true,json:async()=>files[name]}),URL,Blob,setTimeout});
  vm.runInContext(source,context);await new Promise(resolve=>setTimeout(resolve,0));
  return {nodes,context,run:s=>vm.runInContext(s,context)};
}
test('website cards preserve the canonical records, SVG status and data-driven filters',async()=>{
  const {nodes,run}=await setup();
  assert.equal(nodes.rows.children.length,212);
  assert(nodes.rows.children.every(x=>x.tagName==='article'));
  for(const [id,key,array]of [['type','type',false],['platform','platforms',true],['vendor','vendor_id',false],['interface','interfaces',true],['edition','edition',false]]) {
    const value=nodes[id].children[0].value;nodes[id].value=value;run('render()');
    assert.equal(nodes.rows.children.length,dataset.filter(x=>array?x[key].includes(value):x[key]===value).length);
    nodes.reset.click();assert.equal(nodes.rows.children.length,212);
  }
  nodes.svgOnly.checked=true;run('render()');assert.equal(nodes.rows.children.length,dataset.filter(x=>x.icon.endsWith('.svg')).length);
  assert(nodes.rows.children.every(x=>x.children[2].children[1].tagName==='a'));
  nodes.reset.click();assert(nodes.rows.children.some(x=>x.children[2].children[1].className==='missing'));
});
test('website search, no-results reset and collection state remain consistent',async()=>{
  const {nodes,run}=await setup();
  for(const field of ['name','vendor','aliases']) {
    const app=dataset.find(x=>field!=='aliases'||x.aliases.length);nodes.search.value=field==='aliases'?app.aliases[0]:app[field];run('render()');assert(nodes.rows.children.length>0);nodes.reset.click();
  }
  nodes.search.value='zzzz-nonexistent-98345';run('render()');assert.equal(nodes.rows.children.length,0);assert.equal(nodes.empty.hidden,false);
  nodes.emptyReset.click();assert.equal(nodes.rows.children.length,212);assert.equal(nodes.empty.hidden,true);
  nodes.agentCollection.click();assert.equal(nodes.rows.children.length,collections.chinese_agents.length);assert.equal(nodes.agentCollection.attributes['aria-pressed'],'true');
  nodes.reset.click();assert.equal(nodes.allCollection.attributes['aria-pressed'],'true');assert.equal(nodes.rows.children.length,212);
});
test('website details and schema support repeated open/close without stale content',async()=>{
  const {nodes,run}=await setup();
  for(let i=0;i<3;i++) {run(`detail(apps[${i}])`);assert.equal(nodes.details.open,true);assert.equal(nodes.detailContent.children[0].children[1].children[0].textContent,dataset[i].name);assert(nodes.detailContent.children.some(x=>x.className==='evidence'));nodes.closeDetails.click();assert.equal(nodes.details.open,false);}
  nodes.schemaButton.click();assert.equal(nodes.schema.open,true);nodes.closeSchema.click();assert.equal(nodes.schema.open,false);
  assert(html.includes('aria-labelledby="detailTitle"'));assert(html.includes('aria-labelledby="schemaTitle"'));
  const css=await read('website/style.css');assert(css.includes('prefers-reduced-motion:reduce'));assert(css.includes('grid-template-columns:repeat(4'));assert(css.includes('grid-template-columns:repeat(3'));assert(css.includes('grid-template-columns:minmax(0,1fr)'));
});
