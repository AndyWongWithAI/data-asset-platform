import data from '../data.js';
import ScoreGauge from '../components/ScoreGauge.jsx';

export default function StandardBoardModule({ onNavigate }) {
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
                <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: f.tableId, fieldId: f.id, title: t?.nameCn })}>定位</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
