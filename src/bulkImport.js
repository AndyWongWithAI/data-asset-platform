import { FORM_SCHEMAS } from './schema.js';
import { create } from './api.js';
import { getNested, unflatten } from './nested.js';

// 批量导入纯函数：列定义 / CSV 解析 / 模板生成 / 逐条导入。不依赖 React，可 node --test。

// 列定义：从 FORM_SCHEMAS 取非 derived/readonly 字段（readonlyOnUpdate 不影响 create，仍导入）。
// excludeKeys：上下文注入的字段（如字段批量导入的 tableId）不进模板列，由 defaults 兜底。
export function buildColumns(entity, excludeKeys = []) {
  return (FORM_SCHEMAS[entity] || []).filter((f) => f.type !== 'derived' && !f.readonly && !excludeKeys.includes(f.key));
}

// 单元格序列化：把种子示例值转成 CSV 单元格文本
export function serializeCell(field, value) {
  if (value == null) return '';
  if (field.type === 'subtable') {
    return (value || []).map((r) => `${r.code}:${r.name}`).join('|');
  }
  if (field.type === 'bool') return value ? 'true' : 'false';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

// 模板 CSV：表头 + 一行示例
export function buildTemplateCsv(entity, sample, excludeKeys = []) {
  const cols = buildColumns(entity, excludeKeys);
  const header = cols.map((f) => f.label);
  const row = cols.map((f) => serializeCell(f, sample ? getNested(sample, f.key) : undefined));
  return [header, row].map((cells) => cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

// CSV 解析：支持双引号包裹、引号内逗号、"" 转义。返回 string[][]（不含表头由调用方决定）
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell); cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c !== '')) rows.push(row);
  return rows;
}

// 单元格 → 解析结果：{ skip: true }（空值/无法解析）或 { value }。空值返回 skip，不写入 payload。
function parseCell(field, raw) {
  const s = String(raw ?? '').trim();
  if (s === '') return { skip: true };
  if (field.type === 'subtable') {
    return { value: s.split('|').filter(Boolean).map((seg) => {
      const [code, name] = seg.split(':');
      return { code: (code || '').trim(), name: (name || '').trim() };
    }) };
  }
  if (field.multi) return { value: s.split(/[,，]/).map((x) => x.trim()).filter(Boolean) };
  if (field.type === 'bool') return { value: s === 'true' || s === '是' || s === '1' };
  if (field.type === 'number') {
    const n = parseFloat(s);
    if (Number.isNaN(n)) return { skip: true };
    return { value: n };
  }
  return { value: s };
}

// CSV 行 → payload：按 buildColumns 固定顺序取值（单元测试 / 模板示例用；导入走 rowToPayloadMapped 按表头对齐）
export function rowToPayload(entity, headers, cells) {
  const cols = buildColumns(entity);
  const payload = {};
  cols.forEach((f, idx) => {
    const parsed = parseCell(f, cells[idx]);
    if (parsed.skip) return;
    payload[f.key] = parsed.value;
  });
  return unflatten(payload);
}

// CSV 行 → payload：按表头映射后的列索引取值（列顺序可任意，不再要求与模板一致）。
// mapping 由 mapHeaders 产出（已排除 defaults 注入的字段），点号 key 最后 unflatten 成嵌套对象。
export function rowToPayloadMapped(entity, mapping, cells) {
  const payload = {};
  for (const { field, idx } of mapping) {
    const parsed = parseCell(field, cells[idx]);
    if (parsed.skip) continue;
    payload[field.key] = parsed.value;
  }
  return unflatten(payload);
}

// 表头行 → 列映射：按 label 精确匹配（去 BOM/首尾空白）。返回 { mapping, missing, extra }。
// missing = 模板必需列但表头缺失；extra = 表头中存在但无法识别的列（列名拼错/多余列）。
export function mapHeaders(headers, entity, excludeKeys = []) {
  const cols = buildColumns(entity, excludeKeys);
  const cleaned = (headers || []).map((h) => String(h ?? '').replace(/^\ufeff/, '').trim());
  const mapping = [];
  const missing = [];
  for (const f of cols) {
    const idx = cleaned.indexOf(f.label);
    if (idx === -1) missing.push(f.label);
    else mapping.push({ field: f, idx });
  }
  const extra = cleaned
    .filter((h) => h && !cols.some((f) => f.label === h))
    .map((label) => ({ label }));
  return { mapping, missing, extra };
}

// 逐条导入：headerRow 为 CSV 表头行（按 label 校验列；缺列/未知列直接中止，不静默错位导入）；rows 为数据行。
// defaults：上下文注入的固定值（如字段批量导入的 tableId），不进模板列、不校验、逐条合并到 payload。
export async function importRows(entity, headerRow, rows, createFn = create, defaults = {}) {
  const excludeKeys = Object.keys(defaults);
  const { mapping, missing, extra } = mapHeaders(headerRow, entity, excludeKeys);
  if (missing.length || extra.length) {
    const msgs = [];
    if (missing.length) msgs.push(`缺少必需列：${missing.join('、')}`);
    if (extra.length) msgs.push(`未知列：${extra.map((e) => e.label).join('、')}`);
    return { success: [], errors: [], headerError: msgs.join('；') };
  }
  const success = [];
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const payload = rowToPayloadMapped(entity, mapping, rows[i]);
    try {
      const record = await createFn(entity, { ...defaults, ...payload });
      success.push(record);
    } catch (e) {
      errors.push({ row: i + 1, errors: [e.message] });
    }
  }
  return { success, errors };
}
