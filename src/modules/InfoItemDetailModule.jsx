import { useData } from '../DataContext.jsx';

export default function InfoItemDetailModule({ onNavigate, assetId }) {
  const { data } = useData();
  const ii = data.infoItems.find((i) => i.id === assetId?.infoItemId);
  if (!ii) return <div className="empty-hint">未找到该信息项</div>;
  const vd = data.valueDomains.find((v) => v.id === ii.valueDomainId);
  const rd = ii.refDataId ? data.refDatas.find((r) => r.id === ii.refDataId) : null;
  const refs = data.fields.filter((f) => f.management.standardId === ii.id);
  const isTech = ii.type === '技术';
  const bizDomain = ii.bizDomainId ? data.bizDomains.find((b) => b.id === ii.bizDomainId) : null;
  return (
    <div className="detail-panel">
      <h3>{ii.nameCn}<span className="en">{ii.code}</span></h3>
      <div className="kv-list">
        <div><span>信息项编号</span><code>{ii.code}</code></div>
        <div><span>中文名</span><b>{ii.nameCn}</b></div>
        <div><span>英文名</span><code>{ii.nameEn}</code></div>
        <div><span>类型</span><b>{ii.type}</b></div>
        <div><span>业务域</span><b>{isTech ? '—' : (bizDomain?.name ?? '—')}</b></div>
        <div><span>定义</span><b>{isTech ? '—' : (ii.definition ?? '—')}</b></div>
        <div><span>值域</span>{vd ? <button className="link" onClick={() => onNavigate('valueDomainDetail', { valueDomainId: vd.id })}>{vd.code}</button> : '—'}</div>
        <div><span>参考数据</span>{rd ? <button className="link" onClick={() => onNavigate('refDataDetail', { refDataId: rd.id })}>{rd.name}（{rd.code}）</button> : '—'}</div>
      </div>
      <h4>被引用字段（{refs.length}）</h4>
      <table className="table">
        <thead><tr><th>字段名</th><th>所属表</th><th>操作</th></tr></thead>
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
      {refs.length === 0 && <div className="empty-hint">暂无字段引用此信息项</div>}
    </div>
  );
}
