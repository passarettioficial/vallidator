'use client'
import { useEffect, useState } from 'react'
import type { DiagnosisResult } from '@/lib/scoreEngine'

interface Mission {
  id: string
  title: string
  description: string
  xp: number
  difficulty: 'easy' | 'medium' | 'hard'
  dimension: string
  action: string
  completed?: boolean
}

function generateMissions(diagnosis: DiagnosisResult | null): Mission[] {
  if (!diagnosis) return getDefaultMissions()

  const sorted = [...(diagnosis.dimensions ?? [])].sort((a, b) => a.score - b.score)
  const weak = sorted.slice(0, 3).map(d => d.label)
  const missions: Mission[] = []

  const missionMap: Record<string, Mission[]> = {
    'Tração': [
      { id: 'trac-1', title: 'Validação com 5 clientes potenciais', description: 'Conduza 5 entrevistas estruturadas com seu ICP esta semana. Objetivo: qualificar dor e disposição a pagar.', xp: 150, difficulty: 'medium', dimension: 'Tração', action: 'Abrir template de entrevista' },
      { id: 'trac-2', title: 'Conseguir primeira pré-venda', description: 'Feche ao menos 1 carta de intenção ou pré-venda com desconto early-bird. Comprove com screenshot.', xp: 300, difficulty: 'hard', dimension: 'Tração', action: 'Ver guia de pré-venda' },
    ],
    'Validação': [
      { id: 'val-1', title: 'Mapa de dor documentado', description: 'Documente as 3 principais dores do ICP com citações reais de entrevistas. Sem parafrase — palavras exatas.', xp: 100, difficulty: 'easy', dimension: 'Validação', action: 'Abrir template' },
      { id: 'val-2', title: 'Smoke test de produto', description: 'Crie uma landing page fake e meça conversão de cadastro com Google Ads (orçamento: R$150).', xp: 200, difficulty: 'medium', dimension: 'Validação', action: 'Ver tutorial' },
    ],
    'Diferenciação': [
      { id: 'dif-1', title: 'Mapeamento de concorrentes', description: 'Preencha uma battle card completa com 3 concorrentes diretos e 2 indiretos. Foco: preço, ICP, diferencial, fraqueza.', xp: 120, difficulty: 'easy', dimension: 'Diferenciação', action: 'Abrir template de battle card' },
      { id: 'dif-2', title: 'Definir moat defensável', description: 'Identifique e documente seu principal fator de defesa: dados exclusivos, network effect, tecnologia ou marca.', xp: 180, difficulty: 'medium', dimension: 'Diferenciação', action: 'Ver exercício de moat' },
    ],
    'Mercado': [
      { id: 'merc-1', title: 'Calcular TAM/SAM/SOM', description: 'Documente o cálculo real do mercado com fontes verificáveis. Evite estimativas genéricas do Google.', xp: 140, difficulty: 'medium', dimension: 'Mercado', action: 'Ver metodologia' },
    ],
    'Problema': [
      { id: 'prob-1', title: 'Refinar one-liner', description: 'Escreva 5 versões do seu one-liner e teste qual tem maior taxa de resposta com pessoas fora do seu contexto.', xp: 80, difficulty: 'easy', dimension: 'Problema', action: 'Ver framework de one-liner' },
    ],
    'Time': [
      { id: 'time-1', title: 'Identificar gap de habilidade crítico', description: 'Liste as 3 habilidades que sua startup mais precisa e que o time fundador não tem. Crie plano de cobertura.', xp: 120, difficulty: 'easy', dimension: 'Time', action: 'Abrir análise de gap' },
    ],
    'Modelo de Negócio': [
      { id: 'mod-1', title: 'Calcular unit economics', description: 'Calcule LTV, CAC e Payback Period reais ou estimados com premissas explícitas.', xp: 160, difficulty: 'medium', dimension: 'Modelo de Negócio', action: 'Abrir calculadora' },
    ],
    'Solução': [
      { id: 'sol-1', title: 'Mapa de funcionalidades vs. dores', description: 'Crie uma matriz relacionando cada funcionalidade do produto à dor específica que ela resolve.', xp: 110, difficulty: 'easy', dimension: 'Solução', action: 'Abrir template de matriz' },
    ],
  }

  weak.forEach(dim => {
    const m = missionMap[dim] ?? []
    missions.push(...m)
  })

  return missions.slice(0, 6)
}

function getDefaultMissions(): Mission[] {
  return [
    { id: 'd1', title: 'Completar diagnóstico inicial', description: 'Responda as 27 perguntas para receber seu score e missões personalizadas.', xp: 200, difficulty: 'easy', dimension: 'Geral', action: 'Ir para diagnóstico' },
    { id: 'd2', title: 'Definir ICP com precisão', description: 'Documente quem é seu cliente ideal com cargo, tamanho da empresa, dor e orçamento.', xp: 120, difficulty: 'easy', dimension: 'Mercado', action: 'Ver template' },
    { id: 'd3', title: 'Fazer 5 entrevistas de descoberta', description: 'Converse com potenciais clientes sobre o problema, não sobre sua solução.', xp: 150, difficulty: 'medium', dimension: 'Tração', action: 'Ver roteiro' },
  ]
}

const DIFF_CONFIG = {
  easy:   { label: 'Fácil',  color: '#4ADE80' },
  medium: { label: 'Médio',  color: '#F5A623' },
  hard:   { label: 'Difícil',color: '#FF4D30' },
}

export default function MissionsPage() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [totalXP, setTotalXP] = useState(0)

  useEffect(() => {
    const raw = localStorage.getItem('vallidator-diagnosis')
    const diag = raw ? JSON.parse(raw) : null
    setDiagnosis(diag)

    const mlist = generateMissions(diag)
    setMissions(mlist)

    const savedCompleted = localStorage.getItem('vallidator-missions-completed')
    if (savedCompleted) {
      const ids: string[] = JSON.parse(savedCompleted)
      const set = new Set<string>(ids)
      setCompleted(set)
      setTotalXP(mlist.filter(m => set.has(m.id)).reduce((s, m) => s + m.xp, 0))
    }
  }, [])

  const toggleMission = (m: Mission) => {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(m.id)) {
        next.delete(m.id)
        setTotalXP(xp => xp - m.xp)
      } else {
        next.add(m.id)
        setTotalXP(xp => xp + m.xp)
      }
      localStorage.setItem('vallidator-missions-completed', JSON.stringify([...next]))
      return next
    })
  }

  const completedCount = missions.filter(m => completed.has(m.id)).length

  return (
    <div className="min-h-screen bg-obsidian pb-24">
      <div className="max-w-xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-2xl mb-1" style={{ letterSpacing: '-0.02em' }}>Missões</h1>
          <p className="text-sm" style={{ color: 'rgba(244,244,240,0.45)' }}>
            {diagnosis ? `Personalizadas para sua dimensão mais fraca: ${diagnosis.weakestDimension}` : 'Complete o diagnóstico para missões personalizadas'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'XP Total',     value: totalXP.toLocaleString('pt-BR'), color: '#FFFD02' },
            { label: 'Concluídas',   value: `${completedCount}/${missions.length}`, color: '#4ADE80' },
            { label: 'Score atual',  value: diagnosis ? String(diagnosis.overallScore) : '--', color: '#60A5FA' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-3 text-center" style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <p className="font-bold text-xl" style={{ color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(244,244,240,0.4)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Missions list */}
        <div className="space-y-3">
          {missions.map(m => {
            const isDone = completed.has(m.id)
            const diff = DIFF_CONFIG[m.difficulty]
            return (
              <div key={m.id} className="glass rounded-2xl p-4 transition-all"
                style={{ border: `0.5px solid ${isDone ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`, opacity: isDone ? 0.65 : 1 }}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleMission(m)}
                    className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 border flex items-center justify-center"
                    style={{ borderColor: isDone ? '#4ADE80' : 'rgba(255,255,255,0.2)', background: isDone ? 'rgba(74,222,128,0.15)' : 'transparent' }}>
                    {isDone && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className={`text-sm font-semibold ${isDone ? 'line-through' : ''}`} style={{ color: '#F4F4F0' }}>{m.title}</p>
                    </div>
                    <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(244,244,240,0.5)' }}>{m.description}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${diff.color}12`, color: diff.color, border: `0.5px solid ${diff.color}30` }}>{diff.label}</span>
                      <span className="text-[10px] font-mono" style={{ color: 'rgba(255,253,2,0.6)' }}>+{m.xp} XP</span>
                      <span className="text-[10px]" style={{ color: 'rgba(244,244,240,0.3)' }}>{m.dimension}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
