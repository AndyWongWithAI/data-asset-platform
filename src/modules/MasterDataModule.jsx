import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import EntityForm from '../components/EntityForm.jsx';

export default function MasterDataModule({ onNavigate }) {
  const { data } = useData();
  const [type, setType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const filtered = data.masterData.filter((m) => type === 'all' || m.entityType === type);
  const types = [...new Set(data.masterData.map((m) => m.entityType))];
  return (
    <div>
      <div className="search-bar">
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="按实体类型筛选">
          <option value="all">全部类型</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn-primary" onClick={() => setShowForm(true)}>新增实体</button>
      </div>
      <table className="table">
        <thead><tr><th>唯一编码</th><th>实体类型</th><th>名称</th><th>权威字段</th></tr></thead>
        <tbody>
          {filtered.map((m) => (
            <tr key={m.id}>
              <td><button className="link" onClick={() => onNavigate('masterdataDetail', { masterDataId: m.id })}>{m.code}</button></td>
              <td>{m.entityType}</td>
              <td>{m.name}</td>
              <td>{Object.entries(m.attrs).map(([k, v]) => `${k}:${v}`).join('，')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <EntityForm entity="masterData" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />}
    </div>
  );
}
