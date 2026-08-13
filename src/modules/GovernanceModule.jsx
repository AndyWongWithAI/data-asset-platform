import { useState } from 'react';
import data from '../data.js';
import ScoreGauge from '../components/ScoreGauge.jsx';
import Tag from '../components/Tag.jsx';

export default function GovernanceModule({ onNavigate }) {
  const [sub, setSub] = useState('quality');
  return (
    <div className="governance">
      <div className="sub-tabs">
        <button className={sub === 'quality' ? 'sub-active' : ''} onClick={() => setSub('quality')}>数据质量子看板</button>
        <button className={sub === 'standard' ? 'sub-active' : ''} onClick={() => setSub('standard')}>数据标准子看板</button>
        <button disabled title="二期">数据血缘子看板（二期）</button>
      </div>
      {sub === 'quality' ? <QualityBoard onNavigate={onNavigate} /> : <StandardBoard onNavigate={onNavigate} />}
    </div>
  );
}

function QualityBoard({ onNavigate }) {
  return (
    <div>
      <h3>企业整体数据质量评分</h3>
      {data.qualityResults.map((r) => {
        const app = data.applications.find((a) => a.id === r.appId);
        return (
          <div key={r.id} className="score-row">
            <ScoreGauge score={r.score} />
            <div className="score-info">
              <strong>{app?.name}</strong>
              <span>维度：{r.dimension}</span>
            </div>
            <div className="issues">
              {r.issues.map((issue) => {
                const f = data.fields.find((x) => x.id === issue.fieldId);
                const rule = data.qualityRules.find((x) => x.id === issue.ruleId);
                return (
                  <div key={issue.id} className="issue">
                    <Tag tone={issue.severity === '严重' ? 'danger' : 'warn'}>{issue.severity}</Tag>
                    <span>{issue.desc}</span>
                    <button className="link" onClick={() => onNavigate('catalog', { tableId: f?.tableId, fieldId: issue.fieldId })}>
                      定位字段 {f?.business.nameCn} · {rule?.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StandardBoard({ onNavigate }) {
  // 贯标率 = 已关联标准的字段数 / 应贯字段数（简化：全部字段）
  const fields = data.fields;
  const applied = fields.filter((f) => f.management.standardId);
  const rate = Math.round((applied.length / fields.length) * 100);
  return (
    <div>
      <h3>企业整体贯标情况</h3>
      <div className="score-row">
        <ScoreGauge score={rate} />
        <div className="score-info"><strong>字段级贯标率</strong><span>已贯 {applied.length} / {fields.length} 字段</span></div>
      </div>
      <h3>应贯未贯字段明细</h3>
      <table className="table">
        <thead><tr><th>字段</th><th>所属表</th><th>安全分级</th><th>操作</th></tr></thead>
        <tbody>
          {fields.filter((f) => !f.management.standardId).map((f) => {
            const t = data.tables.find((x) => x.id === f.tableId);
            return (
              <tr key={f.id}>
                <td>{f.business.nameCn}</td>
                <td>{t?.nameCn}</td>
                <td>{f.management.securityLevel}</td>
                <td><button className="link" onClick={() => onNavigate('catalog', { tableId: f.tableId, fieldId: f.id })}>定位</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
