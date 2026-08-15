import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import seed from './data.js';
import * as api from './api.js';

const DataContext = createContext(null);

// 静态主键映射兜底：即使 _entities 元信息异步未加载，security 也按 level 匹配，避免竞态时误用 'id' 把全部记录替换成同一条
const ID_KEY_FALLBACK = { security: 'level' };

export function DataProvider({ children }) {
  // 种子兜底：后端未启动时不白屏，降级为只读展示
  const [data, setData] = useState(seed);
  const [idKeys, setIdKeys] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [remote, meta] = await Promise.all([api.listAll(), api.getMeta()]);
        if (cancelled) return;
        setData((prev) => ({ ...prev, ...remote }));
        setIdKeys(meta.idKeys || {});
      } catch {
        // 后端未启动或失败：静默降级为种子只读
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const createRecord = useCallback(async (entity, payload) => {
    const record = await api.create(entity, payload);
    setData((prev) => ({ ...prev, [entity]: [...(prev[entity] || []), record] }));
    return record;
  }, []);

  const updateRecord = useCallback(
    async (entity, id, payload) => {
      const record = await api.update(entity, id, payload);
      const key = idKeys[entity] || ID_KEY_FALLBACK[entity] || 'id';
      setData((prev) => ({
        ...prev,
        [entity]: (prev[entity] || []).map((x) => (String(x[key]) === String(record[key]) ? record : x)),
      }));
      return record;
    },
    [idKeys],
  );

  return (
    <DataContext.Provider value={{ data, loaded, createRecord, updateRecord }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
