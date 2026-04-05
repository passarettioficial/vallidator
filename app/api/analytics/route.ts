import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()

  try {
    const body = await req.json()
    const { name, page, action, metadata } = body

    if (!name) {
      return NextResponse.json({ error: 'Event name required' }, { status: 400 })
    }

    // Salva evento se houver usuário autenticado e DB disponível
    if (session?.user?.id && process.env.DATABASE_URL) {
      try {
        await prisma.analyticsEvent.create({
          data: {
            userId: session.user.id,
            event:  name,
            props:  { page: page ?? '/', action: action ?? name, ...(metadata ?? {}) },
          },
        })
      } catch {
        // Ignora erros de DB — analytics não deve bloquear UX
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Analytics error' }, { status: 500 })
  }
}
