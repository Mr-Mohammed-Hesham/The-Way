import React from 'react';
import { Printer, MapPin, Phone, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatArabicDate } from '../../utils/formatters';
import { TheWayLogo } from './TheWayLogo';
import { Payment } from '../../types';

interface ReceiptModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  payment?: Payment | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  payment
}) => {
  const { activeReceiptPayment, setActiveReceiptPayment, students, contracts, subjects, settings, users } = useApp();

  const currentPayment = payment || activeReceiptPayment;
  const isVisible = isOpen !== undefined ? isOpen : !!currentPayment;

  if (!isVisible || !currentPayment) return null;

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
    setActiveReceiptPayment(null);
  };

  const student = students.find(s => s.id === currentPayment.studentId);
  const contract = contracts.find(c => c.id === currentPayment.contractId);
  const collector = users.find(u => u.id === currentPayment.collectedByUserId);

  const contractSubjects = contract
    ? subjects.filter(s => contract.subjectIds.includes(s.id)).map(s => s.name).join('، ')
    : 'رسوم دراسية عامة';

  const paymentMethodLabels: Record<string, string> = {
    cash: 'نقداً (Cash)',
    bank_transfer: 'تحويل بنكي / إنستاباي / محفظة إلكترونية',
    card: 'بطاقة ائتمان / مدى (Card)',
    other: 'أخرى'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Controls Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              طباعة إيصال القبض
            </button>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 space-y-6 text-slate-800" id="printable-receipt">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div className="space-y-1">
              <TheWayLogo size="sm" />
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {settings.address}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                {settings.phone}
              </p>
            </div>
            <div className="text-left">
              <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-[11px] font-bold text-blue-900">سند قبض مالي</p>
                <p className="text-sm font-black text-blue-700 font-mono">{currentPayment.receiptNumber}</p>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">{formatArabicDate(currentPayment.date)}</p>
            </div>
          </div>

          {/* Student & Payment Summary Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">اسم الطالب:</span>
                <span className="font-bold text-slate-900 text-sm">{student?.name || '---'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">كود الطالب:</span>
                <span className="font-bold text-slate-900 font-mono">{student?.code || '---'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">الصف / المرحلة:</span>
                <span className="font-semibold text-slate-800">{student?.grade || '---'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">رقم العقد:</span>
                <span className="font-semibold text-slate-800 font-mono">{contract?.contractNumber || 'سداد مباشر'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-xs">
              <span className="text-slate-500 block">المواد الدراسية:</span>
              <span className="font-medium text-slate-800">{contractSubjects}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 block">المبلغ المدفوع:</span>
              <span className="text-2xl font-black text-emerald-950">
                {formatCurrency(currentPayment.amount, settings.currency)}
              </span>
            </div>
            <div className="text-left text-xs text-emerald-900">
              <span className="block font-medium">طريقة السداد:</span>
              <span className="font-bold">{paymentMethodLabels[currentPayment.paymentMethod] || 'نقداً'}</span>
            </div>
          </div>

          {/* Notes */}
          {currentPayment.notes && (
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700">ملاحظات / البيان: </span>
              {currentPayment.notes}
            </div>
          )}

          {/* Signatures & Footer */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-500 mb-8 font-medium">المستلم / الخزينة</p>
              <p className="font-bold text-slate-900 border-t border-dashed border-slate-300 pt-2">
                {collector?.name || 'مكتب الاستقبال والخزينة'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-8 font-medium">توقيع ولي الأمر / الطالب</p>
              <p className="font-bold text-slate-900 border-t border-dashed border-slate-300 pt-2">
                ..........................................
              </p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            شكراً لثقتكم في {settings.centerName} • للاستفسار: {settings.phone} • الإيصال صالح كإثبات سداد رسمي
          </div>
        </div>
      </div>
    </div>
  );
};
