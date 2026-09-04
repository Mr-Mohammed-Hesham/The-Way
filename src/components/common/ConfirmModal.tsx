import React from 'react';
import { AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  variant,
  type
}) => {
  const actualVariant = type || variant || 'danger';
  const actualConfirmText = confirmLabel || confirmText || 'تأكيد';
  const actualCancelText = cancelLabel || cancelText || 'إلغاء';

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const iconMap = {
    danger: <Trash2 className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <CheckCircle2 className="w-6 h-6 text-sky-600" />
  };

  const bgMap = {
    danger: 'bg-rose-50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50',
    warning: 'bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50',
    info: 'bg-sky-50 border-sky-100 dark:bg-sky-950/30 dark:border-sky-900/50'
  };

  const btnMap = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-rose-600/20',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-amber-600/20',
    info: 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500 shadow-sky-600/20'
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="md">
      <div className="space-y-4 text-right">
        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${bgMap[actualVariant]}`}>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs shrink-0">{iconMap[actualVariant]}</div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            {actualCancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all shadow-md cursor-pointer ${btnMap[actualVariant]}`}
          >
            {actualConfirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
