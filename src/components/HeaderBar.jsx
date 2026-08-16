import data from '../data.js';

export default function HeaderBar() {
  return (
    <header className="header">
      <div className="header-title">
        <h1>{data.meta.title}</h1>
      </div>
      <div className="header-actions">
        <button className="header-link" onClick={() => { window.location.href = '/data-asset-portal/'; }}>资产门户</button>
        <span className="header-disclaimer" title={data.meta.disclaimer}>⚠ 演示模型</span>
      </div>
    </header>
  );
}
