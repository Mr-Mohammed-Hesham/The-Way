import { Session, Room, AttendanceRecord, AttendanceStatus, ConflictCheckResult } from '../types';

export function formatCurrency(amount: number, currency: string = 'ج.م'): string {
  return `${amount.toLocaleString('ar-EG')} ${currency}`;
}

export function formatArabicDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function formatShortArabicDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('ar-EG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  if (isNaN(hours)) return time24;

  const period = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${period}`;
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function areTimesOverlapping(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return Math.max(s1, s2) < Math.min(e1, e2);
}

export function checkSessionConflicts(
  target: {
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
    teacherId: string;
    roomId: string;
    studentIds: string[];
  },
  existingSessions: Session[] = [],
  rooms: Room[] = [],
  teachersMap: Record<string, string> = {},
  studentsMap: Record<string, string> = {},
  roomsMap: Record<string, string> = {}
): ConflictCheckResult {
  const reasons: string[] = [];
  const conflictingSessionIds: string[] = [];

  if (!target || !target.startTime || !target.endTime || !target.date) {
    return { hasConflict: false, reasons: [], conflictingSessionIds: [] };
  }

  // Check end time vs start time
  if (timeToMinutes(target.endTime) <= timeToMinutes(target.startTime)) {
    reasons.push('وقت نهاية الحصة يجب أن يكون بعد وقت البدء');
  }

  // Check room capacity
  const targetRoom = (rooms || []).find(r => r.id === target.roomId);
  if (targetRoom && (target.studentIds || []).length > targetRoom.capacity) {
    reasons.push(
      `تجاوز سعة القاعة: القاعة "${targetRoom.name}" تسع ${targetRoom.capacity} طلاب فقط بينما تم تسجيل ${target.studentIds.length} طلاب!`
    );
  }

  const safeTeachersMap = teachersMap || {};
  const safeStudentsMap = studentsMap || {};
  const safeRoomsMap = roomsMap || {};

  const sameDaySessions = (existingSessions || []).filter(
    s => s.date === target.date && s.id !== target.id && s.status !== 'cancelled'
  );

  for (const session of sameDaySessions) {
    const isOverlap = areTimesOverlapping(
      target.startTime,
      target.endTime,
      session.startTime,
      session.endTime
    );

    if (isOverlap) {
      // 1. Teacher Conflict
      if (session.teacherId && session.teacherId === target.teacherId) {
        const teacherName = safeTeachersMap[target.teacherId] || 'المدرس';
        reasons.push(
          `تعارض في جدول المدرس (${teacherName}): لديه حصة أخرى من ${formatTime12h(
            session.startTime
          )} إلى ${formatTime12h(session.endTime)}`
        );
        conflictingSessionIds.push(session.id);
      }

      // 2. Room Conflict
      if (session.roomId && session.roomId === target.roomId && target.roomId !== 'online') {
        const roomName = safeRoomsMap[target.roomId] || targetRoom?.name || 'القاعة';
        reasons.push(
          `تعارض في القاعة (${roomName}): مشغولة بحصة أخرى في نفس التوقيت (${formatTime12h(
            session.startTime
          )} - ${formatTime12h(session.endTime)})`
        );
        conflictingSessionIds.push(session.id);
      }

      // 3. Student Conflict
      const overlappingStudents = (target.studentIds || []).filter(stId =>
        (session.studentIds || []).includes(stId)
      );
      if (overlappingStudents.length > 0) {
        const studentNames = overlappingStudents
          .map(stId => safeStudentsMap[stId] || 'طالب')
          .join('، ');
        reasons.push(
          `تعارض في جدول الطلاب (${studentNames}): مسجلون في حصة أخرى متزامنة من ${formatTime12h(
            session.startTime
          )} إلى ${formatTime12h(session.endTime)}`
        );
        conflictingSessionIds.push(session.id);
      }
    }
  }

  return {
    hasConflict: reasons.length > 0,
    reasons,
    conflictingSessionIds: Array.from(new Set(conflictingSessionIds))
  };
}

export function calculateAttendancePercentage(records: AttendanceRecord[]): number {
  if (!records || records.length === 0) return 100;
  const eligibleRecords = records.filter(r => r.status !== AttendanceStatus.CANCELLED);
  if (eligibleRecords.length === 0) return 100;

  const attended = eligibleRecords.filter(
    r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE
  ).length;

  return Math.round((attended / eligibleRecords.length) * 100);
}

export function isSessionCurrentlyLive(dateStr: string, startTime: string, endTime: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  if (dateStr !== today) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

export function exportToCSV(filename: string, rows: (string | number)[][], headers: string[]): void {
  const content = [
    headers.join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          const str = String(cell ?? '').replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    )
  ].join('\n');

  // Add UTF-8 BOM so Excel opens Arabic properly
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
