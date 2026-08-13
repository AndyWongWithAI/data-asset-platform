import { useReducer } from 'react';
import { MODULE_GROUPS, createInitialState, openTab, closeTab, activateTab, navigate } from './state.js';
import HeaderBar from './components/HeaderBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import TabWorkspace from './components/TabWorkspace.jsx';

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN': return openTab(state, action.moduleKey);
    case 'CLOSE': return closeTab(state, action.tabId);
    case 'ACTIVATE': return activateTab(state, action.tabId);
    case 'NAVIGATE': return navigate(state, action.moduleKey, action.assetId);
    default: return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
  return (
    <div className="app">
      <HeaderBar />
      <div className="app-body">
        <Sidebar
          groups={MODULE_GROUPS}
          activeModuleKey={activeTab?.moduleKey ?? null}
          onOpen={(m) => dispatch({ type: 'OPEN', moduleKey: m })}
        />
        <TabWorkspace state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}
