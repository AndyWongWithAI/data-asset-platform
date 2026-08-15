// Express 路由薄封装：只做 HTTP → store 的映射，不含业务逻辑
import express from 'express';
import { READABLE, ENTITIES, CREATABLE, UPDATABLE, idKeyOf, getState, getOne, create, update } from './store.js';

const STATUS = { not_found: 404, not_supported: 405, invalid: 400 };

export function createApp() {
  const app = express();
  app.use(express.json());

  // GET /api/v1/_entities —— 实体元信息（必须在 /:entity 之前注册，否则被当成实体名）
  app.get('/api/v1/_entities', (req, res) => {
    res.json({
      entities: READABLE,
      idKeys: Object.fromEntries(ENTITIES.map((e) => [e, idKeyOf(e)])),
      creatable: CREATABLE,
      updatable: UPDATABLE,
    });
  });

  // GET /api/v1/:entity —— 读实体列表（全部可读实体，含 bizDomains/fields 供 P1 关联下拉）
  app.get('/api/v1/:entity', (req, res) => {
    const { entity } = req.params;
    if (!READABLE.includes(entity)) return res.status(404).json({ error: `未知实体 ${entity}` });
    res.json(getState()[entity]);
  });

  // GET /api/v1/:entity/:id —— 读单条
  app.get('/api/v1/:entity/:id', (req, res) => {
    const { entity, id } = req.params;
    if (!READABLE.includes(entity)) return res.status(404).json({ error: `未知实体 ${entity}` });
    const record = getOne(entity, id);
    if (!record) return res.status(404).json({ error: `未找到 ${entity} 中 ${id}` });
    res.json(record);
  });

  // POST /api/v1/:entity —— 新增（6 个 creatable 实体）
  app.post('/api/v1/:entity', (req, res) => {
    const { entity } = req.params;
    const result = create(entity, req.body || {});
    if (!result.ok) return res.status(STATUS[result.code] || 400).json({ errors: result.errors });
    res.status(201).json(result.record);
  });

  // PUT /api/v1/:entity/:id —— 修改（security 分级调整按 level 定位）
  app.put('/api/v1/:entity/:id', (req, res) => {
    const { entity, id } = req.params;
    const result = update(entity, id, req.body || {});
    if (!result.ok) return res.status(STATUS[result.code] || 400).json({ errors: result.errors });
    res.json(result.record);
  });

  // 统一 JSON 错误处理（非法 JSON body 等）
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: '请求体不是合法 JSON' });
    res.status(500).json({ error: '服务器内部错误' });
  });

  return app;
}
