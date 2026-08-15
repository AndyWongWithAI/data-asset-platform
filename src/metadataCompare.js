// 生产元数据快照 vs 设计态元数据 比对（纯函数，不依赖 React，可 node --test）
// 对齐键：表 nameEn、字段 business.code。
//
// 差异分类：
// - 表级：生产表 nameEn 不在设计态 → unregistered；设计态表 dbId ∈ 被采集 targetDatabaseId 集合
//   且 nameEn 不在该生产库采集清单 → offline。
// - 字段级（仅对已登记表）：生产 code 不在设计态 → unregistered；设计态 code 不在生产 → offline；
//   都有但 type 或 nameCn 不一致 → drift（记录 drift 维度数组）。
export function compareMetadata(prodMetadatas, tables, fields) {
  const tableDiffs = [];
  const fieldDiffs = [];

  // 设计态表 nameEn -> table
  const designedTablesByName = new Map(tables.map((t) => [t.nameEn, t]));

  // 被采集 targetDatabaseId 集合 + 每库生产表清单（nameEn）
  const prodTablesByDb = new Map();
  for (const pm of prodMetadatas) {
    if (!prodTablesByDb.has(pm.targetDatabaseId)) prodTablesByDb.set(pm.targetDatabaseId, new Set());
    for (const t of pm.tables) prodTablesByDb.get(pm.targetDatabaseId).add(t.nameEn);
  }
  const collectedDbIds = new Set(prodTablesByDb.keys());

  // ===== 表级：未登记（生产表 nameEn 不在设计态）=====
  for (const pm of prodMetadatas) {
    for (const t of pm.tables) {
      if (!designedTablesByName.has(t.nameEn)) {
        tableDiffs.push({
          type: 'unregistered',
          prod: { nameEn: t.nameEn, nameCn: t.nameCn, databaseName: pm.databaseName, targetDatabaseId: pm.targetDatabaseId },
          designed: null,
        });
      }
    }
  }

  // ===== 表级：疑似下线（设计态表 dbId 被采集 且 nameEn 不在该生产库清单）=====
  for (const t of tables) {
    if (collectedDbIds.has(t.dbId)) {
      const prodList = prodTablesByDb.get(t.dbId) || new Set();
      if (!prodList.has(t.nameEn)) {
        tableDiffs.push({
          type: 'offline',
          prod: null,
          designed: { tableId: t.id, nameEn: t.nameEn, nameCn: t.nameCn, dbId: t.dbId },
        });
      }
    }
  }

  // ===== 字段级（仅对已登记表：生产表 nameEn 在设计态）=====
  // 设计态字段索引：tableId -> Map(code -> field)
  const fieldsByTable = new Map();
  for (const f of fields) {
    if (!fieldsByTable.has(f.tableId)) fieldsByTable.set(f.tableId, new Map());
    fieldsByTable.get(f.tableId).set(f.business.code, f);
  }

  for (const pm of prodMetadatas) {
    for (const pt of pm.tables) {
      const designedTable = designedTablesByName.get(pt.nameEn);
      if (!designedTable) continue; // 未登记表：字段级不比对
      const designedFields = fieldsByTable.get(designedTable.id) || new Map();
      const prodFieldCodes = new Set(pt.fields.map((f) => f.code));

      // 未登记字段 + 漂移字段
      for (const pf of pt.fields) {
        const df = designedFields.get(pf.code);
        if (!df) {
          fieldDiffs.push({
            type: 'unregistered',
            table: { tableId: designedTable.id, nameEn: designedTable.nameEn, nameCn: designedTable.nameCn },
            prod: { code: pf.code, nameCn: pf.nameCn, type: pf.type },
            designed: null,
          });
        } else {
          const drift = [];
          if (df.technical.type !== pf.type) drift.push('type');
          if (df.business.nameCn !== pf.nameCn) drift.push('nameCn');
          if (drift.length > 0) {
            fieldDiffs.push({
              type: 'drift',
              table: { tableId: designedTable.id, nameEn: designedTable.nameEn, nameCn: designedTable.nameCn },
              prod: { code: pf.code, nameCn: pf.nameCn, type: pf.type },
              designed: { code: df.business.code, nameCn: df.business.nameCn, type: df.technical.type },
              drift,
            });
          }
        }
      }

      // 疑似下线字段（设计态 code 不在生产）
      for (const [code, df] of designedFields) {
        if (!prodFieldCodes.has(code)) {
          fieldDiffs.push({
            type: 'offline',
            table: { tableId: designedTable.id, nameEn: designedTable.nameEn, nameCn: designedTable.nameCn },
            prod: null,
            designed: { code: df.business.code, nameCn: df.business.nameCn, type: df.technical.type },
          });
        }
      }
    }
  }

  const summary = {
    unregisteredTables: tableDiffs.filter((d) => d.type === 'unregistered').length,
    offlineTables: tableDiffs.filter((d) => d.type === 'offline').length,
    unregisteredFields: fieldDiffs.filter((d) => d.type === 'unregistered').length,
    offlineFields: fieldDiffs.filter((d) => d.type === 'offline').length,
    driftedFields: fieldDiffs.filter((d) => d.type === 'drift').length,
  };

  return { tableDiffs, fieldDiffs, summary };
}
