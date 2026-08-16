import { FORM_SCHEMAS } from './schema.js';
import { create } from './api.js';

// 批量导入纯函数：列定义 / CSV 解析 / 模板生成 / 逐条导入。不依赖 React，可 node --test。

// 列定义：从 FORM_SCHEMAS 取非 derived/readonly 字段（readonlyOnUpdate 不影响 create，仍导入）
export function buildColumns(entity) {
  return (FORM_SCHEMAS[entity] || []).filter((f) => f.type !== 'derived' && !f.readonly);
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
export function buildTemplateCsv(entity, sample) {
  const cols = buildColumns(entity);
  const header = cols.map((f) => f.label);
  const row = cols.map((f) => serializeCell(f, sample ? sample[f.key] : undefined));
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

// CSV 行 → payload：按字段 type 解析
export function rowToPayload(entity, headers, cells) {
  const cols = buildColumns(entity);
  const payload = {};
  cols.forEach((f, idx) => {
    const raw = (cells[idx] ?? '').trim();
    if (raw === '') return;
    if (f.type === 'subtable') {
      payload[f.key] = raw.split('|').filter(Boolean).map((seg) => {
        const [code, name] = seg.split(':');
        return { code: (code || '').trim(), name: (name || '').trim() };
      });
    } else if (f.multi) {
      payload[f.key] = raw.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    } else if (f.type === 'bool') {
      payload[f.key] = raw === 'true' || raw === '是' || raw === '1';
    } else if (f.type === 'number') {
      const n = parseFloat(raw);
      if (!Number.isNaN(n)) payload[f.key] = n;
    } else {
      payload[f.key] = raw;
    }
  });
  return payload;
}

// 逐条导入：headers 为 CSV 表头行（用于校验列序，也可不校验直接按 buildColumns 顺序）；rows 为数据行
export async function importRows(entity, rows) {
  const success = [];
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const payload = rowToPayload(entity, null, rows[i]);
    try {
      const record = await create(entity, payload);
      success.push(record);
    } catch (e) {
      errors.push({ row: i + 1, errors: [e.message] });
    }
  }
  return { success, errors };
}
