import React, { useState, useMemo } from 'react';
import { ShieldCheck, Search, Filter, Clock, User, FileText, Download, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { AuditAction } from '../../../types';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('all');

  const entityTypeLabels: Record<string, string> = {
    student: 'شؤون الطلاب',
    teacher: 'المدرسين',
    session: 'الحصص والجداول',
    contract: 'العقود والاشتراكات',
    payment: 'المدفوعات وسندات القبض',
    teacherpayment: 'مستحقات المدرسين',
    attendance: 'تسجيل الحضور',
    room: 'القاعات والمعامل',
    subject: 'المواد والمناهج',
    user: 'المستخدمين والصلاحيات',
    assignment: 'تعيينات المدرسين'
  };

  const normalizeEntityType = (type: string): string => {
    const key = (type || '').toLowerCase().replace(/[^a-z]/g, '');
    return entityTypeLabels[key] || type || 'عام';
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case AuditAction.CREATE:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">إضافة جديدة +</span>;
      case AuditAction.UPDATE:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">تعديل بيانات ✎</span>;
      case AuditAction.DELETE:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">حذف نهائي ✕</span>;
      case AuditAction.ARCHIVE:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">أرشفة سجل</span>;
      case AuditAction.PAYMENT_RECORDED:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">سند قبض مالي</span>;
      case AuditAction.ATTENDANCE_MARKED:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">تسجيل حضور</span>;
      case AuditAction.TEACHER_ASSIGNED:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">تعيين مدرس</span>;
      case AuditAction.STATUS_CHANGED:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">تغيير حالة</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{action}</span>;
    }
  };

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (log.userName || '').toLowerCase().includes(q) ||
        (log.action || '').toLowerCase().includes(q) ||
        (log.details || '').toLowerCase().includes(q) ||
        (log.entityName || '').toLowerCase().includes(q) ||
        (log.entityType || '').toLowerCase().includes(q);

      const logKey = (log.entityType || '').toLowerCase().replace(/[^a-z]/g, '');
      const matchesEntity = selectedEntity === 'all' || logKey === selectedEntity.toLowerCase();

      return matchesSearch && matchesEntity;
    });
  }, [auditLogs, searchQuery, selectedEntity]);

  const handleExportCSV = () => {
    const headers = ['التاريخ والتوقيت', 'المستخدم المنفذ', 'القسم', 'نوع الإجراء', 'العنصر', 'التفاصيل'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.userName || 'المستخدم'}"`,
      `"${normalizeEntityType(l.entityType)}"`,
      `"${l.action}"`,
      `"${l.entityName || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              لوحة المتغيرات وسجل العمليات الحية (Live Audit & Activity Trail)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            سجل حي وتفاعلي يوثق كافة العمليات الإدارية والمالية والأكاديمية المنفذة في النظام في الوقت الفعلي
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير السجل</span>
          </button>
          <span className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 text-xs font-bold rounded-2xl font-mono">
            {filteredLogs.length} عملية حية
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-3 right-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث باسم المنفذ، الطالب، الكود، أو نص الإجراء..."
              className="w-full pr-9 pl-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedEntity}
            onChange={e => setSelectedEntity(e.target.value)}
            className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كافة الأقسام والموديولات</option>
            <option value="student">شؤون الطلاب</option>
            <option value="teacher">طاقم التدريس</option>
            <option value="session">الحصص والجداول</option>
            <option value="contract">العقود والاشتراكات</option>
            <option value="payment">المدفوعات وسندات القبض</option>
            <option value="teacherpayment">مستحقات المدرسين</option>
            <option value="attendance">تسجيل الحضور</option>
            <option value="room">القاعات والمعامل</option>
            <option value="subject">المواد والمناهج</option>
            <option value="user">المستخدمين والصلاحيات</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold">
                <th className="py-3.5 px-4">التوقيت والتاريخ</th>
                <th className="py-3.5 px-4">المستخدم المنفذ</th>
                <th className="py-3.5 px-4">القسم</th>
                <th className="py-3.5 px-4">نوع الإجراء</th>
                <th className="py-3.5 px-4">تفاصيل العملية والبيانات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                    لا توجد سجلات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{log.timestamp}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                          {log.userName || 'أ. ولاء حمدان (المدير العام)'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {normalizeEntityType(log.entityType)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {getActionBadge(log.action)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        <p className="font-medium leading-relaxed">{log.details}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
