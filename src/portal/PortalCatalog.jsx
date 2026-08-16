import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };
const CATEGORIES = ['风资源', '海洋勘测', '风机设备', '运营监测', '海域环境'];

export default function PortalCatalog({ onOpenAsset }) {
  const { data } = useData();
  const [cat, setCat] = useState('all');
  const [kw, setKw] = useState('');

  const assets = (data.portalAssets || []).filter((a) => {
    if (a.status !== '已上架') return false;
    if (cat !== 'all' && a.category !== cat) return false;
    if (kw && !(a.name.includes(kw) || a.desc.includes(kw))) return false;
    return true;
  });

  return (
    <div>
      <div className="portal-toolbar">
        <div className="portal-cats">
          <button className={cat === 'all' ? 'active' : ''} onClick={() => setCat('all')}>全部</button>
          {CATEGORIES.map((c) => (
            <button key={c} className={cat === c ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <input placeholder="搜索资产…" value={kw} onChange={(e) => setKw(e.target.value)} />
      </div>
      <div className="asset-grid">
        {assets.map((a) => (
          <div className="asset-card" key={a.id} onClick={() => onOpenAsset(a.id)}>
            <h3>{a.name}</h3>
            <div className="asset-meta">
              <span className="asset-cat">{a.category}</span>
              <Tag tone={LEVEL_TONE[a.securityLevel]}>{a.securityLevel}</Tag>
              <Tag tone={a.usageType === '下载' ? 'default' : 'warn'}>{a.usageType}</Tag>
            </div>
            <p>{a.desc}</p>
          </div>
        ))}
      </div>
      {assets.length === 0 && <div className="empty-hint">暂无匹配的数据资产</div>}
    </div>
  );
}
