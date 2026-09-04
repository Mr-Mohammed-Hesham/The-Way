import React, { useState } from 'react';
import {
  ArrowRight,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  BookOpen,
  Edit,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import { formatCurrency, formatArabicDate, formatTime12h } from '../../../utils/formatters';

interface TeacherDetailViewProps {
  teacherId: string;
  onBack: () => void;
  onEdit: () => void;
}

export const TeacherDetailView: React.FC<TeacherDetailViewProps> = ({
  teacherId,
  onBack,
  onEdit
}) => {
  const {
    teachers,
    subjects,
    students,
    sessions,
    assignments,
    subjectsMap,
    studentsMap,
    settings,
    canViewFinancials
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sessions' | 'students' | 'schedule' | 'payroll'>('sessions');

  const teacher = teachers.find(t => t.id === teacherId);

  if (!teacher) {
    return (
      <div className="p-8 bg-white rounded-3xl text-center space-y-3">
        <p className="text-slate-500 font-bold">لم يتم العثور على سجل هذا المدرس</p>
        <button onClick={onBack} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          العودة لقائمة المدرسين
        </button>
      </div>
    );
  }

  const teacherSessions = sessions.filter(s => s.teacherId === teacher.id);
  const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id);
  const completedSessions = teacherSessions.filter(s => s.status === 'completed');

  // Estimate earnings based on rate model
  let totalEstimatedEarned = 0;
  if (teacher.rateType === 'hourly') {
    // 2 hrs average per completed session
    totalEstimatedEarned = completedSessions.length * 2 * teacher.defaultRate;
  } else if (teacher.rateType === 'percentage') {
    // 70% of standard 150 EGP per student session
    const totalStudentAttendances = completedSessions.reduce((acc, s) => acc + s.studentIds.length, 0);
    totalEstimatedEarned = totalStudentAttendances * 150 * (teacher.defaultRate / 100);
  } else {
    // fixed per student
    const totalStudentAttendances = completedSessions.reduce((acc, s) => acc + s.studentIds.length, 0);
    totalEstimatedEarned = totalStudentAttendances * teacher.defaultRate;
  }

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 shadow-xs transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة المدرسين</span>
        </button>

        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-2xl transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span>تعديل بيانات المدرس</span>
        </button>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md"
            style={{ backgroundColor: teacher.color || '#4f46e5' }}
          >
            {teacher.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-xl font-black text-slate-900">{teacher.name}</h2>
              <Badge status={teacher.status} />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {teacher.code}
              </span>
              <span>هاتف: {teacher.phone}</span>
              {teacher.email && <span>• {teacher.email}</span>}
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full md:w-auto text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-slate-400 block text-[11px]">الطلاب المعينين:</span>
            <span className="text-base font-black text-slate-900">{teacherAssignments.length} طالب</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">الحصص المكتملة:</span>
            <span className="text-base font-black text-emerald-600">
              {completedSessions.length} <span className="text-xs font-normal text-slate-500">/ {teacherSessions.length}</span>
            </span>
          </div>

          {canViewFinancials && (
            <div>
              <span className="text-slate-400 block text-[11px]">المستحقات التقديرية:</span>
              <span className="text-base font-black text-indigo-700">
                {formatCurrency(totalEstimatedEarned, settings.currency)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'sessions', label: `سجل الحصص (${teacherSessions.length})`, icon: Calendar },
          { id: 'students', label: `الطلاب المعينين (${teacherAssignments.length})`, icon: UserCheck },
          { id: 'schedule', label: 'الجدول الزمني', icon: Clock },
          { id: 'payroll', label: 'المستحقات المالية والمحاسبة', icon: DollarSign }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-black text-base text-slate-900">سجل كافة الحصص الخاصة بالمدرس</h3>
          <div className="space-y-2.5">
            {teacherSessions.map(ses => (
              <div
                key={ses.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{ses.title}</h4>
                  <p className="text-slate-500 mt-0.5">
                    {ses.date} ({formatTime12h(ses.startTime)} - {formatTime12h(ses.endTime)}) • الطلاب:{' '}
                    {ses.studentIds.length} طالب
                  </p>
                </div>
                <Badge status={ses.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Assigned Students */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-black text-base text-slate-900">الطلاب المعينين تحت إشراف المدرس</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teacherAssignments.map(asg => {
              const student = students.find(s => s.id === asg.studentId);
              return (
                <div
                  key={asg.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{student?.name || 'طالب'}</h4>
                    <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {student?.code}
                    </span>
                  </div>
                  <p className="text-slate-500">{student?.grade}</p>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-600">
                    <span>المادة: {subjectsMap[asg.subjectId]}</span>
                    {asg.ratePerSession && (
                      <span className="font-bold text-emerald-700">
                        {asg.ratePerSession} ج.م / حصة
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Schedule */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-black text-base text-slate-900">المواعيد والحصص المجدولة</h3>
          <div className="space-y-2">
            {teacherSessions
              .filter(s => s.status === 'scheduled' || s.status === 'live')
              .map(ses => (
                <div
                  key={ses.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-900">{ses.title}</h5>
                    <p className="text-slate-500">
                      {ses.date} ({formatTime12h(ses.startTime)} - {formatTime12h(ses.endTime)})
                    </p>
                  </div>
                  <Badge status={ses.status} />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab: Payroll */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-700 font-bold block">إجمالي المستحقات المكتسبة</span>
              <span className="text-2xl font-black text-indigo-950">
                {formatCurrency(totalEstimatedEarned, settings.currency)}
              </span>
            </div>
            <div className="text-left text-xs text-indigo-900">
              <span className="block font-medium">نموذج المحاسبة:</span>
              <span className="font-black">
                {teacher.rateType === 'percentage'
                  ? `${teacher.defaultRate}% من دخل الحصة`
                  : teacher.rateType === 'hourly'
                  ? `${teacher.defaultRate} ج.م بالساعة`
                  : `${teacher.defaultRate} ج.م لكل طالب`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
