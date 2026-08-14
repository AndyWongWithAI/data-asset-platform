import data from '../data.js';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

export default function RefDataModule({ onNavigate, assetId }) {
  const selectedId = assetId?.refDataId ?? null;

  if (selectedId) {
    const rd = data.refDatas.find((r) => r.id === selectedId);
    const refs = data.infoItems.filter((i) => i.refDataId === selectedId);
    return (
      <div className="detail-panel">
        <button className="link" onClick={() => onNavigate('refData', null)}>← 返回列表</button>
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
                <td><button className="link" onClick={() => onNavigate('infoItem', { infoItemId: i.id })}>{i.nameCn}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {refs.length === 0 && <div className="empty-hint">暂无信息项引用此参考数据</div>}
      </div>
    );
  }

  return (
    <div>
      <div className="search-bar">
        <ComingSoonAction label="新增参考数据" />
      </div>
      <table className="table">
        <thead><tr><th>编号</th><th>名称</th><th>枚举值数</th></tr></thead>
        <tbody>
          {data.refDatas.map((r) => (
            <tr key={r.id}>
              <td><button className="link" onClick={() => onNavigate('refData', { refDataId: r.id })}>{r.code}</button></td>
              <td>{r.name}</td>
              <td>{r.values.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
