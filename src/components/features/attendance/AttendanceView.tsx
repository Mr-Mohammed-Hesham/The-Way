import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Calendar,
  UserCheck,
  UserX,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  Search,
  ArrowRight,
  Sparkles,
  Zap,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import { ViewOnlyBanner } from '../../common/ViewOnlyBanner';
import { AttendanceStatus } from '../../../types';
import { formatTime12h, formatArabicDate } from '../../../utils/formatters';
import { downloadExcelHTML, downloadCSV } from '../../../utils/exportUtils';

interface AttendanceViewProps {
  onOpenQRScanner?: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = () => {
  const {
    sessions,
    students,
    attendance,
    subjectsMap,
    teachersMap,
    roomsMap,
    recordAttendance,
    markAllSessionAttendance,
    processStudentCodeAttendance,
    addToast,
    canEditSection
  } = useApp();

  const isEditable = canEditSection('attendance');

  const todayStr = new Date().toISOString().split('T')[0];

  // Select current live session, or first session today, or first session
  const defaultSession =
    sessions.find(s => s.status === 'live') ||
    sessions.find(s => s.date === todayStr) ||
    sessions[0];

  const [selectedSessionId, setSelectedSessionId] = useState(defaultSession?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickCodeInput, setQuickCodeInput] = useState('');

  const currentSession = sessions.find(s => s.id === selectedSessionId);

  // Get attendance records for this session
  const sessionAttendance = useMemo(() => {
    return attendance.filter(a => a.sessionId === selectedSessionId);
  }, [attendance, selectedSessionId]);

  const attendanceMap = useMemo(() => {
    const map = new Map<string, typeof sessionAttendance[0]>();
    sessionAttendance.forEach(a => map.set(a.studentId, a));
    return map;
  }, [sessionAttendance]);

  // Session students list
  const sessionStudents = useMemo(() => {
    if (!currentSession) return [];
    const list = students.filter(s => currentSession.studentIds.includes(s.id));
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.parent.phone.includes(q)
    );
  }, [currentSession, students, searchQuery]);

  // Attendance metrics
  const totalEnrolled = currentSession?.studentIds.length || 0;
  const presentCount = sessionAttendance.filter(a => a.status === AttendanceStatus.PRESENT).length;
  const absentCount = sessionAttendance.filter(a => a.status === AttendanceStatus.ABSENT).length;
  const lateCount = sessionAttendance.filter(a => a.status === AttendanceStatus.LATE).length;
  const excusedCount = sessionAttendance.filter(a => a.status === AttendanceStatus.EXCUSED).length;

  const attendanceRate = totalEnrolled > 0 ? Math.round((presentCount / totalEnrolled) * 100) : 0;

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    recordAttendance(
      selectedSessionId,
      studentId,
      status,
      status === AttendanceStatus.LATE ? `متأخر (تم الدخول: ${nowTime})` : undefined
    );
  };

  const handleQuickCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCodeInput.trim()) return;
    const res = processStudentCodeAttendance(quickCodeInput.trim());
    if (res.success) {
      setQuickCodeInput('');
    }
  };

  const handleSendWhatsAppNotice = (student: typeof students[0]) => {
    const message = `السلام عليكم ورحمة الله، ولي أمر الطالب/ة ${student.name}.\nنود إحاطتكم علماً بغياب الطالب اليوم عن حصة (${currentSession?.title}) بتاريخ ${currentSession?.date}.\nيرجى التواصل مع إدارة المركز للتنسيق والتعويض.\nشكراً لتعاونكم.`;
    const cleanPhone = student.parent.whatsapp?.replace(/\D/g, '') || student.parent.phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    addToast({
      title: 'تم تجهيز رسالة الواتساب',
      message: `تم فتح محادثة ولي أمر الطالب ${student.name}`,
      type: 'info'
    });
  };

  const handleExportToExcel = () => {
    if (!currentSession) {
      addToast({
        title: 'تنبيه',
        message: 'يرجى اختيار حصة لتصدير كشف حضورها إلى Excel',
        type: 'warning'
      });
      return;
    }

    const headers = [
      'م',
      'كود الطالب',
      'اسم الطالب',
      'الصف الدراسي',
      'اسم ولي الأمر',
      'هاتف ولي الأمر',
      'هاتف الطالب',
      'حالة الحضور',
      'وقت تسجيل الدخول',
      'ملاحظات الحضور',
      'الحصة',
      'المادة',
      'المدرس',
      'القاعة',
      'التاريخ'
    ];

    const rows = sessionStudents.map((st, index) => {
      const att = attendanceMap.get(st.id);
      let statusLabel = 'لم يُسجل بعد';
      if (att?.status === AttendanceStatus.PRESENT) statusLabel = 'حاضر ✓';
      else if (att?.status === AttendanceStatus.ABSENT) statusLabel = 'غائب ✗';
      else if (att?.status === AttendanceStatus.LATE) statusLabel = 'متأخر ⏱';
      else if (att?.status === AttendanceStatus.EXCUSED) statusLabel = 'معتذر';

      return [
        index + 1,
        st.code,
        st.name,
        st.grade || '-',
        st.parent?.name || '-',
        st.parent?.phone || '-',
        st.phone || '-',
        statusLabel,
        att?.checkInTime || '-',
        att?.notes || '-',
        currentSession.title,
        subjectsMap[currentSession.subjectId] || '-',
        teachersMap[currentSession.teacherId] || '-',
        roomsMap[currentSession.roomId] || '-',
        currentSession.date
      ];
    });

    const sheetName = `كشف_حضور_${currentSession.title.replace(/[\/\\]/g, '_')}_${currentSession.date}`;
    downloadExcelHTML(sheetName, `كشف حضور وغياب - ${currentSession.title}`, headers, rows);

    addToast({
      title: 'تم تصدير كشف الحضور بنجاح ✓',
      message: `تم إنشاء وتحميل ملف Excel يتضمن بيانات ${sessionStudents.length} طالب`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 text-right">
      {/* View Only Banner for restricted departments */}
      <ViewOnlyBanner section="attendance" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            دفتر تسجيل الحضور والغياب الإلكتروني
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تسجيل الحضور بالكود التعريفي للطالب، تحديث رصيد الحصص، وإرسال تنبيهات الغياب الفورية
          </p>
        </div>

        {/* Quick Student Code Input Widget & Excel Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="تصدير كشف حضور الحصة الحالية إلى ملف Excel (.xls)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير إلى Excel</span>
          </button>

          {isEditable && (
            <form onSubmit={handleQuickCodeSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Zap className="w-4 h-4 absolute top-3 right-3 text-amber-500" />
                <input
                  type="text"
                  value={quickCodeInput}
                  onChange={e => setQuickCodeInput(e.target.value)}
                  placeholder="أدخل كود الطالب (مثال: STD-001)..."
                  className="pr-9 pl-3 py-2 text-xs font-mono font-bold rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white focus:ring-2 focus:ring-indigo-500 w-52 sm:w-60"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                تسجيل
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Session Selection & Summary Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اختر الحصة المراد مراجعة وتسجيل كشف حضورها:
            </label>
            <select
              value={selectedSessionId}
              onChange={e => setSelectedSessionId(e.target.value)}
              className="w-full px-4 py-3 text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white"
            >
              {sessions.map(ses => (
                <option key={ses.id} value={ses.id}>
                  {ses.title} | {subjectsMap[ses.subjectId]} | {teachersMap[ses.teacherId]} (
                  {ses.date} - {formatTime12h(ses.startTime)}) {ses.status === 'live' ? '🔥 [LIVE جارية الآن]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => markAllSessionAttendance(selectedSessionId, AttendanceStatus.PRESENT)}
              className="flex-1 py-3 px-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
            >
              تحديد الكل حاضر ✓
            </button>
            <button
              type="button"
              onClick={() => markAllSessionAttendance(selectedSessionId, AttendanceStatus.ABSENT)}
              className="flex-1 py-3 px-3 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
            >
              تحديد الكل غائب ✗
            </button>
          </div>
        </div>

        {/* Selected Session Info Pill */}
        {currentSession && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400 block text-[11px]">المدرس:</span>
                <span className="font-bold text-slate-900 dark:text-white">{teachersMap[currentSession.teacherId]}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">القاعة:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{roomsMap[currentSession.roomId]}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">الموعد:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {currentSession.date} ({formatTime12h(currentSession.startTime)} - {formatTime12h(currentSession.endTime)})
                </span>
              </div>
            </div>

            {/* Live Metrics Counter */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 rounded-xl font-bold">
                حاضر: {presentCount}
              </span>
              <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-300 rounded-xl font-bold">
                غائب: {absentCount}
              </span>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 rounded-xl font-bold">
                متأخر: {lateCount}
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-300 rounded-xl font-black">
                النسبة: {attendanceRate}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute top-2.5 right-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث في طلاب هذه الحصة بالاسم أو الكود..."
              className="w-full pr-9 pl-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            عدد الطلاب المسجلين: {sessionStudents.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold">
                <th className="py-3.5 px-4">الطالب</th>
                <th className="py-3.5 px-4">كود الطالب</th>
                <th className="py-3.5 px-4">ولي الأمر والهاتف</th>
                <th className="py-3.5 px-4 text-center">تسجيل الحالة</th>
                <th className="py-3.5 px-4">وقت وملاحظات الحضور</th>
                <th className="py-3.5 px-4 text-center">إشعار ولي الأمر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sessionStudents.map(student => {
                const att = attendanceMap.get(student.id);
                const currentStatus = att?.status;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs"
                          style={{ backgroundColor: student.avatarColor || '#4f46e5' }}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-[11px] text-slate-400">{student.grade}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                        {student.code}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{student.parent.name}</p>
                      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{student.parent.phone}</p>
                    </td>

                    {/* Interactive Status Buttons */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {/* Present */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, AttendanceStatus.PRESENT)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            currentStatus === AttendanceStatus.PRESENT
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          حاضر ✓
                        </button>

                        {/* Absent */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, AttendanceStatus.ABSENT)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            currentStatus === AttendanceStatus.ABSENT
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          غائب ✗
                        </button>

                        {/* Late */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, AttendanceStatus.LATE)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            currentStatus === AttendanceStatus.LATE
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          متأخر ⏱
                        </button>

                        {/* Excused */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, AttendanceStatus.EXCUSED)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            currentStatus === AttendanceStatus.EXCUSED
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-700'
                          }`}
                        >
                          معتذر
                        </button>
                      </div>
                    </td>

                    {/* Timestamp & Notes */}
                    <td className="py-3.5 px-4 text-[11px] text-slate-500 dark:text-slate-400">
                      {att?.checkInTime && (
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200 block">
                          وقت الدخول: {att.checkInTime}
                        </span>
                      )}
                      <span>{att?.notes || (currentStatus ? 'تم التوثيق' : 'لم يسجل بعد')}</span>
                    </td>

                    {/* WhatsApp Alert Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleSendWhatsAppNotice(student)}
                        title="إرسال إشعار ولي الأمر عبر WhatsApp"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>واتساب</span>
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
