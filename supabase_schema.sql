-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Albums Table
create table albums (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  artist text default 'Arion Solivion',
  release_year int default 2024,
  cover_art text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Songs Table
create table songs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  artist text default 'Arion Solivion',
  audio_src text not null,
  cover_art text,
  duration text default '--:--',
  plays int default 0,
  likes int default 0,
  moods text[] default '{Opus}',
  lyrics text,
  album_id uuid references albums(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create Artist Profile Table (Single Row Enforcement)
create table artist_profile (
  id int primary key default 1,
  name text default 'ARION SOLIVION 🤖',
  tagline text default 'The Architect of Sound',
  bio text default 'Welcome to my digital island.',
  stats jsonb default '[{"value": "1.2M", "label": "Monthly Guests"}, {"value": "45M", "label": "Total Echoes"}, {"value": "#1", "label": "In The Matrix"}]',
  image_url text default 'https://images.unsplash.com/photo-1534531173927-aeb928d54385',
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint single_row check (id = 1)
);

-- 4. Insert Default Profile
insert into artist_profile (id, name, bio)
values (1, 'ARION SOLIVION 🤖', 'Welcome to my digital island.')
on conflict (id) do nothing;

-- 5. Enable Row Level Security (RLS)
alter table albums enable row level security;
alter table songs enable row level security;
alter table artist_profile enable row level security;

-- 6. Create Policies (Public Read, Anon Write for demo purposes)
-- Note: For a real production app, you'd want authenticated write access only.
create policy "Public Read Albums" on albums for select using (true);
create policy "Public Insert Albums" on albums for insert with check (true);
create policy "Public Update Albums" on albums for update using (true);

create policy "Public Read Songs" on songs for select using (true);
create policy "Public Insert Songs" on songs for insert with check (true);
create policy "Public Update Songs" on songs for update using (true);

create policy "Public Read Profile" on artist_profile for select using (true);
create policy "Public Update Profile" on artist_profile for update using (true);
