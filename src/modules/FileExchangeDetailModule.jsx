import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';

const STATUS_TONE = { 运行中: 'ok', 审批中: 'warn' };

export default function FileExchangeDetailModule({ onNavigate, assetId }) {
  const { data } = useData();
  const b = data.batchFiles.find((x) => x.id === assetId?.fileExchangeId);
  if (!b) return <div className="empty-hint">未找到该文件交换任务</div>;
  return (
    <div className="detail-panel">
      <h3>{b.name}</h3>
      <div className="kv-list">
        <div><span>源系统</span><b>{b.sourceSystem}</b></div>
        <div>
          <span>源表</span>
          <b>
            {b.sourceTableName}{' '}
            {b.sourceTableId && (
              <button className="link" onClick={() => onNavigate('tableDetail', { tableId: b.sourceTableId, title: b.sourceTableName })}>查看</button>
            )}
          </b>
        </div>
        <div><span>目标系统</span><b>{b.targetSystem}</b></div>
        <div>
          <span>目标表</span>
          <b>
            {b.targetTableName}{' '}
            {b.targetTableId && (
              <button className="link" onClick={() => onNavigate('tableDetail', { tableId: b.targetTableId, title: b.targetTableName })}>查看</button>
            )}
          </b>
        </div>
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
