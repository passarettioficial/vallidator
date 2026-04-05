import { NextResponse } from 'next/server'

// Webhook Stripe — para processar eventos de pagamento em produção
export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  try {
    const body = await req.text()

    // TODO: verificar assinatura com Stripe
    // const event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET)
    // switch (event.type) {
    //   case 'checkout.session.completed': ...
    //   case 'customer.subscription.deleted': ...
    // }

    return NextResponse.json({ received: true })
  } catch (err) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
