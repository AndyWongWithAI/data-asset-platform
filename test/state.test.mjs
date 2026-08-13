import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULE_GROUPS, createInitialState, openTab, closeTab, navigate } from '../src/state.js';

test('MODULE_GROUPS 含 7 模块且 catalog/governance 已实现', () => {
  const keys = MODULE_GROUPS.flatMap((g) => g.items.map((i) => i.key));
  assert.equal(keys.length, 7);
  const m = Object.fromEntries(MODULE_GROUPS.flatMap((g) => g.items).map((i) => [i.key, i]));
  assert.equal(m.catalog.implemented, true);
  assert.equal(m.governance.implemented, true);
  assert.equal(m.quality.implemented, false);
});

test('openTab 首次打开追加并激活，重复打开不重复追加', () => {
  let s = createInitialState();
  s = openTab(s, 'catalog');
  assert.equal(s.tabs.length, 1);
  assert.equal(s.activeTabId, 1);
  s = openTab(s, 'governance');
  s = openTab(s, 'catalog');
  assert.equal(s.tabs.length, 2);
  assert.equal(s.activeTabId, 1);
});

test('closeTab 关闭激活 tab 后激活相邻', () => {
  let s = createInitialState();
  s = openTab(s, 'catalog');
  s = openTab(s, 'governance');
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
