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

// 字段 → 数据安全分类目录条目（fieldIds 反向查找，纯函数）。
// 字段未登记进任何分类（如主数据引用字段）→ null。
export function fieldSecurityCatalog(fieldId, securityCatalog) {
  return (securityCatalog || []).find((c) => (c.fieldIds || []).includes(fieldId)) || null;
}
