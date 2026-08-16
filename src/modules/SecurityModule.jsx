import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import EntityForm from '../components/EntityForm.jsx';
import BulkImport from '../components/BulkImport.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };

export default function SecurityModule({ onNavigate }) {
  const { data, updateRecord } = useData();
  const [tab, setTab] = useState('overview');
  const [editingLevel, setEditingLevel] = useState(null);
  const [category1, setCategory1] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const toggleStatus = (sc) => updateRecord('securityCatalog', sc.id, { status: sc.status === '停用' ? '启用' : '停用' });
  const countByLevel = (lv) => data.fields.filter((f) => f.management.securityLevel === lv).length;
  const category1Options = [...new Set(data.securityCatalog.map((sc) => sc.category1))];
  const filteredCatalog = data.securityCatalog.filter((sc) => category1 === 'all' || sc.category1 === category1);

  return (
    <div>
      <div className="sub-tabs">
        <button className={tab === 'overview' ? 'sub-active' : ''} onClick={() => setTab('overview')}>分级总览</button>
        <button className={tab === 'detail' ? 'sub-active' : ''} onClick={() => setTab('detail')}>分类目录</button>
      </div>

      {tab === 'overview' && (
        <div>
          {data.security.map((s) => (
            <div key={s.level} className="score-row">
              <Tag tone={LEVEL_TONE[s.level]}>{s.level} · {s.name}</Tag>
              <div className="score-info">
                <span>{s.desc}</span>
                <span>脱敏策略：{s.mask || '无'}</span>
                <span>字段数：{countByLevel(s.level)}</span>
              </div>
              <button className="link" onClick={() => onNavigate('securityDetail', { securityLevel: s.level })}>查看定位</button>
              <button className="link" onClick={() => setEditingLevel(s)}>调整</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'detail' && (
        <div>
          <div className="search-bar">
            <select value={category1} onChange={(e) => setCategory1(e.target.value)} aria-label="按一级分类筛选">
              <option value="all">全部</option>
              {category1Options.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn-primary" onClick={() => setShowForm(true)}>新增分类</button>
            <button className="btn-secondary" onClick={() => setShowImport(true)}>批量导入</button>
          </div>
          <table className="table">
            <thead><tr><th>一级分类</th><th>二级分类</th><th>数据类型</th><th>数据分级</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              {filteredCatalog.map((sc) => (
                <tr key={sc.id}>
                  <td>{sc.category1}</td>
                  <td>{sc.category2}</td>
                  <td>{sc.dataType}</td>
                  <td><Tag tone={LEVEL_TONE[sc.level]}>{sc.level}</Tag></td>
                  <td>{sc.status === '停用' ? <Tag tone="warn">停用</Tag> : <Tag tone="ok">启用</Tag>}</td>
                  <td><button className="link" onClick={() => onNavigate('securityCatalogDetail', { catalogId: sc.id })}>查看明细</button> <button className="link" onClick={() => setEditItem(sc)}>编辑</button> <button className="link" onClick={() => toggleStatus(sc)}>{sc.status === '停用' ? '启用' : '停用'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCatalog.length === 0 && <div className="empty-hint">暂无匹配的分类目录</div>}
        </div>
      )}
      {editingLevel && <EntityForm entity="security" mode="update" record={editingLevel} onClose={() => setEditingLevel(null)} onSaved={() => setEditingLevel(null)} />}
      {showForm && <EntityForm entity="securityCatalog" onClose={() => setShowForm(false)} onSaved={() => setShowForm(false)} />}
      {editItem && <EntityForm entity="securityCatalog" mode="update" record={editItem} onClose={() => setEditItem(null)} onSaved={() => setEditItem(null)} />}
      {showImport && <BulkImport entity="securityCatalog" onClose={() => setShowImport(false)} onSaved={() => setShowImport(false)} />}
    </div>
  );
}
