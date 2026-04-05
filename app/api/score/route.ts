import { calculateScore, applyCalibrationContext } from '@/lib/scoreEngine'
import type { FormAnswers, CalibrationAnswers } from '@/lib/scoreEngine'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body: { formAnswers: FormAnswers; calAnswers?: CalibrationAnswers } = await req.json()
    const { formAnswers, calAnswers } = body

    // Score Engine — server-side (API key segura, lógica não exposta ao cliente)
    const raw    = calculateScore(formAnswers)
    const result = calAnswers ? applyCalibrationContext(raw, calAnswers) : raw

    // Persiste no PostgreSQL
    const diagnosis = await prisma.diagnosis.create({
      data: {
        userId:       session.user.id,
        overallScore: result.overallScore,
        dimensions:   result.dimensions as object[],
        weakestDim:   result.weakestDimension,
        strongestDim: result.strongestDimension,
        formAnswers:  formAnswers as object,
        calAnswers:   calAnswers as object | undefined,
        completedAt:  new Date(result.completedAt),
      },
    })

    // Atualiza XP do usuário
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 120 }, lastVisitAt: new Date() },
    })

    return NextResponse.json({
      diagnosisId:     diagnosis.id,
      overallScore:    result.overallScore,
      dimensions:      result.dimensions,
      weakestDimension:  result.weakestDimension,
      strongestDimension: result.strongestDimension,
      phase:           result.phase,
      completedAt:     result.completedAt,
    })
  } catch (err) {
    console.error('[/api/score]', err)
    return NextResponse.json({ error: 'Erro ao calcular score' }, { status: 500 })
  }
}
