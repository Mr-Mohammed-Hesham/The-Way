import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  FileText,
  FileJson,
  Layers,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Building2,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useApp } from '../../../context/AppContext';
import { StatCard } from '../../common/StatCard';
import { formatCurrency, formatArabicDate } from '../../../utils/formatters';
import { downloadCSV, downloadExcelHTML, downloadJSON } from '../../../utils/exportUtils';

export const ReportsView: React.FC = () => {
  const {
    students,
    teachers,
    sessions,
    attendance,
    payments,
    contracts,
    rooms,
    subjects,
    teacherPayments,
    settings,
    addToast
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'analytics' | 'export_center' | 'teachers_summary' | 'contracts_summary'>('analytics');

  // Key Analytics Calculations
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalCompletedSessions = sessions.filter(s => s.status === 'completed').length;
  const totalAttendanceRecords = attendance.length;
  const presentRecords = attendance.filter(a => a.status === 'present').length;
  const overallAttendanceRate = totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 100) : 88;
  const totalTeacherPayouts = teacherPayments.reduce((acc, tp) => acc + tp.amount, 0);
  const totalContractValues = contracts.reduce((acc, c) => acc + c.totalPrice, 0);

  // Revenue By Payment Method Data
  const paymentMethodData = [
    {
      name: 'نقداً (Cash)',
      value: payments.filter(p => p.paymentMethod === 'cash').reduce((acc, p) => acc + p.amount, 0),
      color: '#4f46e5'
    },
    {
      name: 'إنستاباي وبنكي',
      value: payments.filter(p => p.paymentMethod === 'bank_transfer').reduce((acc, p) => acc + p.amount, 0),
      color: '#059669'
    },
    {
      name: 'فيزا وبطاقات',
      value: payments.filter(p => p.paymentMethod === 'card').reduce((acc, p) => acc + p.amount, 0),
      color: '#0284c7'
    }
  ].filter(d => d.value > 0);

  // Teacher Workload Data
  const teacherWorkloadData = teachers.map(t => {
    const tSessions = sessions.filter(s => s.teacherId === t.id);
    const completed = tSessions.filter(s => s.status === 'completed').length;
    return {
      name: t.name,
      sessions: tSessions.length,
      completed,
      earnings: completed * (t.defaultRate || 150)
    };
  });

  // --- Export Handlers ---

  // 1. Export Students List
  const handleExportStudents = (format: 'csv' | 'excel' | 'json') => {
    const headers = ['كود الطالب', 'الاسم', 'الصف الدراسي', 'رقم الهاتف', 'ولي الأمر', 'هاتف ولي الأمر', 'الحالة', 'تاريخ التسجيل'];
    const rows = students.map(s => [
      s.code,
      s.name,
      s.grade,
      s.phone || '-',
      s.parent?.name || '-',
      s.parent?.phone || '-',
      s.status === 'active' ? 'نشط' : 'غير نشط',
      s.registrationDate
    ]);

    if (format === 'csv') {
      downloadCSV('تقرير_الطلاب_The_Way', headers, rows);
    } else if (format === 'excel') {
      downloadExcelHTML('تقرير_الطلاب_The_Way', 'سجل الطلاب المقيدين', headers, rows);
    } else {
      downloadJSON('تقرير_الطلاب_The_Way', students);
    }

    addToast({
      type: 'success',
      title: 'تم تصدير تقرير الطلاب ✓',
      message: `تم تحميل بيانات ${students.length} طالب بصيغة ${format.toUpperCase()}`
    });
  };

  // 2. Export Financial Receipts
  const handleExportFinancials = (format: 'csv' | 'excel' | 'json') => {
    const headers = ['رقم الإيصال', 'تاريخ السند', 'كود الطالب', 'اسم الطالب', 'المبلغ المستلم', 'طريقة الدفع', 'ملاحظات'];
    const rows = payments.map(p => {
      const student = students.find(s => s.id === p.studentId);
      return [
        p.receiptNumber,
        p.date,
        student?.code || '-',
        student?.name || 'طالب غير محدد',
        p.amount,
        p.paymentMethod === 'cash' ? 'نقداً' : p.paymentMethod === 'bank_transfer' ? 'تحويل / إنستاباي' : 'بطاقة ائتمان',
        p.notes || '-'
      ];
    });

    if (format === 'csv') {
      downloadCSV('تقرير_الإيرادات_وسندات_القبض_The_Way', headers, rows);
    } else if (format === 'excel') {
      downloadExcelHTML('تقرير_الإيرادات_The_Way', 'سجل المتحصلات وسندات القبض', headers, rows);
    } else {
      downloadJSON('تقرير_الإيرادات_The_Way', payments);
    }

    addToast({
      type: 'success',
      title: 'تم تصدير التقرير المالي ✓',
      message: `تم تجهيز ${payments.length} سند قبض بقيمة إجمالية ${formatCurrency(totalRevenue, settings.currency)}`
    });
  };

  // 3. Export Sessions & Attendance
  const handleExportAttendance = (format: 'csv' | 'excel' | 'json') => {
    const headers = ['كود الحصة', 'عنوان الحصة', 'المادة', 'المدرس', 'القاعة', 'التاريخ', 'الوقت', 'عدد الحاضرين', 'عدد الغائبين', 'الحالة'];
    const rows = sessions.map(s => {
      const teacher = teachers.find(t => t.id === s.teacherId);
      const subject = subjects.find(sub => sub.id === s.subjectId);
      const room = rooms.find(r => r.id === s.roomId);
      const sessionAtt = attendance.filter(a => a.sessionId === s.id);
      const present = sessionAtt.filter(a => a.status === 'present').length;
      const absent = sessionAtt.filter(a => a.status === 'absent').length;

      return [
        s.sessionCode,
        s.title,
        subject?.name || '-',
        teacher?.name || '-',
        room?.name || '-',
        s.date,
        `${s.startTime} - ${s.endTime}`,
        present,
        absent,
        s.status === 'completed' ? 'مكتملة' : s.status === 'live' ? 'جارية' : 'مجدولة'
      ];
    });

    if (format === 'csv') {
      downloadCSV('تقرير_الحصص_والحضور_The_Way', headers, rows);
    } else if (format === 'excel') {
      downloadExcelHTML('تقرير_الحصص_The_Way', 'سجل الحصص والحضور والغياب', headers, rows);
    } else {
      downloadJSON('تقرير_الحصص_The_Way', sessions);
    }

    addToast({
      type: 'success',
      title: 'تم تصدير كشوف الحصص والحضور ✓',
      message: `تم تصدير بيانات ${sessions.length} حصة بنجاح`
    });
  };

  // 4. Export Contracts & Plans
  const handleExportContracts = (format: 'csv' | 'excel' | 'json') => {
    const headers = ['رقم العقد', 'كود الطالب', 'اسم الطالب', 'إجمالي الحصص', 'الحصص المنفذة', 'المتبقي', 'القيمة الكلية', 'المسدد', 'المتبقي المالي', 'تاريخ الانتهاء', 'الحالة'];
    const rows = contracts.map(c => {
      const student = students.find(s => s.id === c.studentId);
      const remainingSessions = c.totalSessions - c.usedSessions;
      const remainingMoney = c.totalPrice - (c.paidAmount || 0);

      return [
        c.contractNumber,
        student?.code || '-',
        student?.name || '-',
        c.totalSessions,
        c.usedSessions,
        remainingSessions,
        c.totalPrice,
        c.paidAmount || 0,
        remainingMoney,
        c.endDate,
        c.status === 'active' ? 'ساري' : c.status === 'expired' ? 'منتهي' : 'مكتمل'
      ];
    });

    if (format === 'csv') {
      downloadCSV('تقرير_العقود_والاشتراكات_The_Way', headers, rows);
    } else if (format === 'excel') {
      downloadExcelHTML('تقرير_العقود_The_Way', 'سجل العقود والاشتراكات', headers, rows);
    } else {
      downloadJSON('تقرير_العقود_The_Way', contracts);
    }

    addToast({
      type: 'success',
      title: 'تم تصدير تقرير العقود والاشتراكات ✓',
      message: `تم تصدير ${contracts.length} عقد واشتراك بنجاح`
    });
  };

  // 5. Export Teacher Earnings
  const handleExportTeacherEarnings = (format: 'csv' | 'excel' | 'json') => {
    const headers = ['كود المدرس', 'اسم المدرس', 'رقم الهاتف', 'الحصص المجدولة', 'الحصص المنفذة', 'الأجر للحصة', 'إجمالي المستحقات'];
    const rows = teacherWorkloadData.map(tw => {
      const teacher = teachers.find(t => t.name === tw.name);
      return [
        teacher?.code || '-',
        tw.name,
        teacher?.phone || '-',
        tw.sessions,
        tw.completed,
        teacher?.defaultRate || 150,
        tw.earnings
      ];
    });

    if (format === 'csv') {
      downloadCSV('تقرير_مستحقات_المدرسين_The_Way', headers, rows);
    } else if (format === 'excel') {
      downloadExcelHTML('تقرير_المدرسين_The_Way', 'سجل ساعات ومستحقات طاقم التدريس', headers, rows);
    } else {
      downloadJSON('تقرير_المدرسين_The_Way', teacherWorkloadData);
    }

    addToast({
      type: 'success',
      title: 'تم تصدير تقرير مستحقات المدرسين ✓',
      message: `تم تصدير سجل إنتاجية ومستحقات المدرسين بنجاح`
    });
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            مركز التقارير والإحصائيات وتصدير البيانات
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تصدير تقارير Excel و CSV و JSON الشاملة، متابعة الإيرادات، وإنتاجية المدرسين
          </p>
        </div>

        {/* Global Print & Direct Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-black rounded-2xl shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير الشامل</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto">
        {[
          { id: 'analytics', label: 'المؤشرات والرسوم البيانية', icon: TrendingUp },
          { id: 'export_center', label: 'مركز تصدير التقارير (Excel / CSV)', icon: Download },
          { id: 'teachers_summary', label: 'إنتاجية ومستحقات المدرسين', icon: Users },
          { id: 'contracts_summary', label: 'متابعة باقات العقود والاشتراكات', icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS & DASHBOARD */}
      {activeReportTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي الدخل المالي"
              value={formatCurrency(totalRevenue, settings.currency)}
              subtitle="متحصلات الخزينة وسندات القبض"
              icon={DollarSign}
              color="emerald"
            />
            <StatCard
              title="نسبة الحضور الإجمالية"
              value={`${overallAttendanceRate}%`}
              subtitle={`حضور ${presentRecords} من أصل ${totalAttendanceRecords}`}
              icon={TrendingUp}
              color="indigo"
            />
            <StatCard
              title="الحصص المنفذة"
              value={`${totalCompletedSessions}`}
              subtitle={`من إجمالي ${sessions.length} حصة مجدولة`}
              icon={Calendar}
              color="amber"
            />
            <StatCard
              title="الطلاب المقيدين"
              value={`${students.length} طالب`}
              subtitle={`تحت إشراف ${teachers.length} مدرس`}
              icon={Users}
              color="sky"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Teacher Workload Bar Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  توزيع الحصص والإنتاجية لكل مدرس
                </h3>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">الحصص المجدولة والمكتملة</span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teacherWorkloadData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                        direction: 'rtl'
                      }}
                    />
                    <Bar dataKey="sessions" name="إجمالي الحصص" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="completed" name="الحصص المكتملة" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue By Method Donut Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  توزيع الإيرادات حسب قنوات الدفع
                </h3>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">نقداً مقابل الإلكتروني</span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val), settings.currency)}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                        direction: 'rtl'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXPORT CENTER */}
      {activeReportTab === 'export_center' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg">بوابة تصدير التقارير المتوافقة مع برنامج Excel</h3>
              </div>
              <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
                جميع ملفات Excel و CSV مصممة بترميز (UTF-8 with BOM) لضمان ظهور النصوص العربية بوضوح تام وبدون تشفير غير مفهوم.
              </p>
            </div>
          </div>

          {/* Export Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Students */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">تقرير سجل الطلاب وأولياء الأمور</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  يتضمن الأكواد، المراحل الدراسية، أرقام الهواتف، بيانات أولياء الأمور وحالة الحساب.
                </p>
                <div className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  إجمالي السجلات: <span className="text-indigo-600 dark:text-indigo-400">{students.length} طالب</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => handleExportStudents('excel')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xls)</span>
                </button>
                <button
                  onClick={() => handleExportStudents('csv')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExportStudents('json')}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                  title="تصدير JSON"
                >
                  <FileJson className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 2: Financial Receipts */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">تقرير الإيرادات وسندات القبض</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  كافة المعاملات المالية، أرقام الإيصالات، مبالغ التحصيل، وطريقة الدفع (نقدي، تحويل، فيزا).
                </p>
                <div className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  الإجمالي المحصل: <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRevenue, settings.currency)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => handleExportFinancials('excel')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xls)</span>
                </button>
                <button
                  onClick={() => handleExportFinancials('csv')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExportFinancials('json')}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                  title="تصدير JSON"
                >
                  <FileJson className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 3: Sessions & Attendance */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">تقرير الحصص وجداول الحضور والغياب</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  جدول الحصص المنفذة، نسبة الحضور لكل حصة، المدرس المسؤول، والقاعة المستخدمة.
                </p>
                <div className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  إجمالي الحصص: <span className="text-amber-600 dark:text-amber-400">{sessions.length} حصة</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => handleExportAttendance('excel')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xls)</span>
                </button>
                <button
                  onClick={() => handleExportAttendance('csv')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExportAttendance('json')}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                  title="تصدير JSON"
                >
                  <FileJson className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 4: Contracts & Subscriptions */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">تقرير الاشتراكات وباقات الحصص</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  متابعة عدد الحصص المتبقية لكل طالب، تواريخ انتهاء العقود، والأرصدة المستحقة.
                </p>
                <div className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  العقود النشطة: <span className="text-sky-600 dark:text-sky-400">{contracts.filter(c => c.status === 'active').length} عقد</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => handleExportContracts('excel')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xls)</span>
                </button>
                <button
                  onClick={() => handleExportContracts('csv')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExportContracts('json')}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                  title="تصدير JSON"
                >
                  <FileJson className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 5: Teacher Earnings */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">تقرير إنتاجية ومستحقات المدرسين</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  إجمالي الحصص المنفذة لكل مدرس، معدل الأجر، وتصفية المستحقات المالية.
                </p>
                <div className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  عدد المدرسين: <span className="text-purple-600 dark:text-purple-400">{teachers.length} مدرس</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => handleExportTeacherEarnings('excel')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xls)</span>
                </button>
                <button
                  onClick={() => handleExportTeacherEarnings('csv')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExportTeacherEarnings('json')}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                  title="تصدير JSON"
                >
                  <FileJson className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEACHERS SUMMARY */}
      {activeReportTab === 'teachers_summary' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900 dark:text-white">سجل إنتاجية ومستحقات المدرسين</h3>
            <button
              onClick={() => handleExportTeacherEarnings('excel')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">اسم المدرس</th>
                  <th className="p-3">الحصص المجدولة</th>
                  <th className="p-3">الحصص المكتملة</th>
                  <th className="p-3">الأجر لكل حصة</th>
                  <th className="p-3">إجمالي الاستحقاق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {teacherWorkloadData.map((tw, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{tw.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{tw.sessions}</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{tw.completed}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">150 {settings.currency}</td>
                    <td className="p-3 font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(tw.earnings, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONTRACTS SUMMARY */}
      {activeReportTab === 'contracts_summary' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900 dark:text-white">سجل متابعة باقات العقود والاشتراكات</h3>
            <button
              onClick={() => handleExportContracts('excel')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">رقم العقد</th>
                  <th className="p-3">اسم الطالب</th>
                  <th className="p-3">الحصص (مستنفذة / إجمالي)</th>
                  <th className="p-3">المتبقي</th>
                  <th className="p-3">المبلغ الإجمالي</th>
                  <th className="p-3">تاريخ الانتهاء</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {contracts.map(c => {
                  const student = students.find(s => s.id === c.studentId);
                  const remaining = c.totalSessions - c.usedSessions;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{c.contractNumber}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{student?.name || '-'}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{c.usedSessions} / {c.totalSessions}</td>
                      <td className="p-3 font-black text-amber-600 dark:text-amber-400">{remaining} حصص</td>
                      <td className="p-3 text-slate-900 dark:text-white">{formatCurrency(c.totalPrice, settings.currency)}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{c.endDate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {c.status === 'active' ? 'ساري' : 'منتهي'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
