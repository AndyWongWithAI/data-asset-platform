import CatalogModule from '../modules/CatalogModule.jsx';
import GovernanceModule from '../modules/GovernanceModule.jsx';
import TableDetailModule from '../modules/TableDetailModule.jsx';
import QualityModule from '../modules/QualityModule.jsx';
import StandardModule from '../modules/StandardModule.jsx';
import SecurityModule from '../modules/SecurityModule.jsx';
import PlaceholderModule from '../modules/PlaceholderModule.jsx';

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
              : activeTab.moduleKey === 'tableDetail'
                ? <TableDetailModule assetId={activeTab.assetId} onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                : activeTab.moduleKey === 'quality'
                  ? <QualityModule onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                  : activeTab.moduleKey === 'standard'
                    ? <StandardModule onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                    : activeTab.moduleKey === 'security'
                      ? <SecurityModule onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                      : <PlaceholderModule moduleKey={activeTab.moduleKey} />
          : <div className="empty-hint">点击左侧导航打开模块</div>}
      </div>
    </div>
  );
}
