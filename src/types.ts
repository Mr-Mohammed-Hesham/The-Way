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

  avatar?: string;

  customPermissions?: AppSection[];
}

// -------------------- Student --------------------

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  SUSPENDED = 'suspended',
  GRADUATED = 'graduated',
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
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  ON_LEAVE = 'on_leave',
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
  code?: string;
  name: string;
  number?: string;
  capacity: number;
  type?: string;
  equipment?: string[];
  status?: string;
  location?: string;
  description?: string;
  notes?: string;
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
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  EXPIRING_SOON = 'expiring_soon',
  SUSPENDED = 'suspended',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  OTHER = 'other',
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
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

export enum SessionType {
  INDIVIDUAL = 'individual',
  GROUP = 'group',
  MAKEUP = 'makeup',
  ONLINE = 'online',
  REVIEW = 'review',
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
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  CANCELLED = 'cancelled',
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

export type AppSection =
  | 'dashboard'
  | 'live'
  | 'students'
  | 'teachers'
  | 'subjects'
  | 'rooms'
  | 'assignments'
  | 'contracts'
  | 'sessions'
  | 'attendance'
  | 'payments'
  | 'teacher_payments'
  | 'notifications'
  | 'reports'
  | 'audit'
  | 'users'
  | 'settings';

export const AppSection = {
  DASHBOARD: 'dashboard',
  LIVE: 'live',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  SUBJECTS: 'subjects',
  ROOMS: 'rooms',
  ASSIGNMENTS: 'assignments',
  CONTRACTS: 'contracts',
  SESSIONS: 'sessions',
  ATTENDANCE: 'attendance',
  PAYMENTS: 'payments',
  TEACHER_PAYMENTS: 'teacher_payments',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  AUDIT: 'audit',
  USERS: 'users',
  SETTINGS: 'settings',
} as const;

// -------------------- Conflict Checking --------------------

export interface ConflictCheckResult {
  hasConflict: boolean;
  reasons?: string[];
  conflicts?: string[];
  conflictingSessionIds?: string[];
}