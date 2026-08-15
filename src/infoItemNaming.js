// 信息项命名：基于「基础术语」词根库的中文名拆词 + 英文名派生 + 命名校验。
// 前端（实时提示）与后端（提交兜底）共用同一套逻辑，保证口径一致（复用原则）。
// 不接大模型：翻译即「中文词根 → 英文名」查表（基础术语本身就是中英对照表）。

// 最大正向匹配拆词：词根按长度降序，从左到右贪心匹配；匹配不到的单字记作缺失。
// 返回 { segments, nameEn, termIds, missing, lastTerm, lastIsClassWord, errors }
export function analyzeNameCn(nameCn, baseTerms = []) {
  const terms = [...baseTerms].sort((a, b) => b.nameCn.length - a.nameCn.length);
  const segments = [];
  const termIds = [];
  let rest = String(nameCn ?? '').trim();

  while (rest.length > 0) {
    const hit = terms.find((t) => rest.startsWith(t.nameCn));
    if (hit) {
      segments.push({ text: hit.nameCn, nameEn: hit.nameEn, hit: true, isClassWord: hit.isClassWord === true });
      termIds.push(hit.id);
      rest = rest.slice(hit.nameCn.length);
    } else {
      segments.push({ text: rest[0], hit: false, isClassWord: false });
      rest = rest.slice(1);
    }
  }

  // 缺词根：连续未命中片段合并成一个整体（如「数据」而非「数」「据」），便于红字提示
  const missing = [];
  let i = 0;
  while (i < segments.length) {
    if (!segments[i].hit) {
      let text = '';
      while (i < segments.length && !segments[i].hit) {
        text += segments[i].text;
        i++;
      }
      missing.push(text);
    } else {
      i++;
    }
  }

  // 末位类词：取最后一个「命中」的词根（缺失片段本就不该存在，缺词根已单独报错）
  let lastTerm = null;
  for (let k = segments.length - 1; k >= 0; k--) {
    if (segments[k].hit) {
      lastTerm = segments[k];
      break;
    }
  }

  // 英文名：命中片段用 nameEn，缺失片段用原文占位（下划线拼接）；缺词根会阻止提交，占位仅作提示
  const nameEn = segments.map((s) => (s.hit ? s.nameEn : s.text)).join('_');

  const errors = [];
  if (missing.length) {
    errors.push(`缺少词根：${missing.join('、')}（请在基础术语中补充，或改用词根库内可拆分的名称）`);
  }
  // 末位类词只在「末位确实是命中词根」时判定；末尾若是缺失片段，缺词根已单独报错，不再误报末位
  const lastIsMissing = segments.length > 0 && !segments[segments.length - 1].hit;
  if (!lastIsMissing && lastTerm && !lastTerm.isClassWord) {
    errors.push(`末位「${lastTerm.text}」不是类词，末位应填入类词（可选：${classWordTerms(baseTerms).join('、')}）`);
  }

  return {
    segments,
    nameEn,
    termIds,
    missing,
    lastTerm,
    errors,
  };
}

// 可选类词清单（中文名），供末位非类词时提示
export function classWordTerms(baseTerms = []) {
  return baseTerms.filter((t) => t.isClassWord === true).map((t) => t.nameCn);
}
