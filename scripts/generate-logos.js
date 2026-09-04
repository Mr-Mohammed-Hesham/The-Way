import fs from 'fs';
import sharp from 'sharp';

// 1. Transparent Full Logo SVG (Emblem + Text)
const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540" width="900" height="540">
  <defs>
    <!-- Gradients for W -->
    <linearGradient id="wLeftArm" x1="0%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#00A2F8" />
      <stop offset="35%" stop-color="#0082E0" />
      <stop offset="100%" stop-color="#0050A0" />
    </linearGradient>

    <linearGradient id="wCenterArm" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0077D6" />
      <stop offset="50%" stop-color="#0052A5" />
      <stop offset="100%" stop-color="#003370" />
    </linearGradient>

    <linearGradient id="wRightArm" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0066C4" />
      <stop offset="45%" stop-color="#004494" />
      <stop offset="100%" stop-color="#012454" />
    </linearGradient>

    <!-- THE Sphere Gradient -->
    <radialGradient id="theSphere" cx="35%" cy="32%" r="65%">
      <stop offset="0%" stop-color="#00A8FF" />
      <stop offset="30%" stop-color="#0077DB" />
      <stop offset="70%" stop-color="#00428B" />
      <stop offset="100%" stop-color="#011F4A" />
    </radialGradient>

    <!-- Swoosh Arc Gradient -->
    <linearGradient id="swooshGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#006CC7" />
      <stop offset="40%" stop-color="#008AE6" />
      <stop offset="80%" stop-color="#19A0F6" />
      <stop offset="100%" stop-color="#0074CE" />
    </linearGradient>

    <!-- Arrow Top Facet (Light Sky Blue) -->
    <linearGradient id="arrowTopFacet" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#007FDE" />
      <stop offset="100%" stop-color="#28B6FF" />
    </linearGradient>

    <!-- Arrow Bottom Facet (Deep Royal Shade) -->
    <linearGradient id="arrowBottomFacet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0054A2" />
      <stop offset="100%" stop-color="#01316B" />
    </linearGradient>

    <!-- Drop Shadows -->
    <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#002D62" flood-opacity="0.22" />
    </filter>

    <filter id="arrowShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="3" dy="6" stdDeviation="5" flood-color="#002048" flood-opacity="0.28" />
    </filter>
  </defs>

  <!-- NO BACKGROUND RECTANGLE - COMPLETELY TRANSPARENT -->

  <g transform="translate(60, -10)">
    <!-- 1. MAIN 'W' LETTER -->
    <!-- Left Leg -->
    <polygon points="205,120 295,120 360,405 278,405" fill="url(#wLeftArm)" filter="url(#softShadow)" />

    <!-- Center Left & Peak -->
    <polygon points="368,120 452,120 495,305 435,405 380,405" fill="url(#wCenterArm)" filter="url(#softShadow)" />

    <!-- Right Leg -->
    <polygon points="452,120 615,120 535,405 446,405" fill="url(#wRightArm)" filter="url(#softShadow)" />

    <!-- 2. "THE" 3D SPHERE BADGE -->
    <g filter="url(#softShadow)">
      <circle cx="168" cy="232" r="54" fill="url(#theSphere)" />
      <!-- Top-left subtle specular highlight -->
      <ellipse cx="152" cy="208" rx="18" ry="11" fill="#FFFFFF" opacity="0.32" transform="rotate(-25 152 208)" />
      <!-- Text 'THE' -->
      <text x="168" y="244" font-family="'Plus Jakarta Sans', 'Montserrat', Arial, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">THE</text>
    </g>

    <!-- 3. SWEEPING SWOOSH & 3D ARROW -->
    <!-- Curved Arc sweeping from under 'THE' below the W -->
    <path d="M 100,255 C 106,335 215,365 345,295 C 450,238 550,130 670,30 L 660,20 C 535,125 435,230 335,285 C 215,342 120,315 112,255 Z" fill="url(#swooshGrad)" filter="url(#softShadow)" />

    <!-- Inner guide ridge -->
    <path d="M 335,285 L 670,30 L 664,22 L 330,277 Z" fill="#005CAB" opacity="0.8" />

    <!-- 3D Arrowhead at top-right -->
    <g filter="url(#arrowShadow)">
      <!-- Upper Wing -->
      <polygon points="725,-25 640,18 672,66" fill="url(#arrowTopFacet)" />
      <!-- Lower Wing -->
      <polygon points="725,-25 672,66 660,34" fill="url(#arrowBottomFacet)" />
    </g>

    <!-- 4. OFFICIAL TYPOGRAPHY UNDERNEATH -->
    <text x="410" y="458" font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="28" font-weight="900" fill="#0B2545" text-anchor="middle" letter-spacing="0.2">The Way Training Center</text>
    <text x="410" y="494" font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="21" font-weight="800" fill="#0B2545" text-anchor="middle" letter-spacing="0.8">Your Way To Success</text>
  </g>
</svg>`;

// 2. Transparent Icon-only / Favicon SVG (Mark only, tightly centered in square)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="favWLeft" x1="0%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#00A2F8" />
      <stop offset="35%" stop-color="#0082E0" />
      <stop offset="100%" stop-color="#0050A0" />
    </linearGradient>

    <linearGradient id="favWCenter" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0077D6" />
      <stop offset="50%" stop-color="#0052A5" />
      <stop offset="100%" stop-color="#003370" />
    </linearGradient>

    <linearGradient id="favWRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0066C4" />
      <stop offset="45%" stop-color="#004494" />
      <stop offset="100%" stop-color="#012454" />
    </linearGradient>

    <radialGradient id="favSphere" cx="35%" cy="32%" r="65%">
      <stop offset="0%" stop-color="#00A8FF" />
      <stop offset="30%" stop-color="#0077DB" />
      <stop offset="70%" stop-color="#00428B" />
      <stop offset="100%" stop-color="#011F4A" />
    </radialGradient>

    <linearGradient id="favSwoosh" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#006CC7" />
      <stop offset="40%" stop-color="#008AE6" />
      <stop offset="80%" stop-color="#19A0F6" />
      <stop offset="100%" stop-color="#0074CE" />
    </linearGradient>

    <linearGradient id="favArrowTop" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#007FDE" />
      <stop offset="100%" stop-color="#28B6FF" />
    </linearGradient>

    <linearGradient id="favArrowBottom" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0054A2" />
      <stop offset="100%" stop-color="#01316B" />
    </linearGradient>

    <filter id="favShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#002D62" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- NO BACKGROUND - 100% TRANSPARENT -->
  <g transform="translate(25, 45) scale(0.68)">
    <!-- Main W -->
    <polygon points="205,120 295,120 360,405 278,405" fill="url(#favWLeft)" filter="url(#favShadow)" />
    <polygon points="368,120 452,120 495,305 435,405 380,405" fill="url(#favWCenter)" filter="url(#favShadow)" />
    <polygon points="452,120 615,120 535,405 446,405" fill="url(#favWRight)" filter="url(#favShadow)" />

    <!-- THE Sphere -->
    <g filter="url(#favShadow)">
      <circle cx="168" cy="232" r="54" fill="url(#favSphere)" />
      <ellipse cx="152" cy="208" rx="18" ry="11" fill="#FFFFFF" opacity="0.32" transform="rotate(-25 152 208)" />
      <text x="168" y="244" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="30" font-weight="900" fill="#FFFFFF" text-anchor="middle">THE</text>
    </g>

    <!-- Swoosh Arc -->
    <path d="M 100,255 C 106,335 215,365 345,295 C 450,238 550,130 670,30 L 660,20 C 535,125 435,230 335,285 C 215,342 120,315 112,255 Z" fill="url(#favSwoosh)" filter="url(#favShadow)" />
    <path d="M 335,285 L 670,30 L 664,22 L 330,277 Z" fill="#005CAB" opacity="0.8" />

    <!-- Arrowhead -->
    <polygon points="725,-25 640,18 672,66" fill="url(#favArrowTop)" />
    <polygon points="725,-25 672,66 660,34" fill="url(#favArrowBottom)" />
  </g>
</svg>`;

async function main() {
  fs.writeFileSync('public/logo.svg', fullLogoSvg);
  fs.writeFileSync('public/favicon.svg', faviconSvg);
  console.log('Saved SVG files.');

  // Render PNGs with transparent background
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile('public/favicon.png');

  await sharp(Buffer.from(faviconSvg))
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  await sharp(Buffer.from(faviconSvg))
    .resize(192, 192)
    .png()
    .toFile('public/icon-192.png');

  await sharp(Buffer.from(faviconSvg))
    .resize(512, 512)
    .png()
    .toFile('public/icon-512.png');

  await sharp(Buffer.from(fullLogoSvg))
    .resize(900, 540)
    .png()
    .toFile('public/logo.png');

  console.log('All transparent PNG icons generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
