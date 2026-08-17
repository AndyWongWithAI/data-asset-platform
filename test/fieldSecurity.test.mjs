import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/data.js';
import { fieldSecuritySource, fieldSecurityCatalog, fieldSecurityCatalogSource } from '../src/fieldSecurity.js';

test('custom：字段未关联信息项 → 自定义', () => {
  const f = data.fields.find((x) => x.management.standardId == null);
  assert.ok(f, 'seed 应有未关联信息项的字段');
  const r = fieldSecuritySource(f, data.infoItems);
  assert.equal(r.source, 'custom');
  assert.equal(r.level, f.management.securityLevel);
});

test('inherit：ii_coolant_type 的 L4 字段 → 继承自信息项', () => {
  const f = data.fields.find((x) => x.management.standardId === 'ii_coolant_type');
  assert.ok(f, 'seed 应有 standardId=ii_coolant_type 的字段');
  const r = fieldSecuritySource(f, data.infoItems);
  assert.equal(r.source, 'inherit');
  assert.equal(r.level, 'L4');
});

test('custom-upgrade：ii_device_type 的 L3 字段（信息项 L2）→ 自定义升级', () => {
  const f = data.fields.find((x) => x.management.standardId === 'ii_device_type' && x.management.securityLevel === 'L3');
  assert.ok(f, 'seed 应有 standardId=ii_device_type 且 L3 的字段');
  const r = fieldSecuritySource(f, data.infoItems);
  assert.equal(r.source, 'custom-upgrade');
  assert.equal(r.level, 'L3');
});

test('conflict：字段分级低于信息项分级 → 冲突', () => {
  // ii_coolant_type 是 L4，手工构造一个 L2 字段，应判 conflict
  const r = fieldSecuritySource({ management: { standardId: 'ii_coolant_type', securityLevel: 'L2' } }, data.infoItems);
  assert.equal(r.source, 'conflict');
  assert.equal(r.level, 'L2');
});

test('信息项无 securityLevel → custom（可空信息项兜底）', () => {
  const r = fieldSecuritySource(
    { management: { standardId: 'ii_cdu_model', securityLevel: 'L2' } },
    [{ id: 'ii_cdu_model' }]
  );
  assert.equal(r.source, 'custom');
});

test('fieldSecurityCatalog：字段 → 分类目录条目（securityCatalogId 正向引用）', () => {
  const byId = (id) => data.fields.find((f) => f.id === id);
  assert.equal(fieldSecurityCatalog(byId('f_proc_pressure'), data.securityCatalog)?.id, 'sc_005');
  assert.equal(fieldSecurityCatalog(byId('f_dev_coolant_type'), data.securityCatalog)?.id, 'sc_005'); // 跨表字段仍归属海底地形测绘
  assert.equal(fieldSecurityCatalog(byId('f_dev_type'), data.securityCatalog)?.id, 'sc_007');
  assert.equal(fieldSecurityCatalog(byId('f_alarm_device'), data.securityCatalog), null); // 主数据引用字段不在任何分类
  assert.equal(fieldSecurityCatalog(byId('f_bom_project'), data.securityCatalog), null);
});

test('fieldSecurityCatalogSource：继承自分类目录 / 自定义升级 / 冲突 / 未关联', () => {
  const byId = (id) => data.fields.find((f) => f.id === id);
  // f_proc_pressure / f_dev_coolant_type 关联 sc_005（L4）且自身 L4 → 继承自分类目录
  assert.equal(fieldSecurityCatalogSource(byId('f_proc_pressure'), data.securityCatalog).source, 'inherit-catalog');
  assert.equal(fieldSecurityCatalogSource(byId('f_dev_coolant_type'), data.securityCatalog).source, 'inherit-catalog');
  // 未关联分类的字段 → null
  assert.equal(fieldSecurityCatalogSource(byId('f_bom_project'), data.securityCatalog), null);
  // 构造：字段分级高于分类等级（sc_003 L2，字段 L4）→ 自定义升级
  assert.equal(fieldSecurityCatalogSource({ management: { securityCatalogId: 'sc_003', securityLevel: 'L4' } }, data.securityCatalog).source, 'custom-upgrade');
  // 构造：字段分级低于分类等级（sc_005 L4，字段 L2）→ 冲突
  assert.equal(fieldSecurityCatalogSource({ management: { securityCatalogId: 'sc_005', securityLevel: 'L2' } }, data.securityCatalog).source, 'conflict');
});
