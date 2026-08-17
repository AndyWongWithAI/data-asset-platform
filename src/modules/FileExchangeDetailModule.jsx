import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';

const STATUS_TONE = { 运行中: 'ok', 审批中: 'warn' };

export default function FileExchangeDetailModule({ onNavigate, assetId }) {
  const { data } = useData();
  const b = data.batchFiles.find((x) => x.id === assetId?.fileExchangeId);
  if (!b) return <div className="empty-hint">未找到该文件交换任务</div>;
  const inbound = b.direction === 'inbound';
  const snapshot = inbound ? data.prodMetadatas.find((p) => p.batchFileId === b.id) : null;
  return (
    <div className="detail-panel">
      <h3>{b.name}</h3>
      <div className="kv-list">
        <div><span>源系统</span><b>{b.sourceSystem}</b></div>
        {inbound ? (
          <>
            <div><span>源库</span><b>{b.sourceDatabaseName}</b></div>
            <div><span>源库类型</span><b>{b.sourceDatabaseType}</b></div>
          </>
        ) : (
          <div>
            <span>源表</span>
            <b>
              {b.sourceTableName}{' '}
              {b.sourceTableId && (
                <button className="link" onClick={() => onNavigate('tableDetail', { tableId: b.sourceTableId, title: b.sourceTableName })}>查看</button>
              )}
            </b>
          </div>
        )}
        <div><span>目标系统</span><b>{b.targetSystem}</b></div>
        {inbound ? (
          <div>
            <span>目标库</span>
            <b>
              {b.targetDatabaseName}{' '}
              <button className="link" onClick={() => onNavigate('catalog')}>查看目录</button>
            </b>
          </div>
        ) : (
          <div>
            <span>目标表</span>
            <b>
              {b.targetTableName}{' '}
              {b.targetTableId && (
                <button className="link" onClick={() => onNavigate('tableDetail', { tableId: b.targetTableId, title: b.targetTableName })}>查看</button>
              )}
            </b>
          </div>
        )}
        <div><span>文件格式</span><b>{b.fileFormat}</b></div>
        <div><span>调度周期</span><b>{b.schedule}</b></div>
        <div><span>安全分级</span><b>{b.securityLevel}</b></div>
        <div><span>状态</span><Tag tone={STATUS_TONE[b.status] || 'default'}>{b.status}</Tag></div>
      </div>
      {inbound && (
        <>
          <h4>采集元数据快照</h4>
          {snapshot ? (
            <>
              <div className="kv-list">
                <div><span>库名</span><b>{snapshot.databaseName}</b></div>
                <div><span>库类型</span><b>{snapshot.databaseType}</b></div>
                <div><span>采集时间</span><b>{snapshot.collectedAt}</b></div>
                <div><span>表数量</span><b>{snapshot.tables.length}</b></div>
              </div>
              <table className="table">
                <thead><tr><th>表中文名</th><th>表英文名</th><th>字段数</th></tr></thead>
                <tbody>
                  {snapshot.tables.map((t) => (
                    <tr key={t.nameEn}>
                      <td>{t.nameCn}</td>
                      <td><code>{t.nameEn}</code></td>
                      <td>{t.fields.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="empty-hint">暂无采集元数据快照</div>
          )}
        </>
      )}
      <h4>审批链</h4>
      {b.applyFlow.map((s, i) => (
        <div className="flow-step" key={i}>
          <span className="step-name">{s.step}</span>
          <span className="step-actor">{s.actor} · {s.time}</span>
          <span className="step-result">{s.result}</span>
        </div>
      ))}
    </div>
  );
}
