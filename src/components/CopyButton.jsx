import { useState } from 'react';

// 复制按钮：点击复制文本到剪贴板，成功短暂显示「已复制」。纯前端，无后端。
export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 复制失败（非 secure context 等）静默忽略
    }
  };
  return (
    <button className="link" onClick={copy}>{copied ? '已复制' : '复制'}</button>
  );
}
