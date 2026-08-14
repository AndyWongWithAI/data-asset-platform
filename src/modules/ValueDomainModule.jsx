import data from '../data.js';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

export default function ValueDomainModule({ onNavigate, assetId }) {
  const selectedId = assetId?.valueDomainId ?? null;

  if (selectedId) {
    const vd = data.valueDomains.find((v) => v.id === selectedId);
    const refs = data.infoItems.filter((i) => i.valueDomainId === selectedId);
    return (
      <div className="detail-panel">
        <button className="link" onClick={() => onNavigate('valueDomain', null)}>← 返回列表</button>
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
                <td><button className="link" onClick={() => onNavigate('infoItem', { infoItemId: i.id })}>{i.nameCn}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {refs.length === 0 && <div className="empty-hint">暂无信息项引用此值域</div>}
      </div>
    );
  }

  return (
    <div>
      <div className="search-bar">
        <ComingSoonAction label="新增值域" />
      </div>
      <table className="table">
        <thead><tr><th>值域编号</th><th>数据类型</th><th>长度</th><th>精度</th></tr></thead>
        <tbody>
          {data.valueDomains.map((v) => (
            <tr key={v.id}>
              <td><button className="link" onClick={() => onNavigate('valueDomain', { valueDomainId: v.id })}>{v.code}</button></td>
              <td><code>{v.dataType}</code></td>
              <td>{v.length}</td>
              <td>{v.precision}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
