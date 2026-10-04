import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {authorized} from './access.js';
import {createWorker} from './worker.js';
const env={ACCESS_ISSUER:'https://atlas-test.cloudflareaccess.com',ACCESS_AUD:'a'.repeat(64),ACCESS_OWNER_EMAIL:'owner@example.test'};
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'key1',alg:'RS256',use:'sig'};
const b64=v=>Buffer.from(typeof v==='string'?v:JSON.stringify(v)).toString('base64url');
const now=Date.now();
async function token(changes={},head={}) {
 const h=b64({alg:'RS256',kid:'key1',...head}),p=b64({iss:env.ACCESS_ISSUER,aud:[env.ACCESS_AUD],email:env.ACCESS_OWNER_EMAIL,sub:'owner-id',iat:Math.floor(now/1000)-2,exp:Math.floor(now/1000)+3600,...changes});
 return `${h}.${p}.${Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(`${h}.${p}`))).toString('base64url')}`;
}
const request=t=>new Request('https://atlas.example/',{headers:t?{'Cf-Access-Jwt-Assertion':t}:{}});
const opts={now,fetcher:async url=>{assert.equal(url,env.ACCESS_ISSUER+'/cdn-cgi/access/certs');return Response.json({keys:[jwk]});}};
test('missing privacy settings and anonymous token deny',async()=>{assert.equal(await authorized(request(),{}),false);assert.equal(await authorized(request(),env),false);});
test('real signed owner token accepted',async()=>assert.equal(await authorized(request(await token()),env,opts),true));
test('signed other identity, issuer or audience denied',async()=>{for(const change of [{email:'other@example.test'},{iss:'https://evil.test'},{aud:['wrong']},{sub:''}])assert.equal(await authorized(request(await token(change)),env,opts),false);});
test('expired, future-issued and not-before tokens denied',async()=>{for(const change of [{exp:now/1000-1},{iat:now/1000+120},{nbf:now/1000+120},{exp:'forever'}])assert.equal(await authorized(request(await token(change)),env,opts),false);});
test('algorithm substitution, unknown key and forged signature denied',async()=>{for(const h of [{alg:'none'},{alg:'HS256'},{kid:'other'}])assert.equal(await authorized(request(await token({},h)),env,opts),false);const t=await token();assert.equal(await authorized(request(t.slice(0,-20)+'a'.repeat(20)),env,opts),false);});
test('plain identity header does not authorize; key-service failure denies',async()=>{assert.equal(await authorized(new Request('https://atlas.example',{headers:{'Cf-Access-Authenticated-User-Email':env.ACCESS_OWNER_EMAIL}}),env),false);assert.equal(await authorized(request(await token()),env,{now:now+301000,fetcher:async()=>{throw Error('offline');}}),false);});
test('all anonymous asset/API/method routes blocked before bindings',async()=>{let hits=0;const worker=createWorker();const bindings={ASSETS:{fetch(){hits++;}},DB:{prepare(){hits++;}}};for(const path of ['/','/app.js','/dataset.json','/favicon.svg','/agent-atlas-v0.5.zip','/v1/repos/a/b/metrics','/health'])for(const method of ['GET','HEAD','POST']){const r=await worker.fetch(new Request('https://atlas.example'+path,{method}),bindings,{});assert.equal(r.status,403);assert.equal(r.headers.get('Cache-Control'),'private, no-store');}assert.equal(hits,0);});
test('authorized assets and API share entry and prevent public caching',async()=>{let assets=0,api=0;const worker=createWorker({authorize:async()=>true,api:{fetch:async()=>{api++;return new Response('api',{headers:{'Cache-Control':'public','Access-Control-Allow-Origin':'*'}});}}});const e={ASSETS:{fetch:async()=>{assets++;return new Response('asset');}}};for(const [path,body] of [['/','asset'],['/v1/repos/a/b/history','api']]){const r=await worker.fetch(new Request('https://atlas.example'+path),e,{});assert.equal(await r.text(),body);assert.equal(r.headers.get('Access-Control-Allow-Origin'),null);assert.equal(r.headers.get('Cache-Control'),'private, no-store');}assert.equal(assets,1);assert.equal(api,1);});
test('scheduled disabled by default and delegates only with explicit valid config',async()=>{let hits=0;const worker=createWorker({api:{scheduled:async()=>hits++}});await worker.scheduled({},env,{});await worker.scheduled({},{COLLECTION_ENABLED:'true'},{});assert.equal(hits,0);await worker.scheduled({},{...env,COLLECTION_ENABLED:'true',DB:{}},{});assert.equal(hits,1);});
test('configuration gates every static asset and disables public routes and cron',async()=>{const c=JSON.parse(await readFile(new URL('./wrangler.example.jsonc',import.meta.url)));assert.equal(c.assets.run_worker_first,true);assert.equal(c.workers_dev,false);assert.equal(c.preview_urls,false);assert.deepEqual(c.triggers.crons,[]);assert.equal(c.vars.COLLECTION_ENABLED,'false');});

test('approved hostname is the sole example route without opening Access',async()=>{const c=JSON.parse(await readFile(new URL('./wrangler.example.jsonc',import.meta.url)));assert.deepEqual(c.routes,[{pattern:'agent-atlas.pindo.page',custom_domain:true}]);assert.equal(c.vars.ACCESS_ISSUER,'');assert.equal(c.vars.ACCESS_AUD,'');assert.equal(c.vars.ACCESS_OWNER_EMAIL,'');});
