// ============================================================
// THE WAY TRAINING CENTER - TYPE DEFINITIONS
// ============================================================

// -------------------- User & Roles --------------------

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SALES = 'SALES',
  TEACHER = 'TEACHER',
  ACCOUNTANT = 'ACCOUNTANT',
  RECEPTION = 'RECEPTION',
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  department: string;
  departmentDescription?: string;
  phone?: string;
  nationalId?: string;
  salary?: number;
  salaryType?: string;
  joinedDate?: string;
  notes?: string;
  teacherId?: string;
  password?: string;
  isActive: boolean;

  // Hidden system/admin account
  isHidden?: boolean;

  customPermissions?: AppSection[];
}

// -------------------- Student --------------------

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface Student {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  parentName?: string;
  parentPhone?: string;
  dateOfBirth?: string;
  gender?: string;
  grade: string;
  school?: string;
  address?: string;
  subjectIds: string[];
  status: StudentStatus;
  registrationDate: string;
  notes?: string;
  avatarUrl?: string;
}

// -------------------- Teacher --------------------

export enum TeacherStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface Teacher {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  specialization?: string;
  department?: string;
  qualification?: string;
  experienceYears?: number;
  hourlyRate?: number;
  sessionRate?: number;
  joinedDate: string;
  status?: TeacherStatus;
  isActive?: boolean;
  notes?: string;
  avatarUrl?: string;
}

// -------------------- Subject --------------------

export interface Subject {
  id: string;
  code: string;
  name: string;
  category?: string;
  description?: string;
  color?: string;
  isActive: boolean;
  gradeLevels: string[];
  defaultSessionPrice?: number;
}

// -------------------- Room --------------------

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location?: string;
  description?: string;
  isActive?: boolean;
}

// -------------------- Teacher Assignment --------------------

export interface TeacherAssignment {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  assignedDate: string;
  ratePerSession?: number;
}

// -------------------- Contracts --------------------

export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  EXPIRING_SOON = 'EXPIRING_SOON',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  OTHER = 'OTHER',
}

export interface Contract {
  id: string;
  contractNumber: string;
  studentId: string;
  subjectIds: string[];
  totalSessions: number;
  usedSessions: number;
  totalPrice: number;
  paidAmount: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  createdAt: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
}

// -------------------- Sessions --------------------

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SessionType {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP',
  MAKEUP = 'MAKEUP',
}

export interface Session {
  id: string;
  sessionCode: string;
  title: string;
  subjectId: string;
  teacherId: string;
  roomId?: string;
  studentIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  type: SessionType;
  notes?: string;
  recurringGroupId?: string;
  countAgainstStudentSessions: boolean;
}

// -------------------- Attendance --------------------

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  teacherId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  notes?: string;
  markedByUserId: string;
  createdAt: string;
}

// -------------------- Payments --------------------

export interface Payment {
  id: string;
  receiptNumber: string;
  contractId?: string;
  studentId: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  collectedByUserId: string;
  createdAt: string;
}

// -------------------- Teacher Payments --------------------

export interface TeacherPayment {
  id: string;
  payoutNumber: string;
  teacherId: string;
  amount: number;
  date: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
}

// -------------------- Notifications --------------------

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  priority: 'low' | 'medium' | 'high';
}

// -------------------- Audit Logs --------------------

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ARCHIVE = 'ARCHIVE',
  STATUS_CHANGED = 'STATUS_CHANGED',
  ATTENDANCE_MARKED = 'ATTENDANCE_MARKED',
  PAYMENT_RECORDED = 'PAYMENT_RECORDED',
  TEACHER_ASSIGNED = 'TEACHER_ASSIGNED',
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityName: string;
  timestamp: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

// -------------------- Center Settings --------------------

export interface CenterSettings {
  centerName: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  currency: string;
  workingHours: string;
  defaultSessionDuration: number;
  attendanceGracePeriod: number;
  cancellationPolicy: string;
  contractExpiryAlertDays: number;
  lowSessionsAlertThreshold: number;
  allowOverlappingSessions: boolean;
  enforceRoomCapacity: boolean;
}

// -------------------- App Sections --------------------

export enum AppSection {
  DASHBOARD = 'dashboard',
  LIVE = 'live',
  STUDENTS = 'students',
  TEACHERS = 'teachers',
  SUBJECTS = 'subjects',
  ROOMS = 'rooms',
  ASSIGNMENTS = 'assignments',
  CONTRACTS = 'contracts',
  SESSIONS = 'sessions',
  ATTENDANCE = 'attendance',
  PAYMENTS = 'payments',
  TEACHER_PAYMENTS = 'teacher_payments',
  NOTIFICATIONS = 'notifications',
  REPORTS = 'reports',
  AUDIT = 'audit',
  USERS = 'users',
  SETTINGS = 'settings',
}

// -------------------- Conflict Checking --------------------

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: string[];
}