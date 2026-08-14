import { useState } from 'react';

export default function ComingSoonAction({ label = '新增' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>{label}</button>
      {open && (
        <div className="modal-mask" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>「{label}」功能二期后完善 —— 当前 Demo 只读展示，不支持运行时写入。</p>
            <button className="btn-primary" onClick={() => setOpen(false)}>知道了</button>
          </div>
        </div>
      )}
    </>
  );
}
