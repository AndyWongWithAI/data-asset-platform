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

test('CREATABLE 6 实体 / UPDATABLE 仅 security', () => {
  assert.deepEqual(CREATABLE.sort(), ['baseTerms', 'infoItems', 'masterData', 'qualityRules', 'refDatas', 'valueDomains'].sort());
  assert.deepEqual(UPDATABLE, ['security']);
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

test('create infoItems：引用校验（valueDomainId / termIds）', () => {
  freshStore();
  // 合法：引用都存在
  const ok = create('infoItems', {
    code: 'II9999', nameCn: '测试项', nameEn: 'test_item', type: '技术',
    termIds: ['term_value'], valueDomainId: 'vd_varchar10', refDataId: null,
  });
  assert.equal(ok.ok, true);

  // 非法 valueDomainId
  const badVd = create('infoItems', {
    code: 'II9998', nameCn: '测试项2', nameEn: 'test_item2', type: '技术',
    termIds: ['term_value'], valueDomainId: 'vd_not_exist',
  });
  assert.equal(badVd.ok, false);
  assert.ok(badVd.errors.some((e) => e.includes('valueDomainId')));

  // 非法 termIds
  const badTerm = create('infoItems', {
    code: 'II9997', nameCn: '测试项3', nameEn: 'test_item3', type: '技术',
    termIds: ['term_not_exist'], valueDomainId: 'vd_varchar10',
  });
  assert.equal(badTerm.ok, false);
  assert.ok(badTerm.errors.some((e) => e.includes('termIds')));
});

test('create infoItems：枚举非法 type → 报错', () => {
  freshStore();
  const r = create('infoItems', {
    code: 'II9996', nameCn: '测试项', nameEn: 'test_item4', type: '非法',
    termIds: ['term_value'], valueDomainId: 'vd_varchar10',
  });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('type')));
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

test('update baseTerms → 不支持修改', () => {
  freshStore();
  const r = update('baseTerms', 'term_name', { nameCn: 'x' });
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

test('F4：类型校验（termIds 传字符串 / length 传字符串）', () => {
  freshStore();
  const r1 = create('infoItems', {
    code: 'II9995', nameCn: '类型错', nameEn: 'type_err', type: '技术',
    termIds: 'term_value', valueDomainId: 'vd_varchar10', // termIds 应为数组
  });
  assert.equal(r1.ok, false);
  assert.ok(r1.errors.some((e) => e.includes('termIds') && e.includes('类型')));

  const r2 = create('valueDomains', { code: 'VD-X', dataType: 'varchar', length: 'abc', precision: 0 });
  assert.equal(r2.ok, false);
  assert.ok(r2.errors.some((e) => e.includes('length') && e.includes('类型')));
});

test('F5：补全枚举（dataType / entityType / status 非法）', () => {
  freshStore();
  const r1 = create('valueDomains', { code: 'VD-X', dataType: 'int', length: 5, precision: 0 });
  assert.equal(r1.ok, false);
  assert.ok(r1.errors.some((e) => e.includes('dataType')));

  const r2 = create('masterData', { code: 'XX-0001', entityType: '未知类型', name: 'x', attrs: {} });
  assert.equal(r2.ok, false);
  assert.ok(r2.errors.some((e) => e.includes('entityType')));

  const r3 = create('qualityRules', {
    name: 'x', type: '准确性', targetFieldId: 'f_wind_speed', expr: 'x', threshold: '100%', severity: '严重', status: '未知状态',
  });
  assert.equal(r3.ok, false);
  assert.ok(r3.errors.some((e) => e.includes('status')));
});

test('F6：可空引用传空字符串不误报', () => {
  freshStore();
  const r = create('infoItems', {
    code: 'II9994', nameCn: '空串', nameEn: 'empty_ref', type: '技术',
    termIds: ['term_value'], valueDomainId: 'vd_varchar10', refDataId: '',
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
