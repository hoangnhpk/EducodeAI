import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

// ============================================================
// Types
// ============================================================
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

// ============================================================
// Context
// ============================================================
const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

// ============================================================
// Icons (inline, no extra deps)
// ============================================================
const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

// ============================================================
// Provider + Container
// ============================================================
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="khm-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`khm-toast khm-toast-${t.type}`}>
            <span className={`khm-toast-icon khm-toast-icon-${t.type}`}>
              {icons[t.type]}
            </span>
            <span className="khm-toast-msg">{t.message}</span>
            <button className="khm-toast-close" onClick={() => remove(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ============================================================
// Standalone hook (for use outside provider - fallback)
// ============================================================
export function useToastStandalone() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const ToastContainer = () => (
    <div className="khm-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`khm-toast khm-toast-${t.type}`}>
          <span className={`khm-toast-icon khm-toast-icon-${t.type}`}>{icons[t.type]}</span>
          <span className="khm-toast-msg">{t.message}</span>
          <button className="khm-toast-close" onClick={() => remove(t.id)}>×</button>
        </div>
      ))}
    </div>
  );

  useEffect(() => {}, []); // keep stable ref

  return { showToast, ToastContainer };
}
