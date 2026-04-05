import React from 'react'

type Variant = 'primary' | 'ghost' | 'danger' | 'outline'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

const VARIANTS: Record<Variant, React.CSSProperties> = {
  primary: { background: '#FFFD02', color: '#0F0F0F', fontWeight: 600 },
  ghost:   { background: 'rgba(255,255,255,0.06)', color: 'rgba(244,244,240,0.7)', border: '0.5px solid rgba(255,255,255,0.1)' },
  danger:  { background: 'rgba(255,77,48,0.1)', color: '#FF4D30', border: '0.5px solid rgba(255,77,48,0.25)' },
  outline: { background: 'transparent', color: '#F4F4F0', border: '0.5px solid rgba(255,255,255,0.2)' },
}

const SIZES: Record<Size, { padding: string; fontSize: string; borderRadius: string }> = {
  sm: { padding: '6px 14px',  fontSize: '12px', borderRadius: '10px' },
  md: { padding: '10px 24px', fontSize: '14px', borderRadius: '12px' },
  lg: { padding: '14px 32px', fontSize: '14px', borderRadius: '14px' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const v = VARIANTS[variant]
  const s = SIZES[size]
  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: s.padding, fontSize: s.fontSize, borderRadius: s.borderRadius,
        fontWeight: 500, cursor: 'pointer', width: fullWidth ? '100%' : undefined,
        transition: 'opacity 0.15s', opacity: (disabled || loading) ? 0.45 : 1,
        boxShadow: variant === 'primary' ? '0 0 20px rgba(255,253,2,0.25)' : undefined,
        ...v, ...style,
      }}
      {...props}
    >
      {loading && (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10"/>
        </svg>
      )}
      {children}
    </button>
  )
}
