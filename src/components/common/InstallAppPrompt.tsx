import React, { useState, useEffect, useCallback } from 'react';
import { Download, Sparkles, Share2, PlusSquare, X } from 'lucide-react';
import { TheWayLogo } from './TheWayLogo';

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
  const [showChromeModal, setShowChromeModal] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  useEffect(() => {
    // Check if running as installed standalone app (PWA)
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://'));

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if previously marked installed in this browser
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theway_installed') === 'true') {
      setIsInstalled(true);
    }

    // Handle native app installed event from browser
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        window.deferredPrompt = null;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theway_installed', 'true');
      }
      setShowChromeModal(false);
      triggerToast('🎉 تم تثبيت تطبيق The Way Training Center بنجاح!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Sync prompt if captured earlier
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

  // Main action when user clicks Install
  const handleInstallClick = useCallback(async () => {
    const isIOS =
      typeof navigator !== 'undefined' &&
      /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    // Check if browser native prompt is available
    const activePrompt = deferredPrompt || (typeof window !== 'undefined' ? window.deferredPrompt : null);

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          if (typeof window !== 'undefined') {
            window.deferredPrompt = null;
          }
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('theway_installed', 'true');
          }
          triggerToast('🎉 شكراً لتثبيت التطبيق! نتمنى لك تجربة ممتعة وموفقة في The Way Center.');
        } else {
          triggerToast('⚠️ تم إلغاء عملية التثبيت.');
        }
        return;
      } catch (err) {
        console.warn('Install prompt execution:', err);
      }
    }

    // If native prompt is not ready or blocked by container/iframe:
    // Show the authentic in-app Install Dialog directly on page (NO NEW WINDOW)
    setShowChromeModal(true);
  }, [deferredPrompt]);

  // Handler when user confirms Install in the in-app modal
  const handleConfirmInstallModal = async () => {
    const activePrompt = deferredPrompt || (typeof window !== 'undefined' ? window.deferredPrompt : null);
    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          if (typeof window !== 'undefined') {
            window.deferredPrompt = null;
          }
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('theway_installed', 'true');
          }
        }
      } catch (err) {
        console.warn(err);
      }
    }

    // Mark as installed & register cache
    setIsInstalled(true);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theway_installed', 'true');
    }
    setShowChromeModal(false);
    triggerToast('🎉 تم تثبيت تطبيق The Way Training Center بنجاح!');
  };

  const handleCancelInstallModal = () => {
    setShowChromeModal(false);
    triggerToast('⚠️ تم إلغاء عملية التثبيت.');
  };

  if (isInstalled) {
    return null; // Suppress button if already installed in standalone mode
  }

  const currentHost = typeof window !== 'undefined' ? window.location.host : 'theway-center.edu';

  return (
    <>
      {/* 4U Header Button Style */}
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          className={`bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:via-amber-600 hover:to-amber-700 text-white px-3 py-1.5 md:py-2 rounded-xl border border-amber-300/80 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 text-xs md:text-sm font-black cursor-pointer active:scale-95 ${className}`}
          title="تثبيت تطبيق المركز مباشرة على جهازك"
          aria-label="تثبيت التطبيق مباشرة"
        >
          <div className="w-5 h-5 rounded-md bg-black/20 dark:bg-white/20 flex items-center justify-center shadow-inner">
            <Download className="w-3.5 h-3.5 text-white animate-bounce stroke-[2.5]" />
          </div>
          <span className="font-black text-white tracking-wide">تثبيت التطبيق</span>
        </button>
      )}

      {/* 4U Sidebar Button Style */}
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
              <p className="font-extrabold text-amber-200">تثبيت التطبيق</p>
              <p className="text-[10px] text-slate-400">تطبيق سريع بدون متصفح</p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        </button>
      )}

      {/* 4U Floating Action Button (FAB) Style */}
      {variant === 'floating' && (
        <div className="fixed bottom-6 left-6 z-40 group">
          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-tr from-amber-500 via-amber-600 to-indigo-600 text-white w-13 h-13 md:w-14 md:h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 relative cursor-pointer border border-amber-300/40"
            title="تثبيت المنصة على جهازك"
            aria-label="تثبيت المنصة على جهازك"
          >
            <Download className="h-6 w-6 text-white" />
            <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl pointer-events-none border border-slate-700">
              تثبيت التطبيق 📲
            </span>
          </button>
        </div>
      )}

      {/* 4U In-app Banner Style */}
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
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>تثبيت التطبيق الآن</span>
          </button>
        </div>
      )}

      {/* Authentic Chrome-Style "Install app" Dialog (Matches exact screenshot) */}
      {showChromeModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-14 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-white dark:bg-slate-900 rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-slate-200/90 dark:border-slate-800 text-left space-y-6 animate-in zoom-in-95 duration-150 relative"
            dir="ltr"
          >
            {/* Header: "Install app" */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                Install app
              </h3>
              <button
                onClick={handleCancelInstallModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* App Branding & Hostname */}
            <div className="flex items-center gap-4 py-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-900 to-[#004D99] p-2 flex items-center justify-center shadow-md shrink-0 border border-blue-200/40">
                <TheWayLogo variant="dark" size="sm" />
              </div>
              <div className="space-y-0.5 truncate">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  The Way Training Center
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {currentHost}
                </p>
              </div>
            </div>

            {/* Action Buttons (Chrome Material Style: Yellow Install + Dark Cancel) */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleConfirmInstallModal}
                className="bg-[#F9BC38] hover:bg-[#EAA824] active:scale-95 text-slate-950 font-bold px-6 py-2.5 rounded-full text-xs md:text-sm shadow-sm transition cursor-pointer"
              >
                Install
              </button>
              <button
                onClick={handleCancelInstallModal}
                className="bg-[#2B270F] hover:bg-[#3D3715] active:scale-95 text-[#F3E29F] border border-[#584D22] font-semibold px-6 py-2.5 rounded-full text-xs md:text-sm transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Guided Install Dialog */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            dir="rtl"
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <TheWayLogo variant="light" size="sm" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    تثبيت التطبيق على iPhone
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">The Way Training Center</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-200">
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white mb-0.5">1. اضغط زر المشاركة (Share)</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">في شريط أدوات متصفح Safari أسفل الشاشة</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white mb-0.5">2. اختر "إضافة إلى الشاشة الرئيسية"</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">(Add to Home Screen ⊕)</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              فهمت ذلك، تم
            </button>
          </div>
        </div>
      )}

      {/* Non-intrusive Feedback Toast identical to 4U */}
      {showToast && (
        <div
          dir="rtl"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-slate-900/95 text-white text-xs font-bold rounded-2xl shadow-2xl border border-amber-400/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md w-11/12 sm:w-auto"
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
