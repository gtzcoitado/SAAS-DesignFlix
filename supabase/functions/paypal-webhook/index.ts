import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts"

const PAYPAL_API = Deno.env.get('PAYPAL_MODE') === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')!
const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET')!
const PAYPAL_WEBHOOK_ID = Deno.env.get('PAYPAL_WEBHOOK_ID')

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

// Verificar assinatura do webhook (OPCIONAL em ambiente de desenvolvimento)
async function verifyWebhookSignature(req: Request, body: string) {
  // Se não tiver WEBHOOK_ID configurado, pular verificação (útil para testes)
  if (!PAYPAL_WEBHOOK_ID) {
    console.warn('PAYPAL_WEBHOOK_ID not configured - skipping signature verification')
    return true
  }

  try {
    const accessToken = await getPayPalAccessToken()
    
    const verifyData = {
      auth_algo: req.headers.get('PAYPAL-AUTH-ALGO'),
      cert_url: req.headers.get('PAYPAL-CERT-URL'),
      transmission_id: req.headers.get('PAYPAL-TRANSMISSION-ID'),
      transmission_sig: req.headers.get('PAYPAL-TRANSMISSION-SIG'),
      transmission_time: req.headers.get('PAYPAL-TRANSMISSION-TIME'),
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body),
    }

    const response = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyData),
    })

    const result = await response.json()
    return result.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    // Em caso de erro na verificação, aceitar o webhook em desenvolvimento
    if (Deno.env.get('PAYPAL_MODE') !== 'live') {
      console.warn('Accepting webhook without verification in development mode')
      return true
    }
    return false
  }
}

serve(async (req) => {
  try {
    const body = await req.text()
    const event = JSON.parse(body)

    console.log('=== PayPal Webhook Received ===')
    console.log('Event Type:', event.event_type)
    console.log('Resource:', JSON.stringify(event.resource, null, 2))

    // Verificar assinatura do webhook
    const isValid = await verifyWebhookSignature(req, body)
    if (!isValid) {
      console.error('❌ Invalid webhook signature')
      return new Response('Invalid signature', { status: 401 })
    }

    // Extrair subscription ID baseado no tipo de evento
    let subscriptionId: string | null = null
    
    // Para eventos de assinatura
    if (event.resource.id && event.event_type.includes('BILLING.SUBSCRIPTION')) {
      subscriptionId = event.resource.id
    }
    // Para eventos de pagamento
    else if (event.resource.billing_agreement_id) {
      subscriptionId = event.resource.billing_agreement_id
    }
    // Fallback
    else if (event.resource.subscription_id) {
      subscriptionId = event.resource.subscription_id
    }

    if (!subscriptionId) {
      console.error('❌ Could not extract subscription ID from event')
      return new Response('Subscription ID not found', { status: 400 })
    }

    console.log('Subscription ID:', subscriptionId)

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, is_subscribed')  // ← SEM EMAIL
    .eq('paypal_subscription_id', subscriptionId)
    .single()

    if (profileError || !profile) {
      console.error('❌ Profile not found for subscription:', subscriptionId)
      console.error('Error:', profileError)
      return new Response('Profile not found', { status: 404 })
    }

    console.log('Found profile:', profile.id, profile.full_name)

    // ===== ATIVAR ASSINATURA =====
    if (
      event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED' || 
      event.event_type === 'BILLING.SUBSCRIPTION.UPDATED' ||
      event.event_type === 'PAYMENT.SALE.COMPLETED'
    ) {
      
      console.log('✅ Activating subscription for user:', profile.id)

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_subscribed: true,
          subscribed_since: profile.subscribed_since || new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) {
        console.error('❌ Error updating profile:', error)
        throw error
      }

      console.log('✅ Subscription activated successfully for:', profile.email)
    }

    // ===== DESATIVAR ASSINATURA =====
    if (
      event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' || 
      event.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
      event.event_type === 'BILLING.SUBSCRIPTION.EXPIRED' ||
      event.event_type === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED'
    ) {
      
      console.log('❌ Deactivating subscription for user:', profile.id)

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_subscribed: false
        })
        .eq('id', profile.id)

      if (error) {
        console.error('❌ Error deactivating subscription:', error)
        throw error
      }

      console.log('✅ Subscription deactivated for:', profile.email)
    }

    console.log('=== Webhook processed successfully ===')
    return new Response(JSON.stringify({ 
      received: true,
      event_type: event.event_type,
      subscription_id: subscriptionId,
      profile_id: profile.id
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('❌ Webhook Error:', err)
    return new Response(JSON.stringify({ 
      error: err.message,
      details: err.toString()
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})