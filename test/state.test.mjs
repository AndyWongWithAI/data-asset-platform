import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULE_GROUPS, MODULES, createInitialState, openTab, closeTab, navigate } from '../src/state.js';

test('MODULE_GROUPS 含 13 模块且全部 implemented', () => {
  const items = MODULE_GROUPS.flatMap((g) => g.items);
  assert.equal(items.length, 13);
  assert.deepEqual(MODULE_GROUPS.map((g) => g.name), ['生产态·治理看板', '设计态·定义', '数据交换']);
  const m = Object.fromEntries(items.map((i) => [i.key, i]));
  for (const k of ['catalog','qualityBoard','lineageBoard','standardBoard','quality','baseTerm','valueDomain','refData','infoItem','security','masterdata','batchFile','dataService'])
    assert.equal(m[k].implemented, true, `${k} 应 implemented`);
  assert.equal(m.governance, undefined);
  assert.equal(m.service, undefined);
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
