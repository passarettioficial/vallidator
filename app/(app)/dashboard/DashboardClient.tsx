'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { DimensionBar } from '@/components/ui/DimensionBar'
import { Card } from '@/components/ui/Card'
import { Badge, scoreToVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ShareCardModal } from '@/components/ShareCardModal'
import type { DiagnosisResult } from '@/lib/scoreEngine'

interface DashboardClientProps {
  userName: string
  plan: string
  xp: number
  serverDx: {
    id: string
    overallScore: number
    weakestDim: string
    strongestDim: string
    completedAt: string
    phase: string
  } | null
}

export function DashboardClient({ userName, plan, xp, serverDx }: DashboardClientProps) {
  const [localDx, setLocalDx]     = useState<DiagnosisResult | null>(null)
  const [startupName, setName]    = useState<string>('')
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('vallidator-diagnosis')
    if (raw) setLocalDx(JSON.parse(raw))
    const meta = localStorage.getItem('startup_meta')
    if (meta) setName(JSON.parse(meta)?.name ?? '')
  }, [])

  // Usa dado do servidor se disponível, senão usa localStorage
  const hasDx   = !!serverDx || !!localDx
  const score   = serverDx?.overallScore ?? localDx?.overallScore ?? 0
  const weak    = serverDx?.weakestDim   ?? localDx?.weakestDimension ?? '—'
  const strong  = serverDx?.strongestDim ?? localDx?.strongestDimension ?? '—'
  const phase   = serverDx?.phase        ?? localDx?.phase ?? 'Gênesis'
  const date    = serverDx
    ? new Date(serverDx.completedAt).toLocaleDateString('pt-BR')
    : localDx
    ? new Date(localDx.completedAt).toLocaleDateString('pt-BR')
    : ''

  const dims = localDx?.dimensions ?? []

  const headline = score >= 72
    ? 'Fundação sólida — prepare para a próxima fase'
    : score >= 50
    ? 'Fundação com riscos corrigíveis'
    : 'Riscos críticos — ação imediata necessária'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, color: 'rgba(244,244,240,0.35)', fontFamily: 'monospace', letterSpacing: '0.06em', marginBottom: 4 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px', color: '#F4F4F0' }}>
          Olá, {userName || 'Founder'} 👋
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge variant={plan === 'board' || plan === 'series_a' ? 'green' : 'volt'} size="xs">
            {plan.toUpperCase()}
          </Badge>
          <span style={{ fontSize: 11, color: 'rgba(244,244,240,0.4)' }}>{xp.toLocaleString('pt-BR')} XP</span>
          {startupName && (
            <>
              <span style={{ color: 'rgba(244,244,240,0.2)', fontSize: 11 }}>·</span>
              <span style={{ fontSize: 11, color: 'rgba(244,244,240,0.5)' }}>{startupName}</span>
            </>
          )}
        </div>
      </div>

      {hasDx ? (
        <>
          {/* Score hero */}
          <Card highlight style={{ marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
            {/* gradient line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,253,2,0.4),transparent)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {/* Ring */}
              <ScoreRing score={score} size={112} label="/100" animate />

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Badge variant={scoreToVariant(score)} size="xs" dot>
                    {score >= 72 ? 'SÉRIE A READY' : score >= 60 ? 'SEED READY' : score >= 40 ? 'PRE-SEED' : 'PRÉ-INVESTIMENTO'}
                  </Badge>
                  <span style={{ fontSize: 10, color: 'rgba(244,244,240,0.35)', fontFamily: 'monospace' }}>{phase} · {date}</span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#F4F4F0', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{headline}</p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 9, color: 'rgba(74,222,128,0.6)', fontFamily: 'monospace', letterSpacing: '0.08em', margin: '0 0 2px' }}>PONTO FORTE</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#4ADE80', margin: 0 }}>{strong}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 9, color: 'rgba(255,77,48,0.6)', fontFamily: 'monospace', letterSpacing: '0.08em', margin: '0 0 2px' }}>MAIOR RISCO</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#FF4D30', margin: 0 }}>{weak}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                {serverDx ? (
                  <Link href={`/diagnosis/${serverDx.id}`}
                    style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: '#FFFD02', color: '#0F0F0F', textDecoration: 'none', textAlign: 'center', boxShadow: '0 0 16px rgba(255,253,2,0.25)' }}>
                    Ver completo →
                  </Link>
                ) : null}
                <button
                  onClick={() => setShowShare(true)}
                  style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(244,244,240,0.7)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
                  🔗 Compartilhar
                </button>
              </div>
            </div>
          </Card>

          {/* Dimensões */}
          {dims.length > 0 && (
            <Card style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(244,244,240,0.4)', letterSpacing: '0.08em', marginBottom: 14 }}>8 DIMENSÕES</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                {dims.map(d => (
                  <DimensionBar key={d.label} label={d.label} score={d.score} color={d.color} compact />
                ))}
              </div>
            </Card>
          )}

          {/* Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { href: '/missions',      icon: '⚡', label: 'Missões',        sub: `${dims.filter(d => d.score < 50).length} prioridades` },
              { href: '/failure-bank',  icon: '📚', label: 'Banco de casos', sub: `Relacionado: ${weak}` },
              { href: '/rankings',      icon: '🏆', label: 'Rankings',       sub: 'Sua posição' },
              { href: '/calibration',   icon: '◎',  label: 'Novo diag.',     sub: 'Refazer agora' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
                <Card style={{ textAlign: 'center', cursor: 'pointer', transition: 'opacity 0.15s' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{a.icon}</div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#F4F4F0', margin: '0 0 2px' }}>{a.label}</p>
                  <p style={{ fontSize: 10, color: 'rgba(244,244,240,0.4)', margin: 0 }}>{a.sub}</p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      ) : (
        /* Estado vazio */
        <Card style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧭</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em', color: '#F4F4F0' }}>
            Sem diagnóstico ainda
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(244,244,240,0.45)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
            Complete a Fase Gênesis para receber seu score em 8 dimensões, baseado nos critérios de VCs reais.
          </p>
          <Link href="/calibration" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">
              ✨ Iniciar diagnóstico — 20 min
            </Button>
          </Link>
        </Card>
      )}

      {/* Share modal */}
      {showShare && localDx && (
        <ShareCardModal
          diagnosis={localDx}
          startupName={startupName}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
