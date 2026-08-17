import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/data.js';
import { compareMetadata } from '../src/metadataCompare.js';

const result = compareMetadata(data.prodMetadatas, data.tables, data.fields);

test('metadataCompare：五类差异计数精确（未登记表2/疑似下线表3/未登记字段2/下线字段0/漂移字段3）', () => {
  assert.equal(result.summary.unregisteredTables, 2);
  assert.equal(result.summary.offlineTables, 3);
  assert.equal(result.summary.unregisteredFields, 2);
  assert.equal(result.summary.offlineFields, 0);
  assert.equal(result.summary.driftedFields, 3);
});

test('metadataCompare：未登记表 / 疑似下线表 身份精确', () => {
  const unregTables = result.tableDiffs.filter((d) => d.type === 'unregistered').map((d) => d.prod.nameEn).sort();
  assert.deepEqual(unregTables, ['legacy_device', 'sensor_raw']);
  const offlineTables = result.tableDiffs.filter((d) => d.type === 'offline').map((d) => d.designed.nameEn).sort();
  assert.deepEqual(offlineTables, ['alarm_record', 'bill_of_material', 'process_parameter']);
});

test('metadataCompare：未登记字段 / 疑似下线字段 身份精确', () => {
  const unregFields = result.fieldDiffs.filter((d) => d.type === 'unregistered').map((d) => d.prod.code).sort();
  assert.deepEqual(unregFields, ['cooling_efficiency', 'leak_status']);
  const offlineFields = result.fieldDiffs.filter((d) => d.type === 'offline').map((d) => d.designed.code).sort();
  assert.deepEqual(offlineFields, []);
});

test('metadataCompare：漂移字段维度精确（consumption_value 类型+中文名 / FLOW 仅类型 / efficiency_percent 仅中文名）', () => {
  const driftMap = new Map(
    result.fieldDiffs.filter((d) => d.type === 'drift').map((d) => [d.prod.code, d.drift])
  );
  assert.deepEqual([...driftMap.get('consumption_value')].sort(), ['nameCn', 'type']);
  assert.deepEqual(driftMap.get('FLOW'), ['type']);
  assert.deepEqual(driftMap.get('efficiency_percent'), ['nameCn']);
});

test('metadataCompare：漂移字段实际侧/登记侧对照值正确', () => {
  const byCode = new Map(
    result.fieldDiffs.filter((d) => d.type === 'drift').map((d) => [d.prod.code, d])
  );
  const cv = byCode.get('consumption_value');
  assert.equal(cv.prod.type, 'decimal(10,2)');
  assert.equal(cv.prod.nameCn, '功耗');
  assert.equal(cv.designed.type, 'decimal(8,2)');
  assert.equal(cv.designed.nameCn, '功耗值');

  const fl = byCode.get('FLOW');
  assert.equal(fl.prod.type, 'int');
  assert.equal(fl.designed.type, 'decimal(6,1)');

  const ep = byCode.get('efficiency_percent');
  assert.equal(ep.prod.nameCn, '能效比');
  assert.equal(ep.designed.nameCn, '能效百分比');
});
