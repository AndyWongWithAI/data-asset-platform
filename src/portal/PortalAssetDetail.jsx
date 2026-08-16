export default function PortalAssetDetail({ assetId, onBack }) {
  return <div className="detail-panel"><button className="link" onClick={onBack}>← 返回目录</button><p>资产详情（{assetId}）待实现</p></div>;
}
