import data from '../data.js';
import Tag from './Tag.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };

export default function FieldMetaCard({ field, onNavigate }) {
  const rules = (field.technical.qualityRuleIds || [])
    .map((id) => data.qualityRules.find((r) => r.id === id)).filter(Boolean);
  const std = field.management.standardId
    ? data.standards.find((s) => s.id === field.management.standardId) : null;
  const md = field.business.masterDataId
    ? data.masterData.find((m) => m.id === field.business.masterDataId) : null;
  const sec = data.security.find((s) => s.level === field.management.securityLevel);
  return (
    <div className="field-card">
      <div className="field-card-head">
        <strong>{field.business.nameCn}</strong>
        <code>{field.business.code}</code>
        <Tag tone={LEVEL_TONE[field.management.securityLevel] || 'default'}>
          {field.management.securityLevel} {sec?.name}
        </Tag>
      </div>
      <div className="field-card-meta">
        <div><label>业务</label><span>{field.business.definition || '—'}</span>
          {md && <Tag>主数据:{md.name}</Tag>}</div>
        <div><label>技术</label><span>{field.technical.type}{field.technical.isPK ? ' · 主键' : ''}{field.technical.isFK ? ' · 外键' : ''}</span></div>
        <div><label>管理</label><span>责任人:{field.management.owner} · 更新:{field.management.updateFrequency}</span></div>
        <div><label>关联规则</label>
          {rules.length ? rules.map((r) => (
            <button key={r.id} className="link" onClick={() => onNavigate('governance', { ruleId: r.id })}>{r.name}</button>
          )) : <span>—</span>}
        </div>
        <div><label>关联标准</label>{std ? <span>{std.name}（{std.code}）</span> : <span>—</span>}</div>
      </div>
    </div>
  );
}
