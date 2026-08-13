export default function Sidebar({ groups, activeModuleKey, onOpen }) {
  return (
    <nav className="sidebar">
      {groups.map((group) => (
        <div className="sidebar-group" key={group.name}>
          <div className="sidebar-group-name">{group.name}</div>
          {group.items.map((item) => (
            <button
              key={item.key}
              className={`sidebar-item${item.key === activeModuleKey ? ' active' : ''}`}
              onClick={() => onOpen(item.key)}
            >
              <span>{item.title}</span>
              {!item.implemented && <span className="badge-2nd">二期</span>}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}
