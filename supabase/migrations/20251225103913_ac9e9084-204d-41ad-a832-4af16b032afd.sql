-- Create weight records table
CREATE TABLE public.pet_weight_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pet_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health records table
CREATE TABLE public.pet_health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pet_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  record_type TEXT NOT NULL, -- 'vaccination', 'checkup', 'treatment', 'medication', 'surgery'
  title TEXT NOT NULL,
  description TEXT,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_date DATE,
  hospital_name TEXT,
  cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pet_weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_health_records ENABLE ROW LEVEL SECURITY;

-- Weight records policies
CREATE POLICY "Users can view own weight records" ON public.pet_weight_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight records" ON public.pet_weight_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight records" ON public.pet_weight_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight records" ON public.pet_weight_records
  FOR DELETE USING (auth.uid() = user_id);

-- Health records policies
CREATE POLICY "Users can view own health records" ON public.pet_health_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health records" ON public.pet_health_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health records" ON public.pet_health_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health records" ON public.pet_health_records
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for health records updated_at
CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON public.pet_health_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();