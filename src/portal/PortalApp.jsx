import { useState } from 'react';
import PortalHeader from './PortalHeader.jsx';
import PortalCatalog from './PortalCatalog.jsx';
import PortalAssetDetail from './PortalAssetDetail.jsx';
import PortalMyRequests from './PortalMyRequests.jsx';

const PAGES = [
  { key: 'catalog', title: '资产目录' },
  { key: 'requests', title: '我的申请' },
];

export default function PortalApp() {
  const [page, setPage] = useState('catalog');
  const [assetId, setAssetId] = useState(null);

  const openAsset = (id) => { setAssetId(id); setPage('detail'); };

  return (
    <div className="portal">
      <PortalHeader />
      <div className="portal-body">
        <nav className="portal-nav">
          {PAGES.map((p) => (
            <button key={p.key} className={page === p.key ? 'active' : ''} onClick={() => setPage(p.key)}>{p.title}</button>
          ))}
        </nav>
        <main className="portal-main">
          {page === 'catalog' && <PortalCatalog onOpenAsset={openAsset} />}
          {page === 'detail' && <PortalAssetDetail assetId={assetId} onBack={() => setPage('catalog')} />}
          {page === 'requests' && <PortalMyRequests onOpenAsset={openAsset} />}
        </main>
      </div>
    </div>
  );
}
