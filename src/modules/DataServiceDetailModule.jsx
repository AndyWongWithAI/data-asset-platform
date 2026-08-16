import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';
import CopyButton from '../components/CopyButton.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };
const LATENCY_TONE = { 实时: 'ok', 准实时: 'warn' };
const STATUS_TONE = { 已上架: 'ok' };

export default function DataServiceDetailModule({ onNavigate, assetId }) {
  const { data } = useData();
  const s = data.services.find((x) => x.id === assetId?.dataServiceId);
  if (!s) return <div className="empty-hint">未找到该数据服务</div>;

  const subscribeConfig = s.type === '订阅'
    ? `endpoint: ${s.access.endpoint}\ntopic: ${s.access.topic}\nqos: ${s.access.qos}\nformat: ${s.access.messageFormat}`
    : '';

  return (
    <div className="detail-panel">
      <div className="detail-title-row">
        <h3>{s.name}</h3>
        <ComingSoonAction label="申请订阅" />
      </div>
      <p className="desc">{s.desc}</p>
      <div className="kv-list">
        <div><span>类型</span><b>{s.type}</b></div>
        <div><span>时延</span><Tag tone={LATENCY_TONE[s.latency] || 'default'}>{s.latency}</Tag></div>
        <div><span>安全分级</span><Tag tone={LEVEL_TONE[s.securityLevel]}>{s.securityLevel}</Tag></div>
        <div><span>状态</span><Tag tone={STATUS_TONE[s.status] || 'default'}>{s.status}</Tag></div>
      </div>
      <h4>调用计量</h4>
      <div className="kv-list">
        <div><span>累计调用</span><b>{s.metrics.calls}</b></div>
        <div><span>消费方数</span><b>{s.metrics.consumers}</b></div>
        <div><span>近24h</span><b>{s.metrics.last24h}</b></div>
      </div>
      <h4>封装资产</h4>
      <table className="table">
        <thead><tr><th>表名</th><th>操作</th></tr></thead>
        <tbody>
          {s.tableIds.map((tid) => {
            const t = data.tables.find((x) => x.id === tid);
            return (
              <tr key={tid}>
                <td>{t?.nameCn}</td>
                <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: t.id, title: t.nameCn })}>查看</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h4>接入指南</h4>
      {s.type === 'API' && (
        <>
          <div className="kv-list">
            <div><span>接口地址</span><code>{s.access.endpoint}</code></div>
            <div><span>请求方法</span><Tag tone="ok">{s.access.method}</Tag></div>
            <div><span>限流</span><b>{s.access.rateLimit}</b></div>
            <div><span>版本</span><b>{s.access.version}</b></div>
          </div>
          <h4>请求参数</h4>
          <table className="table">
            <thead><tr><th>参数</th><th>类型</th><th>必填</th><th>说明</th></tr></thead>
            <tbody>
              {s.access.params.map((p) => (
                <tr key={p.name}><td><code>{p.name}</code></td><td>{p.type}</td><td>{p.required ? '是' : '否'}</td><td>{p.desc}</td></tr>
              ))}
            </tbody>
          </table>
          <h4>请求示例</h4>
          <div className="code-block"><div className="code-head"><CopyButton text={s.access.requestExample} /></div><pre><code>{s.access.requestExample}</code></pre></div>
          <h4>响应示例</h4>
          <div className="code-block"><div className="code-head"><CopyButton text={s.access.responseExample} /></div><pre><code>{s.access.responseExample}</code></pre></div>
        </>
      )}

      {s.type === '订阅' && (
        <>
          <div className="kv-list">
            <div><span>协议</span><b>{s.access.protocol}</b></div>
            <div><span>连接地址</span><code>{s.access.endpoint}</code></div>
            <div><span>订阅主题</span><code>{s.access.topic}</code></div>
            <div><span>QoS</span><b>{s.access.qos}</b></div>
            <div><span>消息格式</span><b>{s.access.messageFormat}</b></div>
          </div>
          <h4>消息字段</h4>
          <table className="table">
            <thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead>
            <tbody>
              {s.access.messageFields.map((f) => (
                <tr key={f.name}><td><code>{f.name}</code></td><td>{f.type}</td><td>{f.desc}</td></tr>
              ))}
            </tbody>
          </table>
          <h4>订阅配置</h4>
          <div className="code-block"><div className="code-head"><CopyButton text={subscribeConfig} /></div><pre><code>{subscribeConfig}</code></pre></div>
        </>
      )}

      {s.type === '数据包' && (
        <>
          <div className="kv-list">
            <div><span>文件格式</span><b>{s.access.format}</b></div>
            <div><span>更新频率</span><b>{s.access.updateFreq}</b></div>
            <div><span>数据量</span><b>{s.access.size}</b></div>
            <div><span>分区方式</span><b>{s.access.partition}</b></div>
          </div>
          <h4>下载地址</h4>
          <div className="code-block"><div className="code-head"><CopyButton text={s.access.downloadUrl} /></div><pre><code>{s.access.downloadUrl}</code></pre></div>
          <h4>包含字段</h4>
          <table className="table">
            <thead><tr><th>表名</th><th>字段数</th><th>操作</th></tr></thead>
            <tbody>
              {s.tableIds.map((tid) => {
                const t = data.tables.find((x) => x.id === tid);
                const count = data.fields.filter((f) => f.tableId === tid).length;
                return (
                  <tr key={tid}>
                    <td>{t?.nameCn}</td>
                    <td>{count} 个字段</td>
                    <td><button className="link" onClick={() => onNavigate('tableDetail', { tableId: tid, title: t.nameCn })}>查看字段</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      <h4>审批链</h4>
      {s.applyFlow.map((f, i) => (
        <div className="flow-step" key={i}>
          <span className="step-name">{f.step}</span>
          <span className="step-actor">{f.actor} · {f.time}</span>
          <span className="step-result">{f.result}</span>
        </div>
      ))}
    </div>
  );
}
