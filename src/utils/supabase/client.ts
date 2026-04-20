import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock_anon_key'

  // Supabase SSR complains if valid URLs are not present. 
  // If we don't have keys, this allows the app to compile and run silently mocked.
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
