import OpenAI from 'openai'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import type { DiagnosisResult, FormAnswers, CalibrationAnswers } from '@/lib/scoreEngine'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

const SYSTEM_PROMPT = `Você é o VALLIDATOR — sistema de diagnóstico de startups com acesso a 1.000 casos reais de falhas documentadas.

Seu parecer é clínico, direto e honesto. Nunca use linguagem motivacional ou eufemismos. Fale como um mentor sênior que já viu muitas startups falharem pelos mesmos padrões.

Responda APENAS em JSON válido com exatamente estas 4 chaves:
{
  "abertura": "2-3 frases avaliando o estado atual da startup com base nos scores",
  "risco": "2-3 frases sobre o principal risco identificado com referência ao padrão de falha",
  "forca": "1-2 frases sobre o principal diferencial ou força identificada",
  "proximoPasso": "1 ação específica e concreta para os próximos 7 dias"
}

Máximo 60 palavras por campo. Use português brasileiro. Mencione as dimensões pelo nome.`

function buildUserPrompt(params: {
  diagnosis:   DiagnosisResult
  formAnswers?: FormAnswers | null
  calAnswers?:  CalibrationAnswers | null
  dbStats?:    { total: number; por_dimensao: Record<string, number> } | null
}): string {
  const { diagnosis, formAnswers, calAnswers, dbStats } = params
  const { overallScore, dimensions, strongestDimension, weakestDimension } = diagnosis

  const dimList = dimensions
    .sort((a, b) => b.score - a.score)
    .map(d => `  ${d.label}: ${d.score}/100 (${d.status})`)
    .join('\n')

  const weakPct = dbStats?.por_dimensao?.[weakestDimension]
    ? `${((dbStats.por_dimensao[weakestDimension] / (dbStats.total || 1)) * 100).toFixed(0)}%`
    : '~42%'

  const formCtx = formAnswers ? `
RESPOSTAS DO FORMULÁRIO:
- One-liner: "${formAnswers.one_liner ?? 'não informado'}"
- Estágio: ${formAnswers.stage ?? 'não informado'}
- ICP: "${formAnswers.icp ?? 'não informado'}"
- TAM: ${formAnswers.tam ?? 'não informado'}
- Diferencial: "${formAnswers.unique ?? 'não informado'}"
- Concorrente: ${formAnswers.competition ?? 'não informado'}
- MOAT: ${formAnswers.moat ?? 'não informado'}
- Time: ${formAnswers.team ?? 'não informado'}
- Runway: ${formAnswers.runway ?? 'não informado'}
- Tração: "${formAnswers.traction ?? 'não informado'}"` : ''

  const calCtx = calAnswers ? `
PERFIL (Calibração):
- Estágio: ${calAnswers.stage ?? 'não informado'}
- Modelo: ${calAnswers.model ?? 'não informado'}
- Background: ${calAnswers.background ?? 'não informado'}
- Objetivo: ${calAnswers.goal ?? 'não informado'}` : ''

  return `DIAGNÓSTICO GÊNESIS — ${new Date(diagnosis.completedAt).toLocaleDateString('pt-BR')}

SCORE GERAL: ${overallScore}/100
Dimensão mais forte: ${strongestDimension} (${dimensions.find(d => d.label === strongestDimension)?.score ?? '–'}/100)
Dimensão mais fraca: ${weakestDimension} (${dimensions.find(d => d.label === weakestDimension)?.score ?? '–'}/100)

SCORES POR DIMENSÃO:
${dimList}
${formCtx}
${calCtx}

CONTEXTO: ${weakPct} das startups documentadas falharam por problemas em ${weakestDimension}.

Gere o parecer em JSON.`
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body: {
      diagnosisId: string
      diagnosis:   DiagnosisResult
      formAnswers?: FormAnswers | null
      calAnswers?:  CalibrationAnswers | null
    } = await req.json()
    const { diagnosisId, diagnosis, formAnswers, calAnswers } = body

    // Verifica ownership
    const record = await prisma.diagnosis.findUnique({ where: { id: diagnosisId, userId: session.user.id } })
    if (!record) return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 })

    if (!openai) {
      // Fallback determinístico sem OpenAI
      return NextResponse.json({ parecer: null, fallback: true }, { status: 200 })
    }
    const completion = await openai.chat.completions.create({
      model:           'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt({ diagnosis, formAnswers, calAnswers }) },
      ],
      max_tokens:       600,
      temperature:      0.65,
      response_format:  { type: 'json_object' },
    })

    const parsed = JSON.parse(completion.choices[0].message.content ?? '{}') as {
      abertura: string; risco: string; forca: string; proximoPasso: string
    }

    // Persiste parecer no Diagnosis
    await prisma.diagnosis.update({
      where: { id: diagnosisId },
      data: {
        parecerAbertura: parsed.abertura,
        parecerRisco:    parsed.risco,
        parecerForca:    parsed.forca,
        parecerPasso:    parsed.proximoPasso,
        parecerSource:   'gpt-4o-mini',
      },
    })

    return NextResponse.json({ ...parsed, source: 'gpt-4o-mini' })
  } catch (err) {
    console.error('[/api/parecer]', err)
    return NextResponse.json({ error: 'Erro ao gerar parecer' }, { status: 500 })
  }
}
