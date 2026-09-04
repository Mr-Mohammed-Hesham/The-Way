import React, { useState } from 'react';
import {
  GraduationCap,
  Phone,
  User,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  Printer,
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { TheWayLogo } from './TheWayLogo';

interface StudentIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const { settings, subjectsMap } = useApp();
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !student) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-id-card-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 text-right shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'جاري التجهيز...' : 'طباعة البطاقة'}</span>
            </button>
          </div>

          <div className="text-right">
            <h3 id="student-id-card-title" className="text-base font-black text-slate-900 dark:text-white">
              بطاقة عضوية الطالب الذكية
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              بطاقة تعريفية رسمية معتمدة تتضمن الكود التعريفي والبيانات الأكاديمية
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div className="my-5 space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0B1120] text-white p-6 shadow-2xl border border-blue-700/40">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-sky-400/15 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

            {/* Header / Logo */}
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <TheWayLogo variant="white" size="sm" />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-[11px] font-bold text-sky-200">
                <Sparkles className="w-3 h-3 text-sky-300" />
                <span>عضوية معتمدة - UAE</span>
              </div>
            </div>

            {/* Student Info Hero */}
            <div className="my-5 flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl border-2 border-white/30 shrink-0"
                style={{ backgroundColor: student.avatarColor || '#2563eb' }}
              >
                {student.name.charAt(0)}
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="font-black text-lg text-white tracking-tight truncate">{student.name}</h3>
                <p className="text-xs text-blue-200 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-sky-300 shrink-0" />
                  <span className="font-semibold">{student.grade}</span>
                  {student.track && student.track !== 'none' && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-400/20 text-sky-200 text-[10px] font-bold">
                      {student.track === 'advanced' ? 'المسار المتقدم' : 'المسار العام'}
                    </span>
                  )}
                </p>
                {student.school && (
                  <p className="text-[11px] text-blue-300/80 truncate">🏫 {student.school}</p>
                )}
              </div>
            </div>

            {/* Prominent Student Code Badge */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center justify-between my-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-300 block tracking-wider">
                  الكود التعريفي للطالب (STUDENT ID CODE)
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-white tracking-widest block mt-0.5">
                  {student.code}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                حساب نشط ✓
              </div>
            </div>

            {/* Enrolled Subjects */}
            {student.subjectIds && student.subjectIds.length > 0 && (
              <div className="my-3 pt-2 border-t border-white/10">
                <span className="text-[10px] text-blue-200 font-bold block mb-1.5">المواد المسجل بها:</span>
                <div className="flex flex-wrap gap-1.5">
                  {student.subjectIds.map(subId => (
                    <span
                      key={subId}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold rounded-lg border border-white/10"
                    >
                      {subjectsMap[subId] || 'مادة دراسية'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Card Footer */}
            <div className="pt-3 mt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-200">
              <div className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-sky-300" />
                <span>ولي الأمر: {student.parent.phone}</span>
              </div>
              <span className="font-medium text-sky-300/80">{settings.phone}</span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="flex items-center justify-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              جاهز للاعتماد في كشوف الحضور واستقبال الطلاب
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              يمكن استخدام كود الطالب أعلاه لتسجيل الحضور السريع من شاشة الاستقبال
            </p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة البطاقة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
