import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  GraduationCap,
  QrCode,
  Edit,
  Trash2,
  Eye,
  Phone,
  CreditCard,
  CheckCircle2,
  Calendar,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  FileText
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import { ConfirmModal } from '../../common/ConfirmModal';
import { ViewOnlyBanner } from '../../common/ViewOnlyBanner';
import { Student, StudentStatus } from '../../../types';

interface StudentsViewProps {
  onOpenAddStudent?: () => void;
  onOpenAddContract?: () => void;
  onOpenEditStudent: (student: Student) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  onOpenAddStudent,
  onOpenAddContract,
  onOpenEditStudent
}) => {
  const {
    students,
    subjects,
    contracts,
    setSelectedStudentId,
    archiveStudent,
    deleteStudent,
    setActiveQRStudent,
    subjectsMap,
    canEditSection
  } = useApp();

  const isEditable = canEditSection('students');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Extract unique grades
  const grades = useMemo(() => {
    const set = new Set(students.map(s => s.grade));
    return Array.from(set);
  }, [students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.code.toLowerCase().includes(q) ||
        student.phone?.includes(q) ||
        student.parent.phone.includes(q) ||
        student.parent.name.toLowerCase().includes(q);

      const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
      const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
      const matchesSubject =
        selectedSubject === 'all' || student.subjectIds.includes(selectedSubject);

      return matchesSearch && matchesGrade && matchesStatus && matchesSubject;
    });
  }, [students, searchQuery, selectedGrade, selectedStatus, selectedSubject]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['الكود', 'الاسم', 'الصف', 'المدرسة', 'هاتف الطالب', 'ولي الأمر', 'هاتف ولي الأمر', 'الحالة'];
    const rows = filteredStudents.map(s => [
      s.code,
      `"${s.name}"`,
      `"${s.grade}"`,
      `"${s.school || ''}"`,
      s.phone || '',
      `"${s.parent.name}"`,
      s.parent.phone,
      s.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-right">
      {/* View Only Banner for restricted departments */}
      <ViewOnlyBanner section="students" />

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            إدارة شؤون الطلاب وأولياء الأمور
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إجمالي {students.length} طالب مسجل بالمركز • {filteredStudents.length} معروضين
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel/CSV</span>
          </button>

          {isEditable && (
            <button
              onClick={onOpenAddContract || onOpenAddStudent}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>عقد اشتراك جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute top-3 right-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الكود، هاتف ولي الأمر..."
              className="w-full pr-9 pl-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Grade Filter */}
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كافة المراحل والصفوف الدراسية</option>
            {grades.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كافة المواد الدراسية</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter & View Toggle */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">كافة الحالات</option>
              <option value={StudentStatus.ACTIVE}>نشط (Active)</option>
              <option value={StudentStatus.INACTIVE}>غير نشط</option>
              <option value={StudentStatus.SUSPENDED}>موقوف</option>
            </select>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'
                }`}
                title="عرض جدول"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'
                }`}
                title="عرض بطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Students Data Display */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 space-y-2">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <h4 className="text-base font-bold text-slate-800">لم يتم العثور على أي طلاب مطابقين</h4>
          <p className="text-xs text-slate-400">يرجى تعديل معايير البحث أو إضافة طالب جديد</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold">
                  <th className="py-3.5 px-4">الطالب</th>
                  <th className="py-3.5 px-4">الكود</th>
                  <th className="py-3.5 px-4">الصف الدراسي</th>
                  <th className="py-3.5 px-4">ولي الأمر والتواصل</th>
                  <th className="py-3.5 px-4">المواد المسجل بها</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const studentContracts = contracts.filter(c => c.studentId === student.id);
                  const totalRem = studentContracts.reduce(
                    (acc, c) => acc + (c.totalSessions - c.usedSessions),
                    0
                  );

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setSelectedStudentId(student.id)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs"
                            style={{ backgroundColor: student.avatarColor || '#4f46e5' }}
                          >
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 block">
                              {student.name}
                            </span>
                            <span className="text-[11px] text-slate-400">{student.school || 'عام'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {student.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">{student.grade}</td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{student.parent.name}</p>
                        <p className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {student.parent.phone}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {student.subjectIds.map(subId => (
                            <span
                              key={subId}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md"
                            >
                              {subjectsMap[subId] || 'مادة'}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={student.status} />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedStudentId(student.id)}
                            title="عرض الملف الكامل"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setActiveQRStudent(student)}
                            title="كارت الباركود QR"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenEditStudent(student)}
                            title="تعديل"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setStudentToDelete(student)}
                            title="حذف"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => (
            <div
              key={student.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-indigo-200 transition-all text-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                    style={{ backgroundColor: student.avatarColor || '#4f46e5' }}
                  >
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4
                      onClick={() => setSelectedStudentId(student.id)}
                      className="font-bold text-sm text-slate-900 cursor-pointer hover:text-indigo-600"
                    >
                      {student.name}
                    </h4>
                    <span className="font-mono font-bold text-[11px] text-indigo-700">
                      {student.code}
                    </span>
                  </div>
                </div>
                <Badge status={student.status} />
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">الصف:</span>
                  <span className="font-semibold text-slate-800">{student.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ولي الأمر:</span>
                  <span className="font-bold text-slate-900">{student.parent.name}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">الهاتف:</span>
                  <span className="font-bold text-slate-700">{student.parent.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <button
                  onClick={() => setSelectedStudentId(student.id)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  الملف الكامل ←
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveQRStudent(student)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                    title="كارت الباركود"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenEditStudent(student)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStudentToDelete(student)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            deleteStudent(studentToDelete.id);
          }
        }}
        title="تأكيد حذف سجل الطالب"
        message={`هل أنت متأكد من رغبتك في حذف الطالب "${studentToDelete?.name}" نهائياً من قاعدة بيانات المركز؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، حذف الطالب"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
};
