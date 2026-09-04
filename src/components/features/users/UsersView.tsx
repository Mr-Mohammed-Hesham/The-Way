import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  LogIn,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Calendar,
  CreditCard
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { User, UserRole } from '../../../types';
import { UserFormModal } from './UserFormModal';
import { formatCurrency } from '../../../utils/formatters';

export const UsersView: React.FC = () => {
  const {
    currentUser,
    users,
    setCurrentUser,
    deleteUser,
    resetUserPassword,
    settings,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [passwordResetUserId, setPasswordResetUserId] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  // Check if current user is admin
  const isAdmin = currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN;

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleQuickResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUserId || !newPasswordValue.trim()) return;

    resetUserPassword(passwordResetUserId, newPasswordValue.trim());
    setPasswordResetUserId(null);
    setNewPasswordValue('');
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmUser) return;
    deleteUser(deleteConfirmUser.id);
    setDeleteConfirmUser(null);
  };

  const departmentMeta: Record<
    'إدارة' | 'ريسبشن' | 'سيلز' | 'مدرسين' | 'حسابات',
    { title: string; desc: string; boards: string[]; bgBadge: string; textBadge: string; borderCard: string }
  > = {
    إدارة: {
      title: 'الإدارة والمدير العام',
      desc: 'صلاحية كاملة لجميع الأقسام والإعدادات والمستخدمين',
      boards: ['كافة الأقسام واللوحات'],
      bgBadge: 'bg-rose-100 dark:bg-rose-950/60',
      textBadge: 'text-rose-800 dark:text-rose-300',
      borderCard: 'border-rose-200 dark:border-rose-800'
    },
    ريسبشن: {
      title: 'الريسبشن والاستقبال',
      desc: 'شؤون الطلاب، الحصص، الحضور والباركود، القاعات',
      boards: ['السنتر الآن', 'الطلاب', 'الحصص والجداول', 'تسجيل الحضور', 'القاعات'],
      bgBadge: 'bg-emerald-100 dark:bg-emerald-950/60',
      textBadge: 'text-emerald-800 dark:text-emerald-300',
      borderCard: 'border-emerald-200 dark:border-emerald-800'
    },
    سيلز: {
      title: 'المبيعات والعقود (Sales)',
      desc: 'باقات الحصص، العقود والاشتراكات، سندات القبض',
      boards: ['السنتر الآن', 'الطلاب', 'العقود والاشتراكات', 'المدفوعات'],
      bgBadge: 'bg-amber-100 dark:bg-amber-950/60',
      textBadge: 'text-amber-800 dark:text-amber-300',
      borderCard: 'border-amber-200 dark:border-amber-800'
    },
    مدرسين: {
      title: 'طاقم التدريس',
      desc: 'جدول الحصص الخاصة وتحضير الطلاب',
      boards: ['السنتر الآن', 'الحصص والجداول', 'تسجيل الحضور'],
      bgBadge: 'bg-blue-100 dark:bg-blue-950/60',
      textBadge: 'text-blue-800 dark:text-blue-300',
      borderCard: 'border-blue-200 dark:border-blue-800'
    },
    حسابات: {
      title: 'المحاسبة والمالية',
      desc: 'سندات القبض، مستحقات المدرسين، العقود والتقارير',
      boards: ['السنتر الآن', 'المدفوعات وسندات القبض', 'مستحقات المدرسين', 'العقود', 'التقارير'],
      bgBadge: 'bg-cyan-100 dark:bg-cyan-950/60',
      textBadge: 'text-cyan-800 dark:text-cyan-300',
      borderCard: 'border-cyan-200 dark:border-cyan-800'
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        (user.username && user.username.toLowerCase().includes(q)) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.includes(q);

      const matchesDept = selectedDept === 'all' || user.department === selectedDept;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && user.isActive) ||
        (selectedStatus === 'inactive' && !user.isActive);

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [users, searchQuery, selectedDept, selectedStatus]);

  // Department counts
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'إدارة': 0,
      'ريسبشن': 0,
      'سيلز': 0,
      'مدرسين': 0,
      'حسابات': 0
    };
    users.forEach(u => {
      if (counts[u.department] !== undefined) {
        counts[u.department]++;
      }
    });
    return counts;
  }, [users]);

  // Total monthly payroll sum
  const totalSalaries = useMemo(() => {
    return users.reduce((acc, u) => acc + (u.salary || 0), 0);
  }, [users]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-lg mx-auto my-12">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-800">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="font-black text-lg text-slate-800 dark:text-white mb-2">إدارة المستخدمين مخصصة للأدمن فقط</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          فقط الأدمن (ولاء حمدان) يمتلك صلاحية الدخول وإضافة أو تعديل حسابات الموظفين وتوزيع الرواتب والصلاحيات.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-right">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>لوحة تحكم الأدمن • The Way Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            شؤون الموظفين وحسابات الدخول والرواتب
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
            إضافة موظف جديد بكلمة المرور واسم الدخول وتحديد قسمه (ريسبشن، سيلز، مدرسين، حسابات) وراتبه الشهري وصلاحياته.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="relative z-10 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-lg shadow-indigo-600/40 transition-all transform active:scale-95 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          <span>إضافة موظف جديد (+)</span>
        </button>

        {/* Subtle ambient circle */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Specialty Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {(['إدارة', 'ريسبشن', 'سيلز', 'مدرسين', 'حسابات'] as const).map(dept => {
          const count = deptCounts[dept] || 0;
          const meta = departmentMeta[dept];
          const isSelected = selectedDept === dept;

          return (
            <button
              key={dept}
              onClick={() => setSelectedDept(selectedDept === dept ? 'all' : dept)}
              className={`p-4 rounded-3xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-white dark:bg-slate-800 ring-2 ring-indigo-500/30 shadow-md scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${meta.bgBadge} ${meta.textBadge}`}>
                  {dept}
                </span>
                <span className="text-xl font-black font-mono text-slate-800 dark:text-white">{count}</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white mb-1">{meta.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {meta.boards.slice(0, 3).join(' • ')}
                  {meta.boards.length > 3 ? '...' : ''}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، اسم المستخدم (Username)، الهاتف، أو البريد..."
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              مسح
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400">التخصص:</span>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-transparent font-black text-slate-800 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">كافة التخصصات ({users.length})</option>
              <option value="إدارة">إدارة ({deptCounts['إدارة']})</option>
              <option value="ريسبشن">ريسبشن ({deptCounts['ريسبشن']})</option>
              <option value="سيلز">سيلز ({deptCounts['سيلز']})</option>
              <option value="مدرسين">مدرسين ({deptCounts['مدرسين']})</option>
              <option value="حسابات">حسابات ({deptCounts['حسابات']})</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400">الحالة:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-transparent font-black text-slate-800 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">الكل</option>
              <option value="active">نشط فقط</option>
              <option value="inactive">معطل فقط</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => {
          const dept = (user.department in departmentMeta ? user.department : 'ريسبشن') as keyof typeof departmentMeta;
          const meta = departmentMeta[dept];
          const isShowPass = !!visiblePasswords[user.id];
          const isSelf = user.id === currentUser.id;

          return (
            <div
              key={user.id}
              className={`bg-white dark:bg-slate-800 rounded-3xl p-5 border transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
                isSelf
                  ? 'border-indigo-400 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                {/* Header: User avatar + info + Dept badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-indigo-300 dark:border-indigo-700 shadow-sm shrink-0">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">{user.name}</h4>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">
                            أنت الآن
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono" dir="ltr">
                        @{user.username || user.email.split('@')[0]}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${meta.bgBadge} ${meta.textBadge}`}>
                    {user.department}
                  </span>
                </div>

                {/* Credentials Box (Username + Password) */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">اسم المستخدم (للدخول):</span>
                    <span className="font-mono font-black text-indigo-900 dark:text-indigo-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700" dir="ltr">
                      {user.username || user.email.split('@')[0]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">كلمة المرور:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-slate-800 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700" dir="ltr">
                        {isShowPass ? (user.password || '123') : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
                        title={isShowPass ? 'إخفاء' : 'إظهار كلمة المرور'}
                      >
                        {isShowPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Financial / Salary info & National ID */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <div>
                    <span className="text-slate-400 block font-semibold">الراتب / الاستحقاق:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {user.salary ? formatCurrency(user.salary, settings.currency) : '5,000 ج.م'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">تاريخ التعيين:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {user.joinedDate || '2025-01-01'}
                    </span>
                  </div>
                </div>

                {/* Allowed Sections Tags */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>الأقسام المصرح له بها:</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {dept === 'إدارة' ? 'كل اللوحات' : `${meta.boards.length} لوحات`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {meta.boards.map((board, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 text-[10px] font-bold text-indigo-900 dark:text-indigo-200"
                      >
                        {board}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono" dir="ltr">{user.phone}</span>
                  </div>
                  {user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono truncate" dir="ltr">{user.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(user)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    title="تعديل بيانات وصلاحيات وراتب الموظف"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setPasswordResetUserId(user.id);
                      setNewPasswordValue('');
                    }}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    title="تغيير كلمة المرور"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  {!isSelf && (
                    <button
                      onClick={() => setDeleteConfirmUser(user)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="حذف الحساب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Quick login switch preview */}
                {!isSelf && (
                  <button
                    onClick={() => setCurrentUser(user)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                    title="دخول فوري بحساب هذا الموظف لمعاينة صلاحيات قسمه"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>دخول كـ {user.name.split(' ')[0]}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="font-bold text-slate-700 dark:text-white">لا يوجد موظفون مطابقون لخيارات البحث</h4>
          <p className="text-xs text-slate-400">جرب تغيير كلمة البحث أو إزالة فلتر التخصص</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        userToEdit={editingUser}
      />

      {/* Quick Password Reset Dialog */}
      {passwordResetUserId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 border border-amber-100 dark:border-amber-800">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white mb-1">تعيين كلمة مرور جديدة</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              أدخل كلمة المرور الجديدة للموظف ({users.find(u => u.id === passwordResetUserId)?.name})
            </p>
            <form onSubmit={handleQuickResetPassword} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={newPasswordValue}
                onChange={e => setNewPasswordValue(e.target.value)}
                placeholder="كلمة المرور الجديدة"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono text-left text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordResetUserId(null);
                    setNewPasswordValue('');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!newPasswordValue.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black shadow-md shadow-indigo-600/30"
                >
                  تحديث كلمة المرور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 border border-rose-100 dark:border-rose-800">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white mb-1">تأكيد حذف حساب الموظف</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف حساب الموظف <strong className="text-slate-900 dark:text-white">{deleteConfirmUser.name}</strong> (اسم الدخول: {deleteConfirmUser.username})؟ سيتم سحب صلاحية تسجيل دخوله للنظام فوراً.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
