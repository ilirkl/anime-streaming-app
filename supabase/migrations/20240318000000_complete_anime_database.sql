-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE age_rating AS ENUM ('G', 'PG', 'PG-13', 'R', 'R+', 'Rx');
CREATE TYPE anime_status AS ENUM ('ONGOING', 'COMPLETED', 'UPCOMING');
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    role user_role DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create animes table
CREATE TABLE animes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mal_id INTEGER UNIQUE,
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
    rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create seasons table
CREATE TABLE seasons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    anime_id UUID REFERENCES animes(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(anime_id, number)
);

-- Create episodes table
CREATE TABLE episodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    synopsis TEXT,
    thumbnail TEXT,
    duration INTEGER, -- in minutes
    air_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(season_id, number)
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

-- Create indexes for better query performance
CREATE INDEX idx_animes_mal_id ON animes(mal_id);
CREATE INDEX idx_episodes_air_date ON episodes(air_date);
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX idx_seasons_anime_id ON seasons(anime_id);
CREATE INDEX idx_episodes_season_id ON episodes(season_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE animes ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for animes
CREATE POLICY "Animes are viewable by everyone"
    ON animes FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert animes"
    ON animes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

CREATE POLICY "Only admins can update animes"
    ON animes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Create policies for seasons
CREATE POLICY "Seasons are viewable by everyone"
    ON seasons FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify seasons"
    ON seasons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Create policies for episodes
CREATE POLICY "Episodes are viewable by everyone"
    ON episodes FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify episodes"
    ON episodes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
        )
    );

-- Create policies for watchlist
CREATE POLICY "Users can view own watchlist"
    ON watchlist FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own watchlist"
    ON watchlist FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own watchlist"
    ON watchlist FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for watch history
CREATE POLICY "Users can view own watch history"
    ON watch_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watch history"
    ON watch_history FOR ALL
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_animes_updated_at
    BEFORE UPDATE ON animes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasons_updated_at
    BEFORE UPDATE ON seasons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at
    BEFORE UPDATE ON episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'username',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
        AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;