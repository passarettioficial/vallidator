'use client'
import { useEffect, useState } from 'react'
import type { DiagnosisResult } from '@/lib/scoreEngine'

interface RankEntry {
  rank: number
  name: string
  score: number
  sector: string
  stage: string
  isUser?: boolean
}

function generateRankings(userDiagnosis: DiagnosisResult | null, userMeta: { name?: string; stage?: string; segment?: string } | null): RankEntry[] {
  // Ranking sintético baseado no score do usuário
  const score = userDiagnosis?.overallScore ?? 52
  const entries: RankEntry[] = []

  const SECTORS = ['Fintech', 'EdTech', 'HealthTech', 'SaaS B2B', 'MarketPlace', 'Logtech', 'AgTech', 'HRTech']
  const STAGES  = ['MVP', 'Tração', 'Protótipo', 'Produto com clientes', 'Escalando']
  const NAMES   = ['NovaSpark', 'Ledge AI', 'FlowBase', 'Crédito+', 'DataStar', 'Nexum', 'Vortex', 'PulseAI', 'Orion', 'Quantum', 'Axiom', 'Prism', 'Echo', 'Titan', 'Apex', 'Zenith', 'Vertex', 'Helix', 'Fusion', 'Atlas']

  // Gera 20 entradas determinísticas baseadas no score do usuário
  for (let i = 0; i < 20; i++) {
    const baseScore = Math.max(20, Math.min(96, score + (i % 2 === 0 ? 1 : -1) * Math.ceil((i + 1) * 2.3) + (i % 3 - 1) * 5))
    entries.push({
      rank: 0,
      name: NAMES[i % NAMES.length],
      score: baseScore,
      sector: SECTORS[i % SECTORS.length],
      stage: STAGES[i % STAGES.length],
    })
  }

  // Adiciona o usuário
  if (userDiagnosis) {
    entries.push({
      rank: 0,
      name: userMeta?.name ?? 'Sua startup',
      score,
      sector: SECTORS[0],
      stage: userMeta?.stage ?? 'MVP',
      isUser: true,
    })
  }

  // Ordena e rankeia
  entries.sort((a, b) => b.score - a.score)
  entries.forEach((e, i) => { e.rank = i + 1 })

  return entries
}

export default function RankingsPage() {
  const [entries, setEntries] = useState<RankEntry[]>([])
  const [userEntry, setUserEntry] = useState<RankEntry | null>(null)
  const [filter, setFilter] = useState<'global' | 'sector'>('global')

  useEffect(() => {
    const rawDiag = localStorage.getItem('vallidator-diagnosis')
    const rawMeta = localStorage.getItem('startup_meta')
    const diag = rawDiag ? JSON.parse(rawDiag) : null
    const meta = rawMeta ? JSON.parse(rawMeta) : null

    const all = generateRankings(diag, meta)
    setEntries(all)
    setUserEntry(all.find(e => e.isUser) ?? null)
  }, [])

  const display = entries.slice(0, 20)

  return (
    <div className="min-h-screen bg-obsidian pb-24">
      <div className="max-w-xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold text-2xl mb-1" style={{ letterSpacing: '-0.02em' }}>Rankings</h1>
          <p className="text-sm" style={{ color: 'rgba(244,244,240,0.45)' }}>
            Sua posição entre as startups diagnosticadas.
          </p>
        </div>

        {/* Sua posição */}
        {userEntry && (
          <div className="glass rounded-2xl p-4 mb-6" style={{ border: '0.5px solid rgba(255,253,2,0.25)', background: 'rgba(255,253,2,0.03)' }}>
            <p className="text-xs font-mono mb-2" style={{ color: 'rgba(255,253,2,0.6)', letterSpacing: '0.08em' }}>SUA POSIÇÃO</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,253,2,0.1)' }}>
                <span className="font-bold font-mono" style={{ color: '#FFFD02' }}>#{userEntry.rank}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: '#F4F4F0' }}>{userEntry.name}</p>
                <p className="text-xs" style={{ color: 'rgba(244,244,240,0.4)' }}>{userEntry.stage} · Score {userEntry.score}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl font-mono" style={{ color: '#FFFD02', letterSpacing: '-0.02em' }}>{userEntry.score}</p>
                <p className="text-[10px]" style={{ color: 'rgba(244,244,240,0.4)' }}>pontos</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {(['global', 'sector'] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className="px-4 py-2 rounded-lg text-xs font-mono transition-all"
              style={{ background: filter === t ? 'rgba(255,253,2,0.1)' : 'rgba(255,255,255,0.05)', border: `0.5px solid ${filter === t ? 'rgba(255,253,2,0.3)' : 'rgba(255,255,255,0.08)'}`, color: filter === t ? '#FFFD02' : 'rgba(244,244,240,0.5)' }}>
              {t === 'global' ? 'Global' : 'Por setor'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {display.map(entry => (
            <div key={`${entry.rank}-${entry.name}`}
              className="flex items-center gap-3 p-3 rounded-xl transition-all glass"
              style={{ border: `0.5px solid ${entry.isUser ? 'rgba(255,253,2,0.2)' : 'rgba(255,255,255,0.06)'}`, background: entry.isUser ? 'rgba(255,253,2,0.02)' : undefined }}>

              {/* Rank */}
              <div className="w-8 text-center">
                {entry.rank <= 3 ? (
                  <span className="text-base">{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}</span>
                ) : (
                  <span className="text-xs font-mono" style={{ color: 'rgba(244,244,240,0.35)' }}>#{entry.rank}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: entry.isUser ? '#FFFD02' : '#F4F4F0' }}>
                  {entry.name} {entry.isUser && '← você'}
                </p>
                <p className="text-[11px]" style={{ color: 'rgba(244,244,240,0.4)' }}>{entry.sector} · {entry.stage}</p>
              </div>

              {/* Score bar */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${entry.score}%`, background: entry.score >= 70 ? '#4ADE80' : entry.score >= 45 ? '#F5A623' : '#FF4D30' }} />
                </div>
                <span className="text-xs font-mono w-6" style={{ color: 'rgba(244,244,240,0.6)' }}>{entry.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
