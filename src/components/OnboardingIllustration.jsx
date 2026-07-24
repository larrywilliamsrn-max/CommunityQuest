import React from 'react'

export default function OnboardingIllustration() {
  return (
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 600 400" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#E6F9F0" />
            <stop offset="100%" stopColor="#F0F8FF" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="600" height="400" rx="12" fill="url(#g1)" />
        <g transform="translate(40,40)">
          <rect x="0" y="0" width="220" height="120" rx="8" fill="#fff" stroke="#E6E9EE" />
          <rect x="0" y="140" width="300" height="36" rx="6" fill="#fff" stroke="#E6E9EE" />
          <circle cx="420" cy="80" r="52" fill="#fff" stroke="#E6E9EE" />
          <path d="M360 220 q40 -60 120 -20" stroke="#D1EAFE" strokeWidth="12" fill="none" strokeLinecap="round" />
          <rect x="340" y="40" width="180" height="28" rx="6" fill="#111827" opacity="0.08" />
        </g>
      </svg>
    </div>
  )
}
