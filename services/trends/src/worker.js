import repos from './repos.json' with {type:'json'};
import {DAY,utcDay,normalizeRepo,summarize,github,readActivity,UpstreamError} from './core.js';
const allowlist = new Set(repos.map(normalizeRepo));
const inFlight = new Map();
const query = (db, sql, ...args) => db.prepare(sql).bind(...args);
export async function getPoints(db,id,now=Date.now(),days=366) {
  return (await query(db,'SELECT date,stars,forks,observed_at FROM daily_snapshots WHERE repo_id = ? AND date >= ? ORDER BY date',id,utcDay(now-Math.max(30,days)*DAY)).all()).results;
}
async function cached(db,name) {
  return query(db,'SELECT c.* FROM metric_cache c JOIN repo_aliases a ON a.repo_id = c.repo_id WHERE a.name = ?',name).first();
}
export async function refresh(name, env, {now=Date.now(),fetcher=fetch,seen=null}={}) {
  const meta=(await github(`/repos/${name}`,env,fetcher)).data;
  if(!meta || meta.private !== false || !Number.isSafeInteger(meta.id)) throw new UpstreamError(404);
  if(seen?.has(meta.id)) return null;
  // Only insert in seen after success, so an alias can retry a failed sample.
  const canonical=normalizeRepo(meta.full_name);
  const [count,commit,release,activity] = await Promise.all([
    github(`/repos/${canonical}/stargazers/count`,env,fetcher),
    github(`/repos/${canonical}/commits?per_page=1`,env,fetcher).catch(e=>{if(e.status===409)return {data:[]}; throw e;}),
    github(`/repos/${canonical}/releases/latest`,env,fetcher).catch(e=>{if(e.status===404)return {data:null}; throw e;}),
    readActivity(canonical,env,fetcher,now)
  ]);
  if(!Number.isInteger(count.data?.count)||count.data.count<0||!Number.isInteger(meta.forks_count)||meta.forks_count<0) throw new Error('Invalid metric counts');
  const observed_at=new Date(now).toISOString();
  const payload={repo:{id:meta.id,full_name:meta.full_name,url:`https://github.com/${meta.full_name}`},stars:count.data.count,forks:meta.forks_count,
    last_commit_at:commit.data?.[0]?.commit?.committer?.date??null,
    last_release:release.data?{tag:release.data.tag_name,published_at:release.data.published_at,url:release.data.html_url}:null,
    observed_at,stale:false,activity};
  const ttl=Math.min(900,Math.max(60,Number(env.CACHE_SECONDS)||300));
  // Pending computation becomes eligible for delayed retry on the next request after 60s.
  const retryAt=activity.retry_after?Date.parse(activity.retry_after):0;
  const expiresAt=Math.min(now+ttl*1000,retryAt||Infinity);
  await env.DB.batch([
    query(env.DB,'INSERT INTO repositories(id,full_name,html_url,updated_at) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET full_name=excluded.full_name,html_url=excluded.html_url,updated_at=excluded.updated_at',meta.id,meta.full_name,payload.repo.url,observed_at),
    ...[...new Set([name,canonical])].map(alias=>query(env.DB,'INSERT INTO repo_aliases(name,repo_id) VALUES(?,?) ON CONFLICT(name) DO UPDATE SET repo_id=excluded.repo_id',alias,meta.id)),
    query(env.DB,'INSERT INTO metric_cache(repo_id,payload,expires_at,retry_at) VALUES(?,?,?,?) ON CONFLICT(repo_id) DO UPDATE SET payload=excluded.payload,expires_at=excluded.expires_at,retry_at=excluded.retry_at',meta.id,JSON.stringify(payload),expiresAt,retryAt)
  ]);
  seen?.add(meta.id);
  return payload;
}
export async function metrics(name,env,options={}) {
  const now=options.now??Date.now(), old=await cached(env.DB,name);
  if(old && old.expires_at>now) return JSON.parse(old.payload);
  if(inFlight.has(name)) return inFlight.get(name);
  const work=refresh(name,env,{...options,now}).catch(async e=>{
    if(e.status===404) throw e;
    if(old) {
      // Preserve observed_at and visibly label stale; throttle retries, without inventing samples.
      await query(env.DB,'UPDATE metric_cache SET expires_at = ? WHERE repo_id = ?',now+Math.min(e.retryAfter||60,3600)*1000,old.repo_id).run();
      const value={...JSON.parse(old.payload),stale:true};
      await query(env.DB,'UPDATE metric_cache SET payload = ? WHERE repo_id = ?',JSON.stringify(value),old.repo_id).run();
      return value;
    }
    throw e;
  }).finally(()=>inFlight.delete(name));
  inFlight.set(name,work);return work;
}
export async function collect(env,{now=Date.now(),fetcher=fetch,names=repos}={}) {
  const seen=new Set();let succeeded=0,failed=0;
  for(const raw of names) {
    try {
      const p=await refresh(normalizeRepo(raw),env,{now,fetcher,seen});
      if(!p)continue;
      // One genuine observation per repo / UTC day. A rerun cannot overwrite the first sample.
      await query(env.DB,'INSERT INTO daily_snapshots(repo_id,date,stars,forks,last_commit_at,last_release_json,observed_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(repo_id,date) DO NOTHING',p.repo.id,utcDay(now),p.stars,p.forks,p.last_commit_at,JSON.stringify(p.last_release),p.observed_at).run();
      succeeded++;
    }catch(e){failed++;console.warn('Repository sample failed',{repository:raw,status:e.status??'upstream_unavailable'});}
  }
  await query(env.DB,'INSERT INTO collection_runs(run_key,completed_at,succeeded,failed) VALUES(?,?,?,?) ON CONFLICT(run_key) DO UPDATE SET completed_at=excluded.completed_at,succeeded=excluded.succeeded,failed=excluded.failed',`${utcDay(now)}:${names[0]??'empty'}`,new Date(now).toISOString(),succeeded,failed).run();
  return {succeeded,failed};
}
export function shardNames(scheduledTime,env,names=repos) {
  const shards=Math.max(1,Math.floor(Number(env.SHARD_COUNT)||1));
  const offset=new Date(scheduledTime).getUTCMinutes()-(Number(env.SHARD_START_MINUTE)||0);
  const slot=((offset%shards)+shards)%shards;
  return names.filter((_,i)=>i%shards===slot);
}
export default {
  async fetch(request,env) {
    const url=new URL(request.url),origin=request.headers.get('Origin');
    const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=60','Vary':'Origin'};
    if(origin && origin===env.ALLOWED_ORIGIN)headers['Access-Control-Allow-Origin']=origin;
    const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...headers,...(status>=400?{'Cache-Control':'no-store'}:{})}});
    if(request.method!=='GET')return json({error:'method_not_allowed'},405);
    if(url.pathname==='/health')return json({service:'agent-atlas-trends',version:1});
    const match=url.pathname.match(/^\/v1\/repos\/([^/]+)\/([^/]+)\/(metrics|history)$/);
    if(!match)return json({error:'not_found'},404);
    let name;try{name=normalizeRepo(`${decodeURIComponent(match[1])}/${decodeURIComponent(match[2])}`);}catch{return json({error:'invalid_repository'},400);}
    if(!allowlist.has(name))return json({error:'repository_not_configured'},404);
    const days=Number(url.searchParams.get('days')??30);
    if(!Number.isInteger(days)||days<1||days>366)return json({error:'days_must_be_1_to_366'},400);
    try {
      const p=await metrics(name,env);
      const summary=summarize(await getPoints(env.DB,p.repo.id,Date.now(),days),Date.now(),days);
      if(match[3]==='history')return json({...summary,repo:p.repo,stale:p.stale,status:p.stale?'unavailable':summary.status});
      return json({...p,growth:summary.growth,status:p.stale?'unavailable':summary.status});
    }catch(e){return json({status:'unavailable',error:e.status===404?'repository_unavailable':'upstream_unavailable',retry_after:e.retryAfter??60},e.status===404?404:503);}
  },
  async scheduled(controller,env,ctx) {
    ctx.waitUntil(collect(env,{names:shardNames(controller.scheduledTime,env)}));
  }
};
