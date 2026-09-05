import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Clock,
  Menu,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Eye,
  Sun,
  Moon,
  Sparkles,
  Users,
  UserCheck,
  Edit3,
  FileText,
  User as UserIcon,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatArabicDate } from '../../utils/formatters';
import { UserRole } from '../../types';
import { TheWayLogo } from '../common/TheWayLogo';
import { InstallAppButton } from '../common/InstallAppPrompt';
import { ConfirmModal } from '../common/ConfirmModal';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAddSession: () => void;
  onOpenAddContract?: () => void;
  onOpenAddStudent?: () => void;
  onOpenEditProfile?: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenAddSession,
  onOpenAddContract,
  onOpenAddStudent,
  onOpenEditProfile,
  onToggleSidebar
}) => {
  const {
    settings,
    currentUser,
    setCurrentUser,
    users,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    currentTime,
    setActiveTab,
    sessions,
    logout,
    canEditSection,
    theme,
    toggleTheme,
    cloudSyncStatus,
    syncWithFirebase
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isAdmin =
    currentUser.role === UserRole.SUPER_ADMIN ||
    currentUser.role === UserRole.ADMIN ||
    currentUser.department === 'الإدارة';

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const liveSessionsCount = sessions.filter(
    s => s.status === 'live' || (s.date === todayStr && s.status === 'scheduled')
  ).length;

  const roleBadges: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    [UserRole.ADMIN]: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    [UserRole.MANAGER]: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    [UserRole.RECEPTION]: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    [UserRole.SALES]: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    [UserRole.TEACHER]: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    [UserRole.ACCOUNTANT]: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
  };

  const canAddContract = canEditSection('contracts') || canEditSection('students');
  const canAddSession = canEditSection('sessions');

  const handleContractTrigger = () => {
    if (onOpenAddContract) {
      onOpenAddContract();
    } else if (onOpenAddStudent) {
      onOpenAddStudent();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-amber-400/20 dark:border-slate-800 px-4 lg:px-6 py-3 shadow-xs transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Right side: Mobile Menu Button & Center Title / Live Time */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="hidden sm:block lg:hidden">
              <TheWayLogo size="sm" showSlogan={false} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  {settings.centerName}
                </h1>
                {liveSessionsCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {liveSessionsCount} حصص نشطة
                  </span>
                )}
              </div>

              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{formatArabicDate(todayStr)}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  {currentTime.toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/60 dark:border-amber-800">
                  قسم {currentUser.department}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Global Search Trigger (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-4 py-2 bg-slate-100/90 dark:bg-slate-800 hover:bg-amber-50/50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-amber-300 transition-all group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
              <span>البحث السريع في الطلاب، الحصص، العقود، أو سندات القبض...</span>
            </div>
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-md border border-slate-300 dark:border-slate-600 shadow-2xs">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Left side: Action Buttons, Mobile Search, Theme Toggle, Notifications, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Icon Button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="بحث شامل"
            aria-label="بحث شامل"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Install App Button with animated arrow */}
          <InstallAppButton variant="header" />

          {/* Firebase Cloud Connection Status Pill */}
          <button
            onClick={() => syncWithFirebase()}
            disabled={cloudSyncStatus.isSyncing}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              cloudSyncStatus.isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/70 text-amber-700 dark:text-amber-300'
            }`}
            title={`مشروع Firebase: ${cloudSyncStatus.projectId} | اضغط للمزامنة الفورية`}
          >
            {cloudSyncStatus.isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
            <Cloud className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[11px]">
              {cloudSyncStatus.isSyncing ? 'جاري المزامنة...' : 'Firebase سحابي'}
            </span>
          </button>

          {/* Theme Toggle Button (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-slate-700 border border-amber-300/60 dark:border-slate-700 transition-all cursor-pointer"
            title={theme === 'dark' ? 'تفعيل الوضع النهاري (Light)' : 'تفعيل الوضع الليلي (Dark Mode)'}
            aria-label="تبديل الوضع الليلي والنهاري"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-700" />}
          </button>

          {/* Quick Add Session Button */}
          {canAddSession && (
            <button
              onClick={onOpenAddSession}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-300/70 dark:border-slate-700 transition-all cursor-pointer"
              title="جدولة حصة جديدة"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">جدولة حصة</span>
            </button>
          )}

          {/* Unified Contract / Student Registration Button */}
          {canAddContract && (
            <button
              onClick={handleContractTrigger}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              title="إنشاء عقد اشتراك جديد للطالب"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">عقد اشتراك جديد</span>
            </button>
          )}

          {/* Notifications Dropdown Toggle (Admin Only) */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="الإشعارات والتنبيهات (الإدارة)"
                title="الإشعارات والتنبيهات (الإدارة)"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-right">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-white">التنبيهات والإشعارات (الإدارة)</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full text-[10px] font-bold">
                          {unreadCount} غير مقروء
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
                      >
                        تحديد الكل كمقروء
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                        لا توجد إشعارات جديدة حالياً
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer flex gap-3 items-start ${
                            !notif.isRead ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <div className="mt-0.5">
                            {notif.type === 'danger' && (
                              <AlertTriangle className="w-4 h-4 text-rose-500" />
                            )}
                            {notif.type === 'warning' && (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                            {notif.type === 'success' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                            {notif.type === 'info' && (
                              <Bell className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                              {new Date(notif.timestamp).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowNotifications(false);
                      }}
                      className="text-xs text-amber-700 dark:text-amber-400 font-bold hover:underline"
                    >
                      عرض جميع الإشعارات والسجلات
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile & Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl border border-amber-300/40 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 flex items-center justify-center font-black text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser.name}
                </p>
                <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border mt-0.5 ${roleBadges[currentUser.role]}`}>
                  {currentUser.department}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-right">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{currentUser.email || currentUser.username}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadges[currentUser.role]}`}>
                      الصلاحية: {currentUser.role}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      قسم {currentUser.department}
                    </span>
                  </div>
                </div>

                {/* Edit Profile Action */}
                {onOpenEditProfile && (
                  <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenEditProfile();
                      }}
                      className="w-full text-right p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>تعديل بيانات الحساب وكلمة المرور</span>
                    </button>
                  </div>
                )}

                {/* Quick User / Role Switching */}
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    التبديل السريع بين حسابات الموظفين:
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          currentUser.id === u.id
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-800'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <p className="font-bold leading-tight">{u.name}</p>
                            <p className="text-[10px] text-slate-400">قسم {u.department}</p>
                          </div>
                        </div>
                        {currentUser.id === u.id && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logout */}
                <div className="p-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full text-right p-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج من المنظومة</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد من رغبتك في تسجيل الخروج من منظومة The Way Center؟"
        confirmLabel="نعم، تسجيل الخروج"
        cancelLabel="إلغاء التراجع"
        type="danger"
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
        }}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </header>
  );
};
