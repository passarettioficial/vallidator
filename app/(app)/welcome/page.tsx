'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function WelcomePage() {
  const router = useRouter()
  const [meta, setMeta] = useState<{ name: string } | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('startup_meta')
    if (raw) setMeta(JSON.parse(raw))
  }, [])

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div className="w-full max-w-md text-center">

        {/* Logo */}
        <div className="flex justify-center mb-16">
          <span className="text-sm font-semibold tracking-widest text-field">VALLI</span>
          <span className="text-sm font-semibold tracking-widest text-volt">DATOR</span>
        </div>

        {/* Hero */}
        <div className="mb-6">
          <p className="text-sm font-mono mb-4" style={{ color: 'rgba(255,253,2,0.7)', letterSpacing: '0.1em' }}>
            BEM-VINDO
          </p>
          <h1 className="font-bold mb-4" style={{ fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {meta?.name ? (
              <>Pronto para diagnosticar <br /><span style={{ color: 'rgba(244,244,240,0.5)' }}>{meta.name}</span>?</>
            ) : (
              <>Pronto para o <br /><span style={{ color: 'rgba(244,244,240,0.5)' }}>diagnóstico completo</span>?</>
            )}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,244,240,0.45)', maxWidth: 380, margin: '0 auto' }}>
            Você vai responder <strong style={{ color: '#F4F4F0' }}>27 perguntas</strong> baseadas nos critérios de
            avaliação dos principais fundos de capital de risco do Brasil.
            O processo leva <strong style={{ color: '#F4F4F0' }}>15–20 minutos</strong>.
          </p>
        </div>

        {/* Dimensões */}
        <div className="glass rounded-2xl p-6 mb-8 text-left" style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-mono mb-4" style={{ color: 'rgba(244,244,240,0.4)', letterSpacing: '0.08em' }}>
            8 DIMENSÕES AVALIADAS
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {['Problema & Mercado', 'Solução & Produto', 'Tração & Evidências', 'Modelo de Negócio',
              'Equipe & Fundadores', 'Competição & Vantagem', 'Estratégia & Visão', 'Execução & Riscos'].map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,253,2,0.5)' }} />
                <span className="text-xs" style={{ color: 'rgba(244,244,240,0.6)' }}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/form"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm hover:opacity-90 shadow-volt"
            style={{ background: '#FFFD02', color: '#0F0F0F' }}>
            Iniciar diagnóstico →
          </Link>
          <Link href="/dashboard"
            className="text-xs" style={{ color: 'rgba(244,244,240,0.3)' }}>
            Ir para o Dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
