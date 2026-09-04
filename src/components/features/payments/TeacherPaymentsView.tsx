import React, { useState } from 'react';
import {
  Banknote,
  Users,
  CheckCircle2,
  Calendar,
  DollarSign,
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatCard } from '../../common/StatCard';
import { formatCurrency } from '../../../utils/formatters';

export const TeacherPaymentsView: React.FC = () => {
  const { teachers, sessions, attendance, settings, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Calculate earnings for all teachers
  const teacherPayrollList = teachers.map(teacher => {
    const teacherSessions = sessions.filter(s => s.teacherId === teacher.id);
    const completedSessions = teacherSessions.filter(s => s.status === 'completed');

    let grossEarned = 0;
    let totalStudentsAttended = 0;

    completedSessions.forEach(session => {
      totalStudentsAttended += session.studentIds.length;
      if (teacher.rateType === 'hourly') {
        grossEarned += 2 * teacher.defaultRate; // 2 hours
      } else if (teacher.rateType === 'percentage') {
        grossEarned += session.studentIds.length * 150 * (teacher.defaultRate / 100);
      } else {
        grossEarned += session.studentIds.length * teacher.defaultRate;
      }
    });

    return {
      teacher,
      totalSessions: teacherSessions.length,
      completedSessionsCount: completedSessions.length,
      totalStudentsAttended,
      grossEarned,
      isSettled: false
    };
  });

  const totalPayrollGross = teacherPayrollList.reduce((acc, t) => acc + t.grossEarned, 0);

  const handleSettle = (teacherName: string, amount: number) => {
    addToast({
      title: 'تم تسجيل تسوية المستحقات ✓',
      message: `تم صرف مستحقات المدرس ${teacherName} بقيمة ${formatCurrency(amount, settings.currency)}`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Banknote className="w-6 h-6 text-indigo-600" />
            مستحقات ورواتب طاقم التدريس (Teacher Payroll)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            احتساب أجور الحصص المكتملة بناءً على النسبة المئوية أو الأجر بالساعة أو لكل طالب
          </p>
        </div>

        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
          <span className="text-slate-500 text-xs block">إجمالي أجور الحصص المكتملة:</span>
          <span className="text-lg font-black text-indigo-950 font-mono">
            {formatCurrency(totalPayrollGross, settings.currency)}
          </span>
        </div>
      </div>

      {/* Teachers Payroll Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teacherPayrollList.map(({ teacher, completedSessionsCount, totalStudentsAttended, grossEarned }) => (
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
                  <h3 className="font-bold text-sm text-slate-900">{teacher.name}</h3>
                  <span className="font-mono text-[11px] text-slate-400">{teacher.code}</span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700">
                {teacher.rateType === 'percentage'
                  ? `${teacher.defaultRate}% نسبة`
                  : teacher.rateType === 'hourly'
                  ? `${teacher.defaultRate} ج.م/ساعة`
                  : `${teacher.defaultRate} ج.م/طالب`}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">الحصص المكتملة:</span>
                <span className="font-bold text-slate-900">{completedSessionsCount} حصة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">إجمالي حضور الطلاب:</span>
                <span className="font-bold text-slate-900">{totalStudentsAttended} طالب</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-bold">المستحق للصرف:</span>
                <span className="text-base font-black text-emerald-700 font-mono">
                  {formatCurrency(grossEarned, settings.currency)}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleSettle(teacher.name, grossEarned)}
              disabled={grossEarned === 0}
              className={`w-full py-2.5 rounded-xl font-bold transition-colors shadow-xs ${
                grossEarned > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              تسوية وصرف المستحقات
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
