import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import { FORM_SCHEMAS, ENTITY_TITLES } from '../schema.js';
import { analyzeNameCn } from '../infoItemNaming.js';
import { filterRefOptions } from '../entityFilter.js';

// 通用标签取值：按引用目标实体的可读字段渲染下拉/复选选项文本。
export function labelOf(entity, item) {
  if (item == null) return '—';
  switch (entity) {
    case 'fields': return item.business?.nameCn;
    case 'baseTerms': return item.nameCn;
    case 'bizDomains': return item.name;
    case 'valueDomains': return item.code;
    case 'refDatas': return item.name;
    default: return item.nameCn ?? item.name ?? item.code ?? item.id;
  }
}

// 由编辑记录初始化表单值（数组/对象字段做浅拷贝，避免直接改源数据）
function buildInitialValues(schema, record) {
  const vals = {};
  for (const f of schema) {
    if (f.type === 'derived') continue;
    const raw = record ? record[f.key] : undefined;
    if (f.type === 'bool') vals[f.key] = raw ? true : false;
    else if (f.type === 'multiref') vals[f.key] = Array.isArray(raw) ? [...raw] : [];
    else if (f.type === 'subtable') vals[f.key] = Array.isArray(raw) ? raw.map((r) => ({ ...r })) : [];
    else if (f.type === 'dynamic') vals[f.key] = raw && typeof raw === 'object' ? { ...raw } : {};
    else if (f.multi) vals[f.key] = Array.isArray(raw) ? raw.join(', ') : '';
    else vals[f.key] = raw ?? '';
  }
  return vals;
}

const isEmpty = (v) =>
  v == null || v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (!Array.isArray(v) && typeof v === 'object' && Object.keys(v).length === 0);

// 组装提交 payload：派生/只读字段不提交，空值跳过，number 转数字，multi 逗号分隔转数组。
function buildPayload(schema, values, mode = 'create') {
  const payload = {};
  for (const f of schema) {
    if (f.type === 'derived' || f.readonly || (mode === 'update' && f.readonlyOnUpdate)) continue;
    const v = values[f.key];
    if (f.type === 'number') {
      if (v === '' || v == null) continue;
      const n = parseFloat(v);
      if (Number.isNaN(n)) continue;
      payload[f.key] = n;
    } else if (f.multi) {
      payload[f.key] = String(v ?? '').split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    } else if (f.type === 'bool') {
      payload[f.key] = !!v;
    } else if (f.type === 'multiref' || f.type === 'dynamic') {
      if (isEmpty(v)) continue;
      payload[f.key] = v;
    } else if (f.type === 'subtable') {
      // 过滤 code/name 全空的行，避免落库空枚举值
      const rows = Array.isArray(v) ? v.filter((row) => row && (row.code || row.name)) : [];
      if (rows.length === 0) continue;
      payload[f.key] = rows;
    } else {
      // text / enum / ref / expr：update 模式下可空字段空值显式传 null（清空），create 模式跳过
      if (v === '' || v == null) {
        if (mode === 'update' && !f.required) payload[f.key] = null;
        continue;
      }
      payload[f.key] = v;
    }
  }
  return payload;
}

export default function EntityForm({ entity, mode = 'create', record = null, title, onClose, onSaved }) {
  const { data, createRecord, updateRecord } = useData();
  const schema = FORM_SCHEMAS[entity] || [];

  const [values, setValues] = useState(() => buildInitialValues(schema, record));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const heading = title || `${mode === 'update' ? '编辑' : '新增'}${ENTITY_TITLES[entity] || entity}`;
  const recordId = record?.id ?? record?.level;

  // 信息项命名分析：由输入的中文名实时拆词翻译（缺词根 / 末位非类词在此判定）
  const naming = entity === 'infoItems' ? analyzeNameCn(values.nameCn, data.baseTerms || []) : null;

  const setValue = (key, val) => {
    setValues((v) => {
      const next = { ...v, [key]: val };
      // dynamic 字段：驱动字段变化时重置其值
      for (const f of schema) {
        if (f.dynamicBy === key) next[f.key] = {};
      }
      return next;
    });
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    setSubmitError('');
  };

  const toggleMultiref = (key, id) => {
    setValues((v) => {
      const arr = v[key] || [];
      const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
      return { ...v, [key]: next };
    });
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const updateSubtable = (key, idx, rowKey, rowVal) => {
    setValues((v) => {
      const rows = [...(v[key] || [])];
      rows[idx] = { ...rows[idx], [rowKey]: rowVal };
      return { ...v, [key]: rows };
    });
  };
  const addSubtableRow = (key) => setValues((v) => ({ ...v, [key]: [...(v[key] || []), {}] }));
  const removeSubtableRow = (key, idx) =>
    setValues((v) => ({ ...v, [key]: (v[key] || []).filter((_, i) => i !== idx) }));

  const updateDynamic = (key, attrKey, attrVal) =>
    setValues((v) => ({ ...v, [key]: { ...(v[key] || {}), [attrKey]: attrVal } }));

  const insertExpr = (key, snippet) =>
    setValues((v) => ({ ...v, [key]: (v[key] || '') + snippet }));

  const derivedValue = (f) => {
    if (f.type !== 'derived') return '';
    if (entity === 'infoItems' && f.key === 'nameEn') return naming?.nameEn || '';
    if (entity === 'refDatas' && f.key === 'code') return '自动生成（保存后分配）';
    return '';
  };

  const validate = () => {
    const errs = {};
    for (const f of schema) {
      if (f.type === 'derived' || f.readonly) continue;
      const v = values[f.key];
      if (f.required && isEmpty(v)) errs[f.key] = `${f.label}为必填项`;
      if (f.type === 'number' && v !== '' && v != null && Number.isNaN(parseFloat(v))) {
        errs[f.key] = `${f.label}必须是数字`;
      }
    }
    // infoItems 条件必填：type=业务 时业务域 + 定义必填
    if (entity === 'infoItems' && values.type === '业务') {
      if (!values.bizDomainId) errs.bizDomainId = '类型为「业务」时业务域必填';
      if (!values.definition) errs.definition = '类型为「业务」时定义必填';
    }
    // infoItems 命名硬校验：缺词根 / 末位非类词（阻止提交）
    if (entity === 'infoItems' && naming && naming.errors.length) {
      errs.nameCn = naming.errors.join('；');
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setSubmitError(`请修正表单中的 ${Object.keys(errs).length} 处错误后再提交`);
      return;
    }
    setSubmitError('');

    // security 分级调整（update）：统计受影响字段数，二次确认
    if (entity === 'security' && mode === 'update') {
      const n = (data.fields || []).filter((f) => f.management?.securityLevel === record?.level).length;
      if (!window.confirm(`本次调整将影响 ${n} 个字段，确认？`)) return;
    }

    const payload = buildPayload(schema, values, mode);
    try {
      if (mode === 'update') await updateRecord(entity, recordId, payload);
      else await createRecord(entity, payload);
      onSaved?.();
    } catch (e) {
      setSubmitError(e?.message || '保存失败');
    }
  };

  const renderField = (f) => {
    const val = values[f.key];
    const err = errors[f.key];
    const full = ['subtable', 'dynamic', 'expr'].includes(f.type) || f.key === 'definition' || f.key === 'desc';
    let control;

    if (f.readonly || (mode === 'update' && f.readonlyOnUpdate)) {
      control = <div className="derived-value">{val ?? '—'}</div>;
    } else if (f.type === 'derived') {
      control = <div className="derived-value">{derivedValue(f) || '—'}</div>;
    } else {
      switch (f.type) {
        case 'bool':
          control = (
            <label className="form-check-label">
              <input type="checkbox" checked={!!val} onChange={(e) => setValue(f.key, e.target.checked)} />
              <span>是</span>
            </label>
          );
          break;
        case 'enum':
          control = (
            <select className="form-input" value={val ?? ''} onChange={(e) => setValue(f.key, e.target.value)}>
              <option value="">请选择</option>
              {(f.enum || []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          );
          break;
        case 'ref':
          control = (
            <select className="form-input" value={val ?? ''} onChange={(e) => setValue(f.key, e.target.value)}>
              <option value="">请选择</option>
              {filterRefOptions(data[f.ref], record, f.key).map((item) => (
                <option key={item.id} value={item.id}>{labelOf(f.ref, item)}</option>
              ))}
            </select>
          );
          break;
        case 'multiref':
          control = (
            <div className="form-check-list">
              {filterRefOptions(data[f.ref], record, f.key).map((item) => {
                const checked = (val || []).includes(item.id);
                return (
                  <label key={item.id}>
                    <input type="checkbox" checked={checked} onChange={() => toggleMultiref(f.key, item.id)} />
                    <span>{labelOf(f.ref, item)}</span>
                  </label>
                );
              })}
            </div>
          );
          break;
        case 'subtable':
          control = (
            <div className="subtable">
              {(val || []).map((row, idx) => (
                <div className="subtable-row" key={idx}>
                  {(f.rows || []).map((rf) => (
                    <input
                      key={rf.key}
                      className="form-input"
                      placeholder={rf.label}
                      value={row?.[rf.key] ?? ''}
                      onChange={(e) => updateSubtable(f.key, idx, rf.key, e.target.value)}
                    />
                  ))}
                  <button type="button" className="subtable-del" onClick={() => removeSubtableRow(f.key, idx)}>删除</button>
                </div>
              ))}
              <button type="button" className="subtable-add" onClick={() => addSubtableRow(f.key)}>+ 添加一行</button>
            </div>
          );
          break;
        case 'dynamic': {
          const driverVal = values[f.dynamicBy];
          const tmpl = (f.dynamicOptions && f.dynamicOptions[driverVal]) || [];
          control = (
            <div className="dynamic-grid">
              {tmpl.map((item) => (
                <div className="dynamic-row" key={item.key}>
                  <span className="dyn-label">{item.key}</span>
                  <input
                    className="form-input"
                    value={val?.[item.key] ?? ''}
                    onChange={(e) => updateDynamic(f.key, item.key, e.target.value)}
                  />
                </div>
              ))}
              {tmpl.length === 0 && <span className="form-help">请先选择{f.dynamicBy === 'entityType' ? '实体类型' : f.dynamicBy}</span>}
            </div>
          );
          break;
        }
        case 'expr':
          control = (
            <div>
              <input className="form-input" value={val ?? ''} onChange={(e) => setValue(f.key, e.target.value)} />
              <div className="expr-hint">
                <div className="expr-hint-label">点击字段名插入到表达式末尾：</div>
                {(data.fields || []).map((fd) => (
                  <span key={fd.id} className="expr-chip" onClick={() => insertExpr(f.key, fd.business?.nameCn)}>
                    {fd.business?.nameCn}
                  </span>
                ))}
              </div>
            </div>
          );
          break;
        case 'number':
          control = <input type="number" className="form-input" value={val ?? ''} onChange={(e) => setValue(f.key, e.target.value)} />;
          break;
        case 'text':
        default:
          if (f.key === 'definition' || f.key === 'desc') {
            control = (
              <textarea className="form-input" rows={3} placeholder={f.placeholder} value={val ?? ''} onChange={(e) => setValue(f.key, e.target.value)} />
            );
          } else {
            control = (
              <input type="text" className="form-input" placeholder={f.placeholder} value={val ?? ''} onChange={(e) => setValue(f.key, e.target.value)} />
            );
          }
          break;
      }
    }

    return (
      <div className={`form-field${full ? ' full' : ''}`} key={f.key}>
        <label className="form-label">
          {f.label}{f.required && <span className="req">*</span>}
        </label>
        {control}
        {f.key === 'nameCn' && entity === 'infoItems' && naming && naming.errors.length > 0 && !err && (
          <div className="form-error">{naming.errors.join('；')}</div>
        )}
        {f.key === 'nameCn' && entity === 'infoItems' && naming && naming.termIds.length > 0 && (
          <div className="form-help">识别词根：{naming.segments.filter((s) => s.hit).map((s) => s.text).join(' + ')}</div>
        )}
        {f.help && !err && <div className="form-help">{f.help}</div>}
        {err && <div className="form-error">{err}</div>}
      </div>
    );
  };

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h3>{heading}</h3>
        {submitError && <div className="form-error-summary">{submitError}</div>}
        <div className="form-grid">
          {schema.map(renderField)}
        </div>
        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={handleSubmit}>{mode === 'update' ? '保存' : '提交'}</button>
        </div>
      </div>
    </div>
  );
}
