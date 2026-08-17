import { useState } from 'react';
import { filterModuleGroups } from '../state.js';

export default function Sidebar({ groups, activeModuleKey, onOpen }) {
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [query, setQuery] = useState('');

  const toggle = (key) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const searching = !!query.trim();
  const visibleGroups = filterModuleGroups(groups, query);
  // 搜索时强制展开所有命中目录，忽略折叠状态
  const isOpen = (key) => searching || !collapsed.has(key);
  const arrow = (key) => (isOpen(key) ? '▾' : '▸');

  return (
    <nav className="sidebar">
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="搜索目录…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {visibleGroups.length === 0 ? (
        <div className="sidebar-empty">无匹配目录</div>
      ) : (
        visibleGroups.map((group) => (
          <div className="sidebar-group" key={group.name || '__root__'}>
            {group.name && (
              <button className="sidebar-group-dir" onClick={() => toggle(group.name)}>
                <span className="dir-arrow">{arrow(group.name)}</span>
                <span>{group.name}</span>
              </button>
            )}
            {(group.name ? isOpen(group.name) : true) &&
              group.items.map((item) =>
                item.children ? (
                  <div key={item.key}>
                    <button className="sidebar-dir" onClick={() => toggle(item.key)}>
                      <span className="dir-arrow">{arrow(item.key)}</span>
                      <span>{item.title}</span>
                    </button>
                    {isOpen(item.key) &&
                      item.children.map((child) => (
                        <button
                          key={child.key}
                          className={`sidebar-item sidebar-sub${child.key === activeModuleKey ? ' active' : ''}`}
                          onClick={() => onOpen(child.key)}
                        >
                          <span>{child.title}</span>
                          {!child.implemented && <span className="badge-2nd">二期</span>}
                        </button>
                      ))}
                  </div>
                ) : (
                  <button
                    key={item.key}
                    className={`sidebar-item${item.key === activeModuleKey ? ' active' : ''}`}
                    onClick={() => onOpen(item.key)}
                  >
                    <span>{item.title}</span>
                    {!item.implemented && <span className="badge-2nd">二期</span>}
                  </button>
                )
              )}
          </div>
        ))
      )}
    </nav>
  );
}
