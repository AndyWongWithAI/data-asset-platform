import data from '../data.js';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

export default function ValueDomainModule({ onNavigate }) {
  return (
    <div>
      <div className="search-bar">
        <ComingSoonAction label="新增值域" />
      </div>
      <table className="table">
        <thead><tr><th>值域编号</th><th>数据类型</th><th>长度</th><th>精度</th></tr></thead>
        <tbody>
          {data.valueDomains.map((v) => (
            <tr key={v.id}>
              <td><button className="link" onClick={() => onNavigate('valueDomainDetail', { valueDomainId: v.id })}>{v.code}</button></td>
              <td><code>{v.dataType}</code></td>
              <td>{v.length}</td>
              <td>{v.precision}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
