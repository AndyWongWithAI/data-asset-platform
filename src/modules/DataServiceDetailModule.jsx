import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };
const LATENCY_TONE = { 实时: 'ok', 准实时: 'warn' };
const STATUS_TONE = { 已上架: 'ok' };

export default function DataServiceDetailModule({ onNavigate, assetId }) {
  const { data } = useData();
  const s = data.services.find((x) => x.id === assetId?.dataServiceId);
  if (!s) return <div className="empty-hint">未找到该数据服务</div>;
  return (
    <div className="detail-panel">
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
