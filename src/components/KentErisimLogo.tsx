/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface KentErisimLogoProps {
  className?: string;
  size?: number;
}

export default function KentErisimLogo({ className = 'text-blue-600 dark:text-primary', size = 24 }: KentErisimLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-colors duration-300`}
    >
      {/* Map Pin Background */}
      <path
        d="M12 2C7.58 2 4 5.58 4 10C4 15.25 12 22 12 22C12 22 20 15.25 20 10C20 5.58 16.42 2 12 2Z"
        fill="currentColor"
      />
      
      {/* Wheelchair Accessibility Symbol inside Pin */}
      {/* Head */}
      <circle cx="12" cy="7.2" r="1.1" fill="white" />
      {/* Wheel (3/4 circle for stylized motion overlay) */}
      <path
        d="M11.5 9.5A2 2 0 1 0 13.5 11.5"
        fill="none"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Spine, Seat and Footrest */}
      <path
        d="M12.5 8.5V11.5H14.3L14.8 13.5"
        fill="none"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arm support / forward reach */}
      <path
        d="M11.5 10H13.8"
        fill="none"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
