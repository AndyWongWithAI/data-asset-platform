// fetch 封装：前端接入后端 /api/v1 的唯一入口
const BASE = '/api/v1';

// 读实体列表 → json 数组
export async function list(entity) {
  const res = await fetch(`${BASE}/${entity}`);
  if (!res.ok) throw new Error(`读取 ${entity} 失败（HTTP ${res.status}）`);
  return res.json();
}

// 读实体元信息（7 实体的 idKey / creatable / updatable + 全可读实体列表）
export async function getMeta() {
  const res = await fetch(`${BASE}/_entities`);
  if (!res.ok) throw new Error(`读取实体元信息失败（HTTP ${res.status}）`);
  return res.json();
}

// 并发拉取全部可读实体，返回 { [entity]: [...] }（不含 meta）
export async function listAll() {
  const meta = await getMeta();
  const entries = await Promise.all(meta.entities.map(async (entity) => [entity, await list(entity)]));
  return Object.fromEntries(entries);
}

// 非 ok 响应读 body.errors 数组，拼接为可读中文错误
async function readErrors(res) {
  let errors = [];
  try {
    const body = await res.json();
    if (Array.isArray(body.errors)) errors = body.errors;
  } catch {
    // 忽略非 JSON 错误体
  }
  return errors;
}

async function write(method, url, payload) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('后端服务未启动，无法写入');
  }
  if (!res.ok) {
    const errors = await readErrors(res);
    throw new Error(errors.length ? errors.join('；') : `写入失败（HTTP ${res.status}）`);
  }
  return res.json();
}

export function create(entity, payload) {
  return write('POST', `${BASE}/${entity}`, payload);
}

export function update(entity, id, payload) {
  return write('PUT', `${BASE}/${entity}/${id}`, payload);
}
