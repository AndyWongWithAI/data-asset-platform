// 数据存储与校验核心逻辑，纯 Node，可单测（不依赖 Express）
import seed from '../src/data.js';
import { analyzeNameCn } from '../src/infoItemNaming.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_FILE = path.join(__dirname, 'data.json');

// 可读实体：seed 顶层数组（排除 meta 元信息），供 GET 读列表/单条
export const READABLE = Object.keys(seed).filter((k) => k !== 'meta' && Array.isArray(seed[k]));

let state = null;
let dataFile = DEFAULT_DATA_FILE;

// ===== 实体 Schema（结构校验：必填/唯一/枚举/类型/引用）=====
// idKey：主键字段（默认 id）；idPrefix：新增时 id 生成前缀（null=不支持新增）；
// creatable/updatable：是否支持 POST 新增 / PUT 修改。
// 领域规则（信息项命名、动态属性、变更影响、条件必填等）留 P2，此处只做结构校验。
const SCHEMAS = {
  baseTerms: {
    idKey: 'id', idPrefix: 'term', creatable: true, updatable: false,
    required: ['nameCn', 'nameEn', 'isClassWord'],
    unique: ['nameEn'],
    enum: {},
    types: { synonyms: 'array', isClassWord: 'bool' },
    refs: {},
  },
  valueDomains: {
    idKey: 'id', idPrefix: 'vd', creatable: true, updatable: false,
    required: ['code', 'dataType', 'length', 'precision'],
    unique: ['code'],
    enum: { dataType: ['varchar', 'decimal'] },
    types: { length: 'number', precision: 'number' },
    refs: {},
  },
  refDatas: {
    idKey: 'id', idPrefix: 'rd', creatable: true, updatable: false,
    required: ['code', 'name', 'values'],
    unique: ['code'],
    enum: {},
    types: { values: 'array' },
    refs: {},
  },
  infoItems: {
    idKey: 'id', idPrefix: 'ii', creatable: true, updatable: false,
    required: ['code', 'nameCn', 'nameEn', 'type', 'termIds', 'valueDomainId'],
    unique: ['code', 'nameEn'],
    enum: { type: ['技术', '业务'] },
    types: { termIds: 'array' },
    refs: { valueDomainId: 'valueDomains', refDataId: 'refDatas', bizDomainId: 'bizDomains', termIds: 'baseTerms' },
  },
  qualityRules: {
    idKey: 'id', idPrefix: 'qr', creatable: true, updatable: false,
    required: ['name', 'type', 'targetFieldId', 'expr', 'threshold', 'severity', 'status'],
    unique: [],
    enum: { type: ['准确性', '完整性', '一致性', '及时性'], severity: ['严重', '警告', '提示'], status: ['启用', '停用'] },
    types: {},
    refs: { targetFieldId: 'fields' },
  },
  masterData: {
    idKey: 'id', idPrefix: 'md', creatable: false, updatable: false,
    required: ['code', 'name', 'entityType', 'definition', 'rule', 'owner'],
    unique: ['code'],
    enum: { entityType: ['风机', '海缆', '升压站', '项目', '供应商'] },
    types: { approvals: 'array' },
    refs: {},
  },
  security: {
    idKey: 'level', idPrefix: null, creatable: false, updatable: true,
    required: ['name', 'desc'],
    unique: [],
    enum: {},
    types: {},
    refs: {},
  },
};

export const ENTITIES = Object.keys(SCHEMAS);
export const CREATABLE = ENTITIES.filter((e) => SCHEMAS[e].creatable);
export const UPDATABLE = ENTITIES.filter((e) => SCHEMAS[e].updatable);

export function idKeyOf(entity) {
  return SCHEMAS[entity]?.idKey ?? 'id';
}

// ===== 生命周期 =====
function persist() {
  mkdirSync(path.dirname(dataFile), { recursive: true });
  writeFileSync(dataFile, JSON.stringify(state, null, 2));
}

function ensureInit() {
  if (state !== null) return state;
  if (existsSync(dataFile)) {
    try {
      state = JSON.parse(readFileSync(dataFile, 'utf-8'));
    } catch {
      state = structuredClone(seed); // 文件损坏时回退种子
      persist();
    }
  } else {
    state = structuredClone(seed);
    persist();
  }
  return state;
}

export function init(opts = {}) {
  if (opts.dataFile) dataFile = opts.dataFile;
  state = null; // 重置，用新路径重新加载
  return ensureInit();
}

export function getState() {
  return ensureInit();
}

export function list(entity) {
  return READABLE.includes(entity) ? ensureInit()[entity] : null;
}

export function getOne(entity, idValue) {
  const items = ensureInit()[entity];
  if (!Array.isArray(items)) return null;
  const idKey = idKeyOf(entity);
  return items.find((x) => String(x[idKey]) === String(idValue)) ?? null;
}

// ===== id 生成（idPrefix + 递增数字）=====
function nextId(entity) {
  const schema = SCHEMAS[entity];
  let max = 0;
  const re = new RegExp(`^${schema.idPrefix}_(\\d+)$`);
  for (const it of state[entity]) {
    const m = String(it[schema.idKey]).match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${schema.idPrefix}_${max + 1}`;
}

// ===== 结构校验 =====
function isEmpty(v) {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
}

function checkType(type, v) {
  switch (type) {
    case 'array': return Array.isArray(v);
    case 'bool': return typeof v === 'boolean';
    case 'number': return typeof v === 'number';
    case 'object': return typeof v === 'object' && v !== null && !Array.isArray(v);
    default: return true;
  }
}

export function validate(entity, payload, { isUpdate = false, existing = null } = {}) {
  const schema = SCHEMAS[entity];
  const errors = [];
  if (!schema) return [`未知实体 ${entity}`];
  // update 时 required 针对合并结果（局部更新不误报），其余校验只针对 payload 出现的字段
  const merged = isUpdate && existing ? { ...existing, ...payload } : payload;
  const existingKey = existing ? existing[schema.idKey] : null;

  // 1. 必填
  for (const key of schema.required) {
    if (isEmpty(merged[key])) errors.push(`字段 ${key} 必填`);
  }
  // 2. 枚举
  for (const [key, allowed] of Object.entries(schema.enum)) {
    if (payload[key] !== undefined && payload[key] !== null && !allowed.includes(payload[key])) {
      errors.push(`字段 ${key} 取值「${payload[key]}」非法，应为 ${allowed.join('/')}`);
    }
  }
  // 3. 类型
  for (const [key, type] of Object.entries(schema.types || {})) {
    const v = payload[key];
    if (v === undefined || v === null) continue;
    if (!checkType(type, v)) errors.push(`字段 ${key} 类型应为 ${type}`);
  }
  // 4. 引用存在性（数组字段逐元素校验，空值跳过）
  for (const [key, target] of Object.entries(schema.refs)) {
    const val = payload[key];
    if (val === undefined || val === null || val === '') continue;
    const targetIds = new Set(state[target].map((x) => x.id));
    const vals = Array.isArray(val) ? val : [val];
    for (const v of vals) {
      if (!targetIds.has(v)) errors.push(`字段 ${key} 引用 ${v} 不存在于 ${target}`);
    }
  }
  // 5. 唯一性（排除自身）
  for (const key of schema.unique) {
    if (payload[key] === undefined || payload[key] === null) continue;
    const dup = state[entity].find((x) => x[key] === payload[key] && x[schema.idKey] !== existingKey);
    if (dup) errors.push(`字段 ${key} 值「${payload[key]}」重复`);
  }
  return errors;
}

// ===== P2 领域规则（结构校验之上）=====
// 信息项命名派生：nameCn/nameEn 按 termIds 词根派生，code 缺失时自增，末位词根必须是类词。
// 返回 { ok, errors, derived }：derived 仅含实际派生出的字段，客户端显式传且与派生值不一致时按错误处理。
function deriveInfoItem(payload) {
  // 规则 B/C：由输入的中文名拆词翻译，派生 nameEn + termIds；缺词根 / 末位非类词硬校验
  const nameCn = String(payload.nameCn ?? '').trim();
  const analysis = analyzeNameCn(nameCn, state.baseTerms);
  const errors = [...analysis.errors];

  // 规则 A：code 始终由服务端生成（II + 四位补零递增），客户端不可控制，堵住任意 code 注入
  let max = 0;
  for (const it of state.infoItems) {
    const m = String(it.code).match(/^II(\d{4})$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  const code = `II${String(max + 1).padStart(4, '0')}`;

  if (errors.length) return { ok: false, errors, code: 'invalid' };

  return {
    ok: true,
    errors: [],
    derived: { code, nameCn, nameEn: analysis.nameEn, termIds: analysis.termIds },
  };
}

// 参考数据编号服务端自增（CK + 四位补零递增），客户端不可控制
function nextRefDataCode() {
  let max = 0;
  for (const it of state.refDatas) {
    const m = String(it.code).match(/^CK(\d{4})$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `CK${String(max + 1).padStart(4, '0')}`;
}

// 条件必填 + 数值约束（跨实体）
function domainErrors(entity, payload) {
  const errors = [];
  if (entity === 'infoItems' && payload.type === '业务') {
    if (isEmpty(payload.bizDomainId)) errors.push('字段 bizDomainId 必填（业务类信息项）');
    if (isEmpty(payload.definition)) errors.push('字段 definition 必填（业务类信息项）');
  }
  if (entity === 'valueDomains') {
    if (typeof payload.length === 'number' && payload.length <= 0) errors.push('字段 length 必须大于 0');
    if (typeof payload.precision === 'number' && payload.precision < 0) errors.push('字段 precision 必须大于等于 0');
  }
  return errors;
}

// ===== CRUD =====
export function create(entity, payload = {}) {
  ensureInit();
  const schema = SCHEMAS[entity];
  if (!schema) return { ok: false, errors: [`未知实体 ${entity}`], code: 'not_found' };
  if (!schema.creatable) return { ok: false, errors: [`实体 ${entity} 不支持新增`], code: 'not_supported' };

  // P2 领域规则：先派生（信息项命名），再做条件必填/数值约束，最后走结构校验
  let finalPayload = payload;
  if (entity === 'infoItems') {
    const derived = deriveInfoItem(payload);
    if (!derived.ok) return derived;
    finalPayload = { ...payload, ...derived.derived };
  }
  if (entity === 'refDatas') {
    // 编号服务端自增，客户端不可注入
    finalPayload = { ...payload, code: nextRefDataCode() };
  }
  const domain = domainErrors(entity, finalPayload);
  if (domain.length) return { ok: false, errors: domain, code: 'invalid' };

  const errors = validate(entity, finalPayload);
  if (errors.length) return { ok: false, errors, code: 'invalid' };
  const id = nextId(entity);
  const record = { ...finalPayload, [schema.idKey]: id }; // 服务端生成 id 优先，客户端不可注入
  state[entity].push(record);
  persist();
  return { ok: true, record };
}

export function update(entity, keyValue, payload = {}) {
  ensureInit();
  const schema = SCHEMAS[entity];
  if (!schema) return { ok: false, errors: [`未知实体 ${entity}`], code: 'not_found' };
  if (!schema.updatable) return { ok: false, errors: [`实体 ${entity} 不支持修改`], code: 'not_supported' };
  const existing = state[entity].find((x) => String(x[schema.idKey]) === String(keyValue));
  if (!existing) return { ok: false, errors: [`未找到 ${entity} 中 ${schema.idKey}=${keyValue}`], code: 'not_found' };
  const errors = validate(entity, payload, { isUpdate: true, existing });
  if (errors.length) return { ok: false, errors, code: 'invalid' };
  const clean = { ...payload };
  delete clean[schema.idKey]; // 主键不可篡改
  Object.assign(existing, clean);
  persist();
  return { ok: true, record: existing };
}
