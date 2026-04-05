import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  highlight?: boolean    // borda volt
  danger?: boolean       // borda vermelha
  padding?: 'sm' | 'md' | 'lg'
}

const PADDING = { sm: '12px', md: '16px', lg: '24px' }

export function Card({ children, className, style, onClick, highlight, danger, padding = 'md' }: CardProps) {
  const border = highlight
    ? '0.5px solid rgba(255,253,2,0.3)'
    : danger
    ? '0.5px solid rgba(255,77,48,0.2)'
    : '0.5px solid rgba(255,255,255,0.08)'

  const bg = highlight
    ? 'rgba(255,253,2,0.03)'
    : danger
    ? 'rgba(255,77,48,0.04)'
    : 'rgba(255,255,255,0.04)'

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        borderRadius: 16,
        border,
        background: bg,
        backdropFilter: 'blur(12px)',
        padding: PADDING[padding],
        cursor: onClick ? 'pointer' : undefined,
        transition: 'opacity 0.15s',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
