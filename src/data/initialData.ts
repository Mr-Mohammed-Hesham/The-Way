import {
  User,
  UserRole,
  Student,
  Teacher,
  TeacherAssignment,
  Contract,
  Session,
  AttendanceRecord,
  Payment,
  TeacherPayment,
  NotificationItem,
  AuditLogItem,
  Subject,
  Room,
  StudentStatus,
  ContractStatus,
  SessionType,
  SessionStatus,
  AttendanceStatus,
  PaymentMethod,
  AuditAction,
  CenterSettings
} from '../types';

export const initialSettings: CenterSettings = {
  centerName: 'The Way Training Center',
  logoUrl: '',
  phone: '+971 4 399 8877',
  whatsapp: '+971 50 998 8776',
  email: 'info@theway-center.ae',
  address: 'دبي - شارع الشيخ زايد - برج المعرفة - الطابق 14',
  currency: 'AED',
  workingHours: '09:00 ص - 10:00 م',
  defaultSessionDuration: 90,
  attendanceGracePeriod: 15,
  cancellationPolicy: 'free_if_24h',
  contractExpiryAlertDays: 7,
  lowSessionsAlertThreshold: 2,
  allowOverlappingSessions: false,
  enforceRoomCapacity: true
};

export const initialUsers: User[] = [
  {
    id: 'usr-admin',
    name: 'أ. ولاء حمدان (المدير العام)',
    username: 'admin',
    email: 'admin@theway-center.ae',
    role: UserRole.SUPER_ADMIN,
    department: 'إدارة',
    departmentDescription: 'كامل صلاحيات الإدارة، التعديل والاطلاع على كافة الأقسام والتقارير والإعدادات وطاقم العمل',
    phone: '+971 50 998 8776',
    password: '123',
    isActive: true
  }
];

export const initialSubjects: Subject[] = [
  {
    id: 'sbj-1',
    code: 'MATH-12A',
    name: 'الرياضيات - المسار المتقدم (Grade 12)',
    category: 'المنهاج الوزاري الإماراتي',
    description: 'منهج الرياضيات المتقدم والتفاضل والتكامل والجبر الخطي للصف الثاني عشر',
    color: '#2563eb',
    isActive: true,
    gradeLevels: ['الصف الثاني عشر (Grade 12)', 'الصف الحادي عشر (Grade 11)'],
    defaultSessionPrice: 220
  },
  {
    id: 'sbj-2',
    code: 'PHYS-12A',
    name: 'الفيزياء - المسار المتقدم (Grade 12)',
    category: 'المنهاج الوزاري الإماراتي',
    description: 'الفيزياء الحديثة والكهرومغناطيسية والميكانيكا المتقدمة لاختبارات الوزارة و EmSAT',
    color: '#4f46e5',
    isActive: true,
    gradeLevels: ['الصف الثاني عشر (Grade 12)', 'الصف الحادي عشر (Grade 11)'],
    defaultSessionPrice: 240
  },
  {
    id: 'sbj-3',
    code: 'CHEM-11G',
    name: 'الكيمياء العامة والعضوية',
    category: 'المنهاج الوزاري الإماراتي',
    description: 'الكيمياء العامة والحركية والكهربائية للمسارين العام والمتقدم',
    color: '#0891b2',
    isActive: true,
    gradeLevels: ['الصف الحادي عشر (Grade 11)', 'الصف العاشر (Grade 10)'],
    defaultSessionPrice: 200
  },
  {
    id: 'sbj-4',
    code: 'BIO-10',
    name: 'الأحياء والعلوم الصحية',
    category: 'المنهاج الوزاري الإماراتي',
    description: 'علم الأحياء، الوراثة، والعلوم الحيوية للمرحلة الثانوية',
    color: '#059669',
    isActive: true,
    gradeLevels: ['الصف العاشر (Grade 10)', 'الصف التاسع (Grade 9)'],
    defaultSessionPrice: 190
  },
  {
    id: 'sbj-5',
    code: 'ENG-EMSAT',
    name: 'اللغة الإنجليزية و EmSAT / IELTS',
    category: 'اللغات والاختبارات القياسية',
    description: 'تأهيل اختبارات EmSAT Achieve English واختبارات القبول الجامعي والدراسات الدولية',
    color: '#d97706',
    isActive: true,
    gradeLevels: ['الصف الثاني عشر (Grade 12)', 'الصف الحادي عشر (Grade 11)', 'الصف العاشر (Grade 10)'],
    defaultSessionPrice: 250
  },
  {
    id: 'sbj-6',
    code: 'ARAB-09',
    name: 'اللغة العربية والتربية الإسلامية',
    category: 'المواد الوزارية الأساسية',
    description: 'قواعد النحو، البلاغة، والأدب والتربية الإسلامية لجميع المراحل',
    color: '#7c3aed',
    isActive: true,
    gradeLevels: ['الصف التاسع (Grade 9)', 'الصف الثامن (Grade 8)', 'الصف السابع (Grade 7)'],
    defaultSessionPrice: 180
  }
];

export const initialRooms: Room[] = [
  {
    id: 'rm-1',
    code: 'RM-101',
    name: 'قاعة دبي للمتفوقين 1',
    number: '101',
    capacity: 16,
    type: 'classroom',
    equipment: ['شاشة تفاعلية ذكية 75 بوصة', 'تكييف مركزي', 'سبورة رقمية وكاميرا'],
    status: 'available',
    isActive: true
  },
  {
    id: 'rm-2',
    code: 'RM-102',
    name: 'قاعة أبوظبي للنجاح 2',
    number: '102',
    capacity: 12,
    type: 'classroom',
    equipment: ['شاشة ذكية 4K', 'تكييف مركزي', 'وايت بورد تفاعلي'],
    status: 'available',
    isActive: true
  },
  {
    id: 'rm-3',
    code: 'RM-103',
    name: 'مختبر العلوم والفيزياء 3',
    number: '103',
    capacity: 14,
    type: 'lab',
    equipment: ['أدوات تجارب علمية', 'بروجكتور ليزري تفاعلي', 'محطات حاسوب'],
    status: 'available',
    isActive: true
  },
  {
    id: 'rm-4',
    code: 'RM-104',
    name: 'قاعة الدروس الفردية VIP (Private Hall)',
    number: '104',
    capacity: 4,
    type: 'private_hall',
    equipment: ['شاشة ذكية 4K', 'تكييف مركزي', 'نظام صوتي وعزل صوت تام'],
    status: 'available',
    isActive: true
  },
  {
    id: 'online',
    code: 'NET-01',
    name: 'منصة البث الأونلاين The Way Live UAE',
    number: 'NET',
    capacity: 150,
    type: 'online',
    equipment: ['سيرفرات بث مباشر فائقة السرعة', 'تسجيل ومزامنة سحابية عالية الدقة'],
    status: 'available',
    isActive: true
  }
];

export const initialTeachers: Teacher[] = [];

export const initialStudents: Student[] = [];

export const initialTeacherAssignments: TeacherAssignment[] = [];

export const initialContracts: Contract[] = [];

export const initialSessions: Session[] = [];

export const initialAttendance: AttendanceRecord[] = [];

export const initialPayments: Payment[] = [];

export const initialTeacherPayments: TeacherPayment[] = [];

export const initialNotifications: NotificationItem[] = [];

export const initialAuditLogs: AuditLogItem[] = [];
