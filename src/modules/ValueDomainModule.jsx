import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import EntityForm from '../components/EntityForm.jsx';
import BulkImport from '../components/BulkImport.jsx';

export default function ValueDomainModule({ onNavigate }) {
  const { data, updateRecord } = useData();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const toggleStatus = (v) => updateRecord('valueDomains', v.id, { status: v.status === '停用' ? '启用' : '停用' });
  return (
    <div>
      <div className="search-bar">
        <button className="btn-primary" onClick={() => setShowForm(true)}>新增值域</button>
        <button className="btn-secondary" onClick={() => setShowImport(true)}>批量导入</button>
      </div>
      <table className="table">
        <thead><tr><th>值域编号</th><th>数据类型</th><th>长度</th><th>精度</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          {data.valueDomains.map((v) => (
            <tr key={v.id}>
              <td><button className="link" onClick={() => onNavigate('valueDomainDetail', { valueDomainId: v.id })}>{v.code}</button></td>
              <td><code>{v.dataType}</code></td>
              <td>{v.length}</td>
              <td>{v.precision}</td>
              <td>{v.status === '停用' ? <Tag tone="warn">停用</Tag> : <Tag tone="ok">启用</Tag>}</td>
              <td><button className="link" onClick={() => setEditItem(v)}>编辑</button> <button className="link" onClick={() => toggleStatus(v)}>{v.status === '停用' ? '启用' : '停用'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <EntityForm entity="valueDomains" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />}
      {editItem && <EntityForm entity="valueDomains" mode="update" record={editItem} onClose={() => setEditItem(null)} onSaved={() => setEditItem(null)} />}
      {showImport && <BulkImport entity="valueDomains" onClose={() => setShowImport(false)} onSaved={() => setShowImport(false)} />}
    </div>
  );
}
