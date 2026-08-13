// tab 状态机纯逻辑，不依赖 React，可 node --test
export const MODULE_GROUPS = [
  { name: '生产态·监控', items: [{ key: 'governance', title: '数据治理看板', implemented: true }] },
  { name: '设计态·定义', items: [
    { key: 'catalog', title: '数据资产目录', implemented: true },
    { key: 'quality', title: '数据质量', implemented: false },
    { key: 'standard', title: '数据标准', implemented: false },
    { key: 'security', title: '数据安全', implemented: false },
    { key: 'masterdata', title: '主数据', implemented: false },
  ]},
  { name: '价值输出', items: [{ key: 'service', title: '数据服务', implemented: false }] },
];

export const MODULES = MODULE_GROUPS.flatMap((g) => g.items);

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
  const existing = state.tabs.find((t) => t.moduleKey === moduleKey);
  let next = state;
  let tabId;
  if (existing) {
    tabId = existing.id;
  } else {
    next = openTab(state, moduleKey);
    tabId = next.activeTabId;
  }
  return {
    ...next,
    tabs: next.tabs.map((t) => (t.id === tabId ? { ...t, assetId } : t)),
    activeTabId: tabId,
  };
}
