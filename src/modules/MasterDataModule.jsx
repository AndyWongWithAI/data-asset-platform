import { useState } from 'react';
import { useData } from '../DataContext.jsx';

export default function MasterDataModule({ onNavigate }) {
  const { data } = useData();
  const [type, setType] = useState('all');
  const filtered = data.masterData.filter((m) => type === 'all' || m.entityType === type);
  const types = [...new Set(data.masterData.map((m) => m.entityType))];
  return (
    <div>
      <div className="search-bar">
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="按实体类型筛选">
          <option value="all">全部类型</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn-primary" onClick={() => alert('主数据由外部系统同步，本平台不直接新增（功能开发中）')}>同步</button>
      </div>
      <table className="table">
        <thead><tr><th>资产编码</th><th>中文名</th><th>业务定义</th><th>业务规则</th><th>数据Owner</th></tr></thead>
        <tbody>
          {filtered.map((m) => (
            <tr key={m.id}>
              <td><button className="link" onClick={() => onNavigate('masterdataDetail', { masterDataId: m.id })}>{m.code}</button></td>
              <td>{m.name}</td>
              <td>{m.definition ?? '—'}</td>
              <td>{m.rule ?? '—'}</td>
              <td>{m.owner ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
