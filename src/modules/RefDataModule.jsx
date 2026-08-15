import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import EntityForm from '../components/EntityForm.jsx';

export default function RefDataModule({ onNavigate }) {
  const { data } = useData();
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      <div className="search-bar">
        <button className="btn-primary" onClick={() => setShowForm(true)}>新增参考数据</button>
      </div>
      <table className="table">
        <thead><tr><th>编号</th><th>名称</th><th>枚举值数</th></tr></thead>
        <tbody>
          {data.refDatas.map((r) => (
            <tr key={r.id}>
              <td><button className="link" onClick={() => onNavigate('refDataDetail', { refDataId: r.id })}>{r.code}</button></td>
              <td>{r.name}</td>
              <td>{r.values.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <EntityForm entity="refDatas" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />}
    </div>
  );
}
