import data from '../data.js';

export default function RefDataDetailModule({ onNavigate, assetId }) {
  const rd = data.refDatas.find((r) => r.id === assetId?.refDataId);
  if (!rd) return <div className="empty-hint">未找到该参考数据</div>;
  const refs = data.infoItems.filter((i) => i.refDataId === rd.id);
  return (
    <div className="detail-panel">
      <h3>{rd.name}<span className="en">{rd.code}</span></h3>
      <div className="kv-list">
        <div><span>编号</span><code>{rd.code}</code></div>
        <div><span>名称</span><b>{rd.name}</b></div>
        <div><span>枚举值数</span><b>{rd.values.length}</b></div>
      </div>
      <h4>枚举值（{rd.values.length}）</h4>
      <table className="table">
        <thead><tr><th>枚举值编号</th><th>枚举值名称</th></tr></thead>
        <tbody>
          {rd.values.map((v) => (
            <tr key={v.code}>
              <td><code>{v.code}</code></td>
              <td>{v.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
      {refs.length === 0 && <div className="empty-hint">暂无信息项引用此参考数据</div>}
    </div>
  );
}
