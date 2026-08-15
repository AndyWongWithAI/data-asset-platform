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
  const [type, setType] = useState('all');
  const [keyword, setKeyword] = useState('');

  const filtered = data.services.filter((s) => {
    if (latency !== 'all' && s.latency !== latency) return false;
    if (type !== 'all' && s.type !== type) return false;
    if (keyword && !(s.name.includes(keyword) || s.desc.includes(keyword))) return false;
    return true;
  });

  return (
    <div>
      <div className="search-bar">
        <input placeholder="按服务名/描述检索…" value={keyword}
          onChange={(e) => setKeyword(e.target.value)} aria-label="按服务名或描述检索" />
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="按类型筛选">
          <option value="all">全部类型</option>
          <option value="API">API</option>
          <option value="订阅">订阅</option>
          <option value="数据包">数据包</option>
        </select>
        <select value={latency} onChange={(e) => setLatency(e.target.value)} aria-label="按时延筛选">
          <option value="all">全部时延</option>
          <option value="实时">实时</option>
          <option value="准实时">准实时</option>
        </select>
      </div>
      <table className="table">
        <thead><tr><th>服务名</th><th>类型</th><th>时延</th><th>封装资产</th><th>安全分级</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          {filtered.map((s) => {
            const firstTable = data.tables.find((t) => t.id === s.tableIds[0]);
            return (
              <tr key={s.id}>
                <td><button className="link" onClick={() => onNavigate('dataServiceDetail', { dataServiceId: s.id })}>{s.name}</button></td>
                <td>{s.type}</td>
                <td><Tag tone={LATENCY_TONE[s.latency] || 'default'}>{s.latency}</Tag></td>
                <td>
                  {firstTable ? (
                    <>
                      <button className="link" onClick={() => onNavigate('tableDetail', { tableId: firstTable.id, title: firstTable.nameCn })}>
                        {firstTable.nameCn}
                      </button>
                      {s.tableIds.length > 1 && <span> 等 {s.tableIds.length} 张表</span>}
                    </>
                  ) : (
                    <span>{s.tableIds.length} 张表</span>
                  )}
                </td>
                <td><Tag tone={LEVEL_TONE[s.securityLevel]}>{s.securityLevel}</Tag></td>
                <td><Tag tone={STATUS_TONE[s.status] || 'default'}>{s.status}</Tag></td>
                <td><ComingSoonAction label="申请/订阅" /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filtered.length === 0 && <div className="empty-hint">暂无匹配的数据服务</div>}
    </div>
  );
}
