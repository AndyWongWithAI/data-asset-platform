import test from 'node:test';
import assert from 'node:assert/strict';
import { buildColumns, serializeCell, buildTemplateCsv, parseCsv, rowToPayload, rowToPayloadMapped, mapHeaders, importRows } from '../src/bulkImport.js';

test('buildColumns 排除 derived/readonly', () => {
  const cols = buildColumns('refDatas');
  assert.deepEqual(cols.map((c) => c.key), ['name', 'values']); // code 是 derived 排除
  const ii = buildColumns('infoItems');
  assert.deepEqual(ii.map((c) => c.key), ['nameCn', 'type', 'bizDomainId', 'definition', 'valueDomainId', 'refDataId', 'securityLevel']);
});

test('serializeCell subtable / bool / array', () => {
  assert.equal(serializeCell({ type: 'subtable' }, [{ code: '01', name: '35kV' }, { code: '02', name: '66kV' }]), '01:35kV|02:66kV');
  assert.equal(serializeCell({ type: 'bool' }, true), 'true');
  assert.equal(serializeCell({ type: 'text', multi: true }, ['a', 'b']), 'a, b');
});

test('buildTemplateCsv 生成表头 + 示例行', () => {
  const csv = buildTemplateCsv('valueDomains', { code: 'VD-X', dataType: 'varchar', length: 10, precision: 0 });
  assert.ok(csv.includes('编号'));
  assert.ok(csv.includes('VD-X'));
});

test('parseCsv 支持引号内逗号 + 转义', () => {
  const rows = parseCsv('"a,1",b\n"he said ""hi""",c\n');
  assert.deepEqual(rows, [['a,1', 'b'], ['he said "hi"', 'c']]);
});

test('rowToPayload 解析 multi/subtable/bool/number', () => {
  const p = rowToPayload('refDatas', null, ['电压等级X', '01:35kV|02:66kV']);
  assert.equal(p.name, '电压等级X');
  assert.deepEqual(p.values, [{ code: '01', name: '35kV' }, { code: '02', name: '66kV' }]);
  const bt = rowToPayload('baseTerms', null, ['名称X', 'name_x', '别名1, 别名2', 'true']);
  assert.equal(bt.nameCn, '名称X');
  assert.deepEqual(bt.synonyms, ['别名1', '别名2']);
  assert.equal(bt.isClassWord, true);
});

test('mapHeaders 按 label 匹配 + 去 BOM + 缺列/未知列', () => {
  const ok = mapHeaders(['中文名', '类型', '业务域', '定义', '值域', '参考数据', '安全分级'], 'infoItems');
  assert.equal(ok.missing.length, 0);
  assert.equal(ok.extra.length, 0);
  assert.equal(ok.mapping.length, 7);

  // 去 BOM
  const bom = mapHeaders(['\ufeff中文名', '类型', '业务域', '定义', '值域', '参考数据', '安全分级'], 'infoItems');
  assert.equal(bom.missing.length, 0, 'BOM 不应导致缺列');
  assert.equal(bom.extra.length, 0, 'BOM 不应导致未知列');

  // 缺列
  const miss = mapHeaders(['中文名', '类型'], 'infoItems');
  assert.ok(miss.missing.includes('业务域'));

  // 未知列（多余列）
  const ext = mapHeaders(['中文名', '类型', '业务域', '定义', '值域', '参考数据', '安全分级', '备注'], 'infoItems');
  assert.equal(ext.extra.length, 1);
  assert.equal(ext.extra[0].label, '备注');
});

test('rowToPayloadMapped 按映射取值（列重排后仍正确对齐，不依赖固定列序）', () => {
  // 列顺序打乱：安全分级提前、值域提前
  const headers = ['安全分级', '中文名', '值域', '类型', '业务域', '定义', '参考数据'];
  const { mapping, missing } = mapHeaders(headers, 'infoItems');
  assert.equal(missing.length, 0);
  const p = rowToPayloadMapped('infoItems', mapping, ['L2', '风机标识', 'vd_varchar10', '技术', '', '', '']);
  assert.equal(p.nameCn, '风机标识');
  assert.equal(p.securityLevel, 'L2');
  assert.equal(p.valueDomainId, 'vd_varchar10');
  assert.equal(p.type, '技术');
  assert.equal(p.bizDomainId, undefined, '空值应跳过');
});

test('importRows 缺列/未知列 → headerError 中止，不调用 create', async () => {
  let calls = 0;
  const createFn = async () => { calls++; return {}; };
  const res = await importRows('infoItems', ['中文名', '类型'], [['风机标识', '技术']], createFn);
  assert.ok(res.headerError, '应返回 headerError');
  assert.ok(res.headerError.includes('缺少必需列'));
  assert.equal(calls, 0, '缺列时不应调用 create');
});

test('importRows 表头正确 → 按表头对齐导入', async () => {
  const created = [];
  const createFn = async (entity, payload) => { created.push(payload); return payload; };
  const headers = ['中文名', '类型', '业务域', '定义', '值域', '参考数据', '安全分级'];
  const res = await importRows('infoItems', headers, [['风机标识', '技术', '', '', 'vd_varchar10', '', 'L2']], createFn);
  assert.equal(res.headerError, undefined);
  assert.equal(res.errors.length, 0);
  assert.equal(created.length, 1);
  assert.equal(created[0].nameCn, '风机标识');
  assert.equal(created[0].valueDomainId, 'vd_varchar10');
  assert.equal(created[0].securityLevel, 'L2');
});

// ===== 字段（嵌套结构 + defaults 注入）=====
const FIELD_HEADERS = ['字段编码', '字段中文名', '业务定义', '关联主数据', '技术类型', '长度', '主键', '外键', '关联标准', '安全分级', '责任人', '更新频率'];

test('buildColumns fields 排除 defaults 注入的 tableId', () => {
  const cols = buildColumns('fields', ['tableId']);
  assert.deepEqual(cols.map((c) => c.key), ['business.code', 'business.nameCn', 'business.definition', 'business.masterDataId', 'technical.type', 'technical.length', 'technical.isPK', 'technical.isFK', 'management.standardId', 'management.securityLevel', 'management.owner', 'management.updateFrequency']);
  assert.ok(!cols.some((c) => c.key === 'tableId'), 'tableId 应从模板列排除');
});

test('rowToPayloadMapped fields：点号 key unflatten 成嵌套对象', () => {
  const { mapping, missing } = mapHeaders(FIELD_HEADERS, 'fields', ['tableId']);
  assert.equal(missing.length, 0);
  const p = rowToPayloadMapped('fields', mapping, ['test_field', '测试字段', '测风塔风速', '', 'decimal(5,2)', '7', 'false', 'false', '', 'L2', '测试组', '10分钟']);
  assert.equal(p.business.code, 'test_field');
  assert.equal(p.business.nameCn, '测试字段');
  assert.equal(p.business.definition, '测风塔风速');
  assert.equal(p.business.masterDataId, undefined, '空值跳过');
  assert.equal(p.technical.type, 'decimal(5,2)');
  assert.equal(p.technical.length, 7);
  assert.equal(p.technical.isPK, false);
  assert.equal(p.management.securityLevel, 'L2');
  assert.equal(p.management.owner, '测试组');
  assert.equal(p.management.updateFrequency, '10分钟');
});

test('importRows fields 带 defaults：tableId 注入每条', async () => {
  const created = [];
  const createFn = async (entity, payload) => { created.push(payload); return payload; };
  const res = await importRows('fields', FIELD_HEADERS, [
    ['f_a', '字段A', '', '', 'int', '', 'false', 'false', '', '', '甲组', ''],
    ['f_b', '字段B', '', '', 'varchar', '', 'false', 'false', '', '', '乙组', ''],
  ], createFn, { tableId: 't_wind' });
  assert.equal(res.headerError, undefined);
  assert.equal(res.errors.length, 0);
  assert.equal(created.length, 2);
  assert.equal(created[0].tableId, 't_wind', 'tableId 由 defaults 注入');
  assert.equal(created[0].business.code, 'f_a');
  assert.equal(created[0].management.owner, '甲组');
  assert.equal(created[1].tableId, 't_wind');
  assert.equal(created[1].business.code, 'f_b');
});
