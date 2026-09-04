import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { Session, SessionStatus, SessionType } from '../../../types';
import { AlertTriangle, CheckCircle2, Users, DoorOpen, Clock, Calendar } from 'lucide-react';

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: Session | null;
}

export const SessionFormModal: React.FC<SessionFormModalProps> = ({
  isOpen,
  onClose,
  sessionToEdit
}) => {
  const {
    subjects,
    teachers,
    rooms,
    students,
    sessions,
    checkConflicts,
    addSession,
    updateSession
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    teacherId: '',
    roomId: '',
    studentIds: [] as string[],
    date: todayStr,
    startTime: '14:00',
    endTime: '16:00',
    type: SessionType.GROUP,
    maxCapacity: 15,
    status: SessionStatus.SCHEDULED,
    notes: '',
    isRecurring: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (sessionToEdit) {
      setFormData({
        title: sessionToEdit.title,
        subjectId: sessionToEdit.subjectId,
        teacherId: sessionToEdit.teacherId,
        roomId: sessionToEdit.roomId,
        studentIds: sessionToEdit.studentIds || [],
        date: sessionToEdit.date,
        startTime: sessionToEdit.startTime,
        endTime: sessionToEdit.endTime,
        type: sessionToEdit.type,
        maxCapacity: sessionToEdit.maxCapacity || 15,
        status: sessionToEdit.status,
        notes: sessionToEdit.notes || '',
        isRecurring: sessionToEdit.isRecurring || false
      });
    } else {
      const defaultSub = subjects[0]?.id || '';
      const defaultTeacher = teachers[0]?.id || '';
      const defaultRoom = rooms[0]?.id || '';

      setFormData({
        title: '',
        subjectId: defaultSub,
        teacherId: defaultTeacher,
        roomId: defaultRoom,
        studentIds: [],
        date: todayStr,
        startTime: '16:00',
        endTime: '18:00',
        type: SessionType.GROUP,
        maxCapacity: 15,
        status: SessionStatus.SCHEDULED,
        notes: '',
        isRecurring: false
      });
    }
    setErrors({});
  }, [isOpen, sessionToEdit?.id]);

  // Real-time conflict validation
  const conflictResult = useMemo(() => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.roomId) {
      return { hasConflict: false, reasons: [], conflictingSessionIds: [] };
    }
    return checkConflicts({
      id: sessionToEdit?.id,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      teacherId: formData.teacherId,
      roomId: formData.roomId,
      studentIds: formData.studentIds
    });
  }, [formData, checkConflicts, sessionToEdit]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errs.endTime = 'وقت الانتهاء يجب أن يكون بعد وقت البدء';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const selectedSubject = subjects.find(s => s.id === formData.subjectId) || subjects[0];
      const selectedTeacher = teachers.find(t => t.id === formData.teacherId) || teachers[0];
      const selectedRoom = rooms.find(r => r.id === formData.roomId) || rooms[0];

      const safeTitle = formData.title.trim() || `حصة ${selectedSubject?.name || 'الدرس'} - ${selectedTeacher?.name || ''}`;
      const safeDate = formData.date || todayStr;
      const safeStartTime = formData.startTime || '16:00';
      const safeEndTime = formData.endTime || '18:00';

      const payload = {
        title: safeTitle,
        subjectId: selectedSubject?.id || '',
        teacherId: selectedTeacher?.id || '',
        roomId: selectedRoom?.id || '',
        studentIds: formData.studentIds,
        date: safeDate,
        startTime: safeStartTime,
        endTime: safeEndTime,
        type: formData.type,
        maxCapacity: formData.maxCapacity || selectedRoom?.capacity || 15,
        status: formData.status,
        notes: formData.notes.trim(),
        isRecurring: formData.isRecurring
      };

      if (sessionToEdit) {
        updateSession(sessionToEdit.id, payload);
      } else {
        addSession(payload, formData.isRecurring ? 4 : 1);
      }
      onClose();
    } catch (err) {
      console.error('Error submitting session form:', err);
    }
  };

  const toggleStudent = (stId: string) => {
    setFormData(prev => {
      const exists = prev.studentIds.includes(stId);
      return {
        ...prev,
        studentIds: exists ? prev.studentIds.filter(id => id !== stId) : [...prev.studentIds, stId]
      };
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sessionToEdit ? `تعديل الحصة (${sessionToEdit.title})` : 'جدولة حصة / مجموعة جديدة'}
      subtitle="تحديد المدرس، المادة، القاعة، الطلاب والتحقق التلقائي من التعارضات"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-right">
        {/* Conflict Warning Banner */}
        {conflictResult.hasConflict && conflictResult.reasons.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>تنبيه: تم اكتشاف تعارض في الجداول أو الطاقة الاستيعابية!</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300 pr-2">
              {conflictResult.reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Basic Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              عنوان الحصة / المجموعة
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: مراجعة نهائية - الكيمياء العضوية (مجموعة A)"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              المادة الدراسية <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.subjectId}
              onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              المدرس المسؤول <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.teacherId}
              onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              القاعة / المعمل <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.roomId}
              onChange={e => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} (سعة {r.capacity} طالب)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع الحصة</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as SessionType })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value={SessionType.GROUP}>مجموعة عامة (Group)</option>
              <option value={SessionType.INDIVIDUAL}>حصة فردية خاصة (1-on-1)</option>
              <option value={SessionType.ONLINE}>أونلاين (Online)</option>
              <option value={SessionType.REVIEW}>مراجعة امتحانات (Exam Review)</option>
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">توقيت وتاريخ الحصة</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">تاريخ الحصة</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">وقت البدء</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">وقت الانتهاء</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          {errors.endTime && <p className="text-[11px] text-rose-500 mt-1">{errors.endTime}</p>}
        </div>

        {/* Students Enrollment Multi-Select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              تسجيل الطلاب في الحصة ({formData.studentIds.length} طالب محدد)
            </label>
            <div className="flex gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, studentIds: students.map(s => s.id) })}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                تحديد الكل
              </button>
              <span className="text-slate-400">•</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, studentIds: [] })}
                className="text-slate-500 dark:text-slate-400 font-bold hover:underline cursor-pointer"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
            {students.map(st => {
              const isSelected = formData.studentIds.includes(st.id);
              return (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => toggleStudent(st.id)}
                  className={`p-2 rounded-xl border text-right transition-all text-xs font-bold cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-200 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{st.name}</span>
                    <span>{isSelected ? '✓' : ''}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">{st.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظات / محتوى الحصة</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="موضوع الدرس، صفحات الواجب، أو تنبيهات..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {sessionToEdit ? 'حفظ التعديلات' : 'جدولة وتأكيد الحصة'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
