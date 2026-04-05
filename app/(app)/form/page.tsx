'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FormAnswers } from '@/lib/scoreEngine'

/* ── Definição dos blocos ───────────────────────────────────────────────── */
const FORM_BLOCKS = [
  {
    id: 1, title: 'Identidade & Proposta de Valor',
    desc: 'Fundação do diagnóstico. Seja específico.',
    fields: [
      { id: 'startup_name', label: 'Nome da startup', type: 'text', placeholder: 'ex: DataLayer AI', required: true },
      { id: 'one_liner',    label: 'One-liner (problema → solução → quem)', type: 'textarea', placeholder: 'ex: Ajudo [ICP] a [resultado] sem [dor principal] usando [método diferente].', required: true, maxLength: 200 },
      {
        id: 'stage', label: 'Estágio atual', type: 'choice', required: true,
        options: ['Ideia', 'Protótipo', 'MVP', 'Produto com clientes', 'Escalando'],
      },
    ],
  },
  {
    id: 2, title: 'Mercado & ICP',
    desc: 'Quem compra, qual a dor real, qual o tamanho da oportunidade.',
    fields: [
      { id: 'icp',  label: 'Perfil do cliente ideal (ICP)', type: 'textarea', placeholder: 'ex: Diretores de RH de empresas B2B de 50–500 funcionários no Brasil que perdem 10h/mês com processos manuais de onboarding.', required: true, maxLength: 280 },
      { id: 'pain', label: 'Dor principal do cliente', type: 'textarea', placeholder: 'Qual a consequência concreta se o cliente não resolver esse problema? Use números se possível.', required: true, maxLength: 280 },
      {
        id: 'tam', label: 'Tamanho de mercado estimado (TAM)', type: 'choice', required: true,
        options: ['Não sei ainda', '< R$50M', 'R$50M – R$500M', 'R$500M – R$5B', '> R$5B'],
      },
    ],
  },
  {
    id: 3, title: 'Diferenciação & Defesa',
    desc: 'Por que você e não os outros.',
    fields: [
      { id: 'unique',      label: 'Diferencial principal (por que você é melhor)', type: 'textarea', placeholder: 'O que você faz que nenhum concorrente faz? Seja específico — "mais barato" ou "mais fácil" não são diferenciais.', required: true, maxLength: 280 },
      { id: 'competition', label: 'Principal concorrente ou alternativa', type: 'text', placeholder: 'ex: Salesforce, Excel, processo manual, nenhum concorrente direto...', required: false },
      {
        id: 'moat', label: 'Seu maior fator de defesa (moat)', type: 'choice', required: false,
        options: ['Dados exclusivos', 'Network effect', 'Custo de troca alto', 'Marca/confiança', 'Tecnologia proprietária', 'Nenhum ainda'],
      },
    ],
  },
  {
    id: 4, title: 'Time, Tração & Recursos',
    desc: 'Evidências reais de progresso e capacidade de execução.',
    fields: [
      {
        id: 'team', label: 'Composição do time fundador', type: 'choice', required: true,
        options: ['Solo founder', '2 co-founders', '3+ pessoas', 'Equipe com especialistas'],
      },
      {
        id: 'runway', label: 'Runway disponível', type: 'choice', required: true,
        options: ['< 3 meses', '3–6 meses', '6–12 meses', '12–18 meses', '> 18 meses', 'Bootstrapped sem pressão'],
      },
      { id: 'traction', label: 'Principal evidência de tração', type: 'textarea', placeholder: 'ex: 3 clientes pagando R$2.500/mês (MRR R$7.500), crescendo 15% m/m há 2 meses. 47 usuários beta com NPS 72.', required: false, maxLength: 280 },
    ],
  },
]

type FieldVal = string

export default function FormPage() {
  const router = useRouter()
  const [blockIndex, setBlockIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<FormAnswers>>({})
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const block = FORM_BLOCKS[blockIndex]
  const progress = ((blockIndex + 1) / FORM_BLOCKS.length) * 100

  const set = (id: string, v: FieldVal) => {
    setAnswers(a => ({ ...a, [id]: v }))
    setErrors(e => ({ ...e, [id]: false }))
  }

  const validateBlock = () => {
    const errs: Record<string, boolean> = {}
    block.fields.forEach(f => {
      if (f.required && !(answers as Record<string, string>)[f.id]?.trim()) {
        errs[f.id] = true
      }
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextBlock = () => {
    if (!validateBlock()) return
    if (blockIndex < FORM_BLOCKS.length - 1) {
      setBlockIndex(i => i + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      submitForm()
    }
  }

  const submitForm = async () => {
    if (!validateBlock()) return
    setSubmitting(true)
    try {
      // Salva localmente para o processing
      localStorage.setItem('vallidator-form-answers', JSON.stringify(answers))
      router.push('/processing')
    } catch {
      setSubmitting(false)
    }
  }

  const val = (id: string) => (answers as Record<string, string>)[id] ?? ''

  return (
    <div className="min-h-screen bg-obsidian"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.05)', zIndex: 50 }}>
        <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: '#FFFD02' }} />
      </div>

      <div className="max-w-xl mx-auto px-6 py-14">
        {/* Nav */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => blockIndex > 0 ? setBlockIndex(i => i - 1) : router.push('/calibration')}
            className="text-xs hover:opacity-70" style={{ color: 'rgba(244,244,240,0.4)' }}>
            ← Voltar
          </button>
          <div className="flex gap-2">
            {FORM_BLOCKS.map((b, i) => (
              <div key={i} className="rounded-full transition-all" style={{ height: 3, width: i === blockIndex ? 28 : 8, background: i < blockIndex ? '#4ADE80' : i === blockIndex ? '#FFFD02' : 'rgba(255,255,255,0.12)' }} />
            ))}
          </div>
          <span className="text-[11px] font-mono" style={{ color: 'rgba(244,244,240,0.3)' }}>Bloco {blockIndex + 1}/{FORM_BLOCKS.length}</span>
        </div>

        {/* Block header */}
        <div className="mb-8">
          <p className="text-xs font-mono mb-1" style={{ color: 'rgba(255,253,2,0.6)', letterSpacing: '0.08em' }}>
            BLOCO {blockIndex + 1}
          </p>
          <h2 className="font-bold mb-1" style={{ fontSize: 22, letterSpacing: '-0.02em' }}>{block.title}</h2>
          <p className="text-sm" style={{ color: 'rgba(244,244,240,0.45)' }}>{block.desc}</p>
        </div>

        {/* Fields */}
        <div className="space-y-6">
          {block.fields.map(f => (
            <div key={f.id}>
              <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(244,244,240,0.6)', letterSpacing: '0.06em' }}>
                {f.label.toUpperCase()}
                {!f.required && <span className="ml-1 normal-case text-[10px]" style={{ color: 'rgba(244,244,240,0.3)' }}>(opcional)</span>}
              </label>

              {f.type === 'text' && (
                <input type="text" value={val(f.id)} onChange={e => set(f.id, e.target.value)}
                  placeholder={f.placeholder} autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none glass"
                  style={{ border: `0.5px solid ${errors[f.id] ? '#FF4D30' : val(f.id) ? 'rgba(255,253,2,0.3)' : 'rgba(255,255,255,0.1)'}`, color: '#F4F4F0' }} />
              )}

              {f.type === 'textarea' && (
                <div>
                  <textarea value={val(f.id)} onChange={e => set(f.id, (e.target.value).slice(0, f.maxLength ?? 300))}
                    placeholder={f.placeholder} rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none glass"
                    style={{ border: `0.5px solid ${errors[f.id] ? '#FF4D30' : val(f.id) ? 'rgba(255,253,2,0.3)' : 'rgba(255,255,255,0.1)'}`, color: '#F4F4F0' }} />
                  {f.maxLength && (
                    <p className="text-[10px] mt-1 text-right font-mono" style={{ color: 'rgba(244,244,240,0.3)' }}>
                      {val(f.id).length}/{f.maxLength}
                    </p>
                  )}
                </div>
              )}

              {f.type === 'choice' && f.options && (
                <div className="space-y-2">
                  {f.options.map(opt => (
                    <button key={opt} onClick={() => set(f.id, opt)}
                      className="w-full px-4 py-3 rounded-xl text-left text-sm transition-all glass"
                      style={{ border: `0.5px solid ${val(f.id) === opt ? 'rgba(255,253,2,0.4)' : 'rgba(255,255,255,0.08)'}`, background: val(f.id) === opt ? 'rgba(255,253,2,0.06)' : undefined, color: val(f.id) === opt ? '#FFFD02' : '#F4F4F0' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {errors[f.id] && (
                <p className="text-xs mt-1" style={{ color: '#FF4D30' }}>Campo obrigatório</p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col gap-2">
          <button onClick={nextBlock} disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 shadow-volt"
            style={{ background: '#FFFD02', color: '#0F0F0F' }}>
            {submitting ? 'Enviando...' : blockIndex < FORM_BLOCKS.length - 1 ? `Próximo bloco →` : 'Calcular diagnóstico →'}
          </button>
          {blockIndex === FORM_BLOCKS.length - 1 && (
            <p className="text-[11px] text-center" style={{ color: 'rgba(244,244,240,0.3)' }}>
              Resultado em &lt;10 segundos · Zero IA no cálculo
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
