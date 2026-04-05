import { NextResponse } from 'next/server'
import { auth } from '@/auth'

// Checkout route — integração com Stripe/Pagar.me futura
// Por enquanto retorna mock para desenvolvimento local

const PLAN_PRICES: Record<string, { name: string; priceId?: string; amount: number }> = {
  mentor:   { name: 'Mentor',   amount: 14900 },
  board:    { name: 'Board',    amount: 39700 },
  series_a: { name: 'Series A', amount: 89700 },
}

export async function POST(req: Request) {
  const session = await auth()

  try {
    const { planId } = await req.json()
    const plan = PLAN_PRICES[planId]

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 400 })
    }

    // Se Stripe não estiver configurado, retorna mock
    if (!process.env.STRIPE_SECRET_KEY) {
      // Em produção: criar sessão Stripe aqui
      return NextResponse.json({
        url: null,
        message: 'Stripe not configured — use dashboard',
        plan: plan.name,
        amount: plan.amount,
      })
    }

    // TODO: integrar Stripe
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const checkoutSession = await stripe.checkout.sessions.create({ ... })
    // return NextResponse.json({ url: checkoutSession.url })

    return NextResponse.json({ url: null })
  } catch (err) {
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
