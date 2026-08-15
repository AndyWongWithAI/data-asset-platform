import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULE_GROUPS, MODULES, createInitialState, openTab, closeTab, navigate } from '../src/state.js';

test('MODULE_GROUPS 3 组 + standard 父级含 4 子项 + MODULES 14 叶子 + tableDetail + 8 详情共 23', () => {
  assert.deepEqual(MODULE_GROUPS.map((g) => g.name), ['生产态·治理看板', '设计态·定义', '数据交换']);
  const design = MODULE_GROUPS.find((g) => g.name === '设计态·定义');
  const standard = design.items.find((i) => i.key === 'standard');
  assert.ok(standard && standard.children, 'standard 应为父级目录');
  assert.deepEqual(standard.children.map((c) => c.key), ['baseTerm', 'valueDomain', 'refData', 'infoItem']);
  const leafKeys = MODULES.map((m) => m.key);
  assert.equal(leafKeys.length, 23); // 14 叶子模块 + tableDetail + 8 详情模块
  assert.ok(!leafKeys.includes('standard'), 'standard 父级不应是模块');
  assert.ok(leafKeys.includes('tableDetail'));
  assert.ok(leafKeys.includes('metadataCompare'), '元数据比对应在 MODULES');
  const detailKeys = ['infoItemDetail', 'valueDomainDetail', 'refDataDetail', 'qualityDetail', 'masterdataDetail', 'fileExchangeDetail', 'dataServiceDetail', 'securityDetail'];
  for (const k of detailKeys) assert.ok(leafKeys.includes(k), `详情模块 ${k} 应在 MODULES`);
});

test('openTab 首次打开追加并激活，重复打开不重复追加', () => {
  let s = createInitialState();
  s = openTab(s, 'catalog');
  assert.equal(s.tabs.length, 1);
  assert.equal(s.activeTabId, 1);
  s = openTab(s, 'qualityBoard');
  s = openTab(s, 'catalog');
  assert.equal(s.tabs.length, 2);
  assert.equal(s.activeTabId, 1);
});

test('closeTab 关闭激活 tab 后激活相邻', () => {
  let s = createInitialState();
  s = openTab(s, 'catalog');
  s = openTab(s, 'qualityBoard');
  s = openTab(s, 'quality');
  s = closeTab(s, 3);
  assert.equal(s.tabs.length, 2);
  assert.equal(s.activeTabId, 2);
});

test('navigate 写入 assetId 并激活，不重复建 tab', () => {
  let s = createInitialState();
  s = navigate(s, 'catalog', { tableId: 't_wind', fieldId: 'f_wind_speed' });
  assert.equal(s.tabs.length, 1);
  assert.deepEqual(s.tabs[0].assetId, { tableId: 't_wind', fieldId: 'f_wind_speed' });
  s = navigate(s, 'catalog', { tableId: 't_geo' });
  assert.equal(s.tabs.length, 1);
  assert.deepEqual(s.tabs[0].assetId, { tableId: 't_geo' });
});

test('navigate 详情模块单实例复用，点不同对象更新 assetId 不新开 tab', () => {
  let s = createInitialState();
  s = navigate(s, 'infoItemDetail', { infoItemId: 'ii_voltage' });
  assert.equal(s.tabs.length, 1);
  assert.equal(s.tabs[0].title, '信息项详情');
  assert.deepEqual(s.tabs[0].assetId, { infoItemId: 'ii_voltage' });
  s = navigate(s, 'infoItemDetail', { infoItemId: 'ii_wind_speed' });
  assert.equal(s.tabs.length, 1, '详情模块应复用同一 tab');
  assert.deepEqual(s.tabs[0].assetId, { infoItemId: 'ii_wind_speed' });
});

test('MODULES 含非侧边栏 tableDetail（多实例），且不进侧边栏', () => {
  const td = MODULES.find((m) => m.key === 'tableDetail');
  assert.ok(td && td.multi === true);
  const sidebarKeys = MODULE_GROUPS.flatMap((g) => g.items.map((i) => i.key));
  assert.ok(!sidebarKeys.includes('tableDetail'));
});

test('navigate tableDetail 多实例：每表一个 tab，同表复用，标题取表名', () => {
  let s = createInitialState();
  s = navigate(s, 'tableDetail', { tableId: 't_wind', title: '测风数据表' });
  assert.equal(s.tabs.length, 1);
  assert.equal(s.tabs[0].title, '测风数据表');
  assert.deepEqual(s.tabs[0].assetId, { tableId: 't_wind', title: '测风数据表' });

  s = navigate(s, 'tableDetail', { tableId: 't_geo', title: '地质钻孔表' });
  assert.equal(s.tabs.length, 2, '不同表应新建 tab');

  s = navigate(s, 'tableDetail', { tableId: 't_wind', title: '测风数据表' });
  assert.equal(s.tabs.length, 2, '同表应复用 tab');
  assert.equal(s.activeTabId, 1, '复用后激活第一个表详情 tab');
});
