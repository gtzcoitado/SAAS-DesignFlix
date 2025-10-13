import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const PAYPAL_API = Deno.env.get('PAYPAL_MODE') === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')!
const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET')!

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

async function createProduct(accessToken: string) {
  const productData = {
    name: 'Design Flix Subscription',
    description: 'Access to exclusive design prints',
    type: 'SERVICE',
    category: 'SOFTWARE',
  }

  const response = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  })

  const product = await response.json()
  return product.id
}

async function createBillingPlan(accessToken: string, productId: string, planName: string, price: string, interval: string, intervalCount: number) {
  const planData = {
    product_id: productId,
    name: `Design Flix ${planName}`,
    description: `${planName} subscription to Design Flix`,
    billing_cycles: [
      {
        frequency: {
          interval_unit: interval,
          interval_count: intervalCount,
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // 0 = infinito (recorrente)
        pricing_scheme: {
          fixed_price: {
            value: price,
            currency_code: 'USD',
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: {
        value: '0',
        currency_code: 'USD',
      },
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 3,
    },
  }

  const response = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(planData),
  })

  const plan = await response.json()
  return plan
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const accessToken = await getPayPalAccessToken()
    
    // Criar produto primeiro
    const productId = await createProduct(accessToken)
    console.log('Product created:', productId)

    // Criar os 3 planos
    const weeklyPlan = await createBillingPlan(accessToken, productId, 'Weekly', '7.99', 'WEEK', 1)
    const monthlyPlan = await createBillingPlan(accessToken, productId, 'Monthly', '19.99', 'MONTH', 1)
    const quarterlyPlan = await createBillingPlan(accessToken, productId, 'Quarterly', '49.99', 'MONTH', 3)

    const plans = {
      Weekly: weeklyPlan.id,
      Monthly: monthlyPlan.id,
      Quarterly: quarterlyPlan.id,
    }

    console.log('Plans created successfully:', plans)

    return new Response(JSON.stringify({ 
      success: true,
      productId,
      plans 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error creating plans:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})