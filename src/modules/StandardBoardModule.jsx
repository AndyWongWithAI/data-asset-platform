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
  return (
    <div>
      <h3>企业整体贯标情况</h3>
      <div className="score-row">
        <ScoreGauge score={rate} />
        <div className="score-info"><strong>字段级贯标率</strong><span>已贯 {applied.length} / {fields.length} 字段</span></div>
      </div>
      <h3>应贯未贯字段明细</h3>
      <table className="table">
        <thead><tr><th>字段</th><th>所属表</th><th>安全分级</th><th>原因</th><th>操作</th></tr></thead>
        <tbody>
          {unapplied.map((f) => {
            const t = data.tables.find((x) => x.id === f.tableId);
            const reason = f.management.standardId ? '名称未对齐' : '无关联标准';
            return (
              <tr key={f.id}>
                <td>{f.business.nameCn}</td>
                <td>{t?.nameCn}</td>
                <td>{f.management.securityLevel}</td>
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
