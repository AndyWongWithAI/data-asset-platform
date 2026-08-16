import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };

export default function PortalAssetDetail({ assetId, onBack }) {
  const { data } = useData();
  const asset = (data.portalAssets || []).find((a) => a.id === assetId);
  if (!asset) return <div className="empty-hint">未找到该资产</div>;

  const tables = (asset.tableIds || []).map((id) => data.tables.find((t) => t.id === id)).filter(Boolean);
  const services = (asset.serviceIds || []).map((id) => data.services.find((s) => s.id === id)).filter(Boolean);

  return (
    <div className="detail-panel">
      <button className="link" onClick={onBack}>← 返回目录</button>
      <h2>{asset.name}</h2>
      <div className="kv-list">
        <div><span>业务分类</span><b>{asset.category}</b></div>
        <div><span>安全分级</span><Tag tone={LEVEL_TONE[asset.securityLevel]}>{asset.securityLevel}</Tag></div>
        <div><span>使用方式</span><b>{asset.usageType}</b></div>
        <div><span>责任业务方</span><b>{asset.dataOwner}</b></div>
        <div><span>业务数据治理专员</span><b>{asset.govSpecialist}</b></div>
        <div><span>上架时间</span><b>{asset.listedAt}</b></div>
      </div>
      <h4>资产介绍</h4>
      <p>{asset.desc}</p>
      {tables.length > 0 && (<>
        <h4>包含数据</h4>
        <table className="table">
          <thead><tr><th>表名</th><th>说明</th></tr></thead>
          <tbody>{tables.map((t) => <tr key={t.id}><td>{t.nameCn}</td><td>{t.desc}</td></tr>)}</tbody>
        </table>
      </>)}
      {services.length > 0 && (<>
        <h4>关联服务</h4>
        <table className="table">
          <thead><tr><th>服务名</th><th>类型</th></tr></thead>
          <tbody>{services.map((s) => <tr key={s.id}><td>{s.name}</td><td>{s.type}</td></tr>)}</tbody>
        </table>
      </>)}
      <div className="portal-actions">
        <ComingSoonAction label={asset.usageType === '下载' ? '下载数据' : '申请开通'} />
      </div>
    </div>
  );
}
