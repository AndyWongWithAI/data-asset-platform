import { useState, useEffect } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import { fieldSecuritySource, fieldSecurityCatalog } from '../fieldSecurity.js';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };
const SOURCE_LABEL = { inherit: '继承自信息项', 'custom-upgrade': '自定义升级', custom: '自定义', conflict: '冲突' };
const SOURCE_TONE = { inherit: 'default', 'custom-upgrade': 'warn', custom: 'default', conflict: 'danger' };
const TABS = ['表级元数据', '字段元数据', '分区', '索引', '版本历史'];

export default function TableDetailModule({ assetId, onNavigate }) {
  const { data } = useData();
  const [tab, setTab] = useState(assetId?.fieldId ? '字段元数据' : '表级元数据');

  // 字段定位转跳（复用已打开的表详情 tab）时，切换到「字段元数据」并高亮目标字段
  useEffect(() => {
    setTab(assetId?.fieldId ? '字段元数据' : '表级元数据');
  }, [assetId?.tableId, assetId?.fieldId]);

  const table = data.tables.find((t) => t.id === assetId?.tableId);
  if (!table) return <div className="empty-hint">未找到该表（tableId: {assetId?.tableId ?? '—'}）</div>;

  const app = data.applications.find((a) => a.id === table.appId);
  const db = data.databases.find((d) => d.id === table.dbId);
  const domain = data.bizDomains.find((b) => b.id === table.bizDomainId);
  const fields = data.fields.filter((f) => f.tableId === table.id).sort((a, b) => a.seq - b.seq);
  const partitions = table.partitions || [];
  const indexes = table.indexes || [];
  const history = table.history || [];

  return (
    <div className="table-detail">
      <div className="sub-tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? 'sub-active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === '表级元数据' && (
        <div className="detail-head">
          <h3>{table.nameCn}</h3>
          <div className="kv-list">
            <div><span>英文名</span><code>{table.nameEn}</code></div>
            <div><span>表类型</span><b>{table.tableType}</b></div>
            <div><span>所属应用</span><b>{app?.name ?? '—'}</b></div>
            <div><span>所属库</span><b>{db?.name ?? '—'}</b></div>
            <div><span>数据库类型</span><b>{db?.type ?? '—'}</b></div>
            <div><span>业务域</span><b>{domain?.name ?? '—'}</b></div>
            <div><span>描述</span><b>{table.desc ?? '—'}</b></div>
          </div>
        </div>
      )}

      {tab === '字段元数据' && (
        <table className="table field-table">
          <thead>
            <tr>
              <th>#</th><th>字段名</th><th>编码</th><th>业务定义</th><th>技术类型</th><th>键</th>
              <th>关联规则</th><th>关联标准</th><th>安全分级</th><th>主数据</th><th>责任人</th><th>更新频率</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => {
              const rules = (f.technical.qualityRuleIds || [])
                .map((id) => data.qualityRules.find((r) => r.id === id)).filter(Boolean);
              const std = f.management.standardId
                ? data.infoItems.find((s) => s.id === f.management.standardId) : null;
              const md = f.business.masterDataId
                ? data.masterData.find((m) => m.id === f.business.masterDataId) : null;
              const sec = data.security.find((s) => s.level === f.management.securityLevel);
              const secSrc = fieldSecuritySource(f, data.infoItems);
              const secCat = fieldSecurityCatalog(f.id, data.securityCatalog);
              return (
                <tr key={f.id} className={f.id === assetId?.fieldId ? 'row-active' : ''}>
                  <td>{f.seq}</td>
                  <td>{f.business.nameCn}</td>
                  <td><code>{f.business.code}</code></td>
                  <td>{f.business.definition || '—'}</td>
                  <td>{f.technical.type}</td>
                  <td>{f.technical.isPK ? 'PK' : ''}{f.technical.isPK && f.technical.isFK ? '/' : ''}{f.technical.isFK ? 'FK' : ''}</td>
                  <td>{rules.length
                    ? rules.map((r) => (
                      <button key={r.id} className="link" onClick={() => onNavigate('qualityDetail', { qualityRuleId: r.id })}>{r.name}</button>
                    ))
                    : '—'}</td>
                  <td>{std ? <button className="link" onClick={() => onNavigate('infoItemDetail', { infoItemId: std.id })}>{std.nameCn}（{std.code}）</button> : '—'}</td>
                  <td>
                    <Tag tone={LEVEL_TONE[f.management.securityLevel] || 'default'}>{f.management.securityLevel} {sec?.name}</Tag>{' '}
                    <Tag tone={SOURCE_TONE[secSrc.source] || 'default'}>{SOURCE_LABEL[secSrc.source] || secSrc.source}</Tag>
                    {secCat && (
                      <>
                        <br />
                        <button className="link" onClick={() => onNavigate('securityCatalogDetail', { catalogId: secCat.id })}>{secCat.dataType}</button>
                      </>
                    )}
                  </td>
                  <td>{md ? md.name : '—'}</td>
                  <td>{f.management.owner}</td>
                  <td>{f.management.updateFrequency}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {tab === '分区' && (
        partitions.length
          ? (
            <table className="table">
              <thead><tr><th>分区字段</th><th>类型</th><th>粒度</th><th>分区数</th><th>说明</th></tr></thead>
              <tbody>
                {partitions.map((p, i) => (
                  <tr key={i}>
                    <td>{p.field}</td>
                    <td>{p.type}</td>
                    <td>{p.granularity}</td>
                    <td>{p.count}</td>
                    <td>{p.desc ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
          : <div className="empty-hint">该表无分区</div>
      )}

      {tab === '索引' && (
        indexes.length
          ? (
            <table className="table">
              <thead><tr><th>索引名</th><th>类型</th><th>字段</th><th>唯一</th></tr></thead>
              <tbody>
                {indexes.map((ix, i) => (
                  <tr key={i}>
                    <td>{ix.name}</td>
                    <td>{ix.type}</td>
                    <td>{Array.isArray(ix.fields) ? ix.fields.join('，') : ix.fields}</td>
                    <td>{ix.unique ? '是' : '否'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
          : <div className="empty-hint">该表无索引</div>
      )}

      {tab === '版本历史' && (
        history.length
          ? (
            <table className="table">
              <thead><tr><th>版本</th><th>时间</th><th>操作人</th><th>动作</th><th>说明</th></tr></thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td>{h.version}</td>
                    <td>{h.time}</td>
                    <td>{h.operator}</td>
                    <td>{h.action}</td>
                    <td>{h.desc ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
          : <div className="empty-hint">该表无版本历史</div>
      )}
    </div>
  );
}
