'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { DiagnosisResult } from '@/lib/scoreEngine'

const PLANS = [
  {
    id: 'mentor',
    name: 'Mentor',
    price: 'R$ 149',
    period: '/mês',
    badge: null,
    features: [
      'Diagnóstico completo (8 dimensões)',
      'Parecer IA personalizado',
      'Plano de ação 30/60/90 dias',
      'Acesso ao banco de falhas',
      'Missões semanais',
      'Card compartilhável',
    ],
    cta: 'Assinar Mentor',
    ctaStyle: { background: 'rgba(255,255,255,0.08)', color: '#F4F4F0', border: '0.5px solid rgba(255,255,255,0.15)' },
  },
  {
    id: 'board',
    name: 'Board',
    price: 'R$ 397',
    period: '/mês',
    badge: 'MAIS POPULAR',
    features: [
      'Tudo do Mentor',
      'IA com GPT-4o (parecer estendido)',
      'Diagnóstico recorrente (mensal)',
      'Comparação com benchmarks do setor',
      'Ranking completo (top 100)',
      'Export PDF do diagnóstico',
      'E-mail pós-diagnóstico com PDF',
      'Suporte prioritário',
    ],
    cta: 'Assinar Board',
    ctaStyle: { background: '#FFFD02', color: '#0F0F0F' },
  },
  {
    id: 'series_a',
    name: 'Series A',
    price: 'R$ 897',
    period: '/mês',
    badge: 'PARA INVESTIDORES',
    features: [
      'Tudo do Board',
      'Pitch deck review por mentores',
      'Acesso ao network de VCs',
      'Introduções qualificadas',
      'Due diligence preparatório',
      'Sessões de mentoria (2x/mês)',
    ],
    cta: 'Falar com time',
    ctaStyle: { background: 'rgba(167,139,250,0.12)', color: '#A78BFA', border: '0.5px solid rgba(167,139,250,0.25)' },
  },
]

export default function PaywallPage() {
  const router = useRouter()
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [selected, setSelected] = useState('board')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('vallidator-diagnosis')
    if (raw) setDiagnosis(JSON.parse(raw))
  }, [])

  const handleSubscribe = async (planId: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      if (res.ok) {
        const { url } = await res.json()
        if (url) window.location.href = url
        else router.push('/dashboard')
      } else {
        // Sem Stripe configurado — redireciona para dashboard
        router.push('/dashboard')
      }
    } catch {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-obsidian pb-24"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-6"
            style={{ background: 'rgba(255,253,2,0.08)', border: '0.5px solid rgba(255,253,2,0.18)', color: 'rgba(255,253,2,0.8)' }}>
            {diagnosis ? `Score ${diagnosis.overallScore} · ${diagnosis.weakestDimension} é seu maior risco` : 'Diagnóstico concluído'}
          </div>
          <h1 className="font-bold mb-3" style={{ fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Continue a jornada da sua startup
          </h1>
          <p className="text-sm" style={{ color: 'rgba(244,244,240,0.5)', maxWidth: 440, margin: '0 auto' }}>
            O diagnóstico revelou onde focar. Agora você precisa de um plano de ação
            e acompanhamento para executar.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {PLANS.map(plan => (
            <div key={plan.id}
              className="relative rounded-2xl p-5 flex flex-col gap-4 transition-all cursor-pointer glass"
              onClick={() => setSelected(plan.id)}
              style={{ border: `0.5px solid ${selected === plan.id ? 'rgba(255,253,2,0.4)' : 'rgba(255,255,255,0.08)'}`, background: selected === plan.id ? 'rgba(255,253,2,0.03)' : undefined }}>
              {plan.badge && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-semibold font-mono whitespace-nowrap"
                  style={{ background: plan.id === 'board' ? '#FFFD02' : 'rgba(167,139,250,0.2)', color: plan.id === 'board' ? '#0F0F0F' : '#A78BFA', border: plan.id !== 'board' ? '0.5px solid rgba(167,139,250,0.3)' : undefined }}>
                  {plan.badge}
                </div>
              )}
              <div>
                <p className="text-xs font-mono mb-1" style={{ color: 'rgba(244,244,240,0.45)', letterSpacing: '0.08em' }}>{plan.name.toUpperCase()}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-2xl" style={{ letterSpacing: '-0.02em' }}>{plan.price}</span>
                  <span className="text-xs" style={{ color: 'rgba(244,244,240,0.4)' }}>{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.12)' }}>
                      <svg width="7" height="5.5" viewBox="0 0 7 5.5" fill="none"><path d="M1 2.8L2.8 4.6L6 1" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(244,244,240,0.6)' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={e => { e.stopPropagation(); handleSubscribe(plan.id) }} disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                style={plan.ctaStyle as React.CSSProperties}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/dashboard" className="text-xs hover:opacity-70" style={{ color: 'rgba(244,244,240,0.3)' }}>
            Continuar com plano gratuito →
          </Link>
        </div>
      </div>
    </div>
  )
}
