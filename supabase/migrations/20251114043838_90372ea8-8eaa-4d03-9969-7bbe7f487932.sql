-- Create n8n events log table
CREATE TABLE public.n8n_events_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  source_workflow TEXT,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create realtime odds cache table
CREATE TABLE public.realtime_odds_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT NOT NULL,
  market TEXT NOT NULL,
  odds JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(match_id, market)
);

-- Create pending notifications table
CREATE TABLE public.pending_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.n8n_events_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_odds_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for n8n_events_log (admin only)
CREATE POLICY "Admins can view events log"
  ON public.n8n_events_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for realtime_odds_cache (public read)
CREATE POLICY "Anyone can view odds cache"
  ON public.realtime_odds_cache FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for pending_notifications (users can view their own)
CREATE POLICY "Users can view their own notifications"
  ON public.pending_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.pending_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_odds_cache;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_notifications;

-- Create indexes
CREATE INDEX idx_n8n_events_type ON public.n8n_events_log(event_type);
CREATE INDEX idx_n8n_events_created ON public.n8n_events_log(created_at DESC);
CREATE INDEX idx_odds_match ON public.realtime_odds_cache(match_id);
CREATE INDEX idx_notifications_user ON public.pending_notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.pending_notifications(user_id, read) WHERE read = false;