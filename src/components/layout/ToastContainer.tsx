import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />
  };

  const bgMap = {
    success: 'bg-emerald-50/95 border-emerald-200 text-emerald-950',
    error: 'bg-rose-50/95 border-rose-200 text-rose-950',
    warning: 'bg-amber-50/95 border-amber-200 text-amber-950',
    info: 'bg-sky-50/95 border-sky-200 text-sky-950'
  };

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-2xl border shadow-xl backdrop-blur-xs flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-5 text-right ${
            bgMap[toast.type]
          }`}
        >
          {iconMap[toast.type]}
          <div className="flex-1 text-xs">
            {toast.title && <h5 className="font-bold text-sm mb-0.5">{toast.title}</h5>}
            <p className="font-medium leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
