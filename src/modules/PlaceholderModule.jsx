import { MODULES } from '../state.js';

const POSITIONING = {
  quality: '设计态·规则登记：质量规则的登记/定义处，是 M1 元数据「关联质量规则」字段的取值来源，运行结果由 M0 质量子看板监控。',
  standard: '设计态·标尺：码表与字段标准的定义处，是 M1 元数据「关联标准」与 M0 标准看板「贯标」的对标尺。',
  security: '设计态·治理配置：分级规则与脱敏策略定义处，是 M1 元数据「安全分类分级」字段的取值来源。',
  masterdata: '设计态·共享对象：主数据实体黄金记录定义处，是 M1 元数据「主数据引用」的来源。',
  service: '价值输出：把治理达标资产封装为数据产品/API 对外共享（M6→M1 引用）。',
};

export default function PlaceholderModule({ moduleKey }) {
  const mod = MODULES.find((m) => m.key === moduleKey);
  return (
    <div className="placeholder">
      <h3>{mod?.title}</h3>
      <p className="placeholder-pos">{POSITIONING[moduleKey] || '该模块定位待补充。'}</p>
      <p className="placeholder-note">🛠 二期建设中 —— 首期 MVP 仅实现 M1 资产目录 + M0 治理看板（质量/标准子看板）。</p>
    </div>
  );
}
