import { MODULES } from '../state.js';

const POSITIONING = {
  quality: '规则登记：质量规则的登记/定义处，是 M1 元数据「关联质量规则」字段的取值来源，运行结果由 M0 质量子看板监控。',
  standard: '标尺：码表与字段标准的定义处，是 M1 元数据「关联标准」与 M0 标准看板「贯标」的对标尺。',
  security: '治理配置：分级规则与脱敏策略定义处，是 M1 元数据「安全分类分级」字段的取值来源。',
  masterdata: '共享对象：主数据实体黄金记录定义处，是 M1 元数据「主数据引用」的来源。',
  fileExchange: '数据交换·文件交换：管理双向离线文件交换信息（源系统·源表 ↔ 目标系统·目标表/文件格式/调度/审批链）。',
  dataService: '数据交换·数据服务：管理实时/准实时数据服务（API/订阅/数据包/审批链/调用计量）。',
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
