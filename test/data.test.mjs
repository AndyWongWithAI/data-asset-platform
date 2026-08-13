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
