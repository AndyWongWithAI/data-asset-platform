import { useState } from 'react';

// 占位按钮：点击弹「开发中」提示。variant="primary" 顶部主入口 / variant="link" 行内文字操作。
export default function ComingSoonAction({ label = '新增', variant = 'primary' }) {
  const [open, setOpen] = useState(false);
  const cls = variant === 'link' ? 'link' : 'btn-primary';
  return (
    <>
      <button className={cls} onClick={() => setOpen(true)}>{label}</button>
      {open && (
        <div className="modal-mask" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>「{label}」功能开发中 —— 当前 Demo 仅演示，不支持运行时写入。</p>
            <button className="btn-primary" onClick={() => setOpen(false)}>知道了</button>
          </div>
        </div>
      )}
    </>
  );
}
