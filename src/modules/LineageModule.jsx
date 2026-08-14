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
  const BOX_W = 180;
  const NAME_H = 30;
  const FIELD_H = 22;
  const GAPX = 200;
  const COL_GAP = 24;
  const PAD = 20;

  const [selFieldId, setSelFieldId] = useState(null);

  const tablesById = new Map(data.tables.map((t) => [t.id, t]));
  const fieldById = new Map(data.fields.map((f) => [f.id, f]));
  const fieldTable = new Map(data.fields.map((f) => [f.id, f.tableId]));

  const fieldsOf = (tid) =>
    data.fields.filter((f) => f.tableId === tid).sort((a, b) => a.seq - b.seq);
  const boxH = (t) => NAME_H + 1 + fieldsOf(t.id).length * FIELD_H;

  const ups = data.lineage
    .filter((l) => l.down === tableId)
    .map((l) => ({ table: tablesById.get(l.up), edge: l }))
    .filter((e) => e.table);
  const downs = data.lineage
    .filter((l) => l.up === tableId)
    .map((l) => ({ table: tablesById.get(l.down), edge: l }))
    .filter((e) => e.table);
  const center = tablesById.get(tableId);

  const leftX = 0;
  const centerX = BOX_W + GAPX;
  const rightX = 2 * (BOX_W + GAPX);

  // 同列多表按各自类框高度纵向累加
  const stackLayout = (items) => {
    let y = PAD;
    const pos = items.map((e) => {
      const p = { ...e, y };
      y += boxH(e.table) + COL_GAP;
      return p;
    });
    const total = items.length ? y - COL_GAP - PAD : 0;
    return { pos, total };
  };
  const upLayout = stackLayout(ups);
  const downLayout = stackLayout(downs);
  const upPos = upLayout.pos;
  const downPos = downLayout.pos;

  const centerBoxH = center ? boxH(center) : NAME_H + 1;
  const maxH = Math.max(upLayout.total, downLayout.total, centerBoxH);
  const svgH = maxH + 2 * PAD;
  const svgW = 3 * BOX_W + 2 * GAPX;
  const centerTop = PAD + (maxH - centerBoxH) / 2;

  // tableId -> { x, y }，供字段级线锚点定位
  const pos = new Map();
  upPos.forEach((e) => pos.set(e.table.id, { x: leftX, y: e.y }));
  downPos.forEach((e) => pos.set(e.table.id, { x: rightX, y: e.y }));
  if (center) pos.set(center.id, { x: centerX, y: centerTop });

  const inGraph = new Set([
    ...(center ? [center.id] : []),
    ...ups.map((e) => e.table.id),
    ...downs.map((e) => e.table.id),
  ]);

  const dimmed = selFieldId !== null;

  // 字段级线：命中选中字段的映射，且两端表都在当前图内
  const fieldLines = [];
  if (selFieldId !== null) {
    data.lineage.forEach((l) => {
      (l.fieldMapping || []).forEach((m) => {
        if (m.up === selFieldId || m.down === selFieldId) {
          const upT = fieldTable.get(m.up);
          const downT = fieldTable.get(m.down);
          if (upT && downT && inGraph.has(upT) && inGraph.has(downT)) {
            fieldLines.push(m);
          }
        }
      });
    });
  }

  const fieldRowCenterY = (tableY, seq) =>
    tableY + NAME_H + 1 + (seq - 1) * FIELD_H + FIELD_H / 2;

  const renderBox = (t, bx, by) => {
    const fields = fieldsOf(t.id);
    const bh = boxH(t);
    return (
      <g className="lineage-table-box" key={t.id}>
        <rect x={bx} y={by} width={BOX_W} height={bh} rx={6} />
        <g
          className="table-title-hitbox"
          onClick={() => onNavigate('tableDetail', { tableId: t.id, title: t.nameCn })}
        >
          <text className="table-title" x={bx + 10} y={by + 18}>{t.nameCn}</text>
          <text className="table-title-en" x={bx + 10} y={by + 27}>{t.nameEn}</text>
        </g>
        <line className="sep" x1={bx} y1={by + NAME_H} x2={bx + BOX_W} y2={by + NAME_H} />
        {fields.map((f) => {
          const rowY = by + NAME_H + 1 + (f.seq - 1) * FIELD_H;
          const active = selFieldId === f.id;
          return (
            <g
              key={f.id}
              className={`lineage-field-row${active ? ' lineage-field-active' : ''}`}
              onClick={() => setSelFieldId((prev) => (prev === f.id ? null : f.id))}
            >
              <rect x={bx} y={rowY} width={BOX_W} height={FIELD_H} fill="transparent" />
              <text x={bx + 10} y={rowY + FIELD_H / 2 + 4}>{f.business.nameCn}</text>
              <text className="lineage-field-code" x={bx + BOX_W - 10} y={rowY + FIELD_H / 2 + 4} textAnchor="end">{f.business.code}</text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <svg className="lineage-svg" width="100%" viewBox={`0 0 ${svgW} ${svgH}`}>
      <defs>
        <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#165dff" />
        </marker>
        <marker id="arrow-gray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#c9cdd4" />
        </marker>
      </defs>

      {/* 表框先画，连线叠在上层，箭头落在框边缘可见 */}
      {center && renderBox(center, centerX, centerTop)}
      {upPos.map((e) => renderBox(e.table, leftX, e.y))}
      {downPos.map((e) => renderBox(e.table, rightX, e.y))}

      {/* 空列占位 */}
      {ups.length === 0 && (
        <text className="lineage-empty-col" x={leftX + 10} y={centerTop + centerBoxH / 2 + 4}>无上游</text>
      )}
      {downs.length === 0 && (
        <text className="lineage-empty-col" x={rightX + 10} y={centerTop + centerBoxH / 2 + 4}>无下游</text>
      )}

      {/* 表级线（锚定表名条，默认蓝 / 选中字段后灰） */}
      {upPos.map((e) => {
        const upY = e.y;
        const midX = (leftX + BOX_W + centerX) / 2;
        const midY = (upY + centerTop) / 2 + NAME_H / 2;
        return (
          <g key={`up-${e.edge.id}`}>
            <path
              d={`M ${leftX + BOX_W} ${upY + NAME_H / 2} C ${leftX + BOX_W + 60} ${upY + NAME_H / 2}, ${centerX - 60} ${centerTop + NAME_H / 2}, ${centerX} ${centerTop + NAME_H / 2}`}
              className={`lineage-edge-table${dimmed ? ' is-dimmed' : ''}`}
              markerEnd={`url(#${dimmed ? 'arrow-gray' : 'arrow-blue'})`}
            />
            {e.edge.relation && (
              <text className="lineage-edge-label" x={midX} y={midY} textAnchor="middle">{e.edge.relation}</text>
            )}
            {e.edge.mode && e.edge.mode !== '应用内' && (
              <text className={`lineage-edge-mode ${e.edge.mode === '数据服务' ? 'mode-ok' : 'mode-default'}`} x={midX} y={midY + 14} textAnchor="middle">{e.edge.mode}</text>
            )}
          </g>
        );
      })}

      {downPos.map((e) => {
        const downY = e.y;
        const midX = (centerX + BOX_W + rightX) / 2;
        const midY = (centerTop + downY) / 2 + NAME_H / 2;
        return (
          <g key={`down-${e.edge.id}`}>
            <path
              d={`M ${centerX + BOX_W} ${centerTop + NAME_H / 2} C ${centerX + BOX_W + 60} ${centerTop + NAME_H / 2}, ${rightX - 60} ${downY + NAME_H / 2}, ${rightX} ${downY + NAME_H / 2}`}
              className={`lineage-edge-table${dimmed ? ' is-dimmed' : ''}`}
              markerEnd={`url(#${dimmed ? 'arrow-gray' : 'arrow-blue'})`}
            />
            {e.edge.relation && (
              <text className="lineage-edge-label" x={midX} y={midY} textAnchor="middle">{e.edge.relation}</text>
            )}
            {e.edge.mode && e.edge.mode !== '应用内' && (
              <text className={`lineage-edge-mode ${e.edge.mode === '数据服务' ? 'mode-ok' : 'mode-default'}`} x={midX} y={midY + 14} textAnchor="middle">{e.edge.mode}</text>
            )}
          </g>
        );
      })}

      {/* 字段级线：一个映射一条线 */}
      {fieldLines.map((m, i) => {
        const upF = fieldById.get(m.up);
        const downF = fieldById.get(m.down);
        const upP = pos.get(fieldTable.get(m.up));
        const downP = pos.get(fieldTable.get(m.down));
        if (!upF || !downF || !upP || !downP) return null;
        const ux = upP.x + BOX_W;
        const uy = fieldRowCenterY(upP.y, upF.seq);
        const dx = downP.x;
        const dy = fieldRowCenterY(downP.y, downF.seq);
        return (
          <path
            key={`fl-${i}-${m.up}-${m.down}`}
            d={`M ${ux} ${uy} C ${ux + 40} ${uy}, ${dx - 40} ${dy}, ${dx} ${dy}`}
            className="lineage-edge-field"
            markerEnd="url(#arrow-blue)"
          />
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
