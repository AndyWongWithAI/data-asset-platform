import data from '../data.js';
import Tag from '../components/Tag.jsx';

const SEVERITY_TONE = { 严重: 'danger', 警告: 'warn', 提示: 'default' };

export default function QualityDetailModule({ onNavigate, assetId }) {
  const rule = data.qualityRules.find((r) => r.id === assetId?.qualityRuleId);
  if (!rule) return <div className="empty-hint">未找到该规则</div>;
  const field = data.fields.find((f) => f.id === rule.targetFieldId);
  const table = data.tables.find((t) => t.id === field?.tableId);
  return (
    <div className="detail-panel">
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
