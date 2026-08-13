# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目定位

GDEPDI（广东省电力设计研究院）「数据资源管理平台」展示版（Demo）——面向**海上风电全生命周期数据治理**。目标读者：架构评审 / 求职作品集 / 方案演示。

**当前状态：MVP 已实现并合入 `main`**（M1 资产目录 + M0 治理看板·质量/标准子看板），血缘看板与 M2–M6 独立页留二期（占位页已就位）。本仓库已 `git init`，`main` 受 git-guardrails 保护（只接受 merge 提交），开发走任务分支再 merge。

## 常用命令

```bash
npm run dev        # 本地开发（Vite，base=/data-asset-platform/，访问 http://localhost:5173/data-asset-platform/）
npm test           # data 引用完整性 + state 状态机单测（node --test 自动发现，不带目录参数）
npm run build      # 构建到 dist/
npm run test:page  # playwright 页面冒烟（需先起 dev server + chromium）
```

## 文档层级（上游 → 下游，唯一依赖方向）

1. `REQUIREMENTS.md` —— 立项需求 + 设计约束（技术选型已确认：React + Vite + 静态 JSON mock）
2. `功能矩阵设计.md`（v4）—— 功能矩阵的正式产出，是**前端实现的上游唯一依据**
3. `GDEPDI-海上风电业务简报.md` —— 领域调研参考资料（公开信息整理 + 数据对象盘点）

改动上游文档前，确认下游文档是否已消费该内容，保持引用一致。

## 已确立的核心架构（实现前必读）

贯穿设计的核心洞察是**设计态 / 生产态两态分层**：

- **设计态**（定义/编目）：M1 资产目录 + M2 数据质量 + M3 数据标准 + M4 数据安全分级 + M5 主数据
- **生产态**（监控/展示）：M0 生产态治理看板（质量/血缘/标准三子看板）

| 模块 | 定位 | 优先级 |
|------|------|--------|
| M0 生产态治理看板 | 治理效果统一监控出口（3 子看板） | P0 |
| M1 数据资产目录/元数据 | **承重墙**，唯一数据源，设计态锚点 | P0 |
| M2 数据质量 | 规则登记，M1「关联质量规则」取值来源 | P1 |
| M3 数据标准 | 码表/字段标准，M1「关联标准」取值来源 | P1 |
| M4 数据安全分级 | 分级/脱敏，M1「安全分类分级」取值来源 | P1 |
| M5 主数据管理 | 主数据黄金记录，M1「主数据引用」来源 | P1 |
| M6 数据服务/共享 | 封装 M1 治理达标资产为产品/API | P2 |

### 关键架构决策

- **M1 为唯一锚点**：M0 三看板全部转跳回 M1；M2/M3/M4/M5 是 M1 元数据字段的取值来源；M6→M1（封装资产引用）。杜绝「看板与目录两套数据」。
- **数据加工不在本平台定位内**：规则执行、质量评分、贯标统计等由大数据开发平台完成；本平台只做「设计态登记」+「生产态展示」，不承担加工职责。
- **开发优先级**：首期 MVP = M1 + M0；P1 阶段 M2/M3/M4/M5 先以静态引用值内嵌于 M1 占位，二期再做独立页。

## 技术约定

- 前端 React + Vite（已确认）；后端从简（可选 Express mock 或纯静态 JSON）；数据静态 mock，不依赖数据库。
- 数据契约：单一 `data.js`（或 `data.json`）承载全部 mock 数据，页面数据驱动渲染。数组结构见 `功能矩阵设计.md` §6（`applications/databases/tables/fields/bizDomains/qualityRules/qualityResults/standards/security/masterData/lineage/services`）。
- **引用完整性是硬约束**：表↔字段↔规则↔标准↔主数据↔血缘↔服务 跨模块一致，用 Node 断言测试兜底（改任何 id 必同步改引用）。

## 可复用资产

领域模型直接复用兄弟仓库 `../vibecoding-cases/gdepdi-data-architecture-web/`（`GEDI_DATA_ARCH`，数据资产目录 L1-L4 分层：5 业务域 / 27 主题域 / 64 逻辑实体）。复用两层：

1. **内容**：海上风电的业务域 / 主题域 / 逻辑实体 / 属性作为本平台 M1 资产目录、主数据、标准的种子数据。
2. **工程范式**：`data.js` IIFE 挂全局（`GEDI_*`），浏览器 `<script>` 与 Node `await import()` 双环境可加载；`index.html` 数据驱动渲染不硬编码业务数据；`test/data.test.mjs` 引用完整性 + 跨案例一致性测试。

参考该仓库 `package.json` 的 scripts（`node --test` 自动发现 + playwright 页面冒烟）。

## 内容依据红线

涉及 GDEPDI 的领域模型基于**公开业务信息**（官网/百度百科），`meta.disclaimer` 必须声明「非广东院实际部署、仅供演示」。**不虚构内部运营数据。**
