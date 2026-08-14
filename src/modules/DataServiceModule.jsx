import { useState } from 'react';
import data from '../data.js';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };
const LATENCY_TONE = { 实时: 'ok', 准实时: 'warn' };
const STATUS_TONE = { 已上架: 'ok' };

export default function DataServiceModule({ onNavigate }) {
  const [latency, setLatency] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  if (selectedId) {
    const s = data.services.find((x) => x.id === selectedId);
    return (
      <div className="detail-panel">
        <button className="link" onClick={() => setSelectedId(null)}>← 返回列表</button>
        <h3>{s.name}</h3>
        <p className="desc">{s.desc}</p>
        <div className="kv-list">
          <div><span>类型</span><b>{s.type}</b></div>
          <div><span>时延</span><Tag tone={LATENCY_TONE[s.latency] || 'default'}>{s.latency}</Tag></div>
          <div><span>安全分级</span><Tag tone={LEVEL_TONE[s.securityLevel]}>{s.securityLevel}</Tag></div>
          <div><span>状态</span><Tag tone={STATUS_TONE[s.status] || 'default'}>{s.status}</Tag></div>
        </div>

        <h4>调用计量</h4>
        <div className="kv-list">
          <div><span>累计调用</span><b>{s.metrics.calls}</b></div>
          <div><span>消费方数</span><b>{s.metrics.consumers}</b></div>
          <div><span>近24h</span><b>{s.metrics.last24h}</b></div>
        </div>

        <h4>封装资产</h4>
        <table className="table">
          <thead><tr><th>表名</th><th>操作</th></tr></thead>
          <tbody>
            {s.tableIds.map((tid) => {
              const t = data.tables.find((x) => x.id === tid);
              return (
                <tr key={tid}>
                  <td>{t?.nameCn}</td>
                  <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: t.id, title: t.nameCn })}>查看</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h4>审批链</h4>
        {s.applyFlow.map((f, i) => (
          <div className="flow-step" key={i}>
            <span className="step-name">{f.step}</span>
            <span className="step-actor">{f.actor} · {f.time}</span>
            <span className="step-result">{f.result}</span>
          </div>
        ))}
      </div>
    );
  }

  const filtered = data.services.filter((s) => latency === 'all' || s.latency === latency);
  return (
    <div>
      <div className="search-bar">
        <select value={latency} onChange={(e) => setLatency(e.target.value)} aria-label="按时延筛选">
          <option value="all">全部</option>
          <option value="实时">实时</option>
          <option value="准实时">准实时</option>
        </select>
        <ComingSoonAction label="发起服务申请" />
      </div>
      <table className="table">
        <thead><tr><th>服务名</th><th>类型</th><th>时延</th><th>封装资产</th><th>安全分级</th><th>状态</th></tr></thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.id}>
              <td><button className="link" onClick={() => setSelectedId(s.id)}>{s.name}</button></td>
              <td>{s.type}</td>
              <td><Tag tone={LATENCY_TONE[s.latency] || 'default'}>{s.latency}</Tag></td>
              <td>{s.tableIds.length} 张表</td>
              <td><Tag tone={LEVEL_TONE[s.securityLevel]}>{s.securityLevel}</Tag></td>
              <td><Tag tone={STATUS_TONE[s.status] || 'default'}>{s.status}</Tag></td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <div className="empty-hint">暂无匹配的数据服务</div>}
    </div>
  );
}
