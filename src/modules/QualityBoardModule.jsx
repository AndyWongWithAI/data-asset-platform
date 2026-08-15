import { useData } from '../DataContext.jsx';
import ScoreGauge from '../components/ScoreGauge.jsx';
import Tag from '../components/Tag.jsx';

export default function QualityBoardModule({ onNavigate }) {
  const { data } = useData();
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
                    <button className="link" onClick={() => onNavigate('tableDetail', { tableId: f?.tableId, fieldId: issue.fieldId, title: data.tables.find((x) => x.id === f?.tableId)?.nameCn })}>
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
