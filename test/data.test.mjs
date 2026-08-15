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
  const stdIds = ids(D.infoItems);
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

test('batchFiles 方向字段完整 + 引用完整 + 审批链完整', () => {
  const tableIds = ids(D.tables);
  const dbIds = ids(D.databases);
  assert.ok(D.batchFiles.length >= 8);
  for (const b of D.batchFiles) {
    assert.ok(b.direction === 'outbound' || b.direction === 'inbound', `batchFile ${b.id} direction 非法`);
    assert.ok(typeof b.sourceSystem === 'string' && b.sourceSystem.trim(), `batchFile ${b.id} 缺 sourceSystem`);
    assert.ok(typeof b.targetSystem === 'string' && b.targetSystem.trim(), `batchFile ${b.id} 缺 targetSystem`);
    if (b.direction === 'outbound') {
      // 出站：表级字段，字段不变
      assert.ok(typeof b.sourceTableName === 'string' && b.sourceTableName.trim(), `batchFile ${b.id} 缺 sourceTableName`);
      assert.ok(typeof b.targetTableName === 'string' && b.targetTableName.trim(), `batchFile ${b.id} 缺 targetTableName`);
      if (b.sourceTableId != null) assert.ok(tableIds.has(b.sourceTableId), `batchFile ${b.id} sourceTableId 不存在`);
      if (b.targetTableId != null) assert.ok(tableIds.has(b.targetTableId), `batchFile ${b.id} targetTableId 不存在`);
    } else {
      // 入站：库级字段，不应再有表级字段
      assert.ok(typeof b.sourceDatabaseName === 'string' && b.sourceDatabaseName.trim(), `batchFile ${b.id} 缺 sourceDatabaseName`);
      assert.ok(typeof b.sourceDatabaseType === 'string' && b.sourceDatabaseType.trim(), `batchFile ${b.id} 缺 sourceDatabaseType`);
      assert.ok(typeof b.targetDatabaseId === 'string' && b.targetDatabaseId.trim(), `batchFile ${b.id} 缺 targetDatabaseId`);
      assert.ok(typeof b.targetDatabaseName === 'string' && b.targetDatabaseName.trim(), `batchFile ${b.id} 缺 targetDatabaseName`);
      assert.ok(dbIds.has(b.targetDatabaseId), `batchFile ${b.id} targetDatabaseId ${b.targetDatabaseId} 不存在`);
      assert.equal(b.sourceTableId, undefined, `batchFile ${b.id} 入站不应有 sourceTableId`);
      assert.equal(b.sourceTableName, undefined, `batchFile ${b.id} 入站不应有 sourceTableName`);
      assert.equal(b.targetTableId, undefined, `batchFile ${b.id} 入站不应有 targetTableId`);
      assert.equal(b.targetTableName, undefined, `batchFile ${b.id} 入站不应有 targetTableName`);
    }
    for (const s of b.applyFlow) assert.ok(s.step && s.result, `batchFile ${b.id} applyFlow 缺 step/result`);
  }
  const outbound = D.batchFiles.filter((b) => b.direction === 'outbound');
  const inbound = D.batchFiles.filter((b) => b.direction === 'inbound');
  assert.equal(outbound.length, 5, '应 5 条出站任务');
  assert.equal(inbound.length, 3, '应 3 条入站任务');
});

test('prodMetadatas 3 条 + batchFileId 引用完整 + 表/字段结构完整', () => {
  assert.equal(D.prodMetadatas.length, 3);
  const batchIds = ids(D.batchFiles);
  const pmIds = ids(D.prodMetadatas);
  assert.equal(pmIds.size, D.prodMetadatas.length, 'prodMetadatas id 重复');
  for (const pm of D.prodMetadatas) {
    assert.ok(batchIds.has(pm.batchFileId), `prodMetadata ${pm.id} batchFileId ${pm.batchFileId} 不存在`);
    // batchFileId 关联的必须是入站任务
    const bf = D.batchFiles.find((b) => b.id === pm.batchFileId);
    assert.equal(bf.direction, 'inbound', `prodMetadata ${pm.id} batchFileId 应关联入站任务`);
    assert.ok(typeof pm.targetDatabaseId === 'string' && pm.targetDatabaseId.trim(), `prodMetadata ${pm.id} 缺 targetDatabaseId`);
    assert.ok(Array.isArray(pm.tables) && pm.tables.length >= 1, `prodMetadata ${pm.id} 缺 tables`);
    for (const t of pm.tables) {
      assert.ok(t.nameEn && t.nameCn, `prodMetadata ${pm.id} 表缺 nameEn/nameCn`);
      assert.ok(Array.isArray(t.fields) && t.fields.length >= 1, `prodMetadata ${pm.id} 表 ${t.nameEn} 缺 fields`);
      for (const f of t.fields) {
        assert.ok(f.code && f.nameCn && f.type, `prodMetadata ${pm.id} 表 ${t.nameEn} 字段缺 code/nameCn/type`);
      }
    }
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

test('baseTerms：id 唯一 + 类词白名单精确等于 10 个', () => {
  const termIds = D.baseTerms.map((t) => t.id);
  assert.equal(new Set(termIds).size, termIds.length, 'baseTerms id 重复');
  const classWords = new Set(D.baseTerms.filter((t) => t.isClassWord).map((t) => t.nameCn));
  const expected = new Set(['名称', '编码', '量', '值', '日期', '时间', '日期时间', '标识', '百分比', '率']);
  assert.deepEqual([...classWords].sort(), [...expected].sort(), '类词白名单不精确相等');
  assert.equal(classWords.size, 10, '类词去重后应恰好 10 个');
});

test('valueDomains：id/code 唯一', () => {
  assert.equal(ids(D.valueDomains).size, D.valueDomains.length, 'valueDomains id 重复');
  const codes = D.valueDomains.map((v) => v.code);
  assert.equal(new Set(codes).size, codes.length, 'valueDomains code 重复');
});

test('refDatas：id/code 唯一 + 每条 values 含 code+name', () => {
  assert.equal(ids(D.refDatas).size, D.refDatas.length, 'refDatas id 重复');
  const codes = D.refDatas.map((r) => r.code);
  assert.equal(new Set(codes).size, codes.length, 'refDatas code 重复');
  for (const r of D.refDatas) {
    assert.ok(Array.isArray(r.values) && r.values.length >= 1, `refData ${r.id} 缺 values`);
    for (const v of r.values) {
      assert.ok(v.code && v.name, `refData ${r.id} 枚举值缺 code/name`);
    }
  }
});

test('infoItems：id 唯一 + 引用完整 + 命名规则', () => {
  assert.equal(ids(D.infoItems).size, D.infoItems.length, 'infoItems id 重复');
  const termMap = new Map(D.baseTerms.map((t) => [t.id, t]));
  const vdIds = ids(D.valueDomains);
  const rdIds = ids(D.refDatas);
  for (const ii of D.infoItems) {
    assert.ok(ii.valueDomainId, `infoItem ${ii.id} valueDomainId 为空`);
    assert.ok(vdIds.has(ii.valueDomainId), `infoItem ${ii.id} valueDomainId ${ii.valueDomainId} 不存在`);
    if (ii.refDataId != null) assert.ok(rdIds.has(ii.refDataId), `infoItem ${ii.id} refDataId ${ii.refDataId} 不存在`);
    assert.ok(Array.isArray(ii.termIds) && ii.termIds.length >= 1, `infoItem ${ii.id} 缺 termIds`);
    const terms = ii.termIds.map((tid) => termMap.get(tid));
    terms.forEach((t, idx) => assert.ok(t, `infoItem ${ii.id} termId ${ii.termIds[idx]} 不存在`));
    const last = terms[terms.length - 1];
    assert.ok(last.isClassWord, `infoItem ${ii.id} 最后一个 term 应为类词`);
    assert.equal(ii.nameCn, terms.map((t) => t.nameCn).join(''), `infoItem ${ii.id} nameCn 应为词根顺序拼接「${terms.map((t) => t.nameCn).join('')}」`);
    const expectedEn = terms.map((t) => t.nameEn).join('_');
    assert.equal(ii.nameEn, expectedEn, `infoItem ${ii.id} nameEn 应为 ${expectedEn}`);
  }
});

test('infoItems：类型/业务域/定义约束', () => {
  const domainIds = ids(D.bizDomains);
  for (const ii of D.infoItems) {
    assert.ok(ii.type === '技术' || ii.type === '业务', `infoItem ${ii.id} type ${ii.type} 非法，应为「技术」或「业务」`);
    if (ii.type === '业务') {
      assert.ok(ii.bizDomainId, `infoItem ${ii.id} 为业务项，bizDomainId 不能为空`);
      assert.ok(domainIds.has(ii.bizDomainId), `infoItem ${ii.id} bizDomainId ${ii.bizDomainId} 不存在`);
      assert.ok(typeof ii.definition === 'string' && ii.definition.trim().length > 0, `infoItem ${ii.id} 为业务项，definition 不能为空`);
    } else {
      assert.equal(ii.bizDomainId, null, `infoItem ${ii.id} 为技术项，bizDomainId 应为 null`);
      assert.equal(ii.definition, null, `infoItem ${ii.id} 为技术项，definition 应为 null`);
    }
  }
});

test('字段名与信息项标准名对齐（6 字段已贯标）', () => {
  const iiMap = new Map(D.infoItems.map((i) => [i.id, i]));
  const aligned = new Set();
  for (const f of D.fields) {
    if (!f.management.standardId) continue;
    const ii = iiMap.get(f.management.standardId);
    if (f.business.nameCn === ii.nameCn && f.business.code === ii.nameEn) aligned.add(f.id);
  }
  const expected = new Set(['f_wind_speed', 'f_scada_temp', 'f_prog_progress', 'f_cable_voltage', 'f_scada_power', 'f_turbine_model']);
  assert.deepEqual([...aligned].sort(), [...expected].sort(), '已对齐字段集合应精确等于这 6 个字段');
});

test('databases 每条有非空 type', () => {
  assert.ok(D.databases.length >= 5);
  for (const db of D.databases) {
    assert.ok(typeof db.type === 'string' && db.type.trim().length > 0, `database ${db.id} 缺 type`);
  }
});

test('tables 分区/索引/版本历史元数据完整 + 字段引用完整', () => {
  const codesByTable = new Map(D.tables.map((t) => [t.id, new Set(D.fields.filter((f) => f.tableId === t.id).map((f) => f.business.code))]));
  const pkCodesByTable = new Map(D.tables.map((t) => [t.id, new Set(D.fields.filter((f) => f.tableId === t.id && f.technical.isPK).map((f) => f.business.code))]));
  const partTypes = new Set(['RANGE', 'LIST', 'HASH']);
  const granularities = new Set(['日', '月', '年']);
  const idxTypes = new Set(['主键', '唯一', '普通']);
  for (const t of D.tables) {
    const codes = codesByTable.get(t.id);

    // partitions：null 或数组
    if (t.partitions !== null && t.partitions !== undefined) {
      assert.ok(Array.isArray(t.partitions), `table ${t.id} partitions 应为数组或 null`);
      for (const p of t.partitions) {
        assert.ok(p.field && p.type && p.granularity && p.count && p.desc, `table ${t.id} 分区必填字段非空`);
        assert.ok(codes.has(p.field), `table ${t.id} 分区字段 ${p.field} 不存在`);
        assert.ok(partTypes.has(p.type), `table ${t.id} 分区 type ${p.type} 非法`);
        assert.ok(granularities.has(p.granularity), `table ${t.id} 分区 granularity ${p.granularity} 非法`);
        assert.ok(Number.isInteger(p.count) && p.count > 0, `table ${t.id} 分区 count 应为正整数`);
      }
    }

    // indexes：每张表至少 1 个主键索引
    assert.ok(Array.isArray(t.indexes) && t.indexes.length >= 1, `table ${t.id} 缺 indexes`);
    assert.ok(t.indexes.some((i) => i.type === '主键'), `table ${t.id} 应至少 1 个主键索引`);
    for (const idx of t.indexes) {
      assert.ok(idx.name && Array.isArray(idx.fields) && idx.fields.length >= 1 && idx.type && typeof idx.unique === 'boolean', `table ${t.id} 索引必填字段非空`);
      assert.ok(idxTypes.has(idx.type), `table ${t.id} 索引 type ${idx.type} 非法`);
      for (const f of idx.fields) assert.ok(codes.has(f), `table ${t.id} 索引字段 ${f} 不存在`);
      if (idx.type === '主键') {
        assert.ok(idx.fields.some((f) => pkCodesByTable.get(t.id).has(f)), `table ${t.id} 主键索引字段 ${idx.fields.join(',')} 未对应任何 isPK 字段`);
      }
    }

    // history：每张表至少 1 条
    assert.ok(Array.isArray(t.history) && t.history.length >= 1, `table ${t.id} 缺 history`);
    for (const h of t.history) {
      assert.ok(h.version && h.time && h.operator && h.action && h.desc, `table ${t.id} 版本历史必填字段非空`);
    }
  }
});

test('masterData 元数据级字段齐全 + 审批记录完整', () => {
  assert.equal(ids(D.masterData).size, D.masterData.length, 'masterData id 重复');
  const mdCodes = D.masterData.map((m) => m.code);
  assert.equal(new Set(mdCodes).size, mdCodes.length, 'masterData code 重复');
  const approvalTypes = new Set(['新建申请', '变更申请']);
  const approvalStatuses = new Set(['通过', '驳回']);
  for (const md of D.masterData) {
    assert.ok(md.code && md.name && md.entityType && md.definition && md.rule && md.owner, `masterData ${md.id} 缺 code/name/entityType/definition/rule/owner`);
    assert.ok(Array.isArray(md.approvals), `masterData ${md.id} approvals 应为数组`);
    for (const ap of md.approvals) {
      assert.ok(ap.id && ap.type && ap.applicant && ap.applyTime && ap.approver && ap.status && ap.approveTime && ap.comment, `masterData ${md.id} 审批记录必填字段非空`);
      assert.ok(approvalTypes.has(ap.type), `masterData ${md.id} 审批 type ${ap.type} 非法`);
      assert.ok(approvalStatuses.has(ap.status), `masterData ${md.id} 审批 status ${ap.status} 非法`);
    }
  }
});
