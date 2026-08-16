import data from '../data.js';

export default function HeaderBar() {
  return (
    <header className="header">
      <div className="header-title">
        <h1>{data.meta.title}</h1>
      </div>
      <span className="header-disclaimer" title={data.meta.disclaimer}>⚠ 演示模型</span>
    </header>
  );
}
