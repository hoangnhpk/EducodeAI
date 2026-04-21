import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const icon = variant === 'danger' ? '⚠' : '!';

  return (
    <div className="khm-modal-backdrop" onClick={onCancel}>
      <div
        className="khm-modal khm-confirm-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="khm-modal-body" style={{ textAlign: 'center', paddingTop: 28, paddingBottom: 8 }}>
          <div className={`khm-confirm-icon khm-confirm-icon-${variant}`}>
            {icon}
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--khm-gray-900)', marginBottom: 10 }}>
            {title}
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--khm-gray-600)', lineHeight: 1.6, margin: 0 }}>
            {message}
          </p>
        </div>
        <div className="khm-modal-footer" style={{ justifyContent: 'center', gap: 12, paddingTop: 20, paddingBottom: 24 }}>
          <button className="khm-btn khm-btn-outline khm-btn-sm" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </button>
          <button
            className={`khm-btn khm-btn-${variant === 'danger' ? 'danger' : 'accent'} khm-btn-sm`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="khm-spinner khm-spinner-sm" />
                Đang xử lý...
              </>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
