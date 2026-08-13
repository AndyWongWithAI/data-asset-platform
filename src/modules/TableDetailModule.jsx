import data from '../data.js';
import Tag from '../components/Tag.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };

export default function TableDetailModule({ assetId, onNavigate }) {
  const table = data.tables.find((t) => t.id === assetId?.tableId);
  if (!table) return <div className="empty-hint">未找到该表（tableId: {assetId?.tableId ?? '—'}）</div>;

  const app = data.applications.find((a) => a.id === table.appId);
  const db = data.databases.find((d) => d.id === table.dbId);
  const domain = data.bizDomains.find((b) => b.id === table.bizDomainId);
  const fields = data.fields.filter((f) => f.tableId === table.id).sort((a, b) => a.seq - b.seq);

  return (
    <div className="table-detail">
      <div className="detail-head">
        <h3>{table.nameCn}</h3>
        <p className="en">{table.nameEn} · {table.tableType} · {app?.name} / {db?.name} / {domain?.name}</p>
        <p className="desc">{table.desc}</p>
      </div>
      <table className="table field-table">
        <thead>
          <tr>
            <th>#</th><th>字段名</th><th>编码</th><th>业务定义</th><th>技术类型</th><th>键</th>
            <th>关联规则</th><th>关联标准</th><th>安全分级</th><th>主数据</th><th>责任人</th><th>更新频率</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => {
            const rules = (f.technical.qualityRuleIds || [])
              .map((id) => data.qualityRules.find((r) => r.id === id)).filter(Boolean);
            const std = f.management.standardId
              ? data.standards.find((s) => s.id === f.management.standardId) : null;
            const md = f.business.masterDataId
              ? data.masterData.find((m) => m.id === f.business.masterDataId) : null;
            const sec = data.security.find((s) => s.level === f.management.securityLevel);
            return (
              <tr key={f.id} className={f.id === assetId?.fieldId ? 'row-active' : ''}>
                <td>{f.seq}</td>
                <td>{f.business.nameCn}</td>
                <td><code>{f.business.code}</code></td>
                <td>{f.business.definition || '—'}</td>
                <td>{f.technical.type}</td>
                <td>{f.technical.isPK ? 'PK' : ''}{f.technical.isPK && f.technical.isFK ? '/' : ''}{f.technical.isFK ? 'FK' : ''}</td>
                <td>{rules.length
                  ? rules.map((r) => (
                    <button key={r.id} className="link" onClick={() => onNavigate('governance', { ruleId: r.id })}>{r.name}</button>
                  ))
                  : '—'}</td>
                <td>{std ? `${std.name}（${std.code}）` : '—'}</td>
                <td><Tag tone={LEVEL_TONE[f.management.securityLevel] || 'default'}>{f.management.securityLevel} {sec?.name}</Tag></td>
                <td>{md ? md.name : '—'}</td>
                <td>{f.management.owner}</td>
                <td>{f.management.updateFrequency}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
