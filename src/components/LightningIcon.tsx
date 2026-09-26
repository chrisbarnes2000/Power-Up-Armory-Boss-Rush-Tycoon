import React from 'react';

interface LightningIconProps {
  className?: string;
  size?: number | string;
}

/**
 * Custom High-Impact Amber Lightning Bolt Icon (SVG)
 * Engineered with bold angular proportions, outer neon glow, dual-tone golden gradient fill,
 * and high aspect ratio footprint so that it perfectly matches the optical presence of 🏆.
 */
export function LightningIcon({ className = "w-5 h-5 inline-block", size }: LightningIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <defs>
        {/* Bolt gradient: bright electric yellow down into rich energetic amber */}
        <linearGradient id="boltGrad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF7A1" />
          <stop offset="35%" stopColor="#FFD233" />
          <stop offset="75%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Ambient subtle glow filter */}
        <filter id="boltGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#F59E0B" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Bold wide lightning bolt body with sharp electrical contours */}
      <path
        d="M13.5 2L5 12.5H12L10.5 22L19 11.5H12L13.5 2Z"
        fill="url(#boltGrad)"
        stroke="#92400E"
        strokeWidth="0.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#boltGlow)"
      />

      {/* Specular inner highlight beam */}
      <path
        d="M13 3.5L6.8 11.5H11.5L10.8 17"
        stroke="#FFFFFF"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

export default LightningIcon;
