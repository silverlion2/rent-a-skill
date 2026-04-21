import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Missing environment configurations' }, { status: 500 });
  }

  // We must use the SERVICE KEY here to bypass RLS since webhooks are unauthenticated
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string || 'sk_test_mock', {
    apiVersion: '2026-03-25.dahlia',
  });

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret!);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const buyerId = session.client_reference_id;
      const skillId = session.metadata?.skill_id;
      const subscriptionId = session.subscription as string;

      if (buyerId && skillId) {
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            buyer_id: buyerId,
            skill_id: skillId,
            stripe_subscription_id: subscriptionId,
            status: 'active'
          }, { onConflict: 'buyer_id, skill_id' });

        if (error) {
          console.error("Failed to insert subscription: ", error);
        }
      }
      break;
    
    case 'customer.subscription.deleted':
      const sub = event.data.object as Stripe.Subscription;
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', sub.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
