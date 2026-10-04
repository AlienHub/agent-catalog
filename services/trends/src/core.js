export const DAY = 86400000;
export const utcDay = time => new Date(time).toISOString().slice(0, 10);
export function normalizeRepo(value) {
  const name = value.replace(/^https:\/\/github\.com\//i, '').replace(/\/$/, '').replace(/\.git$/, '');
  if (!/^[a-z\d_.-]+\/[a-z\d_.-]+$/i.test(name)) throw new Error('Invalid repository');
  return name.toLowerCase();
}
export function summarize(points, now = Date.now(), days = 30) {
  const today = utcDay(now), byDay = new Map(points.map(p => [p.date,p]));
  const current = byDay.get(today);
  const growth = Object.fromEntries([7,30].map(n => {
    const old = byDay.get(utcDay(now - n * DAY));
    return [`${n}d`, current && old ? current.stars-old.stars : null];
  }));
  const visible = points.filter(p => p.date >= utcDay(now - (days-1)*DAY) && p.date <= today).sort((a,b) => a.date.localeCompare(b.date));
  return {points:visible,growth,missing_data:visible.length < days,source:'daily_snapshots', status:current && growth['7d'] !== null ? 'ready':'accumulating'};
}
export class UpstreamError extends Error {
  constructor(status, retryAfter = 60) { super(`GitHub returned ${status}`); this.status=status; this.retryAfter=retryAfter; }
}
export async function github(path, env, fetcher=fetch) {
  const headers = {'Accept':'application/vnd.github+json','User-Agent':'Agent-Atlas-Trends','X-GitHub-Api-Version':'2026-03-10'};
  if(env.GITHUB_TOKEN) headers.Authorization=`Bearer ${env.GITHUB_TOKEN}`;
  const response = await fetcher(`https://api.github.com${path}`,{headers,signal:AbortSignal.timeout(15000)});
  const retry = Number(response.headers.get('retry-after')) || Math.max(60,Number(response.headers.get('x-ratelimit-reset'))-Math.floor(Date.now()/1000)) || 60;
  if(response.status===202 || response.status===204) return {status:response.status,data:null,retryAfter:retry};
  if(!response.ok) throw new UpstreamError(response.status,retry);
  return {status:200,data:await response.json()};
}
export async function readActivity(name, env, fetcher=fetch, now=Date.now()) {
  try {
    const r = await github(`/repos/${name}/stats/commit_activity`,env,fetcher);
    if(r.status===202) return {status:'pending',weeks:[],observed_at:null,retry_after:new Date(now+Math.max(60,r.retryAfter)*1000).toISOString()};
    if(r.status!==200 || !Array.isArray(r.data)) return {status:'unavailable',weeks:[],observed_at:null,retry_after:new Date(now+3600000).toISOString()};
    const valid=r.data.every(w=>Number.isInteger(w.week)&&Number.isInteger(w.total)&&w.total>=0&&Array.isArray(w.days)&&w.days.length===7&&w.days.every(n=>Number.isInteger(n)&&n>=0));
    if(!valid) throw new Error('Invalid activity response');
    return {status:'ready',weeks:r.data.map(({week,total,days})=>({week,total,days})).sort((a,b)=>a.week-b.week),observed_at:new Date(now).toISOString(),retry_after:null};
  } catch(e) {
    return {status:'unavailable',weeks:[],observed_at:null,retry_after:new Date(now+(e.retryAfter||3600)*1000).toISOString()};
  }
}
