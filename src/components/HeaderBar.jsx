import data from '../data.js';

export default function HeaderBar() {
  return (
    <header className="header">
      <div className="header-title">
        <h1>{data.meta.title}</h1>
        <span className="header-subtitle">{data.meta.subtitle}</span>
      </div>
      <span className="header-disclaimer" title={data.meta.disclaimer}>⚠ 演示模型</span>
    </header>
  );
}
