import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  email:       z.string().email(),
  password:    z.string().min(8),
  name:        z.string().optional(),
  startupName: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }
    const { email, password, name, startupName } = parsed.data
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
    }
    const hash = await bcrypt.hash(password, 12)
    const user  = await prisma.user.create({
      data: { email, password: hash, name, startupName },
      select: { id: true, email: true, name: true },
    })
    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
