// tab 状态机纯逻辑，不依赖 React，可 node --test
export const MODULE_GROUPS = [
  { name: '生产态·治理看板', items: [
    { key: 'qualityBoard', title: '数据质量看板', implemented: true },
    { key: 'lineageBoard', title: '数据血缘看板', implemented: true },
    { key: 'standardBoard', title: '数据标准看板', implemented: true },
  ]},
  { name: '设计态·定义', items: [
    { key: 'catalog', title: '数据资产目录', implemented: true },
    { key: 'quality', title: '数据质量', implemented: true },
    { key: 'standard', title: '数据标准', implemented: true },
    { key: 'security', title: '数据安全', implemented: true },
    { key: 'masterdata', title: '主数据', implemented: true },
  ]},
  { name: '数据交换', items: [
    { key: 'batchFile', title: '批次文件', implemented: true },
    { key: 'dataService', title: '数据服务', implemented: true },
  ]},
];

// 非侧边栏模块：表详情（多实例，每张表一个 tab，标题取表名）
const TABLE_DETAIL = { key: 'tableDetail', title: '表详情', implemented: true, multi: true };

export const MODULES = [...MODULE_GROUPS.flatMap((g) => g.items), TABLE_DETAIL];

export function createInitialState() {
  return { tabs: [], activeTabId: null, nextTabId: 1 };
}

export function openTab(state, moduleKey) {
  const mod = MODULES.find((m) => m.key === moduleKey);
  if (!mod) return state;
  const existing = state.tabs.find((t) => t.moduleKey === moduleKey);
  if (existing) return { ...state, activeTabId: existing.id };
  const id = state.nextTabId;
  return {
    tabs: [...state.tabs, { id, moduleKey, title: mod.title, assetId: null }],
    activeTabId: id,
    nextTabId: state.nextTabId + 1,
  };
}

export function closeTab(state, tabId) {
  const idx = state.tabs.findIndex((t) => t.id === tabId);
  if (idx === -1) return state;
  const tabs = state.tabs.filter((t) => t.id !== tabId);
  let activeTabId = state.activeTabId;
  if (activeTabId === tabId) {
    const next = state.tabs[idx + 1] || state.tabs[idx - 1];
    activeTabId = next ? next.id : null;
  }
  return { ...state, tabs, activeTabId };
}

export function activateTab(state, tabId) {
  return { ...state, activeTabId: tabId };
}

export function navigate(state, moduleKey, assetId = null) {
  const mod = MODULES.find((m) => m.key === moduleKey);
  if (!mod) return state;
  // 多实例模块按「模块 + 表」区分 tab，其余按模块去重
  const existing = state.tabs.find((t) =>
    mod.multi
      ? t.moduleKey === moduleKey && t.assetId?.tableId === assetId?.tableId
      : t.moduleKey === moduleKey
  );
  let next = state;
  let tabId;
  if (existing) {
    tabId = existing.id;
  } else {
    const id = state.nextTabId;
    const title = mod.multi && assetId?.title ? assetId.title : mod.title;
    next = {
      ...state,
      tabs: [...state.tabs, { id, moduleKey, title, assetId: null }],
      nextTabId: state.nextTabId + 1,
    };
    tabId = id;
  }
  return {
    ...next,
    tabs: next.tabs.map((t) => (t.id === tabId ? { ...t, assetId } : t)),
    activeTabId: tabId,
  };
}
