import { useState } from 'react';
import data from '../data.js';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };

export default function SecurityModule({ onNavigate }) {
  const [tab, setTab] = useState('overview');
  const countByLevel = (lv) => data.fields.filter((f) => f.management.securityLevel === lv).length;
  const highRisk = data.fields.filter((f) => f.management.securityLevel === 'L3' || f.management.securityLevel === 'L4');

  return (
    <div>
      <div className="sub-tabs">
        <button className={tab === 'overview' ? 'sub-active' : ''} onClick={() => setTab('overview')}>分级总览</button>
        <button className={tab === 'highrisk' ? 'sub-active' : ''} onClick={() => setTab('highrisk')}>高风险清单</button>
        <button className={tab === 'mask' ? 'sub-active' : ''} onClick={() => setTab('mask')}>脱敏前后对比</button>
      </div>

      {tab === 'overview' && (
        <div>
          <div className="search-bar"><ComingSoonAction label="分级调整" /></div>
          {data.security.map((s) => (
            <div key={s.level} className="score-row">
              <Tag tone={LEVEL_TONE[s.level]}>{s.level} · {s.name}</Tag>
              <div className="score-info">
                <span>{s.desc}</span>
                <span>脱敏策略：{s.mask || '无'}</span>
                <span>字段数：{countByLevel(s.level)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'highrisk' && (
        <table className="table">
          <thead><tr><th>字段</th><th>所属表</th><th>安全分级</th><th>操作</th></tr></thead>
          <tbody>
            {highRisk.map((f) => {
              const t = data.tables.find((x) => x.id === f.tableId);
              return (
                <tr key={f.id}>
                  <td>{f.business.nameCn}</td>
                  <td>{t?.nameCn}</td>
                  <td><Tag tone={LEVEL_TONE[f.management.securityLevel]}>{f.management.securityLevel}</Tag></td>
                  <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: f.tableId, fieldId: f.id, title: t?.nameCn })}>定位</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {tab === 'mask' && (
        <table className="table">
          <thead><tr><th>字段</th><th>级别</th><th>原值</th><th>脱敏后</th><th>策略</th></tr></thead>
          <tbody>
            {data.maskExamples.map((m, i) => (
              <tr key={i}>
                <td>{m.field}</td>
                <td><Tag tone={LEVEL_TONE[m.level]}>{m.level}</Tag></td>
                <td><code>{m.original}</code></td>
                <td><code>{m.masked}</code></td>
                <td>{m.strategy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
