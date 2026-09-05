import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TheWayLogo } from '../common/TheWayLogo';
import { InstallAppButton } from '../common/InstallAppPrompt';

export const LoginView: React.FC = () => {
  const { login } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (!username.trim()) {
    setError('يرجى إدخال اسم المستخدم');
    return;
  }

  if (!password) {
    setError('يرجى إدخال كلمة المرور');
    return;
  }

  setIsLoading(true);

  try {
    const success = await login(
      username.trim(),
      password
    );

    if (!success) {
      setError(
        'بيانات الدخول غير صحيحة. تأكد من اسم المستخدم وكلمة المرور.'
      );
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-[#F8FAFD] via-[#EDF4FC] to-[#E3EEF9] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-800 relative overflow-hidden"
      dir="rtl"
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-blue-300/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-sky-200/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-100/30 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Bar with PWA install & Status */}
      <header className="w-full max-w-5xl z-20 flex items-center justify-between py-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-slate-700">الخادم متصل وجاهز للعمل</span>
        </div>
        <InstallAppButton variant="header" />
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl z-10 space-y-6 my-auto py-4">
        {/* Transparent Brand Logo Presentation - Zero Background */}
        <div className="flex flex-col items-center text-center">
          <div className="relative inline-flex flex-col items-center justify-center p-2">
            <TheWayLogo variant="light" size="hero" animated={true} />
          </div>
        </div>

        {/* Main Grid: Login Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 lg:col-start-4 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/5 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#001F45] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#0080DE]" />
                  <span>تسجيل الدخول للنظام</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  أدخل بيانات الحساب للمتابعة إلى لوحة التحكم
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0070CE]" />
                  <span>اسم المستخدم:</span>
                </label>
                <input
                  type="text"
                 value={username}
onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFD] border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0070CE] transition-all text-left font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#0070CE]" />
                  <span>كلمة المرور (Password):</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8FAFD] border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0070CE] transition-all text-left font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0080DE] via-[#0060BA] to-[#004D99] hover:from-[#0070CE] hover:to-[#013673] active:scale-[0.99] text-white font-black text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>تسجيل الدخول والمتابعة</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl z-10 text-center py-3 text-xs text-slate-500">
        <p>The Way Training Center © 2026 • Your Way To Success • جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};
