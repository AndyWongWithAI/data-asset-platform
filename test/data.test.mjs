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

test('maskExamples 每条 level 合法', () => {
  const secLevels = new Set(D.security.map((s) => s.level));
  for (const m of D.maskExamples) {
    assert.ok(secLevels.has(m.level), `maskExample ${m.field} level ${m.level} 不存在`);
  }
});

test('lineage 引用完整 + mode 合法', () => {
  const tableIds = ids(D.tables);
  const modes = new Set(['离线批次', '数据服务', '应用内']);
  assert.ok(D.lineage.length >= 9);
  for (const l of D.lineage) {
    assert.ok(tableIds.has(l.up), `lineage ${l.id} up ${l.up} 不存在`);
    assert.ok(tableIds.has(l.down), `lineage ${l.id} down ${l.down} 不存在`);
    assert.ok(modes.has(l.mode), `lineage ${l.id} mode ${l.mode} 非法`);
  }
});

test('lineage 每条边含字段级 fieldMapping（字段归表一致）', () => {
  const fieldIds = ids(D.fields);
  const fieldTable = new Map(D.fields.map((f) => [f.id, f.tableId]));
  for (const l of D.lineage) {
    assert.ok(l.fieldMapping && l.fieldMapping.length >= 1, `lineage ${l.id} 缺 fieldMapping 或为空`);
    for (const m of l.fieldMapping) {
      assert.ok(fieldIds.has(m.up), `lineage ${l.id} 映射 up 字段 ${m.up} 不存在`);
      assert.ok(fieldIds.has(m.down), `lineage ${l.id} 映射 down 字段 ${m.down} 不存在`);
      assert.equal(fieldTable.get(m.up), l.up, `lineage ${l.id} up 字段 ${m.up} 不属于上游表 ${l.up}`);
      assert.equal(fieldTable.get(m.down), l.down, `lineage ${l.id} down 字段 ${m.down} 不属于下游表 ${l.down}`);
    }
  }
});

test('batchFiles 引用完整 + 审批链完整', () => {
  const tableIds = ids(D.tables);
  assert.ok(D.batchFiles.length >= 5);
  for (const b of D.batchFiles) {
    assert.ok(tableIds.has(b.sourceTableId), `batchFile ${b.id} sourceTableId 不存在`);
    for (const s of b.applyFlow) assert.ok(s.step && s.result, `batchFile ${b.id} applyFlow 缺 step/result`);
  }
});

test('services 引用完整 + securityLevel 合法 + 审批链完整', () => {
  const tableIds = ids(D.tables);
  const secLevels = new Set(D.security.map((s) => s.level));
  assert.ok(D.services.length >= 5);
  for (const s of D.services) {
    assert.ok(secLevels.has(s.securityLevel), `service ${s.id} securityLevel 非法`);
    for (const tid of s.tableIds) assert.ok(tableIds.has(tid), `service ${s.id} tableId ${tid} 不存在`);
    for (const step of s.applyFlow) assert.ok(step.step && step.result, `service ${s.id} applyFlow 缺 step/result`);
  }
});

test('lineage 覆盖全部 10 张表', () => {
  const covered = new Set();
  for (const l of D.lineage) { covered.add(l.up); covered.add(l.down); }
  assert.equal(covered.size, D.tables.length, '血缘应覆盖全部表');
  for (const t of D.tables) assert.ok(covered.has(t.id), `表 ${t.id} 未被血缘覆盖`);
});

test('lineage mode 与跨应用/应用内归属一致', () => {
  const appOf = (tid) => D.tables.find((t) => t.id === tid)?.appId;
  for (const l of D.lineage) {
    const cross = appOf(l.up) !== appOf(l.down);
    if (cross) assert.ok(['离线批次', '数据服务'].includes(l.mode), `${l.id} 跨应用应标 离线批次/数据服务，实际 ${l.mode}`);
    else assert.equal(l.mode, '应用内', `${l.id} 应用内应标 应用内，实际 ${l.mode}`);
  }
});

test('L4 数据服务含二次审批（≥4 步）', () => {
  const l4 = D.services.filter((s) => s.securityLevel === 'L4');
  assert.ok(l4.length >= 1, '应至少 1 个 L4 服务');
  for (const s of l4) {
    assert.ok(s.applyFlow.some((st) => st.step === '二次审批'), `L4 服务 ${s.id} 应含二次审批`);
    assert.ok(s.applyFlow.length >= 4, `L4 服务 ${s.id} 应至少 4 步审批`);
  }
});
