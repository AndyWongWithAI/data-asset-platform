import { useState } from 'react';
import data from '../data.js';
import FieldMetaCard from '../components/FieldMetaCard.jsx';

export default function CatalogModule({ assetId, onNavigate }) {
  const [keyword, setKeyword] = useState('');
  const [selectedTableId, setSelectedTableId] = useState(assetId?.tableId ?? null);

  const filtered = data.tables.filter((t) => {
    if (!keyword) return true;
    const app = data.applications.find((a) => a.id === t.appId)?.name || '';
    return t.nameCn.includes(keyword) || t.nameEn.includes(keyword) || app.includes(keyword);
  });

  const selected = data.tables.find((t) => t.id === selectedTableId);
  const fields = selected ? data.fields.filter((f) => f.tableId === selected.id) : [];

  return (
    <div className="catalog">
      <div className="search-bar">
        <input placeholder="检索应用 / 库 / 表名…" value={keyword}
          onChange={(e) => setKeyword(e.target.value)} />
      </div>
      <div className="catalog-layout">
        <table className="table">
          <thead><tr><th>表名</th><th>应用</th><th>库</th><th>业务域</th></tr></thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className={t.id === selectedTableId ? 'row-active' : ''}
                onClick={() => setSelectedTableId(t.id)}>
                <td>{t.nameCn}<span className="en">{t.nameEn}</span></td>
                <td>{data.applications.find((a) => a.id === t.appId)?.name}</td>
                <td>{data.databases.find((d) => d.id === t.dbId)?.name}</td>
                <td>{data.bizDomains.find((b) => b.id === t.bizDomainId)?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {selected && (
          <div className="detail">
            <h3>{selected.nameCn}</h3>
            <p className="en">{selected.nameEn} · {selected.tableType} · {selected.desc}</p>
            {fields.map((f) => (
              <FieldMetaCard key={f.id} field={f} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
