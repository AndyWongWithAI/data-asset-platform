import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import EntityForm from '../components/EntityForm.jsx';

export default function InfoItemModule({ onNavigate }) {
  const { data } = useData();
  const [showForm, setShowForm] = useState(false);
  const vdCode = (id) => data.valueDomains.find((v) => v.id === id)?.code ?? '—';
  const rdName = (id) => (id ? data.refDatas.find((r) => r.id === id)?.name ?? '—' : '—');
  return (
    <div>
      <div className="search-bar">
        <button className="btn-primary" onClick={() => setShowForm(true)}>新增信息项</button>
      </div>
      <table className="table">
        <thead><tr><th>信息项编号</th><th>中文名</th><th>英文名</th><th>类型</th><th>值域</th><th>参考数据</th></tr></thead>
        <tbody>
          {data.infoItems.map((i) => (
            <tr key={i.id}>
              <td><button className="link" onClick={() => onNavigate('infoItemDetail', { infoItemId: i.id })}>{i.code}</button></td>
              <td>{i.nameCn}</td>
              <td><code>{i.nameEn}</code></td>
              <td>{i.type}</td>
              <td><code>{vdCode(i.valueDomainId)}</code></td>
              <td>{rdName(i.refDataId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <EntityForm entity="infoItems" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />}
    </div>
  );
}
