import React from 'react'

interface DimensionBarProps {
  label: string
  score: number         // 0–100
  color?: string        // override auto
  showScore?: boolean   // default true
  interpretation?: string
  compact?: boolean
}

function autoColor(score: number): string {
  if (score >= 70) return '#4ADE80'
  if (score >= 50) return '#FFFD02'
  if (score >= 35) return '#F5A623'
  return '#FF4D30'
}

export function DimensionBar({
  label,
  score,
  color,
  showScore = true,
  interpretation,
  compact = false,
}: DimensionBarProps) {
  const c = color ?? autoColor(score)
  return (
    <div style={{ marginBottom: compact ? 8 : 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: compact ? 11 : 12, color: 'rgba(244,244,240,0.7)' }}>{label}</span>
        {showScore && (
          <span style={{ fontSize: compact ? 11 : 12, fontWeight: 600, fontFamily: 'monospace', color: c }}>{score}</span>
        )}
      </div>
      {/* Track */}
      <div style={{ height: compact ? 3 : 4, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          width: `${score}%`,
          background: c,
          transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
      {interpretation && !compact && (
        <p style={{ fontSize: 11, marginTop: 4, color: 'rgba(244,244,240,0.4)', lineHeight: 1.4 }}>{interpretation}</p>
      )}
    </div>
  )
}
