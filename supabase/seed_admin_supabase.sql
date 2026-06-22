-- =====================================================================
-- e-YP DATABASE SCHEMAS & SEED DATA (SUPABASE)
-- =====================================================================

-- 1. Pemasangan Ekstensi Kriptografi (Untuk Hashing Kata Laluan)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Jadual Profil (public.profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  nric TEXT,
  phone TEXT,
  address_line TEXT,
  postcode TEXT,
  city TEXT,
  state TEXT,
  is_admin BOOLEAN DEFAULT false NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Jadual Program Bantuan (public.programs)
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  category TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  required_documents TEXT[] DEFAULT '{}'::text[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Jadual Berita & Pengumuman Terkini (public.feed_posts)
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  category TEXT,
  tag TEXT,
  icon_name TEXT,
  icon_color TEXT,
  image_url TEXT,
  date_published TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Jadual Info Pilihan (public.infos)
CREATE TABLE IF NOT EXISTS public.infos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT UNIQUE NOT NULL,
  category TEXT,
  description TEXT,
  image_url TEXT,
  color TEXT,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Jadual Dokumen Digital Vault (public.documents)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  type TEXT,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Jadual Permohonan Bantuan (public.applications)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  program TEXT NOT NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  data JSONB DEFAULT '{}'::jsonb NOT NULL,
  status TEXT DEFAULT 'submitted'::text NOT NULL,
  reference_number TEXT UNIQUE NOT NULL,
  ref TEXT,
  steps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- INDEXES & PERFORMANCE OPTIMIZATION
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_program_id ON public.applications(program_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Fungsi Pembantu RLS (Semak Admin)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND (is_admin = true OR (meta->>'is_admin')::boolean = true)
  );
END;
$$ LANGUAGE plpgsql;

-- Polisi Profiles
CREATE POLICY "Pengguna boleh melihat profil sendiri"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Pengguna boleh mengemas kini profil sendiri"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna boleh memasukkan profil sendiri"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pentadbir mempunyai akses penuh ke profil"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- Polisi Programs
CREATE POLICY "Sesiapa sahaja boleh melihat program aktif"
  ON public.programs FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Pentadbir boleh menguruskan program"
  ON public.programs FOR ALL
  USING (public.is_admin());

-- Polisi Feed Posts (Berita)
CREATE POLICY "Sesiapa sahaja boleh melihat berita"
  ON public.feed_posts FOR SELECT
  USING (true);

CREATE POLICY "Pentadbir boleh menguruskan berita"
  ON public.feed_posts FOR ALL
  USING (public.is_admin());

-- Polisi Infos
CREATE POLICY "Sesiapa sahaja boleh melihat info"
  ON public.infos FOR SELECT
  USING (true);

CREATE POLICY "Pentadbir boleh menguruskan info"
  ON public.infos FOR ALL
  USING (public.is_admin());

-- Polisi Documents
CREATE POLICY "Pengguna boleh melihat dokumen sendiri"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Pengguna boleh menguruskan dokumen sendiri"
  ON public.documents FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Pentadbir mempunyai akses penuh ke dokumen"
  ON public.documents FOR ALL
  USING (public.is_admin());

-- Polisi Applications (Permohonan)
CREATE POLICY "Pengguna boleh melihat permohonan sendiri"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Pengguna boleh menghantar permohonan sendiri"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna boleh mengemas kini permohonan sendiri"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pentadbir boleh menguruskan semua permohonan"
  ON public.applications FOR ALL
  USING (public.is_admin());

-- =====================================================================
-- DATA PEMULA (SEED DATA)
-- =====================================================================

-- Cipta Pengguna Pentadbir (Admin User) di auth.users Supabase
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd3b07384-d113-460d-a3df-2313a0c598d9', -- UUID unik untuk admin
  'authenticated',
  'authenticated',
  'admin@yp.my',
  crypt('Admin@123', gen_salt('bf')), -- Kata laluan: Admin@123
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin YP"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Cipta Identiti untuk Admin di auth.identities
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'd3b07384-d113-460d-a3df-2313a0c598d9',
  'd3b07384-d113-460d-a3df-2313a0c598d9',
  jsonb_build_object('sub', 'd3b07384-d113-460d-a3df-2313a0c598d9', 'email', 'admin@yp.my'),
  'email',
  now(),
  now(),
  now()
) ON CONFLICT (provider, id) DO NOTHING;

-- Tambah Profil Admin ke public.profiles
INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  is_admin,
  meta,
  updated_at
)
VALUES (
  'd3b07384-d113-460d-a3df-2313a0c598d9',
  'admin@yp.my',
  'Admin YP',
  true,
  '{"is_admin": true}'::jsonb,
  now()
) ON CONFLICT (user_id) DO NOTHING;

-- Program Bantuan Lalai
INSERT INTO public.programs (title, subtitle, category, description, is_active, required_documents)
VALUES 
('Insentif Siswa Yayasan Perak (INSISYP)', 'Bantuan IPT', 'Pendidikan', 'Bantuan kewangan bagi pelajar cemerlang Perak yang melanjutkan pelajaran ke institut pengajian tinggi dalam dan luar negara.', true, ARRAY['Salinan Kad Pengenalan', 'Surat Tawaran Universiti', 'Slip Gaji Ibu Bapa']),
('TASPENDIK – Tabung Pendidikan Anak Perak', 'Tabung Pendidikan', 'Pendidikan', 'Skim simpanan pendidikan untuk bayi dan kanak-kanak Perak, bertujuan membina tabung pembelajaran sejak awal usia.', true, ARRAY['Salinan Kad Pengenalan Ibu/Bapa', 'Sijil Lahir Anak']),
('Sayangi Rumahku', 'Bantuan Rumah B40', 'Sosial', 'Program pembaikan dan penambahbaikan rumah untuk keluarga B40 Perak yang memerlukan sokongan segera.', true, ARRAY['Salinan Kad Pengenalan Pemohon', 'Geran Tanah / Kebenaran Menduduki', 'Slip Gaji / Pengesahan Pendapatan']),
('Pinjaman Tabung Usahawan', 'Modal PKS', 'Usahawan', 'Sokongan modal permulaan untuk usahawan muda Perak yang ingin memulakan atau mengembangkan perniagaan.', true, ARRAY['Salinan Kad Pengenalan Pemohon', 'Sijil Pendaftaran Perniagaan (SSM)', 'Pelan Perniagaan Ringkas'])
ON CONFLICT (title) DO NOTHING;

-- Berita & Pengumuman Lalai
INSERT INTO public.feed_posts (title, excerpt, category, tag, icon_name, icon_color, image_url, date_published)
VALUES
('Raih Keputusan Cemerlang, Pelajar AACS & BMB Dirai', 'Seramai 36 anak-anak cemerlang di bawah Program Anak Angkat Cikgu Saarani (AACS) dan Biasiswa Menteri Besar Perak (BMB), antara inisiatif terbaru Yayasan Perak, telah dirai dalam majlis penghargaan khas.', 'Pendidikan', 'badge-gold', 'BookOpen', '#F5A623', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop', now() - interval '1 day'),
('Reruai Jelajah Desaku & Reruai OSC Sejahtera Sosial', 'Yayasan Perak terus giat mendekati masyarakat dengan menyantuni para pelajar serta komuniti setempat melalui pembukaan reruai pameran sempena Jelajah Desaku dan OSC Sejahtera Sosial.', 'Komuniti', 'badge-blue', 'Users', '#0EA5E9', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000&auto=format&fit=crop', now() - interval '5 days'),
('Melakar Masa Depan Agro, Membangun Anak Perak', 'Kerajaan Negeri Perak memperkenalkan Biasiswa Agrotek Perak SADC–Yayasan Perak sebagai laluan kepada anak negeri yang berdedikasi dalam bidang pertanian moden.', 'Agro', 'badge-green', 'Leaf', '#10B981', 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?q=80&w=1000&auto=format&fit=crop', now() - interval '8 days')
ON CONFLICT (title) DO NOTHING;

-- Info Lalai
INSERT INTO public.infos (title, category, description, image_url, color, date)
VALUES
('Selamat Menyambut Hari Ibu 2026', 'Sambutan', 'Yayasan Perak mengucapkan Selamat Hari Ibu kepada semua ibu yang telah berkorban tanpa batasan demi masa depan anak-anak tercinta.', '', '#EC4899', '10 Mei 2026'),
('Notis: Permohonan Bantuan INSISYP 2026 Dibuka', 'Notis Rasmi', 'Permohonan bantuan insentif pelajar cemerlang (INSISYP) sesi 2026 kini dibuka. Semua pelajar yang memenuhi syarat adalah digalakkan untuk memohon.', '', '#F5A623', '01 Jun 2026'),
('Pengumuman: Cuti Perayaan Hari Wesak', 'Pengumuman', 'Yayasan Perak akan ditutup pada 12 Mei 2026 sempena Hari Wesak. Semua perkhidmatan akan disambung semula pada 13 Mei 2026.', '', '#0EA5E9', '12 Mei 2026')
ON CONFLICT (title) DO NOTHING;
