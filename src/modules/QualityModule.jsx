import { useState } from 'react';
import data from '../data.js';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

const SEVERITY_TONE = { 严重: 'danger', 警告: 'warn', 提示: 'default' };

export default function QualityModule({ onNavigate, assetId }) {
  const [type, setType] = useState('all');
  const selectedId = assetId?.qualityRuleId ?? null;

  if (selectedId) {
    const rule = data.qualityRules.find((r) => r.id === selectedId);
    const field = data.fields.find((f) => f.id === rule.targetFieldId);
    const table = data.tables.find((t) => t.id === field?.tableId);
    return (
      <div className="detail-panel">
        <button className="link" onClick={() => onNavigate('quality', null)}>← 返回列表</button>
        <h3>{rule.name}</h3>
        <div className="kv-list">
          <div><span>规则类型</span><b>{rule.type}</b></div>
          <div><span>校验表达式</span><code>{rule.expr}</code></div>
          <div><span>阈值</span><b>{rule.threshold}</b></div>
          <div><span>严重级别</span><Tag tone={SEVERITY_TONE[rule.severity]}>{rule.severity}</Tag></div>
          <div><span>状态</span><b>{rule.status}</b></div>
        </div>
        <h4>绑定字段</h4>
        <table className="table">
          <thead><tr><th>字段</th><th>所属表</th><th>操作</th></tr></thead>
          <tbody>
            <tr>
              <td>{field?.business.nameCn}<span className="en">{field?.business.code}</span></td>
              <td>{table?.nameCn}</td>
              <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: field?.tableId, fieldId: field?.id, title: table?.nameCn })}>定位</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const filtered = data.qualityRules.filter((r) => type === 'all' || r.type === type);
  return (
    <div>
      <div className="search-bar">
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="按类型筛选">
          <option value="all">全部类型</option>
          {['准确性', '完整性', '一致性', '及时性'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <ComingSoonAction label="新增规则" />
      </div>
      <table className="table">
        <thead><tr><th>规则名</th><th>类型</th><th>绑定字段</th><th>校验表达式</th><th>阈值</th><th>严重级别</th><th>状态</th></tr></thead>
        <tbody>
          {filtered.map((r) => {
            const f = data.fields.find((x) => x.id === r.targetFieldId);
            return (
              <tr key={r.id}>
                <td><button className="link" onClick={() => onNavigate('quality', { qualityRuleId: r.id })}>{r.name}</button></td>
                <td>{r.type}</td>
                <td>{f?.business.nameCn}</td>
                <td><code>{r.expr}</code></td>
                <td>{r.threshold}</td>
                <td><Tag tone={SEVERITY_TONE[r.severity]}>{r.severity}</Tag></td>
                <td>{r.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
