import React from 'react';

export default function WinZoneLogo({ className = '', size = 'md' }) {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-lg' },
    md: { container: 'w-12 h-12', text: 'text-2xl' },
    lg: { container: 'w-16 h-16', text: 'text-3xl' },
    xl: { container: 'w-20 h-20', text: 'text-4xl' },
  };

  const sizeClasses = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Ticket Icon with Star */}
      <div className={`${sizeClasses.container} relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 60 40"
          className="w-full h-full drop-shadow-lg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ticket shape with rounded corners and cutouts */}
          <path
            d="M5 8C5 6.34315 6.34315 5 8 5H52C53.6569 5 55 6.34315 55 8V32C55 33.6569 53.6569 35 52 35H8C6.34315 35 5 33.6569 5 32V8Z"
            fill="#FF6B35"
            className="drop-shadow-md"
          />
          {/* Left semi-circle cutout */}
          <circle cx="5" cy="20" r="3" fill="#1a0b2e" />
          {/* Right semi-circle cutout */}
          <circle cx="55" cy="20" r="3" fill="#1a0b2e" />
          {/* Star in center */}
          <path
            d="M30 12L32.5 20L40 20L33.75 25L36.25 33L30 28L23.75 33L26.25 25L20 20L27.5 20L30 12Z"
            fill="#1a0b2e"
          />
        </svg>
      </div>
      {/* WinZone Text */}
      <div className="flex items-baseline">
        <span className={`${sizeClasses.text} font-bold text-orange-500`}>Win</span>
        <span className={`${sizeClasses.text} font-bold text-white`}>Zone</span>
      </div>
    </div>
  );
}

