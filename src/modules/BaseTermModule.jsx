import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import EntityForm from '../components/EntityForm.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

export default function BaseTermModule() {
  const { data } = useData();
  const [kind, setKind] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const filtered = data.baseTerms.filter((t) =>
    kind === 'all' || (kind === 'classWord' ? t.isClassWord : !t.isClassWord)
  );
  const preview = (t) =>
    t.synonyms.length
      ? t.synonyms.slice(0, 3).join('，') + (t.synonyms.length > 3 ? '…' : '')
      : '—';
  return (
    <div>
      <div className="search-bar">
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="按是否类词筛选">
          <option value="all">全部</option>
          <option value="classWord">类词</option>
          <option value="nonClassWord">非类词</option>
        </select>
        <button className="btn-primary" onClick={() => setShowForm(true)}>新增术语</button>
        <ComingSoonAction label="批量导入" />
      </div>
      <table className="table">
        <thead><tr><th>中文名</th><th>英文名</th><th>同义词</th><th>是否类词</th><th>操作</th></tr></thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.id}>
              <td>{t.nameCn}</td>
              <td><code>{t.nameEn}</code></td>
              <td>{preview(t)}</td>
              <td>{t.isClassWord ? <Tag tone="ok">类词</Tag> : '—'}</td>
              <td><ComingSoonAction label="编辑" variant="link" /> <ComingSoonAction label="停用" variant="link" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <EntityForm entity="baseTerms" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />}
    </div>
  );
}
