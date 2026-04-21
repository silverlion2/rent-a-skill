import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import Stripe from 'stripe';

export const runtime = 'edge';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

// Helper for Web Crypto SHA-256 hash
async function hashKey(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const authHeader = request.headers.get('Authorization');

    // 1. Validation 
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing API Key' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Hash the incoming token
    const hashedKey = await hashKey(token);

    // Look up the api_keys table alongside profile context
    const { data: keyData } = await supabase
      .from('api_keys')
      .select(`
        buyer_id,
        profiles ( stripe_customer_id )
      `)
      .eq('hashed_key', hashedKey)
      .single();

    if (!keyData) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
    }

    const buyerId = keyData.buyer_id;
    // Typecast assuming array or object from relation
    const profileRef = Array.isArray(keyData.profiles) ? keyData.profiles[0] : keyData.profiles;
    const stripeCustomerId = (profileRef as any)?.stripe_customer_id;
    
    const skillId = body.skill_id;

    if (!skillId) {
      return NextResponse.json({ error: 'Missing skill_id in payload' }, { status: 400 });
    }

    // Check if buyer has an active subscription for this skill
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('buyer_id', buyerId)
      .eq('skill_id', skillId)
      .eq('status', 'active')
      .single();

    if (!subData) {
      return NextResponse.json({ error: 'No active subscription for this skill' }, { status: 403 });
    }

    // 2. Fetch Skill Info
    const { data: skill } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const payload = body.payload || {};
    // Determine mode
    let executionMode = 'chat';
    if (skill.type === 'mcp') executionMode = 'mcp';
    else if (skill.type === 'both') executionMode = payload.mcp_mode ? 'mcp' : 'chat';
    else executionMode = 'chat'; // default to chat

    // 3. Execution Routing
    if (executionMode === 'chat') {
       const userMsg = body.query || 'Hello';
       const anthropic = new Anthropic({
         apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-mock',
       });
       
       if (process.env.ANTHROPIC_API_KEY) {
         const anthropicResponse = await anthropic.messages.create({
           model: 'claude-3-5-sonnet-20241022',
           max_tokens: 1024,
           system: skill.system_prompt || 'You are an expert AI assistant.',
           messages: [{ role: 'user', content: userMsg }]
         });
         await supabase.from('execution_logs').insert({
           expert_id: skill.expert_id,
           buyer_id: buyerId,
           skill_id: skillId,
           mode: 'chat',
           status: 'success'
         });

         // Record meter event asynchronously to Stripe
         if (stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
           stripe.billing.meterEvents.create({
             event_name: 'rent_a_skill_execution',
             payload: {
               stripe_customer_id: stripeCustomerId,
               value: '1',
             },
           }).catch(console.error);
         }

         return NextResponse.json({
           status: 'success',
           execution_mode: 'chat',
           data: {
             llm_response: anthropicResponse.content[0].type === 'text' ? anthropicResponse.content[0].text : 'No text response'
           }
         });
       } else {
         await supabase.from('execution_logs').insert({
           expert_id: skill.expert_id,
           buyer_id: buyerId,
           skill_id: skillId,
           mode: 'chat',
           status: 'mock_success'
         });

         // Fallback if no Anthropic Key in environment
         return NextResponse.json({
           status: 'success',
           execution_mode: 'chat',
           data: {
             llm_response: `[Mock API] Processed query "${userMsg}" with Expert Prompt: ${(skill.system_prompt || '').substring(0,20)}...`
           }
         });
       }

    } else if (executionMode === 'mcp') {
       if (!skill.mcp_endpoint_url) {
         return NextResponse.json({ error: 'Skill is MCP type but has no endpoint URL' }, { status: 500 });
       }
       // Forward the payload
       const mcpResponse = await fetch(skill.mcp_endpoint_url, { 
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload) 
       });

       const mcpData = await mcpResponse.json();
       
       await supabase.from('execution_logs').insert({
         expert_id: skill.expert_id,
         buyer_id: buyerId,
         skill_id: skillId,
         mode: 'mcp',
         status: mcpResponse.ok ? 'success' : 'failure'
       });

       // Record meter event asynchronously to Stripe
       if (mcpResponse.ok && stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
         stripe.billing.meterEvents.create({
           event_name: 'rent_a_skill_execution',
           payload: {
             stripe_customer_id: stripeCustomerId,
             value: '1',
           },
         }).catch(console.error);
       }

       return NextResponse.json({
         status: 'success',
         execution_mode: 'mcp_proxy',
         data: mcpData
       });
    }

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Failed to execute query' },
      { status: 500 }
    );
  }
}
