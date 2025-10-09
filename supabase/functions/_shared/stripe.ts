import Stripe from "https://esm.sh/stripe@10.13.0?target=deno&no-check"

export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
})