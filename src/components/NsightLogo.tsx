import React from 'react';

export interface NsightLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'compact' | 'full' | 'image';
  showTagline?: boolean;
}

export const NsightCubeIcon: React.FC<{ sizePx?: number; className?: string }> = ({
  sizePx = 36,
  className = ''
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={sizePx}
      height={sizePx}
      className={`shrink-0 overflow-visible transition-transform ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="cube-glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="cube-glow-purple" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <radialGradient id="cube-base-aura" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#818cf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="cube-top-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.88" />
          <stop offset="50%" stopColor="#818cf8" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.82" />
        </linearGradient>

        <linearGradient id="cube-left-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
        </linearGradient>

        <linearGradient id="cube-right-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#9333ea" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c026d3" stopOpacity="0.7" />
        </linearGradient>

        <linearGradient id="cube-rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#a5f3fc" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e879f9" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Ground Glow Aura */}
      <ellipse cx="50" cy="80" rx="38" ry="14" fill="url(#cube-base-aura)" />

      {/* Axis 1: Top Y-Axis Pin & Sphere */}
      <line
        x1="50"
        y1="21"
        x2="50"
        y2="5"
        stroke="#38bdf8"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="50" cy="5" r="4.2" fill="#38bdf8" filter="url(#cube-glow-cyan)" />
      <circle cx="50" cy="5" r="2.2" fill="#ffffff" />

      {/* Axis 2: Bottom-Left X-Axis Pin & Sphere */}
      <line
        x1="22"
        y1="64"
        x2="8"
        y2="73"
        stroke="#0ea5e9"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="8" cy="73" r="4.2" fill="#0284c7" filter="url(#cube-glow-cyan)" />
      <circle cx="8" cy="73" r="2" fill="#e0f2fe" />

      {/* Axis 3: Bottom-Right Z-Axis Pin & Sphere */}
      <line
        x1="78"
        y1="64"
        x2="92"
        y2="73"
        stroke="#a855f7"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="92" cy="73" r="4.2" fill="#9333ea" filter="url(#cube-glow-purple)" />
      <circle cx="92" cy="73" r="2" fill="#fdf4ff" />

      {/* Isometric Glass Cube Faces */}
      {/* Left Face */}
      <path
        d="M 22 36 L 50 51 L 50 81 L 22 66 Z"
        fill="url(#cube-left-glass)"
        stroke="url(#cube-rim)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      {/* Right Face */}
      <path
        d="M 50 51 L 78 36 L 78 66 L 50 81 Z"
        fill="url(#cube-right-glass)"
        stroke="url(#cube-rim)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      {/* Top Face */}
      <path
        d="M 50 21 L 78 36 L 50 51 L 22 36 Z"
        fill="url(#cube-top-glass)"
        stroke="url(#cube-rim)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      {/* Inner Transparent Guide Lines */}
      <line
        x1="50"
        y1="51"
        x2="50"
        y2="21"
        stroke="#ffffff"
        strokeWidth="0.9"
        strokeOpacity="0.6"
        strokeDasharray="2 2"
      />

      {/* Floating Data Pixels / Voxels Inside Left Face */}
      <rect x="29" y="46" width="3.2" height="3.2" fill="#bae6fd" rx="0.5" />
      <rect x="36" y="41" width="2.4" height="2.4" fill="#38bdf8" rx="0.5" />
      <rect x="33" y="58" width="3.4" height="3.4" fill="#ffffff" rx="0.5" />
      <rect x="42" y="63" width="2.5" height="2.5" fill="#7dd3fc" rx="0.5" />
      <rect x="26" y="55" width="2.2" height="2.2" fill="#0284c7" />

      {/* Floating Data Pixels Inside Right Face */}
      <rect x="57" y="56" width="3.2" height="3.2" fill="#f0abfc" rx="0.5" />
      <rect x="66" y="48" width="2.6" height="2.6" fill="#e879f9" rx="0.5" />
      <rect x="68" y="58" width="3.2" height="3.2" fill="#ffffff" rx="0.5" />
      <rect x="56" y="68" width="2.6" height="2.6" fill="#d946ef" rx="0.5" />

      {/* Floating Outer Particles */}
      <rect x="14" y="43" width="2.2" height="2.2" fill="#38bdf8" opacity="0.8" rx="0.4" />
      <rect x="17" y="53" width="2.4" height="2.4" fill="#7dd3fc" opacity="0.85" rx="0.4" />
      <rect x="80" y="43" width="2.2" height="2.2" fill="#e879f9" opacity="0.8" rx="0.4" />
      <rect x="83" y="53" width="2.4" height="2.4" fill="#d946ef" opacity="0.85" rx="0.4" />
    </svg>
  );
};

export const NsightLogo: React.FC<NsightLogoProps> = ({
  className = '',
  size = 'sm',
  variant = 'compact',
  showTagline = false
}) => {
  const sizeMap = {
    xs: { iconPx: 26, textClass: 'text-sm', tagClass: 'text-[9px]' },
    sm: { iconPx: 34, textClass: 'text-base', tagClass: 'text-[10px]' },
    md: { iconPx: 44, textClass: 'text-xl', tagClass: 'text-xs' },
    lg: { iconPx: 56, textClass: 'text-2xl', tagClass: 'text-xs' },
    xl: { iconPx: 72, textClass: 'text-4xl', tagClass: 'text-sm' }
  };

  const { iconPx, textClass, tagClass } = sizeMap[size];

  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <NsightCubeIcon sizePx={iconPx} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Holographic Isometric Glass Cube Icon with Axis Pins */}
      <NsightCubeIcon sizePx={iconPx} />

      {/* NSight Typography with luminous dot on 'i' */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center tracking-tight leading-none">
          <span className={`font-black font-sans text-white tracking-tight ${textClass}`}>
            NS
          </span>
          {/* Custom 'i' with glowing cyan orb */}
          <span className={`relative inline-flex flex-col items-center mx-[0.5px] ${textClass}`}>
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] mb-[1.5px]"
              style={{
                width: size === 'xs' ? '4px' : size === 'sm' ? '5px' : size === 'md' ? '6.5px' : '8px',
                height: size === 'xs' ? '4px' : size === 'sm' ? '5px' : size === 'md' ? '6.5px' : '8px'
              }}
            />
            <span className={`font-black text-white ${textClass}`}>ı</span>
          </span>
          <span className={`font-black font-sans text-white tracking-tight ${textClass}`}>
            ght
          </span>
        </div>

        {/* Korean Slogan Tagline */}
        {(showTagline || variant === 'full') && (
          <p
            className={`text-slate-400 font-medium tracking-wide mt-1 whitespace-nowrap ${tagClass}`}
          >
            뉴스를 입체적으로, 세상을 더 깊이
          </p>
        )}
      </div>
    </div>
  );
};

export default NsightLogo;
