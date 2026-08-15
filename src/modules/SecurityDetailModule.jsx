import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import { fieldSecuritySource } from '../fieldSecurity.js';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };
const SOURCE_LABEL = { inherit: '继承', 'custom-upgrade': '自定义升级', custom: '自定义', conflict: '冲突' };
const SOURCE_TONE = { inherit: 'default', 'custom-upgrade': 'warn', custom: 'default', conflict: 'danger' };

export default function SecurityDetailModule({ onNavigate, assetId }) {
  const { data } = useData();
  const sec = data.security.find((s) => s.level === assetId?.securityLevel);
  if (!sec) return <div className="empty-hint">未找到该安全分级（securityLevel: {assetId?.securityLevel ?? '—'}）</div>;

  const fields = data.fields.filter((f) => f.management.securityLevel === sec.level);

  return (
    <div className="detail-panel">
      <h3>{sec.level} · {sec.name}</h3>
      <div className="kv-list">
        <div><span>级别</span><Tag tone={LEVEL_TONE[sec.level]}>{sec.level}</Tag></div>
        <div><span>名称</span><b>{sec.name}</b></div>
        <div><span>描述</span><b>{sec.desc}</b></div>
        <div><span>脱敏策略</span><b>{sec.mask || '无'}</b></div>
        <div><span>定位数量</span><b>{fields.length}</b></div>
      </div>
      <h4>分级定位（{fields.length}）</h4>
      {fields.length ? (
        <table className="table">
          <thead><tr><th>字段中文名</th><th>英文码</th><th>所属表</th><th>分级来源</th><th>操作</th></tr></thead>
          <tbody>
            {fields.map((f) => {
              const t = data.tables.find((x) => x.id === f.tableId);
              const { source } = fieldSecuritySource(f, data.infoItems);
              return (
                <tr key={f.id}>
                  <td>{f.business.nameCn}</td>
                  <td><code>{f.business.code}</code></td>
                  <td>{t?.nameCn}</td>
                  <td><Tag tone={SOURCE_TONE[source] || 'default'}>{SOURCE_LABEL[source] || source}</Tag></td>
                  <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: f.tableId, fieldId: f.id, title: t?.nameCn })}>定位</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="empty-hint">该分级下暂无字段</div>
      )}
    </div>
  );
}
