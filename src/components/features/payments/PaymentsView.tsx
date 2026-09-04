import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Printer,
  Calendar,
  Banknote,
  DollarSign,
  Download,
  Receipt,
  User
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatCard } from '../../common/StatCard';
import { ViewOnlyBanner } from '../../common/ViewOnlyBanner';
import { formatCurrency, formatArabicDate } from '../../../utils/formatters';

interface PaymentsViewProps {
  onOpenAddPayment: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ onOpenAddPayment }) => {
  const {
    payments,
    students,
    contracts,
    users,
    studentsMap,
    setActiveReceiptPayment,
    settings,
    canEditSection
  } = useApp();

  const isEditable = canEditSection('payments');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('all');

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const cashTotal = payments
    .filter(p => p.paymentMethod === 'cash')
    .reduce((acc, p) => acc + p.amount, 0);
  const transferTotal = payments
    .filter(p => p.paymentMethod === 'bank_transfer')
    .reduce((acc, p) => acc + p.amount, 0);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const stName = (studentsMap[p.studentId] || '').toLowerCase();
      const matchesSearch = !q || p.receiptNumber.toLowerCase().includes(q) || stName.includes(q);
      const matchesMethod = selectedMethod === 'all' || p.paymentMethod === selectedMethod;
      return matchesSearch && matchesMethod;
    });
  }, [payments, searchQuery, selectedMethod, studentsMap]);

  const methodLabels: Record<string, string> = {
    cash: 'نقداً',
    bank_transfer: 'إنستاباي / بنكي',
    card: 'بطاقة فيزا/مدى',
    other: 'أخرى'
  };

  return (
    <div className="space-y-6 text-right">
      {/* View Only Banner for restricted departments */}
      <ViewOnlyBanner section="payments" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            سجل المدفوعات وسندات القبض المالية
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة التحصيلات، إصدار الإيصالات المعتمدة، ومتابعة الخزينة والتحويلات
          </p>
        </div>

        {isEditable && (
          <button
            onClick={onOpenAddPayment}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تحصيل دفعة مالية جديدة</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="إجمالي المتحصلات"
          value={formatCurrency(totalCollected, settings.currency)}
          subtitle={`إجمالي ${payments.length} سند قبض`}
          icon={Banknote}
          color="emerald"
        />
        <StatCard
          title="متحصلات الخزينة (نقداً)"
          value={formatCurrency(cashTotal, settings.currency)}
          subtitle="سندات القبض النقدية"
          icon={CreditCard}
          color="indigo"
        />
        <StatCard
          title="تحويلات إنستاباي / بنكية"
          value={formatCurrency(transferTotal, settings.currency)}
          subtitle="محافظ إلكترونية وتحويلات"
          icon={DollarSign}
          color="sky"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-3 right-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الإيصال أو اسم الطالب..."
              className="w-full pr-9 pl-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedMethod}
            onChange={e => setSelectedMethod(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كافة طرق السداد</option>
            <option value="cash">نقداً (Cash)</option>
            <option value="bank_transfer">تحويل بنكي / إنستاباي</option>
            <option value="card">بطاقة ائتمان / فيزا</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold">
                <th className="py-3.5 px-4">رقم الإيصال</th>
                <th className="py-3.5 px-4">الطالب</th>
                <th className="py-3.5 px-4">المبلغ</th>
                <th className="py-3.5 px-4">طريقة السداد</th>
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-4">البيان والملاحظات</th>
                <th className="py-3.5 px-4 text-center">الإيصال</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(payment => {
                const student = students.find(s => s.id === payment.studentId);
                return (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {payment.receiptNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{student?.name || 'طالب'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{student?.code}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-black text-emerald-700 text-sm font-mono">
                        {formatCurrency(payment.amount, settings.currency)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700">
                        {methodLabels[payment.paymentMethod] || payment.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700">{payment.date}</td>

                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {payment.notes || 'سداد رسوم تعليمية'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setActiveReceiptPayment(payment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl font-bold transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-600" />
                        <span>عرض وطباعة</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
