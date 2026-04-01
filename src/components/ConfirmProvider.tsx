import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ options, resolve });
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      if (!pending) return;
      pending.resolve(result);
      setPending(null);
    },
    [pending],
  );

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {pending && (
        <div className="confirm-overlay" role="presentation" onClick={() => close(false)}>
          <div
            className="confirm-dialog card"
            role="dialog"
            aria-modal="true"
            aria-label={pending.options.title}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="confirm-title">{pending.options.title}</h2>
            <p className="confirm-message">{pending.options.message}</p>
            <div className="confirm-actions">
              <button
                type="button"
                className="button-ghost"
                onClick={() => close(false)}
              >
                {pending.options.cancelText ?? "取消"}
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={() => close(true)}
              >
                {pending.options.confirmText ?? "确定"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return ctx;
}
