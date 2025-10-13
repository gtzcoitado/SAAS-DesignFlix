import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'

// O Supabase automaticamente injeta essas variáveis nas Edge Functions
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('PROJECT_URL') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
)