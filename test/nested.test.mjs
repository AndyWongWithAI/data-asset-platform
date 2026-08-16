import test from 'node:test';
import assert from 'node:assert/strict';
import { getNested, unflatten, deepMerge } from '../src/nested.js';

test('getNested：点号路径读嵌套值', () => {
  const obj = { business: { nameCn: '风速值', masterDataId: null }, management: { securityLevel: 'L2' } };
  assert.equal(getNested(obj, 'business.nameCn'), '风速值');
  assert.equal(getNested(obj, 'management.securityLevel'), 'L2');
  assert.equal(getNested(obj, 'business.masterDataId'), null);
});

test('getNested：无点号等价直接取值，缺失路径返回 undefined', () => {
  const obj = { id: 'f_1', business: {} };
  assert.equal(getNested(obj, 'id'), 'f_1');
  assert.equal(getNested(obj, 'business.nameCn'), undefined);
  assert.equal(getNested(obj, 'technical.type'), undefined);
  assert.equal(getNested(null, 'x'), undefined);
});

test('unflatten：扁平点号 key 组装嵌套对象，同前缀合并', () => {
  const flat = { 'business.nameCn': '风速', 'business.definition': '测风', 'technical.type': 'decimal' };
  assert.deepEqual(unflatten(flat), {
    business: { nameCn: '风速', definition: '测风' },
    technical: { type: 'decimal' },
  });
});

test('unflatten：无点号 key 原样保留', () => {
  assert.deepEqual(unflatten({ name: 'x', 'a.b': 1 }), { name: 'x', a: { b: 1 } });
});

test('deepMerge：嵌套对象递归合并，保留未编辑子块', () => {
  const target = { id: 'f_1', business: { code: 'wind', nameCn: '风速' }, technical: { type: 'decimal', length: 7 } };
  const patch = { business: { nameCn: '风速值' }, technical: { length: 10 } };
  const out = deepMerge(target, patch);
  assert.deepEqual(out, {
    id: 'f_1',
    business: { code: 'wind', nameCn: '风速值' },   // code 保留，nameCn 覆盖
    technical: { type: 'decimal', length: 10 },       // type 保留，length 覆盖
  });
});

test('deepMerge：数组整体替换而非合并', () => {
  const out = deepMerge({ a: [1, 2], b: { c: 1 } }, { a: [3], b: { d: 2 } });
  assert.deepEqual(out, { a: [3], b: { c: 1, d: 2 } });
});
