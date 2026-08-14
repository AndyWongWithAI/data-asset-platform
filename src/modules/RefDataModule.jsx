import data from '../data.js';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

export default function RefDataModule({ onNavigate }) {
  return (
    <div>
      <div className="search-bar">
        <ComingSoonAction label="新增参考数据" />
      </div>
      <table className="table">
        <thead><tr><th>编号</th><th>名称</th><th>枚举值数</th></tr></thead>
        <tbody>
          {data.refDatas.map((r) => (
            <tr key={r.id}>
              <td><button className="link" onClick={() => onNavigate('refDataDetail', { refDataId: r.id })}>{r.code}</button></td>
              <td>{r.name}</td>
              <td>{r.values.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
