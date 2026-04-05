'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [name, setName]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauth] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Erro ao criar conta')
          setLoading(false)
          return
        }
      }
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }
      router.push(mode === 'register' ? '/welcome' : '/dashboard')
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  async function handleOAuth(provider: string) {
    setOauth(provider)
    await signIn(provider, { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen bg-obsidian dot-grid flex items-center justify-center px-4">
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div className="flex items-baseline justify-center mb-8">
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', color: '#F4F4F0' }}>VALLI</span>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', color: '#FFFD02' }}>DATOR</span>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8" style={{ border: '0.5px solid rgba(255,255,255,0.1)' }}>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: mode === m ? 'rgba(255,255,255,0.08)' : 'transparent', color: mode === m ? '#F4F4F0' : 'rgba(244,244,240,0.45)' }}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* OAuth buttons */}
          <div className="space-y-2 mb-5">
            <button onClick={() => handleOAuth('google')} disabled={!!oauthLoading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#F4F4F0' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {oauthLoading === 'google' ? 'Aguarde...' : `${mode === 'login' ? 'Entrar' : 'Cadastrar'} com Google`}
            </button>

            <button onClick={() => handleOAuth('apple')} disabled={!!oauthLoading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#F4F4F0' }}>
              <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 372.8 0 252.8 0 140.8 0 62.7 26 24.5 67.8 24.5c44 0 68.2 31 139.5 31s107.1-38.9 157.5-38.9c35 0 71.8 21.5 95.4 58.3L482 32.5C504.6 12 554.1 0 585 0c56 0 103.1 31.2 134.2 79C834.7 195.5 794 288.2 788.1 340.9z"/>
              </svg>
              {oauthLoading === 'apple' ? 'Aguarde...' : `${mode === 'login' ? 'Entrar' : 'Cadastrar'} com Apple`}
            </button>

            <button onClick={() => handleOAuth('linkedin')} disabled={!!oauthLoading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', color: '#F4F4F0' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              {oauthLoading === 'linkedin' ? 'Aguarde...' : `${mode === 'login' ? 'Entrar' : 'Cadastrar'} com LinkedIn`}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-[11px]" style={{ color: 'rgba(244,244,240,0.3)' }}>ou com e-mail</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none glass"
                style={{ border: '0.5px solid rgba(255,255,255,0.1)', color: '#F4F4F0' }} />
            )}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none glass"
              style={{ border: '0.5px solid rgba(255,255,255,0.1)', color: '#F4F4F0' }} />
            <input type="password" value={password} onChange={e => setPass(e.target.value)}
              placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : 'Senha'}
              required minLength={mode === 'register' ? 8 : 1}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none glass"
              style={{ border: '0.5px solid rgba(255,255,255,0.1)', color: '#F4F4F0' }} />

            {error && <p className="text-xs" style={{ color: '#FF4D30' }}>{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50"
              style={{ background: '#FFFD02', color: '#0F0F0F', boxShadow: '0 0 20px rgba(255,253,2,0.25)' }}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar →' : 'Criar conta →'}
            </button>
          </form>
        </div>

        {/* Back link */}
        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(244,244,240,0.3)' }}>
          <Link href="/" className="hover:opacity-70">← Voltar para o início</Link>
        </p>
      </div>
    </div>
  )
}
