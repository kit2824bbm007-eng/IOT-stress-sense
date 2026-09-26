import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const StressSenseLogo: React.FC<LogoProps> = ({ size = 26, className = '' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Medical Red Heart Shape */}
        <path
          d="M16 28.5C16 28.5 3 20.5 3 11.5C3 6.8 6.8 3 11.5 3C14.2 3 16 4.6 16 4.6C16 4.6 17.8 3 20.5 3C25.2 3 29 6.8 29 11.5C29 20.5 16 28.5 16 28.5Z"
          fill="#FF4D5A"
        />
        {/* White ECG Waveform Trace passing through heart */}
        <path
          d="M6 13.5H10.5L12 11.5L14 17.5L17 7.5L19.5 18L21 12.5L22.5 14.5H26"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default StressSenseLogo;
