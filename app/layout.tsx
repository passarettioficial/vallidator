import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'VALLIDATOR — Diagnóstico honesto para startups',
  description: 'Diagnóstico em 8 dimensões baseado em 1.000 casos reais de falhas. Descubra onde sua startup vai falhar — antes de falhar.',
  openGraph: {
    title: 'VALLIDATOR',
    description: 'Diagnóstico honesto para startups. Score em 8 dimensões.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-obsidian antialiased">{children}</body>
    </html>
  )
}
