import data from '../data.js';

export default function ValueDomainDetailModule({ onNavigate, assetId }) {
  const vd = data.valueDomains.find((v) => v.id === assetId?.valueDomainId);
  if (!vd) return <div className="empty-hint">未找到该值域</div>;
  const refs = data.infoItems.filter((i) => i.valueDomainId === vd.id);
  return (
    <div className="detail-panel">
      <h3>{vd.code}</h3>
      <div className="kv-list">
        <div><span>值域编号</span><code>{vd.code}</code></div>
        <div><span>数据类型</span><code>{vd.dataType}</code></div>
        <div><span>长度</span><b>{vd.length}</b></div>
        <div><span>精度</span><b>{vd.precision}</b></div>
      </div>
      <h4>被引用信息项（{refs.length}）</h4>
      <table className="table">
        <thead><tr><th>信息项编号</th><th>中文名</th></tr></thead>
        <tbody>
          {refs.map((i) => (
            <tr key={i.id}>
              <td>{i.code}</td>
              <td><button className="link" onClick={() => onNavigate('infoItemDetail', { infoItemId: i.id })}>{i.nameCn}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {refs.length === 0 && <div className="empty-hint">暂无信息项引用此值域</div>}
    </div>
  );
}
