'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { redirect } from 'next/navigation'

export async function createSkill(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const type = formData.get('type') as string
  const monthlyPrice = parseFloat(formData.get('monthlyPrice') as string) || 0
  const mcpUrl = formData.get('mcpUrl') as string
  const systemPrompt = formData.get('systemPrompt') as string
  const namespace = formData.get('namespace') as string

  const { error } = await supabase.from('skills').insert({
    expert_id: user.id,
    title,
    description,
    category,
    type,
    namespace: namespace || null,
    monthly_price: monthlyPrice,
    mcp_endpoint_url: mcpUrl || null,
    system_prompt: systemPrompt || null,
    is_published: true
  })

  if (error) {
    console.error('Failed to create skill', error)
    throw new Error('Failed to create skill')
  }

  revalidatePath('/dashboard')
  revalidatePath('/marketplace')
  revalidatePath('/')
}

export async function generateApiKey() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Generate a random 32-byte key
  const rawKey = 'sk_live_' + crypto.randomBytes(24).toString('hex')
  
  // Hash the key using SHA-256
  const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex')

  // Insert into DB
  const { error } = await supabase.from('api_keys').insert({
    buyer_id: user.id,
    hashed_key: hashedKey,
    name: 'Default Key', // Could let user specify
  })

  if (error) {
    console.error('Failed to save API key', error)
    throw new Error('Failed to save API key')
  }

  // WE MUST RETURN THE RAW KEY HERE ONCE. It cannot be recovered later.
  revalidatePath('/dashboard')
  return rawKey
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function submitReview(skillId: string, rating: number, comment?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('reviews').upsert({
    buyer_id: user.id,
    skill_id: skillId,
    rating,
    comment
  }, { onConflict: 'buyer_id, skill_id' })

  if (error) {
    console.error('Failed to submit review', error)
    throw new Error('Failed to submit review')
  }

  revalidatePath('/marketplace')
  revalidatePath('/buyer-dashboard')
  revalidatePath(`/sandbox/${skillId}`)
}
