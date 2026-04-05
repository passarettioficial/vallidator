'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',       icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )},
  { href: '/calibration',  label: 'Novo diagnóstico', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 4.5V8l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )},
  { href: '/missions',     label: 'Missões',          icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L10.06 5.67L14.5 6.35L11.25 9.52L12.12 14L8 11.83L3.88 14L4.75 9.52L1.5 6.35L5.94 5.67L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )},
  { href: '/rankings',     label: 'Rankings',         icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 13V9M6 13V5M10 13V7M14 13V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )},
  { href: '/failure-bank', label: 'Banco de Casos',   icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 6.5H11M5 9H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )},
  { href: '/settings',     label: 'Configurações',    icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )},
]

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside
      style={{
        width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column',
        paddingTop: 24, paddingBottom: 24,
        borderRight: '0.5px solid rgba(255,255,255,0.06)',
        background: 'rgba(15,15,15,0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, height: '100vh',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: '#F4F4F0' }}>VALLI</span>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: '#FFFD02' }}>DATOR</span>
        </div>
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
          <span style={{ fontSize: 10, color: 'rgba(244,244,240,0.35)', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
            BETA
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 10,
                fontSize: 13, textDecoration: 'none',
                transition: 'all 0.15s',
                background: active ? 'rgba(255,253,2,0.08)' : 'transparent',
                color: active ? '#FFFD02' : 'rgba(244,244,240,0.5)',
                border: active ? '0.5px solid rgba(255,253,2,0.15)' : '0.5px solid transparent',
                fontWeight: active ? 500 : 400,
              }}
            >
              <span style={{ flexShrink: 0, color: active ? '#FFFD02' : 'rgba(244,244,240,0.4)' }}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <span style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: '#FFFD02' }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer hint */}
      <div style={{ padding: '16px 20px 0', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Link
          href="/paywall"
          style={{
            display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
            padding: '8px 10px', borderRadius: 10,
            background: 'rgba(255,253,2,0.05)', border: '0.5px solid rgba(255,253,2,0.12)',
          }}
        >
          <span style={{ fontSize: 14 }}>⚡</span>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#FFFD02', margin: 0, letterSpacing: '0.04em' }}>Upgrade</p>
            <p style={{ fontSize: 10, color: 'rgba(244,244,240,0.4)', margin: 0 }}>Board — R$ 397/mês</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
