import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { ActionButton as Button } from './action-button.jsx';
import { createDialogController } from './dialog-controller.js';

const emptyFilters = { search: '', type: '', compat: '', status: '', backend: '' };
const typeLabels = { official: '官方平台', aggregator: '聚合平台', 'third-party-proxy': '第三方代理', 'community-relay': '社区中转' };
const statusLabels = { active: '运营中', unstable: '不稳定', dead: '不可达', closed: '已关闭' };
const compatLabels = { openai: 'OpenAI', anthropic: 'Anthropic', gemini: 'Gemini' };
const fieldDefs = {
  id: ['唯一 ID', '供应商目录内稳定、唯一的站点标识'],
  name: ['名称', '对外展示名称'],
  aliases: ['别名', '确认使用过的别名；未知时为空数组'],
  operator: ['运营方', '同一运营方的多个域名用 related_ids / related_sites 关联'],
  type: ['类型', '官方平台 / 聚合平台 / 第三方代理 / 社区中转'],
  website: ['站点', '正在运营的服务站点或文档入口'],
  api_base_urls: ['API 地址', '探测到的 API 主机；不代表已鉴权可用'],
  api_compat: ['兼容协议', 'openai / anthropic / gemini；空数组表示尚未核验'],
  models: ['模型', '未登录列举，未知时为空数组'],
  region: ['地区', '根据公开站点信息标注；unverified 表示未核验'],
  status: ['状态', 'active 运营中 / unstable 不稳定 / dead 不可达 / closed 已关闭'],
  backend: ['后端软件', '由 GET /api/status 探测到的属性，不是独立目录条目'],
  risk_notes: ['风险说明', '收录不等于背书'],
};
function External({ href, children, ...props }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
}
function download(data, type, name) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Modal({ id, open, onRequestClose, titleId, children }) {
  const ref = useRef(null), controller = useRef(null), reduce = useReducedMotion(), reduceRef = useRef(reduce);
  reduceRef.current = reduce;
  useLayoutEffect(() => { controller.current = createDialogController(ref.current, animate, () => reduceRef.current); return () => controller.current.destroy(); }, []);
  useLayoutEffect(() => { controller.current?.setOpen(open); }, [open]);
  return <dialog ref={ref} id={id} aria-labelledby={titleId} onCancel={e => { e.preventDefault(); onRequestClose(); }} onClick={e => { if (e.target !== e.currentTarget) return; const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onRequestClose(); }}>{children}</dialog>;
}
function ProviderDetail({ provider, evidence }) {
  if (!provider) return null;
  const ev = evidence[provider.id];
  const backend = [provider.backend.software, provider.backend.version].filter(Boolean).join(' ') || '未探测到 new-api/one-api 指纹';
  return <>
    <div className="detailhead"><span className="appicon iconfallback" aria-hidden="true">{provider.name.slice(0, 1)}</span><div><h2 id="providerDetailTitle">{provider.name}</h2><div className="app-id">{provider.id} · {provider.operator}</div></div></div>
    <p className="lifecycle">{provider.risk_notes}</p>
    <div className="detailactions"><External href={provider.website}>访问站点</External></div>
    <dl>
      <div><dt>类型</dt><dd>{typeLabels[provider.type]}</dd></div>
      <div><dt>状态</dt><dd>{statusLabels[provider.status]}</dd></div>
      <div><dt>兼容协议</dt><dd>{provider.api_compat.length ? provider.api_compat.map(value => compatLabels[value]).join('、') : '未核验'}</dd></div>
      <div><dt>API 地址</dt><dd>{provider.api_base_urls.length ? provider.api_base_urls.map(url => <div key={url}><External href={url}>{url}</External></div>) : '未单独记录'}</dd></div>
      <div><dt>后端</dt><dd>{backend}{provider.backend.detected_by ? <span className="muted"> · {provider.backend.detected_by}</span> : null}</dd></div>
      <div><dt>地区</dt><dd>{provider.region}</dd></div>
      <div><dt>计价</dt><dd>{provider.pricing.ratio_note || provider.pricing.unit || '未核价'}</dd></div>
      <div><dt>支付</dt><dd>{provider.payment_methods.join('、') || '未核验'}</dd></div>
      <div><dt>别名</dt><dd>{provider.aliases.join('、') || '暂无已确认别名'}</dd></div>
      <div><dt>关联站点</dt><dd>{provider.related_sites.length ? provider.related_sites.map(url => <div key={url}><External href={url}>{url}</External></div>) : '无'}</dd></div>
      <div><dt>发现渠道</dt><dd>{provider.discovery_source.channel} · <External href={provider.discovery_source.url}>{provider.discovery_source.url}</External></dd></div>
      <div><dt>首次记录</dt><dd>{provider.first_seen}</dd></div>
      <div><dt>最近探测</dt><dd>{provider.last_checked}</dd></div>
    </dl>
    {ev && <div className="evidence"><h3>来源与探测</h3><p>{ev.notes}</p>{(ev.sources || []).map((src, i) => <External key={i} href={src.url}>{src.title || src.url}</External>)}<p className="muted">探测日期：{ev.checked_at} · 无登录、无付费、无 API key；收录不等于背书</p></div>}
  </>;
}

export function ProvidersView() {
  const [data, setData] = useState(null), [error, setError] = useState(false), [filters, setFilters] = useState(emptyFilters), [selected, setSelected] = useState(null), [detailOpen, setDetailOpen] = useState(false), [schemaOpen, setSchemaOpen] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.all(['providers.json', 'provider-evidence.json'].map(name => fetch(name).then(r => { if (!r.ok) throw Error(name); return r.json(); })))
      .then(([providers, evidence]) => { if (alive) setData({ providers, evidence }); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, []);
  const providers = data?.providers || [];
  const list = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return providers.filter(p =>
      (!q || [p.name, p.id, p.operator, p.website, ...p.aliases, ...p.api_base_urls, ...p.related_sites].some(value => String(value).toLowerCase().includes(q)))
      && (!filters.type || p.type === filters.type)
      && (!filters.compat || p.api_compat.includes(filters.compat))
      && (!filters.status || p.status === filters.status)
      && (!filters.backend || (filters.backend === 'undetected' ? !p.backend.software : p.backend.software === filters.backend))
    );
  }, [providers, filters]);
  const backends = useMemo(() => [...new Set(providers.map(p => p.backend.software).filter(Boolean))].sort(), [providers]);
  const update = useCallback((key, value) => setFilters(f => ({ ...f, [key]: value })), []);
  const active = Object.entries(filters).some(([k, v]) => v !== emptyFilters[k]);
  const openDetail = useCallback(provider => { setSelected(provider); setDetailOpen(true); }, []);
  const csv = () => {
    const keys = ['id', 'name', 'operator', 'type', 'website', 'status', 'region', 'api_compat', 'backend'];
    const quote = v => '"' + (Array.isArray(v) ? v.join(' | ') : String(v)).replaceAll('"', '""') + '"';
    const row = p => [p.id, p.name, p.operator, p.type, p.website, p.status, p.region, p.api_compat.join(' | '), [p.backend.software, p.backend.version].filter(Boolean).join(' ')].map(quote).join(',');
    download('\uFEFF' + [keys.map(quote).join(','), ...list.map(row)].join('\r\n'), 'text/csv;charset=utf-8', 'agent-atlas-providers.csv');
  };
  const counts = useMemo(() => ({
    total: providers.length,
    active: providers.filter(p => p.status === 'active').length,
    official: providers.filter(p => p.type === 'official').length,
  }), [providers]);
  const meta = document.documentElement.dataset;
  return <>
    <main>
      <section className="intro"><div><h1>模型供应商 / 中转站</h1><p>公开可访问的模型 API 站点目录，独立于 Agent 应用数据集</p></div>
        <div className="exports"><a className="primary" href={`agent-atlas-v${meta.version}.zip`} download>↓ 完整数据包</a>
          <Button id="providerJsonExport" disabled={!data} aria-label="导出当前筛选结果 JSON" onClick={() => download(JSON.stringify(list, null, 2), 'application/json', 'agent-atlas-providers.json')}>JSON</Button>
          <Button id="providerCsvExport" disabled={!data} aria-label="导出当前筛选结果 CSV" onClick={csv}>CSV</Button>
        </div></section>
      <p id="providerDisclaimer" className="disclaimer">收录公开可访问的服务站点与 API 地址，<strong>不等于推荐、合作、担保或法律意见</strong>。开源后端（one-api / new-api 等）只作为探测属性，不作为目录条目。第三方代理与社区中转可能与上游服务条款或当地法规冲突；状态变化很快，请以各站当前公示为准。</p>
      <div className="summary" aria-label="供应商目录概况"><span><strong id="providerTotal">{data ? counts.total : '—'}</strong> 站点</span><span><strong id="providerActiveCount">{data ? counts.active : '—'}</strong> 运营中</span><span><strong id="providerOfficialCount">{data ? counts.official : '—'}</strong> 官方平台</span><span className="version"><strong>v{meta.version}</strong> · {meta.snapshot}</span></div>
      <section className="workspace">
        <div className="tools provider-tools">
          <label className="search"><span aria-hidden="true">⌕</span><input id="providerSearch" type="search" value={filters.search} onChange={e => update('search', e.target.value)} placeholder="搜索名称、运营方、域名或 ID…" aria-label="搜索供应商"/></label>
          <select id="providerType" aria-label="按类型筛选" value={filters.type} onChange={e => update('type', e.target.value)}><option value="">全部类型</option>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select id="providerCompat" aria-label="按兼容协议筛选" value={filters.compat} onChange={e => update('compat', e.target.value)}><option value="">全部协议</option>{Object.entries(compatLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select id="providerStatus" aria-label="按状态筛选" value={filters.status} onChange={e => update('status', e.target.value)}><option value="">全部状态</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select id="providerBackend" aria-label="按后端软件筛选" value={filters.backend} onChange={e => update('backend', e.target.value)}><option value="">全部后端</option><option value="undetected">未探测到指纹</option>{backends.map(value => <option key={value} value={value}>{value}</option>)}</select>
        </div>
        <div className="listmeta"><span id="providerResultCount" role="status">{error ? '读取失败' : data ? `${list.length} / ${providers.length} 条供应商记录` : '正在读取供应商目录…'}</span>
          <div><Button id="providerReset" className="textbutton" hidden={!active} onClick={() => setFilters(emptyFilters)}>清除筛选</Button><Button id="providerSchemaButton" className="textbutton" onClick={() => setSchemaOpen(true)}>字段定义 ↗</Button></div></div>
        <div className="provider-table-wrap" id="providerRows" aria-label="供应商列表">
          <table className="provider-table"><thead><tr><th>名称</th><th>类型</th><th>状态</th><th>协议</th><th>后端</th><th>地区</th></tr></thead>
            <tbody>{list.map(provider => <tr key={provider.id} className="provider-row" onClick={() => openDetail(provider)}>
              <td><button type="button" className="appname" aria-label={`查看 ${provider.name} 详情`} onClick={e => { e.stopPropagation(); openDetail(provider); }}>{provider.name}</button><div className="provider-host">{new URL(provider.website).hostname}</div></td>
              <td><span className="pill">{typeLabels[provider.type]}</span></td>
              <td><span className={`pill status-pill status-${provider.status}`}>{statusLabels[provider.status]}</span></td>
              <td>{provider.api_compat.length ? provider.api_compat.map(value => <span key={value} className="pill">{compatLabels[value]}</span>) : <span className="muted">未核验</span>}</td>
              <td className="provider-backend">{provider.backend.software ? [provider.backend.software, provider.backend.version].filter(Boolean).join(' ') : '—'}</td>
              <td>{provider.region}</td>
            </tr>)}</tbody></table>
        </div>
        <div id="providerEmpty" hidden={!data || list.length > 0}><strong>没有匹配的供应商</strong><p>试试其他名称，或清除筛选重新浏览。</p><Button id="providerEmptyReset" onClick={() => setFilters(emptyFilters)}>清除全部筛选</Button></div>
        <div id="providerError" hidden={!error} role="alert">供应商目录读取失败，请刷新后重试。</div>
      </section>
      <footer><div><span className="tinyicon">▦</span>供应商数据独立于应用目录 · JSON 为主数据</div>
        <a href={`agent-atlas-v${meta.version}.zip`} download>完整数据包 ZIP</a>
        <a href="providers.json" download>供应商 JSON</a>
        <a href="providers.csv" download>供应商 CSV</a>
        <a href="providers-schema.json" download>供应商 Schema</a>
        <a href="provider-evidence.json" download>探测来源</a>
        <a href="website-notices.txt">界面许可</a>
        <span className="footnote">收录不等于背书。品牌标识归各权利人所有。</span></footer>
    </main>
    <Modal id="providerDetails" open={detailOpen} onRequestClose={() => setDetailOpen(false)} titleId="providerDetailTitle">
      <div className="dialogtop"><span className="eyebrow">PROVIDER RECORD</span><Button id="closeProviderDetails" aria-label="关闭详情" onClick={() => setDetailOpen(false)}>✕</Button></div>
      <div id="providerDetailContent"><ProviderDetail provider={selected} evidence={data?.evidence || {}} /></div>
    </Modal>
    <Modal id="providerSchema" open={schemaOpen} onRequestClose={() => setSchemaOpen(false)} titleId="providerSchemaTitle">
      <div className="dialogtop"><span className="eyebrow">PROVIDER DICTIONARY</span><Button id="closeProviderSchema" aria-label="关闭字段定义" onClick={() => setSchemaOpen(false)}>✕</Button></div>
      <h2 id="providerSchemaTitle">模型供应商与中转站</h2>
      <p className="muted">只收录正在运营的服务站点 / API 地址。one-api、new-api 等开源项目不是条目。</p>
      <dl id="providerFields">{Object.entries(fieldDefs).map(([key, [label, desc]]) => <div key={key}><dt>{key}</dt><dd>{label} · {desc}</dd></div>)}</dl>
      <p className="muted small">探测不代表签约、充值或调用测试。收录不等于背书。</p>
    </Modal>
  </>;
}
