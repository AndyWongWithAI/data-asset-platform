import { getNested } from './nested.js';

// 引用下拉选项过滤：隐藏 status='停用' 的项，但保留当前 record 已引用的停用项（编辑回显）。
// options 为被引用实体的完整数组；fieldKey 为当前表单字段（对应 FORM_SCHEMAS 的 ref/multiref 字段 key）。
// 用 getNested 取 current，兼容点号 key（如 fields 的 management.standardId / management.securityCatalogId）。
export function filterRefOptions(options, record, fieldKey) {
  const current = record ? getNested(record, fieldKey) : undefined;
  const currentIds = new Set(Array.isArray(current) ? current : current ? [current] : []);
  return (options || []).filter((o) => o.status !== '停用' || currentIds.has(o.id));
}
