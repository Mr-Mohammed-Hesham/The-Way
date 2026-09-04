import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Plus,
  AlertTriangle,
  Clock,
  Filter,
  CheckCheck,
  Search,
  ExternalLink,
  ShieldAlert,
  CreditCard,
  UserCheck,
  Calendar,
  BookOpen,
  Send,
  X
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { NotificationItem, UserRole } from '../../../types';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
    setActiveTab,
    setSelectedStudentId,
    currentUser,
    addToast
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'high' | 'contracts' | 'sessions' | 'payments'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Notification Form State
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<NotificationItem['type']>('system');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Search
      const matchSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      // Filter
      if (activeFilter === 'unread') return !n.isRead;
      if (activeFilter === 'high') return n.priority === 'high';
      if (activeFilter === 'contracts') return n.type === 'contract_expiring' || n.type === 'low_sessions';
      if (activeFilter === 'sessions') return n.type === 'schedule_conflict' || n.type === 'student_absent';
      if (activeFilter === 'payments') return n.type === 'payment_overdue';
      return true;
    });
  }, [notifications, activeFilter, searchQuery]);

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) {
      addToast({
        type: 'warning',
        title: 'بيانات غير مكتملة',
        message: 'يرجى إدخال عنوان الإشعار وتفاصيل الرسالة'
      });
      return;
    }

    addNotification({
      title: newTitle.trim(),
      message: newMessage.trim(),
      type: newType,
      priority: newPriority,
      isRead: false,
      date: new Date().toISOString().split('T')[0]
    });

    setNewTitle('');
    setNewMessage('');
    setIsAddModalOpen(false);
  };

  const handleNavigateToEntity = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    if (item.relatedEntityType === 'student' && item.relatedEntityId) {
      setActiveTab('students');
      setSelectedStudentId(item.relatedEntityId);
    } else if (item.relatedEntityType === 'contract') {
      setActiveTab('contracts');
    } else if (item.relatedEntityType === 'session') {
      setActiveTab('sessions');
    } else if (item.relatedEntityType === 'payment') {
      setActiveTab('payments');
    }
  };

  const getTypeIcon = (type: NotificationItem['type'], priority: string) => {
    if (priority === 'high' || type === 'schedule_conflict') {
      return <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    }
    switch (type) {
      case 'contract_expiring':
      case 'low_sessions':
        return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'payment_overdue':
        return <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'student_absent':
        return <UserCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                مركز الإشعارات والتنبيهات الذكية
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white animate-pulse">
                    {unreadCount} غير مقروء
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                متابعة انتهاء العقود، الحصص المتبقية، الغياب، التنبيهات المالية والرسائل الإدارية
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500" />
              <span>تعليم الكل كمقروء</span>
            </button>
          )}

          {(currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN) && (
            <>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إرسال تعميم / تنبيه</span>
              </button>

              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من تفريغ وحذف جميع الإشعارات؟')) {
                      clearAllNotifications();
                    }
                  }}
                  className="p-2 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="تفريغ كافة الإشعارات"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `الكل (${notifications.length})` },
            { id: 'unread', label: `غير مقروءة (${unreadCount})` },
            { id: 'high', label: `عالية الأهمية (${highPriorityCount})` },
            { id: 'contracts', label: 'العقود والحصص' },
            { id: 'payments', label: 'المدفوعات' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث في الإشعارات..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-800 dark:text-white mb-1">لا توجد إشعارات حالياً</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            جميع التنبيهات والعقود المجدولة تحت السيطرة. ستظهر التنبيهات التلقائية فور اقتراب موعد انتهاء حصص أو تجديد اشتراك.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(item => {
            const isUnread = !item.isRead;
            return (
              <div
                key={item.id}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isUnread
                    ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`mt-0.5 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.priority === 'high'
                        ? 'bg-rose-100 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800'
                        : item.type === 'contract_expiring' || item.type === 'low_sessions'
                        ? 'bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800'
                        : 'bg-indigo-100 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    {getTypeIcon(item.type, item.priority)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        {item.title}
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block animate-ping" />
                        )}
                      </h4>

                      {item.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                          أولوية قصوى
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                      <span>{item.date}</span>
                      {item.relatedEntityType && (
                        <button
                          onClick={() => handleNavigateToEntity(item)}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>فتح القسم المرتبط</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isUnread ? (
                    <button
                      onClick={() => markNotificationAsRead(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>تعليم كمقروء</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>مقروء</span>
                    </span>
                  )}

                  <button
                    onClick={() => deleteNotification(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                    title="حذف الإشعار"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Notification Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-sm">إرسال تعميم أو تنبيه إداري</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotification} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  عنوان التنبيه: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="مثال: اجتماع طاقم التدريس غداً"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  نص الإشعار / التفاصيل: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  rows={3}
                  placeholder="اكتب نص الرسالة أو التنبيه هنا بالتفصيل..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">النوع:</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="system">إداري عام (System)</option>
                    <option value="contract_expiring">تنبيه اشتراكات</option>
                    <option value="payment_overdue">تنبيه مالي</option>
                    <option value="schedule_conflict">جدول ومواعيد</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">درجة الأهمية:</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="low">منخفضة (عادية)</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية جداً (هام وعاجل)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/30"
                >
                  إرسال التنبيه الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
