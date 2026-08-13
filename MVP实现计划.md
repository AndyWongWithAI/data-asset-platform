# 数据资源管理平台 MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: 用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现。步骤用 `- [ ]` checkbox 跟踪。

**Goal:** 交付一个「数据资源管理平台」React SPA 展示版 —— 左侧导航 + 右侧多 tab 工作区，实现 M1 资产目录 + M0 治理看板（质量/标准子看板），跑通「编目 → 治理监控」逻辑闭环。

**Architecture:** 单一 `src/data.js` 承载全部 mock 数据（10 表 + 字段三类元数据 + 跨模块引用），`src/state.js` 纯逻辑维护 tab 状态机与 `navigate` 跨模块转跳，React 组件只做渲染。数据与展示分离，引用完整性靠 `node --test` 兜底。

**Tech Stack:** React 18 + Vite 5（`base: /data-asset-platform/`），无 UI 库（手写 CSS），`node --test` 数据/状态单测 + playwright 页面冒烟。

## Global Constraints

- 部署子路径：Vite `base: '/data-asset-platform/'`，部署到 `demo.intelab.cn/data-asset-platform/`。
- 无 URL 路由（tab 导航在内存），无需 SPA history fallback。
- 测试命令：`npm test` 用 `node --test`（**不带目录参数**，Node 22 下带目录会 MODULE_NOT_FOUND）。
- 免责声明必须出现：`meta.disclaimer` = 「⚠ 参考模型声明：基于广东院公开业务信息构建的演示模型，非广东院实际部署、仅供演示。不虚构内部运营数据。」
- 引用完整性是硬约束：改任何 id 必须同步改引用，`test/data.test.mjs` 兜底。
- 依赖最小化：仅 react / react-dom / vite / @vitejs/plugin-react，不引入 Redux、UI 库、路由库。

---

## 文件结构

```
data-resource-platform/
├─ package.json                # scripts: dev/build/preview/test/test:page
├─ vite.config.js              # base + react 插件
├─ index.html                  # 挂载点
├─ .gitignore                  # node_modules/dist
├─ src/
│  ├─ main.jsx                 # 入口
│  ├─ App.jsx                  # 壳：HeaderBar + Sidebar + TabWorkspace
│  ├─ state.js                 # tab 状态机纯逻辑（node --test 可测）
│  ├─ data.js                  # mock 数据（ESM export default，双环境）
│  ├─ index.css                # 全局样式
│  ├─ components/
│  │  ├─ HeaderBar.jsx
│  │  ├─ Sidebar.jsx
│  │  ├─ TabWorkspace.jsx
│  │  ├─ Tag.jsx
│  │  ├─ ScoreGauge.jsx
│  │  ├─ FieldMetaCard.jsx
│  │  └─ DataTable.jsx
│  └─ modules/
│     ├─ CatalogModule.jsx     # M1 资产目录
│     ├─ GovernanceModule.jsx  # M0 治理看板（质量+标准子看板）
│     └─ PlaceholderModule.jsx # 占位页（M2–M6 复用）
├─ test/
│  ├─ data.test.mjs            # 引用完整性测试
│  └─ page_test.py             # 页面冒烟测试
└─ .github/workflows/deploy.yml # GH Actions 部署
```

---

## Task 1: 脚手架与配置

**Files:**
- Create: `.gitignore`、`package.json`、`vite.config.js`、`index.html`、`src/main.jsx`、`src/index.css`

- [ ] **Step 1: git init 并写 .gitignore**

```bash
cd /home/hq/data-resource-platform && git init -b main
```

`.gitignore` 内容：

```
node_modules/
dist/
```

- [ ] **Step 2: 写 package.json**

```json
{
  "name": "data-resource-platform",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test",
    "test:page": "python3 test/page_test.py"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.11"
  }
}
```

- [ ] **Step 3: 写 vite.config.js**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/data-asset-platform/',
  plugins: [react()],
});
```

- [ ] **Step 4: 写 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>数据资源管理平台 · GDEPDI 海上风电</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: 写 src/main.jsx 与 src/index.css（占位，App 后补）**

`src/main.jsx`：

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

`src/index.css`（最小布局，后续任务补充样式）：

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; color: #1f2329; background: #f5f6f7; }
#root { height: 100vh; }
```

- [ ] **Step 6: 安装依赖并验证 dev 启动**

```bash
npm install
```

预期：`npm install` 无报错。此时 `npm run dev` 会因缺 `App.jsx` 报错，属预期（Task 4 补齐）。

---

## Task 2: data.js 数据模型（TDD）

**Files:**
- Create: `test/data.test.mjs`、`src/data.js`

**Interfaces:**
- Produces: `src/data.js` 默认导出对象 `D`，字段见下方 schema。`test/data.test.mjs` 是引用完整性的唯一权威。

- [ ] **Step 1: 写失败测试 test/data.test.mjs**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/data.js';

const D = data;
const ids = (arr) => new Set(arr.map((x) => x.id));

test('applications/databases/tables 引用完整', () => {
  const appIds = ids(D.applications);
  const dbIds = ids(D.databases);
  const domainIds = ids(D.bizDomains);
  const subjectIds = new Set(D.bizDomains.flatMap((d) => d.subjects.map((s) => s.id)));
  const mdIds = ids(D.masterData);
  for (const db of D.databases) assert.ok(appIds.has(db.appId), `db ${db.id} appId ${db.appId} 不存在`);
  for (const t of D.tables) {
    assert.ok(appIds.has(t.appId), `table ${t.id} appId 不存在`);
    assert.ok(dbIds.has(t.dbId), `table ${t.id} dbId 不存在`);
    assert.ok(domainIds.has(t.bizDomainId), `table ${t.id} bizDomainId 不存在`);
    assert.ok(subjectIds.has(t.subjectId), `table ${t.id} subjectId 不存在`);
    if (t.masterDataId) assert.ok(mdIds.has(t.masterDataId), `table ${t.id} masterDataId 不存在`);
  }
});

test('fields 三类元数据齐全 + 引用完整', () => {
  const tableIds = ids(D.tables);
  const ruleIds = ids(D.qualityRules);
  const stdIds = ids(D.standards);
  const secLevels = new Set(D.security.map((s) => s.level));
  const mdIds = ids(D.masterData);
  for (const f of D.fields) {
    assert.ok(tableIds.has(f.tableId), `field ${f.id} tableId 不存在`);
    assert.ok(f.business?.code && f.business?.nameCn, `field ${f.id} 缺 business 元数据`);
    assert.ok(f.technical?.type, `field ${f.id} 缺 technical 元数据`);
    assert.ok(f.management?.securityLevel, `field ${f.id} 缺 management 元数据`);
    for (const rid of f.technical.qualityRuleIds || []) assert.ok(ruleIds.has(rid), `field ${f.id} ruleId ${rid} 不存在`);
    if (f.management.standardId) assert.ok(stdIds.has(f.management.standardId), `field ${f.id} standardId 不存在`);
    assert.ok(secLevels.has(f.management.securityLevel), `field ${f.id} securityLevel 不存在`);
    if (f.business.masterDataId) assert.ok(mdIds.has(f.business.masterDataId), `field ${f.id} masterDataId 不存在`);
  }
});

test('每张表至少 5 个字段', () => {
  for (const t of D.tables) {
    const count = D.fields.filter((f) => f.tableId === t.id).length;
    assert.ok(count >= 5, `table ${t.id} 只有 ${count} 字段，应 >= 5`);
  }
});

test('qualityRules/qualityResults 引用完整', () => {
  const fieldIds = ids(D.fields);
  const appIds = ids(D.applications);
  for (const r of D.qualityRules) assert.ok(fieldIds.has(r.targetFieldId), `rule ${r.id} targetFieldId 不存在`);
  for (const qr of D.qualityResults) {
    assert.ok(appIds.has(qr.appId), `qualityResult ${qr.id} appId 不存在`);
    for (const issue of qr.issues) {
      assert.ok(fieldIds.has(issue.fieldId), `issue ${issue.id} fieldId 不存在`);
      assert.ok(ids(D.qualityRules).has(issue.ruleId), `issue ${issue.id} ruleId 不存在`);
    }
  }
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL，`Cannot find module '../src/data.js'`（文件尚不存在）。

- [ ] **Step 3: 写 src/data.js**

**schema**（ESM `export default`，浏览器由 Vite 打包、Node 由 `node --test` 直接 import，双环境天然成立，替代兄弟案例的 IIFE）：

```js
const D = {
  meta: { title, subtitle, disclaimer, stats: { applications, databases, tables, fields, rules, standards, masterData } },
  applications: [{ id, name, desc }],
  databases:     [{ id, appId, name }],
  tables:        [{ id, appId, dbId, nameCn, nameEn, tableType, bizDomainId, subjectId, masterDataId?, desc }],
  fields:        [{ id, tableId, seq, business: { code, nameCn, definition, masterDataId?, masterDataType? }, technical: { type, length, isPK, isFK, qualityRuleIds?[] }, management: { standardId?, securityLevel, owner, updateFrequency } }],
  bizDomains:    [{ id, name, subjects: [{ id, name }] }],
  qualityRules:  [{ id, name, type, targetFieldId, expr, threshold, severity, status }],
  qualityResults:[{ id, appId, score, dimension, issues: [{ id, fieldId, ruleId, desc, severity }] }],
  standards:     [{ id, code, name, kind: 'code'|'field', values?[], fieldStd?{ name, type, unit, domain } }],
  security:      [{ level, name, desc, mask }],
  masterData:    [{ id, code, entityType, name, attrs }],
};
export default D;
```

**完整展开示例（1 表，作为其余 9 表的唯一形状范本）**：

```js
const D = {
  meta: {
    title: '数据资源管理平台 · GDEPDI 海上风电',
    subtitle: '数据资产目录 · 数据治理看板 —— 设计态/生产态两态分层的治理闭环演示',
    disclaimer: '⚠ 参考模型声明：基于广东院公开业务信息构建的演示模型，非广东院实际部署、仅供演示。不虚构内部运营数据。',
    stats: { applications: 5, databases: 5, tables: 10, fields: 0, rules: 8, standards: 6, masterData: 5 },
  },
  applications: [
    { id: 'app_res', name: '风资源评估系统', desc: '测风/气象数据采集与分析' },
    { id: 'app_survey', name: '海洋勘测系统', desc: '地质/测绘/岩土数据' },
    { id: 'app_design', name: '工程设计系统', desc: '风机/海缆/升压站设计' },
    { id: 'app_build', name: '施工管理系统', desc: '船机调度/作业进度' },
    { id: 'app_ops', name: '智慧运维系统', desc: 'SCADA 遥测/功率预测/备件' },
  ],
  databases: [
    { id: 'db_res', appId: 'app_res', name: '资源评估库' },
    { id: 'db_survey', appId: 'app_survey', name: '勘测库' },
    { id: 'db_design', appId: 'app_design', name: '设计库' },
    { id: 'db_build', appId: 'app_build', name: '施工库' },
    { id: 'db_ops', appId: 'app_ops', name: '运维库' },
  ],
  bizDomains: [
    { id: 'bd_resource', name: '资源评估域', subjects: [{ id: 'bs_wind', name: '测风' }] },
    { id: 'bd_survey', name: '勘测域', subjects: [{ id: 'bs_geo', name: '地质' }, { id: 'bs_topo', name: '测绘' }] },
    { id: 'bd_design', name: '设计域', subjects: [{ id: 'bs_device', name: '设备设计' }] },
    { id: 'bd_build', name: '工程建设域', subjects: [{ id: 'bs_schedule', name: '进度' }] },
    { id: 'bd_ops', name: '生产运营域', subjects: [{ id: 'bs_scada', name: '遥测' }, { id: 'bs_forecast', name: '功率预测' }, { id: 'bs_spare', name: '备件' }] },
  ],
  security: [
    { level: 'L1', name: '公开', desc: '可对外公开', mask: null },
    { level: 'L2', name: '内部', desc: '企业内部共享', mask: null },
    { level: 'L3', name: '敏感', desc: '受限共享，脱敏后使用', mask: '字段掩码/坐标偏移' },
    { level: 'L4', name: '涉密', desc: '涉密，导出受管控', mask: '坐标模糊化' },
  ],
  masterData: [
    { id: 'md_turbine', code: 'WTG-0001', entityType: '风机', name: 'MySE16-260', attrs: { 额定功率: '16MW', 叶轮直径: '260m' } },
    { id: 'md_cable', code: 'CBL-0001', entityType: '海缆', name: '500kV 三芯海缆', attrs: { 电压等级: '500kV', 截面: '1800mm²' } },
    { id: 'md_substation', code: 'SS-0001', entityType: '升压站', name: '青洲一二 500kV 海上升压站', attrs: { 主变容量: '2×450MVA', 接线方式: '四层甲板' } },
    { id: 'md_project', code: 'PRJ-0001', entityType: '项目', name: '阳江青洲一、二', attrs: { 规模: '1000MW', 阶段: '运维' } },
    { id: 'md_supplier', code: 'SUP-0001', entityType: '供应商', name: '明阳智能', attrs: { 资质: '整机商', 供货范围: '风机' } },
  ],
  standards: [
    { id: 'std_voltage', code: 'DL-01', name: '电压等级', kind: 'code', values: ['35kV', '66kV', '220kV', '500kV', '±500kV'] },
    { id: 'std_turbine', code: 'DL-02', name: '风机机型', kind: 'code', values: ['8MW', '12MW', '16MW', '16.6MW漂浮式'] },
    { id: 'std_foundation', code: 'DL-03', name: '基础型式', kind: 'code', values: ['单桩', '导管架', '多桩', '漂浮式'] },
    { id: 'std_sea_area', code: 'DL-04', name: '海域编码', kind: 'code', values: ['粤东', '粤西', '珠三角'] },
    { id: 'std_cable', code: 'DL-05', name: '海缆类型', kind: 'code', values: ['集电', '送出', '三芯', '单芯'] },
    { id: 'std_power', code: 'FD-01', name: '有功功率字段标准', kind: 'field', fieldStd: { name: 'active_power', type: 'decimal(5,2)', unit: 'MW', domain: '0~16' } },
  ],
  qualityRules: [
    { id: 'qr_001', name: 'SCADA 有功功率取值范围', type: '准确性', targetFieldId: 'f_scada_power', expr: '0 <= active_power <= 16', threshold: '100%', severity: '严重', status: '启用' },
    { id: 'qr_002', name: '测风风速取值越界', type: '准确性', targetFieldId: 'f_wind_speed', expr: '0 <= wind_speed <= 70', threshold: '100%', severity: '警告', status: '启用' },
    { id: 'qr_003', name: '测风数据完整性', type: '完整性', targetFieldId: 'f_wind_speed', expr: '风速字段非空率 >= 95%', threshold: '95%', severity: '警告', status: '启用' },
    { id: 'qr_004', name: '海缆监测温度一致性', type: '一致性', targetFieldId: 'f_cable_temp', expr: '温度与相邻测点偏差 <= 5℃', threshold: '100%', severity: '严重', status: '启用' },
    { id: 'qr_005', name: '功率预测及时性', type: '及时性', targetFieldId: 'f_forecast_time', expr: '预测结果产出延迟 <= 15min', threshold: '15min', severity: '提示', status: '启用' },
    { id: 'qr_006', name: '地质钻孔地层字段完整性', type: '完整性', targetFieldId: 'f_geo_stratum', expr: '地层编号非空率 = 100%', threshold: '100%', severity: '警告', status: '启用' },
    { id: 'qr_007', name: '主变油温阈值', type: '准确性', targetFieldId: 'f_sub_oil_temp', expr: '0 <= oil_temp <= 105', threshold: '100%', severity: '严重', status: '启用' },
    { id: 'qr_008', name: '备品备件库存准确性', type: '准确性', targetFieldId: 'f_spare_qty', expr: '库存数量 >= 0', threshold: '100%', severity: '提示', status: '启用' },
  ],
  tables: [
    // 全部 10 张表，见下方「10 表清单」。字段展开形状以本示例为准：
    { id: 't_wind', appId: 'app_res', dbId: 'db_res', nameCn: '测风数据表', nameEn: 'wind_measurement', tableType: '业务表', bizDomainId: 'bd_resource', subjectId: 'bs_wind', masterDataId: null, desc: '测风塔实测风速/风向/湍流' },
  ],
  fields: [
    { id: 'f_wind_speed', tableId: 't_wind', seq: 1,
      business: { code: 'WIND_SPEED', nameCn: '风速', definition: '测风塔 100m 高度实测平均风速', masterDataId: null, masterDataType: null },
      technical: { type: 'decimal(5,2)', length: 7, isPK: false, isFK: false, qualityRuleIds: ['qr_002', 'qr_003'] },
      management: { standardId: null, securityLevel: 'L2', owner: '资源评估组', updateFrequency: '10分钟' } },
    { id: 'f_wind_dir', tableId: 't_wind', seq: 2,
      business: { code: 'WIND_DIR', nameCn: '风向', definition: '主导风向（0~360°）', masterDataId: null, masterDataType: null },
      technical: { type: 'smallint', length: 4, isPK: false, isFK: false, qualityRuleIds: [] },
      management: { standardId: null, securityLevel: 'L2', owner: '资源评估组', updateFrequency: '10分钟' } },
    { id: 'f_wind_turbulence', tableId: 't_wind', seq: 3,
      business: { code: 'TURBULENCE', nameCn: '湍流强度', definition: '湍流强度等级', masterDataId: null, masterDataType: null },
      technical: { type: 'varchar(10)', length: 10, isPK: false, isFK: false, qualityRuleIds: [] },
      management: { standardId: null, securityLevel: 'L2', owner: '资源评估组', updateFrequency: '10分钟' } },
    { id: 'f_wind_time', tableId: 't_wind', seq: 4,
      business: { code: 'MEASURE_TIME', nameCn: '测量时间', definition: '数据采集时间戳', masterDataId: null, masterDataType: null },
      technical: { type: 'datetime', length: 0, isPK: true, isFK: false, qualityRuleIds: [] },
      management: { standardId: null, securityLevel: 'L2', owner: '资源评估组', updateFrequency: '10分钟' } },
    { id: 'f_wind_project', tableId: 't_wind', seq: 5,
      business: { code: 'PROJECT_ID', nameCn: '所属项目', definition: '测风塔所属海上风电项目', masterDataId: 'md_project', masterDataType: '项目' },
      technical: { type: 'varchar(32)', length: 32, isPK: false, isFK: true, qualityRuleIds: [] },
      management: { standardId: null, securityLevel: 'L2', owner: '资源评估组', updateFrequency: '静态' } },
  ],
  qualityResults: [
    { id: 'qres_app_res', appId: 'app_res', score: 92, dimension: '完整性', issues: [
      { id: 'issue_001', fieldId: 'f_wind_speed', ruleId: 'qr_003', desc: '2026-07 有 3 个 10 分钟区间风速缺失', severity: '警告' },
    ]},
    { id: 'qres_app_ops', appId: 'app_ops', score: 78, dimension: '准确性', issues: [
      { id: 'issue_002', fieldId: 'f_scada_power', ruleId: 'qr_001', desc: '6 台机组有功功率越界（>16MW）', severity: '严重' },
    ]},
  ],
};
export default D;
```

**剩余 9 表字段清单**（执行者按上例形状展开为 `tables[]` + `fields[]`，字段 `seq` 递增；下表每一行 = 一个 `field` 记录，`标准/规则/分级/主数据` 列直接决定 `management.standardId / technical.qualityRuleIds / management.securityLevel / business.masterDataId`）：

| 表 id | 表名 | 字段 id | 字段(code/名) | 类型 | 标准 | 质量规则 | 分级 | 主数据 |
|-------|------|---------|--------------|------|------|---------|------|--------|
| t_geo | 地质钻孔表 | f_geo_stratum | STRATUM/地层编号 | varchar(20) | — | qr_006 | L3 | — |
| t_geo | | f_geo_depth | DEPTH/钻孔深度 | decimal(6,1) | — | — | L3 | — |
| t_geo | | f_geo_soil | SOIL_TYPE/土质类型 | varchar(20) | — | — | L3 | — |
| t_geo | | f_geo_bearing | BEARING/桩基持力层 | varchar(20) | — | — | L3 | — |
| t_geo | | f_geo_project | PROJECT_ID/所属项目 | varchar(32) | — | — | L3 | md_project |
| t_topo | 海底地形测绘表 | f_topo_coord | COORD/坐标 | varchar(40) | std_sea_area | — | L4 | — |
| t_topo | | f_topo_depth | WATER_DEPTH/水深 | decimal(6,1) | — | — | L3 | — |
| t_topo | | f_topo_survey | SURVEY_DATE/测绘日期 | date | — | — | L3 | — |
| t_topo | | f_topo_route | CABLE_ROUTE/海缆路由 | varchar(64) | — | — | L3 | — |
| t_topo | | f_topo_project | PROJECT_ID/所属项目 | varchar(32) | — | — | L3 | md_project |
| t_turbine | 风机设备表 | f_turbine_model | MODEL/机型 | varchar(20) | std_turbine | — | L2 | — |
| t_turbine | | f_turbine_md | MD_ID/主数据编码 | varchar(32) | — | — | L2 | md_turbine |
| t_turbine | | f_turbine_power | RATED_POWER/额定功率 | decimal(5,2) | std_power | — | L2 | — |
| t_turbine | | f_turbine_foundation | FOUNDATION/基础型式 | varchar(20) | std_foundation | — | L2 | — |
| t_turbine | | f_turbine_supplier | SUPPLIER_ID/供应商 | varchar(32) | — | — | L2 | md_supplier |
| t_turbine | | f_turbine_project | PROJECT_ID/所属项目 | varchar(32) | — | — | L2 | md_project |
| t_cable | 海缆参数表 | f_cable_type | TYPE/海缆类型 | varchar(20) | std_cable | — | L3 | — |
| t_cable | | f_cable_md | MD_ID/主数据编码 | varchar(32) | — | — | L3 | md_cable |
| t_cable | | f_cable_voltage | VOLTAGE/电压等级 | varchar(10) | std_voltage | — | L3 | — |
| t_cable | | f_cable_temp | MONITOR_TEMP/监测温度 | decimal(5,1) | — | qr_004 | L3 | — |
| t_cable | | f_cable_route | ROUTE/路由坐标 | varchar(64) | — | — | L3 | — |
| t_substation | 升压站主变表 | f_sub_md | MD_ID/主数据编码 | varchar(32) | — | — | L2 | md_substation |
| t_substation | | f_sub_capacity | CAPACITY/主变容量 | varchar(20) | — | — | L2 | — |
| t_substation | | f_sub_voltage | VOLTAGE/电压等级 | varchar(10) | std_voltage | — | L2 | — |
| t_substation | | f_sub_oil_temp | OIL_TEMP/油温 | decimal(5,1) | — | qr_007 | L2 | — |
| t_substation | | f_sub_project | PROJECT_ID/所属项目 | varchar(32) | — | — | L2 | md_project |
| t_progress | 作业进度表 | f_prog_task | TASK/作业任务 | varchar(64) | — | — | L2 | — |
| t_progress | | f_prog_progress | PROGRESS/进度百分比 | tinyint | — | — | L2 | — |
| t_progress | | f_prog_vessel | VESSEL/船机 | varchar(32) | — | — | L2 | — |
| t_progress | | f_prog_seastate | SEA_STATE/海况 | varchar(20) | — | — | L2 | — |
| t_progress | | f_prog_project | PROJECT_ID/所属项目 | varchar(32) | — | — | L2 | md_project |
| t_scada | SCADA 遥测表 | f_scada_power | ACTIVE_POWER/有功功率 | decimal(5,2) | std_power | qr_001 | L2 | — |
| t_scada | | f_scada_turbine | TURBINE_ID/机组 | varchar(32) | — | — | L2 | md_turbine |
| t_scada | | f_scada_temp | TEMP/温度 | decimal(5,1) | — | — | L2 | — |
| t_scada | | f_scada_vibration | VIBRATION/振动 | decimal(6,2) | — | — | L2 | — |
| t_scada | | f_scada_time | TS/时间戳 | datetime | — | — | L2 | — |
| t_forecast | 功率预测结果表 | f_forecast_time | FORECAST_TIME/预测时间 | datetime | — | qr_005 | L2 | — |
| t_forecast | | f_forecast_power | PREDICT_POWER/预测功率 | decimal(5,2) | std_power | — | L2 | — |
| t_forecast | | f_forecast_project | PROJECT_ID/所属项目 | varchar(32) | — | — | L2 | md_project |
| t_forecast | | f_forecast_accuracy | ACCURACY/预测精度 | decimal(4,2) | — | — | L2 | — |
| t_forecast | | f_forecast_model | MODEL/算法模型 | varchar(32) | — | — | L2 | — |
| t_spare | 备品备件表 | f_spare_name | NAME/备件名称 | varchar(64) | — | — | L2 | — |
| t_spare | | f_spare_qty | QTY/库存数量 | int | — | qr_008 | L2 | — |
| t_spare | | f_spare_turbine | TURBINE_ID/适配机型 | varchar(32) | std_turbine | — | L2 | — |
| t_spare | | f_spare_supplier | SUPPLIER_ID/供应商 | varchar(32) | — | — | L2 | md_supplier |
| t_spare | | f_spare_project | PROJECT_ID/所属项目 | varchar(32) | — | — | L2 | md_project |

> 注意：`tables[]` 中 `t_wind` 已在上例写出，其余 9 表按 `appId/dbId/bizDomainId/subjectId/masterDataId` 填（nameEn 按表名直译，`desc` 写一句中文描述，`tableType` 均 `'业务表'`，t_scada 可填 `'技术表'`，不影响测试）：
>
> | id | nameEn | appId | dbId | bizDomainId | subjectId | masterDataId |
> |----|--------|-------|------|-------------|-----------|--------------|
> | t_geo | geological_borehole | app_survey | db_survey | bd_survey | bs_geo | null |
> | t_topo | seabed_topography | app_survey | db_survey | bd_survey | bs_topo | null |
> | t_turbine | turbine_device | app_design | db_design | bd_design | bs_device | md_turbine |
> | t_cable | submarine_cable | app_design | db_design | bd_design | bs_device | md_cable |
> | t_substation | substation_transformer | app_design | db_design | bd_design | bs_device | md_substation |
> | t_progress | construction_progress | app_build | db_build | bd_build | bs_schedule | md_project |
> | t_scada | scada_telemetry | app_ops | db_ops | bd_ops | bs_scada | null |
> | t_forecast | power_forecast | app_ops | db_ops | bd_ops | bs_forecast | md_project |
> | t_spare | spare_parts | app_ops | db_ops | bd_ops | bs_spare | null |
>
> 字段的 `business.definition` 写一句简短定义（据「字段名」直译即可，如 DEPTH/钻孔深度 → "钻孔深度"），`masterDataId` 为 null 的字段填 null。`meta.stats.fields` 在所有字段写完后改成真实字段总数（或删掉该 key，测试不校验）。

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: 全部 PASS（0 fail）。

- [ ] **Step 5: 提交**

```bash
git add test/data.test.mjs src/data.js
git commit -m "feat: 数据模型 data.js + 引用完整性测试"
```

---

## Task 3: state.js tab 状态机（TDD）

**Files:**
- Create: `test/state.test.mjs`、`src/state.js`

**Interfaces:**
- Produces: `MODULE_GROUPS`（数组，含 `name` + `items[{key,title,implemented}]`）、`createInitialState()`、`openTab(state, moduleKey)`、`closeTab(state, tabId)`、`activateTab(state, tabId)`、`navigate(state, moduleKey, assetId)`。全部纯函数，无 React 依赖。

- [ ] **Step 1: 写失败测试 test/state.test.mjs**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULE_GROUPS, createInitialState, openTab, closeTab, navigate } from '../src/state.js';

test('MODULE_GROUPS 含 7 模块且 catalog/governance 已实现', () => {
  const keys = MODULE_GROUPS.flatMap((g) => g.items.map((i) => i.key));
  assert.equal(keys.length, 7);
  const m = Object.fromEntries(MODULE_GROUPS.flatMap((g) => g.items).map((i) => [i.key, i]));
  assert.equal(m.catalog.implemented, true);
  assert.equal(m.governance.implemented, true);
  assert.equal(m.quality.implemented, false);
});

test('openTab 首次打开追加并激活，重复打开不重复追加', () => {
  let s = createInitialState();
  s = openTab(s, 'catalog');
  assert.equal(s.tabs.length, 1);
  assert.equal(s.activeTabId, 1);
  s = openTab(s, 'governance');
  s = openTab(s, 'catalog');
  assert.equal(s.tabs.length, 2);
  assert.equal(s.activeTabId, 1);
});

test('closeTab 关闭激活 tab 后激活相邻', () => {
  let s = createInitialState();
  s = openTab(s, 'catalog');
  s = openTab(s, 'governance');
  s = openTab(s, 'quality');
  s = closeTab(s, 3);
  assert.equal(s.tabs.length, 2);
  assert.equal(s.activeTabId, 2);
});

test('navigate 写入 assetId 并激活，不重复建 tab', () => {
  let s = createInitialState();
  s = navigate(s, 'catalog', { tableId: 't_wind', fieldId: 'f_wind_speed' });
  assert.equal(s.tabs.length, 1);
  assert.deepEqual(s.tabs[0].assetId, { tableId: 't_wind', fieldId: 'f_wind_speed' });
  s = navigate(s, 'catalog', { tableId: 't_geo' });
  assert.equal(s.tabs.length, 1);
  assert.deepEqual(s.tabs[0].assetId, { tableId: 't_geo' });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL（`Cannot find module '../src/state.js'`）。

- [ ] **Step 3: 写 src/state.js**

```js
// tab 状态机纯逻辑，不依赖 React，可 node --test
export const MODULE_GROUPS = [
  { name: '生产态·监控', items: [{ key: 'governance', title: '数据治理看板', implemented: true }] },
  { name: '设计态·定义', items: [
    { key: 'catalog', title: '数据资产目录', implemented: true },
    { key: 'quality', title: '数据质量', implemented: false },
    { key: 'standard', title: '数据标准', implemented: false },
    { key: 'security', title: '数据安全', implemented: false },
    { key: 'masterdata', title: '主数据', implemented: false },
  ]},
  { name: '价值输出', items: [{ key: 'service', title: '数据服务', implemented: false }] },
];

export const MODULES = MODULE_GROUPS.flatMap((g) => g.items);

export function createInitialState() {
  return { tabs: [], activeTabId: null, nextTabId: 1 };
}

export function openTab(state, moduleKey) {
  const mod = MODULES.find((m) => m.key === moduleKey);
  if (!mod) return state;
  const existing = state.tabs.find((t) => t.moduleKey === moduleKey);
  if (existing) return { ...state, activeTabId: existing.id };
  const id = state.nextTabId;
  return {
    tabs: [...state.tabs, { id, moduleKey, title: mod.title, assetId: null }],
    activeTabId: id,
    nextTabId: state.nextTabId + 1,
  };
}

export function closeTab(state, tabId) {
  const idx = state.tabs.findIndex((t) => t.id === tabId);
  if (idx === -1) return state;
  const tabs = state.tabs.filter((t) => t.id !== tabId);
  let activeTabId = state.activeTabId;
  if (activeTabId === tabId) {
    const next = state.tabs[idx + 1] || state.tabs[idx - 1];
    activeTabId = next ? next.id : null;
  }
  return { ...state, tabs, activeTabId };
}

export function activateTab(state, tabId) {
  return { ...state, activeTabId: tabId };
}

export function navigate(state, moduleKey, assetId = null) {
  const mod = MODULES.find((m) => m.key === moduleKey);
  if (!mod) return state;
  const existing = state.tabs.find((t) => t.moduleKey === moduleKey);
  let next = state;
  let tabId;
  if (existing) {
    tabId = existing.id;
  } else {
    next = openTab(state, moduleKey);
    tabId = next.activeTabId;
  }
  return {
    ...next,
    tabs: next.tabs.map((t) => (t.id === tabId ? { ...t, assetId } : t)),
    activeTabId: tabId,
  };
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: 全部 PASS（data 5 项 + state 4 项）。

- [ ] **Step 5: 提交**

```bash
git add test/state.test.mjs src/state.js
git commit -m "feat: tab 状态机 state.js + 单测"
```

---

## Task 4: App 壳（HeaderBar + Sidebar + TabWorkspace）

**Files:**
- Create: `src/App.jsx`、`src/components/HeaderBar.jsx`、`src/components/Sidebar.jsx`、`src/components/TabWorkspace.jsx`、`src/components/Tag.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `state.js` 的 `MODULE_GROUPS`/`createInitialState`/`openTab`/`closeTab`/`activateTab`/`navigate`。
- Produces: `<App/>` 提供 `dispatch` 给子组件；`Sidebar` 收 `groups`/`activeModuleKey`/`onOpen(moduleKey)`；`TabWorkspace` 收 `state`/`dispatch`；`TabWorkspace` 内按 `moduleKey` 渲染模块（Task 5/6/7 提供模块组件，本任务先用占位 `<div>` 顶替，Task 5-7 替换）。

- [ ] **Step 1: 写 src/App.jsx**

```jsx
import { useReducer } from 'react';
import { MODULE_GROUPS, createInitialState, openTab, closeTab, activateTab, navigate } from './state.js';
import HeaderBar from './components/HeaderBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import TabWorkspace from './components/TabWorkspace.jsx';

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN': return openTab(state, action.moduleKey);
    case 'CLOSE': return closeTab(state, action.tabId);
    case 'ACTIVATE': return activateTab(state, action.tabId);
    case 'NAVIGATE': return navigate(state, action.moduleKey, action.assetId);
    default: return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
  return (
    <div className="app">
      <HeaderBar />
      <div className="app-body">
        <Sidebar
          groups={MODULE_GROUPS}
          activeModuleKey={activeTab?.moduleKey ?? null}
          onOpen={(m) => dispatch({ type: 'OPEN', moduleKey: m })}
        />
        <TabWorkspace state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 写 src/components/HeaderBar.jsx**

```jsx
import data from '../data.js';

export default function HeaderBar() {
  return (
    <header className="header">
      <div className="header-title">
        <h1>{data.meta.title}</h1>
        <span className="header-subtitle">{data.meta.subtitle}</span>
      </div>
      <span className="header-disclaimer" title={data.meta.disclaimer}>⚠ 演示模型</span>
    </header>
  );
}
```

- [ ] **Step 3: 写 src/components/Tag.jsx**

```jsx
export default function Tag({ children, tone = 'default' }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}
```

- [ ] **Step 4: 写 src/components/Sidebar.jsx**

```jsx
export default function Sidebar({ groups, activeModuleKey, onOpen }) {
  return (
    <nav className="sidebar">
      {groups.map((group) => (
        <div className="sidebar-group" key={group.name}>
          <div className="sidebar-group-name">{group.name}</div>
          {group.items.map((item) => (
            <button
              key={item.key}
              className={`sidebar-item${item.key === activeModuleKey ? ' active' : ''}`}
              onClick={() => onOpen(item.key)}
            >
              <span>{item.title}</span>
              {!item.implemented && <span className="badge-2nd">二期</span>}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}
```

- [ ] **Step 5: 写 src/components/TabWorkspace.jsx（模块先占位）**

```jsx
export default function TabWorkspace({ state, dispatch }) {
  const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
  return (
    <div className="workspace">
      <div className="tabbar">
        {state.tabs.map((t) => (
          <div
            key={t.id}
            className={`tab${t.id === state.activeTabId ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'ACTIVATE', tabId: t.id })}
          >
            <span>{t.title}</span>
            <button className="tab-close" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CLOSE', tabId: t.id }); }}>✕</button>
          </div>
        ))}
      </div>
      <div className="tab-panel">
        {activeTab
          ? <div className="module-placeholder">{activeTab.title}（模块内容由 Task 5-7 提供）</div>
          : <div className="empty-hint">点击左侧导航打开模块</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: 补 src/index.css 布局样式**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; color: #1f2329; background: #f5f6f7; }
#root { height: 100vh; }
.app { display: flex; flex-direction: column; height: 100vh; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 0 16px; height: 52px; background: #1f2329; color: #fff; }
.header-title h1 { font-size: 16px; font-weight: 600; display: inline; margin-right: 12px; }
.header-subtitle { font-size: 12px; color: #b6bcc6; }
.header-disclaimer { font-size: 12px; color: #e6a23c; cursor: default; }
.app-body { display: flex; flex: 1; overflow: hidden; }
.sidebar { width: 200px; background: #fff; border-right: 1px solid #e5e6eb; overflow-y: auto; }
.sidebar-group-name { padding: 12px 16px 4px; font-size: 12px; color: #86909c; }
.sidebar-item { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 10px 16px; border: none; background: none; text-align: left; cursor: pointer; font-size: 14px; color: #1f2329; }
.sidebar-item.active { background: #e8f3ff; color: #165dff; border-right: 2px solid #165dff; }
.badge-2nd { font-size: 11px; color: #86909c; border: 1px solid #c9cdd4; border-radius: 2px; padding: 0 4px; }
.workspace { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.tabbar { display: flex; height: 36px; background: #fff; border-bottom: 1px solid #e5e6eb; }
.tab { display: flex; align-items: center; gap: 8px; padding: 0 12px; border-right: 1px solid #e5e6eb; cursor: pointer; font-size: 13px; color: #4e5969; }
.tab.active { background: #f5f6f7; color: #165dff; font-weight: 600; }
.tab-close { border: none; background: none; cursor: pointer; color: #86909c; }
.tab-panel { flex: 1; overflow: auto; padding: 16px; }
.empty-hint, .module-placeholder { color: #86909c; padding: 40px; text-align: center; }
.tag { display: inline-block; padding: 1px 8px; border-radius: 2px; font-size: 12px; }
.tag-default { background: #f2f3f5; color: #4e5969; }
.tag-warn { background: #fff7e6; color: #d46b08; }
.tag-danger { background: #ffece8; color: #cb272d; }
.tag-ok { background: #e8ffea; color: #0e8a16; }
```

- [ ] **Step 7: 构建验证**

Run: `npm run build`
Expected: 构建成功，输出 `dist/`。`npm run dev` 可见壳 + 占位模块。

- [ ] **Step 8: 提交**

```bash
git add -A
git commit -m "feat: App 壳（Header/Sidebar/TabWorkspace）+ 布局样式"
```

---

## Task 5: M1 资产目录（CatalogModule）

**Files:**
- Create: `src/modules/CatalogModule.jsx`、`src/components/FieldMetaCard.jsx`
- Modify: `src/components/TabWorkspace.jsx`（渲染 catalog → CatalogModule）

**Interfaces:**
- Consumes: `data.js`；`TabWorkspace` 传入 `assetId` 与 `onNavigate(moduleKey, assetId)`。
- Produces: `CatalogModule` 默认导出，props `{ assetId, onNavigate }`。检索 + 表列表 + 表详情（字段元数据）。

- [ ] **Step 1: 写 src/components/FieldMetaCard.jsx**

```jsx
import data from '../data.js';
import Tag from './Tag.jsx';

const LEVEL_TONE = { L1: 'ok', L2: 'default', L3: 'warn', L4: 'danger' };

export default function FieldMetaCard({ field, onNavigate }) {
  const rules = (field.technical.qualityRuleIds || [])
    .map((id) => data.qualityRules.find((r) => r.id === id)).filter(Boolean);
  const std = field.management.standardId
    ? data.standards.find((s) => s.id === field.management.standardId) : null;
  const md = field.business.masterDataId
    ? data.masterData.find((m) => m.id === field.business.masterDataId) : null;
  const sec = data.security.find((s) => s.level === field.management.securityLevel);
  return (
    <div className="field-card">
      <div className="field-card-head">
        <strong>{field.business.nameCn}</strong>
        <code>{field.business.code}</code>
        <Tag tone={LEVEL_TONE[field.management.securityLevel] || 'default'}>
          {field.management.securityLevel} {sec?.name}
        </Tag>
      </div>
      <div className="field-card-meta">
        <div><label>业务</label><span>{field.business.definition || '—'}</span>
          {md && <Tag>主数据:{md.name}</Tag>}</div>
        <div><label>技术</label><span>{field.technical.type}{field.technical.isPK ? ' · 主键' : ''}{field.technical.isFK ? ' · 外键' : ''}</span></div>
        <div><label>管理</label><span>责任人:{field.management.owner} · 更新:{field.management.updateFrequency}</span></div>
        <div><label>关联规则</label>
          {rules.length ? rules.map((r) => (
            <button key={r.id} className="link" onClick={() => onNavigate('governance', { ruleId: r.id })}>{r.name}</button>
          )) : <span>—</span>}
        </div>
        <div><label>关联标准</label>{std ? <span>{std.name}（{std.code}）</span> : <span>—</span>}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 写 src/modules/CatalogModule.jsx**

```jsx
import { useState } from 'react';
import data from '../data.js';
import FieldMetaCard from '../components/FieldMetaCard.jsx';

export default function CatalogModule({ assetId, onNavigate }) {
  const [keyword, setKeyword] = useState('');
  const [selectedTableId, setSelectedTableId] = useState(assetId?.tableId ?? null);

  const filtered = data.tables.filter((t) => {
    if (!keyword) return true;
    const app = data.applications.find((a) => a.id === t.appId)?.name || '';
    return t.nameCn.includes(keyword) || t.nameEn.includes(keyword) || app.includes(keyword);
  });

  const selected = data.tables.find((t) => t.id === selectedTableId);
  const fields = selected ? data.fields.filter((f) => f.tableId === selected.id) : [];

  return (
    <div className="catalog">
      <div className="search-bar">
        <input placeholder="检索应用 / 库 / 表名…" value={keyword}
          onChange={(e) => setKeyword(e.target.value)} />
      </div>
      <div className="catalog-layout">
        <table className="table">
          <thead><tr><th>表名</th><th>应用</th><th>库</th><th>业务域</th></tr></thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className={t.id === selectedTableId ? 'row-active' : ''}
                onClick={() => setSelectedTableId(t.id)}>
                <td>{t.nameCn}<span className="en">{t.nameEn}</span></td>
                <td>{data.applications.find((a) => a.id === t.appId)?.name}</td>
                <td>{data.databases.find((d) => d.id === t.dbId)?.name}</td>
                <td>{data.bizDomains.find((b) => b.id === t.bizDomainId)?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {selected && (
          <div className="detail">
            <h3>{selected.nameCn}</h3>
            <p className="en">{selected.nameEn} · {selected.tableType} · {selected.desc}</p>
            {fields.map((f) => (
              <FieldMetaCard key={f.id} field={f} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TabWorkspace 渲染 CatalogModule**

修改 `src/components/TabWorkspace.jsx`：引入 `CatalogModule`，`activeTab.moduleKey === 'catalog'` 时渲染 `<CatalogModule assetId={activeTab.assetId} onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />`。其余 module 暂保持占位。

- [ ] **Step 4: 补样式（table/detail/field-card/search-bar）**

在 `src/index.css` 追加：

```css
.search-bar input { width: 100%; max-width: 480px; padding: 8px 12px; border: 1px solid #c9cdd4; border-radius: 4px; }
.catalog-layout { display: flex; gap: 16px; margin-top: 12px; }
.table { border-collapse: collapse; background: #fff; flex: 1; }
.table th, .table td { border: 1px solid #e5e6eb; padding: 8px 12px; font-size: 13px; text-align: left; }
.table .en { color: #86909c; font-size: 12px; margin-left: 8px; }
.table tbody tr { cursor: pointer; }
.table tbody tr.row-active { background: #e8f3ff; }
.detail { flex: 1.2; }
.detail h3 { margin-bottom: 4px; }
.detail .en { color: #86909c; font-size: 12px; margin-bottom: 12px; }
.field-card { border: 1px solid #e5e6eb; border-radius: 4px; padding: 10px 12px; margin-bottom: 8px; background: #fff; }
.field-card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.field-card-meta div { display: flex; gap: 8px; font-size: 12px; margin: 3px 0; color: #4e5969; }
.field-card-meta label { width: 56px; color: #86909c; flex-shrink: 0; }
.link { border: none; background: none; color: #165dff; cursor: pointer; font-size: 12px; padding: 0; }
```

- [ ] **Step 5: 构建验证**

Run: `npm run build`
Expected: 构建成功。`npm run dev` 打开「数据资产目录」可见检索 + 表列表 + 点击表显示字段元数据。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: M1 资产目录（检索 + 表列表 + 字段元数据）"
```

---

## Task 6: M0 治理看板（GovernanceModule）

**Files:**
- Create: `src/modules/GovernanceModule.jsx`、`src/components/ScoreGauge.jsx`
- Modify: `src/components/TabWorkspace.jsx`（渲染 governance → GovernanceModule）

**Interfaces:**
- Consumes: `data.js` 的 `qualityResults`、`standards`、`applications`、`fields`；`onNavigate(moduleKey, assetId)` 转跳回目录。
- Produces: `GovernanceModule` 默认导出，props `{ assetId, onNavigate }`。内含「质量子看板」「标准子看板」两个子视图。

- [ ] **Step 1: 写 src/components/ScoreGauge.jsx**

```jsx
export default function ScoreGauge({ score }) {
  const tone = score >= 90 ? 'ok' : score >= 80 ? 'default' : 'warn';
  return (
    <div className={`gauge gauge-${tone}`}>
      <div className="gauge-num">{score}</div>
      <div className="gauge-label">分</div>
    </div>
  );
}
```

- [ ] **Step 2: 写 src/modules/GovernanceModule.jsx**

```jsx
import { useState } from 'react';
import data from '../data.js';
import ScoreGauge from '../components/ScoreGauge.jsx';
import Tag from '../components/Tag.jsx';

export default function GovernanceModule({ onNavigate }) {
  const [sub, setSub] = useState('quality');
  return (
    <div className="governance">
      <div className="sub-tabs">
        <button className={sub === 'quality' ? 'sub-active' : ''} onClick={() => setSub('quality')}>数据质量子看板</button>
        <button className={sub === 'standard' ? 'sub-active' : ''} onClick={() => setSub('standard')}>数据标准子看板</button>
        <button disabled title="二期">数据血缘子看板（二期）</button>
      </div>
      {sub === 'quality' ? <QualityBoard onNavigate={onNavigate} /> : <StandardBoard onNavigate={onNavigate} />}
    </div>
  );
}

function QualityBoard({ onNavigate }) {
  return (
    <div>
      <h3>企业整体数据质量评分</h3>
      {data.qualityResults.map((r) => {
        const app = data.applications.find((a) => a.id === r.appId);
        return (
          <div key={r.id} className="score-row">
            <ScoreGauge score={r.score} />
            <div className="score-info">
              <strong>{app?.name}</strong>
              <span>维度：{r.dimension}</span>
            </div>
            <div className="issues">
              {r.issues.map((issue) => {
                const f = data.fields.find((x) => x.id === issue.fieldId);
                const rule = data.qualityRules.find((x) => x.id === issue.ruleId);
                return (
                  <div key={issue.id} className="issue">
                    <Tag tone={issue.severity === '严重' ? 'danger' : 'warn'}>{issue.severity}</Tag>
                    <span>{issue.desc}</span>
                    <button className="link" onClick={() => onNavigate('catalog', { tableId: f?.tableId, fieldId: issue.fieldId })}>
                      定位字段 {f?.business.nameCn} · {rule?.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StandardBoard({ onNavigate }) {
  // 贯标率 = 已关联标准的字段数 / 应贯字段数（简化：全部字段）
  const fields = data.fields;
  const applied = fields.filter((f) => f.management.standardId);
  const rate = Math.round((applied.length / fields.length) * 100);
  return (
    <div>
      <h3>企业整体贯标情况</h3>
      <div className="score-row">
        <ScoreGauge score={rate} />
        <div className="score-info"><strong>字段级贯标率</strong><span>已贯 {applied.length} / {fields.length} 字段</span></div>
      </div>
      <h3>应贯未贯字段明细</h3>
      <table className="table">
        <thead><tr><th>字段</th><th>所属表</th><th>安全分级</th><th>操作</th></tr></thead>
        <tbody>
          {fields.filter((f) => !f.management.standardId).map((f) => {
            const t = data.tables.find((x) => x.id === f.tableId);
            return (
              <tr key={f.id}>
                <td>{f.business.nameCn}</td>
                <td>{t?.nameCn}</td>
                <td>{f.management.securityLevel}</td>
                <td><button className="link" onClick={() => onNavigate('catalog', { tableId: f.tableId, fieldId: f.id })}>定位</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: TabWorkspace 渲染 GovernanceModule**

修改 `src/components/TabWorkspace.jsx`：引入 `GovernanceModule`，`activeTab.moduleKey === 'governance'` 时渲染 `<GovernanceModule assetId={activeTab.assetId} onNavigate={(moduleKey, assetId) => dispatch({ type: 'NAVIGATE', moduleKey, assetId })} />`。

- [ ] **Step 4: 补样式**

```css
.sub-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.sub-tabs button { padding: 6px 14px; border: 1px solid #c9cdd4; background: #fff; border-radius: 4px; cursor: pointer; }
.sub-tabs button.sub-active { background: #165dff; color: #fff; border-color: #165dff; }
.sub-tabs button:disabled { color: #c9cdd4; cursor: not-allowed; }
.score-row { display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid #e5e6eb; border-radius: 4px; padding: 12px 16px; margin-bottom: 12px; }
.score-info { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
.score-info span { color: #86909c; }
.issues { flex: 1; }
.issue { display: flex; align-items: center; gap: 8px; font-size: 13px; margin: 4px 0; }
.gauge { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; background: #f2f3f5; }
.gauge-ok { background: #e8ffea; color: #0e8a16; }
.gauge-warn { background: #fff7e6; color: #d46b08; }
.gauge-num { font-size: 20px; font-weight: 700; }
.gauge-label { font-size: 12px; }
```

- [ ] **Step 5: 构建验证**

Run: `npm run build`
Expected: 构建成功。`npm run dev` 打开「数据治理看板」→ 质量/标准子看板，点「定位字段」应转跳并激活「数据资产目录」tab 且定位到对应表/字段。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: M0 治理看板（质量+标准子看板 + 跨模块转跳）"
```

---

## Task 7: 占位模块 + 收尾

**Files:**
- Create: `src/modules/PlaceholderModule.jsx`
- Modify: `src/components/TabWorkspace.jsx`（未实现模块 → PlaceholderModule）

**Interfaces:**
- Consumes: `MODULE_GROUPS`（拿 title）。
- Produces: `PlaceholderModule` props `{ moduleKey }`，渲染定位说明 + 二期提示。

- [ ] **Step 1: 写 src/modules/PlaceholderModule.jsx**

```jsx
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
```

- [ ] **Step 2: TabWorkspace 兜底渲染占位页**

修改 `src/components/TabWorkspace.jsx`：`catalog`/`governance` 之外的 moduleKey 渲染 `<PlaceholderModule moduleKey={activeTab.moduleKey} />`。

- [ ] **Step 3: 补样式**

```css
.placeholder { background: #fff; border: 1px solid #e5e6eb; border-radius: 4px; padding: 24px; }
.placeholder h3 { margin-bottom: 12px; }
.placeholder-pos { color: #4e5969; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
.placeholder-note { color: #d46b08; font-size: 13px; }
```

- [ ] **Step 4: 构建验证**

Run: `npm run build`
Expected: 构建成功。`npm run dev` 点击「数据质量」等占位模块显示定位说明 + 二期提示，侧栏有「二期」badge。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: 占位模块（定位说明 + 二期提示）"
```

---

## Task 8: 页面冒烟测试（playwright）

**Files:**
- Create: `test/page_test.py`

**Interfaces:**
- Consumes: 运行中的 dev server（`npm run dev`）或 `npm run preview`。
- Produces: `npm run test:page` 冒烟脚本，验证壳 + 两模块 + 占位页渲染、tab 打开/关闭、跨模块转跳。

- [ ] **Step 1: 写 test/page_test.py**

```python
import os
import subprocess
import sys
import time
import urllib.request

BASE = os.environ.get('BASE_URL', 'http://localhost:5173')

def wait_ready():
    for _ in range(30):
        try:
            urllib.request.urlopen(BASE, timeout=2)
            return
        except Exception:
            time.sleep(1)
    raise SystemExit('dev server 未就绪')

def main():
    wait_ready()
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('需安装 playwright：pip install playwright && playwright install chromium')
        sys.exit(2)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(BASE)
        # 壳
        assert page.locator('.sidebar').count() == 1
        assert page.locator('.header').count() == 1
        # 打开资产目录
        page.locator('.sidebar-item', has_text='数据资产目录').click()
        assert page.locator('.tab', has_text='数据资产目录').count() == 1
        assert page.locator('.table tbody tr').count() >= 5
        # 打开治理看板
        page.locator('.sidebar-item', has_text='数据治理看板').click()
        assert page.locator('.tab', has_text='数据治理看板').count() == 1
        # 占位模块
        page.locator('.sidebar-item', has_text='数据质量').click()
        assert page.locator('.placeholder').count() == 1
        assert page.locator('.badge-2nd').count() >= 1
        # 跨模块转跳：治理看板 → 定位字段 → 激活资产目录
        page.locator('.tab', has_text='数据治理看板').click()
        page.locator('.issue .link').first.click()
        assert page.locator('.tab.active', has_text='数据资产目录').count() == 1
        print('page_test PASS')
        browser.close()

if __name__ == '__main__':
    main()
```

- [ ] **Step 2: 起 dev server 后台运行 + 跑冒烟**

```bash
npm run dev > /tmp/vite.log 2>&1 &
sleep 3
npm run test:page
```

Expected: 输出 `page_test PASS`。

- [ ] **Step 3: 提交**

```bash
git add test/page_test.py
git commit -m "test: playwright 页面冒烟测试"
```

---

## Task 9: 部署（GH Actions + nginx）

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: GitHub secrets（`HOST`/`SSH_KEY`/`SSH_USER`，见 consolidated-deploy-rules）；`npm run build` 产物 `dist/`。

- [ ] **Step 1: 写 .github/workflows/deploy.yml**

```yaml
name: deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Deploy via rsync
        env:
          SSH_KEY: ${{ secrets.SSH_KEY }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          rsync -az -e "ssh -o StrictHostKeyChecking=no" dist/ ${{ secrets.SSH_USER }}@${{ secrets.HOST }}:/opt/demo/data-asset-platform/
```

- [ ] **Step 2: nginx 配置（在服务器上，需 #1 服务器 root 或运维执行）**

```nginx
location /data-asset-platform/ {
    alias /opt/demo/data-asset-platform/;
    index index.html;
    try_files $uri $uri/ /data-asset-platform/index.html;
}
```

- [ ] **Step 3: 推送到 GitHub + 建仓库**

```bash
git remote add origin git@github.com:<owner>/data-resource-platform.git
git push -u origin main
```

> 推送前需在 GitHub 创建空仓库并在仓库 Settings → Secrets 配好 `HOST`/`SSH_USER`/`SSH_KEY`。推送 main 后 Actions 自动部署。

- [ ] **Step 4: 验证部署**

访问 `https://demo.intelab.cn/data-asset-platform/`，预期看到平台壳 + 可交互模块。

- [ ] **Step 5: 提交（如改动了部署文件）**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: GH Actions 部署到 demo.intelab.cn/data-asset-platform"
```

---

## 完成定义（Definition of Done）

- `npm test` 全绿（data 引用完整性 5 项 + state 状态机 4 项）。
- `npm run build` 成功，`npm run test:page` 输出 PASS。
- 两条闭环可走通：质量子看板 → 定位字段 → 目录字段元数据；标准子看板 → 应贯未贯 → 定位字段。
- 占位模块（M2–M6 + 血缘）显示定位说明 + 二期 badge。
- 部署到 `https://demo.intelab.cn/data-asset-platform/` 可访问。
