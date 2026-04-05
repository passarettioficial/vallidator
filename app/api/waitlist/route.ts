import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: Request) {
  try {
    const { email, name, source } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }
    await prisma.waitlistEntry.create({ data: { email, name, source } })
    const count = await prisma.waitlistEntry.count()
    // Email de confirmação
    if (resend && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from:    'VALLIDATOR <noreply@vallidator.com>',
        to:       email,
        subject: 'Você está na lista do VALLIDATOR 🎯',
        html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0F0F0F;color:#F4F4F0;padding:32px;border-radius:12px">
  <p style="font-size:18px;font-weight:600;color:#FFFD02;margin-bottom:8px">VALLIDATOR</p>
  <p style="font-size:14px;color:#F4F4F0;margin-bottom:16px">Olá, ${name || 'Founder'} 👋</p>
  <p style="font-size:14px;color:rgba(244,244,240,0.7);line-height:1.6;margin-bottom:16px">
    Você é o nº <strong style="color:#FFFD02">${count}</strong> da lista de espera do VALLIDATOR.
    Avisaremos quando o acesso completo ao Navigator for liberado.
  </p>
  <p style="font-size:12px;color:rgba(244,244,240,0.35)">
    Enquanto isso, faça o pré-diagnóstico gratuito em 2 minutos:<br>
    <a href="${process.env.NEXTAUTH_URL}/pre-check" style="color:#FFFD02">vallidator.com/pre-check</a>
  </p>
</div>`,
      }).catch(() => { /* não bloqueia a resposta */ })
    }
    return NextResponse.json({ success: true, position: count })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET() {
  const count = await prisma.waitlistEntry.count()
  return NextResponse.json({ count: count + 312 }) // seed offset
}
