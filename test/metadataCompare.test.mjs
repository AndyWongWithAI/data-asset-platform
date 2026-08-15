import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/data.js';
import { compareMetadata } from '../src/metadataCompare.js';

const result = compareMetadata(data.prodMetadatas, data.tables, data.fields);

test('metadataCompare：五类差异计数精确（未登记表4/疑似下线表4/未登记字段4/疑似下线字段1/漂移字段3）', () => {
  assert.equal(result.summary.unregisteredTables, 4);
  assert.equal(result.summary.offlineTables, 4);
  assert.equal(result.summary.unregisteredFields, 4);
  assert.equal(result.summary.offlineFields, 1);
  assert.equal(result.summary.driftedFields, 3);
});

test('metadataCompare：未登记表 / 疑似下线表 身份精确', () => {
  const unregTables = result.tableDiffs.filter((d) => d.type === 'unregistered').map((d) => d.prod.nameEn).sort();
  assert.deepEqual(unregTables, ['bim_element_attr', 'met_forecast_raw', 'scada_alarm_raw', 'scada_event_log']);
  const offlineTables = result.tableDiffs.filter((d) => d.type === 'offline').map((d) => d.designed.nameEn).sort();
  assert.deepEqual(offlineTables, ['power_forecast', 'spare_parts', 'submarine_cable', 'substation_transformer']);
});

test('metadataCompare：未登记字段 / 疑似下线字段 身份精确', () => {
  const unregFields = result.fieldDiffs.filter((d) => d.type === 'unregistered').map((d) => d.prod.code).sort();
  assert.deepEqual(unregFields, ['blade_length', 'gearbox_temp', 'nacelle_yaw', 'wind_gust']);
  const offlineFields = result.fieldDiffs.filter((d) => d.type === 'offline').map((d) => d.designed.code).sort();
  assert.deepEqual(offlineFields, ['VIBRATION']);
});

test('metadataCompare：漂移字段维度精确（active_power_value 类型+中文名 / WIND_DIR 仅类型 / FOUNDATION 仅中文名）', () => {
  const driftMap = new Map(
    result.fieldDiffs.filter((d) => d.type === 'drift').map((d) => [d.prod.code, d.drift])
  );
  assert.deepEqual([...driftMap.get('active_power_value')].sort(), ['nameCn', 'type']);
  assert.deepEqual(driftMap.get('WIND_DIR'), ['type']);
  assert.deepEqual(driftMap.get('FOUNDATION'), ['nameCn']);
});

test('metadataCompare：漂移字段生产侧/设计态侧对照值正确', () => {
  const byCode = new Map(
    result.fieldDiffs.filter((d) => d.type === 'drift').map((d) => [d.prod.code, d])
  );
  const ap = byCode.get('active_power_value');
  assert.equal(ap.prod.type, 'decimal(8,2)');
  assert.equal(ap.prod.nameCn, '有功功率');
  assert.equal(ap.designed.type, 'decimal(5,2)');
  assert.equal(ap.designed.nameCn, '有功功率值');

  const wd = byCode.get('WIND_DIR');
  assert.equal(wd.prod.type, 'int');
  assert.equal(wd.designed.type, 'smallint');

  const fd = byCode.get('FOUNDATION');
  assert.equal(fd.prod.nameCn, '基础形式');
  assert.equal(fd.designed.nameCn, '基础型式');
});
