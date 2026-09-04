import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  Plus,
  Radio,
  CheckCircle2,
  Clock,
  DoorOpen,
  Users,
  Edit,
  Trash2,
  CheckSquare,
  Play,
  Filter,
  Layers,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import { ConfirmModal } from '../../common/ConfirmModal';
import { ViewOnlyBanner } from '../../common/ViewOnlyBanner';
import { Session, SessionStatus } from '../../../types';
import { formatTime12h, formatArabicDate } from '../../../utils/formatters';

interface SessionsViewProps {
  onOpenAddSession: () => void;
  onOpenEditSession: (session: Session) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  onOpenAddSession,
  onOpenEditSession
}) => {
  const {
    sessions,
    subjects,
    teachers,
    rooms,
    students,
    subjectsMap,
    teachersMap,
    roomsMap,
    studentsMap,
    startSession,
    completeSession,
    cancelSession,
    deleteSession,
    setActiveTab,
    canEditSection
  } = useApp();

  const isEditable = canEditSection('sessions');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  const filteredSessions = useMemo(() => {
    return sessions.filter(ses => {
      const matchesDate = !selectedDate || ses.date === selectedDate;
      const matchesSubject = selectedSubject === 'all' || ses.subjectId === selectedSubject;
      const matchesTeacher = selectedTeacher === 'all' || ses.teacherId === selectedTeacher;
      const matchesStatus = selectedStatus === 'all' || ses.status === selectedStatus;

      return matchesDate && matchesSubject && matchesTeacher && matchesStatus;
    });
  }, [sessions, selectedDate, selectedSubject, selectedTeacher, selectedStatus]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(todayStr);
  };

  return (
    <div className="space-y-6 text-right">
      {/* View Only Banner for restricted departments */}
      <ViewOnlyBanner section="sessions" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            جدول الحصص والجلسات الدراسية
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة المواعيد، الحضور، وتوزيع القاعات مع الفحص التلقائي لتعارض المواعيد
          </p>
        </div>

        {isEditable && (
          <button
            onClick={onOpenAddSession}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>جدولة حصة جديدة</span>
          </button>
        )}
      </div>

      {/* Date Navigation & Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        {/* Date Navigator */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleNextDay}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="اليوم السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={handlePrevDay}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="اليوم التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                selectedDate === todayStr
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              اليوم
            </button>

            <button
              onClick={() => setSelectedDate('')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                !selectedDate ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              كافة التواريخ
            </button>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {selectedDate ? formatArabicDate(selectedDate) : 'عرض كل الحصص المجدولة'}
          </span>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          <select
            value={selectedTeacher}
            onChange={e => setSelectedTeacher(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كافة المدرسين</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كافة الحالات</option>
            <option value={SessionStatus.SCHEDULED}>مجدولة (Scheduled)</option>
            <option value={SessionStatus.LIVE}>جارية الآن (LIVE)</option>
            <option value={SessionStatus.COMPLETED}>مكتملة (Completed)</option>
            <option value={SessionStatus.CANCELLED}>ملغاة (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 space-y-2">
          <Calendar className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <h4 className="text-base font-bold text-slate-800">لا توجد حصص مسجلة لهذا التاريخ أو الفلتر</h4>
          <p className="text-xs text-slate-400">يمكنك جدولة حصة جديدة بالضغط على "جدولة حصة جديدة"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map(session => {
            const isLive = session.status === SessionStatus.LIVE;
            const isCompleted = session.status === SessionStatus.COMPLETED;
            const studentNames = session.studentIds.map(id => studentsMap[id] || 'طالب').join('، ');

            return (
              <div
                key={session.id}
                className={`bg-white rounded-3xl p-6 border shadow-xs space-y-4 transition-all text-xs ${
                  isLive
                    ? 'border-2 border-emerald-400 shadow-md ring-2 ring-emerald-100'
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {isLive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          LIVE الآن
                        </span>
                      ) : (
                        <Badge status={session.status} />
                      )}
                      <span className="text-slate-500 font-bold">{subjectsMap[session.subjectId]}</span>
                    </div>
                    <h3 className="font-black text-base text-slate-900">{session.title}</h3>
                  </div>

                  <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded-xl border border-indigo-200">
                    {session.sessionCode}
                  </span>
                </div>

                {/* Details Matrix */}
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">المدرس:</span>
                    <span className="font-bold text-slate-900">{teachersMap[session.teacherId]}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">القاعة:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <DoorOpen className="w-3.5 h-3.5" />
                      {roomsMap[session.roomId]}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">التاريخ والتوقيت:</span>
                    <span className="font-bold font-mono text-slate-800">
                      {session.date} ({formatTime12h(session.startTime)} - {formatTime12h(session.endTime)})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">عدد الطلاب:</span>
                    <span className="font-bold text-slate-900">{session.studentIds.length} طالب</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px]">الطلاب المسجلين:</span>
                    <span className="font-medium text-slate-700 line-clamp-1">{studentNames}</span>
                  </div>
                </div>

                {session.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                    {session.notes}
                  </p>
                )}

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {/* Start Live button */}
                    {session.status === SessionStatus.SCHEDULED && (
                      <button
                        onClick={() => startSession(session.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>بدء الحصة (LIVE)</span>
                      </button>
                    )}

                    {/* Complete button */}
                    {session.status === SessionStatus.LIVE && (
                      <button
                        onClick={() => completeSession(session.id)}
                        className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>إنهاء الحصة</span>
                      </button>
                    )}

                    {/* Attendance button */}
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>كشف الحضور</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditSession(session)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSessionToDelete(session)}
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
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={() => {
          if (sessionToDelete) {
            deleteSession(sessionToDelete.id);
          }
        }}
        title="تأكيد حذف الحصة"
        message={`هل أنت متأكد من رغبتك في حذف الحصة "${sessionToDelete?.title}" نهائياً من الجدول؟`}
        confirmText="نعم، حذف الحصة"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
};
