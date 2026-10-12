import React from 'react';

interface NSightLogoProps {
  variant?: 'hero' | 'header' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  className?: string;
}

export const NSightLogo: React.FC<NSightLogoProps> = ({
  variant = 'header',
  size = 'md',
  showSlogan = true,
  className = ''
}) => {
  // SVG Vector Isometric 3D Translucent Cube with 3-Axis Coordinate Nodes
  const renderCubeIcon = (iconSize: number = 40) => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-hidden="true"
    >
      <defs>
        {/* Ambient Outer Glow */}
        <filter id="cubeGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Node Glow */}
        <filter id="nodeGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Gradient for Top Face */}
        <linearGradient id="topFaceGrad" x1="40" y1="36" x2="120" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#6366F1" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#C084FC" stopOpacity="0.75" />
        </linearGradient>

        {/* Gradient for Left Face */}
        <linearGradient id="leftFaceGrad" x1="40" y1="76" x2="80" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#2563EB" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.8" />
        </linearGradient>

        {/* Gradient for Right Face */}
        <linearGradient id="rightFaceGrad" x1="80" y1="76" x2="120" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#9333EA" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#C084FC" stopOpacity="0.85" />
        </linearGradient>

        {/* Spherical Gradient for Nodes */}
        <radialGradient id="nodeCyan" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="40%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </radialGradient>

        <radialGradient id="nodeBlue" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="40%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </radialGradient>

        <radialGradient id="nodePurple" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#F5D0FE" />
          <stop offset="40%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7E22CE" />
        </radialGradient>
      </defs>

      {/* Ambient background bloom under the cube */}
      <ellipse cx="80" cy="118" rx="38" ry="14" fill="#38BDF8" opacity="0.22" filter="url(#cubeGlow)" />
      <ellipse cx="80" cy="115" rx="26" ry="10" fill="#818CF8" opacity="0.25" filter="url(#cubeGlow)" />

      {/* 3D Coordinate Axis Lines extending through cube */}
      {/* Top Vertical Axis (Y) */}
      <line x1="80" y1="80" x2="80" y2="24" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      {/* Bottom Left Axis (X) */}
      <line x1="80" y1="80" x2="26" y2="114" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
      {/* Bottom Right Axis (Z) */}
      <line x1="80" y1="80" x2="134" y2="114" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />

      {/* Internal floating data blocks (voxels) */}
      <rect x="74" y="66" width="6" height="6" fill="#BAE6FD" opacity="0.8" rx="1" />
      <rect x="62" y="86" width="5" height="5" fill="#38BDF8" opacity="0.85" rx="1" />
      <rect x="92" y="82" width="6" height="6" fill="#DDD6FE" opacity="0.9" rx="1" />
      <rect x="86" y="98" width="5" height="5" fill="#C084FC" opacity="0.85" rx="1" />
      <rect x="52" y="100" width="5" height="5" fill="#7DD3FC" opacity="0.75" rx="1" />
      <rect x="70" y="104" width="4" height="4" fill="#60A5FA" opacity="0.9" rx="1" />

      {/* External floating mini data fragments */}
      <rect x="28" y="74" width="4" height="4" fill="#38BDF8" opacity="0.55" rx="0.8" />
      <rect x="36" y="62" width="5" height="5" fill="#7DD3FC" opacity="0.45" rx="1" />
      <rect x="122" y="64" width="5" height="5" fill="#E879F9" opacity="0.55" rx="1" />
      <rect x="130" y="80" width="4" height="4" fill="#C084FC" opacity="0.5" rx="0.8" />

      {/* Isometric Cube Faces */}
      {/* Left Face */}
      <polygon
        points="40,54 80,78 80,126 40,102"
        fill="url(#leftFaceGrad)"
        stroke="#E0F2FE"
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />
      {/* Right Face */}
      <polygon
        points="80,78 120,54 120,102 80,126"
        fill="url(#rightFaceGrad)"
        stroke="#F3E8FF"
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />
      {/* Top Face */}
      <polygon
        points="80,30 120,54 80,78 40,54"
        fill="url(#topFaceGrad)"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeOpacity="0.8"
      />

      {/* Internal inner wireframe bevels for true frosted glass depth */}
      <polyline points="40,54 80,78 120,54" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.75" />
      <line x1="80" y1="78" x2="80" y2="126" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.7" />

      {/* Spherical Coordinate Nodes */}
      {/* Top Node (Y) */}
      <circle cx="80" cy="24" r="6.5" fill="url(#nodeBlue)" filter="url(#nodeGlow)" />
      <circle cx="78" cy="22" r="1.8" fill="#FFFFFF" opacity="0.85" />

      {/* Bottom Left Node (X) */}
      <circle cx="26" cy="114" r="6.5" fill="url(#nodeCyan)" filter="url(#nodeGlow)" />
      <circle cx="24" cy="112" r="1.8" fill="#FFFFFF" opacity="0.85" />

      {/* Bottom Right Node (Z) */}
      <circle cx="134" cy="114" r="6.5" fill="url(#nodePurple)" filter="url(#nodeGlow)" />
      <circle cx="132" cy="112" r="1.8" fill="#FFFFFF" opacity="0.85" />
    </svg>
  );

  // Stylized "NSight" Wordmark with Glowing 'i' dot
  const renderWordmark = (textSize: string = 'text-2xl', dotSize: string = 'w-2 h-2') => (
    <span className={`inline-flex items-baseline font-black tracking-tight leading-none ${textSize}`}>
      <span className="text-white drop-shadow-sm">N</span>
      <span className="text-white drop-shadow-sm">S</span>
      <span className="relative inline-block text-white">
        {/* Glowing dot over the 'i' */}
        <span
          className={`absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-tr from-sky-400 via-blue-500 to-purple-400 shadow-md shadow-sky-400/80 animate-pulse ${dotSize}`}
          style={{ animationDuration: '3s' }}
        />
        ı
      </span>
      <span className="text-white drop-shadow-sm">ght</span>
    </span>
  );

  if (variant === 'icon') {
    const iconDim = size === 'sm' ? 28 : size === 'md' ? 38 : size === 'lg' ? 52 : 72;
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderCubeIcon(iconDim)}</div>;
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-lg ${className}`}
      >
        {renderCubeIcon(26)}
        <div className="flex flex-col">
          {renderWordmark('text-sm', 'w-1.5 h-1.5')}
          {showSlogan && (
            <span className="text-[9px] text-slate-400 tracking-wider">뉴스를 입체적으로, 세상을 더 깊이</span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`inline-flex items-center gap-2.5 group ${className}`}>
        {renderCubeIcon(size === 'sm' ? 28 : 34)}
        <div className="flex flex-col justify-center text-left">
          <div className="flex items-center gap-1.5">
            {renderWordmark('text-lg sm:text-xl', 'w-1.5 h-1.5')}
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-sky-300 border border-sky-400/30 tracking-wider uppercase">
              3D
            </span>
          </div>
          {showSlogan && (
            <span className="text-[10px] text-slate-400 tracking-wider hidden sm:inline -mt-0.5 font-medium">
              뉴스를 입체적으로, 세상을 더 깊이
            </span>
          )}
        </div>
      </div>
    );
  }

  // Hero Variant (Full prominent branding lockup)
  return (
    <div className={`flex flex-col items-center text-center group ${className}`}>
      {/* 3D Cube Icon with Ambient Radial Halo */}
      <div className="relative mb-3 flex items-center justify-center">
        {/* Soft glowing ambient disc */}
        <div className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/25 to-purple-500/20 blur-2xl pointer-events-none" />
        <div className="relative z-10 transition-transform duration-500 group-hover:scale-105">
          {renderCubeIcon(size === 'xl' ? 110 : size === 'lg' ? 90 : 76)}
        </div>
      </div>

      {/* Main NSight Wordmark */}
      <div className="relative flex items-center justify-center">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white flex items-baseline justify-center">
          <span>N</span>
          <span>S</span>
          <span className="relative inline-block mx-[1px]">
            {/* Glowing sphere dot on the 'i' */}
            <span
              className="absolute -top-1.5 sm:-top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-tr from-sky-400 via-blue-500 to-purple-400 shadow-lg shadow-sky-400/80 animate-pulse"
              style={{ animationDuration: '2.5s' }}
            />
            ı
          </span>
          <span>ght</span>
        </h1>
      </div>

      {/* Official Slogan */}
      {showSlogan && (
        <p className="mt-2.5 text-xs sm:text-sm text-slate-300 tracking-[0.2em] sm:tracking-[0.28em] font-medium text-center uppercase">
          뉴스를 입체적으로, 세상을 더 깊이
        </p>
      )}
    </div>
  );
};
