-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
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

-- Create weddings table
CREATE TABLE public.weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  groom_name TEXT NOT NULL,
  bride_name TEXT NOT NULL,
  groom_family TEXT,
  bride_family TEXT,
  wedding_date DATE NOT NULL,
  main_description TEXT,
  main_picture_url TEXT,
  rsvp_deadline DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;

-- Wedding policies
CREATE POLICY "Users can view own weddings"
  ON public.weddings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published weddings"
  ON public.weddings FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can create own weddings"
  ON public.weddings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weddings"
  ON public.weddings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weddings"
  ON public.weddings FOR DELETE
  USING (auth.uid() = user_id);

-- Create wedding locations table
CREATE TABLE public.wedding_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ceremony', 'venue')),
  location_name TEXT,
  location_link TEXT,
  time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.wedding_locations ENABLE ROW LEVEL SECURITY;

-- Location policies
CREATE POLICY "Users can manage locations for their weddings"
  ON public.wedding_locations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings 
      WHERE weddings.id = wedding_locations.wedding_id 
      AND weddings.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view locations for published weddings"
  ON public.wedding_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings 
      WHERE weddings.id = wedding_locations.wedding_id 
      AND weddings.status = 'published'
    )
  );

-- Create gallery images table
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  image_order INTEGER DEFAULT 1,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Gallery policies
CREATE POLICY "Users can manage gallery for their weddings"
  ON public.gallery_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings 
      WHERE weddings.id = gallery_images.wedding_id 
      AND weddings.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view gallery for published weddings"
  ON public.gallery_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings 
      WHERE weddings.id = gallery_images.wedding_id 
      AND weddings.status = 'published'
    )
  );

-- Create gift cards table
CREATE TABLE public.gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  card_name TEXT NOT NULL,
  card_number TEXT NOT NULL,
  card_order INTEGER DEFAULT 1,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Gift card policies
CREATE POLICY "Users can manage gift cards for their weddings"
  ON public.gift_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings 
      WHERE weddings.id = gift_cards.wedding_id 
      AND weddings.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view gift cards for published weddings"
  ON public.gift_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings 
      WHERE weddings.id = gift_cards.wedding_id 
      AND weddings.status = 'published'
    )
  );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weddings_updated_at
  BEFORE UPDATE ON public.weddings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();