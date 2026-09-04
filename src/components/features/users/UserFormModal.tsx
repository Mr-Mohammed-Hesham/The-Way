import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  Check,
  AlertCircle,
  Briefcase,
  Eye,
  EyeOff,
  DollarSign,
  CreditCard,
  Calendar,
  FileText,
  Sliders,
  CheckSquare,
  Square
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { User, UserRole, AppSection } from '../../../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

const ALL_SYSTEM_SECTIONS: { id: AppSection; label: string; description: string; category: string }[] = [
  { id: 'dashboard', label: 'لوحة التحكم والمؤشرات', description: 'عرض الإحصائيات العامة ومؤشرات الأداء اليومية', category: 'الرئيسية' },
  { id: 'live', label: 'شاشة السنتر المباشرة', description: 'متابعة القاعات والحصص الجارية الآن والاشغال', category: 'العمليات' },
  { id: 'students', label: 'شؤون الطلاب', description: 'تسجيل وتعديل وأرشفة بيانات الطلاب وأولياء الأمور', category: 'الطلاب' },
  { id: 'contracts', label: 'العقود وباقات الحصص', description: 'إنشاء وتجديد العقود واشتراكات الطلاب', category: 'الطلاب' },
  { id: 'sessions', label: 'الحصص والجداول', description: 'جدولة الحصص الدراسية والمواعيد الأسبوعية', category: 'الأكاديميا' },
  { id: 'attendance', label: 'تسجيل الحضور والـ QR', description: 'تحضير الطلاب ومسح بطاقات الباركود الذكية', category: 'الأكاديميا' },
  { id: 'teachers', label: 'طاقم المدرسين', description: 'إدارة ملفات المدرسين وبيانات التواصل', category: 'الأكاديميا' },
  { id: 'assignments', label: 'تعيينات المدرسين والطلاب', description: 'ربط المدرسين بالطلاب والمواد الدراسية', category: 'الأكاديميا' },
  { id: 'rooms', label: 'القاعات والمعامل', description: 'إدارة وتعديل أسماء القاعات وسعتها التجهيزية', category: 'المركز' },
  { id: 'subjects', label: 'المواد الدراسية', description: 'إضافة وتعديل المواد والمناهج التعليمية', category: 'المركز' },
  { id: 'payments', label: 'سندات القبض والتحصيل', description: 'إصدار وتوثيق المدفوعات النقدية والبنكية', category: 'المالية' },
  { id: 'teacher_payments', label: 'مستحقات ورواتب المدرسين', description: 'حساب أجر الحصص وإصدار مستحقات المدرسين', category: 'المالية' },
  { id: 'reports', label: 'التقارير والإحصائيات', description: 'التقارير المالية والأكاديمية المفصلة', category: 'المالية' },
  { id: 'notifications', label: 'التنبيهات والإشعارات', description: 'إشعارات العقود المنتهية والغياب', category: 'النظام' },
  { id: 'audit', label: 'سجل التعديلات والعمليات', description: 'تتبع كافة التغييرات التي يجريها الموظفون', category: 'الإدارة' },
  { id: 'users', label: 'الموظفين وصلاحيات المستخدمين', description: 'إضافة موظفين وتخصيص صلاحيات الدخول', category: 'الإدارة' },
  { id: 'settings', label: 'إعدادات المركز والسياسات', description: 'تعديل بيانات السنتر، الأسعار والسياسات العامة', category: 'الإدارة' }
];

const DEFAULT_DEPT_PERMISSIONS: Record<'إدارة' | 'ريسبشن' | 'سيلز' | 'مدرسين' | 'حسابات', AppSection[]> = {
  إدارة: [
    'dashboard', 'live', 'students', 'teachers', 'sessions', 'attendance', 'assignments',
    'contracts', 'payments', 'teacher_payments', 'rooms', 'subjects', 'reports',
    'notifications', 'audit', 'users', 'settings'
  ],
  ريسبشن: [
    'dashboard', 'live', 'students', 'teachers', 'sessions', 'attendance', 'rooms', 'notifications'
  ],
  سيلز: [
    'dashboard', 'students', 'contracts', 'subjects', 'payments', 'notifications'
  ],
  مدرسين: [
    'dashboard', 'live', 'attendance', 'assignments', 'sessions', 'notifications'
  ],
  حسابات: [
    'dashboard', 'contracts', 'payments', 'teacher_payments', 'reports', 'notifications'
  ]
};

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  userToEdit
}) => {
  const { addUser, updateUser, teachers, addToast } = useApp();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [salary, setSalary] = useState<string>('5000');
  const [salaryType, setSalaryType] = useState<'monthly' | 'hourly' | 'per_session' | 'commission'>('monthly');
  const [joinedDate, setJoinedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [department, setDepartment] = useState<'إدارة' | 'ريسبشن' | 'سيلز' | 'مدرسين' | 'حسابات'>('ريسبشن');
  const [teacherId, setTeacherId] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [customPermissions, setCustomPermissions] = useState<AppSection[]>(DEFAULT_DEPT_PERMISSIONS['ريسبشن']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setUsername(userToEdit.username || userToEdit.email.split('@')[0]);
      setPassword(userToEdit.password || '123');
      setEmail(userToEdit.email || '');
      setPhone(userToEdit.phone || '');
      setNationalId(userToEdit.nationalId || '');
      setSalary(userToEdit.salary ? String(userToEdit.salary) : '5000');
      setSalaryType(userToEdit.salaryType || 'monthly');
      setJoinedDate(userToEdit.joinedDate || new Date().toISOString().split('T')[0]);
      setNotes(userToEdit.notes || '');
      setDepartment(userToEdit.department);
      setTeacherId(userToEdit.teacherId || '');
      setIsActive(userToEdit.isActive);
      setCustomPermissions(
        userToEdit.customPermissions && userToEdit.customPermissions.length > 0
          ? userToEdit.customPermissions
          : DEFAULT_DEPT_PERMISSIONS[userToEdit.department] || DEFAULT_DEPT_PERMISSIONS['ريسبشن']
      );
    } else {
      setName('');
      setUsername('');
      setPassword('123');
      setEmail('');
      setPhone('');
      setNationalId('');
      setSalary('5000');
      setSalaryType('monthly');
      setJoinedDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setDepartment('ريسبشن');
      setTeacherId('');
      setIsActive(true);
      setCustomPermissions(DEFAULT_DEPT_PERMISSIONS['ريسبشن']);
    }
    setErrors({});
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const departmentMeta: Record<
    'إدارة' | 'ريسبشن' | 'سيلز' | 'مدرسين' | 'حسابات',
    { role: UserRole; title: string; desc: string; color: string }
  > = {
    إدارة: {
      role: UserRole.ADMIN,
      title: 'إدارة السنتر والمدير العام',
      desc: 'صلاحيات كاملة للاطلاع والتعديل والإضافة والحذف في كافة الأقسام والإعدادات والمستخدمين',
      color: 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300'
    },
    ريسبشن: {
      role: UserRole.RECEPTION,
      title: 'الريسبشن والاستقبال',
      desc: 'تسجيل الطلاب، الحصص والجداول، مسح باركود الـ QR، تسجيل الحضور، وتنظيم القاعات',
      color: 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300'
    },
    سيلز: {
      role: UserRole.SALES,
      title: 'المبيعات والاشتراكات (Sales)',
      desc: 'إدارة باقات الحصص والعقود والاشتراكات، تسجيل الطلاب الجدد، وإصدار سندات القبض',
      color: 'border-blue-500 bg-blue-500/10 text-blue-900 dark:text-blue-300'
    },
    مدرسين: {
      role: UserRole.TEACHER,
      title: 'طاقم التدريس',
      desc: 'الاطلاع على جدول الحصص الخاص بالمدرس، تسجيل حضور وغياب طلاب مجموعته',
      color: 'border-purple-500 bg-purple-500/10 text-purple-900 dark:text-purple-300'
    },
    حسابات: {
      role: UserRole.ACCOUNTANT,
      title: 'المحاسبة والمالية',
      desc: 'سندات القبض والتحصيل، مستحقات المدرسين، متابعة العقود والتقارير المالية',
      color: 'border-cyan-500 bg-cyan-500/10 text-cyan-900 dark:text-cyan-300'
    }
  };

  const handleDepartmentChange = (dept: 'إدارة' | 'ريسبشن' | 'سيلز' | 'مدرسين' | 'حسابات') => {
    setDepartment(dept);
    setCustomPermissions(DEFAULT_DEPT_PERMISSIONS[dept]);
  };

  const togglePermission = (sectionId: AppSection) => {
    setCustomPermissions(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(p => p !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };

  const handleSelectAllPermissions = () => {
    setCustomPermissions(ALL_SYSTEM_SECTIONS.map(s => s.id));
  };

  const handleDeselectAllPermissions = () => {
    setCustomPermissions(['dashboard', 'notifications']);
  };

  const handleResetDeptPermissions = () => {
    setCustomPermissions(DEFAULT_DEPT_PERMISSIONS[department]);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'يرجى إدخال اسم الموظف';
    if (!username.trim()) {
      errs.username = 'يرجى إدخال اسم المستخدم (للدخول)';
    } else if (username.length < 3) {
      errs.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    }
    if (!password.trim()) errs.password = 'يرجى إدخال كلمة المرور';
    if (!phone.trim()) errs.phone = 'يرجى إدخال رقم الهاتف';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedMeta = departmentMeta[department];
    const generatedEmail = email.trim() || `${username.trim().toLowerCase()}@theway.com`;
    const numericSalary = salary ? parseFloat(salary) : 0;

    if (userToEdit) {
      updateUser(userToEdit.id, {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim(),
        email: generatedEmail,
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        salary: numericSalary,
        salaryType,
        joinedDate,
        notes: notes.trim(),
        department,
        role: userToEdit.role === UserRole.SUPER_ADMIN ? UserRole.SUPER_ADMIN : selectedMeta.role,
        departmentDescription: selectedMeta.desc,
        teacherId: department === 'مدرسين' ? teacherId || undefined : undefined,
        isActive,
        customPermissions
      });
      addToast({
        type: 'success',
        title: 'تم حفظ وتحديث صلاحيات الموظف ✓',
        message: `تم تحديث بيانات وصلاحيات ${name.trim()} (${customPermissions.length} قسم مصرح)`
      });
    } else {
      addUser({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim(),
        email: generatedEmail,
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        salary: numericSalary,
        salaryType,
        joinedDate,
        notes: notes.trim(),
        department,
        role: selectedMeta.role,
        departmentDescription: selectedMeta.desc,
        teacherId: department === 'مدرسين' ? teacherId || undefined : undefined,
        isActive,
        customPermissions
      });
      addToast({
        type: 'success',
        title: 'تم إنشاء حساب الموظف بنجاح ✓',
        message: `تم إضافة (${username.trim()}) في قسم (${department}) مع ${customPermissions.length} صلاحية مخصصة`
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FBF9F4] dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-amber-500/20 dark:border-amber-500/20 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header with Warm Gold Accents */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-[#1E2538] to-slate-900 text-white flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-amber-100 flex items-center gap-2">
                {userToEdit ? 'تعديل بيانات وتخصيص صلاحيات الموظف' : 'إنشاء موظف جديد وتحديد صلاحياته بدقة'}
              </h3>
              <p className="text-xs text-slate-300">
                إمكانية إضافة أو سحب أي صلاحية لأي قسم في النظام حسب رغبة الإدارة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Department / Specialty Preset */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>القسم الافتراضي / التخصص الوظيفي:</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['إدارة', 'ريسبشن', 'سيلز', 'مدرسين', 'حسابات'] as const).map(dept => {
                const isSelected = department === dept;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleDepartmentChange(dept)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-500/40 font-black text-amber-900 dark:text-amber-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold'
                    }`}
                  >
                    <div className="text-xs font-bold">{dept}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Permissions Customizer (الميزة المطلوبة: تخصيص صلاحيات كل موظف بالحذف والإضافة) */}
          <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-amber-500/20 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  تخصيص صلاحيات الموظف (إضافة / حذف صلاحيات الدخول والأقسام):
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                  {customPermissions.length} من {ALL_SYSTEM_SECTIONS.length} صلاحية مفعلة
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllPermissions}
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                >
                  منح الكل
                </button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllPermissions}
                  className="px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                >
                  إلغاء الكل
                </button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleResetDeptPermissions}
                  className="px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors cursor-pointer"
                >
                  استعادة افتراضي القسم
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              يمكنك النقر على أي صلاحية لتفعيلها للموظف أو إزالتها فوراً لمنعه من الاطلاع أو التعديل عليها:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
              {ALL_SYSTEM_SECTIONS.map(sec => {
                const isGranted = customPermissions.includes(sec.id);
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => togglePermission(sec.id)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
                      isGranted
                        ? 'border-emerald-500/70 bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isGranted ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isGranted ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-500'}`}>
                          {sec.label}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-400 shrink-0">
                          {sec.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {sec.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Credentials (Username & Password) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-amber-500/20 space-y-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>بيانات تسجيل الدخول (Username & Password)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  اسم المستخدم للدخول (Username): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                  placeholder="مثال: ahmed_reception أو mona"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono text-left text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
                {errors.username && (
                  <p className="text-[11px] text-rose-500 font-semibold">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  كلمة المرور (Password): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="كلمة المرور"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono text-left text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 font-semibold">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                اسم الموظف الكامل: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="الاسم ثلاثي أو رباعي"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
              {errors.name && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                رقم الهاتف / الواتساب: <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono text-left text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-500 font-semibold">{errors.phone}</p>
              )}
            </div>

            {/* National ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                الرقم القومي / الهوية:
              </label>
              <input
                type="text"
                value={nationalId}
                onChange={e => setNationalId(e.target.value)}
                placeholder="14 رقم"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono text-left text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                البريد الإلكتروني (اختياري):
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@theway.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono text-left text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>
          </div>

          {/* Salary & Financial Compensation Section */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-emerald-500/20 space-y-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>الراتب والبدلات المالية</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Salary Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">نظام الراتب:</label>
                <select
                  value={salaryType}
                  onChange={e => setSalaryType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="monthly">راتب شهري ثابت</option>
                  <option value="per_session">أجر لكل حصة</option>
                  <option value="hourly">أجر بالساعة</option>
                  <option value="commission">نسبة مئوية / عمولة</option>
                </select>
              </div>

              {/* Salary Value */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  قيمة الراتب / الأجر (ج.م):
                </label>
                <input
                  type="number"
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Hire Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">تاريخ التعيين:</label>
                <input
                  type="date"
                  value={joinedDate}
                  onChange={e => setJoinedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Teacher Linkage if department is teachers */}
          {department === 'مدرسين' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ربط الحساب بملف مدرس معتمد:
              </label>
              <select
                value={teacherId}
                onChange={e => setTeacherId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-none"
              >
                <option value="">-- بدون ربط أو إنشاء جديد --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.phone})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ملاحظات إضافية:</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="أي ملاحظات حول الوظيفة أو شروط العمل..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="user-active-status"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded-md focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="user-active-status" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              حساب مفعل (يسمح للموظف بتسجيل الدخول إلى لوحة The Way بالصلاحيات المحددة أعلاه)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-black shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              {userToEdit ? 'حفظ التعديلات والصلاحيات' : 'إنشاء حساب الموظف بالصلاحيات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
