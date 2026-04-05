'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

// 5 casos reais por nível de sinal
const CASES_BY_SIGNAL: Record<string, Array<{ empresa: string; setor: string; ano: string; dimensao: string; descricao: string; licao: string }>> = {
  CRÍTICO: [
    { empresa: 'Quibi', setor: 'Media/Entertainment', ano: '2020', dimensao: 'Validação', descricao: 'Plataforma de streaming mobile levantou $1.75B antes de ter qualquer validação real de produto. Encerrou em 6 meses após lançamento.', licao: 'Capital sem validação acelera a falha, não o sucesso.' },
    { empresa: 'Jawbone', setor: 'HealthTech', ano: '2017', dimensao: 'Mercado', descricao: 'Wearables que não resolviam dor real. Levantou $900M e encerrou sem encontrar product-market fit.', licao: 'Investimento não substitui validação de demanda real.' },
    { empresa: 'Homejoy', setor: 'Marketplace', ano: '2015', dimensao: 'Modelo de Negócio', descricao: 'Marketplace de limpeza doméstica que cresceu rápido sem modelo sustentável. Encerrou após problemas trabalhistas e unit economics negativos.', licao: 'Crescimento sem modelo validado é caminho para o encerramento.' },
    { empresa: 'Fab.com', setor: 'E-commerce/Retail', ano: '2015', dimensao: 'Diferencial', descricao: 'E-commerce de design que perdeu identidade tentando competir com Amazon. Chegou a $1B de valuation e encerrou.', licao: 'Tentar ser tudo para todos destrói o diferencial que gerou crescimento.' },
    { empresa: 'Rdio', setor: 'Media/Entertainment', ano: '2015', dimensao: 'Concorrência', descricao: 'Streaming de música que ignorou o movimento do Spotify. Não reagiu à concorrência a tempo.', licao: 'Monitorar e reagir à concorrência é questão de sobrevivência.' },
  ],
  ATENÇÃO: [
    { empresa: 'Vine', setor: 'Media/Entertainment', ano: '2017', dimensao: 'Diferencial', descricao: 'Pioneiro no vídeo curto encerrou após Instagram e Snapchat copiarem o formato. Não construiu moat defensável.', licao: 'Funcionalidade é copiável. Distribuição e comunidade não são.' },
    { empresa: 'Yik Yak', setor: 'Media/Entertainment', ano: '2017', dimensao: 'Mercado', descricao: 'App anônimo universitário sem modelo de monetização claro. Crescimento sem receita levou ao encerramento.', licao: 'Usuários ativos sem modelo de receita não é negócio.' },
    { empresa: 'Munchery', setor: 'E-commerce/Retail', ano: '2019', dimensao: 'Financeiro', descricao: 'Delivery de refeições com unit economics negativos. Cada entrega custava mais do que entrava de receita.', licao: 'Escalar um modelo com unit economics negativos multiplica o prejuízo.' },
    { empresa: 'Shudder', setor: 'EdTech', ano: '2019', dimensao: 'Tração', descricao: 'Plataforma nicho sem evidências reais de retenção. Crescimento superficial sem profundidade de engajamento.', licao: 'Métricas de vaidade escondem falta de product-market fit.' },
    { empresa: 'Pebble', setor: 'HealthTech', ano: '2016', dimensao: 'Concorrência', descricao: 'Pioneiro em smartwatches encerrou após Apple Watch entrar no mercado. Dependência de hardware sem software diferenciado.', licao: 'Quando um giant entra, você precisa de diferencial que ele não pode copiar.' },
  ],
  MODERADO: [
    { empresa: 'Foursquare', setor: 'AI/ML/SaaS', ano: '2020', dimensao: 'Modelo de Negócio', descricao: 'App de check-in com grande base de usuários mas modelo de monetização tardio. Sobreviveu ao pivotar para dados B2B.', licao: 'Ter usuários sem monetização clara é risco estrutural — mas pivô é possível com dados.' },
    { empresa: 'Tumblr', setor: 'Media/Entertainment', ano: '2019', dimensao: 'Diferencial', descricao: 'Plataforma criativa vendida por $1.1B em 2013, revendida por <$3M em 2019. Perdeu identidade após aquisição.', licao: 'Aquisição sem preservação da cultura e identidade destrói valor.' },
    { empresa: 'Fab.com', setor: 'E-commerce/Retail', ano: '2015', dimensao: 'Escalabilidade', descricao: 'Crescimento rápido sem infraestrutura de operações. Logística quebrou antes do modelo ser validado em escala.', licao: 'Escala prematura sem operações sólidas é armadilha comum.' },
    { empresa: 'Path', setor: 'Media/Entertainment', ano: '2018', dimensao: 'Mercado', descricao: 'Rede social íntima com limite de 150 amigos. Nicho muito específico sem tamanho de mercado suficiente.', licao: 'Nichos podem ser armadilhas se o TAM não comporta o crescimento necessário.' },
    { empresa: 'Blockbuster', setor: 'Media/Entertainment', ano: '2010', dimensao: 'Inovação', descricao: 'Recusou comprar a Netflix por $50M em 2000. Ignorou a mudança de comportamento do consumidor.', licao: 'Ignorar sinais de mudança de mercado por defender o modelo atual é fatal.' },
  ],
  POSITIVO: [
    { empresa: 'Airbnb (2009)', setor: 'Marketplace', ano: '2009', dimensao: 'Validação', descricao: 'Começou alugando colchões infláveis no próprio apartamento para validar a hipótese. Evidência real antes de escalar.', licao: 'Validação manual e primitiva é mais valiosa que pesquisa de mercado.' },
    { empresa: 'Dropbox (inicial)', setor: 'AI/ML/SaaS', ano: '2008', dimensao: 'Problema', descricao: 'Validou demanda com um vídeo demo antes de construir o produto. 70k signups em 1 dia confirmaram o problema.', licao: 'Validar o problema antes de construir a solução economiza meses de desenvolvimento.' },
    { empresa: 'Slack (inicial)', setor: 'AI/ML/SaaS', ano: '2013', dimensao: 'Tração', descricao: 'Nasceu como ferramenta interna de uma empresa de games. Validado por necessidade real antes de virar produto.', licao: 'Os melhores produtos nascem de dores reais que o fundador sentiu primeiro.' },
    { empresa: 'Notion (crescimento)', setor: 'AI/ML/SaaS', ano: '2019', dimensao: 'Diferencial', descricao: 'Cresceu organicamente por 3 anos antes de aceitar capital. Product-market fit sólido antes de escalar.', licao: 'Crescimento orgânico lento com alto NPS é sinal de fundação sólida.' },
    { empresa: 'Duolingo (inicial)', setor: 'EdTech', ano: '2012', dimensao: 'Validação', descricao: 'Lançou em beta com lista de espera de 300k usuários. Demanda validada antes de otimizar o produto.', licao: 'Lista de espera real é validação mais forte do que qualquer pesquisa de mercado.' },
  ],
}

type SignalLevel = 'CRÍTICO' | 'ATENÇÃO' | 'MODERADO' | 'POSITIVO'

function calcSignal(answers: Record<string, string>): { level: SignalLevel; color: string; headline: string; explanation: string; ctaText: string } {
  const vScore = QUESTIONS[1].options?.find(o => o.v === answers['validation'])?.score ?? 0
  const cScore = QUESTIONS[2].options?.find(o => o.v === answers['competition'])?.score ?? 0
  const total  = vScore + cScore
  if (total <= -3) return { level: 'CRÍTICO',  color: '#FF4D30', headline: '3 padrões de risco identificados nos dados', explanation: 'Sua ideia apresenta os mesmos sinais presentes em casos reais do nosso banco. O diagnóstico completo vai revelar quais decisões precisam ser tomadas agora.', ctaText: 'Conte-me mais' }
  if (total <= -1) return { level: 'ATENÇÃO',   color: '#F5A623', headline: '2 áreas críticas identificadas',           explanation: 'Há riscos estruturais no seu estágio atual. O diagnóstico completo vai identificar quais padrões se repetem na sua ideia.', ctaText: 'Conte-me mais' }
  if (total <=  2) return { level: 'MODERADO',  color: '#60A5FA', headline: 'Base razoável — há pontos a fortalecer',   explanation: 'Você tem alguns fundamentos no lugar. O diagnóstico vai revelar onde seu diferencial é mais vulnerável.', ctaText: 'Diagnóstico completo das 8 dimensões' }
  return               { level: 'POSITIVO',  color: '#4ADE80', headline: 'Fundação promissora — veja onde fortalecer', explanation: 'Você tem evidências reais. O diagnóstico vai medir a força do seu diferencial e preparar para o próximo nível.', ctaText: 'Diagnóstico completo das 8 dimensões' }
}

export default function PreCheckPage() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'q0' | 'q1' | 'q2' | 'result'>('intro')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [textValue, setTextValue] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const qIndex = step === 'q0' ? 0 : step === 'q1' ? 1 : step === 'q2' ? 2 : -1
  const currentQ = qIndex >= 0 ? QUESTIONS[qIndex] : null
  const signal = step === 'result' ? calcSignal(answers) : null
  const cases  = signal ? CASES_BY_SIGNAL[signal.level] ?? [] : []

  const handleChoice = (v: string) => {
    setSelected(v)
    const key  = step === 'q1' ? 'validation' : 'competition'
    const next = step === 'q1' ? 'q2' : 'result'
    setAnswers(a => ({ ...a, [key]: v }))
    setTimeout(() => { setSelected(null); setStep(next) }, 220)
  }

  return (
    <div className="min-h-screen bg-obsidian" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-baseline">
          <span className="text-sm font-semibold tracking-widest text-field">VALLI</span>
          <span className="text-sm font-semibold tracking-widest text-volt">DATOR</span>
        </Link>
        <Link href="/login" className="text-xs font-semibold hover:opacity-90 px-3 py-1.5 rounded-lg"
          style={{ color: '#FFFD02', border: '0.5px solid rgba(255,253,2,0.3)', background: 'rgba(255,253,2,0.06)' }}>
          Prefiro criar conta e fazer o diagnóstico completo →
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
              Não crie sua conta ainda.<br />
              <span style={{ color: 'rgba(244,244,240,0.4)' }}>Primeiro, valide sua ideia.</span>
            </h1>
            <p className="text-sm leading-relaxed mb-10" style={{ color: 'rgba(244,244,240,0.5)', maxWidth: 440 }}>
              3 perguntas. Resultado instantâneo. Baseado nos padrões de mais de{' '}
              <span style={{ color: '#F4F4F0' }}>1.000 casos reais</span>. Sem cadastro.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setStep('q0')}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 shadow-volt"
                style={{ background: '#FFFD02', color: '#0F0F0F' }}>
                Analise agora a minha ideia →
              </button>
            </div>
          </div>
        )}

        {/* TEXTO (q0) */}
        {step === 'q0' && currentQ?.type === 'text' && (
          <div>
            <button onClick={() => setStep('intro')} className="text-xs mb-8 hover:opacity-70" style={{ color: 'rgba(244,244,240,0.4)' }}>← Voltar</button>
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
            <button onClick={() => setStep(step === 'q1' ? 'q0' : 'q1')} className="text-xs mb-8 hover:opacity-70" style={{ color: 'rgba(244,244,240,0.4)' }}>← Voltar</button>
            <div className="flex gap-2 mb-6">
              {[0,1,2].map(i => <div key={i} className="rounded-full transition-all" style={{ height: 3, width: i === (step === 'q1' ? 1 : 2) ? 24 : 8, background: i < (step === 'q1' ? 1 : 2) ? '#4ADE80' : i === (step === 'q1' ? 1 : 2) ? '#FFFD02' : 'rgba(255,255,255,0.12)' }} />)}
              <span className="text-[11px] font-mono ml-1" style={{ color: 'rgba(244,244,240,0.3)' }}>{step === 'q1' ? '2' : '3'} / 3</span>
            </div>
            <h2 className="font-semibold mb-2" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>{currentQ.question}</h2>
            <p className="text-sm mb-7" style={{ color: 'rgba(244,244,240,0.45)' }}>{currentQ.hint}</p>
            <div className="space-y-3">
              {currentQ.options?.map(opt => {
                const isSelected = selected === opt.v
                return (
                  <button key={opt.v} onClick={() => handleChoice(opt.v)}
                    className="w-full flex items-start gap-3 p-4 rounded-xl text-left"
                    style={{
                      background: isSelected ? 'rgba(255,253,2,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${isSelected ? '#FFFD02' : 'rgba(255,255,255,0.1)'}`,
                      backdropFilter: 'blur(12px)',
                      transition: 'all 0.15s ease',
                      transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                    }}>
                    {/* Checkbox visual */}
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      border: `1.5px solid ${isSelected ? '#FFFD02' : 'rgba(255,255,255,0.2)'}`,
                      background: isSelected ? '#FFFD02' : 'transparent',
                      transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#0F0F0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: isSelected ? '#FFFD02' : '#F4F4F0' }}>{opt.l}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(244,244,240,0.45)' }}>{opt.d}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === 'result' && signal && (
          <div>
            {/* Signal badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-mono mb-4"
              style={{ background: `${signal.color}12`, border: `0.5px solid ${signal.color}35`, color: signal.color }}>
              SINAL {signal.level}
            </div>
            <h2 className="font-bold mb-2" style={{ fontSize: 24, letterSpacing: '-0.02em', lineHeight: 1.25 }}>{signal.headline}</h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(244,244,240,0.55)' }}>{signal.explanation}</p>

            {/* 5 casos reais */}
            <div className="mb-8">
              <p className="text-xs font-mono mb-3" style={{ color: 'rgba(244,244,240,0.4)', letterSpacing: '0.08em' }}>
                5 CASOS REAIS RELACIONADOS À SUA IDEIA
              </p>
              <div className="space-y-3">
                {cases.map((c, i) => (
                  <div key={i} className="rounded-xl p-4"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold" style={{ color: '#F4F4F0' }}>{c.empresa}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(244,244,240,0.45)' }}>{c.setor}</span>
                      <span className="text-[10px]" style={{ color: 'rgba(244,244,240,0.3)' }}>{c.ano}</span>
                    </div>
                    <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(244,244,240,0.55)' }}>{c.descricao}</p>
                    <div className="flex items-start gap-1.5">
                      <span style={{ color: '#4ADE80', fontSize: 10, marginTop: 1 }}>→</span>
                      <p className="text-[11px]" style={{ color: 'rgba(74,222,128,0.8)' }}>{c.licao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
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
              className="mt-6 flex justify-center w-full text-xs hover:opacity-70" style={{ color: 'rgba(244,244,244,0.3)' }}>
              ← Refazer avaliação
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
