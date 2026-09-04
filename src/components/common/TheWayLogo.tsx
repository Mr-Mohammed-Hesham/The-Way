import React from 'react';

interface TheWayLogoProps {
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
  showText = true,
  showSlogan = true,
  variant = 'light',
  animated = true,
  customSizeClass = ''
}) => {
  const sizeMap = {
    sm: { icon: 'w-10 h-10', text: 'text-sm sm:text-base', sub: 'text-[9px]' },
    md: { icon: 'w-12 h-12', text: 'text-base sm:text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-16 h-16', text: 'text-lg sm:text-xl', sub: 'text-xs' },
    xl: { icon: 'w-24 h-24', text: 'text-2xl sm:text-3xl', sub: 'text-xs sm:text-sm' },
    '2xl': { icon: 'w-28 h-28 sm:w-32 sm:h-32', text: 'text-3xl sm:text-4xl', sub: 'text-xs sm:text-sm' },
    hero: { icon: 'w-36 h-36 sm:w-44 sm:h-44', text: 'text-3xl sm:text-4xl', sub: 'text-sm sm:text-base' },
    custom: { icon: customSizeClass || 'w-12 h-12', text: 'text-lg', sub: 'text-xs' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isWhite = variant === 'white';
  const isDark = variant === 'dark';

  return (
    <div
      className={`inline-flex items-center gap-3.5 select-none ${
        animated ? 'group cursor-pointer' : ''
      } ${className}`}
      dir="rtl"
    >
      {/* Authentic Vector Logo Emblem without any background */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Clean Logo Icon without any card, box, or background */}
        <div
          className={`relative ${currentSize.icon} flex items-center justify-center transition-transform duration-300 ${
            animated ? 'group-hover:scale-105' : ''
          }`}
        >
          <svg
            viewBox="0 0 760 520"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-sm"
          >
            <defs>
              <linearGradient id="comp-wLeftArm" x1="0%" y1="0%" x2="70%" y2="100%">
                <stop offset="0%" stopColor="#00A2F8" />
                <stop offset="35%" stopColor="#0082E0" />
                <stop offset="100%" stopColor="#0050A0" />
              </linearGradient>

              <linearGradient id="comp-wCenterArm" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0077D6" />
                <stop offset="50%" stopColor="#0052A5" />
                <stop offset="100%" stopColor="#003370" />
              </linearGradient>

              <linearGradient id="comp-wRightArm" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0066C4" />
                <stop offset="45%" stopColor="#004494" />
                <stop offset="100%" stopColor="#012454" />
              </linearGradient>

              <radialGradient id="comp-theSphere" cx="35%" cy="32%" r="65%">
                <stop offset="0%" stopColor="#00A8FF" />
                <stop offset="30%" stopColor="#0077DB" />
                <stop offset="70%" stopColor="#00428B" />
                <stop offset="100%" stopColor="#011F4A" />
              </radialGradient>

              <linearGradient id="comp-swooshGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#006CC7" />
                <stop offset="40%" stopColor="#008AE6" />
                <stop offset="80%" stopColor="#19A0F6" />
                <stop offset="100%" stopColor="#0074CE" />
              </linearGradient>

              <linearGradient id="comp-arrowTopFacet" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#007FDE" />
                <stop offset="100%" stopColor="#28B6FF" />
              </linearGradient>

              <linearGradient id="comp-arrowBottomFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0054A2" />
                <stop offset="100%" stopColor="#01316B" />
              </linearGradient>
            </defs>

            {/* Completely transparent background - NO rect */}
            <g transform="translate(10, 30)">
              {/* MAIN 'W' LETTER */}
              <polygon points="205,120 295,120 360,405 278,405" fill="url(#comp-wLeftArm)" />
              <polygon points="368,120 452,120 495,305 435,405 380,405" fill="url(#comp-wCenterArm)" />
              <polygon points="452,120 615,120 535,405 446,405" fill="url(#comp-wRightArm)" />

              {/* "THE" 3D SPHERE */}
              <circle cx="168" cy="232" r="54" fill="url(#comp-theSphere)" />
              <ellipse cx="152" cy="208" rx="18" ry="11" fill="#FFFFFF" opacity="0.32" transform="rotate(-25 152 208)" />
              <text
                x="168"
                y="244"
                fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
                fontSize="30"
                fontWeight="900"
                fill="#FFFFFF"
                textAnchor="middle"
                letterSpacing="1"
              >
                THE
              </text>

              {/* SWOOP ARC & ARROW */}
              <path
                d="M 100,255 C 106,335 215,365 345,295 C 450,238 550,130 670,30 L 660,20 C 535,125 435,230 335,285 C 215,342 120,315 112,255 Z"
                fill="url(#comp-swooshGrad)"
              />
              <path d="M 335,285 L 670,30 L 664,22 L 330,277 Z" fill="#005CAB" opacity="0.8" />

              {/* 3D Arrowhead */}
              <polygon points="725,-25 640,18 672,66" fill="url(#comp-arrowTopFacet)" />
              <polygon points="725,-25 672,66 660,34" fill="url(#comp-arrowBottomFacet)" />
            </g>
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-right leading-tight justify-center">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight font-sans ${currentSize.text} ${
                isWhite
                  ? 'text-white'
                  : isDark
                  ? 'text-slate-100'
                  : 'text-[#001F45] dark:text-white'
              }`}
            >
              The Way{' '}
              <span className="text-[#0080DE] dark:text-sky-400 font-black">
                Center
              </span>
            </span>
          </div>

          {showSlogan && (
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`font-bold tracking-wide ${currentSize.sub} ${
                  isWhite
                    ? 'text-sky-200'
                    : isDark
                    ? 'text-sky-400'
                    : 'text-[#004D99] dark:text-sky-300'
                }`}
              >
                Your Way To Success
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">•</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                The Way Training Center
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
