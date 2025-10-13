import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts"

const PAYPAL_API = Deno.env.get('PAYPAL_MODE') === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')!
const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET')!

// Função para obter token de acesso do PayPal
async function getPayPalAccessToken() {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  
  const data = await response.json()
  return data.access_token
}

// Mapear planos para IDs do PayPal (você criará esses planos no dashboard do PayPal)
const PLAN_IDS = {
  'Weekly': 'P-7K967653Y3261684NNDT2HHQ',
  'Monthly': 'P-3J43811111750230YNDT2HHQ',
  'Quarterly': 'P-82X17363W8263951MNDT2HHY'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (!user) throw new Error("User not found.")

    const { plan } = await req.json()
    if (!plan || !plan.name) {
      throw new Error("Plan details are missing.")
    }

    // Obter token do PayPal
    const accessToken = await getPayPalAccessToken()

    // Pegar ID do plano no PayPal
    const planId = PLAN_IDS[plan.name]
    if (!planId) {
      throw new Error(`Plan ${plan.name} not configured`)
    }

    // Criar assinatura no PayPal
    const subscriptionData = {
      plan_id: planId,
      subscriber: {
        name: {
          given_name: user.user_metadata?.full_name?.split(' ')[0] || 'Customer',
          surname: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'User',
        },
        email_address: user.email,
      },
      application_context: {
        brand_name: 'Design Flix',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${Deno.env.get('PROJECT_URL')}/dashboard`,
        cancel_url: `${Deno.env.get('PROJECT_URL')}/pricing`,
      },
    }

    const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData),
    })

    const subscription = await response.json()

    if (!response.ok) {
      throw new Error(subscription.message || 'Failed to create subscription')
    }

    // Salvar subscription_id no perfil do usuário
    await supabaseAdmin
      .from('profiles')
      .update({ 
        paypal_subscription_id: subscription.id,
      })
      .eq('id', user.id)

    return new Response(JSON.stringify({ 
      subscriptionId: subscription.id,
      approvalUrl: subscription.links.find(link => link.rel === 'approve')?.href 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})