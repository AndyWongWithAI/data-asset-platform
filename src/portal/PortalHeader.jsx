export default function PortalHeader() {
  return (
    <header className="header portal-header">
      <div className="header-title">
        <h1>数据资产门户</h1>
      </div>
      <button className="header-link" onClick={() => { window.location.href = '/data-asset-platform/'; }}>资产管理</button>
    </header>
  );
}
