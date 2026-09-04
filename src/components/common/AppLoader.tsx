import React from 'react';
import { TheWayLogo } from './TheWayLogo';

interface AppLoaderProps {
  message?: string;
  subMessage?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  message = 'The Way Training Center',
  subMessage = 'جاري تحضير المنظومة والبيانات...'
}) => {
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#F8FAFD] via-[#EEF4FB] to-[#E3EEF9] dark:from-[#080D1A] dark:via-[#0B1224] dark:to-[#0F172A] p-6 select-none transition-colors duration-300"
    >
      {/* Soft Ambient Radial Lights */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-sky-400/15 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Loader Card */}
      <div className="relative z-10 flex flex-col items-center p-8 sm:p-10 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-blue-100/80 dark:border-slate-800 shadow-2xl shadow-blue-950/10 max-w-sm w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Animated Logo with Ripple Effect */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-500/20 to-sky-400/20 blur-lg animate-ping opacity-60 pointer-events-none" />
          <TheWayLogo variant="light" size="xl" showText={false} showSlogan={false} animated={true} />
        </div>

        {/* Text Header */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-[#001F45] dark:text-white tracking-tight">
            {message}
          </h3>
          <p className="text-xs font-bold text-[#0070CE] dark:text-sky-400">
            Your Way To Success
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1">
            {subMessage}
          </p>
        </div>

        {/* Animated Custom Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
          <div className="h-full bg-gradient-to-r from-[#00A2F8] via-[#0070CE] to-[#004D99] rounded-full animate-[progress_1.8s_ease-in-out_infinite] w-2/3" />
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#004D99] dark:text-sky-300 text-[10px] font-bold border border-blue-200/70 dark:border-blue-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>المنظومة السحابية متصلة وآمنة</span>
        </div>
      </div>
    </div>
  );
};
