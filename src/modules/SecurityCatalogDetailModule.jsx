import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import { fieldSecuritySource } from '../fieldSecurity.js';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };
const SOURCE_LABEL = { inherit: '继承', 'custom-upgrade': '自定义升级', custom: '自定义', conflict: '冲突' };
const SOURCE_TONE = { inherit: 'default', 'custom-upgrade': 'warn', custom: 'default', conflict: 'danger' };

export default function SecurityCatalogDetailModule({ onNavigate, assetId }) {
  const { data } = useData();
  const cat = data.securityCatalog.find((c) => c.id === assetId?.catalogId);
  if (!cat) return <div className="empty-hint">未找到该安全分类（catalogId: {assetId?.catalogId ?? '—'}）</div>;

  const fields = (cat.fieldIds || [])
    .map((fid) => data.fields.find((f) => f.id === fid))
    .filter(Boolean);
  // 按字段所属表分组（保持 fieldIds 顺序），字段级定位：只挂本数据类型的字段，非整表字段
  const grouped = [];
  for (const f of fields) {
    let g = grouped.find((x) => x.tableId === f.tableId);
    if (!g) {
      g = { tableId: f.tableId, table: data.tables.find((t) => t.id === f.tableId), fields: [] };
      grouped.push(g);
    }
    g.fields.push(f);
  }

  return (
    <div className="detail-panel">
      <h3>{cat.dataType}</h3>
      <div className="kv-list">
        <div><span>一级分类</span><b>{cat.category1}</b></div>
        <div><span>二级分类</span><b>{cat.category2}</b></div>
        <div><span>数据类型</span><b>{cat.dataType}</b></div>
        <div><span>数据分级</span><Tag tone={LEVEL_TONE[cat.level]}>{cat.level}</Tag></div>
        <div><span>定位字段</span><b>{fields.length ? `${fields.length} 个${grouped.length > 1 ? ` · 跨 ${grouped.length} 表` : ''}` : '—'}</b></div>
      </div>
      {fields.length ? (
        grouped.map(({ table, fields: fs }) => (
          <div key={table.id}>
            <h4>定位表 · {table.nameCn}{table.desc ? ` — ${table.desc}` : ''}（{fs.length} 个字段）</h4>
            <table className="table">
              <thead><tr><th>字段中文名</th><th>英文码</th><th>安全分级</th><th>来源</th><th>操作</th></tr></thead>
              <tbody>
                {fs.map((f) => {
                  const { source } = fieldSecuritySource(f, data.infoItems);
                  return (
                    <tr key={f.id}>
                      <td>{f.business.nameCn}</td>
                      <td><code>{f.business.code}</code></td>
                      <td><Tag tone={LEVEL_TONE[f.management.securityLevel] || 'default'}>{f.management.securityLevel}</Tag></td>
                      <td><Tag tone={SOURCE_TONE[source] || 'default'}>{SOURCE_LABEL[source] || source}</Tag></td>
                      <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: table.id, fieldId: f.id, title: table.nameCn })}>定位</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <div className="empty-hint">该数据类型暂无平台内字段定位（分类目录覆盖范围大于已登记资产）</div>
      )}
    </div>
  );
}
