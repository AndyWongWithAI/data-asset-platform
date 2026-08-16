import { useData } from '../DataContext.jsx';
import { compareMetadata } from '../metadataCompare.js';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

const TYPE_META = {
  unregistered: { label: '未登记', tone: 'warn' },
  offline: { label: '疑似下线', tone: 'danger' },
  drift: { label: '漂移', tone: 'warn' },
};

const DRIFT_DIM = { type: '类型', nameCn: '中文名' };

// 字段级差异的「生产侧 / 设计态侧」单元格：code · 中文名 · 类型（无则 —）
function FieldSide({ side }) {
  if (!side) return <span className="muted">—</span>;
  return (
    <span>
      <code>{side.code}</code> · {side.nameCn} · <span className="en">{side.type}</span>
    </span>
  );
}

export default function MetadataCompareModule({ onNavigate }) {
  const { data } = useData();
  const { tableDiffs, fieldDiffs, summary } = compareMetadata(data.prodMetadatas, data.tables, data.fields);

  const cards = [
    { label: '未登记表', value: summary.unregisteredTables },
    { label: '疑似下线表', value: summary.offlineTables },
    { label: '未登记字段', value: summary.unregisteredFields },
    { label: '疑似下线字段', value: summary.offlineFields },
    { label: '漂移字段', value: summary.driftedFields },
  ];

  const total = cards.reduce((s, c) => s + c.value, 0);

  return (
    <div>
      <div className="search-bar" style={{ justifyContent: 'flex-end' }}>
        <ComingSoonAction label="导出生产表结构" />
      </div>

      <div className="stat-row">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="stat-num">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <h3>表级差异</h3>
      {tableDiffs.length ? (
        <table className="table">
          <thead><tr><th>差异类型</th><th>生产侧</th><th>设计态侧</th></tr></thead>
          <tbody>
            {tableDiffs.map((d, i) => {
              const meta = TYPE_META[d.type];
              return (
                <tr key={i}>
                  <td><Tag tone={meta.tone}>{meta.label}</Tag></td>
                  <td>
                    {d.prod
                      ? <span>{d.prod.databaseName} · <code>{d.prod.nameEn}</code>（{d.prod.nameCn}）</span>
                      : <span className="muted">—</span>}
                  </td>
                  <td>
                    {d.designed
                      ? <button className="link" onClick={() => onNavigate('tableDetail', { tableId: d.designed.tableId, title: d.designed.nameCn })}>{d.designed.nameEn}（{d.designed.nameCn}）</button>
                      : <span className="muted">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : <div className="empty-hint">无表级差异</div>}

      <h3>字段级差异</h3>
      {fieldDiffs.length ? (
        <table className="table">
          <thead><tr><th>差异类型</th><th>所属表</th><th>生产侧</th><th>设计态侧</th><th>漂移维度</th></tr></thead>
          <tbody>
            {fieldDiffs.map((d, i) => {
              const meta = TYPE_META[d.type];
              return (
                <tr key={i}>
                  <td><Tag tone={meta.tone}>{meta.label}</Tag></td>
                  <td>
                    <button className="link" onClick={() => onNavigate('tableDetail', { tableId: d.table.tableId, title: d.table.nameCn })}>{d.table.nameCn}</button>
                  </td>
                  <td><FieldSide side={d.prod} /></td>
                  <td><FieldSide side={d.designed} /></td>
                  <td>{d.drift ? d.drift.map((k) => DRIFT_DIM[k] || k).join('、') : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : <div className="empty-hint">无字段级差异</div>}

      {total === 0 && <div className="empty-hint">生产元数据与设计态元数据完全一致，无差异</div>}
    </div>
  );
}
