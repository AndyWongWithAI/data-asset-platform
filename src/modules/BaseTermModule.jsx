import { useState } from 'react';
import data from '../data.js';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

export default function BaseTermModule() {
  const [kind, setKind] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  if (selectedId) {
    const term = data.baseTerms.find((t) => t.id === selectedId);
    return (
      <div className="detail-panel">
        <button className="link" onClick={() => setSelectedId(null)}>← 返回列表</button>
        <h3>{term.nameCn}<span className="en">{term.nameEn}</span></h3>
        <div className="kv-list">
          <div><span>中文名</span><b>{term.nameCn}</b></div>
          <div><span>英文名</span><code>{term.nameEn}</code></div>
          <div>
            <span>是否类词</span>
            {term.isClassWord ? <Tag tone="ok">类词</Tag> : <b>非类词</b>}
          </div>
          <div><span>同义词</span><b>{term.synonyms.length ? term.synonyms.join('、') : '—'}</b></div>
        </div>
      </div>
    );
  }

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
              <td><button className="link" onClick={() => setSelectedId(t.id)}>{t.nameCn}</button></td>
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
