-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, service_role;

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    username VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to create a public user when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test Results Table
CREATE TABLE public.test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reaction_time INTEGER NOT NULL, -- ms
    accuracy DECIMAL(5,2) NOT NULL, -- percentage
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'normal', 'hard')),
    target_hits INTEGER NOT NULL,
    total_targets INTEGER NOT NULL,
    reaction_times JSONB, -- detailed data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard Table
CREATE TABLE public.leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    best_reaction_time INTEGER NOT NULL,
    average_accuracy DECIMAL(5,2) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'normal', 'hard')),
    total_tests INTEGER DEFAULT 0,
    last_test_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, difficulty)
);

-- Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_test_results_user_id ON public.test_results(user_id);
CREATE INDEX idx_test_results_created_at ON public.test_results(created_at DESC);
CREATE INDEX idx_test_results_difficulty ON public.test_results(difficulty);
CREATE INDEX idx_leaderboard_difficulty_time ON public.leaderboard(difficulty, best_reaction_time);
CREATE INDEX idx_leaderboard_user_id ON public.leaderboard(user_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Permissions
GRANT SELECT ON public.users TO anon, authenticated;
GRANT ALL ON public.users TO service_role;

GRANT SELECT ON public.test_results TO anon, authenticated;
GRANT INSERT ON public.test_results TO authenticated;
GRANT ALL ON public.test_results TO service_role;

GRANT SELECT ON public.leaderboard TO anon, authenticated;
GRANT UPDATE ON public.leaderboard TO authenticated;
GRANT ALL ON public.leaderboard TO service_role;

-- Policies

-- Users
CREATE POLICY "Public profiles are viewable by everyone" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Test Results
CREATE POLICY "Anyone can view test results" ON public.test_results
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own test results" ON public.test_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own leaderboard entry" ON public.leaderboard
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leaderboard entry" ON public.leaderboard
    FOR INSERT WITH CHECK (auth.uid() = user_id);
