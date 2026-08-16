import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';
import EntityForm from '../components/EntityForm.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };
const STATUS_TONE = { 已上架: 'ok', 审批中: 'warn', 已下架: 'default' };

export default function PortalManagementModule({ onNavigate }) {
  const { data } = useData();
  const [creating, setCreating] = useState(false);
  const assets = data.portalAssets || [];
  return (
    <div>
      <div className="search-bar">
        <button className="btn-primary" onClick={() => setCreating(true)}>发起上架</button>
        <ComingSoonAction label="批量导入" />
      </div>
      <table className="table">
        <thead><tr><th>资产名</th><th>分类</th><th>责任业务方</th><th>安全分级</th><th>状态</th><th>推荐位</th><th>上架时间</th><th>操作</th></tr></thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.id}>
              <td><button className="link" onClick={() => onNavigate('portalManagementDetail', { portalAssetId: a.id })}>{a.name}</button></td>
              <td>{a.category}</td>
              <td>{a.dataOwner}</td>
              <td><Tag tone={LEVEL_TONE[a.securityLevel]}>{a.securityLevel}</Tag></td>
              <td><Tag tone={STATUS_TONE[a.status] || 'default'}>{a.status}</Tag></td>
              <td>{a.featured ? '★' : '—'}</td>
              <td>{a.listedAt}</td>
              <td><ComingSoonAction label="编辑" variant="link" /> <ComingSoonAction label="下架" variant="link" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {creating && <EntityForm entity="portalAssets" mode="create" onClose={() => setCreating(false)} onSaved={() => setCreating(false)} />}
    </div>
  );
}
