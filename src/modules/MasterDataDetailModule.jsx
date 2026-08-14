import data from '../data.js';

export default function MasterDataDetailModule({ onNavigate, assetId }) {
  const md = data.masterData.find((m) => m.id === assetId?.masterDataId);
  if (!md) return <div className="empty-hint">未找到该主数据实体</div>;
  const refs = data.fields.filter((f) => f.business.masterDataId === md.id);
  return (
    <div className="detail-panel">
      <h3>{md.name}<span className="en">{md.code}</span></h3>
      <div className="kv-list">
        <div><span>实体类型</span><b>{md.entityType}</b></div>
        {Object.entries(md.attrs).map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
      </div>
      <h4>被引用字段（{refs.length}）</h4>
      <table className="table">
        <thead><tr><th>字段</th><th>所属表</th><th>操作</th></tr></thead>
        <tbody>
          {refs.map((f) => {
            const t = data.tables.find((x) => x.id === f.tableId);
            return (
              <tr key={f.id}>
                <td>{f.business.nameCn}</td>
                <td>{t?.nameCn}</td>
                <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: f.tableId, fieldId: f.id, title: t?.nameCn })}>定位</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {refs.length === 0 && <div className="empty-hint">暂无字段引用此实体</div>}
    </div>
  );
}
