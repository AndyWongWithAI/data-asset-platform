import { useState } from 'react';
import data from '../data.js';
import Tag from '../components/Tag.jsx';
import ComingSoonAction from '../components/ComingSoonAction.jsx';

const MODE_TONES = { 离线批次: 'default', 数据服务: 'ok' };

function modesFor(t) {
  const set = new Set();
  data.lineage.forEach((l) => {
    if (l.up === t.id || l.down === t.id) set.add(l.mode);
  });
  return [...set];
}

function ModeLabels({ modes }) {
  if (modes.length === 0) return <span className="en">—</span>;
  return (
    <span className="mode-labels">
      {modes.map((m) =>
        m === '应用内'
          ? <span key={m} className="en">应用内</span>
          : <Tag key={m} tone={MODE_TONES[m] || 'default'}>{m}</Tag>
      )}
    </span>
  );
}

function LineageGraph({ tableId, onNavigate }) {
  const W = 170;
  const H = 50;
  const GAPX = 160;
  const GAPY = 20;
  const rowH = H + GAPY;

  const ups = data.lineage
    .filter((l) => l.down === tableId)
    .map((l) => data.tables.find((t) => t.id === l.up))
    .filter(Boolean);
  const downs = data.lineage
    .filter((l) => l.up === tableId)
    .map((l) => data.tables.find((t) => t.id === l.down))
    .filter(Boolean);
  const center = data.tables.find((t) => t.id === tableId);

  const rowCount = Math.max(ups.length, downs.length, 1);
  const svgW = 3 * W + 2 * GAPX;
  const svgH = rowCount * rowH;
  const centerY = (svgH - H) / 2;
  const leftX = 0;
  const centerX = W + GAPX;
  const rightX = 2 * (W + GAPX);

  return (
    <svg className="lineage-svg" width="100%" viewBox={`0 0 ${svgW} ${svgH}`}>
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#86909c" />
        </marker>
      </defs>

      {/* 中心节点 */}
      <g className="lineage-node lineage-node-center">
        <rect x={centerX} y={centerY} width={W} height={H} rx={6} />
        <text x={centerX + 10} y={centerY + 22}>{center?.nameCn}</text>
      </g>

      {/* 上游列 */}
      {ups.length === 0
        ? <text className="lineage-empty-col" x={leftX + 10} y={centerY + 25}>无上游</text>
        : ups.map((n, i) => {
            const upY = i * rowH;
            const edge = data.lineage.find((l) => l.down === tableId && l.up === n.id);
            return (
              <g key={n.id}>
                <path
                  d={`M ${leftX + W} ${upY + H / 2} C ${leftX + W + 40} ${upY + H / 2}, ${centerX - 40} ${centerY + H / 2}, ${centerX} ${centerY + H / 2}`}
                  className="lineage-edge"
                  markerEnd="url(#arrow)"
                />
                {edge?.relation && (
                  <text className="lineage-edge-label" x={(leftX + W + centerX) / 2} y={(upY + centerY) / 2 + H / 2 - 8} textAnchor="middle">
                    {edge.relation}
                  </text>
                )}
                <g className="lineage-node" onClick={() => onNavigate('tableDetail', { tableId: n.id, title: n.nameCn })}>
                  <rect x={leftX} y={upY} width={W} height={H} rx={6} />
                  <text x={leftX + 10} y={upY + 22}>{n.nameCn}</text>
                  {edge?.mode && edge.mode !== '应用内' && (
                    <text className={`lineage-node-mode ${edge.mode === '数据服务' ? 'lineage-node-mode-ok' : 'lineage-node-mode-default'}`} x={leftX + 10} y={upY + H - 8}>{edge.mode}</text>
                  )}
                </g>
              </g>
            );
          })}

      {/* 下游列 */}
      {downs.length === 0
        ? <text className="lineage-empty-col" x={rightX + 10} y={centerY + 25}>无下游</text>
        : downs.map((n, i) => {
            const downY = i * rowH;
            const edge = data.lineage.find((l) => l.up === tableId && l.down === n.id);
            return (
              <g key={n.id}>
                <path
                  d={`M ${centerX + W} ${centerY + H / 2} C ${centerX + W + 40} ${centerY + H / 2}, ${rightX - 40} ${downY + H / 2}, ${rightX} ${downY + H / 2}`}
                  className="lineage-edge"
                  markerEnd="url(#arrow)"
                />
                {edge?.relation && (
                  <text className="lineage-edge-label" x={(centerX + W + rightX) / 2} y={(centerY + downY) / 2 + H / 2 - 8} textAnchor="middle">
                    {edge.relation}
                  </text>
                )}
                <g className="lineage-node" onClick={() => onNavigate('tableDetail', { tableId: n.id, title: n.nameCn })}>
                  <rect x={rightX} y={downY} width={W} height={H} rx={6} />
                  <text x={rightX + 10} y={downY + 22}>{n.nameCn}</text>
                  {edge?.mode && edge.mode !== '应用内' && (
                    <text className={`lineage-node-mode ${edge.mode === '数据服务' ? 'lineage-node-mode-ok' : 'lineage-node-mode-default'}`} x={rightX + 10} y={downY + H - 8}>{edge.mode}</text>
                  )}
                </g>
              </g>
            );
          })}
    </svg>
  );
}

export default function LineageModule({ onNavigate }) {
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [exchangeFilter, setExchangeFilter] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [checkedIds, setCheckedIds] = useState(new Set());

  const toggleCheck = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (selectedTableId !== null) {
    return (
      <div>
        <button className="link" onClick={() => setSelectedTableId(null)}>← 返回列表</button>
        <div style={{ height: 12 }} />
        <LineageGraph tableId={selectedTableId} onNavigate={onNavigate} />
      </div>
    );
  }

  const filtered = data.tables.filter((t) => {
    const modes = modesFor(t);
    if (exchangeFilter !== '全部' && !modes.includes(exchangeFilter)) return false;
    if (keyword && !t.nameCn.includes(keyword) && !t.nameEn.includes(keyword)) return false;
    return true;
  });

  return (
    <div>
      <h3>数据血缘看板</h3>
      <div className="search-bar" style={{ marginBottom: 12 }}>
        <select value={exchangeFilter} onChange={(e) => setExchangeFilter(e.target.value)}>
          <option value="全部">交换方式：全部</option>
          <option value="离线批次">离线批次</option>
          <option value="数据服务">数据服务</option>
          <option value="应用内">应用内</option>
        </select>
        <input
          type="text"
          placeholder="按表名检索（中文/英文）"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <ComingSoonAction label="批量导出血缘" />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-hint">无匹配的表</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>表名</th>
              <th>应用</th>
              <th>上游数</th>
              <th>下游数</th>
              <th>交换方式</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const upCount = data.lineage.filter((l) => l.down === t.id).length;
              const downCount = data.lineage.filter((l) => l.up === t.id).length;
              const app = data.applications.find((a) => a.id === t.appId);
              return (
                <tr key={t.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={checkedIds.has(t.id)}
                      onChange={() => toggleCheck(t.id)}
                    />
                  </td>
                  <td>
                    {t.nameCn}
                    <span className="en">{t.nameEn}</span>
                  </td>
                  <td>{app?.name}</td>
                  <td>{upCount}</td>
                  <td>{downCount}</td>
                  <td><ModeLabels modes={modesFor(t)} /></td>
                  <td>
                    <button className="link" onClick={() => setSelectedTableId(t.id)}>查看血缘图</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
