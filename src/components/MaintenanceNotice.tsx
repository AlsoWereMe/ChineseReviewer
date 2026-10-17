import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "chinese-reviewer-maintenance-notice-acknowledged-v1";

export function MaintenanceNotice() {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "true";
    } catch {
      return true;
    }
  });
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function acknowledge() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Still allow dismissal when browser storage is unavailable.
    }
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="maintenance-notice"
      aria-labelledby="maintenance-notice-title"
      aria-describedby="maintenance-notice-description"
      onCancel={() => setIsOpen(false)}
    >
      <div className="maintenance-notice-content">
        <p className="eyebrow">网站公告</p>
        <h2 id="maintenance-notice-title" className="confirm-title">
          本站已停止维护
        </h2>
        <div id="maintenance-notice-description" className="maintenance-notice-copy">
          <p className="confirm-message">
            本网站已不再维护，后续将不再更新内容或修复问题。
          </p>
          <p className="confirm-message">
            现有题目、答案与解析可能存在错误或过时内容，请谨慎使用，并结合教材等可靠资料核对。
          </p>
          <p className="maintenance-notice-next">
            后续将推出新网站<strong>「星汉」</strong>，敬请期待。
          </p>
        </div>
        <button
          type="button"
          className="button-primary"
          autoFocus
          onClick={acknowledge}
        >
          我已知晓，谨慎使用
        </button>
      </div>
    </dialog>
  );
}
