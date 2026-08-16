import { useMemo, useState } from 'react';
import { useData } from '../DataContext.jsx';
import Tag from '../components/Tag.jsx';

const CATEGORIES = ['风资源', '海洋勘测', '风机设备', '运营监测', '海域环境'];
const USAGE_TYPES = ['下载', '申请'];
const SECURITY_LEVELS = ['L1', 'L2', 'L3', 'L4'];
const TYPE_FILTERS = [
  { key: 'all', label: '全部类型' },
  { key: 'table', label: '数据表' },
  { key: 'service', label: '数据服务' },
];

const EMPTY_VALUES = { name: '', category: '', dataOwner: '', usageType: '', securityLevel: '', desc: '' };

// 门户资产新增：独立页面（Tab）。六项基础字段沿用设计，打包资产重新设计为
// 「类型 + 名称」可搜索的多选器（数据表/数据服务可混选），提交前展示已选资产清单。
export default function PortalAssetCreateModule() {
  const { data, createRecord } = useData();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [selectedTables, setSelectedTables] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');

  const tableMap = useMemo(() => Object.fromEntries((data.tables || []).map((t) => [t.id, t])), [data.tables]);
  const serviceMap = useMemo(() => Object.fromEntries((data.services || []).map((s) => [s.id, s])), [data.services]);

  // 候选资产：数据表 + 数据服务，按「类型 + 名称」过滤（名称支持中文名 / 英文名 / 服务名）
  const candidates = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const tables = (data.tables || []).map((t) => ({
      kind: 'table', id: t.id, typeLabel: '数据表', name: t.nameCn, nameEn: t.nameEn,
      searchText: `${t.nameCn} ${t.nameEn}`.toLowerCase(),
    }));
    const services = (data.services || []).map((s) => ({
      kind: 'service', id: s.id, typeLabel: '数据服务', name: s.name, nameEn: '',
      searchText: s.name.toLowerCase(),
    }));
    return [...tables, ...services].filter((c) => {
      const typeOk = typeFilter === 'all' || c.kind === typeFilter;
      const textOk = !q || c.searchText.includes(q);
      return typeOk && textOk;
    });
  }, [data.tables, data.services, searchText, typeFilter]);

  const isSelected = (kind, id) => (kind === 'table' ? selectedTables : selectedServices).includes(id);

  const toggleSelect = (kind, id) => {
    const setter = kind === 'table' ? setSelectedTables : setSelectedServices;
    setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setErrors((e) => (e.packaging ? { ...e, packaging: undefined } : e));
    setSuccess('');
  };

  // 已选资产清单（数据表在前，数据服务在后）
  const selectedRows = [
    ...selectedTables.map((id) => ({ kind: 'table', id, typeLabel: '数据表', name: tableMap[id]?.nameCn || id })),
    ...selectedServices.map((id) => ({ kind: 'service', id, typeLabel: '数据服务', name: serviceMap[id]?.name || id })),
  ];

  const setValue = (key, val) => {
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    setSuccess('');
  };

  const validate = () => {
    const errs = {};
    if (!values.name.trim()) errs.name = '资产名为必填项';
    if (!values.category) errs.category = '业务分类为必填项';
    if (!values.desc.trim()) errs.desc = '业务介绍为必填项';
    if (!values.dataOwner.trim()) errs.dataOwner = '责任业务方为必填项';
    if (!values.usageType) errs.usageType = '使用方式为必填项';
    if (!values.securityLevel) errs.securityLevel = '安全分级为必填项';
    if (!selectedTables.length && !selectedServices.length) errs.packaging = '打包数据表与数据服务至少选择一项';
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
    try {
      await createRecord('portalAssets', {
        name: values.name.trim(),
        category: values.category,
        desc: values.desc.trim(),
        dataOwner: values.dataOwner.trim(),
        usageType: values.usageType,
        securityLevel: values.securityLevel,
        tableIds: selectedTables,
        serviceIds: selectedServices,
      });
      setSuccess(`提交成功，「${values.name.trim()}」已进入审批中`);
      setValues(EMPTY_VALUES);
      setSelectedTables([]);
      setSelectedServices([]);
      setSearchText('');
      setTypeFilter('all');
    } catch (e) {
      setSubmitError(e?.message || '提交失败');
    }
  };

  const handleReset = () => {
    setValues(EMPTY_VALUES);
    setSelectedTables([]);
    setSelectedServices([]);
    setSearchText('');
    setTypeFilter('all');
    setErrors({});
    setSubmitError('');
    setSuccess('');
  };

  const field = (key, label, control, err, help) => (
    <div className="form-field" key={key}>
      <label className="form-label">{label}<span className="req">*</span></label>
      {control}
      {help && !err && <div className="form-help">{help}</div>}
      {err && <div className="form-error">{err}</div>}
    </div>
  );

  return (
    <div className="portal-create">
      <h3>门户资产新增</h3>
      {success && <div className="form-success">{success}</div>}
      {submitError && <div className="form-error-summary">{submitError}</div>}

      <div className="form-grid">
        {field('name', '资产名', (
          <input className="form-input" placeholder="如：海上风电场测风数据集" value={values.name} onChange={(e) => setValue('name', e.target.value)} />
        ), errors.name)}
        {field('category', '业务分类', (
          <select className="form-input" value={values.category} onChange={(e) => setValue('category', e.target.value)}>
            <option value="">请选择</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        ), errors.category)}
        {field('dataOwner', '责任业务方', (
          <input className="form-input" placeholder="如：风资源室" value={values.dataOwner} onChange={(e) => setValue('dataOwner', e.target.value)} />
        ), errors.dataOwner)}
        {field('usageType', '使用方式', (
          <select className="form-input" value={values.usageType} onChange={(e) => setValue('usageType', e.target.value)}>
            <option value="">请选择</option>
            {USAGE_TYPES.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        ), errors.usageType)}
        {field('securityLevel', '安全分级', (
          <select className="form-input" value={values.securityLevel} onChange={(e) => setValue('securityLevel', e.target.value)}>
            <option value="">请选择</option>
            {SECURITY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        ), errors.securityLevel, '不得低于打包对象的最高分级')}
        <div className="form-field full" key="desc">
          <label className="form-label">业务介绍<span className="req">*</span></label>
          <textarea className="form-input" rows={3} placeholder="描述该资产的业务内容与用途" value={values.desc} onChange={(e) => setValue('desc', e.target.value)} />
          {errors.desc && <div className="form-error">{errors.desc}</div>}
        </div>
      </div>

      <h4>打包资产</h4>
      <div className="picker">
        <div className="picker-search">
          <select className="form-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {TYPE_FILTERS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <input className="form-input" placeholder="搜索资产名称…" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
        <div className="picker-results">
          {candidates.map((c) => (
            <label key={`${c.kind}:${c.id}`}>
              <input type="checkbox" checked={isSelected(c.kind, c.id)} onChange={() => toggleSelect(c.kind, c.id)} />
              <Tag>{c.typeLabel}</Tag>
              <span>{c.name}</span>
              {c.nameEn && <span className="muted">{c.nameEn}</span>}
            </label>
          ))}
          {candidates.length === 0 && <div className="picker-empty">无匹配资产</div>}
        </div>
        {errors.packaging && <div className="form-error">{errors.packaging}</div>}
      </div>

      <h4>已选资产清单（{selectedRows.length}）</h4>
      <table className="table">
        <thead><tr><th>资产类型</th><th>资产名称</th><th>操作</th></tr></thead>
        <tbody>
          {selectedRows.length ? (
            selectedRows.map((row) => (
              <tr key={`${row.kind}:${row.id}`}>
                <td><Tag>{row.typeLabel}</Tag></td>
                <td>{row.name}</td>
                <td><button className="link" onClick={() => toggleSelect(row.kind, row.id)}>移除</button></td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={3} className="muted">尚未选择资产</td></tr>
          )}
        </tbody>
      </table>

      <div className="form-actions">
        <button className="btn-secondary" onClick={handleReset}>重置</button>
        <button className="btn-primary" onClick={handleSubmit}>提交</button>
      </div>
    </div>
  );
}
