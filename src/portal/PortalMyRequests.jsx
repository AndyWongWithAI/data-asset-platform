import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';

const STATUS_TONE = { 已开通: 'ok', 已下载: 'default', 审批中: 'warn', 已驳回: 'danger' };

export default function PortalMyRequests({ onOpenAsset }) {
  const { data } = useData();
  const requests = data.portalRequests || [];
  return (
    <div>
      <h2>我的申请</h2>
      <table className="table">
        <thead><tr><th>资产</th><th>类型</th><th>状态</th><th>申请时间</th><th>说明</th></tr></thead>
        <tbody>
          {requests.map((r) => {
            const asset = (data.portalAssets || []).find((a) => a.id === r.portalAssetId);
            return (
              <tr key={r.id}>
                <td>{asset ? <button className="link" onClick={() => onOpenAsset(asset.id)}>{asset.name}</button> : r.portalAssetId}</td>
                <td>{r.type}</td>
                <td><Tag tone={STATUS_TONE[r.status] || 'default'}>{r.status}</Tag></td>
                <td>{r.requestAt}</td>
                <td>{r.status === '审批中' ? '待业务数据治理专员审批' : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {requests.length === 0 && <div className="empty-hint">暂无申请记录</div>}
    </div>
  );
}
