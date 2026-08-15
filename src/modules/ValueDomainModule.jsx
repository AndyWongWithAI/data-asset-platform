import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import EntityForm from '../components/EntityForm.jsx';

export default function ValueDomainModule({ onNavigate }) {
  const { data } = useData();
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      <div className="search-bar">
        <button className="btn-primary" onClick={() => setShowForm(true)}>新增值域</button>
      </div>
      <table className="table">
        <thead><tr><th>值域编号</th><th>数据类型</th><th>长度</th><th>精度</th></tr></thead>
        <tbody>
          {data.valueDomains.map((v) => (
            <tr key={v.id}>
              <td><button className="link" onClick={() => onNavigate('valueDomainDetail', { valueDomainId: v.id })}>{v.code}</button></td>
              <td><code>{v.dataType}</code></td>
              <td>{v.length}</td>
              <td>{v.precision}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <EntityForm entity="valueDomains" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />}
    </div>
  );
}
