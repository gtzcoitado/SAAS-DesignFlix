// setup-paypal.js
// Execute este script uma vez para criar os planos no PayPal
// node setup-paypal.js

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupPayPalPlans() {
  try {
    console.log('🚀 Starting PayPal plans creation...\n');

    // Chamar a Edge Function para criar os planos
    const { data, error } = await supabase.functions.invoke('create-plans');

    if (error) {
      throw new Error(error.message);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    console.log('✅ PayPal product and plans created successfully!\n');
    console.log('Product ID:', data.productId);
    console.log('\n📋 Plan IDs (add these to your .env file):\n');
    console.log(`PAYPAL_WEEKLY_PLAN_ID=${data.plans.Weekly}`);
    console.log(`PAYPAL_MONTHLY_PLAN_ID=${data.plans.Monthly}`);
    console.log(`PAYPAL_QUARTERLY_PLAN_ID=${data.plans.Quarterly}`);
    console.log('\n✅ Setup complete! Update your .env file with these IDs.\n');

  } catch (error) {
    console.error('❌ Error setting up PayPal plans:', error.message);
    console.error('\nMake sure:');
    console.error('1. Your PayPal credentials are correct in .env');
    console.error('2. The Supabase Edge Function "create-plans" is deployed');
    console.error('3. Your PayPal account has API access enabled\n');
    process.exit(1);
  }
}

setupPayPalPlans();