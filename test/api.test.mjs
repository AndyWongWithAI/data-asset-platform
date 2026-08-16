import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { init, getState, list, getOne, create, update, validate, ENTITIES, CREATABLE, UPDATABLE } from '../server/store.js';
import { createApp } from '../server/app.js';

// 每个 test 用独立临时数据文件，避免相互污染
function freshStore() {
  const dir = mkdtempSync(path.join(tmpdir(), 'drp-test-'));
  const dataFile = path.join(dir, 'data.json');
  init({ dataFile });
  return dataFile;
}

test('init 加载种子：7 实体 + 数量正确', () => {
  freshStore();
  const s = getState();
  assert.equal(ENTITIES.length, 7);
  assert.deepEqual(ENTITIES.sort(), ['baseTerms', 'infoItems', 'masterData', 'qualityRules', 'refDatas', 'security', 'valueDomains'].sort());
  assert.equal(s.applications.length, 5);
  assert.equal(s.tables.length, 10);
  assert.equal(s.fields.length, 51);
  assert.equal(s.baseTerms.length, 28);
  assert.equal(s.valueDomains.length, 6);
  assert.equal(s.refDatas.length, 5);
  assert.equal(s.infoItems.length, 10);
  assert.equal(s.qualityRules.length, 8);
  assert.equal(s.masterData.length, 5);
  assert.equal(s.security.length, 4);
});

test('CREATABLE 5 实体 / UPDATABLE 6 实体', () => {
  assert.deepEqual(CREATABLE.sort(), ['baseTerms', 'infoItems', 'qualityRules', 'refDatas', 'valueDomains'].sort());
  assert.deepEqual(UPDATABLE.sort(), ['baseTerms', 'infoItems', 'qualityRules', 'refDatas', 'security', 'valueDomains'].sort());
});

test('create baseTerms：成功 + id 生成 + 落盘持久化', () => {
  const dataFile = freshStore();
  const before = getState().baseTerms.length;
  const r = create('baseTerms', { nameCn: '测试', nameEn: 'test_word', synonyms: [], isClassWord: false });
  assert.equal(r.ok, true);
  assert.equal(r.record.id, 'term_1');
  assert.equal(r.record.nameCn, '测试');
  assert.equal(getState().baseTerms.length, before + 1);
  // 持久化：重新 init 从文件读回
  init({ dataFile });
  assert.equal(getState().baseTerms.length, before + 1);
  assert.ok(getState().baseTerms.some((t) => t.nameEn === 'test_word'));
});

test('create 缺必填 → 报错', () => {
  freshStore();
  const r = create('baseTerms', { nameCn: '测试' }); // 缺 nameEn / isClassWord
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('nameEn')));
  assert.ok(r.errors.some((e) => e.includes('isClassWord')));
});

test('create 唯一性冲突 → 报错（nameEn / code）', () => {
  freshStore();
  const r = create('baseTerms', { nameCn: '名称2', nameEn: 'name', synonyms: [], isClassWord: false }); // nameEn 重复
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('nameEn') && e.includes('重复')));
});

test('create infoItems：nameCn 拆词派生 + 引用校验（valueDomainId）', () => {
  freshStore();
  // 合法：中文名拆词全命中（风机+标识），nameEn/termIds/code 由服务端派生
  const ok = create('infoItems', {
    nameCn: '风机标识', type: '技术', valueDomainId: 'vd_varchar10', refDataId: null,
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.record.nameCn, '风机标识');
  assert.equal(ok.record.nameEn, 'turbine_identifier');
  assert.deepEqual(ok.record.termIds, ['term_turbine', 'term_identifier']);

  // 非法 valueDomainId
  const badVd = create('infoItems', {
    nameCn: '风机标识', type: '技术', valueDomainId: 'vd_not_exist',
  });
  assert.equal(badVd.ok, false);
  assert.ok(badVd.errors.some((e) => e.includes('valueDomainId')));
});

test('create infoItems：枚举非法 type → 报错', () => {
  freshStore();
  const r = create('infoItems', {
    nameCn: '风机标识', type: '非法', valueDomainId: 'vd_varchar10',
  });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('type')));
});

test('create infoItems：客户端注入 code 被服务端重算（堵任意 code）', () => {
  freshStore();
  const r = create('infoItems', {
    code: 'ABC', nameCn: '风机标识', type: '技术', valueDomainId: 'vd_varchar10',
  });
  assert.equal(r.ok, true);
  assert.notEqual(r.record.code, 'ABC');
  assert.match(r.record.code, /^II\d{4}$/);
});

test('create infoItems：缺词根 → 报错（阻止提交），末位缺失不误报末位非类词', () => {
  freshStore();
  const r = create('infoItems', {
    nameCn: '风机转速', type: '技术', valueDomainId: 'vd_varchar10',
  });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('缺少词根') && e.includes('转速')));
  assert.ok(!r.errors.some((e) => e.includes('末位')), '末尾缺词根时不应误报末位非类词');
});

test('create security → 不支持新增', () => {
  freshStore();
  const r = create('security', { level: 'L5', name: 'x', desc: 'y' });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('不支持新增')));
});

test('update security：按 level 修改成功', () => {
  const dataFile = freshStore();
  const r = update('security', 'L1', { name: '公开', desc: '更新后的描述', mask: null });
  assert.equal(r.ok, true);
  assert.equal(getState().security.find((s) => s.level === 'L1').desc, '更新后的描述');
  init({ dataFile });
  assert.equal(getState().security.find((s) => s.level === 'L1').desc, '更新后的描述');
});

test('update security：不存在 level → 报错', () => {
  freshStore();
  const r = update('security', 'L9', { name: 'x', desc: 'y' });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('未找到')));
});

test('update masterData → 不支持修改', () => {
  freshStore();
  const r = update('masterData', 'md_turbine', { name: 'x' });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('不支持修改')));
});

test('validate 未知实体 → 报错', () => {
  freshStore();
  const errors = validate('not_exist', {});
  assert.deepEqual(errors, ['未知实体 not_exist']);
});

test('list 已知实体返回数组，未知返回 null', () => {
  freshStore();
  assert.ok(Array.isArray(list('baseTerms')));
  assert.equal(list('not_exist'), null);
});

// ===== 对抗式审查修复回归测试 =====
test('F1/F2：主键不可篡改（update level / create id）', () => {
  freshStore();
  const r1 = update('security', 'L1', { level: 'L2', desc: '篡改尝试' });
  assert.equal(r1.ok, true);
  const l1 = getState().security.find((s) => s.level === 'L1');
  assert.equal(l1.level, 'L1', 'level 不应被篡改');
  assert.equal(l1.desc, '篡改尝试');

  const r2 = create('baseTerms', { id: 'term_hack', nameCn: '注入', nameEn: 'inject_word', synonyms: [], isClassWord: false });
  assert.equal(r2.ok, true);
  assert.notEqual(r2.record.id, 'term_hack');
  assert.equal(r2.record.id, 'term_1');
});

test('F3：update 局部更新不误报（只传 desc）', () => {
  freshStore();
  const r = update('security', 'L1', { desc: '只改描述' });
  assert.equal(r.ok, true);
  assert.equal(getState().security.find((s) => s.level === 'L1').desc, '只改描述');
});

test('F4：类型校验（length 传字符串）', () => {
  freshStore();
  const r2 = create('valueDomains', { code: 'VD-X', dataType: 'varchar', length: 'abc', precision: 0 });
  assert.equal(r2.ok, false);
  assert.ok(r2.errors.some((e) => e.includes('length') && e.includes('类型')));
});

test('F5：补全枚举（dataType / status 非法）+ masterData 不支持新增', () => {
  freshStore();
  const r1 = create('valueDomains', { code: 'VD-X', dataType: 'int', length: 5, precision: 0 });
  assert.equal(r1.ok, false);
  assert.ok(r1.errors.some((e) => e.includes('dataType')));

  const r2 = create('masterData', { code: 'XX-0001', entityType: '风机', name: 'x', definition: 'x', rule: 'x', owner: 'x' });
  assert.equal(r2.ok, false);
  assert.ok(r2.errors.some((e) => e.includes('不支持新增')));

  const r3 = create('qualityRules', {
    name: 'x', type: '准确性', targetFieldId: 'f_wind_speed', expr: 'x', threshold: '100%', severity: '严重', status: '未知状态',
  });
  assert.equal(r3.ok, false);
  assert.ok(r3.errors.some((e) => e.includes('status')));
});

test('F6：可空引用传空字符串不误报', () => {
  freshStore();
  const r = create('infoItems', {
    nameCn: '风机标识', type: '技术', valueDomainId: 'vd_varchar10', refDataId: '',
  });
  assert.equal(r.ok, true);
});

test('getOne 读单条（默认 id 键 + security 用 level 键）', () => {
  freshStore();
  assert.equal(getOne('baseTerms', 'term_name').nameEn, 'name');
  assert.equal(getOne('security', 'L1').name, '公开');
  assert.equal(getOne('baseTerms', 'not_exist'), null);
});

// ===== HTTP 集成测试（路由层：状态码 / 单条 / JSON 错误 / 读全实体）=====
test('HTTP 集成：GET/POST/PUT 状态码与 JSON 错误', async () => {
  freshStore();
  const app = createApp();
  const server = app.listen(0);
  const base = `http://localhost:${server.address().port}`;
  const jpost = (path, body) => fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const jput = (path, body) => fetch(`${base}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    // GET 读全实体（F14：bizDomains 不在写实体白名单，但可读）
    assert.equal((await fetch(`${base}/api/v1/bizDomains`)).status, 200);
    assert.equal((await (await fetch(`${base}/api/v1/bizDomains`)).json()).length, 5);

    // GET 单条（F7）
    const one = await fetch(`${base}/api/v1/baseTerms/term_name`);
    assert.equal(one.status, 200);
    assert.equal((await one.json()).nameEn, 'name');

    // POST security → 405（不支持新增）
    assert.equal((await jpost('/api/v1/security', {})).status, 405);

    // PUT 不存在 level → 404
    assert.equal((await jput('/api/v1/security/L9', { name: 'x', desc: 'y' })).status, 404);

    // PUT 局部更新 → 200（F3）
    assert.equal((await jput('/api/v1/security/L1', { desc: '集成测试' })).status, 200);

    // 非法 JSON body → 400（F9）
    const bad = await fetch(`${base}/api/v1/baseTerms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad json' });
    assert.equal(bad.status, 400);

    // 未知实体 → 404
    assert.equal((await fetch(`${base}/api/v1/nope`)).status, 404);

    // POST 合法 → 201
    const ok = await jpost('/api/v1/baseTerms', { nameCn: '集成', nameEn: 'http_word', synonyms: [], isClassWord: false });
    assert.equal(ok.status, 201);
    assert.equal((await ok.json()).id, 'term_1');
  } finally {
    server.close();
  }
});

test('HTTP 集成：GET /_entities 返回 entities/idKeys/creatable/updatable', async () => {
  freshStore();
  const app = createApp();
  const server = app.listen(0);
  const base = `http://localhost:${server.address().port}`;
  try {
    const res = await fetch(`${base}/api/v1/_entities`);
    assert.equal(res.status, 200);
    const meta = await res.json();
    assert.ok(Array.isArray(meta.entities));
    assert.ok(meta.entities.includes('baseTerms'));
    assert.ok(meta.entities.includes('infoItems'));
    assert.equal(meta.idKeys.baseTerms, 'id');
    assert.equal(meta.idKeys.security, 'level');
    assert.ok(meta.creatable.includes('baseTerms'));
    assert.ok(!meta.creatable.includes('security'));
    assert.deepEqual(meta.updatable.sort(), ['baseTerms', 'infoItems', 'qualityRules', 'refDatas', 'security', 'valueDomains'].sort());
  } finally {
    server.close();
  }
});

// ===== P2 领域规则测试 =====
test('P2：infoItems 传 nameCn → 自动派生 nameEn/termIds/code', () => {
  freshStore();
  const r = create('infoItems', {
    nameCn: '电压等级标识', type: '技术', valueDomainId: 'vd_varchar10',
  });
  assert.equal(r.ok, true);
  assert.equal(r.record.nameCn, '电压等级标识');
  assert.equal(r.record.nameEn, 'voltage_level_identifier');
  assert.equal(r.record.code, 'II0011'); // 种子最大 II0010 → II0011
  assert.equal(r.record.id, 'ii_1');
  assert.deepEqual(r.record.termIds, ['term_voltage', 'term_level', 'term_identifier']);
});

test('P2：infoItems 末位非类词 → 报错', () => {
  freshStore();
  const r = create('infoItems', {
    nameCn: '电压等级', type: '技术', valueDomainId: 'vd_varchar10',
  });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('末位') && e.includes('类词')));
});

test('P2：infoItems 末位非类词 → 给出可选类词清单', () => {
  freshStore();
  const r = create('infoItems', {
    nameCn: '风机机型', type: '技术', valueDomainId: 'vd_varchar10',
  });
  assert.equal(r.ok, false);
  const msg = r.errors.find((e) => e.includes('末位') && e.includes('类词'));
  assert.ok(msg, '应报末位非类词');
  assert.ok(msg.includes('标识'), '类词清单应含「标识」');
});

test('P2：infoItems type=业务 缺 bizDomainId → 报错；type=技术 可不传', () => {
  freshStore();
  const bad = create('infoItems', {
    nameCn: '风机标识', type: '业务', valueDomainId: 'vd_varchar10',
  });
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => e.includes('bizDomainId')));
  assert.ok(bad.errors.some((e) => e.includes('definition')));

  const ok = create('infoItems', {
    nameCn: '海缆标识', type: '技术', valueDomainId: 'vd_varchar10',
  });
  assert.equal(ok.ok, true);
});

test('P2：valueDomains length=0 / precision=-1 → 报错', () => {
  freshStore();
  const r1 = create('valueDomains', { code: 'VD-ZERO', dataType: 'varchar', length: 0, precision: 0 });
  assert.equal(r1.ok, false);
  assert.ok(r1.errors.some((e) => e.includes('length') && e.includes('大于 0')));

  const r2 = create('valueDomains', { code: 'VD-NEG', dataType: 'decimal', length: 5, precision: -1 });
  assert.equal(r2.ok, false);
  assert.ok(r2.errors.some((e) => e.includes('precision') && e.includes('大于等于 0')));
});

test('P2：refDatas 编号自增（CK+四位补零，客户端不可注入）', () => {
  freshStore();
  const r1 = create('refDatas', { code: 'HACK', name: '测试码表', values: [{ code: 'A', name: 'a' }] });
  assert.equal(r1.ok, true);
  assert.equal(r1.record.code, 'CK0006'); // 种子最大 CK0005 → CK0006

  const r2 = create('refDatas', { name: '第二个码表', values: [{ code: 'B', name: 'b' }] });
  assert.equal(r2.ok, true);
  assert.equal(r2.record.code, 'CK0007');
});

test('P2：拆词最大正向匹配（四字词根优先：日期时间 不被 日期 抢先）', () => {
  freshStore();
  const r = create('infoItems', {
    nameCn: '预测日期时间', type: '技术', valueDomainId: 'vd_varchar10',
  });
  assert.equal(r.ok, true);
  assert.equal(r.record.nameEn, 'forecast_datetime');
  assert.deepEqual(r.record.termIds, ['term_forecast', 'term_datetime']);
});

test('P2：单字类词末位（值）合法', () => {
  freshStore();
  const r = create('infoItems', {
    nameCn: '功率值', type: '技术', valueDomainId: 'vd_dec52',
  });
  assert.equal(r.ok, true);
  assert.equal(r.record.nameEn, 'power_value');
  assert.deepEqual(r.record.termIds, ['term_power', 'term_value']);
});

test('P2：infoItems 客户端注入 nameEn/termIds 被服务端覆盖', () => {
  freshStore();
  const r = create('infoItems', {
    nameCn: '风机标识', type: '技术', valueDomainId: 'vd_varchar10',
    nameEn: 'hacked_name', termIds: ['term_hack'],
  });
  assert.equal(r.ok, true);
  assert.equal(r.record.nameEn, 'turbine_identifier');
  assert.deepEqual(r.record.termIds, ['term_turbine', 'term_identifier']);
});

test('create 未传 status → 默认启用（4 实体）', () => {
  freshStore();
  const r = create('valueDomains', { code: 'VD-TEST', dataType: 'varchar', length: 20, precision: 0 });
  assert.equal(r.ok, true);
  assert.equal(r.record.status, '启用');
});

test('update baseTerms：改名成功 + 落盘', () => {
  const dataFile = freshStore();
  const r = update('baseTerms', 'term_name', { nameCn: '名称（改）' });
  assert.equal(r.ok, true);
  assert.equal(r.record.nameCn, '名称（改）');
  init({ dataFile });
  assert.equal(getState().baseTerms.find((t) => t.id === 'term_name').nameCn, '名称（改）');
});

test('update 停用/启用：status 枚举 + 可逆', () => {
  freshStore();
  const off = update('valueDomains', 'vd_varchar10', { status: '停用' });
  assert.equal(off.ok, true);
  assert.equal(off.record.status, '停用');
  const on = update('valueDomains', 'vd_varchar10', { status: '启用' });
  assert.equal(on.ok, true);
  assert.equal(on.record.status, '启用');
});

test('update status 非法值 → 报错', () => {
  freshStore();
  const r = update('baseTerms', 'term_name', { status: '废弃' });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('status')));
});

test('update 主键不可篡改', () => {
  freshStore();
  const r = update('baseTerms', 'term_name', { id: 'term_hacked', nameCn: '篡改' });
  assert.equal(r.ok, true);
  assert.equal(r.record.id, 'term_name'); // id 仍为原值
});
