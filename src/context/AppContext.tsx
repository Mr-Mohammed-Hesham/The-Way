import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
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
  CenterSettings,
  UserRole,
  AttendanceStatus,
  ConflictCheckResult,
  AppSection
} from '../types';
import { StorageService } from '../services/storageService';
import { checkSessionConflicts } from '../utils/formatters';
import { firebaseSync, CloudSyncStatus } from '../services/firebaseSync';
import { testConnection } from '../services/firebase';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
}

interface AppContextType {
  // Current user & role & Auth
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;

  // Settings & Time
  settings: CenterSettings;
  currentTime: Date;

  // Data Entities
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  rooms: Room[];
  assignments: TeacherAssignment[];
  contracts: Contract[];
  sessions: Session[];
  attendance: AttendanceRecord[];
  payments: Payment[];
  teacherPayments: TeacherPayment[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];

  // Entity Mappings (ID -> Name)
  studentsMap: Record<string, string>;
  teachersMap: Record<string, string>;
  subjectsMap: Record<string, string>;
  roomsMap: Record<string, string>;

  // Operations
  addStudent: (data: Omit<Student, 'id' | 'code' | 'qrCode' | 'registrationDate'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  archiveStudent: (id: string) => void;
  deleteStudent: (id: string) => void;

  addTeacher: (data: Omit<Teacher, 'id' | 'code' | 'joinedDate'>) => Teacher;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;

  addSubject: (data: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;

  addRoom: (data: Omit<Room, 'id'>) => Room;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  assignTeacher: (studentId: string, subjectId: string, teacherId: string, ratePerSession?: number) => void;

  addContract: (
    data: Omit<Contract, 'id' | 'contractNumber' | 'usedSessions' | 'paidAmount' | 'createdAt'>,
    initialPayment: number
  ) => Contract;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;

  addSession: (data: Omit<Session, 'id' | 'sessionCode'>, recurringWeeks?: number) => Session[];
  updateSession: (id: string, updates: Partial<Session>) => void;
  startSession: (sessionId: string) => void;
  completeSession: (sessionId: string) => void;
  cancelSession: (sessionId: string, chargeStudents: boolean, reason: string) => void;
  deleteSession: (sessionId: string) => void;

  markAttendance: (sessionId: string, studentId: string, status: AttendanceStatus, notes?: string) => AttendanceRecord;
  recordAttendance: (sessionId: string, studentId: string, status: AttendanceStatus, notes?: string) => AttendanceRecord;
  markAllSessionAttendance: (sessionId: string, status: AttendanceStatus) => void;
  processStudentCodeAttendance: (studentCodeOrId: string) => { success: boolean; message: string; student?: Student; session?: Session };
  processQRScan: (qrText: string) => { success: boolean; message: string; student?: Student; session?: Session };

  addPayment: (data: Omit<Payment, 'id' | 'receiptNumber' | 'collectedByUserId' | 'createdAt'>) => Payment;
  addTeacherPayment: (data: Omit<TeacherPayment, 'id' | 'payoutNumber' | 'createdAt'>) => TeacherPayment;

  // User Management (Admin Only)
  addUser: (data: Omit<User, 'id'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => boolean;
  resetUserPassword: (id: string, newPass: string) => void;

  updateSettings: (newSettings: Partial<CenterSettings>) => void;
  resetToDemoData: () => void;

  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Validation
  checkConflicts: (target: {
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
    teacherId: string;
    roomId: string;
    studentIds: string[];
  }) => ConflictCheckResult;

  // Department Permission Checks
  canViewFinancials: boolean;
  canManageContracts: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canRecordAttendance: boolean;
  canEditSection: (section: AppSection, entityOwnerId?: string) => boolean;
  canViewSection: (section: AppSection) => boolean;
  getSectionMeta: (section: AppSection) => {
    title: string;
    allowedDepts: string[];
    isReadOnly: boolean;
    description: string;
  };

  // Global UI Modals / Toast
  toasts: ToastMessage[];
  addToast: (
    typeOrOptions: 'success' | 'error' | 'warning' | 'info' | { type?: 'success' | 'error' | 'warning' | 'info'; message?: string; title?: string; text?: string },
    message?: string,
    title?: string
  ) => void;
  removeToast: (id: string) => void;

  // Printable receipt state
  activeReceiptPayment: Payment | null;
  setActiveReceiptPayment: (payment: Payment | null) => void;

  // Student ID card state (replacing legacy QR)
  activeIdCardStudent: Student | null;
  setActiveIdCardStudent: (student: Student | null) => void;
  activeQRStudent: Student | null;
  setActiveQRStudent: (student: Student | null) => void;

  // Selected Student / Teacher for details drawer/view
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  selectedTeacherId: string | null;
  setSelectedTeacherId: (id: string | null) => void;

  // Theme & Dark Mode
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Notification Operations
  addNotification: (item: Omit<NotificationItem, 'id'>) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  goBack: () => void;

  // Firebase Cloud Sync
  cloudSyncStatus: CloudSyncStatus;
  syncWithFirebase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const storage = StorageService.getInstance();

  const [version, setVersion] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getActiveUser() || storage.getUsers()[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!storage.getActiveUser());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theway_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [activeReceiptPayment, setActiveReceiptPayment] = useState<Payment | null>(null);
  const [activeIdCardStudent, setActiveIdCardStudent] = useState<Student | null>(null);
  const [activeQRStudent, setActiveQRStudent] = useState<Student | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>(() => firebaseSync.getStatus());

  // Initialize Firebase Firestore Sync and connection check on boot
  useEffect(() => {
    testConnection().catch(console.warn);
    firebaseSync.initSync().catch(console.warn);
    const unsubStatus = firebaseSync.onStatusChange(setCloudSyncStatus);
    return () => unsubStatus();
  }, []);

  const syncWithFirebase = async () => {
    try {
      await firebaseSync.seedAllToFirestore(storage);
      addToast('success', 'تمت المزامنة بنجاح مع سحابة Firebase', 'مزامنة سحابية');
    } catch (err: any) {
      addToast('error', 'تعذرت المزامنة السحابية، يرجى المحاولة مرة أخرى', 'خطأ بالمزامنة');
    }
  };

  // Sync theme with document class
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theway_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theway_theme', 'light');
      }
    } catch (e) {
      console.warn('Theme error', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    // Reset any sub-view selections to ensure immediate and smooth view rendering
    setSelectedStudentId(null);
    setSelectedTeacherId(null);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({ tab, studentId: null, teacherId: null }, '', window.location.pathname);
    }
  };

  const handleSetSelectedStudentId = (id: string | null) => {
    setSelectedStudentId(id);
    if (id) setSelectedTeacherId(null);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({ tab: activeTab, studentId: id, teacherId: null }, '', window.location.pathname);
    }
  };

  const handleSetSelectedTeacherId = (id: string | null) => {
    setSelectedTeacherId(id);
    if (id) setSelectedStudentId(null);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({ tab: activeTab, studentId: null, teacherId: id }, '', window.location.pathname);
    }
  };

  const goBack = () => {
    if (selectedStudentId) {
      setSelectedStudentId(null);
      return;
    }
    if (selectedTeacherId) {
      setSelectedTeacherId(null);
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      setActiveTab('dashboard');
    }
  };

  // Browser back / forward button listener (popstate)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        if (event.state.tab) setActiveTab(event.state.tab);
        setSelectedStudentId(event.state.studentId || null);
        setSelectedTeacherId(event.state.teacherId || null);
      } else {
        setSelectedStudentId(null);
        setSelectedTeacherId(null);
        setActiveTab('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setVersion(v => v + 1);
    });
    return () => unsubscribe();
  }, [storage]);

  // Live timer for current clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const addToast = (
    typeOrOptions: 'success' | 'error' | 'warning' | 'info' | { type?: 'success' | 'error' | 'warning' | 'info'; message?: string; title?: string; text?: string },
    message?: string,
    title?: string
  ) => {
    let finalType: 'success' | 'error' | 'warning' | 'info' = 'info';
    let finalMessage = '';
    let finalTitle: string | undefined = undefined;

    if (typeof typeOrOptions === 'object' && typeOrOptions !== null) {
      finalType = typeOrOptions.type || 'info';
      finalMessage = typeOrOptions.message || typeOrOptions.text || '';
      finalTitle = typeOrOptions.title;
    } else if (typeof typeOrOptions === 'string') {
      finalType = typeOrOptions;
      finalMessage = message || '';
      finalTitle = title;
    }

    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 4)}`;
    setToasts(prev => [...prev, { id, type: finalType, message: finalMessage, title: finalTitle }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Operations
  const login = (email: string, password?: string): boolean => {
    const user = storage.authenticate(email, password);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      addToast('success', `مرحباً بك ${user.name} (قسم ${user.department})`, 'تم تسجيل الدخول');
      return true;
    }
    return false;
  };

  const logout = () => {
    storage.setActiveUser(null);
    setIsAuthenticated(false);
    addToast('info', 'تم تسجيل الخروج بنجاح. أهلاً بك في أي وقت', 'تسجيل خروج');
  };

  const handleSetCurrentUser = (user: User) => {
    storage.setActiveUser(user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    addToast('info', `تم التبديل إلى حساب: ${user.name} (قسم ${user.department})`, 'تبديل الحساب');
  };

  // Cached getters from storage
  const settings = useMemo(() => storage.getSettings(), [storage, version]);
  const users = useMemo(() => storage.getUsers(), [storage, version]);
  const students = useMemo(() => storage.getStudents(), [storage, version]);
  const teachers = useMemo(() => storage.getTeachers(), [storage, version]);
  const subjects = useMemo(() => storage.getSubjects(), [storage, version]);
  const rooms = useMemo(() => storage.getRooms(), [storage, version]);
  const assignments = useMemo(() => storage.getAssignments(), [storage, version]);
  const contracts = useMemo(() => storage.getContracts(), [storage, version]);
  const sessions = useMemo(() => storage.getSessions(), [storage, version]);
  const attendance = useMemo(() => storage.getAttendance(), [storage, version]);
  const payments = useMemo(() => storage.getPayments(), [storage, version]);
  const teacherPayments = useMemo(() => storage.getTeacherPayments(), [storage, version]);
  const notifications = useMemo(() => storage.getNotifications(), [storage, version]);
  const auditLogs = useMemo(() => storage.getAuditLogs(), [storage, version]);

  // Lookup maps
  const studentsMap = useMemo(() => {
    return students.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {} as Record<string, string>);
  }, [students]);

  const teachersMap = useMemo(() => {
    return teachers.reduce((acc, t) => ({ ...acc, [t.id]: t.name }), {} as Record<string, string>);
  }, [teachers]);

  const subjectsMap = useMemo(() => {
    return subjects.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {} as Record<string, string>);
  }, [subjects]);

  const roomsMap = useMemo(() => {
    return rooms.reduce((acc, r) => ({ ...acc, [r.id]: r.name }), {} as Record<string, string>);
  }, [rooms]);

  // Legacy Permission flags for backwards-compatibility
  const canViewFinancials =
    currentUser.role === UserRole.SUPER_ADMIN ||
    currentUser.role === UserRole.ADMIN ||
    currentUser.role === UserRole.ACCOUNTANT ||
    currentUser.role === UserRole.SALES;

  const canManageContracts =
    currentUser.role === UserRole.SUPER_ADMIN ||
    currentUser.role === UserRole.ADMIN ||
    currentUser.role === UserRole.SALES ||
    currentUser.role === UserRole.RECEPTION ||
    currentUser.role === UserRole.ACCOUNTANT;

  const canManageUsers = currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN;
  const canManageSettings = currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN;
  const canRecordAttendance = true;

  // Strict View permission check based on user role, custom permissions, and jurisdiction
  const canViewSection = (section: AppSection): boolean => {
    const role = currentUser.role;
    // Admins (SUPER_ADMIN and ADMIN) or Administration department have full access to all panels including notifications
    if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN || currentUser.department === 'الإدارة') {
      return true;
    }

    // Notifications is strictly restricted to Administration
    if (section === 'notifications') {
      return false;
    }

    // Check custom granular permissions if assigned by Admin
    if (currentUser.customPermissions && Array.isArray(currentUser.customPermissions)) {
      if (section === 'dashboard') return true;
      return currentUser.customPermissions.includes(section);
    }

    // Role-specific allowed panels according to official department jurisdiction
    switch (role) {
      case UserRole.RECEPTION:
        // Reception handles front-desk, student registry, rooms, daily sessions, attendance, teachers
        return ['dashboard', 'live', 'students', 'teachers', 'sessions', 'attendance', 'rooms'].includes(section);

      case UserRole.SALES:
        // Sales handles onboarding, student packages, contracts, subject catalog
        return ['dashboard', 'students', 'contracts', 'subjects'].includes(section);

      case UserRole.ACCOUNTANT:
        // Accountant handles contracts, receipts, payments, teacher payroll, financial reports
        return ['dashboard', 'contracts', 'payments', 'teacher_payments', 'reports'].includes(section);

      case UserRole.TEACHER:
        // Teacher handles classroom sessions, assignments, student attendance
        return ['dashboard', 'live', 'attendance', 'assignments', 'sessions'].includes(section);

      default:
        return ['dashboard'].includes(section);
    }
  };

  // Strict Edit permission check
  const canEditSection = (section: AppSection, entityOwnerId?: string): boolean => {
    const role = currentUser.role;
    if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
      return true;
    }

    // Custom permissions can also grant edit rights
    if (currentUser.customPermissions && Array.isArray(currentUser.customPermissions)) {
      return currentUser.customPermissions.includes(section);
    }

    switch (role) {
      case UserRole.RECEPTION:
        return ['students', 'sessions', 'attendance', 'rooms'].includes(section);

      case UserRole.SALES:
        return ['students', 'contracts'].includes(section);

      case UserRole.ACCOUNTANT:
        return ['contracts', 'payments', 'teacher_payments'].includes(section);

      case UserRole.TEACHER:
        if (section === 'attendance') return true;
        if (section === 'assignments') return true;
        return false;

      default:
        return false;
    }
  };

  const getSectionMeta = (section: AppSection) => {
    const isEditable = canEditSection(section);
    const sectionInfo: Record<AppSection, { title: string; allowedDepts: string[]; description: string }> = {
      dashboard: { title: 'لوحة التحكم', allowedDepts: ['الكل'], description: 'مؤشرات أداء المركز' },
      live: { title: 'السنتر الآن', allowedDepts: ['الريسبشن', 'الإدارة'], description: 'متابعة القاعات والحصص المباشرة' },
      students: { title: 'الطلاب وأولياء الأمور', allowedDepts: ['الريسبشن', 'السيلز', 'الإدارة'], description: 'تنظيم بيانات الطلاب والباركود' },
      teachers: { title: 'المدرسين والمساعدين', allowedDepts: ['الإدارة', 'الريسبشن'], description: 'إدارة طاقم التدريس وتخصصاتهم' },
      sessions: { title: 'الحصص والجداول', allowedDepts: ['الريسبشن', 'المدرسين', 'الإدارة'], description: 'جدولة الحصص وتنظيم المواعيد' },
      attendance: { title: 'تسجيل الحضور والغياب', allowedDepts: ['الريسبشن', 'المدرسين', 'الإدارة'], description: 'مسح الباركود وتسجيل الحضور' },
      assignments: { title: 'تعيينات المدرسين', allowedDepts: ['الريسبشن', 'الإدارة'], description: 'ربط الطلاب بالمدرسين' },
      contracts: { title: 'العقود والاشتراكات', allowedDepts: ['السيلز', 'الحسابات', 'الإدارة'], description: 'باقات الحصص والعقود الشهرية' },
      payments: { title: 'المدفوعات وسندات القبض', allowedDepts: ['السيلز', 'الحسابات', 'الإدارة'], description: 'تحصيل الرسوم وإيصالات الدفع' },
      teacher_payments: { title: 'مستحقات المدرسين', allowedDepts: ['الحسابات', 'الإدارة'], description: 'تصفية الأرباح وسندات الصرف' },
      rooms: { title: 'القاعات والمعامل', allowedDepts: ['الريسبشن', 'الإدارة'], description: 'تنظيم سعة وتجهيزات القاعات' },
      subjects: { title: 'المواد الدراسية والمناهج', allowedDepts: ['الإدارة'], description: 'تعريف المواد والمراحل' },
      reports: { title: 'التقارير والإحصائيات', allowedDepts: ['الحسابات', 'الإدارة'], description: 'التحليلات والمؤشرات المالية' },
      notifications: { title: 'الإشعارات والتنبيهات', allowedDepts: ['الإدارة'], description: 'مركز التنبيهات الإدارية' },
      audit: { title: 'سجل العمليات والتدقيق', allowedDepts: ['الإدارة'], description: 'متابعة كافة حركات النظام' },
      users: { title: 'المستخدمين والصلاحيات', allowedDepts: ['الإدارة'], description: 'إدارة حسابات الموظفين' },
      settings: { title: 'إعدادات المركز', allowedDepts: ['الإدارة'], description: 'البيانات الأساسية للنظام' }
    };

    const target = sectionInfo[section] || { title: 'القسم', allowedDepts: ['الإدارة'], description: '' };
    return {
      title: target.title,
      allowedDepts: target.allowedDepts,
      isReadOnly: !isEditable,
      description: target.description
    };
  };

  const checkConflicts = (target: {
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
    teacherId: string;
    roomId: string;
    studentIds: string[];
  }): ConflictCheckResult => {
    return checkSessionConflicts(
      target,
      sessions,
      rooms,
      teachersMap,
      studentsMap,
      roomsMap
    );
  };

  // Wrapped operations with toast feedback and department checks
  const handleAddStudent = (data: Omit<Student, 'id' | 'code' | 'qrCode' | 'registrationDate'>) => {
    try {
      const student = storage.addStudent(data, currentUser);
      addToast('success', `تم إضافة الطالب "${student.name}" بنجاح وتوليد كود الـ QR الخاص به`, 'إضافة طالب');
      return student;
    } catch (err: any) {
      console.error('Error adding student:', err);
      addToast('error', 'حدث خطأ أثناء إضافة الطالب. يرجى المحاولة مرة أخرى', 'خطأ');
      throw err;
    }
  };

  const handleUpdateStudent = (id: string, updates: Partial<Student>) => {
    try {
      storage.updateStudent(id, updates, currentUser);
      addToast('success', 'تم حفظ وتحديث بيانات الطالب بنجاح', 'تحديث طالب');
    } catch (err: any) {
      console.error('Error updating student:', err);
      addToast('error', 'حدث خطأ أثناء تحديث بيانات الطالب', 'خطأ');
    }
  };

  const handleArchiveStudent = (id: string) => {
    try {
      const student = students.find(s => s.id === id);
      storage.archiveStudent(id, currentUser);
      addToast('info', `تم أرشفة سجل الطالب "${student?.name || ''}" بنجاح`, 'أرشفة طالب');
    } catch (err: any) {
      console.error('Error archiving student:', err);
      addToast('error', 'حدث خطأ أثناء أرشفة الطالب', 'خطأ');
    }
  };

  const handleAddTeacher = (data: Omit<Teacher, 'id' | 'code' | 'joinedDate'>) => {
    try {
      const teacher = storage.addTeacher(data, currentUser);
      addToast('success', `تم إضافة المدرس "${teacher.name}" بنجاح`, 'إضافة مدرس');
      return teacher;
    } catch (err: any) {
      console.error('Error adding teacher:', err);
      addToast('error', 'حدث خطأ أثناء إضافة المدرس', 'خطأ');
      throw err;
    }
  };

  const handleUpdateTeacher = (id: string, updates: Partial<Teacher>) => {
    try {
      storage.updateTeacher(id, updates, currentUser);
      addToast('success', 'تم حفظ وتحديث بيانات المدرس بنجاح', 'تحديث مدرس');
    } catch (err: any) {
      console.error('Error updating teacher:', err);
      addToast('error', 'حدث خطأ أثناء تحديث المدرس', 'خطأ');
    }
  };

  const handleAddSubject = (data: Omit<Subject, 'id'>) => {
    try {
      const subject = storage.addSubject(data, currentUser);
      addToast('success', `تم إضافة المادة "${subject.name}" بنجاح`, 'إضافة مادة');
      return subject;
    } catch (err: any) {
      console.error('Error adding subject:', err);
      addToast('error', 'حدث خطأ أثناء إضافة المادة', 'خطأ');
      throw err;
    }
  };

  const handleUpdateSubject = (id: string, updates: Partial<Subject>) => {
    try {
      storage.updateSubject(id, updates, currentUser);
      addToast('success', 'تم تحديث بيانات المادة الدراسية', 'تحديث مادة');
    } catch (err: any) {
      console.error('Error updating subject:', err);
    }
  };

  const handleAddRoom = (data: Omit<Room, 'id'>) => {
    try {
      const room = storage.addRoom(data, currentUser);
      addToast('success', `تم إضافة القاعة "${room.name}" بنجاح`, 'إضافة قاعة');
      return room;
    } catch (err: any) {
      console.error('Error adding room:', err);
      addToast('error', 'حدث خطأ أثناء إضافة القاعة', 'خطأ');
      throw err;
    }
  };

  const handleUpdateRoom = (id: string, updates: Partial<Room>) => {
    try {
      storage.updateRoom(id, updates, currentUser);
      addToast('success', 'تم تحديث بيانات القاعة بنجاح', 'تحديث قاعة');
    } catch (err: any) {
      console.error('Error updating room:', err);
    }
  };

  const handleAssignTeacher = (
    studentId: string,
    subjectId: string,
    teacherId: string,
    ratePerSession?: number
  ) => {
    try {
      storage.assignTeacher(studentId, subjectId, teacherId, ratePerSession, currentUser);
      const stName = studentsMap[studentId] || 'الطالب';
      const tchName = teachersMap[teacherId] || 'المدرس';
      const sbjName = subjectsMap[subjectId] || 'المادة';
      addToast('success', `تم تعيين ${tchName} للطالب ${stName} في مادة ${sbjName}`, 'تعيين مدرس');
    } catch (err: any) {
      console.error('Error assigning teacher:', err);
    }
  };

  const handleAddContract = (
    data: Omit<Contract, 'id' | 'contractNumber' | 'usedSessions' | 'paidAmount' | 'createdAt'>,
    initialPayment: number = 0
  ) => {
    try {
      const contract = storage.addContract(data, initialPayment, currentUser);
      addToast('success', `تم إنشاء العقد رقم (${contract.contractNumber}) بنجاح`, 'إنشاء عقد');
      return contract;
    } catch (err: any) {
      console.error('Error adding contract:', err);
      addToast('error', 'حدث خطأ أثناء إنشاء العقد', 'خطأ');
      throw err;
    }
  };

  const handleUpdateContract = (id: string, updates: Partial<Contract>) => {
    try {
      storage.updateContract(id, updates, currentUser);
      addToast('success', 'تم تحديث بيانات العقد بنجاح', 'تحديث عقد');
    } catch (err: any) {
      console.error('Error updating contract:', err);
    }
  };

  const handleAddSession = (
    data: Omit<Session, 'id' | 'sessionCode'>,
    recurringWeeks: number = 1
  ) => {
    try {
      const weeks = Math.max(1, recurringWeeks || 1);
      const created = storage.addSession(data, currentUser, weeks);
      if (weeks > 1) {
        addToast('success', `تم جدولة الحصة مع تكرار أسبوعي (${weeks} حصة)`, 'جدولة حصص');
      } else {
        addToast('success', `تم جدولة الحصة "${data.title}" بنجاح`, 'جدولة حصة');
      }
      return created;
    } catch (err: any) {
      console.error('Error adding session:', err);
      addToast('error', 'حدث خطأ أثناء جدولة الحصة', 'خطأ');
      throw err;
    }
  };

  const handleUpdateSession = (id: string, updates: Partial<Session>) => {
    const existing = sessions.find(s => s.id === id);
    if (!canEditSection('sessions', existing?.teacherId)) {
      addToast('error', 'تعديل الحصص مخصص لمسؤولي الريسبشن ومدرسي الحصة', 'غير مصرح');
      return;
    }
    storage.updateSession(id, updates, currentUser);
    addToast('success', 'تم تحديث تفاصيل الحصة بنجاح', 'تحديث حصة');
  };

  const handleCompleteSession = (sessionId: string) => {
    const existing = sessions.find(s => s.id === sessionId);
    if (!canEditSection('sessions', existing?.teacherId)) {
      addToast('error', 'إكمال الحصص مخصص لمدرسي الحصة أو موظفي الريسبشن', 'غير مصرح');
      return;
    }
    storage.completeSession(sessionId, currentUser);
    addToast('success', 'تم إكمال الحصة وتسجيل الحضور واستهلاك رصيد الحصص للطلاب المشتركين', 'إكمال الحصة');
  };

  const handleCancelSession = (sessionId: string, chargeStudents: boolean, reason: string) => {
    const existing = sessions.find(s => s.id === sessionId);
    if (!canEditSection('sessions', existing?.teacherId)) {
      addToast('error', 'إلغاء الحصص مخصص للريسبشن أو الإدارة', 'غير مصرح');
      return;
    }
    storage.cancelSession(sessionId, chargeStudents, reason, currentUser);
    addToast('info', 'تم إلغاء الحصة وتحديث جداول القاعات والطلاب', 'إلغاء الحصة');
  };

  const handleMarkAttendance = (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    notes?: string
  ) => {
    const existing = sessions.find(s => s.id === sessionId);
    if (!canEditSection('attendance', existing?.teacherId)) {
      addToast('error', 'تسجيل الحضور مخصص لموظفي الاستقبال أو مدرسي الحصة', 'غير مصرح');
      throw new Error('Unauthorized');
    }
    const rec = storage.markAttendance(sessionId, studentId, status, notes, currentUser);
    const stName = studentsMap[studentId] || 'الطالب';
    const statusLabel =
      status === AttendanceStatus.PRESENT
        ? 'حاضر 🟢'
        : status === AttendanceStatus.ABSENT
        ? 'غائب 🔴'
        : status === AttendanceStatus.LATE
        ? 'متأخر 🟡'
        : 'معذور 🔵';
    addToast('info', `تم تسجيل حالة ${stName}: ${statusLabel}`, 'تسجيل الحضور');
    return rec;
  };

  const handleProcessStudentCodeAttendance = (studentCodeOrId: string) => {
    if (!canEditSection('attendance')) {
      addToast('error', 'تسجيل الحضور مخصص لقسم الريسبشن والمدرسين والإدارة', 'غير مصرح');
      return { success: false, message: 'غير مصرح لك بتسجيل الحضور' };
    }
    const res = storage.processStudentCodeAttendance(studentCodeOrId, currentUser);
    if (res.success) {
      addToast('success', res.message, 'تسجيل حضور بالكود');
    } else {
      addToast('warning', res.message, 'تنبيه الحضور');
    }
    return res;
  };

  const handleProcessQRScan = (qrText: string) => {
    return handleProcessStudentCodeAttendance(qrText);
  };

  const handleAddPayment = (
    data: Omit<Payment, 'id' | 'receiptNumber' | 'collectedByUserId' | 'createdAt'>
  ) => {
    if (!canEditSection('payments')) {
      addToast('error', `عفواً، قسم (${currentUser.department}) يمتلك صلاحية المشاهدة فقط. تحصيل المدفوعات مخصص للسيلز والحسابات والإدارة`, 'غير مصرح');
      throw new Error('Unauthorized');
    }
    const payment = storage.addPayment(data, currentUser);
    addToast('success', `تم تحصيل مبلغ ${payment.amount} ج.م بسند قبض (${payment.receiptNumber})`, 'سند قبض');
    setActiveReceiptPayment(payment);
    return payment;
  };

  const handleAddTeacherPayment = (
    data: Omit<TeacherPayment, 'id' | 'payoutNumber' | 'createdAt'>
  ) => {
    if (!canEditSection('teacher_payments')) {
      addToast('error', 'صرف مستحقات المدرسين مخصص لقسم الحسابات والإدارة فقط', 'غير مصرح');
      throw new Error('Unauthorized');
    }
    const payout = storage.addTeacherPayment(data, currentUser);
    addToast('success', `تم صرف مستحقات بقيمة ${payout.amount} ج.م بسند (${payout.payoutNumber})`, 'صرف مستحقات');
    return payout;
  };

  // Redirect to 'live' if active tab is not accessible to the current user
  useEffect(() => {
    if (isAuthenticated && !canViewSection(activeTab as AppSection)) {
      setActiveTab('live');
    }
  }, [currentUser.id, currentUser.role, isAuthenticated, activeTab]);

  const handleDeleteStudent = (id: string) => {
    if (!canEditSection('students')) {
      addToast('error', 'حذف الطلاب مخصص لقسم الريسبشن والإدارة', 'غير مصرح');
      return;
    }
    storage.deleteStudent(id, currentUser);
    addToast('info', 'تم حذف بيانات الطالب نهائياً من السنتر', 'حذف طالب');
  };

  const handleDeleteRoom = (id: string) => {
    if (!canEditSection('rooms')) {
      addToast('error', 'حذف القاعات مخصص للريسبشن والإدارة', 'غير مصرح');
      return;
    }
    storage.deleteRoom(id, currentUser);
    addToast('info', 'تم حذف القاعة بنجاح', 'حذف قاعة');
  };

  const handleDeleteContract = (id: string) => {
    if (!canEditSection('contracts')) {
      addToast('error', 'حذف العقود مخصص لقسم السيلز والإدارة', 'غير مصرح');
      return;
    }
    storage.deleteContract(id, currentUser);
    addToast('info', 'تم حذف العقد بنجاح', 'حذف عقد');
  };

  const handleStartSession = (sessionId: string) => {
    const existing = sessions.find(s => s.id === sessionId);
    if (!canEditSection('sessions', existing?.teacherId)) {
      addToast('error', 'بدء الحصص مخصص للمدرس أو موظف الريسبشن', 'غير مصرح');
      return;
    }
    storage.startSession(sessionId, currentUser);
    addToast('success', 'تم بدء الحصة وتحويل حالتها إلى "جارية الآن (مباشر)"', 'بدء حصة');
  };

  const handleDeleteSession = (sessionId: string) => {
    const existing = sessions.find(s => s.id === sessionId);
    if (!canEditSection('sessions', existing?.teacherId)) {
      addToast('error', 'حذف الحصص مخصص للريسبشن والإدارة', 'غير مصرح');
      return;
    }
    storage.deleteSession(sessionId, currentUser);
    addToast('info', 'تم حذف الحصة وإخلاء القاعة', 'حذف حصة');
  };

  const handleMarkAllSessionAttendance = (sessionId: string, status: AttendanceStatus) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    if (!canEditSection('attendance', session.teacherId)) {
      addToast('error', 'تسجيل الحضور الجماعي مخصص للريسبشن أو مدرس الحصة', 'غير مصرح');
      return;
    }
    session.studentIds.forEach(stId => {
      storage.markAttendance(sessionId, stId, status, 'تحضير جماعي سريع', currentUser);
    });
    addToast('success', `تم تحضير جميع طلاب الحصة (${session.studentIds.length} طالب)`, 'تحضير جماعي');
  };

  // User Management (Admin only)
  const handleAddUser = (data: Omit<User, 'id'>) => {
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.ADMIN) {
      addToast('error', 'إضافة المستخدمين وصلاحيات الحسابات مقتصرة على الإدارة فقط', 'غير مصرح');
      throw new Error('Unauthorized');
    }
    const created = storage.addUser(data, currentUser);
    addToast('success', `تم إنشاء حساب للموظف ${created.name} (اسم الدخول: ${created.username}) بتخصص (${created.department})`, 'إضافة مستخدم');
    return created;
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.ADMIN) {
      addToast('error', 'تعديل بيانات الموظفين مخصص للإدارة فقط', 'غير مصرح');
      return;
    }
    storage.updateUser(id, updates, currentUser);
    addToast('success', 'تم تحديث بيانات المستخدم بنجاح', 'تحديث مستخدم');
  };

  const handleDeleteUser = (id: string) => {
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.ADMIN) {
      addToast('error', 'حذف المستخدمين مخصص للإدارة فقط', 'غير مصرح');
      return false;
    }
    const res = storage.deleteUser(id, currentUser);
    if (res) {
      addToast('info', 'تم حذف حساب المستخدم وسحب الصلاحية', 'حذف مستخدم');
    } else {
      addToast('error', 'لا يمكن حذف الحساب الإداري الرئيسي الوحيد', 'تعذر الحذف');
    }
    return res;
  };

  const handleResetUserPassword = (id: string, newPass: string) => {
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.ADMIN) {
      addToast('error', 'إعادة تعيين كلمات المرور مخصص للإدارة فقط', 'غير مصرح');
      return;
    }
    storage.resetUserPassword(id, newPass, currentUser);
    addToast('success', 'تم تعيين كلمة المرور الجديدة بنجاح', 'تغيير كلمة المرور');
  };

  const handleUpdateSettings = (newSettings: Partial<CenterSettings>) => {
    if (!canEditSection('settings')) {
      addToast('error', 'تعديل إعدادات النظام مخصص للمدير العام فقط', 'غير مصرح');
      return;
    }
    storage.updateSettings(newSettings, currentUser);
    addToast('success', 'تم حفظ إعدادات المركز بنجاح', 'الإعدادات');
  };

  const handleResetToDemoData = () => {
    if (!canEditSection('settings')) {
      addToast('error', 'استعادة البيانات التجريبية مخصصة للمدير العام فقط', 'غير مصرح');
      return;
    }
    storage.resetToDemoData(currentUser);
    addToast('info', 'تمت استعادة البيانات الافتراضية بنجاح', 'إعادة ضبط');
  };

  const handleMarkNotificationAsRead = (id: string) => {
    storage.markNotificationAsRead(id);
  };

  const handleMarkAllNotificationsAsRead = () => {
    storage.markAllNotificationsAsRead();
    addToast('info', 'تم تعليم كافة الإشعارات كمقروءة');
  };

  const handleAddNotification = (item: Omit<NotificationItem, 'id'>) => {
    storage.addNotification(item);
    addToast('info', item.title, 'إشعار جديد');
  };

  const handleDeleteNotification = (id: string) => {
    storage.deleteNotification(id);
  };

  const handleClearAllNotifications = () => {
    storage.clearAllNotifications();
    addToast('info', 'تم تفريغ كافة الإشعارات');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        users,
        isAuthenticated,
        login,
        logout,
        settings,
        currentTime,
        students,
        teachers,
        subjects,
        rooms,
        assignments,
        contracts,
        sessions,
        attendance,
        payments,
        teacherPayments,
        notifications,
        auditLogs,
        studentsMap,
        teachersMap,
        subjectsMap,
        roomsMap,
        addStudent: handleAddStudent,
        updateStudent: handleUpdateStudent,
        archiveStudent: handleArchiveStudent,
        deleteStudent: handleDeleteStudent,
        addTeacher: handleAddTeacher,
        updateTeacher: handleUpdateTeacher,
        addSubject: handleAddSubject,
        updateSubject: handleUpdateSubject,
        addRoom: handleAddRoom,
        updateRoom: handleUpdateRoom,
        deleteRoom: handleDeleteRoom,
        assignTeacher: handleAssignTeacher,
        addContract: handleAddContract,
        updateContract: handleUpdateContract,
        deleteContract: handleDeleteContract,
        addSession: handleAddSession,
        updateSession: handleUpdateSession,
        startSession: handleStartSession,
        completeSession: handleCompleteSession,
        cancelSession: handleCancelSession,
        deleteSession: handleDeleteSession,
        markAttendance: handleMarkAttendance,
        recordAttendance: handleMarkAttendance,
        markAllSessionAttendance: handleMarkAllSessionAttendance,
        processStudentCodeAttendance: handleProcessStudentCodeAttendance,
        processQRScan: handleProcessQRScan,
        addPayment: handleAddPayment,
        addTeacherPayment: handleAddTeacherPayment,
        addUser: handleAddUser,
        updateUser: handleUpdateUser,
        deleteUser: handleDeleteUser,
        resetUserPassword: handleResetUserPassword,
        updateSettings: handleUpdateSettings,
        resetToDemoData: handleResetToDemoData,
        markNotificationAsRead: handleMarkNotificationAsRead,
        markAllNotificationsAsRead: handleMarkAllNotificationsAsRead,
        addNotification: handleAddNotification,
        deleteNotification: handleDeleteNotification,
        clearAllNotifications: handleClearAllNotifications,
        theme,
        setTheme,
        toggleTheme,
        checkConflicts,
        canViewFinancials,
        canManageContracts,
        canManageUsers,
        canManageSettings,
        canRecordAttendance,
        canEditSection,
        canViewSection,
        getSectionMeta,
        toasts,
        addToast,
        removeToast,
        activeReceiptPayment,
        setActiveReceiptPayment,
        activeIdCardStudent,
        setActiveIdCardStudent,
        activeQRStudent,
        setActiveQRStudent,
        selectedStudentId,
        setSelectedStudentId: handleSetSelectedStudentId,
        selectedTeacherId,
        setSelectedTeacherId: handleSetSelectedTeacherId,
        activeTab,
        setActiveTab: handleSetActiveTab,
        goBack,
        cloudSyncStatus,
        syncWithFirebase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
