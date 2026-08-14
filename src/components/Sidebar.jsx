import { useState } from 'react';

export default function Sidebar({ groups, activeModuleKey, onOpen }) {
  const [collapsed, setCollapsed] = useState(() => new Set());

  const toggle = (key) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <nav className="sidebar">
      {groups.map((group) => (
        <div className="sidebar-group" key={group.name}>
          <div className="sidebar-group-name">{group.name}</div>
          {group.items.map((item) =>
            item.children ? (
              <div key={item.key}>
                <button className="sidebar-dir" onClick={() => toggle(item.key)}>
                  <span className="dir-arrow">{collapsed.has(item.key) ? '▸' : '▾'}</span>
                  <span>{item.title}</span>
                </button>
                {!collapsed.has(item.key) &&
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
      ))}
    </nav>
  );
}
