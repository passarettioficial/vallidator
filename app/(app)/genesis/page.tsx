'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STARTUP_STAGES = [
  { v: 'idea',      l: 'Ideia',         d: 'Ainda não construí nada' },
  { v: 'mvp',       l: 'MVP',           d: 'Produto básico funcionando' },
  { v: 'traction',  l: 'Tração',        d: 'Tenho usuários ou clientes ativos' },
  { v: 'scale',     l: 'Escala',        d: 'Crescendo e otimizando canais' },
]

const SEGMENT_OPTIONS = [
  { v: 'b2b',       l: 'B2B',           d: 'Vendo para empresas' },
  { v: 'b2c',       l: 'B2C',           d: 'Vendo para consumidores' },
  { v: 'b2b2c',     l: 'B2B2C',         d: 'Modelo híbrido' },
  { v: 'marketplace',l:'Marketplace',   d: 'Plataforma entre partes' },
]

export default function GenesisPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', stage: '', segment: '', revenue: '' })
  const [loading, setLoading] = useState(false)

  const valid = form.name.trim().length >= 2 && form.stage && form.segment

  const handleSubmit = async () => {
    if (!valid) return
    setLoading(true)
    try {
      // Salvar metadados da startup no localStorage para uso no diagnóstico
      localStorage.setItem('startup_meta', JSON.stringify(form))
      router.push('/welcome')
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <span className="text-sm font-semibold tracking-widest text-field">VALLI</span>
          <span className="text-sm font-semibold tracking-widest text-volt">DATOR</span>
        </div>

        <h1 className="font-bold text-2xl mb-1" style={{ letterSpacing: '-0.02em' }}>Configure sua startup</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(244,244,240,0.45)' }}>
          Estas informações personalizam todo o diagnóstico.
        </p>

        {/* Nome */}
        <div className="mb-6">
          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(244,244,240,0.6)', letterSpacing: '0.06em' }}>
            NOME DA STARTUP
          </label>
          <input
            type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="ex: DataLayer AI"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none glass"
            style={{ border: `0.5px solid ${form.name.length >= 2 ? 'rgba(255,253,2,0.3)' : 'rgba(255,255,255,0.1)'}`, color: '#F4F4F0' }}
          />
        </div>

        {/* Estágio */}
        <div className="mb-6">
          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(244,244,240,0.6)', letterSpacing: '0.06em' }}>
            ESTÁGIO ATUAL
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STARTUP_STAGES.map(opt => (
              <button key={opt.v} onClick={() => setForm(f => ({ ...f, stage: opt.v }))}
                className="p-3 rounded-xl text-left transition-all glass"
                style={{ border: `0.5px solid ${form.stage === opt.v ? 'rgba(255,253,2,0.4)' : 'rgba(255,255,255,0.08)'}`, background: form.stage === opt.v ? 'rgba(255,253,2,0.06)' : undefined }}>
                <p className="text-sm font-medium" style={{ color: form.stage === opt.v ? '#FFFD02' : '#F4F4F0' }}>{opt.l}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(244,244,240,0.4)' }}>{opt.d}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Segmento */}
        <div className="mb-6">
          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(244,244,240,0.6)', letterSpacing: '0.06em' }}>
            MODELO DE NEGÓCIO
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SEGMENT_OPTIONS.map(opt => (
              <button key={opt.v} onClick={() => setForm(f => ({ ...f, segment: opt.v }))}
                className="p-3 rounded-xl text-left transition-all glass"
                style={{ border: `0.5px solid ${form.segment === opt.v ? 'rgba(255,253,2,0.4)' : 'rgba(255,255,255,0.08)'}`, background: form.segment === opt.v ? 'rgba(255,253,2,0.06)' : undefined }}>
                <p className="text-sm font-medium" style={{ color: form.segment === opt.v ? '#FFFD02' : '#F4F4F0' }}>{opt.l}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(244,244,240,0.4)' }}>{opt.d}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Receita (opcional) */}
        <div className="mb-8">
          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(244,244,240,0.6)', letterSpacing: '0.06em' }}>
            RECEITA MENSAL <span className="text-[10px] normal-case" style={{ color: 'rgba(244,244,240,0.3)' }}>(opcional)</span>
          </label>
          <input
            type="text" value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))}
            placeholder="ex: R$ 15.000 / mês ou Pré-receita"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none glass"
            style={{ border: '0.5px solid rgba(255,255,255,0.1)', color: '#F4F4F0' }}
          />
        </div>

        <button onClick={handleSubmit} disabled={!valid || loading}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 shadow-volt"
          style={{ background: '#FFFD02', color: '#0F0F0F' }}>
          {loading ? 'Salvando...' : 'Ir para o diagnóstico →'}
        </button>
      </div>
    </div>
  )
}
