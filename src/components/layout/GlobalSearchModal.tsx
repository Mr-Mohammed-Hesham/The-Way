import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, GraduationCap, FileText, Calendar, Receipt, DoorOpen, ArrowLeft, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const {
    students,
    teachers,
    contracts,
    payments,
    sessions,
    rooms,
    setSelectedStudentId,
    setSelectedTeacherId,
    setActiveTab,
    setActiveReceiptPayment
  } = useApp();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Listen to Escape key or Cmd+K
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();

    const matchedStudents = students.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.parent.phone.includes(q) ||
        s.grade.toLowerCase().includes(q)
    );

    const matchedTeachers = teachers.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.phone.includes(q)
    );

    const matchedContracts = contracts.filter(
      c => c.contractNumber.toLowerCase().includes(q)
    );

    const matchedPayments = payments.filter(
      p => p.receiptNumber.toLowerCase().includes(q)
    );

    const matchedSessions = sessions.filter(
      s => s.sessionCode.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
    );

    const matchedRooms = rooms.filter(
      r => r.name.toLowerCase().includes(q) || r.number.includes(q)
    );

    return {
      students: matchedStudents,
      teachers: matchedTeachers,
      contracts: matchedContracts,
      payments: matchedPayments,
      sessions: matchedSessions,
      rooms: matchedRooms,
      total:
        matchedStudents.length +
        matchedTeachers.length +
        matchedContracts.length +
        matchedPayments.length +
        matchedSessions.length +
        matchedRooms.length
    };
  }, [query, students, teachers, contracts, payments, sessions, rooms]);

  if (!isOpen) return null;

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setActiveTab('students');
    onClose();
  };

  const handleSelectTeacher = (id: string) => {
    setSelectedTeacherId(id);
    setActiveTab('teachers');
    onClose();
  };

  const handleSelectContract = () => {
    setActiveTab('contracts');
    onClose();
  };

  const handleSelectPayment = (payment: any) => {
    setActiveReceiptPayment(payment);
    setActiveTab('payments');
    onClose();
  };

  const handleSelectSession = () => {
    setActiveTab('sessions');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-16 sm:pt-20 p-4 bg-slate-900/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 dark:border-slate-700 px-5 py-4 bg-slate-50/80 dark:bg-slate-900/60">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 ml-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="بحث شامل: اسم طالب، هاتف، كود، مدرس، رقم عقد، سند قبض، قاعة..."
            className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-2"
              title="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors mr-1 cursor-pointer"
            title="إغلاق البحث"
          >
            <X className="w-5 h-5" />
          </button>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-200/80 dark:bg-slate-700 rounded-md mr-2">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
              <p className="text-sm font-medium">ابدأ بالكتابة للبحث في كافة سجلات The Way Center</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">يمكنك البحث بالاسم أو كود الطالب أو رقم الهاتف أو رقم الإيصال</p>
            </div>
          )}

          {results && results.total === 0 && (
            <div className="py-10 text-center text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-sm">لم يتم العثور على أي نتائج مطابقة لـ "{query}"</p>
            </div>
          )}

          {results && results.total > 0 && (
            <div className="space-y-4">
              {/* Students Section */}
              {results.students.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    الطلاب ({results.students.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.students.map(st => (
                      <div
                        key={st.id}
                        onClick={() => handleSelectStudent(st.id)}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs"
                            style={{ backgroundColor: st.avatarColor || '#4f46e5' }}
                          >
                            {st.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-900 dark:group-hover:text-indigo-300">
                              {st.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 ml-2">{st.code}</span>
                              {st.grade} • هاتف: {st.parent.phone}
                            </p>
                          </div>
                        </div>
                        <Badge status={st.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teachers Section */}
              {results.teachers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    المدرسون ({results.teachers.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.teachers.map(tc => (
                      <div
                        key={tc.id}
                        onClick={() => handleSelectTeacher(tc.id)}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-900 dark:group-hover:text-indigo-300">
                            {tc.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 ml-2">{tc.code}</span>
                            هاتف: {tc.phone}
                          </p>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contracts Section */}
              {results.contracts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    العقود ({results.contracts.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.contracts.map(cnt => (
                      <div
                        key={cnt.id}
                        onClick={handleSelectContract}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-900 dark:group-hover:text-indigo-300 font-mono">
                            {cnt.contractNumber}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            إجمالي الحصص: {cnt.totalSessions} | المتبقي: {cnt.totalSessions - cnt.usedSessions}
                          </p>
                        </div>
                        <Badge status={cnt.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payments Section */}
              {results.payments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    سندات القبض ({results.payments.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.payments.map(pay => (
                      <div
                        key={pay.id}
                        onClick={() => handleSelectPayment(pay)}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-900 dark:group-hover:text-indigo-300 font-mono">
                            {pay.receiptNumber}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            مبلغ: {pay.amount} ج.م | تاريخ: {pay.date}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                          عرض الإيصال
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sessions Section */}
              {results.sessions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    الحصص والجلسات ({results.sessions.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.sessions.map(ses => (
                      <div
                        key={ses.id}
                        onClick={handleSelectSession}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center justify-between cursor-pointer transition-all group"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-900 dark:group-hover:text-indigo-300">
                            {ses.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 ml-2">{ses.sessionCode}</span>
                            {ses.date} ({ses.startTime} - {ses.endTime})
                          </p>
                        </div>
                        <Badge status={ses.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
