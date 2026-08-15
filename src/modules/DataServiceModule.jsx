import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };
const LATENCY_TONE = { 实时: 'ok', 准实时: 'warn' };
const STATUS_TONE = { 已上架: 'ok' };

export default function DataServiceModule({ onNavigate }) {
  const { data } = useData();
  const [latency, setLatency] = useState('all');
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
              <td><button className="link" onClick={() => onNavigate('dataServiceDetail', { dataServiceId: s.id })}>{s.name}</button></td>
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
