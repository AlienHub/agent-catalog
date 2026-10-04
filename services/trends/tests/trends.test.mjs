import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker,{collect,metrics,refresh,shardNames} from '../src/worker.js';
import {summarize,normalizeRepo,readActivity,DAY} from '../src/core.js';
const now=Date.parse('2026-10-04T03:17:00Z');
function db() {
  const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../migrations/0001_init.sql',import.meta.url),'utf8'));
  return {sqlite,prepare(sql){return {bind(...args){return {async first(){return sqlite.prepare(sql).get(...args)??null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){return sqlite.prepare(sql).run(...args);}};}};},async batch(statements){sqlite.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());sqlite.exec('COMMIT');return r;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
}
function mock({stars=100,id=7,activity=200,privateRepo=false,fail=null}={}) {
  const calls=[];const fn=async url=>{calls.push(url);if(fail)return new Response('{}',{status:fail});
    if(url.endsWith('/stats/commit_activity'))return new Response(activity===200?JSON.stringify([{week:1700000000,total:3,days:[0,1,2,0,0,0,0]}]):null,{status:activity});
    if(url.endsWith('/stargazers/count'))return Response.json({count:stars});
    if(url.includes('/commits?'))return Response.json([{commit:{committer:{date:'2026-10-03T00:00:00Z'}},author:{login:'NOT_STORED'}}]);
    if(url.endsWith('/releases/latest'))return new Response('{}',{status:404});
    return Response.json({id,private:privateRepo,full_name:'openai/codex',forks_count:8,owner:{login:'NOT_STORED'}});
  };fn.calls=calls;return fn;
}
test('URL normalization is case-insensitive and rejects traversal',()=>{assert.equal(normalizeRepo('https://github.com/OpenAI/Codex.git'),'openai/codex');assert.throws(()=>normalizeRepo('openai/codex/../../foo'));});
test('missing history is null, never synthetic zero',()=>{assert.deepEqual(summarize([],now).growth,{'7d':null,'30d':null});assert.equal(summarize([],now).status,'accumulating');});
test('net delta uses exact UTC endpoints and allows negative growth',()=>{const p=[{date:'2026-10-04',stars:90},{date:'2026-09-27',stars:100},{date:'2026-09-04',stars:80}];assert.deepEqual(summarize(p,now).growth,{'7d':-10,'30d':10});assert.equal(summarize(p,now).missing_data,true);});
test('stale endpoint does not masquerade as current growth',()=>{assert.equal(summarize([{date:'2026-10-03',stars:20},{date:'2026-09-26',stars:10}],now).growth['7d'],null);});
test('202 activity is pending with delayed retry and empty data',async()=>{const p=await readActivity('openai/codex',{},mock({activity:202}),now);assert.equal(p.status,'pending');assert.deepEqual(p.weeks,[]);assert.ok(Date.parse(p.retry_after)>=now+60000);});
test('204 activity is unavailable not zero',async()=>{assert.equal((await readActivity('openai/codex',{},mock({activity:204}),now)).status,'unavailable');});
test('ready activity returns aggregate data only',async()=>{const p=await readActivity('openai/codex',{},mock(),now);assert.equal(p.status,'ready');assert.equal(p.weeks[0].total,3);});
test('collector is idempotent and stable-ID deduplicates aliases',async()=>{const DB=db(),env={DB},fetcher=mock();assert.deepEqual(await collect(env,{now,fetcher,names:['openai/codex','old/codex']}),{succeeded:1,failed:0});await collect(env,{now:now+10000,fetcher:mock({stars:999}),names:['openai/codex']});const rows=DB.sqlite.prepare('SELECT * FROM daily_snapshots').all();assert.equal(rows.length,1);assert.equal(rows[0].stars,100);assert.equal(rows[0].repo_id,7);assert.ok(!JSON.stringify(rows).includes('NOT_STORED'));});
test('on-demand refresh never writes daily history',async()=>{const DB=db();await metrics('openai/codex',{DB},{now,fetcher:mock()});assert.equal(DB.sqlite.prepare('SELECT COUNT(*) AS n FROM daily_snapshots').get().n,0);});
test('short cache avoids repeated GitHub requests',async()=>{const DB=db(),fetcher=mock();await metrics('openai/codex',{DB},{now,fetcher});const n=fetcher.calls.length;await metrics('openai/codex',{DB},{now:now+10000,fetcher});assert.equal(fetcher.calls.length,n);});
test('private repositories are never persisted',async()=>{const DB=db();await assert.rejects(refresh('openai/codex',{DB},{now,fetcher:mock({privateRepo:true})}),{status:404});assert.equal(DB.sqlite.prepare('SELECT COUNT(*) AS n FROM repositories').get().n,0);});
test('rate limit preserves cached values with stale flag, not a new snapshot',async()=>{const DB=db();await metrics('openai/codex',{DB},{now,fetcher:mock()});const p=await metrics('openai/codex',{DB},{now:now+DAY,fetcher:mock({fail:429})});assert.equal(p.stale,true);assert.equal(p.observed_at,new Date(now).toISOString());});
test('404 does not serve cached public data after privacy/deletion change',async()=>{const DB=db();await metrics('openai/codex',{DB},{now,fetcher:mock()});await assert.rejects(metrics('openai/codex',{DB},{now:now+DAY,fetcher:mock({fail:404})}),{status:404});});
test('API rejects arbitrary repo proxying and invalid windows',async()=>{const env={DB:db()};assert.equal((await worker.fetch(new Request('https://test/v1/repos/anything/else/metrics'),env)).status,404);assert.equal((await worker.fetch(new Request('https://test/v1/repos/openai/codex/history?days=999'),env)).status,400);});
test('CORS exact configured origin and method restrictions',async()=>{const env={ALLOWED_ORIGIN:'https://atlas.example'};const r=await worker.fetch(new Request('https://test/health',{headers:{Origin:'https://atlas.example'}}),env);assert.equal(r.headers.get('Access-Control-Allow-Origin'),env.ALLOWED_ORIGIN);assert.equal((await worker.fetch(new Request('https://test/health',{headers:{Origin:'https://evil.example'}}),env)).headers.get('Access-Control-Allow-Origin'),null);assert.equal((await worker.fetch(new Request('https://test/health',{method:'POST'}),env)).status,405);});
test('single Cron range covers all seven shards once daily',()=>{const names=Array.from({length:35},(_,i)=>`owner/repo-${i}`),all=[];for(let minute=17;minute<=23;minute++){const batch=shardNames(Date.UTC(2026,9,4,3,minute),{SHARD_COUNT:'7',SHARD_START_MINUTE:'17'},names);assert.equal(batch.length,5);all.push(...batch);}assert.equal(new Set(all).size,35);assert.equal(all.length,35);});
test('pending statistics retry after delay and recover, not before',async()=>{const DB=db(),env={DB},first=mock({activity:202});const a=await metrics('openai/codex',env,{now,fetcher:first});assert.equal(a.activity.status,'pending');const next=mock();const b=await metrics('openai/codex',env,{now:now+30000,fetcher:next});assert.equal(b.activity.status,'pending');assert.equal(next.calls.length,0);const c=await metrics('openai/codex',env,{now:now+61000,fetcher:next});assert.equal(c.activity.status,'ready');assert.ok(next.calls.length>0);});
test('failed collection cannot write synthetic daily zero counts',async()=>{const DB=db();const r=await collect({DB},{now,fetcher:mock({fail:500}),names:['openai/codex']});assert.equal(r.failed,1);assert.equal(DB.sqlite.prepare('SELECT COUNT(*) AS n FROM daily_snapshots').get().n,0);});
test('database errors remain a sanitized unavailable API result',async()=>{const r=await worker.fetch(new Request('https://test/v1/repos/openai/codex/metrics'),{DB:{prepare(){throw new Error('secret internal db error');}}});assert.equal(r.status,503);const p=await r.json();assert.equal(p.status,'unavailable');assert.ok(!JSON.stringify(p).includes('secret'));});
