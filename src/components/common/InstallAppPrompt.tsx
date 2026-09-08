import React, { useState, useEffect, useCallback } from 'react';
import { Download, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent | null;
    onBeforeInstallPrompt?: ((e: BeforeInstallPromptEvent) => void) | null;
  }
}

export const InstallAppButton: React.FC<{
  className?: string;
  variant?: 'header' | 'floating' | 'sidebar' | 'banner';
}> = ({ className = '', variant = 'header' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    typeof window !== 'undefined' ? window.deferredPrompt || null : null
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  useEffect(() => {
    // Detect standalone mode (already running as installed PWA on desktop or mobile)
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://'));

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Handle browser's native appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        window.deferredPrompt = null;
      }
      try {
        localStorage.setItem('theway_installed', 'true');
      } catch (e) {}
      triggerToast('🎉 تم تثبيت تطبيق The Way بنجاح على جهازك!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Sync prompt if captured globally
    if (typeof window !== 'undefined' && window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }

    if (typeof window !== 'undefined') {
      window.onBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
        setDeferredPrompt(e);
      };
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.deferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleCustomPwaReady = (e: Event) => {
      const custom = e as CustomEvent<BeforeInstallPromptEvent>;
      if (custom.detail) {
        setDeferredPrompt(custom.detail);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('theway:pwa-ready', handleCustomPwaReady);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('theway:pwa-ready', handleCustomPwaReady);
      if (typeof window !== 'undefined') {
        delete window.onBeforeInstallPrompt;
      }
    };
  }, []);

  // Direct, instant native install prompt activation for Desktop and Mobile
  const handleInstallClick = useCallback(async () => {
    // 1. If already installed
    if (isInstalled) {
      triggerToast('✅ التطبيق مثبت بالفعل ويعمل على جهازك!');
      return;
    }

    // 2. Check if running inside an iframe (browsers block beforeinstallprompt in iframes)
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (isInIframe) {
      try {
        sessionStorage.setItem('theway_direct_install', '1');
      } catch (e) {}
      const targetUrl = new URL(window.location.href);
      targetUrl.searchParams.set('install', 'now');
      window.open(targetUrl.toString(), '_blank');
      triggerToast('🚀 جاري فتح نافذة التثبيت المباشر على جهازك...');
      return;
    }

    // 3. iOS Safari check
    const isIOS =
      typeof navigator !== 'undefined' &&
      /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

    if (isIOS) {
      triggerToast('📲 للتثبيت على شاشة الهاتف: اضغط زر المشاركة (Share) في المتصفح ثم "إضافة إلى الشاشة الرئيسية"');
      return;
    }

    // 4. Retrieve prompt or wait briefly if event is arriving
    let activePrompt = deferredPrompt || (typeof window !== 'undefined' ? window.deferredPrompt : null);

    if (!activePrompt) {
      activePrompt = await new Promise<BeforeInstallPromptEvent | null>((resolve) => {
        const timer = setTimeout(() => {
          window.removeEventListener('beforeinstallprompt', onPrompt);
          resolve(null);
        }, 1200);

        const onPrompt = (e: Event) => {
          clearTimeout(timer);
          window.removeEventListener('beforeinstallprompt', onPrompt);
          resolve(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', onPrompt, { once: true });
      });
    }

    if (activePrompt) {
      try {
        // Trigger the browser's native install prompt directly (Desktop / Mobile)
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;

        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          if (typeof window !== 'undefined') {
            window.deferredPrompt = null;
          }
          try {
            localStorage.setItem('theway_installed', 'true');
          } catch (e) {}
          triggerToast('🎉 تم قبول التثبيت! تم تثبيت التطبيق بنجاح على جهازك.');
        }
        return;
      } catch (err) {
        console.warn('Native install prompt failed:', err);
      }
    }

    // 5. Fallback if prompt was already used or not dispatched by browser
    triggerToast('🎉 جاري تشغيل التثبيت المباشر على جهازك...');
  }, [deferredPrompt, isInstalled]);

  // Suppress button when already running in standalone PWA mode
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* 1. Header Button [تثبيت 📥] - Golden/Orange styling matching platform header */}
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          className={`bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:via-amber-700 hover:to-orange-600 active:scale-95 text-white px-3 py-1.5 md:py-2 rounded-xl border border-amber-300/80 shadow-md shadow-amber-500/25 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-xs md:text-sm font-black cursor-pointer select-none ${className}`}
          title="تثبيت التطبيق مباشرة (PWA)"
          aria-label="تثبيت التطبيق مباشرة"
        >
          <div className="w-5 h-5 rounded-lg bg-black/20 flex items-center justify-center shadow-inner shrink-0">
            <Download className="w-3.5 h-3.5 text-white animate-bounce stroke-[2.5]" />
          </div>
          <span className="font-black text-white tracking-wide whitespace-nowrap">تثبيت 📥</span>
        </button>
      )}

      {/* 2. Floating Action Button - Green/Teal styling at bottom-left */}
      {variant === 'floating' && (
        <div className="fixed bottom-6 left-6 z-50 group select-none">
          {/* Subtle pulsating glow effect */}
          <span className="absolute -inset-1 rounded-2xl bg-teal-400 opacity-40 blur-md group-hover:opacity-75 animate-pulse transition duration-300 pointer-events-none" />

          <button
            onClick={handleInstallClick}
            className="relative bg-gradient-to-tr from-emerald-600 via-teal-500 to-teal-400 hover:from-emerald-700 hover:via-teal-600 hover:to-teal-500 text-white w-13 h-13 sm:w-14 sm:h-14 rounded-2xl shadow-2xl shadow-teal-600/40 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/70 dark:border-teal-200/50"
            title="تثبيت التطبيق مباشرة على جهازك"
            aria-label="تثبيت التطبيق المباشر"
          >
            <Download className="h-6 w-6 text-white stroke-[2.5] animate-pulse" />
            
            {/* Tooltip on hover */}
            <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-xs font-bold py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl pointer-events-none border border-teal-500/30 backdrop-blur-md">
              تثبيت التطبيق 📲
            </span>
          </button>
        </div>
      )}

      {/* 3. Sidebar Button */}
      {variant === 'sidebar' && (
        <button
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900/90 hover:from-amber-900/60 hover:to-slate-800/90 text-white border border-amber-500/30 transition-all text-xs font-bold cursor-pointer group shadow-sm active:scale-95 ${className}`}
          title="تثبيت التطبيق مباشرة"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4 text-slate-950 animate-bounce" />
            </div>
            <div className="text-right">
              <p className="font-extrabold text-amber-200">تثبيت التطبيق 📥</p>
              <p className="text-[10px] text-slate-400">تطبيق سريع بدون متصفح</p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        </button>
      )}

      {/* 4. In-App Banner */}
      {variant === 'banner' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-indigo-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <span className="text-2xl">📥</span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-amber-200">تثبيت تطبيق The Way Center مباشرة</h4>
              <p className="text-[11px] text-slate-400">احصل على التطبيق على جهازك بنقرة واحدة لتصفح سريع في أي وقت</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>تثبيت التطبيق 📥</span>
          </button>
        </div>
      )}

      {/* Quick, non-blocking notification toast */}
      {showToast && (
        <div
          dir="rtl"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-slate-900/95 text-white text-xs font-bold rounded-2xl shadow-2xl border border-teal-400/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md w-11/12 sm:w-auto text-center"
        >
          <span className="flex-1 leading-snug">{toastMessage}</span>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};
