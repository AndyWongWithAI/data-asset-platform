import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import EntityForm from '../components/EntityForm.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

export default function InfoItemModule({ onNavigate }) {
  const { data, updateRecord } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const vdCode = (id) => data.valueDomains.find((v) => v.id === id)?.code ?? '—';
  const rdName = (id) => (id ? data.refDatas.find((r) => r.id === id)?.name ?? '—' : '—');
  const toggleStatus = (i) => updateRecord('infoItems', i.id, { status: i.status === '停用' ? '启用' : '停用' });
  return (
    <div>
      <div className="search-bar">
        <button className="btn-primary" onClick={() => setShowForm(true)}>新增信息项</button>
        <ComingSoonAction label="批量导入" />
      </div>
      <table className="table">
        <thead><tr><th>信息项编号</th><th>中文名</th><th>英文名</th><th>类型</th><th>值域</th><th>参考数据</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          {data.infoItems.map((i) => (
            <tr key={i.id}>
              <td><button className="link" onClick={() => onNavigate('infoItemDetail', { infoItemId: i.id })}>{i.code}</button></td>
              <td>{i.nameCn}</td>
              <td><code>{i.nameEn}</code></td>
              <td>{i.type}</td>
              <td><code>{vdCode(i.valueDomainId)}</code></td>
              <td>{rdName(i.refDataId)}</td>
              <td>{i.status === '停用' ? <Tag tone="warn">停用</Tag> : <Tag tone="ok">启用</Tag>}</td>
              <td><button className="link" onClick={() => setEditItem(i)}>编辑</button> <button className="link" onClick={() => toggleStatus(i)}>{i.status === '停用' ? '启用' : '停用'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <EntityForm entity="infoItems" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />}
      {editItem && <EntityForm entity="infoItems" mode="update" record={editItem} onClose={() => setEditItem(null)} onSaved={() => setEditItem(null)} />}
    </div>
  );
}
