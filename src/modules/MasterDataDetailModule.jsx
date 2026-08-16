import { useState } from 'react';
import { useData } from '../DataContext.jsx';

const TABS = ['首页', '引用详情', '审批记录'];

export default function MasterDataDetailModule({ onNavigate, assetId }) {
  const { data } = useData();
  const [tab, setTab] = useState('首页');
  const md = data.masterData.find((m) => m.id === assetId?.masterDataId);
  if (!md) return <div className="empty-hint">未找到该主数据实体</div>;
  const refs = data.fields.filter((f) => f.business.masterDataId === md.id);
  const linkedTables = data.tables.filter((t) => t.masterDataId === md.id);
  const approvals = md.approvals || [];

  return (
    <div className="detail-panel">
      <h3>{md.name}<span className="en">{md.code}</span></h3>
      <div className="sub-tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? 'sub-active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === '首页' && (
        <div>
          <div className="kv-list">
            <div><span>资产编码</span><code>{md.code}</code></div>
            <div><span>中文名</span><b>{md.name}</b></div>
            <div><span>实体类型</span><b>{md.entityType}</b></div>
            <div><span>业务定义</span><b>{md.definition ?? '—'}</b></div>
            <div><span>业务规则</span><b>{md.rule ?? '—'}</b></div>
            <div><span>数据 Owner</span><b>{md.owner ?? '—'}</b></div>
          </div>
          <div style={{ marginTop: 12 }}>
            {linkedTables.length > 0
              ? <button className="btn-primary" onClick={() => onNavigate('tableDetail', { tableId: linkedTables[0].id, title: linkedTables[0].nameCn })}>转跳表结构</button>
              : <span className="form-help">该主数据无关联表</span>}
          </div>
        </div>
      )}

      {tab === '引用详情' && (
        <div>
          <h4>被引用字段（{refs.length}）</h4>
          <table className="table">
            <thead><tr><th>字段</th><th>所属表</th><th>操作</th></tr></thead>
            <tbody>
              {refs.map((f) => {
                const t = data.tables.find((x) => x.id === f.tableId);
                return (
                  <tr key={f.id}>
                    <td>{f.business.nameCn}</td>
                    <td>{t?.nameCn}</td>
                    <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: f.tableId, fieldId: f.id, title: t?.nameCn })}>定位</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {refs.length === 0 && <div className="empty-hint">暂无字段引用此实体</div>}
        </div>
      )}

      {tab === '审批记录' && (
        <div>
          <h4>审批记录（{approvals.length}）</h4>
          {approvals.length
            ? (
              <table className="table">
                <thead><tr><th>类型</th><th>申请人</th><th>申请时间</th><th>审批人</th><th>状态</th><th>审批时间</th><th>意见</th></tr></thead>
                <tbody>
                  {approvals.map((a) => (
                    <tr key={a.id}>
                      <td>{a.type}</td>
                      <td>{a.applicant}</td>
                      <td>{a.applyTime}</td>
                      <td>{a.approver}</td>
                      <td>{a.status}</td>
                      <td>{a.approveTime ?? '—'}</td>
                      <td>{a.comment ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
            : <div className="empty-hint">暂无审批记录</div>}
        </div>
      )}
    </div>
  );
}
