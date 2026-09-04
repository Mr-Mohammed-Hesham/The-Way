import React, { useState } from 'react';
import {
  Settings,
  Building,
  Users,
  Database,
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  Lock,
  UserCheck,
  Cloud,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../common/Modal';
import { ConfirmModal } from '../../common/ConfirmModal';
import { UserRole } from '../../../types';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    users,
    currentUser,
    setCurrentUser,
    exportData,
    importData,
    resetData,
    addToast,
    cloudSyncStatus,
    syncWithFirebase
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'backup'>('general');
  const [formSettings, setFormSettings] = useState(settings);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    addToast({
      title: 'تم حفظ الإعدادات بنجاح',
      message: 'تم تطبيق الإعدادات العامة لمركز التعليم',
      type: 'success'
    });
  };

  const handleExportBackup = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `educenter_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      title: 'تم تصدير النسخة الاحتياطية',
      message: 'تم حفظ كافة بيانات المركز في ملف JSON',
      type: 'success'
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        addToast({
          title: 'تمت استعادة البيانات بنجاح ✓',
          message: 'تم تحديث كافة السجلات من النسخة الاحتياطية',
          type: 'success'
        });
      } else {
        addToast({
          title: 'فشل استيراد الملف',
          message: 'الملف المرفوع غير صالح أو تالف',
          type: 'error'
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            الإعدادات العامة وإدارة المستخدمين
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            بيانات المركز، الحسابات والصلاحيات، والنسخ الاحتياطي لقاعدة البيانات
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all ${
            activeTab === 'general'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>بيانات وهوية المركز</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>المستخدمين والصلاحيات ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all ${
            activeTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>النسخ الاحتياطي وإدارة البيانات</span>
        </button>
      </div>

      {/* Tab: General Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5 text-xs">
          <h3 className="font-black text-sm text-slate-900">المعلومات الأساسية للمركز التعليمي</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المركز التعليمي</label>
              <input
                type="text"
                value={formSettings.centerName}
                onChange={e => setFormSettings({ ...formSettings, centerName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم هاتف المركز / الواتساب</label>
              <input
                type="text"
                value={formSettings.phone}
                onChange={e => setFormSettings({ ...formSettings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                value={formSettings.email}
                onChange={e => setFormSettings({ ...formSettings, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">العنوان والموقع الجغرافي</label>
              <input
                type="text"
                value={formSettings.address}
                onChange={e => setFormSettings({ ...formSettings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">رمز العملة (Currency)</label>
              <input
                type="text"
                value={formSettings.currency}
                onChange={e => setFormSettings({ ...formSettings, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ساعات العمل اليومية</label>
              <input
                type="text"
                value={formSettings.workingHours}
                onChange={e => setFormSettings({ ...formSettings, workingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Users & Roles */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-slate-900">طاقم إدارة النظام والمستخدمين</h3>
              <p className="text-slate-500 mt-0.5">تبديل الأدوار وتجربة الصلاحيات المختلفة في النظام</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.map(u => {
              const isCurrent = currentUser.id === u.id;
              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{u.name}</h4>
                        <p className="text-slate-400 font-mono text-[11px]">{u.email}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900">
                      {u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN
                        ? 'مدير عام'
                        : u.role === UserRole.RECEPTION
                        ? 'استقبال'
                        : u.role === UserRole.TEACHER
                        ? 'مدرس'
                        : 'محاسب'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-400">
                      {isCurrent ? 'الحساب النشط حالياً' : 'انقر للتبديل لهذا الحساب'}
                    </span>
                    {!isCurrent && (
                      <button
                        onClick={() => setCurrentUser(u)}
                        className="px-3 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 rounded-xl font-bold transition-all"
                      >
                        تسجيل الدخول كـ {u.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Backup & Reset */}
      {activeTab === 'backup' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-xs">
          {/* Firebase Cloud Firestore Integration Card */}
          <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    قاعدة بيانات Firebase السحابية (Firestore)
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      متصل ونشط
                    </span>
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    البيانات مربوطة ومحفوظة سحابياً على مشروع Firebase الخاص بك مع المزامنة اللحظية
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => syncWithFirebase()}
                disabled={cloudSyncStatus.isSyncing}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncStatus.isSyncing ? 'animate-spin' : ''}`} />
                <span>{cloudSyncStatus.isSyncing ? 'جاري المزامنة السحابية...' : 'مزامنة السنتر مع Firebase الآن'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-500/10">
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-amber-500/10">
                <span className="text-slate-400 text-[10px] block">معرف المشروع (Project ID)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {cloudSyncStatus.projectId}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-amber-500/10">
                <span className="text-slate-400 text-[10px] block">قاعدة بيانات Firestore (Database)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {cloudSyncStatus.databaseId}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-amber-500/10">
                <span className="text-slate-400 text-[10px] block">حالة المزامنة اللحظية</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  مفعلة وتعمل بالخلفية
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="font-black text-sm text-slate-900">تصدير واستعادة البيانات (Local Data Backup)</h3>
            <p className="text-slate-500">
              يتم حفظ كافة البيانات محلياً في المتصفح. يمكنك تصدير ملف JSON للاحتفاظ بنسخة احتياطية أو استعادتها على أي جهاز آخر.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-600" />
                تصدير نسخة احتياطية كاملة
              </h4>
              <p className="text-slate-500 text-[11px]">
                تحميل ملف يحتوي على كافة الطلاب، المدرسين، الحصص، العقود، والمدفوعات
              </p>
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                تنزيل ملف النسخة الاحتياطية (JSON)
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                استعادة البيانات من ملف سابق
              </h4>
              <p className="text-slate-500 text-[11px]">
                رفع ملف النسخة الاحتياطية (JSON) لتحديث كافة بيانات النظام
              </p>
              <label className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center">
                <span>اختيار ملف والاستعادة</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset To Demo Data */}
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
            <h4 className="font-bold text-rose-950 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              إعادة ضبط النظام إلى البيانات التجريبية الأولية
            </h4>
            <p className="text-rose-800 text-[11px]">
              سيؤدي هذا الإجراء إلى مسح كافة التعديلات واستعادة بيانات العرض التجريبية الافتراضية
            </p>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              إعادة ضبط المصنع
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetData();
          setIsResetConfirmOpen(false);
        }}
        title="تأكيد إعادة الضبط إلى البيانات التجريبية"
        message="هل أنت متأكد من رغبتك في إعادة ضبط النظام ومسح التعديلات؟"
        confirmText="نعم، إعادة الضبط"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
};
