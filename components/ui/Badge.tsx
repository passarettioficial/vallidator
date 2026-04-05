import React from 'react'

type BadgeVariant = 'volt' | 'green' | 'red' | 'orange' | 'blue' | 'purple' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'xs' | 'sm'
  dot?: boolean
}

const COLORS: Record<BadgeVariant, { bg: string; border: string; color: string }> = {
  volt:    { bg: 'rgba(255,253,2,0.08)',    border: 'rgba(255,253,2,0.2)',    color: 'rgba(255,253,2,0.85)' },
  green:   { bg: 'rgba(74,222,128,0.08)',   border: 'rgba(74,222,128,0.2)',   color: '#4ADE80' },
  red:     { bg: 'rgba(255,77,48,0.08)',    border: 'rgba(255,77,48,0.2)',    color: '#FF4D30' },
  orange:  { bg: 'rgba(245,166,35,0.08)',   border: 'rgba(245,166,35,0.2)',   color: '#F5A623' },
  blue:    { bg: 'rgba(96,165,250,0.08)',   border: 'rgba(96,165,250,0.2)',   color: '#60A5FA' },
  purple:  { bg: 'rgba(167,139,250,0.08)',  border: 'rgba(167,139,250,0.2)',  color: '#A78BFA' },
  neutral: { bg: 'rgba(255,255,255,0.06)',  border: 'rgba(255,255,255,0.12)', color: 'rgba(244,244,240,0.6)' },
}

const SIZES = {
  xs: { padding: '2px 8px',  fontSize: '10px', gap: 4 },
  sm: { padding: '4px 10px', fontSize: '11px', gap: 5 },
}

export function Badge({ children, variant = 'neutral', size = 'sm', dot }: BadgeProps) {
  const c = COLORS[variant]
  const s = SIZES[size]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: s.gap,
      padding: s.padding, fontSize: s.fontSize, fontFamily: 'monospace',
      letterSpacing: '0.06em', fontWeight: 500, borderRadius: 999,
      background: c.bg, border: `0.5px solid ${c.border}`, color: c.color,
      whiteSpace: 'nowrap',
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, display: 'inline-block' }} />}
      {children}
    </span>
  )
}

/** Converte status do Score Engine → variante do Badge */
export function statusToBadge(status: string): BadgeVariant {
  switch (status) {
    case 'strong':   return 'green'
    case 'moderate': return 'volt'
    case 'risk':     return 'orange'
    case 'critical': return 'red'
    default:         return 'neutral'
  }
}

export function scoreToVariant(score: number): BadgeVariant {
  if (score >= 70) return 'green'
  if (score >= 50) return 'volt'
  if (score >= 35) return 'orange'
  return 'red'
}
