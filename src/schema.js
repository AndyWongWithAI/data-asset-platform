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
    { key: 'nameCn', label: '中文名', type: 'text', required: true, readonlyOnUpdate: true, placeholder: '如：风机标识', help: '编辑时只读；输入后自动拆词翻译，英文名与词根自动派生' },
    { key: 'nameEn', label: '英文名', type: 'derived' },
    { key: 'type', label: '类型', type: 'enum', required: true, enum: ['技术', '业务'] },
    { key: 'bizDomainId', label: '业务域', type: 'ref', ref: 'bizDomains', help: 'type=业务时必填' },
    { key: 'definition', label: '定义', type: 'text', help: 'type=业务时必填' },
    { key: 'valueDomainId', label: '值域', type: 'ref', ref: 'valueDomains', required: true },
    { key: 'refDataId', label: '参考数据', type: 'ref', ref: 'refDatas' },
    { key: 'securityLevel', label: '安全分级', type: 'enum', enum: ['L1', 'L2', 'L3', 'L4'], help: '可选，空=未关联安全分级' },
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

  // 数据安全分类目录：category1/category2 级联（对齐能力地图 capabilityMap），dataType 唯一标识（编辑只读）。
  securityCatalog: [
    { key: 'category1', label: '一级分类', type: 'enum', required: true, enum: ['项目经营域', '设计研发域', '工程交付域', '专业技术域', '支撑服务域'], help: '5 能力域' },
    { key: 'category2', label: '二级分类', type: 'cascadeRef', required: true, source: 'capabilityMap', sourceKey: 'items', filterBy: 'category1', help: '随一级分类联动（27 能力项）' },
    { key: 'dataType', label: '数据类型', type: 'text', required: true, readonlyOnUpdate: true, help: '分类唯一标识，编辑时只读' },
    { key: 'level', label: '数据分级', type: 'enum', required: true, enum: ['L1', 'L2', 'L3', 'L4'], help: '定位字段的分级不得低于此等级' },
  ],

  portalAssets: [
    { key: 'name', label: '资产名', type: 'text', required: true },
    { key: 'category', label: '业务分类', type: 'enum', required: true, enum: ['风资源', '海洋勘测', '风机设备', '运营监测', '海域环境'] },
    { key: 'desc', label: '业务介绍', type: 'text', required: true },
    { key: 'dataOwner', label: '责任业务方', type: 'text', required: true },
    { key: 'usageType', label: '使用方式', type: 'enum', required: true, enum: ['下载', '申请'] },
    { key: 'securityLevel', label: '安全分级', type: 'enum', required: true, enum: ['L1', 'L2', 'L3', 'L4'], help: '不得低于打包对象的最高分级' },
    { key: 'tableIds', label: '打包数据表', type: 'multiref', ref: 'tables', help: '数据表与数据服务至少选择一项' },
    { key: 'serviceIds', label: '打包数据服务', type: 'multiref', ref: 'services' },
  ],

  // 表结构（M1）：只登记表级元数据；字段/分区/索引由表详情与后续功能维护。
  // subjectId（主题域）是 bizDomains 的内嵌子集，用 cascadeRef 随业务域联动。
  tables: [
    { key: 'nameCn', label: '表中文名', type: 'text', required: true, placeholder: '如：测风数据表' },
    { key: 'nameEn', label: '表英文名', type: 'text', required: true, placeholder: '如：wind_measurement' },
    { key: 'tableType', label: '表类型', type: 'enum', required: true, enum: ['业务表', '技术表'] },
    { key: 'appId', label: '所属应用', type: 'ref', ref: 'applications', required: true },
    { key: 'dbId', label: '所属库', type: 'ref', ref: 'databases', required: true },
    { key: 'bizDomainId', label: '业务域', type: 'ref', ref: 'bizDomains', required: true },
    { key: 'subjectId', label: '主题域', type: 'cascadeRef', required: true, source: 'bizDomains', sourceKey: 'subjects', filterBy: 'bizDomainId', help: '随业务域联动' },
    { key: 'masterDataId', label: '关联主数据', type: 'ref', ref: 'masterData', help: '可选' },
    { key: 'desc', label: '表描述', type: 'text', placeholder: '如：测风塔实测风速/风向/湍流' },
  ],

  // 字段（M1 唯一锚点）：可新增 + 编辑。嵌套三块结构用点号 key 读写（business/technical/management）。
  // tableId（所属表）+ business.code（字段编码）readonlyOnUpdate：新增时填写/选表，编辑时只读。
  // id/seq/masterDataType/qualityRuleIds 服务端派生故不出现在表单。
  fields: [
    { key: 'tableId', label: '所属表', type: 'ref', ref: 'tables', required: true, readonlyOnUpdate: true, help: '新增时选择所属表，编辑时只读' },
    { key: 'business.code', label: '字段编码', type: 'text', required: true, readonlyOnUpdate: true, placeholder: '如 wind_speed_value' },
    { key: 'business.nameCn', label: '字段中文名', type: 'text', required: true },
    { key: 'business.definition', label: '业务定义', type: 'text' },
    { key: 'business.masterDataId', label: '关联主数据', type: 'ref', ref: 'masterData', help: '可选' },
    { key: 'technical.type', label: '技术类型', type: 'text', required: true },
    { key: 'technical.length', label: '长度', type: 'number' },
    { key: 'technical.isPK', label: '主键', type: 'bool' },
    { key: 'technical.isFK', label: '外键', type: 'bool' },
    { key: 'management.standardId', label: '关联标准', type: 'ref', ref: 'infoItems', help: '贯标信息项，可选' },
    { key: 'management.securityCatalogId', label: '关联数据安全分类', type: 'ref', ref: 'securityCatalog', help: '字段级定位到分类目录，可选' },
    { key: 'management.securityLevel', label: '安全分级', type: 'enum', enum: ['L1', 'L2', 'L3', 'L4'], help: '不得低于关联信息项/分类目录分级' },
    { key: 'management.owner', label: '责任人', type: 'text', required: true },
    { key: 'management.updateFrequency', label: '更新频率', type: 'text' },
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
  securityCatalog: '数据安全分类',
  portalAssets: '门户资产',
  tables: '表',
  fields: '字段',
};
