import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string || 'sk_test_mock', {
  apiVersion: '2026-03-25.dahlia',
});

// For local dev URL routing
const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';
  url = url.includes('http') ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { skillId } = await req.json();
    if (!skillId) {
      return NextResponse.json({ error: 'Missing skillId' }, { status: 400 });
    }

    // Fetch the standard price from DB to construct checkout line item
    const { data: skill } = await supabase.from('skills').select('*').eq('id', skillId).single();
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      // Mock bypass for when Stripe is not actually configured
      console.warn("MOCK CHECKOUT: No Stripe Key provided, directly inserting subscription");
      await supabase.from('subscriptions').insert({
        buyer_id: user.id,
        skill_id: String(skillId),
        status: 'active',
        stripe_subscription_id: 'mock_sub_123'
      });
      return NextResponse.json({ url: getURL() + 'marketplace' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Subscription: ${skill.title}`,
              description: skill.description || '',
            },
            unit_amount: Math.round((skill.monthly_price || 0) * 100),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${getURL()}marketplace?checkout=success`,
      cancel_url: `${getURL()}marketplace?checkout=canceled`,
      client_reference_id: user.id,
      metadata: {
        skill_id: String(skillId),
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
