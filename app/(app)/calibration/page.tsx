'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CALIBRATION_QUESTIONS = [
  {
    id: 'stage',
    q: 'Em que estágio sua startup está agora?',
    hint: 'Seja honesto — o diagnóstico é mais preciso com respostas reais.',
    opts: [
      { v: 'idea',     l: 'Ideia',       d: 'Concepção — validando hipóteses iniciais' },
      { v: 'validate', l: 'Validação',   d: 'Testando com primeiros usuários ou entrevistas' },
      { v: 'building', l: 'Construindo', d: 'MVP em desenvolvimento ou beta fechado' },
      { v: 'launched', l: 'Lançado',     d: 'Produto no ar, buscando primeiros clientes' },
      { v: 'traction', l: 'Tração',      d: 'Clientes pagando, crescimento inicial confirmado' },
      { v: 'scaling',  l: 'Escalando',   d: 'Crescimento consistente, otimizando canais' },
    ],
  },
  {
    id: 'model',
    q: 'Qual é o modelo de negócio principal?',
    hint: 'Se tiver dúvida, escolha o que melhor descreve quem paga você.',
    opts: [
      { v: 'b2b',        l: 'B2B SaaS',       d: 'Empresas pagam assinatura recorrente' },
      { v: 'b2c',        l: 'B2C',             d: 'Consumidores finais pagam' },
      { v: 'marketplace',l: 'Marketplace',     d: 'Plataforma que conecta dois lados' },
      { v: 'ecommerce',  l: 'E-commerce',      d: 'Venda direta de produtos' },
      { v: 'deeptech',   l: 'Deep Tech / IP',  d: 'Licenciamento de tecnologia proprietária' },
      { v: 'undefined',  l: 'Ainda definindo', d: 'Modelo de monetização em construção' },
    ],
  },
  {
    id: 'background',
    q: 'Qual é o seu perfil como fundador?',
    hint: 'O histórico impacta significativamente a avaliação de investidores.',
    opts: [
      { v: 'first',   l: 'Primeira startup',  d: 'Nenhuma experiência prévia como fundador' },
      { v: 'failed',  l: 'Já falhei antes',   d: 'Startup anterior não deu certo — aprendi com isso' },
      { v: 'success', l: 'Já fiz exit',        d: 'Startup anterior foi adquirida ou teve IPO' },
      { v: 'mentor',  l: 'Mentoria prévia',    d: 'Fui mentorado em aceleradoras ou programas' },
    ],
  },
  {
    id: 'priority',
    q: 'Qual área você quer que o diagnóstico priorize?',
    hint: 'Todas as 8 dimensões serão avaliadas, mas esta recebe destaque especial.',
    opts: [
      { v: 'identity', l: 'Proposta de valor', d: 'Clareza do problema e solução' },
      { v: 'market',   l: 'Mercado',           d: 'Tamanho, segmentação e entrada' },
      { v: 'product',  l: 'Produto',           d: 'Desenvolvimento e diferenciação' },
      { v: 'traction', l: 'Tração',            d: 'Validação comercial e métricas' },
      { v: 'finance',  l: 'Financeiro',        d: 'Runway, modelo de receita e burn' },
      { v: 'team',     l: 'Time',              d: 'Composição, habilidades e gaps' },
    ],
  },
  {
    id: 'goal',
    q: 'Qual é seu objetivo com este diagnóstico?',
    hint: 'A perspectiva muda como interpretamos seus dados.',
    opts: [
      { v: 'viability', l: 'Saber se é viável',       d: 'Quero um julgamento honesto antes de investir mais' },
      { v: 'mistakes',  l: 'Encontrar os erros',       d: 'Sei que tem falhas — quero identificar quais' },
      { v: 'plan',      l: 'Ter um plano de ação',     d: 'Quero saber o que fazer nos próximos 90 dias' },
      { v: 'investors', l: 'Preparar para investidores',d: 'Estou buscando rodada e quero estar pronto' },
    ],
  },
]

export default function CalibrationPage() {
  const router = useRouter()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const q = CALIBRATION_QUESTIONS[currentQ]
  const progress = ((currentQ + 1) / CALIBRATION_QUESTIONS.length) * 100

  const handleChoice = (v: string) => {
    const newAnswers = { ...answers, [q.id]: v }
    setAnswers(newAnswers)
    setTimeout(() => {
      if (currentQ < CALIBRATION_QUESTIONS.length - 1) {
        setCurrentQ(i => i + 1)
      } else {
        localStorage.setItem('vallidator-calibration-answers', JSON.stringify(newAnswers))
        router.push('/form')
      }
    }, 280)
  }

  return (
    <div className="min-h-screen bg-obsidian"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: '#FFFD02' }} />
      </div>

      <div className="max-w-xl mx-auto px-6 py-16 min-h-screen flex flex-col justify-center">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => currentQ > 0 ? setCurrentQ(i => i - 1) : router.push('/welcome')}
            className="text-xs hover:opacity-70" style={{ color: 'rgba(244,244,240,0.4)' }}>
            ← Voltar
          </button>
          <span className="text-[11px] font-mono" style={{ color: 'rgba(244,244,240,0.3)' }}>
            {currentQ + 1} / {CALIBRATION_QUESTIONS.length}
          </span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-6 w-fit"
          style={{ background: 'rgba(255,253,2,0.08)', border: '0.5px solid rgba(255,253,2,0.18)', color: 'rgba(255,253,2,0.7)' }}>
          Calibração de perfil
        </div>

        {/* Question */}
        <h2 className="font-semibold mb-2" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>{q.q}</h2>
        <p className="text-sm mb-8" style={{ color: 'rgba(244,244,240,0.45)' }}>{q.hint}</p>

        {/* Options */}
        <div className="space-y-3">
          {q.opts.map(opt => (
            <button key={opt.v} onClick={() => handleChoice(opt.v)}
              className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all glass hover:opacity-80"
              style={{ border: `0.5px solid ${answers[q.id] === opt.v ? 'rgba(255,253,2,0.35)' : 'rgba(255,255,255,0.08)'}`, background: answers[q.id] === opt.v ? 'rgba(255,253,2,0.04)' : undefined }}>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: answers[q.id] === opt.v ? '#FFFD02' : '#F4F4F0' }}>{opt.l}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(244,244,240,0.45)' }}>{opt.d}</p>
              </div>
              {answers[q.id] === opt.v && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: '#FFFD02' }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L4 7L9 1" stroke="#0F0F0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
