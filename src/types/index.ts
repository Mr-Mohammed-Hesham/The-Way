export enum AttendanceStatus {
  PRESENT = 'present', // حاضر 🟢
  ABSENT = 'absent', // غائب 🔴
  LATE = 'late', // متأخر 🟡
  EXCUSED = 'excused', // معذور 🔵
  CANCELLED = 'cancelled' // ملغي ⚪
}

export enum SessionStatus {
  SCHEDULED = 'scheduled', // مجدولة
  LIVE = 'live', // جارية الآن
  COMPLETED = 'completed', // مكتملة
  CANCELLED = 'cancelled', // ملغية
  RESCHEDULED = 'rescheduled', // معاد جدولتها
  NO_SHOW = 'no_show' // لم يحضر
}

export enum SessionType {
  INDIVIDUAL = 'individual', // فردي (خاص)
  GROUP = 'group', // جماعي (مجموعة)
  ONLINE = 'online', // أونلاين
  REVIEW = 'review' // مراجعة
}

export enum ContractStatus {
  ACTIVE = 'active', // ساري
  EXPIRING_SOON = 'expiring_soon', // ينتهي قريباً
  EXPIRED = 'expired', // منتهي
  COMPLETED = 'completed', // مكتمل
  SUSPENDED = 'suspended', // معلق
  CANCELLED = 'cancelled' // ملغي
}

export enum PaymentMethod {
  CASH = 'cash', // نقداً
  BANK_TRANSFER = 'bank_transfer', // تحويل بنكي / فودافون كاش / إنستاباي
  CARD = 'card', // بطاقة ائتمان / مدى
  OTHER = 'other' // أخرى
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin', // مدير عام (كامل الصلاحيات)
  ADMIN = 'admin', // إدارة
  RECEPTION = 'reception', // ريسبشن / استقبال
  SALES = 'sales', // سيلز / مبيعات واشتراكات
  TEACHER = 'teacher', // مدرسين
  ACCOUNTANT = 'accountant' // محاسبة / حسابات
}

export enum StudentStatus {
  ACTIVE = 'active', // نشط
  INACTIVE = 'inactive', // غير نشط
  SUSPENDED = 'suspended', // موقوف
  GRADUATED = 'graduated', // متخرج
  ARCHIVED = 'archived' // مؤرشف
}

export enum TeacherStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave'
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ARCHIVE = 'archive',
  ATTENDANCE_MARKED = 'attendance_marked',
  PAYMENT_RECORDED = 'payment_recorded',
  STATUS_CHANGED = 'status_changed',
  TEACHER_ASSIGNED = 'teacher_assigned'
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  relationship: string; // الأب، الأم، ولي أمر
  notes?: string;
}

export interface Student {
  id: string;
  code: string; // كود الطالب مثل STD-1001
  name: string;
  username?: string; // يوزر / اسم مستخدم الطالب
  salesRep?: string; // السيلز / مسؤول المبيعات والتسجيل
  gender: 'male' | 'female';
  birthDate?: string;
  grade: string; // الصف الدراسي (KG1 إلى Grade 12)
  track?: 'general' | 'advanced' | 'elite' | 'none'; // المسار (عام / متقدم / نخبة)
  school?: string;
  phone?: string;
  parent: Parent;
  address?: string;
  status: StudentStatus;
  registrationDate: string;
  notes?: string;
  avatarColor?: string;
  subjectIds: string[]; // المواد المسجل بها
}

export interface Teacher {
  id: string;
  code: string; // TCH-201
  name: string;
  phone: string;
  email?: string;
  address?: string;
  subjectIds: string[];
  hourlyRate?: number; // الأجر بالساعة أو الحصة
  rateType: 'percentage' | 'hourly' | 'fixed_per_student';
  defaultRate: number;
  status: TeacherStatus | 'active' | 'inactive';
  color: string;
  bio?: string;
  notes?: string;
  joinedDate?: string;
}

export interface Subject {
  id: string;
  code: string; // MATH-01
  name: string; // الرياضيات
  category?: string; // الثانوية العامة، لغات، دولي SAT/IGCSE
  description?: string;
  color?: string;
  isActive?: boolean;
  gradeLevels: string[];
  defaultSessionPrice: number;
}

export interface TeacherAssignment {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  assignedDate?: string;
  startDate?: string;
  notes?: string;
  ratePerSession: number;
  status?: string;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  number?: string;
  capacity: number;
  type?: 'classroom' | 'lab' | 'online' | 'private_hall';
  equipment: string[]; // شاشة ذكية، مكيف، بروجكتور
  status?: 'available' | 'occupied' | 'maintenance';
  notes?: string;
  isActive: boolean;
}

export interface Contract {
  id: string;
  contractNumber: string; // CNT-2025-001
  studentId: string;
  studentUsername?: string;
  salesRep?: string; // السيلز مسؤول التسجيل
  subjectIds: string[];
  teacherId?: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  usedSessions: number;
  sessionDurationMinutes?: number;
  pricePerSession?: number;
  totalPrice: number;
  paidAmount?: number;
  status: ContractStatus;
  notes?: string;
  createdAt?: string;
}

export interface Session {
  id: string;
  sessionCode: string; // SES-304
  title: string;
  type: SessionType;
  subjectId: string;
  teacherId: string;
  roomId: string;
  studentIds: string[];
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes?: number;
  maxCapacity?: number;
  isRecurring?: boolean;
  status: SessionStatus;
  contractId?: string;
  notes?: string;
  recurringGroupId?: string;
  countAgainstStudentSessions?: boolean;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  teacherId?: string;
  date?: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  markedByUserId?: string;
  createdAt?: string;
}

export interface Payment {
  id: string;
  receiptNumber: string; // REC-5001
  contractId?: string;
  studentId: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  collectedByUserId: string;
  createdAt?: string;
}

export interface TeacherPayment {
  id: string;
  payoutNumber: string; // PAY-7001
  teacherId: string;
  amount: number;
  sessionsCount: number;
  totalHours: number;
  periodStart: string;
  periodEnd: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  type: 'contract_expiring' | 'low_sessions' | 'payment_overdue' | 'student_absent' | 'schedule_conflict' | 'system';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'student' | 'contract' | 'session' | 'payment' | 'teacher';
  priority: 'low' | 'medium' | 'high';
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName?: string;
  action: AuditAction | string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  timestamp: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface DocumentItem {
  id: string;
  studentId: string;
  name: string;
  type: 'contract' | 'id_card' | 'receipt' | 'certificate' | 'exam_report' | 'other';
  uploadDate: string;
  fileSize: string;
  fileUrl?: string;
}

export type AppSection =
  | 'dashboard'
  | 'live'
  | 'students'
  | 'teachers'
  | 'sessions'
  | 'attendance'
  | 'assignments'
  | 'contracts'
  | 'payments'
  | 'teacher_payments'
  | 'rooms'
  | 'subjects'
  | 'reports'
  | 'notifications'
  | 'audit'
  | 'users'
  | 'settings';

export interface User {
  id: string;
  name: string;
  username: string; // اسم المستخدم لتسجيل الدخول
  email: string;
  role: UserRole;
  department: 'إدارة' | 'ريسبشن' | 'سيلز' | 'مدرسين' | 'حسابات';
  departmentDescription?: string;
  phone: string;
  nationalId?: string; // الرقم القومي أو الهوية
  salary?: number; // قيمة الراتب أو المقابل
  salaryType?: 'monthly' | 'hourly' | 'per_session' | 'commission'; // نوع الراتب
  joinedDate?: string; // تاريخ التعيين
  notes?: string; // ملاحظات إضافية
  teacherId?: string;
  isActive: boolean;
  avatar?: string;
  password?: string;
  customPermissions?: AppSection[]; // الصلاحيات المخصصة للموظف (إضافة / حذف صلاحيات)
}

export interface CenterSettings {
  centerName: string;
  logoUrl?: string;
  phone: string;
  whatsapp?: string;
  address: string;
  email: string;
  currency: string; // ج.م، ر.س، د.إ، $
  workingHours?: string;
  defaultSessionDuration?: number;
  attendanceGracePeriod?: number;
  cancellationPolicy?: 'charge_always' | 'free_if_24h' | 'never_charge';
  contractExpiryAlertDays?: number;
  lowSessionsAlertThreshold?: number;
  allowOverlappingSessions?: boolean;
  enforceRoomCapacity?: boolean;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  reasons: string[];
  conflictingSessionIds: string[];
}
