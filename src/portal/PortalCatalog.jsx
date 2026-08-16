import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };
const CATEGORIES = ['风资源', '海洋勘测', '风机设备', '运营监测', '海域环境'];
const CAT_COLOR = {
  '风资源': '#00b42a',
  '海洋勘测': '#165dff',
  '风机设备': '#722ed1',
  '运营监测': '#ff7d00',
  '海域环境': '#0fc6c2',
};

export default function PortalCatalog({ onOpenAsset }) {
  const { data } = useData();
  const [cat, setCat] = useState('all');
  const [kw, setKw] = useState('');

  const listedCount = (data.portalAssets || []).filter((a) => a.status === '已上架').length;
  const serviceCount = (data.services || []).length;

  const assets = (data.portalAssets || []).filter((a) => {
    if (a.status !== '已上架') return false;
    if (cat !== 'all' && a.category !== cat) return false;
    if (kw && !(a.name.includes(kw) || a.desc.includes(kw))) return false;
    return true;
  });
  const featured = assets.filter((a) => a.featured);
  const others = assets.filter((a) => !a.featured);

  const renderCard = (a) => (
    <div className="asset-card" key={a.id} style={{ '--cat': CAT_COLOR[a.category] }} onClick={() => onOpenAsset(a.id)}>
      <h3>{a.name}</h3>
      <div className="asset-meta">
        <span className="asset-cat">{a.category}</span>
        <Tag tone={LEVEL_TONE[a.securityLevel]}>{a.securityLevel}</Tag>
        <Tag tone={a.usageType === '下载' ? 'default' : 'warn'}>{a.usageType}</Tag>
      </div>
      <p>{a.desc}</p>
    </div>
  );

  return (
    <div>
      <div className="portal-stats">
        <div className="portal-stat"><div className="portal-stat-num">{listedCount}</div><div className="portal-stat-label">已上架资产</div></div>
        <div className="portal-stat"><div className="portal-stat-num">{CATEGORIES.length}</div><div className="portal-stat-label">业务分类</div></div>
        <div className="portal-stat"><div className="portal-stat-num">{serviceCount}</div><div className="portal-stat-label">关联服务</div></div>
      </div>
      <div className="portal-toolbar">
        <div className="portal-cats">
          <button className={cat === 'all' ? 'active' : ''} onClick={() => setCat('all')}>全部</button>
          {CATEGORIES.map((c) => (
            <button key={c} className={cat === c ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <input placeholder="搜索资产…" value={kw} onChange={(e) => setKw(e.target.value)} />
      </div>
      {featured.length > 0 && (
        <>
          <div className="portal-section-title"><span className="star">★</span>精选资产</div>
          <div className="asset-grid">{featured.map(renderCard)}</div>
        </>
      )}
      {others.length > 0 && (
        <>
          <div className="portal-section-title">全部资产</div>
          <div className="asset-grid">{others.map(renderCard)}</div>
        </>
      )}
      {assets.length === 0 && <div className="empty-hint">暂无匹配的数据资产</div>}
    </div>
  );
}
