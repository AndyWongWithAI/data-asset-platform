// 嵌套结构读写工具（纯函数，前后端共用）。
// 用途：字段（fields）的 business/technical/management 三块嵌套结构，
// 表单引擎用点号 key（如 'business.nameCn'）读写，后端用 deepMerge 合并局部更新。

// 按点号路径读嵌套值（无点号时等价 obj[key]）
export function getNested(obj, path) {
  if (path == null || obj == null) return undefined;
  return String(path).split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

// 扁平点号 key → 嵌套对象（如 { 'business.nameCn': 'x', 'technical.type': 'int' } → { business: { nameCn: 'x' }, technical: { type: 'int' } }）
export function unflatten(flat) {
  const out = {};
  for (const [k, v] of Object.entries(flat || {})) {
    const parts = String(k).split('.');
    if (parts.length === 1) { out[k] = v; continue; }
    let cur = out;
    for (let i = 0; i < parts.length - 1; i++) {
      if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = v;
  }
  return out;
}

// 深合并 patch 到 target：嵌套对象递归合并，数组/标量整体替换（字段局部更新靠它保留未编辑子块）
export function deepMerge(target, patch) {
  const out = { ...target };
  for (const [k, v] of Object.entries(patch || {})) {
    const tv = out[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
      out[k] = deepMerge(tv, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
