-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE age_rating AS ENUM ('G', 'PG', 'PG-13', 'R', 'R+', 'Rx');
CREATE TYPE anime_status AS ENUM ('ONGOING', 'COMPLETED', 'UPCOMING');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Create animes table
CREATE TABLE animes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    original_title TEXT,
    synopsis TEXT,
    cover_image TEXT,
    banner_image TEXT,
    trailer_url TEXT,
    age_rating age_rating DEFAULT 'PG-13',
    status anime_status DEFAULT 'ONGOING',
    release_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create seasons table
CREATE TABLE seasons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    anime_id UUID REFERENCES animes ON DELETE CASCADE,
    title TEXT NOT NULL,
    number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(anime_id, number)
);

-- Create episodes table
CREATE TABLE episodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    season_id UUID REFERENCES seasons ON DELETE CASCADE,
    title TEXT NOT NULL,
    number INTEGER NOT NULL,
    synopsis TEXT,
    thumbnail TEXT,
    duration INTEGER, -- in minutes
    air_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(season_id, number)
);

-- Create streaming_links table
CREATE TABLE streaming_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    episode_id UUID REFERENCES episodes ON DELETE CASCADE,
    quality TEXT NOT NULL, -- e.g., '1080p', '720p', '480p'
    url TEXT NOT NULL,
    provider TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create watchlist table
CREATE TABLE watchlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    anime_id UUID REFERENCES animes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, anime_id)
);

-- Create watch_history table
CREATE TABLE watch_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    progress INTEGER DEFAULT 0, -- Store progress in seconds
    completed BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, episode_id)
);

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Watchlist policies
CREATE POLICY "Users can view own watchlist"
    ON watchlist FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own watchlist"
    ON watchlist FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own watchlist"
    ON watchlist FOR DELETE
    USING (auth.uid() = user_id);

-- Watch history policies
CREATE POLICY "Users can view own watch history"
    ON watch_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own watch history"
    ON watch_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch history"
    ON watch_history FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_animes_title ON animes(title);
CREATE INDEX idx_episodes_season_id ON episodes(season_id);
CREATE INDEX idx_streaming_links_episode_id ON streaming_links(episode_id);
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);