import { useState, useRef } from 'react';
import { useData } from '../DataContext.jsx';
import { buildColumns, buildTemplateCsv, parseCsv, importRows } from '../bulkImport.js';

// 批量导入弹窗：模板下载 + CSV 文件上传 + 逐条导入 + 结果汇总。纯前端，逐条走后端 create。
export default function BulkImport({ entity, onClose, onSaved }) {
  const { data, createRecord } = useData();
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const cols = buildColumns(entity);
  const sample = (data[entity] || [])[0];

  const downloadTemplate = () => {
    const csv = buildTemplateCsv(entity, sample);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entity}-导入模板.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length < 2) return; // 至少表头 + 1 数据行
    setBusy(true);
    const res = await importRows(entity, rows[0], rows.slice(1), createRecord); // 表头用于列校验
    setBusy(false);
    setResult(res);
  };

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h3>批量导入</h3>
        <div className="form-help">
          列顺序：{cols.map((f) => f.label).join(' / ')}
        </div>
        <div className="form-actions" style={{ justifyContent: 'flex-start', gap: 8 }}>
          <button className="btn-secondary" onClick={downloadTemplate}>下载模板</button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>{busy ? '导入中…' : '上传 CSV'}</button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
        </div>
        {result && (
          <div className="form-help" style={{ marginTop: 8 }}>
            {result.headerError
              ? <span>导入中止：{result.headerError}</span>
              : result.errors.length === 0
                ? <span>导入完成：成功 {result.success.length} 条。</span>
                : <span>成功 {result.success.length} 条 / 失败 {result.errors.length} 行：{result.errors.map((e) => `第${e.row + 1}行 ${e.errors.join('；')}`).join('；')}</span>}
          </div>
        )}
        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}
