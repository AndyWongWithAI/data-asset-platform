import CatalogModule from '../modules/CatalogModule.jsx';
import GovernanceModule from '../modules/GovernanceModule.jsx';

export default function TabWorkspace({ state, dispatch }) {
  const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
  return (
    <div className="workspace">
      <div className="tabbar">
        {state.tabs.map((t) => (
          <div
            key={t.id}
            className={`tab${t.id === state.activeTabId ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'ACTIVATE', tabId: t.id })}
          >
            <span>{t.title}</span>
            <button className="tab-close" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CLOSE', tabId: t.id }); }}>✕</button>
          </div>
        ))}
      </div>
      <div className="tab-panel">
        {activeTab
          ? activeTab.moduleKey === 'catalog'
            ? <CatalogModule assetId={activeTab.assetId} onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
            : activeTab.moduleKey === 'governance'
              ? <GovernanceModule assetId={activeTab.assetId} onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
              : <div className="module-placeholder">{activeTab.title}（模块内容由 Task 5-7 提供）</div>
          : <div className="empty-hint">点击左侧导航打开模块</div>}
      </div>
    </div>
  );
}
