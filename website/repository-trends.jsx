import React, { useEffect, useState } from 'react';

const dayMs = 86400000;
const compact = value => new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
const count = value => Number.isFinite(value) ? value.toLocaleString('zh-CN') : '数据积累中';
const delta = value => Number.isFinite(value) ? `${value > 0 ? '+' : ''}${value.toLocaleString('zh-CN')}` : '数据积累中';
const date = value => value && Number.isFinite(Date.parse(value)) ? value.slice(0, 10) : '暂无数据';

export function parseGithubRepository(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'github.com') return null;
    const parts = url.pathname.replace(/\/$/, '').replace(/\.git$/, '').split('/').filter(Boolean);
    return parts.length === 2 && parts.every(part => /^[\w.-]+$/.test(part)) ? parts : null;
  } catch { return null; }
}

export function makeStarSeries(rawPoints) {
  const points = rawPoints.filter(p => /^\d{4}-\d{2}-\d{2}$/.test(p.date) && Number.isFinite(Date.parse(p.date)) && Number.isFinite(p.stars)).sort((a, b) => a.date.localeCompare(b.date));
  if (!points.length) return { points: [], segments: [], min: null, max: null };
  const min = Math.min(...points.map(p => p.stars)), max = Math.max(...points.map(p => p.stars));
  const first = Date.parse(points[0].date), span = Date.parse(points.at(-1).date) - first;
  const scaled = points.map(p => ({ ...p, x: span ? 36 + (Date.parse(p.date) - first) / span * 288 : 180, y: max === min ? 76 : 124 - (p.stars - min) / (max - min) * 96 }));
  const segments = [];
  for (const point of scaled) {
    const last = segments.at(-1)?.at(-1);
    if (!last || Date.parse(point.date) - Date.parse(last.date) > dayMs) segments.push([point]);
    else segments.at(-1).push(point);
  }
  return { points: scaled, segments, min, max };
}

function StarChart({ points }) {
  const chart = makeStarSeries(points);
  if (!chart.points.length) return <p className="muted">历史数据积累中，首次实际采集后开始记录。</p>;
  return <><svg className="trend-chart" viewBox="0 0 360 158" role="img" aria-label={`每日实测 Star 总数，${chart.points[0].date} 至 ${chart.points.at(-1).date}，缺测处断开`}>
    <line x1="36" y1="28" x2="324" y2="28" stroke="#e7e8ea"/><line x1="36" y1="124" x2="324" y2="124" stroke="#e7e8ea"/>
    <text x="32" y="30" textAnchor="end">{compact(chart.max)}</text><text x="32" y="126" textAnchor="end">{compact(chart.min)}</text>
    {chart.segments.map((segment, i) => segment.length > 1 && <polyline key={i} points={segment.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#55585e" strokeWidth="2"/>)}
    {chart.points.map(p => <circle key={p.date} cx={p.x} cy={p.y} r="2.5" fill="#55585e"><title>{p.date} · {count(p.stars)} stars</title></circle>)}
    <text x="36" y="148">{chart.points[0].date.slice(5)}</text><text x="324" y="148" textAnchor="end">{chart.points.at(-1).date.slice(5)}</text>
  </svg><p className="muted small">每日实测总数 · 从首次采集日起 · 缺测不补零{chart.points.length < 2 ? ' · 等待更多采样' : ''}</p>
  <details className="trend-data"><summary>查看 {chart.points.length} 天采样</summary><table><thead><tr><th>UTC日期</th><th>Stars</th><th>Forks</th></tr></thead><tbody>{chart.points.map(p=><tr key={p.date}><td>{p.date}</td><td>{count(p.stars)}</td><td>{count(p.forks)}</td></tr>)}</tbody></table></details></>;
}

function CommitActivity({ activity }) {
  if (activity?.status !== 'ready') return <p className="muted small">提交统计：{activity?.status === 'pending' ? 'GitHub正在生成，稍后更新' : '暂不可用'}。仓库活跃度不等于产品维护承诺。</p>;
  const weeks = (activity.weeks || []).filter(w => Number.isFinite(w.week) && Number.isFinite(new Date(w.week * 1000).getTime()) && Number.isFinite(w.total) && w.total >= 0).sort((a,b)=>a.week-b.week);
  if (!weeks.length) return <p className="muted small">暂无有效提交统计，不将缺测视为零。</p>;
  const first=weeks[0].week,last=weeks.at(-1).week,max=Math.max(...weeks.map(w=>w.total),1),width=Math.max(1,Math.min(12,280/Math.max(weeks.length,1)));
  return <><h4 className="trend-subtitle">近一年默认分支提交</h4><svg className="trend-chart" viewBox="0 0 360 104" role="img" aria-label="按周提交次数，不含合并提交，未返回的周不补零"><line x1="36" y1="82" x2="324" y2="82" stroke="#e7e8ea"/>{weeks.map(w=><rect key={w.week} x={last===first?176:36+(w.week-first)/(last-first)*280} y={82-w.total/max*62} width={width} height={w.total/max*62} fill="#858990"><title>{new Date(w.week*1000).toISOString().slice(0,10)} · {w.total}次提交</title></rect>)}<text x="36" y="100">{new Date(first*1000).toISOString().slice(5,10)}</text><text x="324" y="100" textAnchor="end">{new Date(last*1000).toISOString().slice(5,10)}</text></svg><p className="muted small">GitHub默认分支统计 · 不含合并提交 · 活跃度不等于维护承诺</p></>;
}

export function RepositoryTrends({ repositoryUrl }) {
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    const controller = new AbortController(); let current = true;
    const update = value => { if (current) setState(value); };
    update({ status: 'loading' });
    (async () => {
      const repo = parseGithubRepository(repositoryUrl);
      if (!repo) { update({ status: 'unsupported' }); return; }
      const configResponse = await fetch('trends-config.json', { signal: controller.signal });
      if (!configResponse.ok) throw new Error('config_unavailable');
      const config = await configResponse.json();
      if (!config.apiBaseUrl) { update({ status: 'unconfigured' }); return; }
      const base = new URL(config.apiBaseUrl === 'same-origin' ? window.location.origin : config.apiBaseUrl);
      if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new Error('invalid_endpoint');
      const prefix = `${base.href.replace(/\/$/, '')}/v1/repos/${repo.map(encodeURIComponent).join('/')}`;
      const get = async suffix => {
        const response = await fetch(prefix + suffix, { signal: controller.signal });
        if (!response.ok) throw new Error(`service_${response.status}`);
        return response.json();
      };
      const [metrics, history] = await Promise.all([get('/metrics'), get('/history?days=30')]);
      if (!metrics || typeof metrics !== 'object' || !history || !Array.isArray(history.points) || history.source !== 'daily_snapshots') throw new Error('invalid_history');
      update({ status: 'ready', metrics, history });
    })().catch(error => { if (error.name !== 'AbortError') update({ status: 'unavailable' }); });
    return () => { current = false; controller.abort(); };
  }, [repositoryUrl]);
  return <section className="source-info repository-trends" aria-label="仓库趋势"><h3>仓库趋势</h3>
    {state.status === 'unconfigured' && <p className="muted">尚未连接采集服务。接入后将展示 GitHub 指标与每日实测历史。</p>}
    {state.status === 'loading' && <p className="muted" role="status">正在读取仓库指标…</p>}
    {state.status === 'unavailable' && <p className="muted" role="status">采集服务暂不可用，未将失败请求视为零。</p>}
    {state.status === 'unsupported' && <p className="muted">当前仅支持已核验的 GitHub 仓库。</p>}
    {state.status === 'ready' && <><div className="trend-stats"><div><span>Stars</span><strong>{count(state.metrics.stars)}</strong></div><div><span>Forks</span><strong>{count(state.metrics.forks)}</strong></div><div><span>7天净变化</span><strong>{delta(state.metrics.growth?.['7d'])}</strong></div><div><span>30天净变化</span><strong>{delta(state.metrics.growth?.['30d'])}</strong></div></div>
    <p className="muted small">采集于 {date(state.metrics.observed_at)}{state.metrics.stale ? ' · 缓存待更新' : ''}</p>
    <StarChart points={state.history.points}/>
    <dl><div><dt>最近提交</dt><dd>{date(state.metrics.last_commit_at)}</dd></div><div><dt>最近发布</dt><dd>{state.metrics.last_release ? `${state.metrics.last_release.tag} · ${date(state.metrics.last_release.published_at)}` : '暂无发布记录'}</dd></div></dl>
    <CommitActivity activity={state.metrics.activity}/></>}
  </section>;
}
