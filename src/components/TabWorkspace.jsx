import CatalogModule from '../modules/CatalogModule.jsx';
import QualityBoardModule from '../modules/QualityBoardModule.jsx';
import StandardBoardModule from '../modules/StandardBoardModule.jsx';
import TableDetailModule from '../modules/TableDetailModule.jsx';
import QualityModule from '../modules/QualityModule.jsx';
import BaseTermModule from '../modules/BaseTermModule.jsx';
import ValueDomainModule from '../modules/ValueDomainModule.jsx';
import RefDataModule from '../modules/RefDataModule.jsx';
import InfoItemModule from '../modules/InfoItemModule.jsx';
import SecurityModule from '../modules/SecurityModule.jsx';
import MasterDataModule from '../modules/MasterDataModule.jsx';
import LineageModule from '../modules/LineageModule.jsx';
import BatchFileModule from '../modules/BatchFileModule.jsx';
import DataServiceModule from '../modules/DataServiceModule.jsx';
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
            : activeTab.moduleKey === 'qualityBoard'
              ? <QualityBoardModule onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
              : activeTab.moduleKey === 'standardBoard'
                ? <StandardBoardModule onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                : activeTab.moduleKey === 'tableDetail'
                  ? <TableDetailModule assetId={activeTab.assetId} onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                  : activeTab.moduleKey === 'quality'
                    ? <QualityModule assetId={activeTab.assetId} onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                    : activeTab.moduleKey === 'baseTerm'
                      ? <BaseTermModule onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                      : activeTab.moduleKey === 'valueDomain'
                        ? <ValueDomainModule assetId={activeTab.assetId} onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                        : activeTab.moduleKey === 'refData'
                          ? <RefDataModule assetId={activeTab.assetId} onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                          : activeTab.moduleKey === 'infoItem'
                            ? <InfoItemModule assetId={activeTab.assetId} onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                            : activeTab.moduleKey === 'security'
                              ? <SecurityModule onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                              : activeTab.moduleKey === 'masterdata'
                                ? <MasterDataModule onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                                : activeTab.moduleKey === 'lineageBoard'
                                  ? <LineageModule onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                                  : activeTab.moduleKey === 'batchFile'
                                    ? <BatchFileModule onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                                    : activeTab.moduleKey === 'dataService'
                                      ? <DataServiceModule onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />
                                      : <PlaceholderModule moduleKey={activeTab.moduleKey} />
          : <div className="empty-hint">点击左侧导航打开模块</div>}
      </div>
    </div>
  );
}
