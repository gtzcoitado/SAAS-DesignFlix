import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { stripe } from '../_shared/stripe.ts'
import { createOrRetrieveCustomer } from "../_shared/utils.ts"
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) throw new Error("User not found.")

    const { plan } = await req.json()
    if (!plan || !plan.price || !plan.name) {
      throw new Error("Plan details are missing.")
    }

    const customer = await createOrRetrieveCustomer({
      uuid: user.id,
      email: user.email,
    })

    const amountInCents = Math.round(plan.price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: customer,
      metadata: {
        user_id: user.id,
        plan_name: plan.name,
      }
    })

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})