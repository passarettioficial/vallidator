'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  name: string
  email: string
  startupName: string
  stage: string
  segment: string
  revenue: string
  notifications: boolean
  theme: string
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  startupName: '',
  stage: '',
  segment: '',
  revenue: '',
  notifications: true,
  theme: 'dark',
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Carrega dados da sessão
    if (session?.user) {
      setProfile(p => ({
        ...p,
        name:  session.user?.name  ?? '',
        email: session.user?.email ?? '',
      }))
    }
    // Carrega dados locais
    const rawMeta = localStorage.getItem('startup_meta')
    if (rawMeta) {
      const meta = JSON.parse(rawMeta)
      setProfile(p => ({ ...p, startupName: meta.name ?? '', stage: meta.stage ?? '', segment: meta.segment ?? '', revenue: meta.revenue ?? '' }))
    }
  }, [session])

  const handleSave = () => {
    localStorage.setItem('startup_meta', JSON.stringify({
      name: profile.startupName,
      stage: profile.stage,
      segment: profile.segment,
      revenue: profile.revenue,
    }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const set = (k: keyof UserProfile, v: string | boolean) => setProfile(p => ({ ...p, [k]: v }))

  return (
    <div className="min-h-screen bg-obsidian pb-24">
      <div className="max-w-xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-2xl mb-1" style={{ letterSpacing: '-0.02em' }}>Configurações</h1>
          <p className="text-sm" style={{ color: 'rgba(244,244,240,0.45)' }}>Gerencie sua conta e preferências.</p>
        </div>

        {/* Conta */}
        <Section title="CONTA">
          <Field label="Nome" value={profile.name} onChange={v => set('name', v)} placeholder="Seu nome completo" />
          <Field label="E-mail" value={profile.email} onChange={v => set('email', v)} placeholder="seu@email.com" type="email" disabled />
        </Section>

        {/* Startup */}
        <Section title="STARTUP">
          <Field label="Nome da startup" value={profile.startupName} onChange={v => set('startupName', v)} placeholder="ex: DataLayer AI" />
          <Field label="Receita mensal" value={profile.revenue} onChange={v => set('revenue', v)} placeholder="ex: R$ 15.000 / mês" />
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(244,244,240,0.6)', letterSpacing: '0.06em' }}>ESTÁGIO</label>
            <div className="flex gap-2 flex-wrap">
              {['idea', 'mvp', 'traction', 'scale'].map(s => (
                <button key={s} onClick={() => set('stage', s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                  style={{ background: profile.stage === s ? 'rgba(255,253,2,0.1)' : 'rgba(255,255,255,0.05)', border: `0.5px solid ${profile.stage === s ? 'rgba(255,253,2,0.35)' : 'rgba(255,255,255,0.08)'}`, color: profile.stage === s ? '#FFFD02' : 'rgba(244,244,240,0.5)' }}>
                  {s === 'idea' ? 'Ideia' : s === 'mvp' ? 'MVP' : s === 'traction' ? 'Tração' : 'Escala'}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Preferências */}
        <Section title="PREFERÊNCIAS">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm" style={{ color: '#F4F4F0' }}>Notificações de missões</p>
              <p className="text-xs" style={{ color: 'rgba(244,244,240,0.4)' }}>Lembretes semanais de progresso</p>
            </div>
            <button onClick={() => set('notifications', !profile.notifications)}
              className="w-10 h-6 rounded-full transition-all relative"
              style={{ background: profile.notifications ? '#FFFD02' : 'rgba(255,255,255,0.1)' }}>
              <div className="w-4 h-4 rounded-full bg-obsidian absolute top-1 transition-all"
                style={{ left: profile.notifications ? 22 : 4 }} />
            </button>
          </div>
        </Section>

        {/* Diagnósticos */}
        <Section title="DADOS DO DIAGNÓSTICO">
          <button onClick={() => {
            localStorage.removeItem('vallidator-diagnosis')
            localStorage.removeItem('vallidator-form-answers')
            localStorage.removeItem('vallidator-calibration-answers')
            localStorage.removeItem('vallidator-missions-completed')
            router.push('/calibration')
          }}
            className="w-full py-3 rounded-xl text-sm font-medium text-left px-4 glass hover:opacity-80"
            style={{ border: '0.5px solid rgba(255,77,48,0.2)', color: '#FF4D30' }}>
            Refazer diagnóstico completo
          </button>
          <p className="text-xs mt-1" style={{ color: 'rgba(244,244,240,0.3)' }}>Isso apaga seu score atual e reinicia o processo.</p>
        </Section>

        {/* Actions */}
        <div className="space-y-3 mt-8">
          <button onClick={handleSave}
            className="w-full py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 shadow-volt"
            style={{ background: '#FFFD02', color: '#0F0F0F' }}>
            {saved ? '✓ Salvo com sucesso' : 'Salvar alterações'}
          </button>
          <button onClick={handleSignOut}
            className="w-full py-3 rounded-xl text-sm font-medium glass hover:opacity-80"
            style={{ border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(244,244,240,0.5)' }}>
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <p className="text-[10px] font-mono mb-3" style={{ color: 'rgba(244,244,240,0.35)', letterSpacing: '0.1em' }}>{title}</p>
      <div className="glass rounded-2xl p-4 space-y-4" style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', disabled }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(244,244,240,0.55)', letterSpacing: '0.06em' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none glass"
        style={{ border: '0.5px solid rgba(255,255,255,0.1)', color: disabled ? 'rgba(244,244,240,0.4)' : '#F4F4F0' }} />
    </div>
  )
}
