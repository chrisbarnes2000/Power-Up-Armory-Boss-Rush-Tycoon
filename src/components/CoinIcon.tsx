import React from 'react';

interface CoinIconProps {
  className?: string;
  size?: number | string;
}

/**
 * Custom High-Resolution Metallic Gold Coin Icon (SVG)
 * Provides crisp visual clarity with realistic gold bevels, rim ridge, and inner star emblem.
 */
export function CoinIcon({ className = "w-4 h-4 inline-block", size }: CoinIconProps) {
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
        {/* Outer gold rim gradient */}
        <linearGradient id="coinGoldRim" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF2A3" />
          <stop offset="35%" stopColor="#F5B300" />
          <stop offset="70%" stopColor="#D98A00" />
          <stop offset="100%" stopColor="#8C5300" />
        </linearGradient>

        {/* Inner face gradient */}
        <radialGradient id="coinGoldFace" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFFA8A" />
          <stop offset="45%" stopColor="#FFC926" />
          <stop offset="85%" stopColor="#E08E00" />
          <stop offset="100%" stopColor="#B36500" />
        </radialGradient>

        {/* Inner ridge inset */}
        <linearGradient id="coinRidge" x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE066" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7A4500" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Base outer coin border & drop depth */}
      <circle cx="12" cy="12" r="10" fill="url(#coinGoldRim)" stroke="#5E3600" strokeWidth="0.8" />

      {/* Inner sunken coin face */}
      <circle cx="12" cy="12" r="8.2" fill="url(#coinGoldFace)" />

      {/* Raised circular ridge line */}
      <circle cx="12" cy="12" r="6.8" stroke="url(#coinRidge)" strokeWidth="0.7" strokeDasharray="1.4 0.9" fill="none" opacity="0.85" />

      {/* Center engraved coin star motif */}
      <path
        d="M12 6.8L13.3 10.2L17 10.5L14.2 12.8L15.1 16.4L12 14.5L8.9 16.4L9.8 12.8L7 10.5L10.7 10.2L12 6.8Z"
        fill="#FFE875"
        stroke="#8A4E00"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />

      {/* Top light reflection highlight */}
      <path
        d="M6 7.5C7.5 5.5 9.5 4.5 12 4.5C13.5 4.5 15 5 16.5 6"
        stroke="#FFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

export default CoinIcon;
