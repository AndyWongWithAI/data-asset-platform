// 7 个写实体的表单字段契约（驱动通用表单引擎 EntityForm.jsx）。
// 字段结构：{ key, label, type, required, enum?, ref?, multi?, placeholder?, help?,
//             derived?, dynamicBy?, dynamicOptions?, rows?, readonly? }
// type 取值：text/number/bool/enum/ref/multiref/subtable/dynamic/expr/derived

export const FORM_SCHEMAS = {
  baseTerms: [
    { key: 'nameCn', label: '中文名', type: 'text', required: true },
    { key: 'nameEn', label: '英文名', type: 'text', required: true },
    { key: 'synonyms', label: '同义词', type: 'text', multi: true, placeholder: '多个同义词用逗号分隔', help: '可选，逗号分隔' },
    { key: 'isClassWord', label: '是否类词', type: 'bool', required: true },
  ],

  valueDomains: [
    { key: 'code', label: '编号', type: 'text', required: true, placeholder: 'VD-XXX' },
    { key: 'dataType', label: '数据类型', type: 'enum', required: true, enum: ['varchar', 'decimal'] },
    { key: 'length', label: '长度', type: 'number', required: true, help: '>0' },
    { key: 'precision', label: '精度', type: 'number', required: true, help: '≥0' },
  ],

  refDatas: [
    { key: 'code', label: '编号', type: 'derived', help: '自动生成（CK + 四位递增）' },
    { key: 'name', label: '名称', type: 'text', required: true },
    { key: 'values', label: '枚举值', type: 'subtable', required: true, rows: [
      { key: 'code', label: '编码', type: 'text' },
      { key: 'name', label: '名称', type: 'text' },
    ] },
  ],

  infoItems: [
    { key: 'nameCn', label: '中文名', type: 'text', required: true, placeholder: '如：风机标识', help: '输入后自动拆词翻译，英文名与词根自动派生' },
    { key: 'nameEn', label: '英文名', type: 'derived' },
    { key: 'type', label: '类型', type: 'enum', required: true, enum: ['技术', '业务'] },
    { key: 'bizDomainId', label: '业务域', type: 'ref', ref: 'bizDomains', help: 'type=业务时必填' },
    { key: 'definition', label: '定义', type: 'text', help: 'type=业务时必填' },
    { key: 'valueDomainId', label: '值域', type: 'ref', ref: 'valueDomains', required: true },
    { key: 'refDataId', label: '参考数据', type: 'ref', ref: 'refDatas' },
  ],

  qualityRules: [
    { key: 'name', label: '规则名', type: 'text', required: true },
    { key: 'type', label: '类型', type: 'enum', required: true, enum: ['准确性', '完整性', '一致性', '及时性'] },
    { key: 'targetFieldId', label: '绑定字段', type: 'ref', ref: 'fields', required: true },
    { key: 'expr', label: '校验表达式', type: 'expr', required: true },
    { key: 'threshold', label: '阈值', type: 'text', required: true },
    { key: 'severity', label: '严重级别', type: 'enum', required: true, enum: ['严重', '警告', '提示'] },
    { key: 'status', label: '状态', type: 'enum', required: true, enum: ['启用', '停用'] },
  ],

  // 主数据由外部系统同步，不在平台内新增/编辑，故无表单契约（从 FORM_SCHEMAS 移除）

  security: [
    { key: 'level', label: '级别', type: 'text', readonly: true },
    { key: 'name', label: '名称', type: 'text', required: true },
    { key: 'desc', label: '描述', type: 'text', required: true },
    { key: 'mask', label: '脱敏策略', type: 'text' },
  ],
};

// 实体名 → 中文标题（供表单标题与主控复用）
export const ENTITY_TITLES = {
  baseTerms: '基础术语',
  valueDomains: '值域',
  refDatas: '参考数据',
  infoItems: '信息项',
  qualityRules: '质量规则',
  security: '安全分级',
};
