# 数据资产管理平台（Data Asset Platform）

面向**海上风电全生命周期数据治理**的数据资产管理演示平台（Demo），覆盖「元数据登记 → 质量 / 标准 / 安全治理 → 资产封装发布 → 生产态监控」一条完整治理闭环。

- 🌐 **管理平台**：https://demo.intelab.cn/data-asset-platform/
- 🛍️ **数据资产门户**：https://demo.intelab.cn/data-asset-portal/

> ⚠️ **免责声明**：领域模型基于广东电力设计研究院（GDEPDI）**公开业务信息**构建，**非广东院实际部署、仅供演示**，不虚构内部运营数据。

---

## 特性

- **两态分层 + 唯一锚点**：设计态（定义/登记）与生产态（监控/展示）分离，全平台以「结构化元数据（M1）」为唯一数据源，质量/标准/安全/主数据/服务全部靠引用完整性收敛到 M1，杜绝「看板一套数据、目录另一套数据」。
- **数据元四层体系**：基础术语（词根库）→ 值域 → 参考数据 → 信息项；信息项命名由中文名**拆词翻译派生**（非手填），末位类词硬校验，命名口径机器可执行。
- **数据安全分级继承链**：分级定义（L1–L4）→ 信息项 → 字段（继承/自定义升级/冲突高亮），再上挂「数据安全分类目录」做字段级定位。
- **元数据比对**：比对生产库快照与设计态登记，自动产出未登记表 / 疑似下线表 / 字段漂移等差异清单。
- **一体两面**：同一套数据长出「管理平台」（治理工作台）+「数据资产门户」（业务消费入口）两个 SPA，右上角互跳。
- **服务端强制派生 + 防篡改**：信息项 code / nameEn / termIds、参考数据编号、主键均由服务端生成，PUT 剥离不可篡改字段，堵住客户端注入。
- **schemaVersion 版本迁移**：种子结构带版本号，持久化数据版本落后自动重种，消除「stale 数据掩盖新字段白屏」根因。
- **高覆盖测试**：103 个单测（`node --test`）+ 2 套端到端（Playwright）。

## 领域模型

20 个顶层实体：5 业务系统 / 5 数据库 / 5 业务域 / 10 数据表 / 51 字段 / 28 基础术语 / 6 值域 / 5 参考数据 / 10 信息项 / 8 质量规则 / 5 主数据 / 4 安全分级 / 13 安全分类 / 8 文件交换任务 / 3 生产元数据快照 / 5 数据服务 / 8 门户资产 / 4 门户申请 / 9 血缘边。

## 技术栈

| 类别 | 技术 |
|---|---|
| 前端 | React 18 + Vite 5（双 SPA 配置） |
| 后端 | Node.js + Express 5（JSON 文件落盘，无数据库） |
| 测试 | Node 内置 `node --test` + Playwright |
| 部署 | GitHub Actions（前端）+ systemd（后端）+ nginx（反代 / 静态） |
| 开发范式 | subagent-driven development + 对抗式审查 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动后端 API（Express，:8078，数据落盘 server/data.json）
npm run server

# 启动管理平台（另开终端，http://localhost:5173/data-asset-platform/）
npm run dev

# 启动数据资产门户（另开终端，http://localhost:5174/data-asset-portal/）
npm run dev:portal
```

> 提示：不启动后端时，前端自动降级为**种子数据只读展示**（不白屏）；启动后端后可进行元数据登记（新增/编辑/停用）。

```bash
# 单元测试
npm test

# 构建（管理平台 → dist/，门户 → dist-portal/）
npm run build
npm run build:portal

# 端到端冒烟测试（需先起 dev server + chromium）
npm run test:page      # 管理平台
npm run test:portal    # 门户
```

## 项目结构

```
├── src/                  # 前端源码
│   ├── data.js           # 种子数据（20 实体 + meta + schemaVersion）
│   ├── state.js          # tab 状态机（纯逻辑，不依赖 React）
│   ├── DataContext.jsx   # 数据层（种子兜底 + 拉后端 + 写后刷新）
│   ├── infoItemNaming.js # 信息项拆词翻译派生（纯函数）
│   ├── fieldSecurity.js  # 字段安全分级来源（纯函数）
│   ├── metadataCompare.js# 元数据比对（纯函数）
│   ├── bulkImport.js     # CSV 批量导入（表头对齐，纯函数）
│   ├── schema.js         # 表单 schema（schema 驱动）
│   ├── components/       # 通用组件（表单引擎 / 批量导入等）
│   ├── modules/          # 各功能模块页面
│   └── portal/           # 门户 SPA（独立入口）
├── server/               # 后端（Express 路由 + store 校验层 + JSON 落盘）
│   ├── app.js            # HTTP 路由薄封装
│   ├── store.js          # 校验 + 领域规则 + 持久化（纯 Node 可单测）
│   └── index.js          # 启动入口（:8078）
├── test/                 # 单测 + Playwright e2e
├── vite.config.js        # 管理平台构建配置
└── vite.portal.config.js # 门户构建配置
```

## 设计要点

- **纯函数与 React 解耦**：命名、分级、比对、导入等领域规则全部写成不依赖 React 的纯函数，可被 `node --test` 直接单测——这是高测试覆盖可维护的关键。
- **服务端信任边界**：结构校验（必填/唯一/枚举/类型/引用完整性）声明式配置在 `store.js`，派生字段全部服务端强制生成，客户端不可注入。
- **对抗式审查**：非平凡决策均经异血统模型独立审查，缺陷在 merge 前被拦下（如 BFS 多跳血缘误画、主键非 id 实体引用误报、批量导入列序错位等）。
