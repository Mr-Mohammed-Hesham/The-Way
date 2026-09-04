import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  BookOpen,
  GraduationCap,
  Users,
  DollarSign,
  Trash2,
  Edit,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../common/Modal';
import { ViewOnlyBanner } from '../../common/ViewOnlyBanner';
import { formatCurrency } from '../../../utils/formatters';

export const AssignmentsView: React.FC = () => {
  const {
    assignments,
    students,
    teachers,
    subjects,
    studentsMap,
    teachersMap,
    subjectsMap,
    addAssignment,
    deleteAssignment,
    settings,
    canEditSection
  } = useApp();

  const isEditable = canEditSection('assignments');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    teacherId: teachers[0]?.id || '',
    subjectId: subjects[0]?.id || '',
    ratePerSession: 150,
    startDate: new Date().toISOString().split('T')[0]
  });

  const filteredAssignments = assignments.filter(asg => {
    const q = searchQuery.toLowerCase().trim();
    const stName = (studentsMap[asg.studentId] || '').toLowerCase();
    const tcName = (teachersMap[asg.teacherId] || '').toLowerCase();
    const subName = (subjectsMap[asg.subjectId] || '').toLowerCase();
    return !q || stName.includes(q) || tcName.includes(q) || subName.includes(q);
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.teacherId || !formData.subjectId) return;

    addAssignment({
      studentId: formData.studentId,
      teacherId: formData.teacherId,
      subjectId: formData.subjectId,
      ratePerSession: formData.ratePerSession,
      startDate: formData.startDate,
      status: 'active'
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 text-right">
      {/* View Only Banner for restricted departments */}
      <ViewOnlyBanner section="assignments" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            تعيين المدرسين وتوزيع الطلاب (Teacher Assignments)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ربط الطلاب بالمدرسين المتخصصين لكل مادة دراسية وتحديد أجر الحصة
          </p>
        </div>

        {isEditable && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تعيين طالب لمدرس</span>
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
            placeholder="بحث باسم الطالب، المدرس، أو المادة..."
            className="w-full pr-9 pl-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssignments.map(asg => {
          const student = students.find(s => s.id === asg.studentId);
          const teacher = teachers.find(t => t.id === asg.teacherId);
          const subject = subjects.find(s => s.id === asg.subjectId);

          return (
            <div
              key={asg.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-200 transition-all text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {subject?.name || 'مادة'}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1.5">{student?.name || 'طالب'}</h4>
                  <p className="text-[11px] text-slate-400">{student?.grade}</p>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  نشط
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">المدرس المشرف:</span>
                  <span className="font-bold text-slate-900">{teacher?.name || 'مدرس'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">سعر الحصة:</span>
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(asg.ratePerSession, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400">تاريخ البدء:</span>
                  <span>{asg.startDate}</span>
                </div>
              </div>

              <div className="flex justify-end pt-1 border-t border-slate-100">
                <button
                  onClick={() => deleteAssignment(asg.id)}
                  className="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>إلغاء التعيين</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="تعيين طالب لمدرس جديد"
        subtitle="تحديد الطالب، المدرس، المادة الدراسية، وقيمة الحصة"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اختر الطالب</label>
            <select
              value={formData.studentId}
              onChange={e => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {students.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.grade})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اختر المدرس</label>
            <select
              value={formData.teacherId}
              onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {teachers.map(tc => (
                <option key={tc.id} value={tc.id}>
                  {tc.name} ({tc.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المادة الدراسية</label>
            <select
              value={formData.subjectId}
              onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {subjects.map(sb => (
                <option key={sb.id} value={sb.id}>
                  {sb.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              سعر الحصة للطالب ({settings.currency})
            </label>
            <input
              type="number"
              value={formData.ratePerSession}
              onChange={e => setFormData({ ...formData, ratePerSession: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              حفظ التعيين
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
