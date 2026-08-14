import { useState } from 'react';
import data from '../data.js';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

const STATUS_TONE = { 运行中: 'ok', 审批中: 'warn' };

export default function BatchFileModule({ onNavigate }) {
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  if (selectedId) {
    const b = data.batchFiles.find((x) => x.id === selectedId);
    const sourceTable = data.tables.find((t) => t.id === b.sourceTableId);
    return (
      <div className="detail-panel">
        <button className="link" onClick={() => setSelectedId(null)}>← 返回列表</button>
        <h3>{b.name}</h3>
        <div className="kv-list">
          <div>
            <span>源表</span>
            <b>
              {sourceTable?.nameCn}{' '}
              <button
                className="link"
                onClick={() => onNavigate('tableDetail', { tableId: b.sourceTableId, title: sourceTable?.nameCn })}
              >查看源表</button>
            </b>
          </div>
          <div><span>目标系统</span><b>{b.targetSystem}</b></div>
          <div><span>文件格式</span><b>{b.fileFormat}</b></div>
          <div><span>调度周期</span><b>{b.schedule}</b></div>
          <div><span>安全分级</span><b>{b.securityLevel}</b></div>
          <div><span>状态</span><Tag tone={STATUS_TONE[b.status] || 'default'}>{b.status}</Tag></div>
        </div>
        <h4>审批链</h4>
        {b.applyFlow.map((s, i) => (
          <div className="flow-step" key={i}>
            <span className="step-name">{s.step}</span>
            <span className="step-actor">{s.actor} · {s.time}</span>
            <span className="step-result">{s.result}</span>
          </div>
        ))}
      </div>
    );
  }

  const filtered = data.batchFiles.filter((b) => status === 'all' || b.status === status);
  return (
    <div>
      <div className="search-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="按状态筛选">
          <option value="all">全部状态</option>
          <option value="运行中">运行中</option>
          <option value="审批中">审批中</option>
        </select>
        <ComingSoonAction label="发起交换申请" />
      </div>
      <table className="table">
        <thead><tr><th>任务名</th><th>源表</th><th>目标系统</th><th>文件格式</th><th>调度周期</th><th>状态</th></tr></thead>
        <tbody>
          {filtered.map((b) => {
            const sourceTable = data.tables.find((t) => t.id === b.sourceTableId);
            return (
              <tr key={b.id}>
                <td><button className="link" onClick={() => setSelectedId(b.id)}>{b.name}</button></td>
                <td>{sourceTable?.nameCn}</td>
                <td>{b.targetSystem}</td>
                <td>{b.fileFormat}</td>
                <td>{b.schedule}</td>
                <td><Tag tone={STATUS_TONE[b.status] || 'default'}>{b.status}</Tag></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filtered.length === 0 && <div className="empty-hint">暂无匹配的批次交换任务</div>}
    </div>
  );
}
