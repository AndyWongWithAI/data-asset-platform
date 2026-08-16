import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/data.js';
import { fieldSecuritySource, fieldSecurityCatalog } from '../src/fieldSecurity.js';

test('custom：字段未关联信息项 → 自定义', () => {
  const f = data.fields.find((x) => x.management.standardId == null);
  assert.ok(f, 'seed 应有未关联信息项的字段');
  const r = fieldSecuritySource(f, data.infoItems);
  assert.equal(r.source, 'custom');
  assert.equal(r.level, f.management.securityLevel);
});

test('inherit：ii_sea_area 的 L4 字段 → 继承自信息项', () => {
  const f = data.fields.find((x) => x.management.standardId === 'ii_sea_area');
  assert.ok(f, 'seed 应有 standardId=ii_sea_area 的字段');
  const r = fieldSecuritySource(f, data.infoItems);
  assert.equal(r.source, 'inherit');
  assert.equal(r.level, 'L4');
});

test('custom-upgrade：ii_voltage 的 L3 字段（信息项 L2）→ 自定义升级', () => {
  const f = data.fields.find((x) => x.management.standardId === 'ii_voltage' && x.management.securityLevel === 'L3');
  assert.ok(f, 'seed 应有 standardId=ii_voltage 且 L3 的字段');
  const r = fieldSecuritySource(f, data.infoItems);
  assert.equal(r.source, 'custom-upgrade');
  assert.equal(r.level, 'L3');
});

test('conflict：字段分级低于信息项分级 → 冲突', () => {
  // ii_sea_area 是 L4，手工构造一个 L2 字段，应判 conflict
  const r = fieldSecuritySource({ management: { standardId: 'ii_sea_area', securityLevel: 'L2' } }, data.infoItems);
  assert.equal(r.source, 'conflict');
  assert.equal(r.level, 'L2');
});

test('信息项无 securityLevel → custom（可空信息项兜底）', () => {
  const r = fieldSecuritySource(
    { management: { standardId: 'ii_wind_speed', securityLevel: 'L2' } },
    [{ id: 'ii_wind_speed' }]
  );
  assert.equal(r.source, 'custom');
});

test('fieldSecurityCatalog：字段 → 分类目录条目（反向查找）', () => {
  assert.equal(fieldSecurityCatalog('f_topo_depth', data.securityCatalog)?.id, 'sc_005');
  assert.equal(fieldSecurityCatalog('f_cable_route', data.securityCatalog)?.id, 'sc_005'); // 跨表字段仍归属海底地形测绘
  assert.equal(fieldSecurityCatalog('f_cable_type', data.securityCatalog)?.id, 'sc_007');
  assert.equal(fieldSecurityCatalog('f_scada_turbine', data.securityCatalog), null); // 主数据引用字段不在任何分类
  assert.equal(fieldSecurityCatalog('f_wind_project', data.securityCatalog), null);
});
