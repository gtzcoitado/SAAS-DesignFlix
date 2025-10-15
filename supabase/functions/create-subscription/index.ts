import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts"

const PAYPAL_API = Deno.env.get('PAYPAL_MODE') === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET')

// ADICIONAR LOGS DE DEBUG
console.log('🔍 PAYPAL_MODE:', Deno.env.get('PAYPAL_MODE'))
console.log('🔍 PAYPAL_API:', PAYPAL_API)
console.log('🔍 PAYPAL_CLIENT_ID exists:', !!PAYPAL_CLIENT_ID)
console.log('🔍 PAYPAL_SECRET exists:', !!PAYPAL_SECRET)

// Função para obter token de acesso do PayPal
async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error('PayPal credentials not configured')
  }

  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)
  
  console.log('🔑 Requesting PayPal token...')
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ PayPal token error:', response.status, errorText)
    throw new Error(`Failed to get PayPal access token: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  console.log('✅ PayPal token obtained')
  return data.access_token
}

// IDs dos planos
const PLAN_IDS: Record<string, string> = {
  'Weekly': Deno.env.get('PAYPAL_WEEKLY_PLAN_ID') || '',
  'Monthly': Deno.env.get('PAYPAL_MONTHLY_PLAN_ID') || '',
  'Quarterly': Deno.env.get('PAYPAL_QUARTERLY_PLAN_ID') || ''
}

console.log('📋 Plan IDs configured:', Object.keys(PLAN_IDS).filter(k => PLAN_IDS[k]))

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Autenticar usuário
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error("Authorization header missing")
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error("User not authenticated")
    }

    // Pegar dados do request
    const { planName } = await req.json()
    
    if (!planName) {
      throw new Error("Plan name is required")
    }

    console.log('✅ Creating subscription for user:', user.id, 'Plan:', planName)

    // Obter token do PayPal
    const accessToken = await getPayPalAccessToken()

    // Pegar ID do plano no PayPal
    const planId = PLAN_IDS[planName]
    if (!planId) {
      throw new Error(`Plan ${planName} not configured. Available plans: ${Object.keys(PLAN_IDS).join(', ')}`)
    }

    console.log('📦 Using plan ID:', planId)

    // Preparar dados da assinatura
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer'
    const nameParts = fullName.split(' ')
    
    const subscriptionData = {
      plan_id: planId,
      subscriber: {
        name: {
          given_name: nameParts[0] || 'Customer',
          surname: nameParts.slice(1).join(' ') || 'User',
        },
        email_address: user.email,
      },
      application_context: {
        brand_name: 'Design Flix',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${Deno.env.get('PROJECT_URL') || 'http://localhost:5173'}/payment-success?plan=${planName}`,
        cancel_url: `${Deno.env.get('PROJECT_URL') || 'http://localhost:5173'}/pricing?cancelled=true`,
      },
    }

    console.log('📤 Creating PayPal subscription...')

    // Criar assinatura no PayPal
    const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(subscriptionData),
    })

    const subscription = await response.json()

    if (!response.ok) {
      console.error('❌ PayPal API Error:', subscription)
      throw new Error(subscription.message || subscription.error || 'Failed to create subscription')
    }

    console.log('✅ PayPal subscription created:', subscription.id)

    // Salvar subscription_id no perfil do usuário
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        paypal_subscription_id: subscription.id,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error updating profile:', updateError)
      throw updateError
    }

    // Encontrar a URL de aprovação
    const approvalLink = subscription.links?.find((link: any) => link.rel === 'approve')
    
    if (!approvalLink) {
      console.error('❌ No approval link found in subscription:', subscription)
      throw new Error('Approval link not found in PayPal response')
    }

    console.log('✅ Approval URL:', approvalLink.href)

    return new Response(JSON.stringify({ 
      success: true,
      subscriptionId: subscription.id,
      approvalUrl: approvalLink.href,
      status: subscription.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Error in create-subscription:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})