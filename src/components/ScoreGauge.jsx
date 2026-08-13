export default function ScoreGauge({ score }) {
  const tone = score >= 90 ? 'ok' : score >= 80 ? 'default' : 'warn';
  return (
    <div className={`gauge gauge-${tone}`}>
      <div className="gauge-num">{score}</div>
      <div className="gauge-label">分</div>
    </div>
  );
}
