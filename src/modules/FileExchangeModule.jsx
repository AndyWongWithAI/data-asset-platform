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
        <thead><tr><th>任务名</th><th>方向</th><th>源系统 · 源对象</th><th>目标系统 · 目标对象</th><th>文件格式</th><th>调度周期</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          {filtered.map((b) => {
            const inbound = b.direction === 'inbound';
            return (
              <tr key={b.id}>
                <td><button className="link" onClick={() => onNavigate('fileExchangeDetail', { fileExchangeId: b.id })}>{b.name}</button></td>
                <td><Tag tone={inbound ? 'ok' : 'default'}>{inbound ? '入站' : '出站'}</Tag></td>
                <td>
                  {b.sourceSystem} · {inbound ? b.sourceDatabaseName : b.sourceTableName}
                  {inbound && b.sourceDatabaseType && <span className="en">（{b.sourceDatabaseType}）</span>}
                </td>
                <td>{b.targetSystem} · {inbound ? b.targetDatabaseName : b.targetTableName}</td>
                <td>{b.fileFormat}</td>
                <td>{b.schedule}</td>
                <td><Tag tone={STATUS_TONE[b.status] || 'default'}>{b.status}</Tag></td>
                <td><ComingSoonAction label="编辑" variant="link" /> <ComingSoonAction label="删除" variant="link" /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filtered.length === 0 && <div className="empty-hint">暂无匹配的文件交换任务</div>}
    </div>
  );
}
