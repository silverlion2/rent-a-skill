'use server';

import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

// Internal Server Action that bypasses the external HTTP route to prevent leaking keys
// and natively interfaces with the core engine logic for the Web UI Sandbox.
export async function runSandboxQuery(skillId: string, query: string, payload?: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // To simulate the Proxy but natively:
  // Instead of passing a bearer token, we securely impersonate the user natively

  // We could just do an internal fetch to /api/query but that requires the API key (which is hashed and plain text is lost).
  // So we duplicate the core proxy logic for the Sandbox authenticated session directly.

  const { data: subData } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('buyer_id', user.id)
    .eq('skill_id', skillId)
    .eq('status', 'active')
    .single();

  if (!subData) {
    throw new Error('No active subscription for this skill');
  }

  const { data: skill } = await supabase.from('skills').select('*').eq('id', skillId).single();
  if (!skill) throw new Error('Skill not found');

  let executionMode = skill.type === 'mcp' ? 'mcp' : 'chat';
  if (skill.type === 'both') executionMode = payload?.mcp_mode ? 'mcp' : 'chat';

  if (executionMode === 'chat') {
    const { Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-mock',
    });

    if (process.env.ANTHROPIC_API_KEY) {
      const anthropicResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: skill.system_prompt || 'You are an expert AI.',
        messages: [{ role: 'user', content: query }]
      });

      await supabase.from('execution_logs').insert({
        expert_id: skill.expert_id, buyer_id: user.id, skill_id: skill.id, mode: 'chat', status: 'success'
      });

      return anthropicResponse.content[0].type === 'text' ? anthropicResponse.content[0].text : 'No text response';
    } else {
      await supabase.from('execution_logs').insert({
        expert_id: skill.expert_id, buyer_id: user.id, skill_id: skill.id, mode: 'chat', status: 'mock_success'
      });
      return `[Sandbox Mock] Processed query "${query}". Expert Prompt: ${(skill.system_prompt || '').substring(0,30)}...`;
    }
  } else {
    // MCP Mode
    const mcpResponse = await fetch(skill.mcp_endpoint_url, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || { query }) 
    });
    const mcpData = await mcpResponse.json();
    
    await supabase.from('execution_logs').insert({
      expert_id: skill.expert_id, buyer_id: user.id, skill_id: skill.id, mode: 'mcp', status: mcpResponse.ok ? 'success' : 'failure'
    });

    return JSON.stringify(mcpData, null, 2);
  }
}
