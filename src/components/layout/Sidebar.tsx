import React, { useState } from 'react';
import {
  LayoutDashboard,
  Radio,
  GraduationCap,
  Users,
  Calendar,
  CheckSquare,
  Clock,
  UserCheck,
  FileText,
  CreditCard,
  Banknote,
  DoorOpen,
  BookOpen,
  BarChart3,
  Bell,
  ShieldCheck,
  History,
  Settings,
  X,
  Eye,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppSection } from '../../types';
import { TheWayLogo } from '../common/TheWayLogo';
import { InstallAppButton } from '../common/InstallAppPrompt';
import { ConfirmModal } from '../common/ConfirmModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    sessions,
    students,
    notifications,
    currentUser,
    canViewSection,
    canEditSection,
    logout
  } = useApp();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const liveCount = sessions.filter(s => s.status === 'live').length;
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  interface NavItem {
    id: AppSection;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    isLive?: boolean;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: LayoutDashboard
    },
    {
      id: 'live',
      label: 'السنتر الآن (مباشر)',
      icon: Radio,
      badge: liveCount > 0 ? `${liveCount} مباشر` : 'مباشر',
      badgeColor: 'bg-emerald-500 text-white animate-pulse',
      isLive: true
    },
    {
      id: 'students',
      label: 'الطلاب وأولياء الأمور',
      icon: GraduationCap,
      badge: students.length,
      badgeColor: 'bg-slate-800 text-slate-300'
    },
    {
      id: 'sessions',
      label: 'الحصص والجداول',
      icon: Calendar
    },
    {
      id: 'attendance',
      label: 'تسجيل الحضور والغياب',
      icon: CheckSquare
    },
    {
      id: 'teachers',
      label: 'المدرسون والمساعدون',
      icon: Users
    },
    {
      id: 'assignments',
      label: 'تعيين المدرسين',
      icon: UserCheck
    },
    {
      id: 'contracts',
      label: 'العقود والاشتراكات',
      icon: FileText
    },
    {
      id: 'payments',
      label: 'المدفوعات وسندات القبض',
      icon: CreditCard
    },
    {
      id: 'teacher_payments',
      label: 'مستحقات المدرسين',
      icon: Banknote
    },
    {
      id: 'rooms',
      label: 'القاعات والمعامل',
      icon: DoorOpen
    },
    {
      id: 'subjects',
      label: 'المواد والمناهج',
      icon: BookOpen
    },
    {
      id: 'reports',
      label: 'التقارير والإحصائيات',
      icon: BarChart3
    },
    {
      id: 'notifications',
      label: 'الإشعارات والتنبيهات',
      icon: Bell,
      badge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
      badgeColor: 'bg-rose-500 text-white font-bold'
    },
    {
      id: 'audit',
      label: 'سجل العمليات والتدقيق',
      icon: History
    },
    {
      id: 'users',
      label: 'الموظفين والصلاحيات',
      icon: ShieldCheck
    },
    {
      id: 'settings',
      label: 'إعدادات المركز',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Responsive Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#0F172A] text-slate-100 flex flex-col border-l border-slate-800/90 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:h-full lg:shrink-0 lg:shadow-none lg:z-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header with Custom Logo */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-[#0B1120]">
          <TheWayLogo variant="white" size="md" />

          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Employee Info Badge */}
        <div className="mx-3.5 my-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">المستخدم الحالي:</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              قسم: {currentUser.department}
            </span>
          </div>
          <p className="text-white font-bold mt-1 text-xs truncate">{currentUser.name}</p>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-1.5 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {navItems
            .filter(item => canViewSection(item.id))
            .map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isEditable = canEditSection(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30 font-extrabold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-white'
                          : item.isLive
                          ? 'text-emerald-400'
                          : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isEditable && (
                      <span
                        title="مشاهدة فقط - قسم آخر"
                        className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-slate-800 text-amber-300 border border-amber-500/20 flex items-center gap-1"
                      >
                        <Eye className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">مشاهدة</span>
                      </span>
                    )}

                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
        </nav>

        {/* Install App Sidebar Action */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0C1222]">
          <InstallAppButton variant="sidebar" />
        </div>

        {/* Footer Summary / Quick Info & Logout */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#0B1120] text-[11px] text-slate-400 flex items-center justify-between">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 font-bold px-3 py-2 rounded-xl hover:bg-rose-950/40 transition-colors cursor-pointer w-full justify-center border border-rose-900/30"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد من رغبتك في تسجيل الخروج من منظومة The Way Center؟ يمكنك تسجيل الدخول مجدداً في أي وقت."
        confirmLabel="نعم، تسجيل الخروج"
        cancelLabel="إلغاء التراجع"
        type="danger"
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
        }}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};
