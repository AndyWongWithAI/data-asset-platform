import test from 'node:test';
import assert from 'node:assert/strict';
import { buildColumns, serializeCell, buildTemplateCsv, parseCsv, rowToPayload } from '../src/bulkImport.js';

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
