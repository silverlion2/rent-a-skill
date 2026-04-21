-- Skill Market Database Schema (PostgreSQL via Supabase)

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'expert', 'admin')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Skills Table (The Marketplace Offerings)
CREATE TABLE public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT CHECK (type IN ('chat', 'mcp', 'both')),
  monthly_price NUMERIC(10,2),
  per_call_price NUMERIC(10,4),
  mcp_endpoint_url TEXT, -- Used if type is 'mcp' or 'both'
  system_prompt TEXT,    -- Used if type is 'chat' or 'both', NEVER EXPOSED TO CLIENT
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subscriptions (Mapping Buyers to rented Skills)
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  status TEXT CHECK (status IN ('active', 'past_due', 'canceled', 'mock_active')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, skill_id)
);

-- 4. API Keys (For Programmatic/MCP Access)
CREATE TABLE public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  hashed_key TEXT NOT NULL UNIQUE,
  name TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read profiles (for rendering expert names), users can update their own
CREATE POLICY "Public Profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Skills: Anyone can view published skills. Experts can update their own skills.
CREATE POLICY "Published skills viewable by everyone." ON public.skills FOR SELECT USING (is_published = true);
CREATE POLICY "Experts can insert their own skills" ON public.skills FOR INSERT WITH CHECK (auth.uid() = expert_id);
-- IMPORTANT: We configure Supabase to NOT return `system_prompt` and `mcp_endpoint_url` to the client API unless it's the owner.
CREATE POLICY "Experts can view and update their own full skills" ON public.skills FOR UPDATE USING (auth.uid() = expert_id);

-- Subscriptions: Buyers can see their own subscriptions
CREATE POLICY "Buyers can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = buyer_id);

-- API Keys: Buyers can manage own API keys, but cannot see the hashed key value directly
CREATE POLICY "Buyers manage own api keys" ON public.api_keys FOR ALL USING (auth.uid() = buyer_id);

-- 5. Automatic Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'buyer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Execution Logs (Metering)
CREATE TABLE public.execution_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  mode TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Experts view own logs" ON public.execution_logs FOR SELECT USING (auth.uid() = expert_id);
CREATE POLICY "Buyers view own logs" ON public.execution_logs FOR SELECT USING (auth.uid() = buyer_id);

-- 7. Reviews and Ratings
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, skill_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Only active subscribers can leave reviews" ON public.reviews FOR INSERT 
WITH CHECK (
  auth.uid() = buyer_id AND 
  EXISTS (SELECT 1 FROM public.subscriptions WHERE buyer_id = auth.uid() AND skill_id = public.reviews.skill_id AND status = 'active')
);
CREATE POLICY "Buyers can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = buyer_id);

-- 8. Skill Metrics View
CREATE OR REPLACE VIEW public.skill_metrics AS
SELECT 
  s.id as skill_id,
  s.title,
  s.description,
  s.category,
  s.type,
  s.monthly_price,
  s.created_at,
  s.is_published,
  p.full_name as expert_name,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(DISTINCT r.id) as review_count,
  COUNT(DISTINCT sub.id) as active_subscribers,
  COUNT(DISTINCT l.id) as total_executions
FROM public.skills s
LEFT JOIN public.profiles p ON s.expert_id = p.id
LEFT JOIN public.reviews r ON s.id = r.skill_id
LEFT JOIN public.subscriptions sub ON s.id = sub.skill_id AND sub.status = 'active'
LEFT JOIN public.execution_logs l ON s.id = l.skill_id
GROUP BY s.id, p.full_name;
