import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  BookOpen,
  UserCheck,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import { ConfirmModal } from '../../common/ConfirmModal';
import { ViewOnlyBanner } from '../../common/ViewOnlyBanner';
import { Teacher, TeacherStatus } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

interface TeachersViewProps {
  onOpenAddTeacher: () => void;
  onOpenEditTeacher: (teacher: Teacher) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  onOpenAddTeacher,
  onOpenEditTeacher
}) => {
  const {
    teachers,
    subjects,
    sessions,
    assignments,
    setSelectedTeacherId,
    deleteTeacher,
    subjectsMap,
    settings,
    canEditSection
  } = useApp();

  const isEditable = canEditSection('teachers');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.phone.includes(q);

      const matchesSubject =
        selectedSubject === 'all' || t.subjectIds.includes(selectedSubject);
      const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [teachers, searchQuery, selectedSubject, selectedStatus]);

  const rateLabels: Record<string, string> = {
    percentage: 'نسبة %',
    hourly: 'بالساعة',
    fixed_per_student: 'لكل طالب'
  };

  return (
    <div className="space-y-6 text-right">
      {/* View Only Banner for restricted departments */}
      <ViewOnlyBanner section="teachers" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            إدارة طاقم التدريس والمساعدين
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إجمالي {teachers.length} مدرسين معتمدين بالمركز
          </p>
        </div>

        {isEditable && (
          <button
            onClick={onOpenAddTeacher}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مدرس جديد</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-3 right-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الكود، هاتف المدرس..."
              className="w-full pr-9 pl-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كافة التخصصات والمواد</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كافة الحالات</option>
            <option value={TeacherStatus.ACTIVE}>نشط (Active)</option>
            <option value={TeacherStatus.INACTIVE}>غير نشط</option>
            <option value={TeacherStatus.ON_LEAVE}>في إجازة</option>
          </select>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map(teacher => {
          const teacherSessions = sessions.filter(s => s.teacherId === teacher.id);
          const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id);

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-200 transition-all text-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-xs"
                    style={{ backgroundColor: teacher.color || '#4f46e5' }}
                  >
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3
                      onClick={() => setSelectedTeacherId(teacher.id)}
                      className="font-bold text-sm text-slate-900 cursor-pointer hover:text-indigo-600"
                    >
                      {teacher.name}
                    </h3>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {teacher.code}
                    </span>
                  </div>
                </div>
                <Badge status={teacher.status} />
              </div>

              {/* Specialization Subjects */}
              <div className="flex flex-wrap gap-1">
                {teacher.subjectIds.map(subId => (
                  <span
                    key={subId}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md"
                  >
                    {subjectsMap[subId] || 'مادة'}
                  </span>
                ))}
              </div>

              {/* Metrics Box */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">الطلاب:</span>
                  <span className="font-bold text-slate-900">{teacherAssignments.length}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">الحصص:</span>
                  <span className="font-bold text-indigo-700">{teacherSessions.length}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">نظام الأجر:</span>
                  <span className="font-bold text-emerald-700">
                    {teacher.defaultRate}
                    {teacher.rateType === 'percentage' ? '%' : ' ج.م'}
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="text-slate-500 font-mono space-y-1">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{teacher.phone}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedTeacherId(teacher.id)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  الملف والجدول الكامل ←
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditTeacher(teacher)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTeacherToDelete(teacher)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!teacherToDelete}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={() => {
          if (teacherToDelete) {
            deleteTeacher(teacherToDelete.id);
          }
        }}
        title="تأكيد حذف سجل المدرس"
        message={`هل أنت متأكد من رغبتك في حذف المدرس "${teacherToDelete?.name}" نهائياً من قاعدة بيانات المركز؟`}
        confirmText="نعم، حذف المدرس"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
};
