// 字段安全分级来源推导（纯函数，不依赖 React）。
// 继承链：分级定义(security L1-L4) → 信息项(可选 securityLevel) → 字段(继承/自定义升级)。
export const LEVEL_RANK = { L1: 1, L2: 2, L3: 3, L4: 4 };

// 返回 { level, source }，source ∈ custom / inherit / custom-upgrade / conflict：
// - custom：字段未关联信息项，或信息项无 securityLevel → 自定义
// - inherit：字段分级 === 信息项分级 → 继承自信息项
// - custom-upgrade：字段分级 > 信息项分级 → 自定义升级（合法）
// - conflict：字段分级 < 信息项分级 → 冲突（非法，需高亮）
export function fieldSecuritySource(field, infoItems) {
  const level = field?.management?.securityLevel ?? null;
  const standardId = field?.management?.standardId ?? null;
  const infoItem = standardId ? (infoItems || []).find((i) => i.id === standardId) : null;
  const itemLevel = infoItem?.securityLevel ?? null;

  let source;
  if (!infoItem || !itemLevel || level == null) {
    source = 'custom';
  } else {
    const fieldRank = LEVEL_RANK[level];
    const itemRank = LEVEL_RANK[itemLevel];
    if (fieldRank === undefined || itemRank === undefined) source = 'custom';
    else if (fieldRank === itemRank) source = 'inherit';
    else if (fieldRank > itemRank) source = 'custom-upgrade';
    else source = 'conflict';
  }
  return { level, source };
}

// 字段 → 数据安全分类目录条目（字段侧 securityCatalogId 正向引用，纯函数）。
// 字段未关联分类（如主数据引用字段）→ null。
export function fieldSecurityCatalog(field, securityCatalog) {
  const cid = field?.management?.securityCatalogId ?? null;
  if (!cid) return null;
  return (securityCatalog || []).find((c) => c.id === cid) || null;
}

// 字段 vs 数据安全分类目录的分级来源（治理自上而下：定位字段分级不得低于分类等级）。
// 返回 { level, source }，source ∈ inherit-catalog / custom-upgrade / conflict / custom；未关联分类 → null。
export function fieldSecurityCatalogSource(field, securityCatalog) {
  const cat = fieldSecurityCatalog(field, securityCatalog);
  if (!cat) return null;
  const level = field?.management?.securityLevel ?? null;
  if (level == null) return { level, source: 'custom' };
  const fieldRank = LEVEL_RANK[level];
  const catRank = LEVEL_RANK[cat.level];
  if (fieldRank === undefined || catRank === undefined) return { level, source: 'custom' };
  if (fieldRank === catRank) return { level, source: 'inherit-catalog' };
  if (fieldRank > catRank) return { level, source: 'custom-upgrade' };
  return { level, source: 'conflict' };
}
