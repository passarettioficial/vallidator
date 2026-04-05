'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { DiagnosisResult } from '@/lib/scoreEngine'

/* Casos de falha reais — carregados do JSON público */
interface FailureCase {
  id: string
  startup: string
  sector: string
  year: number
  score?: number
  primaryFactor: string
  story: string
  lesson: string
  vcSignal?: string
  tags?: string[]
}

export default function FailureBankPage() {
  const router = useRouter()
  const [cases, setCases] = useState<FailureCase[]>([])
  const [filtered, setFiltered] = useState<FailureCase[]>([])
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('Todos')
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    // Carrega casos do JSON público
    fetch('/cases-database.json')
      .then(r => r.json())
      .then((data: FailureCase[]) => {
        setCases(data)
        setFiltered(data)
      })
      .catch(() => setCases([]))

    // Carrega diagnóstico para destaque
    const raw = localStorage.getItem('vallidator-diagnosis')
    if (raw) setDiagnosis(JSON.parse(raw))
  }, [])

  useEffect(() => {
    let out = cases
    if (sector !== 'Todos') out = out.filter(c => c.sector === sector)
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(c =>
        c.startup.toLowerCase().includes(q) ||
        c.primaryFactor.toLowerCase().includes(q) ||
        c.story.toLowerCase().includes(q) ||
        c.lesson.toLowerCase().includes(q)
      )
    }
    setFiltered(out)
  }, [search, sector, cases])

  const sectors = ['Todos', ...Array.from(new Set(cases.map(c => c.sector)))]

  // Casos relacionados ao weakestDimension do usuário
  const weakDim = diagnosis?.weakestDimension?.toLowerCase() ?? ''
  const related = weakDim
    ? filtered.filter(c => c.tags?.some(t => t.toLowerCase().includes(weakDim)) || c.primaryFactor.toLowerCase().includes(weakDim))
    : []

  return (
    <div className="min-h-screen bg-obsidian pb-24"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

      {/* Header */}
      <div className="sticky top-0 z-20 px-6 py-4" style={{ background: 'rgba(15,15,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-bold text-lg" style={{ letterSpacing: '-0.02em' }}>Banco de Falhas</h1>
          <span className="text-xs font-mono" style={{ color: 'rgba(244,244,240,0.4)' }}>{filtered.length} casos</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Relacionados ao diagnóstico */}
        {related.length > 0 && (
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4"
              style={{ background: 'rgba(255,77,48,0.08)', border: '0.5px solid rgba(255,77,48,0.2)', color: '#FF4D30' }}>
              Relacionado ao seu ponto fraco: {diagnosis?.weakestDimension}
            </div>
            <div className="space-y-3">
              {related.slice(0, 3).map(c => <CaseCard key={c.id} c={c} expanded={expanded} setExpanded={setExpanded} highlight />)}
            </div>
          </div>
        )}

        {/* Busca + filtro */}
        <div className="flex gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por startup, fator, lição…"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none glass"
            style={{ border: '0.5px solid rgba(255,255,255,0.1)', color: '#F4F4F0' }} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
          {sectors.map(s => (
            <button key={s} onClick={() => setSector(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all"
              style={{ background: sector === s ? 'rgba(255,253,2,0.1)' : 'rgba(255,255,255,0.05)', border: `0.5px solid ${sector === s ? 'rgba(255,253,2,0.35)' : 'rgba(255,255,255,0.08)'}`, color: sector === s ? '#FFFD02' : 'rgba(244,244,240,0.5)' }}>
              {s}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {filtered.map(c => <CaseCard key={c.id} c={c} expanded={expanded} setExpanded={setExpanded} />)}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: 'rgba(244,244,240,0.4)' }}>Nenhum caso encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CaseCard({ c, expanded, setExpanded, highlight }: {
  c: FailureCase
  expanded: string | null
  setExpanded: (id: string | null) => void
  highlight?: boolean
}) {
  const isOpen = expanded === c.id
  return (
    <div className="rounded-2xl overflow-hidden transition-all glass"
      style={{ border: `0.5px solid ${highlight ? 'rgba(255,77,48,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
      <button onClick={() => setExpanded(isOpen ? null : c.id)} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono" style={{ color: 'rgba(244,244,240,0.4)' }}>{c.year}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(244,244,240,0.5)' }}>{c.sector}</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#F4F4F0' }}>{c.startup}</p>
            <p className="text-xs mt-0.5" style={{ color: '#FF4D30' }}>{c.primaryFactor}</p>
          </div>
          <svg className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'rgba(244,244,240,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-sm leading-relaxed mt-3 mb-3" style={{ color: 'rgba(244,244,240,0.6)' }}>{c.story}</p>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(74,222,128,0.05)', border: '0.5px solid rgba(74,222,128,0.12)' }}>
            <p className="text-xs font-mono mb-1" style={{ color: 'rgba(74,222,128,0.6)', letterSpacing: '0.08em' }}>LIÇÃO</p>
            <p className="text-sm" style={{ color: 'rgba(244,244,240,0.7)' }}>{c.lesson}</p>
          </div>
          {c.vcSignal && (
            <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(96,165,250,0.05)', border: '0.5px solid rgba(96,165,250,0.12)' }}>
              <p className="text-xs font-mono mb-1" style={{ color: 'rgba(96,165,250,0.6)', letterSpacing: '0.08em' }}>SINAL DE VC</p>
              <p className="text-sm" style={{ color: 'rgba(244,244,240,0.7)' }}>{c.vcSignal}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
