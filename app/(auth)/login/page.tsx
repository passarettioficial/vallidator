'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router   = useRouter()
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [name, setName]       = useState('')
  const [startup, setStartup] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, startupName: startup }),
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Erro ao criar conta')
          setLoading(false)
          return
        }
      }
      const result = await signIn('credentials', {
        email, password, redirect: false,
      })
      if (result?.error) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }
      router.push(mode === 'register' ? '/welcome' : '/dashboard')
    } catch {
      setError('Erro de conexão')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian dot-grid flex">
      {/* Left — hero */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] px-12 py-14"
        style={{ borderRight: '0.5px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-baseline">
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', color: '#F4F4F0' }}>VALLI</span>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', color: '#FFFD02' }}>DATOR</span>
        </div>
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mono"
            style={{ background: 'rgba(255,253,2,0.08)', border: '0.5px solid rgba(255,253,2,0.2)', color: 'rgba(255,253,2,0.8)' }}>
            ⚡ Mentoria guiada por IA
          </div>
          <h1 className="font-bold" style={{ fontSize: 40, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Descubra por que<br />
            <span style={{ color: '#FFFD02' }}>90% das startups</span><br />
            encerram — antes<br />de você encerrar.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,244,240,0.5)', maxWidth: 320 }}>
            Diagnóstico em 8 dimensões contra um banco de 1.000 falhas reais.
          </p>
          {/* Link pré-diagnóstico */}
          <Link href="/pre-check"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:opacity-90"
            style={{ background: 'rgba(255,253,2,0.05)', border: '0.5px solid rgba(255,253,2,0.18)' }}>
            <div className="flex-1">
              <p className="text-xs font-medium" style={{ color: 'rgba(255,253,2,0.85)' }}>Quer ver o sinal antes de criar conta?</p>
              <p className="text-[11px]" style={{ color: 'rgba(244,244,240,0.4)' }}>3 perguntas · 2 minutos · sem cadastro</p>
            </div>
            <span style={{ color: 'rgba(255,253,2,0.5)', fontSize: 16 }}>→</span>
          </Link>
        </div>
        <div className="flex gap-6">
          {[{ v: '1.000+', l: 'Casos' }, { v: '8x', l: 'Dimensões' }, { v: '2min', l: 'Pré-diagnóstico' }].map(s => (
            <div key={s.v}>
              <p className="mono text-xl font-bold" style={{ color: '#FFFD02' }}>{s.v}</p>
              <p className="text-[11px]" style={{ color: 'rgba(244,244,240,0.4)' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mode toggle */}
          <div className="flex rounded-lg p-0.5 mb-8"
            style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-md text-sm font-medium transition-all"
                style={{ background: mode === m ? '#FFFD02' : 'transparent', color: mode === m ? '#0F0F0F' : 'rgba(244,244,240,0.4)' }}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'rgba(244,244,240,0.6)' }}>Nome</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu primeiro nome"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none glass" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'rgba(244,244,240,0.6)' }}>Startup</label>
                  <input value={startup} onChange={e => setStartup(e.target.value)} placeholder="Nome da startup"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none glass" />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: 'rgba(244,244,240,0.6)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none glass" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: 'rgba(244,244,240,0.6)' }}>Senha</label>
              <input type="password" value={password} onChange={e => setPass(e.target.value)} placeholder="••••••••" required minLength={8}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none glass" />
            </div>
            {error && <p className="text-xs" style={{ color: '#FF4D30' }}>{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm mt-2 hover:opacity-90 transition-all disabled:opacity-60 volt-glow"
              style={{ background: '#FFFD02', color: '#0F0F0F' }}>
              {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta gratuita'} {!loading && '→'}
            </button>
          </form>

          <div className="flex items-center gap-3 mt-6 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs" style={{ color: 'rgba(244,244,240,0.3)' }}>ou</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>
          <button onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm glass hover:opacity-80 transition-all">
            GitHub
          </button>
          <p className="text-center text-[11px] mt-6" style={{ color: 'rgba(244,244,240,0.3)' }}>
            Ao continuar você aceita os{' '}
            <span className="underline cursor-pointer" style={{ color: 'rgba(255,253,2,0.5)' }}>Termos</span>
            {' '}e a{' '}
            <span className="underline cursor-pointer" style={{ color: 'rgba(255,253,2,0.5)' }}>Privacidade</span>
          </p>
        </div>
      </div>
    </div>
  )
}
