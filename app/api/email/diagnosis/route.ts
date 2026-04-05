import { Resend } from 'resend'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function stageLabel(score: number) {
  if (score >= 78) return 'Série A Ready'
  if (score >= 60) return 'Seed Ready'
  if (score >= 40) return 'Pre-seed'
  return 'Pré-investimento'
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { diagnosisId } = await req.json()
    const d = await prisma.diagnosis.findUnique({
      where: { id: diagnosisId, userId: session.user.id },
      include: { user: true },
    })
    if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const dims = d.dimensions as Array<{ label: string; score: number }>
    if (!resend) return NextResponse.json({ error: 'Email not configured' }, { status: 503 })
    await resend.emails.send({
      from:    'VALLIDATOR <noreply@vallidator.com>',
      to:       d.user.email,
      subject: `Seu diagnóstico VALLIDATOR — Score ${d.overallScore}/100`,
      html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0F0F0F;color:#F4F4F0;padding:32px;border-radius:12px">
  <p style="font-size:16px;font-weight:700;color:#FFFD02;letter-spacing:0.06em">VALLIDATOR</p>
  <p style="font-size:13px;color:rgba(244,244,240,0.5);margin-bottom:24px">Diagnóstico Gênesis · ${new Date(d.completedAt).toLocaleDateString('pt-BR')}</p>

  <div style="text-align:center;padding:24px;border:1px solid rgba(255,253,2,0.2);border-radius:12px;margin-bottom:24px">
    <p style="font-size:48px;font-weight:700;color:#FFFD02;margin:0">${d.overallScore}</p>
    <p style="font-size:12px;color:rgba(244,244,240,0.5);margin:4px 0 12px">/100 · Fase Gênesis</p>
    <p style="font-size:13px;color:#F4F4F0;margin:0">${stageLabel(d.overallScore)}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    ${dims.sort((a,b) => b.score - a.score).map(dim => `
    <tr>
      <td style="padding:6px 0;font-size:12px;color:rgba(244,244,240,0.6)">${dim.label}</td>
      <td style="padding:6px 0;text-align:right;font-size:12px;font-weight:600;color:${dim.score >= 70 ? '#4ADE80' : dim.score >= 50 ? '#FFFD02' : '#FF4D30'}">${dim.score}/100</td>
    </tr>`).join('')}
  </table>

  <div style="margin-bottom:24px;padding:16px;background:rgba(255,77,48,0.08);border-radius:8px;border:1px solid rgba(255,77,48,0.2)">
    <p style="font-size:11px;color:rgba(255,77,48,0.7);margin:0 0 4px">MAIOR RISCO</p>
    <p style="font-size:13px;font-weight:600;color:#FF4D30;margin:0">${d.weakestDim}</p>
  </div>

  <p style="text-align:center;margin:0">
    <a href="${process.env.NEXTAUTH_URL}/diagnosis/${d.id}"
       style="display:inline-block;padding:12px 24px;background:#FFFD02;color:#0F0F0F;font-weight:600;font-size:13px;text-decoration:none;border-radius:8px">
      Ver diagnóstico completo →
    </a>
  </p>
</div>`,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/email/diagnosis]', err)
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 })
  }
}
