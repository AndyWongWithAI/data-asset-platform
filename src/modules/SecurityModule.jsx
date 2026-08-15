import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import EntityForm from '../components/EntityForm.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };

export default function SecurityModule({ onNavigate }) {
  const { data } = useData();
  const [tab, setTab] = useState('overview');
  const [editingLevel, setEditingLevel] = useState(null);
  const countByLevel = (lv) => data.fields.filter((f) => f.management.securityLevel === lv).length;

  return (
    <div>
      <div className="sub-tabs">
        <button className={tab === 'overview' ? 'sub-active' : ''} onClick={() => setTab('overview')}>分级总览</button>
        <button className={tab === 'detail' ? 'sub-active' : ''} onClick={() => setTab('detail')}>分级明细</button>
      </div>

      {tab === 'overview' && (
        <div>
          {data.security.map((s) => (
            <div key={s.level} className="score-row">
              <Tag tone={LEVEL_TONE[s.level]}>{s.level} · {s.name}</Tag>
              <div className="score-info">
                <span>{s.desc}</span>
                <span>脱敏策略：{s.mask || '无'}</span>
                <span>字段数：{countByLevel(s.level)}</span>
              </div>
              <button className="link" onClick={() => setEditingLevel(s)}>调整</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'detail' && (
        <table className="table">
          <thead><tr><th>级别</th><th>名称</th><th>描述</th><th>脱敏策略</th><th>定位数量</th><th>操作</th></tr></thead>
          <tbody>
            {data.security.map((s) => (
              <tr key={s.level}>
                <td><Tag tone={LEVEL_TONE[s.level]}>{s.level}</Tag></td>
                <td>{s.name}</td>
                <td>{s.desc}</td>
                <td>{s.mask || '无'}</td>
                <td>{countByLevel(s.level)}</td>
                <td><button className="link" onClick={() => onNavigate('securityDetail', { securityLevel: s.level })}>{s.level} · {s.name}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editingLevel && <EntityForm entity="security" mode="update" record={editingLevel} onClose={() => setEditingLevel(null)} onSaved={() => setEditingLevel(null)} />}
    </div>
  );
}
