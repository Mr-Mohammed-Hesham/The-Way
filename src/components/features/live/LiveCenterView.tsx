import React from 'react';
import {
  Radio,
  DoorOpen,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../common/Badge';
import { formatTime12h } from '../../../utils/formatters';

interface LiveCenterViewProps {
  onOpenQRScanner?: () => void;
  onOpenAddSession: () => void;
}

export const LiveCenterView: React.FC<LiveCenterViewProps> = ({ onOpenAddSession }) => {
  const {
    sessions,
    rooms,
    teachers,
    students,
    teachersMap,
    subjectsMap,
    roomsMap,
    studentsMap,
    completeSession,
    setActiveTab
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const liveSessions = sessions.filter(s => s.status === 'live');
  const todayUpcoming = sessions.filter(s => s.date === todayStr && s.status === 'scheduled');
  const todayCompleted = sessions.filter(s => s.date === todayStr && s.status === 'completed');

  // Identify busy teachers vs available teachers
  const busyTeacherIds = new Set(liveSessions.map(s => s.teacherId));
  const availableTeachers = teachers.filter(t => !busyTeacherIds.has(t.id));
  const busyTeachers = teachers.filter(t => busyTeacherIds.has(t.id));

  // Identify room occupancy
  const occupiedRoomMap = new Map<string, typeof liveSessions[0]>();
  liveSessions.forEach(s => {
    if (s.roomId) occupiedRoomMap.set(s.roomId, s);
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              السنتر الآن (Live Command Center)
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </h2>
            <p className="text-xs text-slate-500">
              المتابعة المباشرة للحصص الحالية، إشغال القاعات، وتوافر المدرسين بالدقيقة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddSession}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>بدء حصة فورية</span>
          </button>
        </div>
      </div>

      {/* Live Sessions Now Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            الحصص الجارية في القاعات الآن ({liveSessions.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">يتم التحديث التلقائي</span>
        </div>

        {liveSessions.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-500 space-y-2">
            <Radio className="w-10 h-10 mx-auto text-slate-400 stroke-1" />
            <h4 className="text-base font-bold text-slate-800">لا توجد حصص نشطة حالياً في المركز</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              عندما يحين وقت الحصة المجدولة ستظهر تلقائياً هنا مع إمكانية إنهاء الحصة أو مراجعة الحضور.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {liveSessions.map(session => {
              const teacher = teachers.find(t => t.id === session.teacherId);
              const room = rooms.find(r => r.id === session.roomId);
              const subjectName = subjectsMap[session.subjectId] || 'المادة';
              const studentNames = session.studentIds.map(id => studentsMap[id] || 'طالب').join('، ');

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-md relative overflow-hidden space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          LIVE الآن
                        </span>
                        <span className="text-xs font-bold text-slate-600">{subjectName}</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900">{session.title}</h4>
                    </div>

                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                      {session.sessionCode}
                    </span>
                  </div>

                  {/* Info Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block text-[11px]">المدرس:</span>
                      <span className="font-bold text-slate-900">{teacher?.name || 'مدرس'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">القاعة:</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <DoorOpen className="w-3.5 h-3.5" />
                        {room?.name || 'القاعة'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">التوقيت:</span>
                      <span className="font-bold font-mono text-slate-900">
                        {formatTime12h(session.startTime)} - {formatTime12h(session.endTime)}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block text-[11px]">الطلاب الحاضرين ({session.studentIds.length}):</span>
                      <span className="font-bold text-slate-800 line-clamp-1">{studentNames}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors"
                    >
                      تسجيل وتعديل الحضور
                    </button>

                    <button
                      onClick={() => completeSession(session.id)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors"
                    >
                      إنهاء الحصة واحتساب الأجر
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rooms Live Occupancy Map */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-indigo-600" />
            حالة إشغال القاعات والمعامل ({rooms.length} قاعات)
          </h3>
          <span className="text-xs text-slate-500">
            {occupiedRoomMap.size} قاعات مشغولة حالياً • {rooms.length - occupiedRoomMap.size} متاحة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => {
            const currentOccSession = occupiedRoomMap.get(room.id);
            const isOccupied = !!currentOccSession;
            const occCount = currentOccSession ? currentOccSession.studentIds.length : 0;
            const pct = Math.min(100, Math.round((occCount / room.capacity) * 100));

            return (
              <div
                key={room.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isOccupied
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-emerald-50/40 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-black text-sm text-slate-900">{room.name}</h4>
                    <p className="text-[11px] text-slate-500">سعة القاعة: {room.capacity} طالب</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isOccupied
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isOccupied ? 'مشغولة 🔴' : 'متاحة 🟢'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 my-3">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>نسبة الإشغال:</span>
                    <span>{isOccupied ? `${occCount} / ${room.capacity} (${pct}%)` : 'فارغة'}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct > 90 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {isOccupied && currentOccSession ? (
                  <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-rose-100 space-y-0.5">
                    <p className="font-bold text-slate-900 truncate">{currentOccSession.title}</p>
                    <p className="text-slate-500">المدرس: {teachersMap[currentOccSession.teacherId] || 'مدرس'}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 bg-white p-2.5 rounded-xl border border-emerald-100 text-center">
                    جاهزة لاستقبال حصص جديدة
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Teachers Live Status: Busy vs Available */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Busy Teachers */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            مدرسون في قاعات التدريس الآن ({busyTeachers.length})
          </h3>
          {busyTeachers.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">لا يوجد مدرسون في حصص الآن</p>
          ) : (
            <div className="space-y-2">
              {busyTeachers.map(tch => (
                <div
                  key={tch.id}
                  className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: tch.color || '#4f46e5' }}
                    >
                      {tch.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{tch.name}</p>
                      <p className="text-slate-500">هاتف: {tch.phone}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    في حصة الآن
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Teachers */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            مدرسون متاحون حالياً ({availableTeachers.length})
          </h3>
          <div className="space-y-2">
            {availableTeachers.map(tch => (
              <div
                key={tch.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: tch.color || '#4f46e5' }}
                  >
                    {tch.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{tch.name}</p>
                    <p className="text-slate-500">هاتف: {tch.phone}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium text-[11px]">
                  متاح للجدولة
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
