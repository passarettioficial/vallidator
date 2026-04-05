'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/* ── Perguntas ─────────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 'problem', type: 'text' as const,
    question: 'Em uma frase, qual problema você resolve?',
    hint: 'Seja específico. Escreva como se explicasse para alguém fora do seu setor.',
    placeholder: 'ex: Ajudo micro-empresas a fechar a contabilidade mensal sem contador presencial.',
    maxLength: 160,
  },
  {
    id: 'validation', type: 'choice' as const,
    question: 'Você já validou isso com pessoas que pagariam?',
    hint: 'Esta é a pergunta mais importante.',
    options: [
      { v: 'paying',  l: 'Tenho clientes pagando',             d: 'Receita recorrente ou pré-venda confirmada',      score: 3 },
      { v: 'signed',  l: 'Tenho cartas de intenção assinadas', d: 'Compromisso formal, ainda sem pagamento',          score: 2 },
      { v: 'talked',  l: 'Conversei com potenciais clientes',  d: 'Feedbacks positivos, sem compromisso financeiro',  score: 0 },
      { v: 'none',    l: 'Ainda não validei',                  d: 'Estou na fase de ideia ou construção',             score: -3 },
    ],
  },
  {
    id: 'competition', type: 'choice' as const,
    question: 'Quem é seu maior concorrente hoje?',
    hint: 'Se você diz que não tem concorrentes, o mercado provavelmente ainda não existe.',
    options: [
      { v: 'product', l: 'Um produto ou empresa específica',   d: 'Concorrente direto identificado e estudado',      score: 2 },
      { v: 'manual',  l: 'Excel, planilha ou processo manual', d: 'Mercado existe, ainda não digitalizado',          score: 1 },
      { v: 'none',    l: 'Nenhum — meu produto é único',       d: 'Atenção: sem concorrência raramente há demanda', score: -1 },
      { v: 'unknown', l: 'Ainda não mapeei',                   d: 'Risco alto: conhecer a concorrência é requisito', score: -2 },
    ],
  },
]

type SignalLevel = 'CRÍTICO' | 'ATENÇÃO' | 'MODERADO' | 'POSITIVO'

function calcSignal(answers: Record<string, string>): { level: SignalLevel; color: string; headline: string; explanation: string; ctaText: string } {
  const vScore = QUESTIONS[1].options?.find(o => o.v === answers['validation'])?.score ?? 0
  const cScore = QUESTIONS[2].options?.find(o => o.v === answers['competition'])?.score ?? 0
  const total  = vScore + cScore
  if (total <= -3) return { level: 'CRÍTICO',  color: '#FF4D30', headline: '3 padrões de risco crítico identificados', explanation: 'Sua startup apresenta os mesmos sinais que antecederam falhas documentadas no banco. Diagnóstico urgente antes de qualquer investimento adicional.', ctaText: 'Diagnóstico urgente — 8 dimensões' }
  if (total <= -1) return { level: 'ATENÇÃO',   color: '#F5A623', headline: '2 áreas críticas identificadas',           explanation: 'Há riscos estruturais no seu estágio atual. O diagnóstico completo vai identificar quais decisões precisam ser revertidas.', ctaText: 'Identificar os riscos agora' }
  if (total <=  2) return { level: 'MODERADO',  color: '#60A5FA', headline: 'Base razoável — há pontos a fortalecer',   explanation: 'Você tem alguns fundamentos no lugar. O diagnóstico vai revelar onde sua vantagem competitiva é mais vulnerável.', ctaText: 'Análise completa das 8 dimensões' }
  return               { level: 'POSITIVO',  color: '#4ADE80', headline: 'Fundação promissora — veja onde fortalecer', explanation: 'Você tem evidências reais. O diagnóstico vai medir a força do seu diferencial e preparar você para o próximo nível.', ctaText: 'Diagnóstico das 8 dimensões' }
}

export default function PreCheckPage() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'q0' | 'q1' | 'q2' | 'result'>('intro')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [textValue, setTextValue] = useState('')

  const qIndex = step === 'q0' ? 0 : step === 'q1' ? 1 : step === 'q2' ? 2 : -1
  const currentQ = qIndex >= 0 ? QUESTIONS[qIndex] : null
  const signal = step === 'result' ? calcSignal(answers) : null

  const handleChoice = (v: string) => {
    const key  = step === 'q1' ? 'validation' : 'competition'
    const next = step === 'q1' ? 'q2' : 'result'
    setAnswers(a => ({ ...a, [key]: v }))
    setTimeout(() => setStep(next), 280)
  }

  return (
    <div className="min-h-screen bg-obsidian" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-baseline">
          <span className="text-sm font-semibold tracking-widest text-field">VALLI</span>
          <span className="text-sm font-semibold tracking-widest text-volt">DATOR</span>
        </Link>
        <Link href="/login" className="text-xs hover:opacity-70" style={{ color: 'rgba(244,244,240,0.4)' }}>
          Já tenho conta →
        </Link>
      </div>

      <div className="max-w-xl mx-auto px-6 py-12 min-h-[calc(100vh-64px)] flex flex-col justify-center">

        {/* INTRO */}
        {step === 'intro' && (
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-8"
              style={{ background: 'rgba(255,253,2,0.08)', border: '0.5px solid rgba(255,253,2,0.18)', color: 'rgba(255,253,2,0.8)' }}>
              Avaliação rápida · 2 minutos
            </div>
            <h1 className="font-bold mb-4" style={{ fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Antes de criar sua conta,<br />
              <span style={{ color: 'rgba(244,244,240,0.4)' }}>veja o sinal da sua startup.</span>
            </h1>
            <p className="text-sm leading-relaxed mb-10" style={{ color: 'rgba(244,244,240,0.5)', maxWidth: 440 }}>
              3 perguntas. Resultado instantâneo. Baseado nos padrões de{' '}
              <span style={{ color: '#F4F4F0' }}>1.000 falhas reais</span>. Sem cadastro.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setStep('q0')}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 shadow-volt"
                style={{ background: '#FFFD02', color: '#0F0F0F' }}>
                Iniciar avaliação rápida →
              </button>
              <Link href="/login" className="text-xs text-center" style={{ color: 'rgba(244,244,240,0.3)' }}>
                Prefiro criar conta e fazer o diagnóstico completo →
              </Link>
            </div>
          </div>
        )}

        {/* TEXTO (q0) */}
        {step === 'q0' && currentQ?.type === 'text' && (
          <div>
            <button onClick={() => setStep('intro')} className="text-xs mb-8 hover:opacity-70" style={{ color: 'rgba(244,244,240,0.4)' }}>
              ← Voltar
            </button>
            <div className="flex gap-2 mb-6">
              {[0,1,2].map(i => <div key={i} className="rounded-full transition-all" style={{ height: 3, width: i === 0 ? 24 : 8, background: i === 0 ? '#FFFD02' : 'rgba(255,255,255,0.12)' }} />)}
              <span className="text-[11px] font-mono ml-1" style={{ color: 'rgba(244,244,240,0.3)' }}>1 / 3</span>
            </div>
            <h2 className="font-semibold mb-2" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>{currentQ.question}</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(244,244,240,0.45)' }}>{currentQ.hint}</p>
            <textarea value={textValue} onChange={e => setTextValue(e.target.value.slice(0, 160))}
              placeholder={currentQ.placeholder} rows={3} autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none glass"
              style={{ border: `0.5px solid ${textValue.length > 10 ? 'rgba(255,253,2,0.3)' : 'rgba(255,255,255,0.1)'}`, color: '#F4F4F0' }} />
            <p className="text-[10px] mt-1 text-right font-mono" style={{ color: 'rgba(244,244,240,0.3)' }}>{textValue.length}/160</p>
            <button onClick={() => { setAnswers(a => ({ ...a, problem: textValue })); setStep('q1') }}
              disabled={textValue.trim().length < 10}
              className="mt-5 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40"
              style={{ background: '#FFFD02', color: '#0F0F0F' }}>
              Próxima pergunta →
            </button>
          </div>
        )}

        {/* CHOICE (q1 / q2) */}
        {(step === 'q1' || step === 'q2') && currentQ?.type === 'choice' && (
          <div>
            <button onClick={() => setStep(step === 'q1' ? 'q0' : 'q1')} className="text-xs mb-8 hover:opacity-70" style={{ color: 'rgba(244,244,240,0.4)' }}>
              ← Voltar
            </button>
            <div className="flex gap-2 mb-6">
              {[0,1,2].map(i => <div key={i} className="rounded-full transition-all" style={{ height: 3, width: i === (step === 'q1' ? 1 : 2) ? 24 : 8, background: i < (step === 'q1' ? 1 : 2) ? '#4ADE80' : i === (step === 'q1' ? 1 : 2) ? '#FFFD02' : 'rgba(255,255,255,0.12)' }} />)}
              <span className="text-[11px] font-mono ml-1" style={{ color: 'rgba(244,244,240,0.3)' }}>{step === 'q1' ? '2' : '3'} / 3</span>
            </div>
            <h2 className="font-semibold mb-2" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>{currentQ.question}</h2>
            <p className="text-sm mb-7" style={{ color: 'rgba(244,244,240,0.45)' }}>{currentQ.hint}</p>
            <div className="space-y-3">
              {currentQ.options?.map(opt => (
                <button key={opt.v} onClick={() => handleChoice(opt.v)}
                  className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all glass hover:opacity-80">
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#F4F4F0' }}>{opt.l}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(244,244,240,0.45)' }}>{opt.d}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === 'result' && signal && (
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-mono mb-6"
              style={{ background: `${signal.color}12`, border: `0.5px solid ${signal.color}35`, color: signal.color }}>
              SINAL {signal.level}
            </div>
            <h2 className="font-bold mb-3" style={{ fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.25 }}>{signal.headline}</h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(244,244,240,0.55)' }}>{signal.explanation}</p>
            <div className="flex flex-col gap-3">
              <Link href="/login"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm hover:opacity-90 shadow-volt"
                style={{ background: '#FFFD02', color: '#0F0F0F' }}>
                {signal.ctaText} →
              </Link>
              <div className="flex items-center justify-center gap-4 text-[11px]" style={{ color: 'rgba(244,244,240,0.3)' }}>
                <span>Gratuito</span><span>·</span><span>30 minutos</span><span>·</span><span>8 dimensões</span>
              </div>
            </div>
            <button onClick={() => { setStep('intro'); setAnswers({}); setTextValue('') }}
              className="mt-8 flex justify-center w-full text-xs hover:opacity-70" style={{ color: 'rgba(244,244,240,0.3)' }}>
              ← Refazer avaliação
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
