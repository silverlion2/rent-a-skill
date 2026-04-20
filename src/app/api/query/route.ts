import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const authHeader = request.headers.get('Authorization');

    // 1. Validation (MOCKED for dev without keys)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing API Key' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    if (token === 'mock_api_key') {
      // Direct mock response pathway
    } else {
      // In production, we hash the token and look up the api_keys table
      /* 
      const { data: keyData } = await supabase.from('api_keys').select('buyer_id').eq('hashed_key', hash(token)).single();
      if (!keyData) return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
      */
    }

    // 2. Fetch Skill Info (MOCKED for dev without live DB)
    const skillId = body.skill_id;
    let skillType = body.skill_type || 'both'; // Can be 'chat', 'mcp', 'both'
    
    // 3. Execution Routing
    
    if (skillType === 'chat') {
       // --- OPTION A: DIRECT LLM CALL (Chat Context) ---
       // 1. Extract Expert System Prompt from skill table (Hidden from buyer)
       // 2. Combine with Buyer's `body.query`
       // 3. Call Anthropic API
       // const anthropicResponse = await anthropic.messages.create({ ... });
       
       return NextResponse.json({
         status: 'success',
         execution_mode: 'chat',
         data: {
           llm_response: `[Mock] Claude API executed using Expert's hidden prompt for query: "${body.query}"`,
         }
       });

    } else if (skillType === 'mcp') {
       // --- OPTION B: MCP PASSTHROUGH PROXY ---
       // 1. We act strictly as billing intermediate.
       // 2. Forward `body.payload` to `skill.mcp_endpoint_url`
       // const mcpResponse = await fetch(skill.mcp_endpoint_url, { method: 'POST', body: JSON.stringify(body.payload) });
       
       return NextResponse.json({
         status: 'success',
         execution_mode: 'mcp_proxy',
         data: {
           mcp_response: { result: `[Mock] Executed remote tool at Expert's server successfully.` }
         }
       });

    } else {
      // --- BOTH OPTION ---
      // Dynamically routes based on whether `body` contains an `mcp_payload` or a raw `query`
      const mode = body.payload ? 'mcp_proxy' : 'chat';
      return NextResponse.json({
         status: 'success',
         execution_mode: mode,
         data: {
           response: `[Mock] Dynamically handled ${mode} request.`
         }
       });
    }

  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to execute query' },
      { status: 500 }
    );
  }
}
