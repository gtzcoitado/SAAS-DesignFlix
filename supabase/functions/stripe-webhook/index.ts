import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stripe } from '../_shared/stripe.ts'
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts"

const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  try {
    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      stripeWebhookSecret,
      undefined,
    )
    
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object
      const userId = intent.metadata.user_id

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_subscribed: true,
          subscribed_since: new Date().toISOString() 
        })
        .eq('id', userId)

      if (error) {
        console.error(`Error updating profile for user ${userId}:`, error)
        throw error
      }
      console.log(`Subscription activated for user: ${userId}`)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})