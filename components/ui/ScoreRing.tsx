'use client'
import React from 'react'

interface ScoreRingProps {
  score: number          // 0–100
  size?: number          // px, default 128
  strokeWidth?: number   // default 6
  color?: string         // default auto por score
  label?: string         // texto abaixo do número
  animate?: boolean      // animar entrada
}

function scoreColor(score: number): string {
  if (score >= 70) return '#4ADE80'
  if (score >= 50) return '#FFFD02'
  if (score >= 35) return '#F5A623'
  return '#FF4D30'
}

export function ScoreRing({
  score,
  size = 128,
  strokeWidth = 6,
  color,
  label,
  animate = true,
}: ScoreRingProps) {
  const r       = (size - strokeWidth * 2) / 2
  const circ    = 2 * Math.PI * r
  const offset  = circ * (1 - score / 100)
  const c       = color ?? scoreColor(score)
  const center  = size / 2

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={center} cy={center} r={r}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} />
        {/* Progress */}
        <circle cx={center} cy={center} r={r}
          fill="none" stroke={c} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={animate ? { transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)' } : undefined}
        />
      </svg>
      {/* Center text */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: c }}>
          {score}
        </span>
        {label && (
          <span style={{ fontSize: size * 0.09, color: 'rgba(244,244,240,0.4)', marginTop: 2, letterSpacing: '0.04em' }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
