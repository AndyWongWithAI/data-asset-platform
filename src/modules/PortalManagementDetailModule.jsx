import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };

export default function PortalManagementDetailModule({ assetId }) {
  const { data } = useData();
  const asset = data.portalAssets.find((a) => a.id === assetId?.portalAssetId);
  if (!asset) return <div className="empty-hint">未找到该资产（portalAssetId: {assetId?.portalAssetId ?? '—'}）</div>;

  const tables = (asset.tableIds || []).map((id) => data.tables.find((t) => t.id === id)).filter(Boolean);
  const services = (asset.serviceIds || []).map((id) => data.services.find((s) => s.id === id)).filter(Boolean);

  return (
    <div className="detail-panel">
      <h3>{asset.name}</h3>
      <div className="kv-list">
        <div><span>业务分类</span><b>{asset.category}</b></div>
        <div><span>责任业务方</span><b>{asset.dataOwner}</b></div>
        <div><span>业务数据治理专员</span><b>{asset.govSpecialist}</b></div>
        <div><span>安全分级</span><Tag tone={LEVEL_TONE[asset.securityLevel]}>{asset.securityLevel}</Tag></div>
        <div><span>使用方式</span><b>{asset.usageType}</b></div>
        <div><span>状态</span><b>{asset.status}</b></div>
      </div>
      <h4>审批链（demo）</h4>
      {asset.approval.map((step, i) => (
        <div key={i} className="flow-step">
          <span className="flow-step-title">{step.step}</span>
          <span>{step.actor} · {step.action} · {step.time}</span>
          {step.comment && <span>（{step.comment}）</span>}
        </div>
      ))}
      <h4>打包对象</h4>
      <p>表：{tables.map((t) => t.nameCn).join('、') || '—'}；服务：{services.map((s) => s.name).join('、') || '—'}</p>
    </div>
  );
}
