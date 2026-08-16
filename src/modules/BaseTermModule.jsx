import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import EntityForm from '../components/EntityForm.jsx';
import BulkImport from '../components/BulkImport.jsx';

export default function BaseTermModule() {
  const { data, updateRecord } = useData();
  const [kind, setKind] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const filtered = data.baseTerms.filter((t) =>
    kind === 'all' || (kind === 'classWord' ? t.isClassWord : !t.isClassWord)
  );
  const preview = (t) =>
    t.synonyms.length
      ? t.synonyms.slice(0, 3).join('，') + (t.synonyms.length > 3 ? '…' : '')
      : '—';
  const toggleStatus = (t) => updateRecord('baseTerms', t.id, { status: t.status === '停用' ? '启用' : '停用' });
  return (
    <div>
      <div className="search-bar">
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="按是否类词筛选">
          <option value="all">全部</option>
          <option value="classWord">类词</option>
          <option value="nonClassWord">非类词</option>
        </select>
        <button className="btn-primary" onClick={() => setShowForm(true)}>新增术语</button>
        <button className="btn-secondary" onClick={() => setShowImport(true)}>批量导入</button>
      </div>
      <table className="table">
        <thead><tr><th>中文名</th><th>英文名</th><th>同义词</th><th>是否类词</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.id}>
              <td>{t.nameCn}</td>
              <td><code>{t.nameEn}</code></td>
              <td>{preview(t)}</td>
              <td>{t.isClassWord ? <Tag tone="ok">类词</Tag> : '—'}</td>
              <td>{t.status === '停用' ? <Tag tone="warn">停用</Tag> : <Tag tone="ok">启用</Tag>}</td>
              <td><button className="link" onClick={() => setEditItem(t)}>编辑</button> <button className="link" onClick={() => toggleStatus(t)}>{t.status === '停用' ? '启用' : '停用'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <EntityForm entity="baseTerms" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />}
      {editItem && <EntityForm entity="baseTerms" mode="update" record={editItem} onClose={() => setEditItem(null)} onSaved={() => setEditItem(null)} />}
      {showImport && <BulkImport entity="baseTerms" onClose={() => setShowImport(false)} onSaved={() => setShowImport(false)} />}
    </div>
  );
}
