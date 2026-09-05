import {
  Student,
  Teacher,
  Subject,
  Room,
  TeacherAssignment,
  Contract,
  Session,
  AttendanceRecord,
  Payment,
  TeacherPayment,
  NotificationItem,
  AuditLogItem,
  User,
  UserRole,
  CenterSettings,
  StudentStatus,
  ContractStatus,
  SessionStatus,
  AttendanceStatus,
  AuditAction
} from '../types';

import {
  initialSettings,
  initialUsers,
  initialSubjects,
  initialRooms,
  initialTeachers,
  initialStudents,
  initialTeacherAssignments,
  initialContracts,
  initialSessions,
  initialAttendance,
  initialPayments,
  initialTeacherPayments,
  initialNotifications,
  initialAuditLogs
} from '../data/initialData';

import { checkSessionConflicts } from '../utils/formatters';
import { firebaseSync } from './firebaseSync';

const STORAGE_KEYS = {
  SETTINGS: 'theway_settings_v4',
  USERS: 'theway_users_v4',
  ACTIVE_USER: 'theway_active_user_v4',
  SUBJECTS: 'theway_subjects_v4',
  ROOMS: 'theway_rooms_v4',
  TEACHERS: 'theway_teachers_v4',
  STUDENTS: 'theway_students_v4',
  ASSIGNMENTS: 'theway_assignments_v4',
  CONTRACTS: 'theway_contracts_v4',
  SESSIONS: 'theway_sessions_v4',
  ATTENDANCE: 'theway_attendance_v4',
  PAYMENTS: 'theway_payments_v4',
  TEACHER_PAYMENTS: 'theway_teacher_payments_v4',
  NOTIFICATIONS: 'theway_notifications_v4',
  AUDIT_LOGS: 'theway_audit_logs_v4'
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage key ${key}`, e);
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving to localStorage key ${key}`, e);
  }
}

export class StorageService {
  private static instance: StorageService;

  private settings: CenterSettings;
  private users: User[];
  private subjects: Subject[];
  private rooms: Room[];
  private teachers: Teacher[];
  private students: Student[];
  private assignments: TeacherAssignment[];
  private contracts: Contract[];
  private sessions: Session[];
  private attendance: AttendanceRecord[];
  private payments: Payment[];
  private teacherPayments: TeacherPayment[];
  private notifications: NotificationItem[];
  private auditLogs: AuditLogItem[];

  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.settings = getStored(
      STORAGE_KEYS.SETTINGS,
      initialSettings
    );

    const loadedUsers = getStored(
      STORAGE_KEYS.USERS,
      initialUsers
    );

    // Always ensure the initial admin from file is present
    // and up-to-date with file edits if any.
    const fileAdmin = initialUsers[0];

    let syncedUsers =
      Array.isArray(loadedUsers) &&
      loadedUsers.length > 0
        ? [...loadedUsers]
        : [...initialUsers];

    const adminIndex = syncedUsers.findIndex(
      u =>
        u.id === 'usr-admin' ||
        u.role === UserRole.SUPER_ADMIN ||
        u.id === 'usr-1'
    );

    if (adminIndex >= 0 && fileAdmin) {
      syncedUsers[adminIndex] = {
        ...syncedUsers[adminIndex],
        id: 'usr-admin',
        role: UserRole.SUPER_ADMIN,
        username:
          fileAdmin.username ||
          syncedUsers[adminIndex].username ||
          'admin',
        password:
          fileAdmin.password ||
          syncedUsers[adminIndex].password ||
          '123',
        name:
          fileAdmin.name ||
          syncedUsers[adminIndex].name
      };
    } else if (fileAdmin) {
      syncedUsers.unshift(fileAdmin);
    }

  this.users = syncedUsers.map(u => ({
  ...u,
  username: u.username || 'admin',
  department: u.department || 'إدارة',
  password: u.password || '123',

  // Hide the main SUPER_ADMIN account
  isHidden:
    u.role === UserRole.SUPER_ADMIN
      ? true
      : u.isHidden === true
}));

    setStored(
      STORAGE_KEYS.USERS,
      this.users
    );

    this.subjects = getStored(
      STORAGE_KEYS.SUBJECTS,
      initialSubjects
    );

    this.rooms = getStored(
      STORAGE_KEYS.ROOMS,
      initialRooms
    );

    this.teachers = getStored(
      STORAGE_KEYS.TEACHERS,
      initialTeachers
    );

    this.students = getStored(
      STORAGE_KEYS.STUDENTS,
      initialStudents
    );

    this.assignments = getStored(
      STORAGE_KEYS.ASSIGNMENTS,
      initialTeacherAssignments
    );

    this.contracts = getStored(
      STORAGE_KEYS.CONTRACTS,
      initialContracts
    );

    this.sessions = getStored(
      STORAGE_KEYS.SESSIONS,
      initialSessions
    );

    this.attendance = getStored(
      STORAGE_KEYS.ATTENDANCE,
      initialAttendance
    );

    this.payments = getStored(
      STORAGE_KEYS.PAYMENTS,
      initialPayments
    );

    this.teacherPayments = getStored(
      STORAGE_KEYS.TEACHER_PAYMENTS,
      initialTeacherPayments
    );

    this.notifications = getStored(
      STORAGE_KEYS.NOTIFICATIONS,
      initialNotifications
    );

    this.auditLogs = getStored(
      STORAGE_KEYS.AUDIT_LOGS,
      initialAuditLogs
    );

    this.refreshDynamicAlerts();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance =
        new StorageService();
    }

    return StorageService.instance;
  }

  public subscribe(
    listener: () => void
  ): () => void {
    this.listeners.add(listener);

    return () =>
      this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  // =========================================================
  // Audit Log
  // =========================================================

 public logAudit(
  userId: string,
  userName: string,
  action: AuditAction,
  entityType: string,
  entityId: string,
  entityName: string,
  details: string,
  previousValue?: string,
  newValue?: string
): void {

  const auditUser =
    this.users.find(
      user => user.id === userId
    );

  // Hidden admin actions are not recorded
  // in the visible audit log.
  if (auditUser?.isHidden === true) {
    return;
  }

  const now = new Date();

  const timestamp =
    `${now.toISOString().split('T')[0]} ` +
    `${now.toTimeString().split(' ')[0]}`;

  // ... باقي الكود كما هو

    const log: AuditLogItem = {
      id:
        `log-${Date.now()}-` +
        `${Math.random().toString(36).substring(2, 5)}`,
      userId,
      userName,
      action,
      entityType,
      entityId,
      entityName,
      timestamp,
      details,
      previousValue,
      newValue
    };

    this.auditLogs = [
      log,
      ...this.auditLogs
    ];

    setStored(
      STORAGE_KEYS.AUDIT_LOGS,
      this.auditLogs
    );

    // NEW: Firestore sync
    firebaseSync
      .saveDocument('auditLogs', log)
      .catch(error => {
        console.error(
          'Failed to sync audit log to Firebase:',
          error
        );
      });

    this.notify();
  }

  // =========================================================
  // Settings
  // =========================================================

  public getSettings(): CenterSettings {
    return {
      ...this.settings
    };
  }

  public updateSettings(
    newSettings: Partial<CenterSettings>,
    currentUser: User
  ): void {
    this.settings = {
      ...this.settings,
      ...newSettings
    };

    setStored(
      STORAGE_KEYS.SETTINGS,
      this.settings
    );

    firebaseSync
      .saveDocument(
        'settings',
        {
          ...this.settings,
          id: 'center_config'
        }
      )
      .catch(() => {});

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.UPDATE,
      'Settings',
      'center-settings',
      'إعدادات المركز',
      'تم تحديث الإعدادات العامة للمركز'
    );

    this.notify();
  }

  // =========================================================
  // Reset to Demo Data
  // =========================================================

  public resetToDemoData(
    currentUser: User
  ): void {
    this.settings = initialSettings;
    this.users = initialUsers;
    this.subjects = initialSubjects;
    this.rooms = initialRooms;
    this.teachers = initialTeachers;
    this.students = initialStudents;
    this.assignments =
      initialTeacherAssignments;
    this.contracts = initialContracts;
    this.sessions = initialSessions;
    this.attendance = initialAttendance;
    this.payments = initialPayments;
    this.teacherPayments =
      initialTeacherPayments;
    this.notifications =
      initialNotifications;
    this.auditLogs = initialAuditLogs;

    setStored(
      STORAGE_KEYS.SETTINGS,
      this.settings
    );

    setStored(
      STORAGE_KEYS.USERS,
      this.users
    );

    setStored(
      STORAGE_KEYS.SUBJECTS,
      this.subjects
    );

    setStored(
      STORAGE_KEYS.ROOMS,
      this.rooms
    );

    setStored(
      STORAGE_KEYS.TEACHERS,
      this.teachers
    );

    setStored(
      STORAGE_KEYS.STUDENTS,
      this.students
    );

    setStored(
      STORAGE_KEYS.ASSIGNMENTS,
      this.assignments
    );

    setStored(
      STORAGE_KEYS.CONTRACTS,
      this.contracts
    );

    setStored(
      STORAGE_KEYS.SESSIONS,
      this.sessions
    );

    setStored(
      STORAGE_KEYS.ATTENDANCE,
      this.attendance
    );

    setStored(
      STORAGE_KEYS.PAYMENTS,
      this.payments
    );

    setStored(
      STORAGE_KEYS.TEACHER_PAYMENTS,
      this.teacherPayments
    );

    setStored(
      STORAGE_KEYS.NOTIFICATIONS,
      this.notifications
    );

    setStored(
      STORAGE_KEYS.AUDIT_LOGS,
      this.auditLogs
    );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.UPDATE,
      'System',
      'all',
      'إعادة ضبط النظام',
      'تم استعادة البيانات التجريبية الافتراضية للسنتر'
    );

    this.notify();
  }

  // =========================================================
  // Students
  // =========================================================

  public getStudents(): Student[] {
    return [...this.students];
  }

  public getStudentById(
    id: string
  ): Student | undefined {
    return this.students.find(
      s => s.id === id
    );
  }

  public addStudent(
    data: Omit<
      Student,
      'id' | 'code' | 'registrationDate'
    >,
    currentUser: User
  ): Student {
    const existingNums =
      this.students
        .map(s => {
          const match =
            s.code?.match(/STD-(\d+)/i);

          return match
            ? parseInt(match[1], 10)
            : 0;
        })
        .filter(
          n => !isNaN(n) && n > 0
        );

    const nextNum =
      existingNums.length > 0
        ? Math.max(...existingNums) + 1
        : 1001;

    const code =
      `STD-${nextNum}`;

    const id =
      `std-${Date.now()}`;

    const todayStr =
      new Date()
        .toISOString()
        .split('T')[0];

    const newStudent: Student = {
      ...data,
      id,
      code,
      registrationDate: todayStr
    };

    this.students = [
      newStudent,
      ...this.students
    ];

    setStored(
      STORAGE_KEYS.STUDENTS,
      this.students
    );

    this.addNotification({
      type: 'system',
      title:
        `تسجيل طالب جديد: ${newStudent.name}`,
      message:
        `قام ${currentUser.name} بتسجيل الطالب ` +
        `${newStudent.name} ` +
        `(كود: ${newStudent.code}) ` +
        `في صف ${newStudent.grade}`,
      date: todayStr,
      isRead: false,
      relatedEntityId: newStudent.id,
      relatedEntityType: 'student',
      priority: 'low'
    });

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.CREATE,
      'Student',
      newStudent.id,
      newStudent.name,
      `تم تسجيل طالب جديد: ` +
      `${newStudent.name} ` +
      `(كود: ${newStudent.code}) - ` +
      `${newStudent.grade}`
    );

    this.notify();

    firebaseSync
      .saveDocument(
        'students',
        newStudent
      )
      .catch(() => {});

    return newStudent;
  }

  public updateStudent(
    id: string,
    updates: Partial<Student>,
    currentUser: User
  ): void {
    const prev =
      this.students.find(
        s => s.id === id
      );

    this.students =
      this.students.map(
        s =>
          s.id === id
            ? { ...s, ...updates }
            : s
      );

    setStored(
      STORAGE_KEYS.STUDENTS,
      this.students
    );

    this.addNotification({
      type: 'system',
      title:
        `تعديل بيانات طالب: ` +
        `${updates.name || prev?.name || ''}`,
      message:
        `قام ${currentUser.name} ` +
        `بتحديث بيانات الطالب ` +
        `(${prev?.code || ''}) في السنتر`,
      date:
        new Date()
          .toISOString()
          .split('T')[0],
      isRead: false,
      relatedEntityId: id,
      relatedEntityType: 'student',
      priority: 'low'
    });

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.UPDATE,
      'Student',
      id,
      updates.name ||
        prev?.name ||
        'طالب',
      `تم تعديل بيانات الطالب ` +
      `${prev?.name || ''}`
    );

    this.notify();

    const updated =
      this.students.find(
        s => s.id === id
      );

    if (updated) {
      firebaseSync
        .saveDocument(
          'students',
          updated
        )
        .catch(() => {});
    }
  }

  public archiveStudent(
    id: string,
    currentUser: User
  ): void {
    const st =
      this.students.find(
        s => s.id === id
      );

    if (!st) return;

    this.updateStudent(
      id,
      {
        status:
          StudentStatus.ARCHIVED
      },
      currentUser
    );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.ARCHIVE,
      'Student',
      id,
      st.name,
      `تم أرشفة الطالب ${st.name}`
    );
  }

  public deleteStudent(
    id: string,
    currentUser: User
  ): void {
    const st =
      this.students.find(
        s => s.id === id
      );

    this.students =
      this.students.filter(
        s => s.id !== id
      );

    setStored(
      STORAGE_KEYS.STUDENTS,
      this.students
    );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.DELETE,
      'Student',
      id,
      st?.name || 'طالب',
      `تم حذف الطالب ` +
      `${st?.name || ''} نهائياً`
    );

    this.notify();

    firebaseSync
      .deleteDocument(
        'students',
        id
      )
      .catch(() => {});
  }

  // =========================================================
  // Teachers
  // =========================================================

  public getTeachers(): Teacher[] {
    return [...this.teachers];
  }

  public getTeacherById(
    id: string
  ): Teacher | undefined {
    return this.teachers.find(
      t => t.id === id
    );
  }

  public addTeacher(
    data: Omit<
      Teacher,
      'id' | 'code' | 'joinedDate'
    >,
    currentUser: User
  ): Teacher {
    const nextCode =
      `TCH-${200 + this.teachers.length + 1}`;

    const id =
      `tch-${Date.now()}`;

    const newTeacher: Teacher = {
      ...data,
      id,
      code: nextCode,
      joinedDate:
        new Date()
          .toISOString()
          .split('T')[0]
    };

    this.teachers = [
      ...this.teachers,
      newTeacher
    ];

    setStored(
      STORAGE_KEYS.TEACHERS,
      this.teachers
    );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.CREATE,
      'Teacher',
      newTeacher.id,
      newTeacher.name,
      `تم إضافة مدرس جديد: ` +
      `${newTeacher.name} ` +
      `(${newTeacher.code})`
    );

    this.notify();

    firebaseSync
      .saveDocument(
        'teachers',
        newTeacher
      )
      .catch(() => {});

    return newTeacher;
  }

  public updateTeacher(
    id: string,
    updates: Partial<Teacher>,
    currentUser: User
  ): void {
    const prev =
      this.teachers.find(
        t => t.id === id
      );

    this.teachers =
      this.teachers.map(
        t =>
          t.id === id
            ? { ...t, ...updates }
            : t
      );

    setStored(
      STORAGE_KEYS.TEACHERS,
      this.teachers
    );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.UPDATE,
      'Teacher',
      id,
      prev?.name || 'مدرس',
      `تم تعديل بيانات المدرس ` +
      `${prev?.name || ''}`
    );

    this.notify();

    const updated =
      this.teachers.find(
        t => t.id === id
      );

    if (updated) {
      firebaseSync
        .saveDocument(
          'teachers',
          updated
        )
        .catch(() => {});
    }
  }

  // =========================================================
  // Subjects
  // =========================================================

  public getSubjects(): Subject[] {
    return [...this.subjects];
  }

  public addSubject(
    data: Omit<Subject, 'id'>,
    currentUser: User
  ): Subject {
    const id =
      `sbj-${Date.now()}`;

    let code =
      (data.code || '')
        .trim()
        .toUpperCase();

    if (!code) {
      const existingNums =
        this.subjects
          .map(s => {
            const match =
              s.code?.match(
                /SUB-(\d+)/i
              );

            return match
              ? parseInt(
                  match[1],
                  10
                )
              : 0;
          })
          .filter(
            n =>
              !isNaN(n) &&
              n > 0
          );

      const nextNum =
        existingNums.length > 0
          ? Math.max(...existingNums) + 1
          : this.subjects.length + 1;

      code =
        `SUB-${nextNum
          .toString()
          .padStart(2, '0')}`;
    }

    const newSubject: Subject = {
      ...data,
      id,
      code
    };

    this.subjects = [
      ...this.subjects,
      newSubject
    ];

    setStored(
      STORAGE_KEYS.SUBJECTS,
      this.subjects
    );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.CREATE,
      'Subject',
      newSubject.id,
      newSubject.name,
      `تم إضافة مادة دراسية جديدة: ` +
      `${newSubject.name} ` +
      `(كود: ${newSubject.code})`
    );

    this.notify();

    firebaseSync
      .saveDocument(
        'subjects',
        newSubject
      )
      .catch(() => {});

    return newSubject;
  }

  public updateSubject(
    id: string,
    updates: Partial<Subject>,
    currentUser: User
  ): void {
    this.subjects =
      this.subjects.map(
        s =>
          s.id === id
            ? { ...s, ...updates }
            : s
      );

    setStored(
      STORAGE_KEYS.SUBJECTS,
      this.subjects
    );

    this.notify();

    const updated =
      this.subjects.find(
        s => s.id === id
      );

    if (updated) {
      firebaseSync
        .saveDocument(
          'subjects',
          updated
        )
        .catch(() => {});
    }
  }

  // =========================================================
  // Rooms
  // =========================================================

  public getRooms(): Room[] {
    return [...this.rooms];
  }

  public addRoom(
    data: Omit<Room, 'id'>,
    currentUser: User
  ): Room {
    const id =
      `rm-${Date.now()}`;

    const newRoom: Room = {
      ...data,
      id
    };

    this.rooms = [
      ...this.rooms,
      newRoom
    ];

    setStored(
      STORAGE_KEYS.ROOMS,
      this.rooms
    );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.CREATE,
      'Room',
      newRoom.id,
      newRoom.name,
      `تم إضافة قاعة جديدة: ` +
      `${newRoom.name} - سعة ` +
      `${newRoom.capacity} طلاب`
    );

    this.notify();

    firebaseSync
      .saveDocument(
        'rooms',
        newRoom
      )
      .catch(() => {});

    return newRoom;
  }

  public updateRoom(
    id: string,
    updates: Partial<Room>,
    currentUser: User
  ): void {
    this.rooms =
      this.rooms.map(
        r =>
          r.id === id
            ? { ...r, ...updates }
            : r
      );

    setStored(
      STORAGE_KEYS.ROOMS,
      this.rooms
    );

    this.notify();

    const updated =
      this.rooms.find(
        r => r.id === id
      );

    if (updated) {
      firebaseSync
        .saveDocument(
          'rooms',
          updated
        )
        .catch(() => {});
    }
  }

  public deleteRoom(
    id: string,
    currentUser: User
  ): void {
    const rm =
      this.rooms.find(
        r => r.id === id
      );

    this.rooms =
      this.rooms.filter(
        r => r.id !== id
      );

    setStored(
      STORAGE_KEYS.ROOMS,
      this.rooms
    );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.DELETE,
      'Room',
      id,
      rm?.name || 'قاعة',
      `تم حذف القاعة ` +
      `${rm?.name || ''}`
    );

    this.notify();

    firebaseSync
      .deleteDocument(
        'rooms',
        id
      )
      .catch(() => {});
  }

  // =========================================================
  // Teacher Assignments
  // =========================================================

  public getAssignments(): TeacherAssignment[] {
    return [...this.assignments];
  }

  public assignTeacher(
    studentId: string,
    subjectId: string,
    teacherId: string,
    ratePerSession: number | undefined,
    currentUser: User
  ): TeacherAssignment {
    const existingIndex =
      this.assignments.findIndex(
        a =>
          a.studentId === studentId &&
          a.subjectId === subjectId
      );

    const student =
      this.students.find(
        s => s.id === studentId
      );

    const teacher =
      this.teachers.find(
        t => t.id === teacherId
      );

    const subject =
      this.subjects.find(
        s => s.id === subjectId
      );

    const assignment: TeacherAssignment = {
      id:
        existingIndex >= 0
          ? this.assignments[
              existingIndex
            ].id
          : `asg-${Date.now()}`,

      studentId,
      subjectId,
      teacherId,

      assignedDate:
        new Date()
          .toISOString()
          .split('T')[0],

      ratePerSession
    };

    if (existingIndex >= 0) {
      this.assignments[
        existingIndex
      ] = assignment;
    } else {
      this.assignments = [
        ...this.assignments,
        assignment
      ];
    }

    setStored(
      STORAGE_KEYS.ASSIGNMENTS,
      this.assignments
    );

    // Make sure subject is also added
    // to student subject list.
    if (
      student &&
      !student.subjectIds.includes(
        subjectId
      )
    ) {
      this.updateStudent(
        studentId,
        {
          subjectIds: [
            ...student.subjectIds,
            subjectId
          ]
        },
        currentUser
      );
    }

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.TEACHER_ASSIGNED,
      'Assignment',
      assignment.id,
      `${student?.name} - ${subject?.name}`,
      `تم تعيين المدرس ` +
      `${teacher?.name} للطالب ` +
      `${student?.name} في مادة ` +
      `${subject?.name}`
    );

    // NEW: Firestore sync
    firebaseSync
      .saveDocument(
        'assignments',
        assignment
      )
      .catch(error => {
        console.error(
          'Failed to sync assignment to Firebase:',
          error
        );
      });

    this.notify();

    return assignment;
  }

  // =========================================================
  // Contracts
  // =========================================================

  public getContracts(): Contract[] {
    return [...this.contracts];
  }

  public getContractById(
    id: string
  ): Contract | undefined {
    return this.contracts.find(
      c => c.id === id
    );
  }

  public addContract(
    data: Omit<
      Contract,
      | 'id'
      | 'contractNumber'
      | 'usedSessions'
      | 'paidAmount'
      | 'createdAt'
    >,
    initialPaymentAmount: number,
    currentUser: User
  ): Contract {
    const count =
      this.contracts.length + 1;

    const contractNumber =
      `CNT-2025-${count
        .toString()
        .padStart(3, '0')}`;

    const id =
      `cnt-${Date.now()}`;

    const now =
      new Date().toISOString();

    const newContract: Contract = {
      ...data,
      id,
      contractNumber,
      usedSessions: 0,
      paidAmount:
        initialPaymentAmount || 0,
      createdAt: now
    };

    this.contracts = [
      newContract,
      ...this.contracts
    ];

    setStored(
      STORAGE_KEYS.CONTRACTS,
      this.contracts
    );

    if (
      initialPaymentAmount > 0
    ) {
      this.addPayment(
        {
          contractId:
            newContract.id,
          studentId:
            newContract.studentId,
          amount:
            initialPaymentAmount,
          date:
            now.split('T')[0],
          paymentMethod:
            (data as any)
              .paymentMethod ||
            'cash',
          notes:
            `دفعة تعاقد أولى - عقد ` +
            `${contractNumber}`
        },
        currentUser
      );
    }

    const student =
      this.students.find(
        s =>
          s.id === data.studentId
      );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.CREATE,
      'Contract',
      newContract.id,
      contractNumber,
      `تم إنشاء عقد جديد ` +
      `(${contractNumber}) للطالب ` +
      `${student?.name || ''} ` +
      `بقيمة ${newContract.totalPrice} ج.م`
    );

    this.refreshDynamicAlerts();
    this.notify();

    firebaseSync
      .saveDocument(
        'contracts',
        newContract
      )
      .catch(() => {});

    return newContract;
  }

  public updateContract(
    id: string,
    updates: Partial<Contract>,
    currentUser: User
  ): void {
    this.contracts =
      this.contracts.map(
        c =>
          c.id === id
            ? { ...c, ...updates }
            : c
      );

    setStored(
      STORAGE_KEYS.CONTRACTS,
      this.contracts
    );

    this.refreshDynamicAlerts();
    this.notify();

    const updated =
      this.contracts.find(
        c => c.id === id
      );

    if (updated) {
      firebaseSync
        .saveDocument(
          'contracts',
          updated
        )
        .catch(() => {});
    }
  }

  public deleteContract(
    id: string,
    currentUser: User
  ): void {
    const cnt =
      this.contracts.find(
        c => c.id === id
      );

    this.contracts =
      this.contracts.filter(
        c => c.id !== id
      );

    setStored(
      STORAGE_KEYS.CONTRACTS,
      this.contracts
    );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.DELETE,
      'Contract',
      id,
      cnt?.contractNumber || 'عقد',
      `تم حذف العقد ` +
      `${cnt?.contractNumber || ''}`
    );

    this.refreshDynamicAlerts();
    this.notify();

    firebaseSync
      .deleteDocument(
        'contracts',
        id
      )
      .catch(() => {});
  }

  // =========================================================
  // Sessions
  // =========================================================

  public getSessions(): Session[] {
    return [...this.sessions];
  }

  public getSessionById(
    id: string
  ): Session | undefined {
    return this.sessions.find(
      s => s.id === id
    );
  }

  public addSession(
    data: Omit<
      Session,
      'id' | 'sessionCode'
    >,
    currentUser: User,
    recurringWeeks: number = 1
  ): Session[] {
    const createdSessions: Session[] =
      [];

    const weeks =
      Math.max(
        1,
        Number(recurringWeeks) || 1
      );

    const recurringGroupId =
      weeks > 1
        ? `rec-${Date.now()}`
        : undefined;

    const [
      yearStr,
      monthStr,
      dayStr
    ] =
      (
        data.date ||
        new Date()
          .toISOString()
          .split('T')[0]
      ).split('-');

    const year =
      parseInt(
        yearStr,
        10
      ) ||
      new Date().getFullYear();

    const month =
      (
        parseInt(
          monthStr,
          10
        ) || 1
      ) - 1;

    const day =
      parseInt(
        dayStr,
        10
      ) ||
      new Date().getDate();

    for (
      let i = 0;
      i < weeks;
      i++
    ) {
      const targetDate =
        new Date(
          year,
          month,
          day + i * 7
        );

      const yyyy =
        targetDate.getFullYear();

      const mm =
        String(
          targetDate.getMonth() + 1
        ).padStart(2, '0');

      const dd =
        String(
          targetDate.getDate()
        ).padStart(2, '0');

      const dateStr =
        `${yyyy}-${mm}-${dd}`;

      const count =
        this.sessions.length +
        createdSessions.length +
        1;

      const sessionCode =
        `SES-${count
          .toString()
          .padStart(3, '0')}`;

      const newSession: Session = {
        ...data,
        id:
          `ses-${Date.now()}-${i}-` +
          `${Math.random()
            .toString(36)
            .substring(2, 5)}`,
        sessionCode,
        date: dateStr,
        recurringGroupId
      };

      createdSessions.push(
        newSession
      );
    }

    this.sessions = [
      ...createdSessions,
      ...this.sessions
    ];

    setStored(
      STORAGE_KEYS.SESSIONS,
      this.sessions
    );

    if (
      createdSessions.length > 0
    ) {
      this.logAudit(
        currentUser.id,
        currentUser.name,
        AuditAction.CREATE,
        'Session',
        createdSessions[0].id,
        createdSessions[0].title,
        `تمت جدولة ` +
        `${createdSessions.length} حصة ` +
        `(${createdSessions[0].sessionCode})`
      );
    }

    this.notify();

    createdSessions.forEach(
      session => {
        firebaseSync
          .saveDocument(
            'sessions',
            session
          )
          .catch(() => {});
      }
    );

    return createdSessions;
  }

  public updateSession(
    id: string,
    updates: Partial<Session>,
    currentUser: User
  ): void {
    const prev =
      this.sessions.find(
        s => s.id === id
      );

    this.sessions =
      this.sessions.map(
        s =>
          s.id === id
            ? { ...s, ...updates }
            : s
      );

    setStored(
      STORAGE_KEYS.SESSIONS,
      this.sessions
    );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.UPDATE,
      'Session',
      id,
      prev?.title || 'حصة',
      `تم تعديل بيانات الحصة ` +
      `${prev?.sessionCode || ''}`
    );

    this.notify();

    const updated =
      this.sessions.find(
        s => s.id === id
      );

    if (updated) {
      firebaseSync
        .saveDocument(
          'sessions',
          updated
        )
        .catch(() => {});
    }
  }

  public startSession(
    sessionId: string,
    currentUser: User
  ): void {
    this.updateSession(
      sessionId,
      {
        status:
          SessionStatus.LIVE
      },
      currentUser
    );
  }

  public deleteSession(
    sessionId: string,
    currentUser: User
  ): void {
    const ses =
      this.sessions.find(
        s => s.id === sessionId
      );

    this.sessions =
      this.sessions.filter(
        s => s.id !== sessionId
      );

    setStored(
      STORAGE_KEYS.SESSIONS,
      this.sessions
    );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.DELETE,
      'Session',
      sessionId,
      ses?.title || 'حصة',
      `تم حذف الحصة ` +
      `${ses?.sessionCode || ''}`
    );

    this.notify();

    firebaseSync
      .deleteDocument(
        'sessions',
        sessionId
      )
      .catch(() => {});
  }

  public completeSession(
    sessionId: string,
    currentUser: User
  ): void {
    const session =
      this.sessions.find(
        s => s.id === sessionId
      );

    if (!session) return;

    this.updateSession(
      sessionId,
      {
        status:
          SessionStatus.COMPLETED
      },
      currentUser
    );

    if (
      session.countAgainstStudentSessions
    ) {
      session.studentIds.forEach(
        studentId => {
          const contract =
            this.contracts.find(
              c =>
                c.studentId ===
                  studentId &&
                c.subjectIds.includes(
                  session.subjectId
                ) &&
                c.status ===
                  ContractStatus.ACTIVE &&
                c.usedSessions <
                  c.totalSessions
            );

          if (contract) {
            const newUsed =
              contract.usedSessions +
              1;

            const newStatus =
              newUsed >=
              contract.totalSessions
                ? ContractStatus.COMPLETED
                : contract.totalSessions -
                    newUsed <=
                  3
                ? ContractStatus.EXPIRING_SOON
                : contract.status;

            this.updateContract(
              contract.id,
              {
                usedSessions:
                  newUsed,
                status:
                  newStatus
              },
              currentUser
            );
          }
        }
      );
    }

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.STATUS_CHANGED,
      'Session',
      sessionId,
      session.title,
      `تم إنهاء الحصة ` +
      `(${session.sessionCode}) ` +
      `واحتسابها للمدرس والطلاب`
    );

    this.refreshDynamicAlerts();
  }

  public cancelSession(
    sessionId: string,
    chargeStudents: boolean,
    reason: string,
    currentUser: User
  ): void {
    const session =
      this.sessions.find(
        s => s.id === sessionId
      );

    if (!session) return;

    this.updateSession(
      sessionId,
      {
        status:
          SessionStatus.CANCELLED,

        countAgainstStudentSessions:
          chargeStudents,

        notes: session.notes
          ? `${session.notes} ` +
            `(سبب الإلغاء: ${reason})`
          : `سبب الإلغاء: ${reason}`
      },
      currentUser
    );

    if (chargeStudents) {
      session.studentIds.forEach(
        studentId => {
          const contract =
            this.contracts.find(
              c =>
                c.studentId ===
                  studentId &&
                c.subjectIds.includes(
                  session.subjectId
                ) &&
                c.status ===
                  ContractStatus.ACTIVE
            );

          if (contract) {
            const newUsed =
              Math.min(
                contract.totalSessions,
                contract.usedSessions +
                  1
              );

            this.updateContract(
              contract.id,
              {
                usedSessions:
                  newUsed
              },
              currentUser
            );
          }
        }
      );
    }

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.STATUS_CHANGED,
      'Session',
      sessionId,
      session.title,
      `تم إلغاء الحصة ` +
      `(${session.sessionCode}) - ` +
      `${reason} - ` +
      `${
        chargeStudents
          ? 'تم احتساب الحصة'
          : 'إلغاء مجاني بدون خصم'
      }`
    );
  }

  // =========================================================
  // Attendance
  // =========================================================

  public getAttendance(): AttendanceRecord[] {
    return [...this.attendance];
  }

  public markAttendance(
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    notes: string | undefined,
    currentUser: User
  ): AttendanceRecord {
    const session =
      this.sessions.find(
        s => s.id === sessionId
      );

    const student =
      this.students.find(
        s => s.id === studentId
      );

    const existingIndex =
      this.attendance.findIndex(
        a =>
          a.sessionId ===
            sessionId &&
          a.studentId ===
            studentId
      );

    const now =
      new Date();

    const timeStr =
      `${now
        .getHours()
        .toString()
        .padStart(2, '0')}:` +
      `${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

    const record: AttendanceRecord = {
      id:
        existingIndex >= 0
          ? this.attendance[
              existingIndex
            ].id
          : `att-${Date.now()}`,

      sessionId,
      studentId,

      teacherId:
        session?.teacherId || '',

      date:
        session?.date ||
        new Date()
          .toISOString()
          .split('T')[0],

      status,

      checkInTime:
        status ===
          AttendanceStatus.PRESENT ||
        status ===
          AttendanceStatus.LATE
          ? this.attendance[
              existingIndex
            ]?.checkInTime ||
            timeStr
          : undefined,

      notes:
        notes !== undefined
          ? notes
          : this.attendance[
              existingIndex
            ]?.notes,

      markedByUserId:
        currentUser.id,

      createdAt:
        now.toISOString()
    };

    if (
      existingIndex >= 0
    ) {
      this.attendance[
        existingIndex
      ] = record;
    } else {
      this.attendance = [
        record,
        ...this.attendance
      ];
    }

    setStored(
      STORAGE_KEYS.ATTENDANCE,
      this.attendance
    );

    if (
      status ===
        AttendanceStatus.ABSENT &&
      student
    ) {
      this.addNotification({
        type: 'student_absent',
        title:
          `غياب طالب: ${student.name}`,
        message:
          `تم تسجيل غياب الطالب ` +
          `"${student.name}" عن حصة ` +
          `"${session?.title || 'الحصة'}" اليوم.`,
        date:
          session?.date ||
          new Date()
            .toISOString()
            .split('T')[0],
        isRead: false,
        relatedEntityId:
          student.id,
        relatedEntityType:
          'student',
        priority: 'medium'
      });
    }

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.ATTENDANCE_MARKED,
      'Attendance',
      record.id,
      student?.name || 'طالب',
      `تم تسجيل حالة الحضور: ${
        status ===
        AttendanceStatus.PRESENT
          ? 'حاضر 🟢'
          : status ===
            AttendanceStatus.ABSENT
          ? 'غائب 🔴'
          : status ===
            AttendanceStatus.LATE
          ? 'متأخر 🟡'
          : 'معذور 🔵'
      } للطالب ${student?.name}`
    );

    this.notify();

    firebaseSync
      .saveDocument(
        'attendance',
        record
      )
      .catch(() => {});

    return record;
  }

  // =========================================================
  // Quick Student Code Attendance Engine
  // =========================================================

  public processStudentCodeAttendance(
    studentCodeOrId: string,
    currentUser: User
  ): {
    success: boolean;
    message: string;
    student?: Student;
    session?: Session;
    attendance?: AttendanceRecord;
  } {
    const cleanText =
      studentCodeOrId
        .trim()
        .toUpperCase();

    const student =
      this.students.find(
        s =>
          s.code?.toUpperCase() ===
            cleanText ||
          s.id ===
            studentCodeOrId.trim() ||
          s.name
            .toLowerCase()
            .includes(
              studentCodeOrId
                .trim()
                .toLowerCase()
            )
      );

    if (!student) {
      return {
        success: false,
        message:
          'كود الطالب غير صحيح أو لا يوجد طالب بهذا الكود في النظام!'
      };
    }

    const todayStr =
      new Date()
        .toISOString()
        .split('T')[0];

    const studentTodaySessions =
      this.sessions.filter(
        s =>
          s.date === todayStr &&
          s.studentIds.includes(
            student.id
          ) &&
          s.status !==
            SessionStatus.CANCELLED
      );

    if (
      studentTodaySessions.length ===
      0
    ) {
      return {
        success: false,
        message:
          `الطالب ${student.name} ` +
          `(${student.code}) ليس لديه ` +
          `أي حصص مجدولة لليوم ` +
          `(${todayStr}).`,
        student
      };
    }

    const targetSession =
      studentTodaySessions.find(
        s =>
          s.status ===
          SessionStatus.LIVE
      ) ||
      studentTodaySessions[0];

    const attendance =
      this.markAttendance(
        targetSession.id,
        student.id,
        AttendanceStatus.PRESENT,
        `تم تسجيل الحضور عبر إدخال ` +
        `كود الطالب (${student.code})`,
        currentUser
      );

    return {
      success: true,
      message:
        `تم تسجيل حضور الطالب ` +
        `${student.name} ` +
        `(${student.code}) بنجاح ` +
        `في حصة: ${targetSession.title}`,
      student,
      session: targetSession,
      attendance
    };
  }

  public processQRScan(
    code: string,
    currentUser: User
  ) {
    return this.processStudentCodeAttendance(
      code,
      currentUser
    );
  }

  // =========================================================
  // Payments
  // =========================================================

  public getPayments(): Payment[] {
    return [...this.payments];
  }

  public addPayment(
    data: Omit<
      Payment,
      | 'id'
      | 'receiptNumber'
      | 'collectedByUserId'
      | 'createdAt'
    >,
    currentUser: User
  ): Payment {
    const count =
      this.payments.length +
      5001;

    const receiptNumber =
      `REC-${count}`;

    const id =
      `pay-${Date.now()}`;

    const now =
      new Date().toISOString();

    const newPayment: Payment = {
      ...data,
      id,
      receiptNumber,
      collectedByUserId:
        currentUser.id,
      createdAt: now
    };

    this.payments = [
      newPayment,
      ...this.payments
    ];

    setStored(
      STORAGE_KEYS.PAYMENTS,
      this.payments
    );

    if (data.contractId) {
      const contract =
        this.contracts.find(
          c =>
            c.id ===
            data.contractId
        );

      if (contract) {
        const newPaid =
          contract.paidAmount +
          data.amount;

        this.updateContract(
          contract.id,
          {
            paidAmount:
              newPaid
          },
          currentUser
        );
      }
    }

    const student =
      this.students.find(
        s =>
          s.id === data.studentId
      );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.PAYMENT_RECORDED,
      'Payment',
      newPayment.id,
      receiptNumber,
      `تم تحصيل مبلغ ` +
      `${data.amount} ج.م ` +
      `بسند قبض (${receiptNumber}) ` +
      `من الطالب ` +
      `${student?.name || ''}`
    );

    this.refreshDynamicAlerts();
    this.notify();

    firebaseSync
      .saveDocument(
        'payments',
        newPayment
      )
      .catch(() => {});

    return newPayment;
  }

  // =========================================================
  // Teacher Payments
  // =========================================================

  public getTeacherPayments(): TeacherPayment[] {
    return [
      ...this.teacherPayments
    ];
  }

  public addTeacherPayment(
    data: Omit<
      TeacherPayment,
      'id' | 'payoutNumber' | 'createdAt'
    >,
    currentUser: User
  ): TeacherPayment {
    const count =
      this.teacherPayments.length +
      7001;

    const payoutNumber =
      `PAY-${count}`;

    const id =
      `tp-${Date.now()}`;

    const now =
      new Date().toISOString();

    const newPayout: TeacherPayment = {
      ...data,
      id,
      payoutNumber,
      createdAt: now
    };

    this.teacherPayments = [
      newPayout,
      ...this.teacherPayments
    ];

    setStored(
      STORAGE_KEYS.TEACHER_PAYMENTS,
      this.teacherPayments
    );

    const teacher =
      this.teachers.find(
        t =>
          t.id === data.teacherId
      );

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.PAYMENT_RECORDED,
      'TeacherPayment',
      newPayout.id,
      payoutNumber,
      `تم صرف مستحقات بقيمة ` +
      `${data.amount} ج.م ` +
      `للمدرس ${teacher?.name || ''}`
    );

    // NEW: Firestore sync
    firebaseSync
      .saveDocument(
        'teacherPayments',
        newPayout
      )
      .catch(error => {
        console.error(
          'Failed to sync teacher payment to Firebase:',
          error
        );
      });

    this.notify();

    return newPayout;
  }

  // =========================================================
  // Notifications
  // =========================================================

  public getNotifications(): NotificationItem[] {
    return [
      ...this.notifications
    ];
  }

  public addNotification(
    item: Omit<
      NotificationItem,
      'id'
    >
  ): void {
    const newNotif: NotificationItem = {
      ...item,
      id:
        `notif-${Date.now()}-` +
        `${Math.random()
          .toString(36)
          .substring(2, 5)}`
    };

    this.notifications = [
      newNotif,
      ...this.notifications
    ];

    setStored(
      STORAGE_KEYS.NOTIFICATIONS,
      this.notifications
    );

    // NEW: Firestore sync
    firebaseSync
      .saveDocument(
        'notifications',
        newNotif
      )
      .catch(error => {
        console.error(
          'Failed to sync notification to Firebase:',
          error
        );
      });

    this.notify();
  }

  public markNotificationAsRead(
    id: string
  ): void {
    this.notifications =
      this.notifications.map(
        n =>
          n.id === id
            ? {
                ...n,
                isRead: true
              }
            : n
      );

    setStored(
      STORAGE_KEYS.NOTIFICATIONS,
      this.notifications
    );

    // NEW: Sync updated notification
    const updated =
      this.notifications.find(
        n => n.id === id
      );

    if (updated) {
      firebaseSync
        .saveDocument(
          'notifications',
          updated
        )
        .catch(error => {
          console.error(
            'Failed to sync notification update to Firebase:',
            error
          );
        });
    }

    this.notify();
  }

  public markAllNotificationsAsRead(): void {
    this.notifications =
      this.notifications.map(
        n => ({
          ...n,
          isRead: true
        })
      );

    setStored(
      STORAGE_KEYS.NOTIFICATIONS,
      this.notifications
    );

    // NEW: Sync all notifications
    this.notifications.forEach(
      notification => {
        firebaseSync
          .saveDocument(
            'notifications',
            notification
          )
          .catch(error => {
            console.error(
              'Failed to sync notification to Firebase:',
              error
            );
          });
      }
    );

    this.notify();
  }

  public deleteNotification(
    id: string
  ): void {
    this.notifications =
      this.notifications.filter(
        n => n.id !== id
      );

    setStored(
      STORAGE_KEYS.NOTIFICATIONS,
      this.notifications
    );

    // NEW: Delete from Firestore
    firebaseSync
      .deleteDocument(
        'notifications',
        id
      )
      .catch(error => {
        console.error(
          'Failed to delete notification from Firebase:',
          error
        );
      });

    this.notify();
  }

  public clearAllNotifications(): void {
    const notificationsToDelete =
      [...this.notifications];

    this.notifications = [];

    setStored(
      STORAGE_KEYS.NOTIFICATIONS,
      this.notifications
    );

    // NEW: Delete all from Firestore
    notificationsToDelete.forEach(
      notification => {
        firebaseSync
          .deleteDocument(
            'notifications',
            notification.id
          )
          .catch(error => {
            console.error(
              'Failed to delete notification from Firebase:',
              error
            );
          });
      }
    );

    this.notify();
  }

  // =========================================================
  // Users & Roles
  // =========================================================

  public getUsers(): User[] {
  return this.users.filter(
    user => user.isHidden !== true
  );
}

  public getActiveUser(): User | null {
    const stored =
      getStored<User | null>(
        STORAGE_KEYS.ACTIVE_USER,
        null
      );

    if (stored) {
      const liveUser =
        this.users.find(
          u =>
            u.id === stored.id ||
            (
              u.username &&
              u.username
                .toLowerCase() ===
                stored.username
                  ?.toLowerCase()
            )
        );

      if (
        liveUser &&
        liveUser.isActive
      ) {
        return liveUser;
      }
    }

    return (
      this.users[0] ||
      null
    );
  }

  public setActiveUser(
    user: User | null
  ): void {
    setStored(
      STORAGE_KEYS.ACTIVE_USER,
      user
    );

    this.notify();
  }

  public authenticate(
    identifier: string,
    password?: string
  ): User | null {
    const clean =
      identifier
        .trim()
        .toLowerCase();

    const user =
      this.users.find(
        u =>
          (
            u.username
              ?.toLowerCase() ===
              clean ||
            u.email
              .toLowerCase() ===
              clean
          ) &&
          u.isActive
      );

    if (!user) {
      return null;
    }

    if (
      user.password &&
      password &&
      user.password !== password
    ) {
      return null;
    }

    this.setActiveUser(user);

    return user;
  }

  public addUser(
    data: Omit<User, 'id'>,
    currentUser: User,
    forcedId?: string
  ): User {
    const id =
      forcedId ||
      `usr-${Date.now()}`;

    const newUser: User = {
  ...data,

  id,

  username:
    data.username
      .trim()
      .toLowerCase(),

  password:
    data.password || '123',

  // New users are visible by default
  isHidden:
    data.isHidden === true
};

    this.users = [
      ...this.users,
      newUser
    ];

    setStored(
      STORAGE_KEYS.USERS,
      this.users
    );

    this.addNotification({
      type: 'system',

      title:
        `موظف جديد: ${newUser.name}`,

      message:
        `تم إنشاء حساب للموظف ` +
        `${newUser.name} ` +
        `في قسم (${newUser.department}) ` +
        `باسم مستخدم ` +
        `(${newUser.username})`,

      date:
        new Date()
          .toISOString()
          .split('T')[0],

      isRead: false,

      relatedEntityId:
        newUser.id,

      priority: 'medium'
    });

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.CREATE,
      'User',
      newUser.id,
      newUser.name,
      `تم إنشاء مستخدم جديد: ` +
      `${newUser.name} ` +
      `اسم مستخدم (${newUser.username}) ` +
      `تخصص (${newUser.department})`
    );

    this.notify();

    return newUser;
  }

  public updateUser(
    id: string,
    updates: Partial<User>,
    currentUser: User
  ): void {
    const user =
      this.users.find(
        u => u.id === id
      );

    if (!user) return;

    if (updates.username) {
      updates.username =
        updates.username
          .trim()
          .toLowerCase();
    }

    const updatedUser = {
      ...user,
      ...updates
    };

    this.users =
      this.users.map(
        u =>
          u.id === id
            ? updatedUser
            : u
      );

    setStored(
      STORAGE_KEYS.USERS,
      this.users
    );

    const activeStored =
      getStored<User | null>(
        STORAGE_KEYS.ACTIVE_USER,
        null
      );

    if (
      activeStored &&
      (
        activeStored.id === id ||
        activeStored.username
          ?.toLowerCase() ===
          user.username
            .toLowerCase()
      )
    ) {
      setStored(
        STORAGE_KEYS.ACTIVE_USER,
        updatedUser
      );
    }

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.UPDATE,
      'User',
      id,
      updatedUser.name,
      `تم تحديث بيانات المستخدم: ` +
      `${updatedUser.name} ` +
      `(${updatedUser.username})`
    );

    this.notify();
  }

  public deleteUser(
    id: string,
    currentUser: User
  ): boolean {
    const user =
      this.users.find(
        u => u.id === id
      );

    if (!user) {
      return false;
    }

    if (
      user.role ===
        UserRole.SUPER_ADMIN &&
      this.users.filter(
        u =>
          u.role ===
          UserRole.SUPER_ADMIN
      ).length <= 1
    ) {
      return false;
    }

    this.users =
      this.users.filter(
        u => u.id !== id
      );

    setStored(
      STORAGE_KEYS.USERS,
      this.users
    );

    const activeStored =
      getStored<User | null>(
        STORAGE_KEYS.ACTIVE_USER,
        null
      );

    if (
      activeStored &&
      activeStored.id === id
    ) {
      setStored(
        STORAGE_KEYS.ACTIVE_USER,
        null
      );
    }

    this.addNotification({
      type: 'system',

      title:
        `حذف مستخدم: ${user.name}`,

      message:
        `تم حذف حساب المستخدم ` +
        `${user.name} من النظام`,

      date:
        new Date()
          .toISOString()
          .split('T')[0],

      isRead: false,

      relatedEntityId:
        id,

      priority: 'high'
    });

    this.logAudit(
      currentUser.id,
      currentUser.name,
      AuditAction.DELETE,
      'User',
      id,
      user.name,
      `تم حذف حساب المستخدم: ` +
      `${user.name} ` +
      `(${user.username})`
    );

    this.notify();

    return true;
  }

  public resetUserPassword(
    id: string,
    newPass: string,
    currentUser: User
  ): void {
    this.updateUser(
      id,
      {
        password: newPass
      },
      currentUser
    );
  }

  // =========================================================
  // Audit Logs
  // =========================================================

  public getAuditLogs(): AuditLogItem[] {
    return [...this.auditLogs];
  }

  // =========================================================
  // Dynamic Alerts Scanner
  // =========================================================

  public refreshDynamicAlerts(): void {
    const today =
      new Date();

    const todayStr =
      today
        .toISOString()
        .split('T')[0];

    this.contracts.forEach(
      contract => {
        const remainingSessions =
          contract.totalSessions -
          contract.usedSessions;

        if (
          contract.status ===
            ContractStatus.ACTIVE &&
          remainingSessions <=
            this.settings
              .lowSessionsAlertThreshold
        ) {
          const student =
            this.students.find(
              s =>
                s.id ===
                contract.studentId
            );

          const existing =
            this.notifications.find(
              n =>
                n.relatedEntityId ===
                  contract.id &&
                n.type ===
                  'low_sessions'
            );

          if (
            !existing &&
            student
          ) {
            this.addNotification({
              type:
                'low_sessions',

              title:
                `تنبيه: رصيد حصص منخفض ` +
                `للطالب ${student.name}`,

              message:
                `متبقي ` +
                `${remainingSessions} ` +
                `حصص فقط في عقد ` +
                `(${contract.contractNumber}).`,

              date: todayStr,

              isRead: false,

              relatedEntityId:
                contract.id,

              relatedEntityType:
                'contract',

              priority: 'high'
            });
          }
        }

        const endDate =
          new Date(
            contract.endDate
          );

        const diffDays =
          Math.ceil(
            (
              endDate.getTime() -
              today.getTime()
            ) /
              (
                1000 *
                60 *
                60 *
                24
              )
          );

        if (
          contract.status ===
            ContractStatus.ACTIVE &&
          diffDays >= 0 &&
          diffDays <=
            this.settings
              .contractExpiryAlertDays
        ) {
          const student =
            this.students.find(
              s =>
                s.id ===
                contract.studentId
            );

          const existing =
            this.notifications.find(
              n =>
                n.relatedEntityId ===
                  contract.id &&
                n.type ===
                  'contract_expiring'
            );

          if (
            !existing &&
            student
          ) {
            this.addNotification({
              type:
                'contract_expiring',

              title:
                `تنبيه: اقتراب انتهاء ` +
                `عقد ${contract.contractNumber}`,

              message:
                `ينتهي عقد الطالب ` +
                `"${student.name}" ` +
                `خلال ${diffDays} يوم/أيام ` +
                `في تاريخ ` +
                `${contract.endDate}.`,

              date: todayStr,

              isRead: false,

              relatedEntityId:
                contract.id,

              relatedEntityType:
                'contract',

              priority: 'medium'
            });
          }
        }
      }
    );
  }

  // =========================================================
  // Remote Firestore Merging
  // =========================================================

  public mergeRemoteStudents(
    remoteStudents: Student[]
  ): void {
    if (
      !remoteStudents ||
      remoteStudents.length === 0
    ) {
      return;
    }

    const map =
      new Map<string, Student>();

    this.students.forEach(
      s => map.set(s.id, s)
    );

    remoteStudents.forEach(
      s => map.set(s.id, s)
    );

    this.students =
      Array.from(
        map.values()
      );

    setStored(
      STORAGE_KEYS.STUDENTS,
      this.students
    );

    this.notify();
  }

  public mergeRemoteTeachers(
    remoteTeachers: Teacher[]
  ): void {
    if (
      !remoteTeachers ||
      remoteTeachers.length === 0
    ) {
      return;
    }

    const map =
      new Map<string, Teacher>();

    this.teachers.forEach(
      t => map.set(t.id, t)
    );

    remoteTeachers.forEach(
      t => map.set(t.id, t)
    );

    this.teachers =
      Array.from(
        map.values()
      );

    setStored(
      STORAGE_KEYS.TEACHERS,
      this.teachers
    );

    this.notify();
  }

  public mergeRemoteSubjects(
    remoteSubjects: Subject[]
  ): void {
    if (
      !remoteSubjects ||
      remoteSubjects.length === 0
    ) {
      return;
    }

    const map =
      new Map<string, Subject>();

    this.subjects.forEach(
      s => map.set(s.id, s)
    );

    remoteSubjects.forEach(
      s => map.set(s.id, s)
    );

    this.subjects =
      Array.from(
        map.values()
      );

    setStored(
      STORAGE_KEYS.SUBJECTS,
      this.subjects
    );

    this.notify();
  }

  public mergeRemoteRooms(
    remoteRooms: Room[]
  ): void {
    if (
      !remoteRooms ||
      remoteRooms.length === 0
    ) {
      return;
    }

    const map =
      new Map<string, Room>();

    this.rooms.forEach(
      r => map.set(r.id, r)
    );

    remoteRooms.forEach(
      r => map.set(r.id, r)
    );

    this.rooms =
      Array.from(
        map.values()
      );

    setStored(
      STORAGE_KEYS.ROOMS,
      this.rooms
    );

    this.notify();
  }

  public mergeRemoteAssignments(
    remoteAssignments: TeacherAssignment[]
  ): void {
    if (
      !remoteAssignments ||
      remoteAssignments.length === 0
    ) {
      return;
    }

    const map =
      new Map<
        string,
        TeacherAssignment
      >();

    this.assignments.forEach(
      assignment =>
        map.set(
          assignment.id,
          assignment
        )
    );

    remoteAssignments.forEach(
      assignment =>
        map.set(
          assignment.id,
          assignment
        )
    );

    this.assignments =
      Array.from(
        map.values()
      );

    setStored(
      STORAGE_KEYS.ASSIGNMENTS,
      this.assignments
    );

    this.notify();
  }

  public mergeRemoteContracts(
    remoteContracts: Contract[]
  ): void {
    if (
      !remoteContracts ||
      remoteContracts.length === 0
    ) {
      return;
    }

    const map =
      new Map<string, Contract>();

    this.contracts.forEach(
      c => map.set(c.id, c)
    );

    remoteContracts.forEach(
      c => map.set(c.id, c)
    );

    this.contracts =
      Array.from(
        map.values()
      );

    setStored(
      STORAGE_KEYS.CONTRACTS,
      this.contracts
    );

    this.notify();
  }

  public mergeRemoteSessions(
    remoteSessions: Session[]
  ): void {
    if (
      !remoteSessions ||
      remoteSessions.length === 0
    ) {
      return;
    }

    const map =
      new Map<string, Session>();

    this.sessions.forEach(
      s => map.set(s.id, s)
    );

    remoteSessions.forEach(
      s => map.set(s.id, s)
    );

    this.sessions =
      Array.from(
        map.values()
      );

    setStored(
      STORAGE_KEYS.SESSIONS,
      this.sessions
    );

    this.notify();
  }

  public mergeRemoteAttendance(
    remoteAttendance: AttendanceRecord[]
  ): void {
    if (
      !remoteAttendance ||
      remoteAttendance.length === 0
    ) {
      return;
    }

    const map =
      new Map<
        string,
        AttendanceRecord
      >();

    this.attendance.forEach(
      a => map.set(a.id, a)
    );

    remoteAttendance.forEach(
      a => map.set(a.id, a)
    );

    this.attendance =
      Array.from(
        map.values()
      );

    setStored(
      STORAGE_KEYS.ATTENDANCE,
      this.attendance
    );

    this.notify();
  }

  public mergeRemotePayments(
    remotePayments: Payment[]
  ): void {
    if (
      !remotePayments ||
      remotePayments.length === 0
    ) {
      return;
    }

    const map =
      new Map<string, Payment>();

    this.payments.forEach(
      p => map.set(p.id, p)
    );

    remotePayments.forEach(
      p => map.set(p.id, p)
    );

    this.payments =
      Array.from(
        map.values()
      );

    setStored(
      STORAGE_KEYS.PAYMENTS,
      this.payments
    );

    this.notify();
  }

  // =========================================================
  // NEW: Teacher Payments Real-time Merge
  // =========================================================

  public mergeRemoteTeacherPayments(
    remoteTeacherPayments: TeacherPayment[]
  ): void {
    if (
      !remoteTeacherPayments ||
      remoteTeacherPayments.length === 0
    ) {
      return;
    }

    const map =
      new Map<
        string,
        TeacherPayment
      >();

    this.teacherPayments.forEach(
      payment =>
        map.set(
          payment.id,
          payment
        )
    );

    remoteTeacherPayments.forEach(
      payment =>
        map.set(
          payment.id,
          payment
        )
    );

    this.teacherPayments =
      Array.from(
        map.values()
      );

    setStored(
      STORAGE_KEYS.TEACHER_PAYMENTS,
      this.teacherPayments
    );

    this.notify();
  }

  // =========================================================
  // NEW: Notifications Real-time Merge
  // =========================================================

  public mergeRemoteNotifications(
    remoteNotifications: NotificationItem[]
  ): void {
    if (
      !remoteNotifications ||
      remoteNotifications.length === 0
    ) {
      return;
    }

    const map =
      new Map<
        string,
        NotificationItem
      >();

    this.notifications.forEach(
      notification =>
        map.set(
          notification.id,
          notification
        )
    );

    remoteNotifications.forEach(
      notification =>
        map.set(
          notification.id,
          notification
        )
    );

    this.notifications =
      Array.from(
        map.values()
      );

    setStored(
      STORAGE_KEYS.NOTIFICATIONS,
      this.notifications
    );

    this.notify();
  }

  // =========================================================
  // NEW: Audit Logs Real-time Merge
  // =========================================================

  public mergeRemoteAuditLogs(
    remoteAuditLogs: AuditLogItem[]
  ): void {
    if (
      !remoteAuditLogs ||
      remoteAuditLogs.length === 0
    ) {
      return;
    }

    const map =
      new Map<
        string,
        AuditLogItem
      >();

    this.auditLogs.forEach(
      log =>
        map.set(
          log.id,
          log
        )
    );

    remoteAuditLogs.forEach(
      log =>
        map.set(
          log.id,
          log
        )
    );

    this.auditLogs =
      Array.from(
        map.values()
      );

    setStored(
      STORAGE_KEYS.AUDIT_LOGS,
      this.auditLogs
    );

    this.notify();
  }
}