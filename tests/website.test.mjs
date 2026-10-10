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
const files=Object.fromEntries(await Promise.all(['dataset','evidence','collections','open-source','commercial'].map(async k=>[k+'.json',JSON.parse(await read('data/'+k+'.json'))])));
const dir=await mkdtemp(path.join(tmpdir(),'catalog-ui-'));await buildWebsiteClient(path.join(dir,'app.js'));const bundle=await readFile(path.join(dir,'app.js'),'utf8');await rm(dir,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function setup(failure=false, trendResponses={}){
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM((await read('website/index.html')).replace('<link rel="stylesheet" href="style.css">','<style>'+(await read('website/style.css'))+'</style>'),{runScripts:'outside-only',pretendToBeVisual:true,url:'https://catalog.test/',virtualConsole:vc});
 const responses={...files,'trends-config.json':{apiBaseUrl:null},...trendResponses};
 const w=dom.window;const downloads=[],blobs=new Map();let blobId=0;const BlobBase=w.Blob;w.Blob=class extends BlobBase{constructor(parts,options){super(parts,options);this.parts=parts}};w.URL.createObjectURL=blob=>{const key='blob:catalog-'+(++blobId);blobs.set(key,blob);return key};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){downloads.push({href:this.href,name:this.download,blob:blobs.get(this.href)})};
 w.matchMedia=query=>({matches:query.includes('prefers-reduced-motion'),addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
 w.fetch=async name=>({ok:!failure&&responses[name]!==undefined,status:responses[name]!==undefined?200:503,json:async()=>responses[name]});
 w.HTMLDialogElement.prototype.showModal=function(){this._returnFocus=w.document.activeElement;this.open=true;this.querySelector('button')?.focus()};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this._returnFocus?.focus()};
 w.eval(bundle);for(let i=0;i<50&&!w.document.querySelector(failure?'#error':'article');i++)await wait(10);
 const $=id=>w.document.getElementById(id),count=()=>w.document.querySelectorAll('.app-card').length;
 const change=async(id,value)=>{const el=$(id),prop=el.type==='checkbox'?'checked':'value';const descriptor=Object.getOwnPropertyDescriptor(el.tagName==='SELECT'?w.HTMLSelectElement.prototype:w.HTMLInputElement.prototype,prop);descriptor.set.call(el,value);el.dispatchEvent(new w.Event(el.tagName==='SELECT'||prop==='checked'?'change':'input',{bubbles:true}));await wait(25)};
 const click=async el=>{(typeof el==='string'?$(el):el).click();await wait(25)};
 return {dom,w,$,count,change,click,errors,downloads};
}
test('React catalog preserves records, all filters, searches and empty/reset',async()=>{
 const t=await setup();try{
 assert.equal(t.count(),279);
 for(const[id,key,array]of [['type','type',false],['platform','platforms',true],['vendor','vendor_id',false],['interface','interfaces',true],['edition','edition',false]]){const value=t.$(id).options[1].value;await t.change(id,value);assert.equal(t.count(),apps.filter(a=>array?a[key].includes(value):a[key]===value).length);await t.click('reset');assert.equal(t.count(),279)}
 for(const field of ['name','vendor','aliases']){const app=apps.find(a=>field!=='aliases'||a.aliases.length);await t.change('search',field==='aliases'?app.aliases[0]:app[field]);assert(t.count()>0);await t.click('reset')}
 await t.change('search','zzzz-nonexistent-87234');assert.equal(t.count(),0);assert(!t.$('empty').hidden);await t.click('emptyReset');assert.equal(t.count(),279);
 // React checkbox change is driven by a click, just as a user toggles it.
 await t.click('svgOnly');assert.equal(t.count(),apps.filter(a=>a.icon.endsWith('.svg')).length);assert.equal(t.w.document.querySelectorAll('.missing').length,0);await t.click('reset');
 assert.equal(t.$('agentCollection'),null);assert(!t.w.document.body.textContent.includes('中国厂商'));assert.equal(t.$('openSourceOnly'),null);
 assert.equal(t.errors.length,0,t.errors.join('\n'));
 }finally{t.dom.window.close()}
});
test('historical and maintenance-mode additions show lifecycle warnings in cards and details',async()=>{
 const t=await setup();try{
 for(const[name,notice]of [['iFlow CLI','2026-04-17'],['Roo Code','2026-05-15'],['Tabnine CLI','2026-12-31']]){
  await t.change('search',name);
  const card=[...t.w.document.querySelectorAll('.app-card')].find(el=>el.querySelector('.appname').textContent===name);
  assert(card);assert(card.querySelector('.lifecycle').textContent.includes(notice));
  await t.click(card.querySelector('.appname'));
  assert(t.$('detailContent').querySelector('.lifecycle').textContent.includes(notice));
  t.$('details').dispatchEvent(new t.w.Event('cancel',{cancelable:true}));await wait(25);
 }
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
 await t.click('jsonExport');assert.deepEqual(JSON.parse(t.downloads.at(-1).blob.parts[0]),expected);assert.equal(t.downloads.at(-1).name,'agent-atlas.json');
 await t.click('csvExport');const csv=t.downloads.at(-1).blob.parts[0];assert(csv.startsWith('\uFEFF'));assert.equal(csv.split('\r\n').length,expected.length+1);assert.equal(t.downloads.at(-1).name,'agent-atlas.csv');
 await t.click('reset');const svg=t.w.document.querySelector('.assetlink');assert(svg.getAttribute('href').endsWith('.svg'));assert(svg.download.endsWith('.svg'));assert(t.w.document.querySelector('.exports a[download]').getAttribute('href').endsWith('.zip'));assert(t.w.document.querySelector('footer a[href="dataset.csv"][download]'));
 }finally{t.dom.window.close()}
});

test('header uses the unchanged brand asset with versioned favicon reference and contained size',async()=>{
 const t=await setup();try{const brand=t.w.document.querySelector('header img.brandmark');assert(brand);assert.equal(brand.getAttribute('src'),'favicon.svg?v=__BRAND_HASH__');assert.equal(brand.getAttribute('aria-hidden'),'true');const style=t.w.getComputedStyle(brand);assert.equal(style.width,'34px');assert.equal(style.height,'34px');assert.equal(style.objectFit,'contain');assert.equal(t.w.document.querySelector('link[rel="icon"]').getAttribute('type'),'image/svg+xml');assert(!brand.getAttribute('src').includes('icons/'));}finally{t.dom.window.close()}
});

test('verified open-source filtering is variant-specific and excludes source-available',async()=>{
 const t=await setup();try{await t.click('openSourceCollection');const eligible=Object.entries(files['open-source.json']).filter(([,v])=>v.source_model==='open-source').map(([id])=>id);assert.equal(t.count(),eligible.length);assert(![...t.w.document.querySelectorAll('.appname')].some(el=>el.textContent==='Dify'));await t.change('interface','CLI');assert.equal(t.count(),apps.filter(a=>eligible.includes(a.id)&&a.interfaces.includes('CLI')).length);await t.click('reset');assert.equal(t.count(),apps.length);assert.equal(t.$('allCollection').getAttribute('aria-pressed'),'true');
 await t.change('search','openclaw-cli');assert.equal(t.count(),1);await t.click(t.w.document.querySelector('.appname'));const text=t.$('detailContent').textContent;assert(text.includes('MIT'));assert(text.includes('维护状态待确认'));assert(t.$('detailContent').querySelector('a[href="https://github.com/openclaw/openclaw"]'));await t.click('closeDetails');await t.click('reset');
 await t.change('search','dify');await t.click(t.w.document.querySelector('.appname'));assert(t.$('detailContent').textContent.includes('源码可见（非 OSI 开源）'));await t.click('closeDetails');await t.click('reset');
 await t.change('search','chatgpt');await t.click(t.w.document.querySelector('.appname'));assert(t.$('detailContent').textContent.includes('未标注不代表闭源'));
 }finally{t.dom.window.close()}
});

test('open-source and commercial filters are independent, with evidence and record-specific scope',async()=>{
 const t=await setup();try{
 await t.click('commercialCollection');assert.equal(t.count(),Object.keys(files['commercial.json']).length);
 for(const id of ['chatgpt','claude','cursor','codex-cli','zed']){await t.change('search',id);assert(t.count()>0,id);await t.change('search','')}
 await t.change('search','chatgpt');await t.click(t.w.document.querySelector('.appname'));const commercial=t.w.document.querySelector('.commercial-info');assert(commercial.textContent.includes('2026-10-05'));assert(commercial.querySelector('a[href="https://chatgpt.com/pricing/"]'));await t.click('closeDetails');await t.click('reset');
 await t.change('search','zed');const tags=t.w.document.querySelector('.card-tags').textContent;assert(tags.includes('开源'));assert(tags.includes('商业'));await t.click('openSourceCollection');assert.equal(t.count(),1);await t.click('commercialCollection');assert.equal(t.count(),1);await t.click('reset');
 await t.change('search','qoder-cn-cli');await t.click('commercialCollection');assert.equal(t.count(),0);await t.click('unknownCollection');assert.equal(t.count(),1);await t.click('reset');
 await t.click('unknownCollection');assert.equal(t.count(),apps.filter(a=>files['open-source.json'][a.id]?.source_model!=='open-source'&&!files['commercial.json'][a.id]).length);await t.click('reset');assert.equal(t.count(),apps.length);
 assert.equal(t.$('commercialCollection').textContent,'商业');assert.equal(t.$('unknownCollection').textContent,'未知');
 }finally{t.dom.window.close()}
});

test('source-available licensing alone never infers a commercial service',async()=>{
 const t=await setup(false,{'commercial.json':{}});try{await t.click('commercialCollection');assert.equal(t.count(),0);await t.click('unknownCollection');await t.change('search','dify');assert.equal(t.count(),1);assert(t.w.document.querySelector('.card-tags').textContent.includes('未知'));}finally{t.dom.window.close()}
});

test('Agent Atlas branding and project-owned action buttons retain native semantics',async()=>{
 const t=await setup();try{assert(t.w.document.querySelector('header .brand').textContent.includes('Agent Atlas'));assert(t.w.document.title.includes('Agent Atlas'));assert.equal(t.$('jsonExport').tagName,'BUTTON');assert.equal(t.$('jsonExport').type,'button');assert(!t.$('jsonExport').disabled);const source=await read('website/catalog.jsx');assert(!source.includes('animate-ui'));const notice=await read('website/website-notices.txt');assert(!notice.includes('Commons Clause'));assert(notice.includes('react 19.2.0'));assert(notice.includes('motion 14.0.0'));}finally{t.dom.window.close()}
});

test('disconnected trend service is explicit and never renders invented measurements',async()=>{
 const t=await setup();try{await t.change('search','openclaw-cli');await t.click(t.w.document.querySelector('.appname'));await new Promise(r=>setTimeout(r,30));const section=t.w.document.querySelector('.repository-trends');assert(section.textContent.includes('尚未连接采集服务'));assert.equal(section.querySelectorAll('.trend-chart,.trend-stats').length,0);}finally{t.dom.window.close()}
});

test('connected trends show observed samples, null growth and gaps without inventing history',async()=>{
 const prefix='https://metrics.example.test/v1/repos/openclaw/openclaw';const t=await setup(false,{'trends-config.json':{apiBaseUrl:'https://metrics.example.test'},[prefix+'/metrics']:{stars:120,forks:5,observed_at:'2026-10-04T00:00:00Z',stale:true,growth:{'7d':null,'30d':null},activity:{status:'pending'},last_release:null,last_commit_at:null},[prefix+'/history?days=30']:{source:'daily_snapshots',points:[{date:'2026-10-01',stars:110,forks:4},{date:'2026-10-02',stars:115,forks:4},{date:'2026-10-04',stars:120,forks:5}],missing_data:true}});try{await t.change('search','openclaw-cli');await t.click(t.w.document.querySelector('.appname'));await new Promise(r=>setTimeout(r,30));const section=t.w.document.querySelector('.repository-trends');assert(section.textContent.includes('120'));assert(section.textContent.includes('数据积累中'));assert(section.textContent.includes('GitHub正在生成'));assert.equal(section.querySelectorAll('circle').length,3);assert.equal(section.querySelectorAll('polyline').length,1);assert.equal(section.querySelectorAll('tbody tr').length,3);assert(!section.textContent.includes('2026-10-03'));}finally{t.dom.window.close()}
});
test('service failures are unavailable states rather than zero-valued charts',async()=>{
 const t=await setup(false,{'trends-config.json':{apiBaseUrl:'https://metrics.example.test'}});try{await t.change('search','openclaw-cli');await t.click(t.w.document.querySelector('.appname'));await new Promise(r=>setTimeout(r,30));const section=t.w.document.querySelector('.repository-trends');assert(section.textContent.includes('采集服务暂不可用'));assert.equal(section.querySelectorAll('.trend-chart,.trend-stats').length,0);}finally{t.dom.window.close()}
});

test('switching repositories ignores late metrics from the previous selection',async()=>{
 let releaseMetrics,releaseHistory;const oldMetrics=new Promise(r=>releaseMetrics=r),oldHistory=new Promise(r=>releaseHistory=r);const base='https://metrics.example.test/v1/repos';const metric=stars=>({stars,forks:1,observed_at:'2026-10-04T00:00:00Z',growth:{'7d':null,'30d':null},activity:{status:'pending'}});const emptyHistory={source:'daily_snapshots',points:[]};
 const t=await setup(false,{'trends-config.json':{apiBaseUrl:'https://metrics.example.test'},[base+'/openclaw/openclaw/metrics']:oldMetrics,[base+'/openclaw/openclaw/history?days=30']:oldHistory,[base+'/aaif-goose/goose/metrics']:metric(5),[base+'/aaif-goose/goose/history?days=30']:emptyHistory});try{await t.change('search','openclaw-cli');await t.click(t.w.document.querySelector('.appname'));await t.click('closeDetails');await t.change('search','goose-cli');await t.click(t.w.document.querySelector('.appname'));await new Promise(r=>setTimeout(r,25));releaseMetrics(metric(999));releaseHistory(emptyHistory);await new Promise(r=>setTimeout(r,25));const section=t.w.document.querySelector('.repository-trends');assert(!section.textContent.includes('999'));assert.equal(section.querySelector('.trend-stats strong').textContent,'5');}finally{t.dom.window.close()}
});

test('unified Cloudflare config requests metrics on the authenticated website origin',async()=>{
 const prefix='https://catalog.test/v1/repos/openclaw/openclaw';
 const t=await setup(false,{'trends-config.json':{apiBaseUrl:'same-origin'},[prefix+'/metrics']:{stars:8,forks:2,growth:{'7d':null,'30d':null},activity:{status:'pending'}},[prefix+'/history?days=30']:{source:'daily_snapshots',points:[]}});
 try{await t.change('search','openclaw-cli');await t.click(t.w.document.querySelector('.appname'));await new Promise(r=>setTimeout(r,30));const section=t.w.document.querySelector('.repository-trends');assert.equal(section.querySelector('.trend-stats strong').textContent,'8');assert(section.textContent.includes('历史数据积累中'));}finally{t.dom.window.close()}
});
