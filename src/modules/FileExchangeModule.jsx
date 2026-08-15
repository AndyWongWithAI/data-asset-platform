import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

const STATUS_TONE = { 运行中: 'ok', 审批中: 'warn' };

export default function FileExchangeModule({ onNavigate }) {
  const { data } = useData();
  const [status, setStatus] = useState('all');
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
        <thead><tr><th>任务名</th><th>源系统 · 源表</th><th>目标系统 · 目标表</th><th>文件格式</th><th>调度周期</th><th>状态</th></tr></thead>
        <tbody>
          {filtered.map((b) => (
            <tr key={b.id}>
              <td><button className="link" onClick={() => onNavigate('fileExchangeDetail', { fileExchangeId: b.id })}>{b.name}</button></td>
              <td>{b.sourceSystem} · {b.sourceTableName}</td>
              <td>{b.targetSystem} · {b.targetTableName}</td>
              <td>{b.fileFormat}</td>
              <td>{b.schedule}</td>
              <td><Tag tone={STATUS_TONE[b.status] || 'default'}>{b.status}</Tag></td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <div className="empty-hint">暂无匹配的文件交换任务</div>}
    </div>
  );
}
