import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { Teacher, TeacherStatus } from '../../../types';

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherToEdit?: Teacher | null;
}

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  onClose,
  teacherToEdit
}) => {
  const { subjects, addTeacher, updateTeacher } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    rateType: 'percentage' as 'percentage' | 'hourly' | 'fixed_per_student',
    defaultRate: 70,
    subjectIds: [] as string[],
    status: TeacherStatus.ACTIVE,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (teacherToEdit) {
      setFormData({
        name: teacherToEdit.name,
        phone: teacherToEdit.phone,
        email: teacherToEdit.email || '',
        rateType: teacherToEdit.rateType,
        defaultRate: teacherToEdit.defaultRate,
        subjectIds: teacherToEdit.subjectIds || [],
        status: teacherToEdit.status,
        notes: teacherToEdit.notes || ''
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        rateType: 'percentage',
        defaultRate: 70,
        subjectIds: subjects.length > 0 ? [subjects[0].id] : [],
        status: TeacherStatus.ACTIVE,
        notes: ''
      });
    }
    setErrors({});
  }, [isOpen, teacherToEdit?.id]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'اسم المدرس مطلوب';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const assignedSubjects = formData.subjectIds.length > 0
        ? formData.subjectIds
        : (subjects.length > 0 ? [subjects[0].id] : []);

      const safePhone = formData.phone.trim() || '01000000000';
      const safeRate = formData.defaultRate > 0 ? formData.defaultRate : 70;

      if (teacherToEdit) {
        updateTeacher(teacherToEdit.id, {
          name: formData.name.trim(),
          phone: safePhone,
          email: formData.email.trim(),
          rateType: formData.rateType,
          defaultRate: safeRate,
          subjectIds: assignedSubjects,
          status: formData.status,
          notes: formData.notes.trim()
        });
      } else {
        addTeacher({
          name: formData.name.trim(),
          phone: safePhone,
          email: formData.email.trim(),
          rateType: formData.rateType,
          defaultRate: safeRate,
          subjectIds: assignedSubjects,
          status: formData.status,
          notes: formData.notes.trim(),
          color: '#4f46e5'
        });
      }
      onClose();
    } catch (err) {
      console.error('Error submitting teacher form:', err);
    }
  };

  const toggleSubject = (id: string) => {
    setFormData(prev => {
      const exists = prev.subjectIds.includes(id);
      return {
        ...prev,
        subjectIds: exists ? prev.subjectIds.filter(sId => sId !== id) : [...prev.subjectIds, id]
      };
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={teacherToEdit ? `تعديل بيانات المدرس (${teacherToEdit.name})` : 'إضافة مدرس جديد لطاقم التدريس'}
      subtitle="تحديد بيانات الاتصال، التخصص، ونموذج المحاسبة المالية"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-right">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم المدرس الكامل <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: أ. حسام عثمان"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رقم الهاتف
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="مثال: 01012345678"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="مثال: teacher@center.com"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">حالة العمل</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as TeacherStatus })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value={TeacherStatus.ACTIVE}>نشط (Active)</option>
              <option value={TeacherStatus.INACTIVE}>غير نشط</option>
              <option value={TeacherStatus.ON_LEAVE}>في إجازة</option>
            </select>
          </div>
        </div>

        {/* Financial Rate Model */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">طريقة المحاسبة المالية للمدرس</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">نموذج الأجر</label>
              <select
                value={formData.rateType}
                onChange={e =>
                  setFormData({
                    ...formData,
                    rateType: e.target.value as any
                  })
                }
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="percentage">نسبة مئوية من إجمالي الحصة (%)</option>
                <option value="hourly">أجر ثابت بالساعة (ج.م / ساعة)</option>
                <option value="fixed_per_student">مبلغ ثابت لكل طالب حاضر (ج.م / طالب)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {formData.rateType === 'percentage'
                  ? 'النسبة المئوية للمدرس (%)'
                  : formData.rateType === 'hourly'
                  ? 'الأجر بالساعة (ج.م)'
                  : 'المبلغ لكل طالب (ج.م)'}
              </label>
              <input
                type="number"
                value={formData.defaultRate}
                onChange={e => setFormData({ ...formData, defaultRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Subjects */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">المواد التي يدرسها بالمركز</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {subjects.map(sub => {
              const isSelected = formData.subjectIds.includes(sub.id);
              return (
                <button
                  type="button"
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  className={`p-2 rounded-xl border text-right transition-all text-xs font-bold cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{sub.name}</span>
                    <span>{isSelected ? '✓' : ''}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">ملاحظات إدارية</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="ملاحظات حول أوقات التفرغ أو الاتفاق المالي..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {teacherToEdit ? 'حفظ التعديلات' : 'إضافة المدرس'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
