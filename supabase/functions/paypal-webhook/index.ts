import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts"

const PAYPAL_API = Deno.env.get('PAYPAL_MODE') === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')!
const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET')!
const PAYPAL_WEBHOOK_ID = Deno.env.get('PAYPAL_WEBHOOK_ID')!

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

// Verificar assinatura do webhook
async function verifyWebhookSignature(req: Request, body: string) {
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
}

serve(async (req) => {
  try {
    const body = await req.text()
    const event = JSON.parse(body)

    // Verificar assinatura do webhook
    const isValid = await verifyWebhookSignature(req, body)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return new Response('Invalid signature', { status: 401 })
    }

    console.log('Webhook event:', event.event_type)

    // Eventos que ativam a assinatura
    if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED' || 
        event.event_type === 'PAYMENT.SALE.COMPLETED') {
      
      const subscriptionId = event.resource.id || event.resource.billing_agreement_id

      // Buscar usuário pelo subscription_id
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('paypal_subscription_id', subscriptionId)
        .single()

      if (profileError || !profile) {
        console.error('Profile not found for subscription:', subscriptionId)
        return new Response('Profile not found', { status: 404 })
      }

      // Ativar assinatura
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_subscribed: true,
          subscribed_since: new Date().toISOString() 
        })
        .eq('id', profile.id)

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      console.log(`Subscription activated for user: ${profile.id}`)
    }

    // Eventos que desativam a assinatura
    if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' || 
        event.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
        event.event_type === 'BILLING.SUBSCRIPTION.EXPIRED') {
      
      const subscriptionId = event.resource.id

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('paypal_subscription_id', subscriptionId)
        .single()

      if (profile) {
        await supabaseAdmin
          .from('profiles')
          .update({ is_subscribed: false })
          .eq('id', profile.id)

        console.log(`Subscription deactivated for user: ${profile.id}`)
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error('Webhook Error:', err)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})