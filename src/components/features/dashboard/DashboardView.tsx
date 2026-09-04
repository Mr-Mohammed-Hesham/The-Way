import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Users,
  Calendar,
  Radio,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  Plus,
  DoorOpen,
  Sparkles,
  History,
  UserPlus,
  FileText,
  DollarSign,
  CheckCircle,
  Eye,
  Zap,
  Building2,
  ChevronLeft,
  Flame,
  Layers
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatCard } from '../../common/StatCard';
import { Badge } from '../../common/Badge';
import { formatCurrency, formatTime12h, calculateAttendancePercentage } from '../../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

interface DashboardViewProps {
  onOpenAddSession: () => void;
  onOpenAddContract?: () => void;
  onOpenAddStudent?: () => void;
  onOpenAddPayment?: () => void;
  onOpenQRScanner?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddSession,
  onOpenAddContract,
  onOpenAddStudent,
  onOpenAddPayment
}) => {
  const {
    students,
    teachers,
    sessions,
    attendance,
    contracts,
    payments,
    subjects,
    rooms,
    notifications,
    auditLogs,
    studentsMap,
    teachersMap,
    subjectsMap,
    roomsMap,
    setActiveTab,
    setSelectedStudentId,
    completeSession,
    processStudentCodeAttendance,
    settings,
    currentUser,
    canEditSection
  } = useApp();

  const [auditFilterDept, setAuditFilterDept] = useState<string>('all');
  const [quickCodeInput, setQuickCodeInput] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Dynamic Arabic Greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'صباح الخير والبركة' : currentHour < 17 ? 'طاب مساؤك' : 'مساء الخير والنشاط';

  // Calculated KPI stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const totalTeachers = teachers.length;

  const todaySessions = sessions.filter(s => s.date === todayStr);
  const liveSessions = sessions.filter(s => s.status === 'live');
  const upcomingTodaySessions = todaySessions.filter(s => s.status === 'scheduled');
  const completedTodaySessions = todaySessions.filter(s => s.status === 'completed');

  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const todayAttendanceRate = calculateAttendancePercentage(todayAttendance);
  const presentStudentsCount = todayAttendance.filter(a => a.status === 'present').length;
  const absentStudentsCount = todayAttendance.filter(a => a.status === 'absent').length;

  // Financial stats
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalContractValue = contracts.reduce((acc, c) => acc + c.totalPrice, 0);
  const totalOutstanding = Math.max(0, totalContractValue - totalRevenue);

  // Contracts alert stats
  const expiringContractsCount = contracts.filter(
    c => c.status === 'expiring_soon' || (c.status === 'active' && c.totalSessions - c.usedSessions <= 3)
  ).length;

  // Room Occupancy
  const occupiedRoomIds = new Set(liveSessions.map(s => s.roomId));
  const occupiedRoomsCount = occupiedRoomIds.size;
  const totalRoomsCount = rooms.length || 1;
  const roomOccupancyRate = Math.round((occupiedRoomsCount / totalRoomsCount) * 100);

  // Chart Data: Students per Subject
  const studentsBySubjectData = subjects.map(sub => {
    const count = students.filter(st => st.subjectIds.includes(sub.id)).length;
    return { name: sub.name.split(' ')[0], full: sub.name, code: sub.code, count };
  });

  // Chart Data: Sessions by Teacher
  const sessionsByTeacherData = teachers.map(tch => {
    const count = sessions.filter(s => s.teacherId === tch.id).length;
    return { name: tch.name.split(' ')[1] || tch.name, count };
  });

  // Filtered Audit / Changes Feed
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (auditFilterDept === 'all') return true;
      if (auditFilterDept === 'students' && (log.entityType === 'student' || log.details.includes('طالب'))) return true;
      if (auditFilterDept === 'payments' && (log.entityType === 'payment' || log.details.includes('سند') || log.details.includes('دفعة'))) return true;
      if (auditFilterDept === 'contracts' && (log.entityType === 'contract' || log.details.includes('عقد'))) return true;
      if (auditFilterDept === 'attendance' && (log.entityType === 'attendance' || log.details.includes('حضور'))) return true;
      return true;
    }).slice(0, 8);
  }, [auditLogs, auditFilterDept]);

  const handleQuickCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCodeInput.trim()) return;
    const res = processStudentCodeAttendance(quickCodeInput.trim());
    if (res.success) {
      setQuickCodeInput('');
    }
  };

  return (
    <div className="space-y-7 text-right">
      {/* SECTION: Soulful Hero Header & Command Center */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-indigo-900/40">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{greeting}، {currentUser.name}</span>
              <span className="text-white/40">•</span>
              <span className="text-amber-300 font-black">{currentUser.department}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              مركز {settings.centerName} التعليمي
              <Sparkles className="w-6 h-6 text-amber-400 hidden sm:inline" />
            </h1>

            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              لوحة التحكم والعمليات المباشرة: متابعة الحصص الجارية في القاعات، تسجيل الحضور بالأكواد الذكية، وتوثيق المتغيرات المالية والأكاديمية بالوقت الفعلي.
            </p>
          </div>

          {/* Quick Action Buttons Grid */}
          <div className="flex flex-wrap items-center gap-2.5">
            {(canEditSection('contracts') || canEditSection('students')) && (
              <button
                onClick={onOpenAddContract || onOpenAddStudent}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-amber-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>عقد اشتراك جديد</span>
              </button>
            )}

            {canEditSection('sessions') && (
              <button
                onClick={onOpenAddSession}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>جدولة حصة</span>
              </button>
            )}

            {canEditSection('payments') && onOpenAddPayment && (
              <button
                onClick={onOpenAddPayment}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>سند قبض</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('live')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>شاشة السنتر المباشرة</span>
            </button>
          </div>
        </div>

        {/* Quick Student Code Attendance Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold">تسجيل حضور فوري بالكود التعريفي:</span>
            <span className="text-white/60 text-[11px] hidden md:inline">أدخل كود الطالب (مثل STD-001) لتسجيل الحضور وتحديث رصيد الحصص تلقائياً</span>
          </div>

          <form onSubmit={handleQuickCodeSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={quickCodeInput}
              onChange={e => setQuickCodeInput(e.target.value)}
              placeholder="كود الطالب (STD-XXX)..."
              className="px-3.5 py-2 text-xs font-mono font-bold rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full sm:w-56"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              تسجيل حضور
            </button>
          </form>
        </div>
      </div>

      {/* SECTION: Vibrant Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Students KPI */}
        <div
          onClick={() => setActiveTab('students')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {activeStudents} نشط
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الطلاب المسجلين</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalStudents} طالب</h3>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
            <span>المعلمين: {totalTeachers} مدرس</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline">عرض الطلاب ←</span>
          </div>
        </div>

        {/* Live Center KPI */}
        <div
          onClick={() => setActiveTab('live')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              مباشر الآن
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">الحصص الجارية بالقاعات</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{liveSessions.length} حصص جارية</h3>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
            <span>إشغال القاعات: {roomOccupancyRate}%</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline">شاشة السنتر ←</span>
          </div>
        </div>

        {/* Attendance KPI */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
              absentStudentsCount > 0
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
            }`}>
              {absentStudentsCount > 0 ? `${absentStudentsCount} حالات غياب` : 'حضور كامل'}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">نسبة حضور اليوم</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{todayAttendanceRate}%</h3>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
            <span>مسجل اليوم: {todayAttendance.length} طالب</span>
            <span className="text-sky-600 dark:text-sky-400 font-bold group-hover:underline">دفتر الحضور ←</span>
          </div>
        </div>

        {/* Financial Collections KPI */}
        <div
          onClick={() => setActiveTab('payments')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              سندات القبض
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي التحصيلات المالية</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(totalRevenue, settings.currency)}
            </h3>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
            <span>مستحقات مؤجلة: {formatCurrency(totalOutstanding, settings.currency)}</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold group-hover:underline">المالية ←</span>
          </div>
        </div>
      </div>

      {/* SECTION: سجل المتغيرات والتحديثات الحية لكل قسم (Live Variables Hub) - للأدمن فقط */}
      {(currentUser.role === 'super_admin' || currentUser.role === 'admin') && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                <History className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    لوحة المتغيرات وسجل العمليات الحية (Live Stream)
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    خاص بالإدارة
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  سجل التعديلات والعمليات الحية (تسجيل الطلاب، الحصص، سندات القبض، التعديلات) - متاح حصرياً للمدير العام
                </p>
              </div>
            </div>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'all', label: `الكل (${auditLogs.length})` },
                { key: 'students', label: 'الطلاب والتسجيل' },
                { key: 'payments', label: 'المالية وسندات القبض' },
                { key: 'contracts', label: 'العقود والاشتراكات' },
                { key: 'attendance', label: 'كشوف الحضور' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setAuditFilterDept(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    auditFilterDept === tab.key
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real-Time Stream Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredAuditLogs.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                لا توجد حركات مسجلة حالياً في هذا القسم
              </div>
            ) : (
              filteredAuditLogs.map(log => {
                const isCreateStudent = log.action === 'create' && log.entityType === 'student';
                const isUpdateStudent = log.action === 'update' && log.entityType === 'student';
                const isPayment = log.entityType === 'payment' || log.details.includes('سند') || log.details.includes('دفعة');
                const isContract = log.entityType === 'contract' || log.details.includes('عقد');

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 border border-slate-200/80 dark:border-slate-700 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isCreateStudent
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                            : isUpdateStudent
                            ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400'
                            : isPayment
                            ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400'
                            : isContract
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isCreateStudent && <UserPlus className="w-4 h-4" />}
                        {isUpdateStudent && <Activity className="w-4 h-4" />}
                        {isPayment && <DollarSign className="w-4 h-4" />}
                        {isContract && <FileText className="w-4 h-4" />}
                        {!isCreateStudent && !isUpdateStudent && !isPayment && !isContract && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {log.details}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
                          <span className="font-mono">{log.timestamp}</span>
                          {log.userName && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                بواسطة: {log.userName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {log.entityId && log.entityType === 'student' && (
                      <button
                        onClick={() => setSelectedStudentId(log.entityId!)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>عرض الطالب</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-400">يتم تسجيل وتوثيق كافة العمليات والتعديلات في سجل التدقيق الموحد</span>
            <button
              onClick={() => setActiveTab('audit')}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>عرض سجل التعديلات والعمليات الشامل</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION: السنتر الآن والقاعات المباشرة (Live Center Matrix) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  السنتر الآن (Live Classrooms & Rooms)
                </h3>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  {liveSessions.length} حصص نشطة
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                متابعة الحصص الجارية في القاعات بالوقت الفعلي مع إمكانية إنهاء الحصة أو تسجيل الحضور فوراً
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('live')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer bg-indigo-50 dark:bg-indigo-950/50 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800"
          >
            <span>شاشة السنتر الكاملة</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        {liveSessions.length === 0 ? (
          <div className="py-10 text-center bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 space-y-2">
            <Radio className="w-9 h-9 mx-auto text-slate-400" />
            <p className="font-black text-sm text-slate-800 dark:text-slate-200">لا توجد حصص جارية في القاعات في هذه اللحظة</p>
            <p className="text-xs text-slate-400">تبدأ الحصص تلقائياً بحسب الجدول الزمني المعتمد لليوم</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveSessions.map(session => {
              const teacherName = teachersMap[session.teacherId] || 'المدرس';
              const subjectName = subjectsMap[session.subjectId] || 'المادة';
              const roomName = roomsMap[session.roomId] || 'القاعة';
              const studentNames = session.studentIds.map(id => studentsMap[id] || 'طالب').join('، ');

              return (
                <div
                  key={session.id}
                  className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/60 dark:from-emerald-950/30 via-white dark:via-slate-800 to-slate-50 dark:to-slate-800 border-2 border-emerald-200 dark:border-emerald-800 shadow-xs relative overflow-hidden space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          LIVE جارية الآن
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{subjectName}</span>
                      </div>
                      <h4 className="font-black text-base text-slate-900 dark:text-white">{session.title}</h4>
                    </div>

                    <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800 shrink-0">
                      {session.sessionCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-900/70 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[11px]">المدرس:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{teacherName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">القاعة:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <DoorOpen className="w-3.5 h-3.5" />
                        {roomName}
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400 block text-[11px]">الطلاب المسجلين ({session.studentIds.length}):</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{studentNames}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        {formatTime12h(session.startTime)} - {formatTime12h(session.endTime)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('attendance')}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                      >
                        كشف الحضور
                      </button>
                      {canEditSection('sessions') && (
                        <button
                          onClick={() => completeSession(session.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
                        >
                          إنهاء الحصة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Layout: Upcoming Sessions & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions Today (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              حصص اليوم المجدولة ({upcomingTodaySessions.length})
            </h3>
            <button
              onClick={() => setActiveTab('sessions')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              عرض الجدول الأسبوعي
            </button>
          </div>

          {upcomingTodaySessions.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl text-xs text-slate-400">
              لا توجد حصص قادمة مجدولة لباقي اليوم
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingTodaySessions.map(ses => (
                <div
                  key={ses.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex flex-col items-center justify-center font-bold text-xs font-mono shrink-0">
                      <span>{ses.startTime}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ses.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {teachersMap[ses.teacherId]} • {subjectsMap[ses.subjectId]} • {roomsMap[ses.roomId]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge status={ses.status} />
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer shadow-xs"
                    >
                      تسجيل الحضور
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center Urgent Alerts (1 Col) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              تنبيهات السنتر العاجلة
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              {expiringContractsCount + absentStudentsCount} تنبيه
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {notifications.slice(0, 5).map(notif => (
              <div
                key={notif.id}
                className={`p-3 rounded-2xl border text-xs space-y-1 transition-all ${
                  notif.priority === 'high'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                    : notif.priority === 'medium'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                    : 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-950 dark:text-sky-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{notif.title}</span>
                  <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">{notif.date}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">{notif.message}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('notifications')}
            className="w-full py-2.5 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition-colors block cursor-pointer"
          >
            عرض كافة الإشعارات والتنبيهات
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Subject */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              توزيع الطلاب حسب المواد الدراسية
            </h3>
            <span className="text-xs font-bold text-slate-400">{subjects.length} مادة</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsBySubjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl text-xs font-bold shadow-xl text-right">
                          <p>{d.full}</p>
                          <p className="text-indigo-300 font-mono mt-0.5">كود المادة: {d.code}</p>
                          <p className="text-emerald-400 mt-0.5">{d.count} طالب مسجل</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sessions by Teacher */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              الحصص المجدولة لكل مدرس
            </h3>
            <span className="text-xs font-bold text-slate-400">{teachers.length} مدرس</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionsByTeacherData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl text-xs font-bold shadow-xl text-right">
                          <p>{d.name}</p>
                          <p className="text-emerald-300 mt-0.5">{d.count} حصة مسجلة</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
