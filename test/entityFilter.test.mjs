import test from 'node:test';
import assert from 'node:assert/strict';
import { filterRefOptions } from '../src/entityFilter.js';

const opts = [
  { id: 'a', status: '启用' },
  { id: 'b', status: '停用' },
  { id: 'c', status: '启用' },
];

test('过滤停用项', () => {
  assert.deepEqual(filterRefOptions(opts, null, 'ref').map((o) => o.id), ['a', 'c']);
});

test('保留当前 record 已引用的停用项（单值 ref）', () => {
  assert.deepEqual(filterRefOptions(opts, { ref: 'b' }, 'ref').map((o) => o.id), ['a', 'b', 'c']);
});

test('保留当前 record 已引用的停用项（multiref 数组）', () => {
  assert.deepEqual(filterRefOptions(opts, { terms: ['b', 'c'] }, 'terms').map((o) => o.id), ['a', 'b', 'c']);
});

test('无 status 字段的实体不受过滤影响', () => {
  const noStatus = [{ id: 'x' }, { id: 'y' }];
  assert.deepEqual(filterRefOptions(noStatus, null, 'ref').map((o) => o.id), ['x', 'y']);
});
