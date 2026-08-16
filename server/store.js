// 数据存储与校验核心逻辑，纯 Node，可单测（不依赖 Express）
import seed from '../src/data.js';
import { analyzeNameCn } from '../src/infoItemNaming.js';
import { LEVEL_RANK } from '../src/fieldSecurity.js';
import { getNested, deepMerge } from '../src/nested.js';
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
    idKey: 'id', idPrefix: 'term', creatable: true, updatable: true,
    required: ['nameCn', 'nameEn', 'isClassWord'],
    unique: ['nameEn'],
    enum: { status: ['启用', '停用'] },
    types: { synonyms: 'array', isClassWord: 'bool' },
    refs: {},
    default: { status: '启用' },
  },
  valueDomains: {
    idKey: 'id', idPrefix: 'vd', creatable: true, updatable: true,
    required: ['code', 'dataType', 'length', 'precision'],
    unique: ['code'],
    enum: { dataType: ['varchar', 'decimal'], status: ['启用', '停用'] },
    types: { length: 'number', precision: 'number' },
    refs: {},
    default: { status: '启用' },
  },
  refDatas: {
    idKey: 'id', idPrefix: 'rd', creatable: true, updatable: true,
    required: ['code', 'name', 'values'],
    unique: ['code'],
    enum: { status: ['启用', '停用'] },
    types: { values: 'array' },
    refs: {},
    default: { status: '启用' },
  },
  infoItems: {
    idKey: 'id', idPrefix: 'ii', creatable: true, updatable: true,
    required: ['code', 'nameCn', 'nameEn', 'type', 'termIds', 'valueDomainId'],
    unique: ['code', 'nameEn'],
    // securityLevel 用枚举兜底而非 refs：refs 校验按 `state[target].map(x => x.id)` 取集合，
    // 而 security 主键是 `level`（无 id 字段），refs 会误报所有 L1-L4 引用不存在。
    enum: { type: ['技术', '业务'], securityLevel: ['L1', 'L2', 'L3', 'L4'], status: ['启用', '停用'] },
    types: { termIds: 'array' },
    refs: { valueDomainId: 'valueDomains', refDataId: 'refDatas', bizDomainId: 'bizDomains', termIds: 'baseTerms' },
    default: { status: '启用' },
  },
  qualityRules: {
    idKey: 'id', idPrefix: 'qr', creatable: true, updatable: true,
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
  // 数据安全分类目录（字段级定位）。category1/category2 是能力地图标签（中文名），dataType 唯一标识一条分类。
  // 字段定位改由字段侧 management.securityCatalogId 引用（见 fields.refs），本实体不再持有 fieldIds。
  securityCatalog: {
    idKey: 'id', idPrefix: 'sc', creatable: true, updatable: true,
    required: ['category1', 'category2', 'dataType', 'level'],
    unique: ['dataType'],
    enum: { level: ['L1', 'L2', 'L3', 'L4'], status: ['启用', '停用'] },
    types: {},
    refs: {},
    default: { status: '启用' },
  },
  tables: {
    idKey: 'id', idPrefix: 't', creatable: true, updatable: true,
    required: ['nameCn', 'nameEn', 'tableType', 'appId', 'dbId', 'bizDomainId', 'subjectId'],
    unique: ['nameEn'],
    enum: { tableType: ['业务表', '技术表'] },
    types: {},
    refs: { appId: 'applications', dbId: 'databases', bizDomainId: 'bizDomains', masterDataId: 'masterData' },
  },
  // 字段（M1 唯一锚点）：可新增 + 编辑。嵌套三块结构（business/technical/management），
  // 点号 key 供 validate 结构校验，editable 白名单堵住 id/tableId/seq/code/qualityRuleIds 等不可篡改字段（仅 edit 生效）。
  // create 必填含 tableId（所属表）+ business.code（表内唯一）+ nameCn/type/owner；seq/masterDataType/qualityRuleIds 服务端派生。
  fields: {
    idKey: 'id', idPrefix: 'f', creatable: true, updatable: true,
    required: ['tableId', 'business.code', 'business.nameCn', 'technical.type', 'management.owner'],
    unique: [],
    enum: { 'management.securityLevel': ['L1', 'L2', 'L3', 'L4'] },
    types: { 'technical.length': 'number', 'technical.isPK': 'bool', 'technical.isFK': 'bool' },
    refs: { tableId: 'tables', 'management.standardId': 'infoItems', 'business.masterDataId': 'masterData', 'management.securityCatalogId': 'securityCatalog' },
    editable: {
      business: ['nameCn', 'definition', 'masterDataId'],
      technical: ['type', 'length', 'isPK', 'isFK'],
      management: ['standardId', 'securityCatalogId', 'securityLevel', 'owner', 'updateFrequency'],
    },
  },
  portalAssets: {
    idKey: 'id', idPrefix: 'pa', creatable: true, updatable: false,
    required: ['name', 'category', 'dataOwner', 'usageType', 'securityLevel'],
    unique: ['name'],
    enum: {
      category: ['风资源', '海洋勘测', '风机设备', '运营监测', '海域环境'],
      usageType: ['下载', '申请'],
      securityLevel: ['L1', 'L2', 'L3', 'L4'],
      status: ['审批中', '已上架', '已下架'],
    },
    types: { tableIds: 'array', serviceIds: 'array', approval: 'array' },
    refs: { tableIds: 'tables', serviceIds: 'services' },
    default: { status: '审批中', featured: false, govSpecialist: '业务数据治理专员', manager: '数据管理人员' },
  },
};

export const ENTITIES = Object.keys(SCHEMAS);
export const CREATABLE = ENTITIES.filter((e) => SCHEMAS[e].creatable);
export const UPDATABLE = ENTITIES.filter((e) => SCHEMAS[e].updatable);

// update 时客户端不可修改的字段：派生字段（code/nameEn/termIds 服务端生成）+ 只读源字段（nameCn 改名需重派生）。
// 与 create 的「服务端强制派生」口径一致，堵住 PUT 篡改派生字段的缺口。
const IMMUTABLE_ON_UPDATE = {
  infoItems: ['code', 'nameEn', 'termIds', 'nameCn'],
  refDatas: ['code'],
  tables: ['partitions', 'indexes', 'history'], // 子表 / 版本历史由表详情与后续功能维护，编辑表级元数据时不可篡改
};

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
    let persisted = null;
    try {
      persisted = JSON.parse(readFileSync(dataFile, 'utf-8'));
    } catch {
      persisted = null; // 文件损坏 → 回退种子
    }
    // 版本校验：持久化版本落后/缺失于种子版本时自动重种，避免 stale data.json 掩盖新种子字段（白屏根因）。
    // 重种会丢弃历史写入（demo 可接受，本就是当前 manual 做法）。
    if (persisted && persisted.meta?.schemaVersion === seed.meta.schemaVersion) {
      state = persisted;
    } else {
      state = structuredClone(seed);
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

// 嵌套白名单过滤：只保留 schema.editable 声明的字段（如 fields 的 business/technical/management 三块），
// 堵住 id/tableId/seq/code/qualityRuleIds 等不可篡改字段被 PUT 注入。
function filterEditable(payload, editable) {
  const out = {};
  for (const [group, keys] of Object.entries(editable)) {
    const src = payload[group];
    if (src && typeof src === 'object' && !Array.isArray(src)) {
      const g = {};
      for (const k of keys) {
        if (src[k] !== undefined) g[k] = src[k];
      }
      if (Object.keys(g).length) out[group] = g;
    }
  }
  return out;
}

export function validate(entity, payload, { isUpdate = false, existing = null } = {}) {
  const schema = SCHEMAS[entity];
  const errors = [];
  if (!schema) return [`未知实体 ${entity}`];
  // update 时 required 针对合并结果（局部更新不误报），嵌套实体用 deepMerge 保留未编辑子块；
  // 其余校验只针对 payload 出现的字段。点号 key（如 business.nameCn）统一走 getNested。
  const merged = isUpdate && existing ? deepMerge(existing, payload) : payload;
  const existingKey = existing ? existing[schema.idKey] : null;

  // 1. 必填
  for (const key of schema.required) {
    if (isEmpty(getNested(merged, key))) errors.push(`字段 ${key} 必填`);
  }
  // 2. 枚举
  for (const [key, allowed] of Object.entries(schema.enum)) {
    const v = getNested(payload, key);
    if (v !== undefined && v !== null && !allowed.includes(v)) {
      errors.push(`字段 ${key} 取值「${v}」非法，应为 ${allowed.join('/')}`);
    }
  }
  // 3. 类型
  for (const [key, type] of Object.entries(schema.types || {})) {
    const v = getNested(payload, key);
    if (v === undefined || v === null) continue;
    if (!checkType(type, v)) errors.push(`字段 ${key} 类型应为 ${type}`);
  }
  // 4. 引用存在性（数组字段逐元素校验，空值跳过）
  for (const [key, target] of Object.entries(schema.refs)) {
    const val = getNested(payload, key);
    if (val === undefined || val === null || val === '') continue;
    const targetIds = new Set(state[target].map((x) => x.id));
    const vals = Array.isArray(val) ? val : [val];
    for (const v of vals) {
      if (!targetIds.has(v)) errors.push(`字段 ${key} 引用 ${v} 不存在于 ${target}`);
    }
  }
  // 5. 唯一性（排除自身）
  for (const key of schema.unique) {
    const v = getNested(payload, key);
    if (v === undefined || v === null) continue;
    const dup = state[entity].find((x) => getNested(x, key) === v && x[schema.idKey] !== existingKey);
    if (dup) errors.push(`字段 ${key} 值「${v}」重复`);
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

// 条件必填 + 数值约束 + 领域规则（跨实体）。
// ctx.merged：update 时合并后的最终记录，供依赖「最终态」的规则（如字段分级继承链）判断；create 时等于 payload。
function domainErrors(entity, payload, ctx = {}) {
  const errors = [];
  if (entity === 'infoItems' && payload.type === '业务') {
    if (isEmpty(payload.bizDomainId)) errors.push('字段 bizDomainId 必填（业务类信息项）');
    if (isEmpty(payload.definition)) errors.push('字段 definition 必填（业务类信息项）');
  }
  if (entity === 'valueDomains') {
    if (typeof payload.length === 'number' && payload.length <= 0) errors.push('字段 length 必须大于 0');
    if (typeof payload.precision === 'number' && payload.precision < 0) errors.push('字段 precision 必须大于等于 0');
  }
  if (entity === 'tables') {
    // 主题域是业务域的内嵌子集（非顶层实体），refs 校验无法覆盖，故在此单独校验引用存在性
    const subjectIds = new Set(state.bizDomains.flatMap((d) => (d.subjects || []).map((s) => s.id)));
    if (payload.subjectId && !subjectIds.has(payload.subjectId)) {
      errors.push(`字段 subjectId 引用「${payload.subjectId}」不存在于任何业务域主题域`);
    }
  }
  if (entity === 'portalAssets') {
    // 打包对象：表与服务至少其一非空
    const tableIds = Array.isArray(payload.tableIds) ? payload.tableIds : [];
    const serviceIds = Array.isArray(payload.serviceIds) ? payload.serviceIds : [];
    if (!tableIds.length && !serviceIds.length) {
      errors.push('打包数据表与数据服务至少选择一项');
    }
    // 治理一致性：securityLevel >= max(打包表字段最高级, 打包服务分级)
    let maxRank = 0;
    for (const tid of tableIds) {
      for (const f of state.fields.filter((f) => f.tableId === tid)) {
        const r = LEVEL_RANK[f.management?.securityLevel];
        if (r) maxRank = Math.max(maxRank, r);
      }
    }
    for (const sid of serviceIds) {
      const s = state.services.find((x) => x.id === sid);
      const r = LEVEL_RANK[s?.securityLevel];
      if (r) maxRank = Math.max(maxRank, r);
    }
    const ownRank = LEVEL_RANK[payload.securityLevel];
    if (ownRank != null && maxRank > 0 && ownRank < maxRank) {
      errors.push(`安全分级 ${payload.securityLevel} 低于打包对象的最高分级，需上调至 L${maxRank} 及以上`);
    }
  }
  if (entity === 'fields') {
    const final = ctx.merged || payload;
    // 字段编码表内唯一（跨表可重复，表内不可重复）
    const tableId = getNested(final, 'tableId');
    const code = getNested(final, 'business.code');
    if (tableId && code) {
      const dup = state.fields.find((f) => f.tableId === tableId && f.business?.code === code && f.id !== (ctx.existing?.id));
      if (dup) errors.push(`字段编码「${code}」在所属表内已存在`);
    }
    // 安全分级继承链：字段最终分级不得低于关联信息项分级（conflict 拦截），用 merged 判断最终态
    const standardId = getNested(final, 'management.standardId');
    const securityLevel = getNested(final, 'management.securityLevel');
    if (standardId && securityLevel) {
      const item = state.infoItems.find((i) => i.id === standardId);
      const itemLevel = item?.securityLevel;
      if (itemLevel && LEVEL_RANK[securityLevel] != null && LEVEL_RANK[itemLevel] != null && LEVEL_RANK[securityLevel] < LEVEL_RANK[itemLevel]) {
        errors.push(`安全分级 ${securityLevel} 低于关联信息项「${item.nameCn}」的 ${itemLevel}，需上调或先解除关联标准`);
      }
    }
    // 数据安全分类目录：定位字段最终分级不得低于分类等级（治理自上而下，分类等级是定位字段的下限）
    const catalogId = getNested(final, 'management.securityCatalogId');
    if (catalogId && securityLevel) {
      const cat = state.securityCatalog.find((c) => c.id === catalogId);
      const catLevel = cat?.level;
      if (catLevel && LEVEL_RANK[securityLevel] != null && LEVEL_RANK[catLevel] != null && LEVEL_RANK[securityLevel] < LEVEL_RANK[catLevel]) {
        errors.push(`安全分级 ${securityLevel} 低于关联数据安全分类「${cat.dataType}」的 ${catLevel}，需上调或先解除关联分类`);
      }
    }
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
  if (entity === 'portalAssets') {
    // 审批链服务端生成首步「发起上架」，后续审批 / 上架由占位流程推进
    finalPayload = {
      ...payload,
      approval: [{ step: '发起上架', actor: payload.manager || '数据管理人员', action: '提交', time: new Date().toISOString().slice(0, 10), comment: '' }],
    };
  }
  if (entity === 'tables') {
    // 新建表只登记表级元数据（字段/分区/索引由表详情与后续功能维护），服务端兜底：
    // 分区/索引空数组起步，版本历史服务端生成首条「新建」记录，客户端不可注入
    finalPayload = {
      ...payload,
      partitions: Array.isArray(payload.partitions) ? payload.partitions : [],
      indexes: Array.isArray(payload.indexes) ? payload.indexes : [],
      history: [{ version: 'v1.0', time: new Date().toISOString().slice(0, 10), operator: '数据治理组', action: '新建', desc: '登记新表元数据' }],
    };
  }
  if (entity === 'fields') {
    // 新建字段服务端派生：seq = 表内最大序号 +1；masterDataType 随 masterDataId 从主数据 entityType 派生；
    // qualityRuleIds 空数组起步（质量规则由质量模块维护）。客户端传了也无效。
    const seq = state.fields.filter((f) => f.tableId === payload.tableId).reduce((m, f) => Math.max(m, f.seq || 0), 0) + 1;
    const md = payload.business?.masterDataId ? state.masterData.find((m) => m.id === payload.business.masterDataId) : null;
    finalPayload = {
      ...payload,
      seq,
      business: { ...(payload.business || {}), masterDataType: md ? md.entityType : null },
      technical: { ...(payload.technical || {}), qualityRuleIds: [] },
    };
  }
  const domain = domainErrors(entity, finalPayload, { merged: finalPayload });
  if (domain.length) return { ok: false, errors: domain, code: 'invalid' };

  const errors = validate(entity, finalPayload);
  if (errors.length) return { ok: false, errors, code: 'invalid' };
  const id = nextId(entity);
  const record = { ...(schema.default || {}), ...finalPayload, [schema.idKey]: id }; // default 铺底，服务端生成 id 优先，客户端不可注入
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
  // 剥离不可篡改字段（主键 + 派生/只读源字段），客户端传入即忽略，与 create 的「服务端强制派生」口径一致，
  // 防止 PUT 破坏信息项命名三元一致性（nameCn↔nameEn↔termIds）与参考数据编号自增。
  let clean = { ...payload };
  delete clean[schema.idKey];
  for (const key of IMMUTABLE_ON_UPDATE[entity] || []) delete clean[key];
  // 嵌套白名单过滤：只保留 editable 声明的字段，堵住 id/tableId/seq/code/qualityRuleIds 等不可篡改字段
  if (schema.editable) clean = filterEditable(clean, schema.editable);
  // 嵌套合并（fields 局部更新保留未编辑子块；扁平实体 deepMerge 等价浅合并）
  const merged = deepMerge(existing, clean);
  // 领域规则（fields 分级继承链等依赖最终态，用 merged 判断）
  const domain = domainErrors(entity, clean, { isUpdate: true, existing, merged });
  if (domain.length) return { ok: false, errors: domain, code: 'invalid' };
  const errors = validate(entity, clean, { isUpdate: true, existing });
  if (errors.length) return { ok: false, errors, code: 'invalid' };
  Object.assign(existing, merged);
  persist();
  return { ok: true, record: existing };
}
