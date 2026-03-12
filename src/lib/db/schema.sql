-- CursedBio Database Schema (PostgreSQL / Supabase)
-- Run this in Supabase SQL editor to create tables.
-- Tables: profiles, pages, friends, comments, page_elements

-- Profiles: extended user data (Clerk userId is the link)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio_text TEXT,
  username_changes_used SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- If table already exists, add the column (run once if you had profiles before this):
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username_changes_used SMALLINT DEFAULT 0;

-- Pages: one bio page per user (Gunz-style layout JSON)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  slug TEXT NOT NULL,
  title TEXT DEFAULT 'My Bio',
  layout_json JSONB NOT NULL DEFAULT '{}',
  custom_css TEXT,
  custom_js TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Friends: SpaceHey-style social graph
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, friend_id)
);

-- Comments: on user pages
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_pages_profile ON pages(profile_id);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_clerk ON profiles(clerk_user_id);
CREATE INDEX idx_friends_profile ON friends(profile_id);
CREATE INDEX idx_comments_page ON comments(page_id);
