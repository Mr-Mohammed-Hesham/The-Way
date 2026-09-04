import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Users,
  Search,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../common/Modal';
import { ConfirmModal } from '../../common/ConfirmModal';
import { ViewOnlyBanner } from '../../common/ViewOnlyBanner';
import { Subject } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    teachers,
    sessions,
    addSubject,
    updateSubject,
    deleteSubject,
    settings,
    canEditSection
  } = useApp();

  const isEditable = canEditSection('subjects');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    gradeLevels: ['الثانوية العامة'],
    defaultSessionPrice: 150,
    color: '#4f46e5',
    description: ''
  });

  const handleOpenAdd = () => {
    setSubjectToEdit(null);
    setFormData({
      name: '',
      code: `SUB-${subjects.length + 1}`,
      gradeLevels: ['الصف الثالث الثانوي'],
      defaultSessionPrice: 150,
      color: '#4f46e5',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setSubjectToEdit(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      gradeLevels: subject.gradeLevels || [],
      defaultSessionPrice: subject.defaultSessionPrice,
      color: subject.color || '#4f46e5',
      description: subject.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (subjectToEdit) {
      updateSubject(subjectToEdit.id, formData);
    } else {
      addSubject(formData);
    }
    setIsModalOpen(false);
  };

  const filteredSubjects = subjects.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    return !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 text-right">
      {/* View Only Banner for restricted departments */}
      <ViewOnlyBanner section="subjects" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            إدارة المواد الدراسية والمناهج
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تحديد المواد، المراحل التعليمية، وتسعيرة الحصص الافتراضية
          </p>
        </div>

        {isEditable && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مادة دراسية</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute top-3 right-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المادة أو الكود..."
            className="w-full pr-9 pl-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map(sub => {
          const subjectTeachers = teachers.filter(t => t.subjectIds.includes(sub.id));
          const subjectSessions = sessions.filter(s => s.subjectId === sub.id);

          return (
            <div
              key={sub.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-200 transition-all text-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xs"
                    style={{ backgroundColor: sub.color || '#4f46e5' }}
                  >
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{sub.name}</h3>
                    <span className="font-mono text-[11px] text-slate-400">{sub.code}</span>
                  </div>
                </div>

                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  {formatCurrency(sub.defaultSessionPrice, settings.currency)} / حصة
                </span>
              </div>

              {/* Stats matrix */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">المدرسين المتاحين:</span>
                  <span className="font-bold text-slate-900">{subjectTeachers.length} مدرس</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">إجمالي الحصص:</span>
                  <span className="font-bold text-indigo-700">{subjectSessions.length} حصة</span>
                </div>
              </div>

              {/* Grade Levels */}
              <div>
                <span className="text-slate-400 block text-[10px] mb-1 font-bold">المراحل الدراسية:</span>
                <div className="flex flex-wrap gap-1">
                  {sub.gradeLevels.map((gr, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md"
                    >
                      {gr}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(sub)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSubjectToDelete(sub)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={subjectToEdit ? `تعديل المادة (${subjectToEdit.name})` : 'إضافة مادة دراسية جديدة'}
        subtitle="تحديد بيانات المنهج والمراحل والتسعيرة"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المادة</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: اللغة العربية / النحو والبلاغة"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود المادة</label>
              <input
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                سعر الحصة الافتراضي ({settings.currency})
              </label>
              <input
                type="number"
                value={formData.defaultSessionPrice}
                onChange={e => setFormData({ ...formData, defaultSessionPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">وصف المنهج أو تفاصيل المادة</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="ملاحظات حول المنهج الدراسي..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {subjectToEdit ? 'حفظ التعديلات' : 'إضافة المادة'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={() => {
          if (subjectToDelete) {
            deleteSubject(subjectToDelete.id);
          }
        }}
        title="تأكيد حذف المادة"
        message={`هل أنت متأكد من رغبتك في حذف المادة الدراسية "${subjectToDelete?.name}"؟`}
        confirmText="نعم، حذف المادة"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
};
