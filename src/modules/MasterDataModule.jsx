import { useState } from 'react';
import data from '../data.js';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

export default function MasterDataModule({ onNavigate }) {
  const [type, setType] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  if (selectedId) {
    const md = data.masterData.find((m) => m.id === selectedId);
    const refs = data.fields.filter((f) => f.business.masterDataId === selectedId);
    return (
      <div className="detail-panel">
        <button className="link" onClick={() => setSelectedId(null)}>← 返回列表</button>
        <h3>{md.name}<span className="en">{md.code}</span></h3>
        <div className="kv-list">
          <div><span>实体类型</span><b>{md.entityType}</b></div>
          {Object.entries(md.attrs).map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
        </div>
        <h4>被引用字段（{refs.length}）</h4>
        <table className="table">
          <thead><tr><th>字段</th><th>所属表</th><th>操作</th></tr></thead>
          <tbody>
            {refs.map((f) => {
              const t = data.tables.find((x) => x.id === f.tableId);
              return (
                <tr key={f.id}>
                  <td>{f.business.nameCn}</td>
                  <td>{t?.nameCn}</td>
                  <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: f.tableId, fieldId: f.id, title: t?.nameCn })}>定位</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {refs.length === 0 && <div className="empty-hint">暂无字段引用此实体</div>}
      </div>
    );
  }

  const filtered = data.masterData.filter((m) => type === 'all' || m.entityType === type);
  const types = [...new Set(data.masterData.map((m) => m.entityType))];
  return (
    <div>
      <div className="search-bar">
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="按实体类型筛选">
          <option value="all">全部类型</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <ComingSoonAction label="新增实体" />
      </div>
      <table className="table">
        <thead><tr><th>唯一编码</th><th>实体类型</th><th>名称</th><th>权威字段</th></tr></thead>
        <tbody>
          {filtered.map((m) => (
            <tr key={m.id}>
              <td><button className="link" onClick={() => setSelectedId(m.id)}>{m.code}</button></td>
              <td>{m.entityType}</td>
              <td>{m.name}</td>
              <td>{Object.entries(m.attrs).map(([k, v]) => `${k}:${v}`).join('，')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
