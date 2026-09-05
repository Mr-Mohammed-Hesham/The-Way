import React, { useState } from 'react';

export interface TheWayLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero' | 'custom';
  showText?: boolean;
  showSlogan?: boolean;
  variant?: 'light' | 'dark' | 'white' | 'glass';
  animated?: boolean;
  customSizeClass?: string;
}

export const TheWayLogo: React.FC<TheWayLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
  animated = true,
  customSizeClass = ''
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeMap: Record<string, string> = {
    sm: 'h-8 sm:h-9 max-w-[140px]',
    md: 'h-10 sm:h-12 max-w-[180px]',
    lg: 'h-14 sm:h-16 max-w-[240px]',
    xl: 'h-20 sm:h-24 max-w-[300px]',
    '2xl': 'h-24 sm:h-28 max-w-[350px]',
    hero: 'h-28 sm:h-36 md:h-44 max-w-[420px]',
    custom: customSizeClass || 'h-12 max-w-full'
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isWhite = variant === 'white';
  const isDark = variant === 'dark';

  // Base URL resolution for Vite
  const envBase = (import.meta as unknown as { env?: { BASE_URL?: string } })?.env?.BASE_URL;
  const baseUrl = envBase || '/The-Way/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const logoSrc = `${cleanBase}logo.png`;

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${
        animated ? 'transition-transform duration-300 hover:scale-[1.03]' : ''
      } ${
        isWhite || isDark
          ? 'bg-white/95 dark:bg-white/90 p-1.5 rounded-2xl shadow-sm border border-slate-200/50'
          : ''
      } ${className}`}
      dir="rtl"
    >
      {!hasError ? (
        <img
          src={logoSrc}
          alt="The Way Training Center"
          className={`${currentSize} w-auto object-contain rounded-xl`}
          loading="eager"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-[#004D99] font-black text-sm">
          <span>The Way Training Center</span>
        </div>
      )}
    </div>
  );
};
