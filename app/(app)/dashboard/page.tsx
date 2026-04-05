import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const session = await auth()

  // Busca dados do servidor com fallback silencioso
  let userName = session?.user?.name ?? ''
  let plan     = 'explorer'
  let xp       = 0
  let serverDx: {
    id: string; overallScore: number; weakestDim: string
    strongestDim: string; completedAt: string; phase: string
  } | null = null

  if (session?.user?.id && process.env.DATABASE_URL) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          diagnoses: { orderBy: { completedAt: 'desc' }, take: 1 },
          subscription: true,
        },
      })
      if (user) {
        userName = user.name ?? userName
        plan     = user.subscription?.plan ?? 'explorer'
        xp       = user.xp ?? 0
        const dx = user.diagnoses[0]
        if (dx) {
          serverDx = {
            id:           dx.id,
            overallScore: dx.overallScore,
            weakestDim:   dx.weakestDim,
            strongestDim: dx.strongestDim,
            completedAt:  dx.completedAt.toISOString(),
            phase:        'Gênesis',
          }
        }
      }
    } catch {
      // DB não disponível — dashboard usa localStorage via DashboardClient
    }
  }

  return (
    <DashboardClient
      userName={userName}
      plan={plan}
      xp={xp}
      serverDx={serverDx}
    />
  )
}
