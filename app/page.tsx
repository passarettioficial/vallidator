import Link from 'next/link'

export const metadata = {
  title: 'VALLIDATOR — Diagnóstico honesto para startups',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-obsidian dot-grid">
      {/* NavBar */}
      <nav className="sticky top-0 z-40 px-6 py-3 flex items-center justify-between"
        style={{ background: 'rgba(15,15,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-baseline">
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', color: '#F4F4F0' }}>VALLI</span>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', color: '#FFFD02' }}>DATOR</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pre-check" className="text-xs hover:opacity-80" style={{ color: 'rgba(244,244,240,0.5)' }}>
            Pré-diagnóstico
          </Link>
          <Link href="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: '#FFFD02', color: '#0F0F0F' }}>
            Entrar →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[160px] pointer-events-none"
          style={{ background: 'rgba(255,253,2,0.06)' }} />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mono mb-8"
          style={{ background: 'rgba(255,77,48,0.10)', border: '0.5px solid rgba(255,77,48,0.25)', color: '#FF4D30' }}>
          ⚠ 1.000 casos de falhas reais documentados
        </div>

        <h1 className="font-bold mb-6 mx-auto"
          style={{ fontSize: 'clamp(32px,5vw,58px)', letterSpacing: '-0.03em', lineHeight: 1.1, maxWidth: 720 }}>
          Descubra onde sua startup<br />
          <span style={{ color: '#FFFD02' }}>vai falhar</span>
          <span style={{ color: 'rgba(244,244,240,0.35)' }}> — antes de falhar.</span>
        </h1>

        <p className="text-base leading-relaxed mb-10 mx-auto"
          style={{ color: 'rgba(244,244,240,0.55)', maxWidth: 520 }}>
          Diagnóstico honesto em 8 dimensões, baseado nos padrões que antecederam{' '}
          <strong style={{ color: '#F4F4F0' }}>$140B+ em capital destruído</strong>.
          Sem eufemismos. Sem coach.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link href="/pre-check"
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm transition-all hover:opacity-90 volt-glow"
            style={{ background: '#FFFD02', color: '#0F0F0F', minWidth: 240 }}>
            Pré-diagnóstico em 2 min →
          </Link>
          <Link href="/login"
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-sm transition-all hover:opacity-80 glass">
            Diagnóstico completo — grátis
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {[
            { v: '1.000+', l: 'casos documentados' },
            { v: '$140B+', l: 'capital destruído' },
            { v: '8', l: 'dimensões avaliadas' },
            { v: '2 min', l: 'para o primeiro sinal' },
          ].map(s => (
            <div key={s.v} className="text-center">
              <p className="mono font-bold text-lg" style={{ color: '#FFFD02' }}>{s.v}</p>
              <p className="text-[11px]" style={{ color: 'rgba(244,244,240,0.4)' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: '📚', color: '#FF4D30', title: 'Banco de 1.000 falhas', items: ['Casos reais documentados', 'Filtros por dimensão e setor', 'Lições de cada falha', '$140B+ analisados'] },
            { icon: '🎯', color: '#FFFD02', title: 'Score em 8 dimensões', items: ['Problema · Mercado · Solução', 'Diferenciação · Tração · Time', 'Modelo · Validação', 'Benchmark vs. critérios de VCs'] },
            { icon: '⚡', color: '#4ADE80', title: 'Plano de ação', items: ['Parecer com GPT-4o', 'Missões priorizadas', 'Card compartilhável', 'Email com resumo'] },
          ].map(f => (
            <div key={f.title} className="rounded-2xl p-6 glass relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg,transparent,${f.color}30,transparent)` }} />
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-sm mb-4" style={{ color: '#F4F4F0' }}>{f.title}</h3>
              <ul className="space-y-2">
                {f.items.map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full shrink-0" style={{ background: f.color }} />
                    <span className="text-xs" style={{ color: 'rgba(244,244,240,0.55)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(22px,3vw,36px)', letterSpacing: '-0.02em' }}>
          Pronto para saber a verdade?
        </h2>
        <p className="text-sm mb-8" style={{ color: 'rgba(244,244,240,0.5)' }}>
          2 minutos. Sem cadastro. Resultado imediato.
        </p>
        <Link href="/pre-check"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-sm volt-glow hover:opacity-90 transition-all"
          style={{ background: '#FFFD02', color: '#0F0F0F' }}>
          Ver o sinal da minha startup →
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8" style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-baseline">
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em' }}>VALLI</span>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', color: '#FFFD02' }}>DATOR</span>
          </div>
          <p className="text-[11px]" style={{ color: 'rgba(244,244,240,0.3)' }}>
            Diagnóstico baseado em 1.000 casos reais · Sem eufemismos
          </p>
          <div className="flex gap-4 text-[11px]" style={{ color: 'rgba(244,244,240,0.35)' }}>
            <Link href="/pre-check" className="hover:opacity-80">Pré-diagnóstico</Link>
            <Link href="/login" className="hover:opacity-80">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
