import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { DimensionResult } from '@/lib/scoreEngine'

export default async function DiagnosisPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const dx = await prisma.diagnosis.findUnique({
    where: { id: params.id, userId: session!.user!.id },
  })
  if (!dx) notFound()

  const dims = dx.dimensions as unknown as DimensionResult[]
  const strengths = dims.filter(d => d.score >= 70)
  const risks     = dims.filter(d => d.score < 55)
  const color = dx.overallScore >= 72 ? '#4ADE80' : dx.overallScore >= 50 ? '#FFFD02' : '#FF4D30'

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <Link href="/dashboard" className="flex items-center gap-1.5 text-xs mb-7 hover:opacity-80"
        style={{ color: 'rgba(244,244,240,0.4)' }}>
        ← Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mono mb-4"
          style={{ background: 'rgba(74,222,128,0.08)', border: '0.5px solid rgba(74,222,128,0.2)', color: '#4ADE80' }}>
          Diagnóstico Gênesis · {new Date(dx.completedAt).toLocaleDateString('pt-BR')}
        </div>
        <h1 className="font-bold text-2xl mb-2" style={{ letterSpacing: '-0.02em' }}>Diagnóstico Gênesis</h1>
        <p className="text-sm" style={{ color: 'rgba(244,244,240,0.5)' }}>
          Análise de 8 dimensões baseada nas suas respostas.
        </p>
      </div>

      {/* Score hero */}
      <div className="rounded-2xl p-8 glass flex items-center gap-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(255,253,2,0.3),transparent)' }} />
        {/* Score ring (static version) */}
        <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center shrink-0"
          style={{ border: `4px solid ${color}`, boxShadow: `0 0 24px ${color}40` }}>
          <span className="mono font-bold text-4xl" style={{ color, lineHeight: 1 }}>{dx.overallScore}</span>
          <span className="text-[11px] mono" style={{ color: 'rgba(244,244,240,0.35)' }}>/100</span>
        </div>
        <div className="flex-1">
          <p className="text-xs mono mb-1" style={{ color: 'rgba(244,244,240,0.35)' }}>SCORE GERAL — FASE GÊNESIS</p>
          <h2 className="font-semibold text-xl mb-2">
            {dx.overallScore >= 72 ? 'Fundação sólida' : dx.overallScore >= 50 ? 'Fundação com riscos corrigíveis' : 'Riscos críticos — ação imediata'}
          </h2>
          <p className="text-sm" style={{ color: 'rgba(244,244,240,0.5)' }}>
            Mais forte: <span style={{ color: '#4ADE80' }}>{dx.strongestDim}</span>
            {' '}· Maior risco: <span style={{ color: '#FF4D30' }}>{dx.weakestDim}</span>
          </p>
        </div>
      </div>

      {/* Dimensions */}
      <div className="glass rounded-2xl p-6 mb-6">
        <p className="text-xs mono mb-5" style={{ color: 'rgba(244,244,240,0.35)' }}>8 DIMENSÕES</p>
        <div className="space-y-3">
          {[...dims].sort((a, b) => b.score - a.score).map(d => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-xs w-28 text-right shrink-0" style={{ color: 'rgba(244,244,240,0.5)' }}>{d.label}</span>
              <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.color, boxShadow: `0 0 6px ${d.color}60` }} />
              </div>
              <span className="mono text-xs w-8 text-right shrink-0" style={{ color: d.color }}>{d.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Parecer IA (if available) */}
      {dx.parecerAbertura && (
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span>🧠</span>
            <p className="text-xs mono" style={{ color: 'rgba(255,253,2,0.6)' }}>PARECER IA · {dx.parecerSource}</p>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(244,244,240,0.75)' }}>{dx.parecerAbertura}</p>
          {dx.parecerRisco && (
            <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(255,77,48,0.05)', border: '0.5px solid rgba(255,77,48,0.15)' }}>
              <p className="text-[10px] mono mb-1" style={{ color: 'rgba(255,77,48,0.6)' }}>RISCO</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(244,244,240,0.65)' }}>{dx.parecerRisco}</p>
            </div>
          )}
          {dx.parecerForca && (
            <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(74,222,128,0.05)', border: '0.5px solid rgba(74,222,128,0.15)' }}>
              <p className="text-[10px] mono mb-1" style={{ color: 'rgba(74,222,128,0.6)' }}>FORÇA</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(244,244,240,0.65)' }}>{dx.parecerForca}</p>
            </div>
          )}
          {dx.parecerPasso && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,253,2,0.04)', border: '0.5px solid rgba(255,253,2,0.14)' }}>
              <p className="text-[10px] mono mb-1" style={{ color: 'rgba(255,253,2,0.6)' }}>PRÓXIMO PASSO</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(244,244,240,0.65)' }}>{dx.parecerPasso}</p>
            </div>
          )}
        </div>
      )}

      {/* Pontos fortes e riscos */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-medium mb-3" style={{ color: '#4ADE80' }}>✓ Pontos fortes ({strengths.length})</p>
          {strengths.map(s => (
            <div key={s.label} className="flex items-start gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#4ADE80' }} />
              <p className="text-xs" style={{ color: 'rgba(244,244,240,0.6)' }}>
                <span style={{ color: '#F4F4F0' }}>{s.label}</span> ({s.score}/100) — {s.interpretation}
              </p>
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-medium mb-3" style={{ color: '#FF4D30' }}>⚠ Riscos críticos ({risks.length})</p>
          {risks.map(r => (
            <div key={r.label} className="flex items-start gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#FF4D30' }} />
              <p className="text-xs" style={{ color: 'rgba(244,244,240,0.6)' }}>
                <span style={{ color: '#F4F4F0' }}>{r.label}</span> ({r.score}/100) — {r.interpretation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden"
        style={{ border: '0.5px solid rgba(255,253,2,0.15)' }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(255,253,2,0.35),transparent)' }} />
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold mb-1">Acesso ao diagnóstico completo</p>
            <p className="text-xs" style={{ color: 'rgba(244,244,240,0.5)' }}>
              Plano de ação · Benchmark vs. VCs · Relatório exportável
            </p>
          </div>
          <Link href="/paywall"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 volt-glow shrink-0"
            style={{ background: '#FFFD02', color: '#0F0F0F' }}>
            Ver planos →
          </Link>
        </div>
      </div>
    </div>
  )
}
