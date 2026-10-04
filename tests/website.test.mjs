import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { JSDOM, VirtualConsole } from '../website/node_modules/jsdom/lib/api.js';
import { buildWebsiteClient } from '../website/build.mjs';
import { createDialogController } from '../website/dialog-controller.js';
const root=new URL('../',import.meta.url),read=name=>readFile(new URL(name,root),'utf8');
const apps=JSON.parse(await read('data/dataset.json'));
const files=Object.fromEntries(await Promise.all(['dataset','evidence','collections'].map(async k=>[k+'.json',JSON.parse(await read('data/'+k+'.json'))])));
const dir=await mkdtemp(path.join(tmpdir(),'catalog-ui-'));await buildWebsiteClient(path.join(dir,'app.js'));const bundle=await readFile(path.join(dir,'app.js'),'utf8');await rm(dir,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function setup(failure=false){
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM((await read('website/index.html')).replace('<link rel="stylesheet" href="style.css">','<style>'+(await read('website/style.css'))+'</style>'),{runScripts:'outside-only',pretendToBeVisual:true,url:'https://catalog.test/',virtualConsole:vc});
 const w=dom.window;const downloads=[],blobs=new Map();let blobId=0;const BlobBase=w.Blob;w.Blob=class extends BlobBase{constructor(parts,options){super(parts,options);this.parts=parts}};w.URL.createObjectURL=blob=>{const key='blob:catalog-'+(++blobId);blobs.set(key,blob);return key};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){downloads.push({href:this.href,name:this.download,blob:blobs.get(this.href)})};
 w.matchMedia=query=>({matches:query.includes('prefers-reduced-motion'),addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
 w.fetch=async name=>({ok:!failure,json:async()=>files[name]});
 w.HTMLDialogElement.prototype.showModal=function(){this._returnFocus=w.document.activeElement;this.open=true;this.querySelector('button')?.focus()};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this._returnFocus?.focus()};
 w.eval(bundle);for(let i=0;i<50&&!w.document.querySelector(failure?'#error':'article');i++)await wait(10);
 const $=id=>w.document.getElementById(id),count=()=>w.document.querySelectorAll('.app-card').length;
 const change=async(id,value)=>{const el=$(id),prop=el.type==='checkbox'?'checked':'value';const descriptor=Object.getOwnPropertyDescriptor(el.tagName==='SELECT'?w.HTMLSelectElement.prototype:w.HTMLInputElement.prototype,prop);descriptor.set.call(el,value);el.dispatchEvent(new w.Event(el.tagName==='SELECT'||prop==='checked'?'change':'input',{bubbles:true}));await wait(25)};
 const click=async el=>{(typeof el==='string'?$(el):el).click();await wait(25)};
 return {dom,w,$,count,change,click,errors,downloads};
}
test('React catalog preserves records, all filters, searches, collection and empty/reset',async()=>{
 const t=await setup();try{
 assert.equal(t.count(),212);
 for(const[id,key,array]of [['type','type',false],['platform','platforms',true],['vendor','vendor_id',false],['interface','interfaces',true],['edition','edition',false]]){const value=t.$(id).options[1].value;await t.change(id,value);assert.equal(t.count(),apps.filter(a=>array?a[key].includes(value):a[key]===value).length);await t.click('reset');assert.equal(t.count(),212)}
 for(const field of ['name','vendor','aliases']){const app=apps.find(a=>field!=='aliases'||a.aliases.length);await t.change('search',field==='aliases'?app.aliases[0]:app[field]);assert(t.count()>0);await t.click('reset')}
 await t.change('search','zzzz-nonexistent-87234');assert.equal(t.count(),0);assert(!t.$('empty').hidden);await t.click('emptyReset');assert.equal(t.count(),212);
 // React checkbox change is driven by a click, just as a user toggles it.
 await t.click('svgOnly');assert.equal(t.count(),apps.filter(a=>a.icon.endsWith('.svg')).length);assert.equal(t.w.document.querySelectorAll('.missing').length,0);await t.click('reset');
 await t.click('agentCollection');assert.equal(t.count(),files['collections.json'].chinese_agents.length);assert.equal(t.$('agentCollection').getAttribute('aria-pressed'),'true');await t.click('reset');
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 }finally{t.dom.window.close()}
});
test('details preserve selected record during filters, repeated open/close, cancel and schema',async()=>{
 const t=await setup();try{const button=t.w.document.querySelector('.appname');const name=button.textContent;
 for(let i=0;i<3;i++){await t.click(button);assert(t.$('details').open);assert.equal(t.$('detailTitle').textContent,name);assert(t.$('detailContent').textContent.includes('来源与核验'));await t.click('closeDetails');assert(!t.$('details').open)}
 await t.click(button);await t.change('vendor',t.$('vendor').options[2].value);assert(t.$('details').open);assert.equal(t.$('detailTitle').textContent,name);
 const cancel=new t.w.Event('cancel',{cancelable:true});t.$('details').dispatchEvent(cancel);await wait(25);assert(cancel.defaultPrevented);assert(!t.$('details').open);
 await t.click('schemaButton');assert(t.$('schema').open);await t.click('closeSchema');assert(!t.$('schema').open);
 }finally{t.dom.window.close()}
});
test('base layout and scoped dropdown computed styles prevent button/input/checkbox regression',async()=>{
 const t=await setup();try{const css=el=>t.w.getComputedStyle(el);
 assert.equal(css(t.w.document.querySelector('header')).display,'flex');assert.equal(css(t.w.document.querySelector('main')).maxWidth,'1480px');assert.equal(css(t.w.document.querySelector('.tools')).display,'grid');assert.equal(css(t.w.document.querySelector('.search')).display,'flex');
 assert.equal(css(t.$('type')).height,'34px');assert(css(t.$('type')).backgroundImage.includes('data:image/svg+xml'));assert.equal(css(t.$('type')).paddingRight,'33px');
 for(const el of [t.$('jsonExport'),t.$('search'),t.$('svgOnly')]){assert(!css(el).backgroundImage.includes('data:image/svg+xml'));assert.notEqual(css(el).height,'34px')}
 assert.equal(css(t.$('svgOnly')).width,'15px');assert.equal(css(t.$('svgOnly')).height,'15px');
 const card=t.w.document.querySelector('.app-card'),bottom=card.querySelector('.card-bottom');assert.equal(css(card).paddingLeft,'0px');assert.equal(css(card).overflow,'hidden');assert.equal(css(bottom).borderRadius,'0px');assert.equal(css(bottom).marginLeft,'0px');
 assert.equal(css(t.w.document.documentElement).getPropertyValue('--accent'),'#414246');assert.equal(css(t.$('type')).appearance,'none');
 }finally{t.dom.window.close()}
});
test('generation-guarded dialog transitions cannot close a reopened dialog or restore stale state',async()=>{
 const motions=[];let closeCount=0,callback=0;
 const dialog={open:false,style:{},showModal(){this.open=true},close(){this.open=false;closeCount++}};
 const animate=()=>{let resolve;const p=new Promise(r=>resolve=r);p.stop=()=>{};motions.push({p,resolve});return p};
 const c=createDialogController(dialog,animate,()=>false);
 const opening=c.setOpen(true);motions[0].resolve();await opening;
 const closing=c.setOpen(false,()=>callback++);const reopening=c.setOpen(true);motions[1].resolve();await closing;assert(dialog.open);assert.equal(callback,0);assert.equal(closeCount,0);
 motions[2].resolve();await reopening;const finalClose=c.setOpen(false,()=>callback++);motions[3].resolve();await finalClose;assert(!dialog.open);assert.equal(callback,1);
 const more=c.setOpen(true);c.destroy();motions[4].resolve();await more;assert(!dialog.open);
});
test('reduced-motion controller is immediate and error state disables exports',async()=>{
 let animated=false;const d={open:false,style:{},showModal(){this.open=true},close(){this.open=false}};const c=createDialogController(d,()=>{animated=true},()=>true);await c.setOpen(true);assert(d.open);await c.setOpen(false);assert(!d.open);assert(!animated);
 const t=await setup(true);try{await wait(30);assert(!t.$('error').hidden);assert(t.$('jsonExport').disabled);assert(t.$('csvExport').disabled)}finally{t.dom.window.close()}
});

test('filtered JSON/CSV and original SVG/ZIP downloads keep exact records and filenames',async()=>{
 const t=await setup();try{
 const value=t.$('vendor').options[1].value;await t.change('vendor',value);const expected=apps.filter(a=>a.vendor_id===value);
 await t.click('jsonExport');assert.deepEqual(JSON.parse(t.downloads.at(-1).blob.parts[0]),expected);assert.equal(t.downloads.at(-1).name,'ai-applications.json');
 await t.click('csvExport');const csv=t.downloads.at(-1).blob.parts[0];assert(csv.startsWith('\uFEFF'));assert.equal(csv.split('\r\n').length,expected.length+1);assert.equal(t.downloads.at(-1).name,'ai-applications.csv');
 await t.click('reset');const svg=t.w.document.querySelector('.assetlink');assert(svg.getAttribute('href').endsWith('.svg'));assert(svg.download.endsWith('.svg'));assert(t.w.document.querySelector('.exports a[download]').getAttribute('href').endsWith('.zip'));assert(t.w.document.querySelector('footer a[href="dataset.csv"][download]'));
 }finally{t.dom.window.close()}
});
