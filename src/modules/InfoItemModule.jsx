import data from '../data.js';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

export default function InfoItemModule({ onNavigate, assetId }) {
  const selectedId = assetId?.infoItemId ?? null;

  if (selectedId) {
    const ii = data.infoItems.find((i) => i.id === selectedId);
    if (!ii) return <div className="empty-hint">未找到该信息项</div>;
    const vd = data.valueDomains.find((v) => v.id === ii.valueDomainId);
    const rd = ii.refDataId ? data.refDatas.find((r) => r.id === ii.refDataId) : null;
    const refs = data.fields.filter((f) => f.management.standardId === selectedId);
    const isTech = ii.type === '技术';
    const bizDomain = ii.bizDomainId ? data.bizDomains.find((b) => b.id === ii.bizDomainId) : null;
    return (
      <div className="detail-panel">
        <button className="link" onClick={() => onNavigate('infoItem', null)}>← 返回列表</button>
        <h3>{ii.nameCn}<span className="en">{ii.code}</span></h3>
        <div className="kv-list">
          <div><span>信息项编号</span><code>{ii.code}</code></div>
          <div><span>中文名</span><b>{ii.nameCn}</b></div>
          <div><span>英文名</span><code>{ii.nameEn}</code></div>
          <div><span>类型</span><b>{ii.type}</b></div>
          <div><span>业务域</span><b>{isTech ? '—' : (bizDomain?.name ?? '—')}</b></div>
          <div><span>定义</span><b>{isTech ? '—' : (ii.definition ?? '—')}</b></div>
          <div><span>值域</span><code>{vd?.code ?? '—'}</code></div>
          <div><span>参考数据</span><b>{rd ? `${rd.name}（${rd.code}）` : '—'}</b></div>
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

  const vdCode = (id) => data.valueDomains.find((v) => v.id === id)?.code ?? '—';
  const rdName = (id) => (id ? data.refDatas.find((r) => r.id === id)?.name ?? '—' : '—');
  return (
    <div>
      <div className="search-bar">
        <ComingSoonAction label="新增信息项" />
      </div>
      <table className="table">
        <thead><tr><th>信息项编号</th><th>中文名</th><th>英文名</th><th>类型</th><th>值域</th><th>参考数据</th></tr></thead>
        <tbody>
          {data.infoItems.map((i) => (
            <tr key={i.id}>
              <td><button className="link" onClick={() => onNavigate('infoItem', { infoItemId: i.id })}>{i.code}</button></td>
              <td>{i.nameCn}</td>
              <td><code>{i.nameEn}</code></td>
              <td>{i.type}</td>
              <td><code>{vdCode(i.valueDomainId)}</code></td>
              <td>{rdName(i.refDataId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
