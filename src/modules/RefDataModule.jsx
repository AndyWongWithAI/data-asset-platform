import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import EntityForm from '../components/EntityForm.jsx';
import BulkImport from '../components/BulkImport.jsx';

export default function RefDataModule({ onNavigate }) {
  const { data, updateRecord } = useData();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const toggleStatus = (r) => updateRecord('refDatas', r.id, { status: r.status === '停用' ? '启用' : '停用' });
  return (
    <div>
      <div className="search-bar">
        <button className="btn-primary" onClick={() => setShowForm(true)}>新增参考数据</button>
        <button className="btn-secondary" onClick={() => setShowImport(true)}>批量导入</button>
      </div>
      <table className="table">
        <thead><tr><th>编号</th><th>名称</th><th>枚举值数</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          {data.refDatas.map((r) => (
            <tr key={r.id}>
              <td><button className="link" onClick={() => onNavigate('refDataDetail', { refDataId: r.id })}>{r.code}</button></td>
              <td>{r.name}</td>
              <td>{r.values.length}</td>
              <td>{r.status === '停用' ? <Tag tone="warn">停用</Tag> : <Tag tone="ok">启用</Tag>}</td>
              <td><button className="link" onClick={() => setEditItem(r)}>编辑</button> <button className="link" onClick={() => toggleStatus(r)}>{r.status === '停用' ? '启用' : '停用'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <EntityForm entity="refDatas" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />}
      {editItem && <EntityForm entity="refDatas" mode="update" record={editItem} onClose={() => setEditItem(null)} onSaved={() => setEditItem(null)} />}
      {showImport && <BulkImport entity="refDatas" onClose={() => setShowImport(false)} onSaved={() => setShowImport(false)} />}
    </div>
  );
}
