'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { calculateScore, applyCalibrationContext } from '@/lib/scoreEngine'
import type { FormAnswers, CalibrationAnswers, DiagnosisResult } from '@/lib/scoreEngine'

const STEPS = [
  { label: 'Analisando proposta de valor…',       ms: 600 },
  { label: 'Avaliando evidências de mercado…',    ms: 1000 },
  { label: 'Calculando diferenciação…',           ms: 700 },
  { label: 'Verificando fatores de execução…',   ms: 800 },
  { label: 'Cruzando com 1.000 casos reais…',     ms: 1200 },
  { label: 'Gerando Parecer IA…',                 ms: 900 },
  { label: 'Finalizando diagnóstico…',            ms: 500 },
]

export default function ProcessingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    const runSteps = async () => {
      let elapsed = 0
      const total = STEPS.reduce((s, s2) => s + s2.ms, 0)

      for (let i = 0; i < STEPS.length; i++) {
        setStep(i)
        const start = Date.now()
        await new Promise<void>(resolve => {
          const tick = () => {
            elapsed += Date.now() - start
            setProgress(Math.min(100, Math.round((elapsed / total) * 100)))
            if (Date.now() - start >= STEPS[i].ms) resolve()
            else requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        })
      }

      // Calcular score
      try {
        const rawForm = localStorage.getItem('vallidator-form-answers')
        const rawCal  = localStorage.getItem('vallidator-calibration-answers')
        const formAnswers: FormAnswers = rawForm ? JSON.parse(rawForm) : {}
        const calAnswers: CalibrationAnswers | null = rawCal ? JSON.parse(rawCal) : null

        let result: DiagnosisResult = calculateScore(formAnswers)
        if (calAnswers) result = applyCalibrationContext(result, calAnswers)

        // Salvar resultado para o dashboard
        localStorage.setItem('vallidator-diagnosis', JSON.stringify(result))
        localStorage.setItem('vallidator-diagnosis-id', `local-${Date.now()}`)

        // Tentar persistir via API (falha silenciosa se sem auth)
        try {
          await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formAnswers, calAnswers }),
          })
        } catch { /* sem auth — continua local */ }

        // Pequeno delay visual
        await new Promise(r => setTimeout(r, 300))
        router.push('/dashboard')
      } catch (err) {
        console.error('Processing error:', err)
        router.push('/dashboard')
      }
    }

    runSteps()
  }, [router])

  const currentStep = STEPS[step]

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <span className="text-sm font-semibold tracking-widest text-field">VALLI</span>
          <span className="text-sm font-semibold tracking-widest text-volt">DATOR</span>
        </div>

        {/* Score ring placeholder */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
            <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle cx="56" cy="56" r="48" fill="none"
              stroke="#FFFD02" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.2s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-xl font-mono" style={{ color: '#FFFD02' }}>{progress}%</span>
          </div>
        </div>

        {/* Status */}
        <p className="text-sm font-mono mb-2" style={{ color: 'rgba(255,253,2,0.7)', letterSpacing: '0.06em' }}>
          ANALISANDO
        </p>
        <p className="text-sm" style={{ color: 'rgba(244,244,240,0.5)', minHeight: 20 }}>
          {currentStep?.label ?? 'Finalizando…'}
        </p>

        {/* Steps */}
        <div className="mt-10 space-y-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: i < step ? 'rgba(74,222,128,0.15)' : i === step ? 'rgba(255,253,2,0.12)' : 'rgba(255,255,255,0.05)', border: `0.5px solid ${i < step ? '#4ADE80' : i === step ? 'rgba(255,253,2,0.5)' : 'transparent'}` }}>
                {i < step ? (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : i === step ? (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFFD02', animation: 'pulse 1s infinite' }} />
                ) : null}
              </div>
              <span className="text-[11px] text-left" style={{ color: i < step ? 'rgba(74,222,128,0.7)' : i === step ? 'rgba(244,244,240,0.7)' : 'rgba(244,244,240,0.25)' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
