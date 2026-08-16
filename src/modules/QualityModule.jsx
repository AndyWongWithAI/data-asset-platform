import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import EntityForm from '../components/EntityForm.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

const SEVERITY_TONE = { 严重: 'danger', 警告: 'warn', 提示: 'default' };

export default function QualityModule({ onNavigate }) {
  const { data, updateRecord } = useData();
  const [type, setType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const filtered = data.qualityRules.filter((r) => type === 'all' || r.type === type);
  const toggleStatus = (r) => updateRecord('qualityRules', r.id, { status: r.status === '停用' ? '启用' : '停用' });
  return (
    <div>
      <div className="search-bar">
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="按类型筛选">
          <option value="all">全部类型</option>
          {['准确性', '完整性', '一致性', '及时性'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn-primary" onClick={() => setShowForm(true)}>新增规则</button>
        <ComingSoonAction label="批量导入" />
      </div>
      <table className="table">
        <thead><tr><th>规则名</th><th>类型</th><th>绑定字段</th><th>校验表达式</th><th>阈值</th><th>严重级别</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          {filtered.map((r) => {
            const f = data.fields.find((x) => x.id === r.targetFieldId);
            return (
              <tr key={r.id}>
                <td><button className="link" onClick={() => onNavigate('qualityDetail', { qualityRuleId: r.id })}>{r.name}</button></td>
                <td>{r.type}</td>
                <td>{f?.business.nameCn}</td>
                <td><code>{r.expr}</code></td>
                <td>{r.threshold}</td>
                <td><Tag tone={SEVERITY_TONE[r.severity]}>{r.severity}</Tag></td>
                <td>{r.status === '停用' ? <Tag tone="warn">停用</Tag> : <Tag tone="ok">启用</Tag>}</td>
                <td><button className="link" onClick={() => setEditItem(r)}>编辑</button> <button className="link" onClick={() => toggleStatus(r)}>{r.status === '停用' ? '启用' : '停用'}</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {showForm && <EntityForm entity="qualityRules" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />}
      {editItem && <EntityForm entity="qualityRules" mode="update" record={editItem} onClose={() => setEditItem(null)} onSaved={() => setEditItem(null)} />}
    </div>
  );
}
