import { stripe } from './stripe.ts'
import { supabaseAdmin } from './supabaseAdmin.ts'

export const createOrRetrieveCustomer = async ({ email, uuid }: { email: string; uuid: string }) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', uuid)
    .single()
  
  if (error || !data?.stripe_customer_id) {
    const customerData: { metadata: { supabaseUUID: string }; email?: string } = {
      metadata: { supabaseUUID: uuid },
    }
    if (email) customerData.email = email
    
    const customer = await stripe.customers.create(customerData)
    await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', uuid)
    return customer.id
  }
  return data.stripe_customer_id
}