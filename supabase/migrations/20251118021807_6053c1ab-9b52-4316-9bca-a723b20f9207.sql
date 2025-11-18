-- Create notifications table for real-time alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stock_change', 'urgent_order', 'order_status', 'low_stock', 'system')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read notifications (no auth required for this demo)
CREATE POLICY "Allow public read access to notifications" ON public.notifications
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to notifications" ON public.notifications
  FOR UPDATE USING (true);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create dashboard settings table
CREATE TABLE IF NOT EXISTS public.dashboard_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default',
  widget_visibility JSONB NOT NULL DEFAULT '{}',
  widget_sizes JSONB NOT NULL DEFAULT '{}',
  theme_color TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for dashboard settings
ALTER TABLE public.dashboard_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for dashboard settings
CREATE POLICY "Allow public access to dashboard settings" ON public.dashboard_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_dashboard_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboard_settings_updated_at
  BEFORE UPDATE ON public.dashboard_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dashboard_settings_updated_at();