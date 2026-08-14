import { useState } from 'react';
import data from '../data.js';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

export default function BaseTermModule() {
  const [kind, setKind] = useState('all');

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
        <ComingSoonAction label="新增术语" />
      </div>
      <table className="table">
        <thead><tr><th>中文名</th><th>英文名</th><th>同义词</th><th>是否类词</th></tr></thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.id}>
              <td>{t.nameCn}</td>
              <td><code>{t.nameEn}</code></td>
              <td>{preview(t)}</td>
              <td>{t.isClassWord ? <Tag tone="ok">类词</Tag> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
