import { useData } from '../DataContext.jsx';
import ScoreGauge from '../components/ScoreGauge.jsx';

const aligned = (data, f) => {
  if (!f.management.standardId) return false;
  const ii = data.infoItems.find((i) => i.id === f.management.standardId);
  return !!ii && f.business.nameCn === ii.nameCn && f.business.code === ii.nameEn;
};

export default function StandardBoardModule({ onNavigate }) {
  const { data } = useData();
  // 贯标率 = 已对齐标准名的字段数 / 全部字段数（standardId 非空 且 中英文名精确一致）
  const fields = data.fields;
  const applied = fields.filter((f) => aligned(data, f));
  const unapplied = fields.filter((f) => !aligned(data, f));
  const rate = Math.round((applied.length / fields.length) * 100);

  // 字段 → 所属表 → 应用：用于应用维度贯标率 + 明细表「应用名称」列
  const tableApp = Object.fromEntries(data.tables.map((t) => [t.id, t.appId]));
  const appName = (appId) => data.applications.find((a) => a.id === appId)?.name;

  const appRows = data.applications.map((app) => {
    const appFields = fields.filter((f) => tableApp[f.tableId] === app.id);
    const appApplied = appFields.filter((f) => aligned(data, f));
    const appRate = appFields.length ? Math.round((appApplied.length / appFields.length) * 100) : 0;
    return { app, total: appFields.length, applied: appApplied.length, rate: appRate };
  });

  return (
    <div>
      <h3>企业整体贯标情况</h3>
      <div className="score-row">
        <ScoreGauge score={rate} />
        <div className="score-info"><strong>字段级贯标率</strong><span>已贯 {applied.length} / {fields.length} 字段</span></div>
      </div>

      <h3>应用维度贯标率</h3>
      <table className="table">
        <thead><tr><th>应用名称</th><th>已贯字段</th><th>字段总数</th><th>贯标率</th></tr></thead>
        <tbody>
          {appRows.map(({ app, total, applied: n, rate: r }) => (
            <tr key={app.id}>
              <td>{app.name}</td>
              <td>{n}</td>
              <td>{total}</td>
              <td>{r}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>应贯未贯字段明细</h3>
      <table className="table">
        <thead><tr><th>应用名称</th><th>表名称</th><th>字段名称</th><th>原因</th><th>操作</th></tr></thead>
        <tbody>
          {unapplied.map((f) => {
            const t = data.tables.find((x) => x.id === f.tableId);
            const reason = f.management.standardId ? '名称未对齐' : '无关联标准';
            return (
              <tr key={f.id}>
                <td>{appName(t?.appId)}</td>
                <td>{t?.nameCn}</td>
                <td>{f.business.nameCn}</td>
                <td>{reason}</td>
                <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: f.tableId, fieldId: f.id, title: t?.nameCn })}>定位</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
