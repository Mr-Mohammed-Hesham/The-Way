import React from 'react';
import { AttendanceStatus, SessionStatus, ContractStatus, StudentStatus } from '../../types';

interface BadgeProps {
  status?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, className = '' }) => {
  let computedVariant = variant || 'default';
  let label = children;

  if (status) {
    switch (status) {
      // Attendance Statuses
      case AttendanceStatus.PRESENT:
        computedVariant = 'success';
        label = label || 'حاضر';
        break;
      case AttendanceStatus.ABSENT:
        computedVariant = 'danger';
        label = label || 'غائب';
        break;
      case AttendanceStatus.LATE:
        computedVariant = 'warning';
        label = label || 'متأخر';
        break;
      case AttendanceStatus.EXCUSED:
        computedVariant = 'info';
        label = label || 'معذور';
        break;

      // Session Statuses
      case SessionStatus.LIVE:
        computedVariant = 'success';
        label = label || 'جارية الآن (LIVE)';
        break;
      case SessionStatus.SCHEDULED:
        computedVariant = 'info';
        label = label || 'مجدولة';
        break;
      case SessionStatus.COMPLETED:
        computedVariant = 'purple';
        label = label || 'مكتملة';
        break;
      case SessionStatus.CANCELLED:
        computedVariant = 'danger';
        label = label || 'ملغية';
        break;
      case SessionStatus.RESCHEDULED:
        computedVariant = 'warning';
        label = label || 'معاد جدولتها';
        break;

      // Contract Statuses
      case ContractStatus.ACTIVE:
        computedVariant = 'success';
        label = label || 'ساري';
        break;
      case ContractStatus.EXPIRING_SOON:
        computedVariant = 'warning';
        label = label || 'ينتهي قريباً';
        break;
      case ContractStatus.EXPIRED:
        computedVariant = 'danger';
        label = label || 'منتهي';
        break;
      case ContractStatus.COMPLETED:
        computedVariant = 'purple';
        label = label || 'مكتمل';
        break;
      case ContractStatus.SUSPENDED:
        computedVariant = 'warning';
        label = label || 'معلق';
        break;

      // Student Statuses
      case StudentStatus.ACTIVE:
        computedVariant = 'success';
        label = label || 'نشط';
        break;
      case StudentStatus.INACTIVE:
        computedVariant = 'default';
        label = label || 'غير نشط';
        break;
      case StudentStatus.ARCHIVED:
        computedVariant = 'danger';
        label = label || 'مؤرشف';
        break;
      default:
        break;
    }
  }

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[computedVariant]} ${className}`}
    >
      {status === SessionStatus.LIVE && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block mr-0.5 ml-1" />
      )}
      {label}
    </span>
  );
};
