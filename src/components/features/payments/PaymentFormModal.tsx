import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { PaymentMethod } from '../../../types';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStudentId?: string;
  defaultContractId?: string;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  defaultStudentId,
  defaultContractId
}) => {
  const { students, contracts, addPayment, settings, currentUser } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    studentId: defaultStudentId || students[0]?.id || '',
    contractId: defaultContractId || '',
    amount: 500,
    paymentMethod: PaymentMethod.CASH,
    date: todayStr,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      studentId: defaultStudentId || students[0]?.id || '',
      contractId: defaultContractId || '',
      amount: 500,
      paymentMethod: PaymentMethod.CASH,
      date: todayStr,
      notes: ''
    });
    setErrors({});
  }, [defaultStudentId, defaultContractId, isOpen, students, todayStr]);

  const studentContracts = contracts.filter(c => c.studentId === formData.studentId);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.studentId) errs.studentId = 'يرجى اختيار الطالب';
    if (formData.amount <= 0) errs.amount = 'المبلغ يجب أن يكون أكبر من الصفر';
    if (!formData.date) errs.date = 'التاريخ مطلوب';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addPayment({
      studentId: formData.studentId,
      contractId: formData.contractId || undefined,
      amount: formData.amount,
      paymentMethod: formData.paymentMethod,
      date: formData.date,
      collectedByUserId: currentUser.id,
      notes: formData.notes
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تحصيل دفعة مالية وإصدار سند قبض"
      subtitle="تسجيل الدفعة بالخزينة وإصدار إيصال رسمي فوري للطالب وولي الأمر"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            اسم الطالب <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.studentId}
            onChange={e => setFormData({ ...formData, studentId: e.target.value, contractId: '' })}
            className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {students.map(st => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.grade} - {st.code})
              </option>
            ))}
          </select>
          {errors.studentId && <p className="text-[11px] text-rose-500 mt-1">{errors.studentId}</p>}
        </div>

        {studentContracts.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ربط بسند العقد / الاشتراك (اختياري)
            </label>
            <select
              value={formData.contractId}
              onChange={e => setFormData({ ...formData, contractId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">-- سداد رسوم عامة / دفعة مباشرة --</option>
              {studentContracts.map(cnt => (
                <option key={cnt.id} value={cnt.id}>
                  {cnt.contractNumber} (إجمالي: {cnt.totalPrice} ج.م | حصص: {cnt.totalSessions})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              المبلغ المدفوع ({settings.currency}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2 text-sm font-black rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {errors.amount && <p className="text-[11px] text-rose-500 mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">طريقة السداد</label>
            <select
              value={formData.paymentMethod}
              onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value={PaymentMethod.CASH}>نقداً (Cash)</option>
              <option value={PaymentMethod.BANK_TRANSFER}>تحويل بنكي / إنستاباي / محفظة</option>
              <option value={PaymentMethod.CARD}>بطاقة ائتمان / فيزا</option>
              <option value={PaymentMethod.OTHER}>أخرى</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ التحصيل</label>
          <input
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">البيان / ملاحظات الإيصال</label>
          <input
            type="text"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="مثال: دفعة أولى من اشتراك الفصل الدراسي..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
          >
            تحصيل وإصدار سند القبض
          </button>
        </div>
      </form>
    </Modal>
  );
};
