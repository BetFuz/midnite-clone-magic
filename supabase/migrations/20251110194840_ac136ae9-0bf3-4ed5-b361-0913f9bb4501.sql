-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  currency_code TEXT DEFAULT 'NGN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create bet_slips table
CREATE TABLE public.bet_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_stake DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_odds DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  potential_win DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void')),
  bet_type TEXT NOT NULL DEFAULT 'single' CHECK (bet_type IN ('single', 'multiple', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settled_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on bet_slips
ALTER TABLE public.bet_slips ENABLE ROW LEVEL SECURITY;

-- Bet slips policies
CREATE POLICY "Users can view own bet slips"
  ON public.bet_slips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bet slips"
  ON public.bet_slips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create bet_selections table
CREATE TABLE public.bet_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_slip_id UUID REFERENCES public.bet_slips(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,
  sport TEXT NOT NULL,
  league TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  selection_type TEXT NOT NULL,
  selection_value TEXT NOT NULL,
  odds DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void')),
  match_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bet_selections
ALTER TABLE public.bet_selections ENABLE ROW LEVEL SECURITY;

-- Bet selections policies
CREATE POLICY "Users can view own bet selections"
  ON public.bet_selections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bet_slips
      WHERE bet_slips.id = bet_selections.bet_slip_id
      AND bet_slips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bet selections"
  ON public.bet_selections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bet_slips
      WHERE bet_slips.id = bet_selections.bet_slip_id
      AND bet_slips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own bet selections"
  ON public.bet_selections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.bet_slips
      WHERE bet_slips.id = bet_selections.bet_slip_id
      AND bet_slips.user_id = auth.uid()
    )
  );

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_bet_slips_user_id ON public.bet_slips(user_id);
CREATE INDEX idx_bet_slips_status ON public.bet_slips(status);
CREATE INDEX idx_bet_selections_bet_slip_id ON public.bet_selections(bet_slip_id);
CREATE INDEX idx_bet_selections_status ON public.bet_selections(status);