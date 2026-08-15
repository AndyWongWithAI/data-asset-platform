import { useState } from 'react';
import { useData } from '../DataContext.jsx';

export default function CatalogModule({ onNavigate }) {
  const { data } = useData();
  const [appId, setAppId] = useState('all');
  const [domainId, setDomainId] = useState('all');
  const [keyword, setKeyword] = useState('');

  const filtered = data.tables.filter((t) => {
    if (appId !== 'all' && t.appId !== appId) return false;
    if (domainId !== 'all' && t.bizDomainId !== domainId) return false;
    if (keyword && !(t.nameCn.includes(keyword) || t.nameEn.includes(keyword))) return false;
    return true;
  });

  return (
    <div className="catalog">
      <div className="search-bar">
        <select value={appId} onChange={(e) => setAppId(e.target.value)} aria-label="按应用筛选">
          <option value="all">全部应用</option>
          {data.applications.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={domainId} onChange={(e) => setDomainId(e.target.value)} aria-label="按业务域筛选">
          <option value="all">全部业务域</option>
          {data.bizDomains.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <input placeholder="按表名检索（子字符串匹配）…" value={keyword}
          onChange={(e) => setKeyword(e.target.value)} />
      </div>
      <table className="table">
        <thead><tr><th>表名</th><th>应用</th><th>库</th><th>业务域</th><th>操作</th></tr></thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.id}>
              <td>{t.nameCn}<span className="en">{t.nameEn}</span></td>
              <td>{data.applications.find((a) => a.id === t.appId)?.name}</td>
              <td>{data.databases.find((d) => d.id === t.dbId)?.name}</td>
              <td>{data.bizDomains.find((b) => b.id === t.bizDomainId)?.name}</td>
              <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: t.id, title: t.nameCn })}>查看</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <div className="empty-hint">无匹配的表，请调整筛选条件</div>}
    </div>
  );
}
