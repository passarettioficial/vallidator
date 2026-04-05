'use client'
import { useRef, useState, useCallback } from 'react'
import { toPng } from 'html-to-image'
import type { DiagnosisResult } from '@/lib/scoreEngine'

interface ShareCardModalProps {
  diagnosis: DiagnosisResult
  startupName?: string
  onClose: () => void
}

function scoreLabel(score: number): string {
  if (score >= 78) return 'Série A Ready'
  if (score >= 60) return 'Seed Ready'
  if (score >= 40) return 'Pre-seed'
  return 'Pré-investimento'
}

function scoreColor(score: number): string {
  if (score >= 70) return '#4ADE80'
  if (score >= 50) return '#FFFD02'
  if (score >= 35) return '#F5A623'
  return '#FF4D30'
}

/** O card em si — será capturado pelo html-to-image */
function DiagnosisCard({ diagnosis, startupName }: { diagnosis: DiagnosisResult; startupName?: string }) {
  const score = diagnosis.overallScore
  const color = scoreColor(score)
  const top4  = [...diagnosis.dimensions].sort((a, b) => b.score - a.score).slice(0, 4)
  const circ  = 2 * Math.PI * 44
  const offset = circ * (1 - score / 100)

  return (
    <div style={{
      width: 360, background: '#0F0F0F', borderRadius: 20, padding: '28px 24px',
      border: '0.5px solid rgba(255,255,255,0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Dot grid bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      {/* Glow */}
      <div style={{
        position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
        width: 200, height: 100, borderRadius: '50%',
        background: `${color}18`, filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: '#F4F4F0' }}>VALLI</span>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: '#FFFD02' }}>DATOR</span>
            </div>
            {startupName && (
              <p style={{ fontSize: 11, color: 'rgba(244,244,240,0.4)', margin: '2px 0 0', letterSpacing: '0.04em' }}>
                {startupName}
              </p>
            )}
          </div>
          <div style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600,
            background: `${color}12`, border: `0.5px solid ${color}35`, color,
            letterSpacing: '0.06em',
          }}>
            {scoreLabel(score).toUpperCase()}
          </div>
        </div>

        {/* Score ring + stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          {/* Ring */}
          <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
            <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
              <circle cx="50" cy="50" r="44" fill="none"
                stroke={color} strokeWidth="5" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', color }}>{score}</span>
              <span style={{ fontSize: 10, color: 'rgba(244,244,240,0.4)', marginTop: 2 }}>/100</span>
            </div>
          </div>

          {/* Dimension highlights */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, color: 'rgba(244,244,240,0.4)', marginBottom: 8, letterSpacing: '0.08em' }}>TOP DIMENSÕES</p>
            {top4.map(d => (
              <div key={d.label} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: 'rgba(244,244,240,0.65)' }}>{d.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'monospace', color: scoreColor(d.score) }}>{d.score}</span>
                </div>
                <div style={{ height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.score}%`, background: scoreColor(d.score), borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak / strong */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'PONTO FORTE', value: diagnosis.strongestDimension, color: '#4ADE80' },
            { label: 'MAIOR RISCO', value: diagnosis.weakestDimension,   color: '#FF4D30' },
          ].map(i => (
            <div key={i.label} style={{
              flex: 1, padding: '8px 10px', borderRadius: 10,
              background: `${i.color}08`, border: `0.5px solid ${i.color}20`,
            }}>
              <p style={{ fontSize: 9, color: `${i.color}80`, margin: '0 0 2px', letterSpacing: '0.08em' }}>{i.label}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: i.color, margin: 0 }}>{i.value}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 10, color: 'rgba(244,244,240,0.25)', margin: 0 }}>
            vallidator.com · {new Date().toLocaleDateString('pt-BR')}
          </p>
          <p style={{ fontSize: 10, color: 'rgba(244,244,240,0.25)', margin: 0 }}>
            Diagnóstico {diagnosis.phase}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ShareCardModal({ diagnosis, startupName, onClose }: ShareCardModalProps) {
  const cardRef  = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
  const [imgUrl, setImgUrl]  = useState<string | null>(null)

  const generate = useCallback(async () => {
    if (!cardRef.current) return
    setStatus('generating')
    try {
      const url = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0F0F0F',
      })
      setImgUrl(url)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }, [])

  const download = () => {
    if (!imgUrl) return
    const a  = document.createElement('a')
    a.href   = imgUrl
    a.download = `vallidator-score-${diagnosis.overallScore}.png`
    a.click()
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
  }

  return (
    /* Overlay */
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div style={{
        background: '#141414', borderRadius: 20, padding: '28px 24px', maxWidth: 420, width: '100%',
        border: '0.5px solid rgba(255,255,255,0.1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: '#F4F4F0' }}>
            Compartilhar diagnóstico
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244,244,240,0.4)', fontSize: 18 }}>
            ×
          </button>
        </div>

        {/* Preview card */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div ref={cardRef}>
            <DiagnosisCard diagnosis={diagnosis} startupName={startupName} />
          </div>
        </div>

        {/* Generated image preview */}
        {imgUrl && (
          <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.1)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgUrl} alt="Score card" style={{ width: '100%', display: 'block' }} />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {status !== 'done' ? (
            <button
              onClick={generate}
              disabled={status === 'generating'}
              style={{
                padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                background: '#FFFD02', color: '#0F0F0F', border: 'none',
                opacity: status === 'generating' ? 0.6 : 1,
                boxShadow: '0 0 20px rgba(255,253,2,0.3)',
              }}
            >
              {status === 'generating' ? 'Gerando imagem…' : 'Gerar imagem do score →'}
            </button>
          ) : (
            <>
              <button onClick={download} style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer', background: '#FFFD02', color: '#0F0F0F', border: 'none', boxShadow: '0 0 20px rgba(255,253,2,0.3)' }}>
                ↓ Baixar PNG
              </button>
              <button onClick={copyLink} style={{ padding: '10px 24px', borderRadius: 12, fontSize: 14, cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(244,244,240,0.7)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
                🔗 Copiar link
              </button>
            </>
          )}
          {status === 'error' && (
            <p style={{ fontSize: 12, color: '#FF4D30', textAlign: 'center' }}>Erro ao gerar imagem. Tente novamente.</p>
          )}
        </div>
      </div>
    </div>
  )
}
