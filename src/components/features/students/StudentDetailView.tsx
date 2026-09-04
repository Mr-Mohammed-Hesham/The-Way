import React, { useState } from 'react';
import {
  ArrowRight,
  User,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  CheckSquare,
  Clock,
  QrCode,
  Edit,
  Trash2,
  Receipt,
  Plus,
  Printer,
  ShieldCheck,
  FileUp,
  Download
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import {
  formatCurrency,
  formatArabicDate,
  formatTime12h,
  calculateAttendancePercentage
} from '../../../utils/formatters';
import { AttendanceStatus, ContractStatus, SessionStatus } from '../../../types';

interface StudentDetailViewProps {
  studentId: string;
  onBack: () => void;
  onEdit: () => void;
  onOpenAddContract: () => void;
  onOpenAddPayment: () => void;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  studentId,
  onBack,
  onEdit,
  onOpenAddContract,
  onOpenAddPayment
}) => {
  const {
    students,
    subjects,
    teachers,
    assignments,
    contracts,
    sessions,
    attendance,
    payments,
    settings,
    setActiveQRStudent,
    setActiveReceiptPayment,
    canViewFinancials,
    canEditSection
  } = useApp();

  const canEditStudent = canEditSection('students');
  const canAddContract = canEditSection('contracts');
  const canAddPayment = canEditSection('payments');

  const [activeTab, setActiveTab] = useState<
    'overview' | 'academic' | 'sessions' | 'attendance' | 'contracts' | 'payments' | 'schedule' | 'documents'
  >('overview');

  const student = students.find(s => s.id === studentId);

  if (!student) {
    return (
      <div className="p-8 bg-white rounded-3xl text-center space-y-3">
        <p className="text-slate-500 font-bold">لم يتم العثور على سجل هذا الطالب</p>
        <button onClick={onBack} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          العودة لقائمة الطلاب
        </button>
      </div>
    );
  }

  // Student specific data
  const studentContracts = contracts.filter(c => c.studentId === student.id);
  const studentPayments = payments.filter(p => p.studentId === student.id);
  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const studentAssignments = assignments.filter(a => a.studentId === student.id);
  const studentSessions = sessions.filter(s => s.studentIds.includes(student.id));

  // Calculations
  const totalContractedSessions = studentContracts.reduce((acc, c) => acc + c.totalSessions, 0);
  const totalUsedSessions = studentContracts.reduce((acc, c) => acc + c.usedSessions, 0);
  const remainingSessions = Math.max(0, totalContractedSessions - totalUsedSessions);

  const totalContractPrice = studentContracts.reduce((acc, c) => acc + c.totalPrice, 0);
  const totalPaid = studentPayments.reduce((acc, p) => acc + p.amount, 0);
  const outstandingBalance = Math.max(0, totalContractPrice - totalPaid);

  const attendancePercentage = calculateAttendancePercentage(studentAttendance);

  return (
    <div className="space-y-6 text-right">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 shadow-xs transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة الطلاب</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveQRStudent(student)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>كارت الباركود الذكي</span>
          </button>

          {canEditStudent && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل البيانات</span>
            </button>
          )}
        </div>
      </div>

      {/* Student Profile Hero Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md"
            style={{ backgroundColor: student.avatarColor || '#4f46e5' }}
          >
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-xl font-black text-slate-900">{student.name}</h2>
              <Badge status={student.status} />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {student.code}
              </span>
              <span>{student.grade}</span>
              {student.school && <span>• {student.school}</span>}
            </p>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full md:w-auto text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-slate-400 block text-[11px]">نسبة الحضور:</span>
            <span
              className={`text-base font-black ${
                attendancePercentage >= 85
                  ? 'text-emerald-600'
                  : attendancePercentage >= 65
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {attendancePercentage}%
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">رصيد الحصص:</span>
            <span className="text-base font-black text-indigo-900">
              {remainingSessions} <span className="text-xs font-normal text-slate-500">/ {totalContractedSessions}</span>
            </span>
          </div>

          {canViewFinancials && (
            <div>
              <span className="text-slate-400 block text-[11px]">المستحق للدفع:</span>
              <span
                className={`text-base font-black ${
                  outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {formatCurrency(outstandingBalance, settings.currency)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        {[
          { id: 'overview', label: 'نظرة عامة والبيانات', icon: User },
          { id: 'academic', label: 'المعلومات الأكاديمية والمدرسين', icon: GraduationCap },
          { id: 'sessions', label: `الحصص والرصيد (${remainingSessions})`, icon: Calendar },
          { id: 'attendance', label: `سجل الحضور والغياب (${studentAttendance.length})`, icon: CheckSquare },
          { id: 'contracts', label: `العقود والاشتراكات (${studentContracts.length})`, icon: FileText },
          { id: 'payments', label: `المدفوعات والإيصالات (${studentPayments.length})`, icon: CreditCard },
          { id: 'schedule', label: 'الجدول الأسبوعي', icon: Clock },
          { id: 'documents', label: 'المستندات والملفات', icon: FileUp }
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

      {/* TAB CONTENT 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">
              البيانات الشخصية والدراسية
            </h3>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">الاسم الكامل:</span>
                <span className="font-bold text-slate-900">{student.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">كود الطالب:</span>
                <span className="font-mono font-bold text-indigo-700">{student.code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">الصف / المرحلة:</span>
                <span className="font-bold text-slate-900">{student.grade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">المدرسة:</span>
                <span className="font-semibold text-slate-800">{student.school || '---'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">هاتف الطالب الشخصي:</span>
                <span className="font-mono font-bold text-slate-900">{student.phone || 'غير مسجل'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">النوع:</span>
                <span className="font-medium">{student.gender === 'male' ? 'ذكر (طالب)' : 'أنثى (طالبة)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">تاريخ التسجيل بالسنتر:</span>
                <span className="font-mono">{formatArabicDate(student.registrationDate)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">العنوان:</span>
                <span className="font-medium text-slate-800">{student.address || '---'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">
              بيانات ولي الأمر والاتصال
            </h3>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">اسم ولي الأمر:</span>
                <span className="font-bold text-slate-900">{student.parent.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">صلة القرابة:</span>
                <span className="font-medium">{student.parent.relationship}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">رقم الهاتف (للاتصال):</span>
                <span className="font-mono font-bold text-emerald-700">{student.parent.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">رقم الواتساب:</span>
                <span className="font-mono font-bold text-indigo-700">
                  {student.parent.whatsapp || student.parent.phone}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">البريد الإلكتروني:</span>
                <span className="font-mono">{student.parent.email || '---'}</span>
              </div>
            </div>

            {student.notes && (
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs">
                <span className="font-bold text-amber-900 block mb-1">ملاحظات خاصة:</span>
                <p className="text-amber-800 leading-relaxed">{student.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Academic Information */}
      {activeTab === 'academic' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">المواد الدراسية والمدرسين المعينين</h3>
            <span className="text-xs text-slate-500">
              مسجل في {student.subjectIds.length} مواد دراسية
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.subjectIds.map(subId => {
              const subject = subjects.find(s => s.id === subId);
              const assignment = studentAssignments.find(a => a.subjectId === subId);
              const teacher = teachers.find(t => t.id === assignment?.teacherId);

              return (
                <div
                  key={subId}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">{subject?.name || 'مادة'}</h4>
                    <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {subject?.code}
                    </span>
                  </div>

                  <p className="text-slate-500">{subject?.description}</p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">المدرس المعين:</span>
                      <span className="font-bold text-slate-900">{teacher?.name || 'لم يتم التعيين بعد'}</span>
                    </div>
                    {assignment?.ratePerSession && (
                      <span className="text-emerald-700 font-bold">
                        {formatCurrency(assignment.ratePerSession, settings.currency)} / حصة
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <span className="text-xs text-indigo-700 font-semibold block">إجمالي الحصص المتعاقد عليها</span>
              <span className="text-2xl font-black text-indigo-950">{totalContractedSessions}</span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <span className="text-xs text-emerald-700 font-semibold block">الحصص المكتملة (المستهلكة)</span>
              <span className="text-2xl font-black text-emerald-950">{totalUsedSessions}</span>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <span className="text-xs text-amber-700 font-semibold block">رصيد الحصص المتبقية</span>
              <span className="text-2xl font-black text-amber-950">{remainingSessions}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-sm text-slate-900">سجل الحصص والجلسات المسجل بها</h4>
            <div className="space-y-2">
              {studentSessions.map(ses => (
                <div
                  key={ses.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-900">{ses.title}</h5>
                    <p className="text-slate-500 mt-0.5">
                      {ses.date} ({formatTime12h(ses.startTime)} - {formatTime12h(ses.endTime)})
                    </p>
                  </div>
                  <Badge status={ses.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: Attendance History */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">سجل الحضور والغياب الكامل</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              نسبة الحضور الإجمالية: {attendancePercentage}%
            </span>
          </div>

          {studentAttendance.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">لا توجد سجلات حضور مسجلة حتى الآن</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="py-3 px-4 font-bold">التاريخ</th>
                    <th className="py-3 px-4 font-bold">الحصة</th>
                    <th className="py-3 px-4 font-bold">الحالة</th>
                    <th className="py-3 px-4 font-bold">وقت الدخول</th>
                    <th className="py-3 px-4 font-bold">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentAttendance.map(att => {
                    const session = sessions.find(s => s.id === att.sessionId);
                    return (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-semibold">{att.date}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{session?.title || 'حصة'}</td>
                        <td className="py-3 px-4">
                          <Badge status={att.status} />
                        </td>
                        <td className="py-3 px-4 font-mono">{att.checkInTime || '---'}</td>
                        <td className="py-3 px-4 text-slate-500">{att.notes || '---'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: Contracts */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">العقود والاشتراكات</h3>
            <button
              onClick={onOpenAddContract}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>عقد جديد للطالب</span>
            </button>
          </div>

          <div className="space-y-3">
            {studentContracts.map(cnt => (
              <div
                key={cnt.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 font-mono">{cnt.contractNumber}</h4>
                    <p className="text-slate-500 text-[11px]">
                      من {cnt.startDate} إلى {cnt.endDate}
                    </p>
                  </div>
                  <Badge status={cnt.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">إجمالي الحصص:</span>
                    <span className="font-bold text-slate-900">{cnt.totalSessions} حصة</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الحصص المستهلكة:</span>
                    <span className="font-bold text-emerald-700">{cnt.usedSessions}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الحصص المتبقية:</span>
                    <span className="font-bold text-indigo-700">{cnt.totalSessions - cnt.usedSessions}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">إجمالي القيمة:</span>
                    <span className="font-black text-slate-900">
                      {formatCurrency(cnt.totalPrice, settings.currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: Payments */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">سندات القبض والمدفوعات</h3>
            <button
              onClick={onOpenAddPayment}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>تحصيل دفعة مالية</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {studentPayments.map(pay => (
              <div
                key={pay.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-mono font-bold text-sm text-slate-900">{pay.receiptNumber}</h4>
                  <p className="text-slate-500 mt-0.5">
                    تاريخ: {pay.date} • طريقة السداد: {pay.paymentMethod}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {formatCurrency(pay.amount, settings.currency)}
                  </span>
                  <button
                    onClick={() => setActiveReceiptPayment(pay)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-slate-700 font-bold shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-600" />
                    <span>طباعة الإيصال</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: Schedule */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-black text-base text-slate-900">مواعيد حصص الطالب المجدولة</h3>
          <div className="space-y-2">
            {studentSessions.map(ses => (
              <div
                key={ses.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 font-mono font-bold">
                    {ses.startTime}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{ses.title}</h5>
                    <p className="text-slate-500">{ses.date}</p>
                  </div>
                </div>
                <Badge status={ses.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 8: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900">المستندات والشهادات المرفقة</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors">
              <FileUp className="w-4 h-4" />
              <span>رفع مستند جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-600" />
                <div>
                  <h4 className="font-bold text-slate-900">عقد التسجيل والاشتراك المعتمد</h4>
                  <p className="text-[11px] text-slate-400">PDF • 1.2 MB</p>
                </div>
              </div>
              <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-slate-900">صورة بطاقة ولي الأمر / شهادة الميلاد</h4>
                  <p className="text-[11px] text-slate-400">JPG • 840 KB</p>
                </div>
              </div>
              <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
