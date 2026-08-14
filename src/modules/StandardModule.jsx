import { useState } from 'react';
import data from '../data.js';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

export default function StandardModule({ onNavigate }) {
  const [kind, setKind] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  if (selectedId) {
    const std = data.standards.find((s) => s.id === selectedId);
    const refs = data.fields.filter((f) => f.management.standardId === selectedId);
    return (
      <div className="detail-panel">
        <button className="link" onClick={() => setSelectedId(null)}>← 返回列表</button>
        <h3>{std.name}<span className="en">{std.code}</span></h3>
        <div className="kv-list">
          <div><span>标准类型</span><b>{std.kind === 'code' ? '码表' : '字段标准'}</b></div>
          {std.kind === 'code' ? (
            <div><span>枚举值</span><b>{std.values.join(' / ')}</b></div>
          ) : (
            <>
              <div><span>字段名</span><code>{std.fieldStd.name}</code></div>
              <div><span>类型</span><code>{std.fieldStd.type}</code></div>
              <div><span>单位</span><b>{std.fieldStd.unit}</b></div>
              <div><span>取值域</span><b>{std.fieldStd.domain}</b></div>
            </>
          )}
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
        {refs.length === 0 && <div className="empty-hint">暂无字段引用此标准</div>}
      </div>
    );
  }

  const filtered = data.standards.filter((s) => kind === 'all' || s.kind === kind);
  const preview = (s) => s.kind === 'code'
    ? s.values.slice(0, 3).join(' / ') + (s.values.length > 3 ? '…' : '')
    : `${s.fieldStd.unit} · ${s.fieldStd.domain}`;
  return (
    <div>
      <div className="search-bar">
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="按类型筛选">
          <option value="all">全部类型</option>
          <option value="code">码表</option>
          <option value="field">字段标准</option>
        </select>
        <ComingSoonAction label="新增标准" />
      </div>
      <table className="table">
        <thead><tr><th>标准编码</th><th>名称</th><th>类型</th><th>内容预览</th></tr></thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.id}>
              <td><button className="link" onClick={() => setSelectedId(s.id)}>{s.code}</button></td>
              <td>{s.name}</td>
              <td>{s.kind === 'code' ? '码表' : '字段标准'}</td>
              <td>{preview(s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
