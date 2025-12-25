-- Drop existing tables (in correct order to avoid foreign key issues)
DROP TABLE IF EXISTS b2b_order_items CASCADE;
DROP TABLE IF EXISTS b2b_orders CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS purchase_items CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS quotation_items CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS outbound_items CASCADE;
DROP TABLE IF EXISTS outbound_orders CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS dashboard_settings CASCADE;
DROP TABLE IF EXISTS company_profiles CASCADE;

-- Create pet_profiles table (user's pets)
CREATE TABLE public.pet_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'dog', -- dog, cat, hamster, rabbit, bird, etc.
  breed TEXT,
  birth_date DATE,
  adoption_date DATE,
  gender TEXT, -- male, female, unknown
  profile_image_url TEXT,
  is_deceased BOOLEAN DEFAULT false,
  deceased_date DATE,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pet_photos table (main photo album)
CREATE TABLE public.pet_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pet_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[] DEFAULT '{}', -- expressions, moods, activities
  detected_mood TEXT, -- AI detected: happy, sad, sleepy, playful, etc.
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false, -- for showcase board
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pet_supplies table (food, supplements, etc.)
CREATE TABLE public.pet_supplies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pet_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- food, supplement, treat, medicine, toy, etc.
  brand TEXT,
  image_url TEXT,
  purchase_date DATE,
  estimated_duration_days INTEGER, -- how long it lasts
  reminder_date DATE, -- when to remind for repurchase
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memorial_posts table (online memorial)
CREATE TABLE public.memorial_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pet_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memorial_condolences table
CREATE TABLE public.memorial_condolences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_id UUID NOT NULL REFERENCES public.memorial_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create showcase_likes table (for showcase board)
CREATE TABLE public.showcase_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES public.pet_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(photo_id, user_id)
);

-- Create showcase_comments table
CREATE TABLE public.showcase_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES public.pet_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_profiles table for additional user info
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.pet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_condolences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Pet profiles policies
CREATE POLICY "Users can view own pets" ON public.pet_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pets" ON public.pet_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON public.pet_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON public.pet_profiles FOR DELETE USING (auth.uid() = user_id);

-- Pet photos policies
CREATE POLICY "Users can view own photos" ON public.pet_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public photos" ON public.pet_photos FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own photos" ON public.pet_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own photos" ON public.pet_photos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON public.pet_photos FOR DELETE USING (auth.uid() = user_id);

-- Pet supplies policies
CREATE POLICY "Users can view own supplies" ON public.pet_supplies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own supplies" ON public.pet_supplies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own supplies" ON public.pet_supplies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own supplies" ON public.pet_supplies FOR DELETE USING (auth.uid() = user_id);

-- Memorial posts policies
CREATE POLICY "Users can view own memorials" ON public.memorial_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public memorials" ON public.memorial_posts FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own memorials" ON public.memorial_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memorials" ON public.memorial_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memorials" ON public.memorial_posts FOR DELETE USING (auth.uid() = user_id);

-- Memorial condolences policies
CREATE POLICY "Anyone can view condolences on public memorials" ON public.memorial_condolences FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.memorial_posts WHERE id = memorial_id AND is_public = true)
);
CREATE POLICY "Users can add condolences" ON public.memorial_condolences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own condolences" ON public.memorial_condolences FOR DELETE USING (auth.uid() = user_id);

-- Showcase likes policies
CREATE POLICY "Anyone can view likes" ON public.showcase_likes FOR SELECT USING (true);
CREATE POLICY "Users can add likes" ON public.showcase_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own likes" ON public.showcase_likes FOR DELETE USING (auth.uid() = user_id);

-- Showcase comments policies
CREATE POLICY "Anyone can view comments on public photos" ON public.showcase_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pet_photos WHERE id = photo_id AND is_public = true)
);
CREATE POLICY "Users can add comments" ON public.showcase_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.showcase_comments FOR DELETE USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);

-- Storage policies for pet photos
CREATE POLICY "Anyone can view pet photos" ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');
CREATE POLICY "Authenticated users can upload pet photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own photos" ON storage.objects FOR UPDATE USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pet_profiles_updated_at BEFORE UPDATE ON public.pet_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pet_supplies_updated_at BEFORE UPDATE ON public.pet_supplies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_memorial_posts_updated_at BEFORE UPDATE ON public.memorial_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();