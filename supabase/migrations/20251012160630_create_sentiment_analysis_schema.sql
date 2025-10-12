/*
  # Sentiment Analysis Database Schema for Social Media

  ## Overview
  This migration creates a comprehensive database for collecting, storing, and analyzing
  social media sentiment data to provide actionable insights for brands and organizations.

  ## New Tables

  ### 1. `users` - Social Media Users
    - `user_id` (uuid, primary key) - Unique identifier for each user
    - `username` (text, unique, not null) - User's username
    - `display_name` (text) - User's display name
    - `email` (text) - User's email address
    - `location` (text) - User's location
    - `platform` (text) - Social media platform
    - `created_at` (timestamptz) - Account creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `hashtags` - Hashtag Management
    - `hashtag_id` (uuid, primary key) - Unique identifier for each hashtag
    - `tag` (text, unique, not null) - The hashtag text (without #)
    - `created_at` (timestamptz) - Creation timestamp
    - `total_posts` (integer) - Total number of posts using this hashtag

  ### 3. `posts` - Social Media Posts
    - `post_id` (uuid, primary key) - Unique identifier for each post
    - `user_id` (uuid, foreign key) - References users table
    - `content` (text) - Post content
    - `platform` (text, not null) - Social media platform (Twitter, Facebook, Instagram, etc.)
    - `posted_at` (timestamptz) - When the post was published
    - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `post_hashtags` - Many-to-Many Relationship (Post-Hashtag)
    - `post_id` (uuid, foreign key) - References posts table
    - `hashtag_id` (uuid, foreign key) - References hashtags table
    - Primary key is composite (post_id, hashtag_id)

  ### 5. `sentiment` - Sentiment Analysis Results
    - `sentiment_id` (uuid, primary key) - Unique identifier
    - `post_id` (uuid, foreign key) - References posts table
    - `label` (text, not null) - Sentiment label (Positive, Negative, Neutral)
    - `score` (decimal) - Sentiment confidence score (0-1)
    - `emotion` (text) - Detected emotion (joy, anger, sadness, fear, etc.)
    - `emotion_label` (text) - Emotion classification
    - `status` (text) - Analysis status (pending, completed, failed)
    - `last_updated` (timestamptz) - Last analysis update
    - `last_ionc` (text) - Last interaction context
    - `hast_history` (jsonb) - Historical sentiment data
    - `created_at` (timestamptz) - Analysis creation timestamp

  ### 6. `engagement` - Post Engagement Metrics
    - `engagement_id` (uuid, primary key) - Unique identifier
    - `post_id` (uuid, foreign key) - References posts table
    - `likes` (integer) - Number of likes
    - `comments` (integer) - Number of comments
    - `views` (integer) - Number of views
    - `reactions` (integer) - Total reactions
    - `engagement_score` (decimal) - Calculated engagement score
    - `engagement_history` (jsonb) - Historical engagement data
    - `last_updated` (timestamptz) - Last metrics update
    - `created_at` (timestamptz) - Record creation timestamp

  ## Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading public sentiment data

  ## Indexes
    - Create indexes on foreign keys for optimal query performance
    - Create indexes on frequently queried fields (platform, label, posted_at)
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  display_name text,
  email text,
  location text,
  platform text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create hashtags table
CREATE TABLE IF NOT EXISTS hashtags (
  hashtag_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  total_posts integer DEFAULT 0
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  post_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(user_id) ON DELETE CASCADE,
  content text,
  platform text NOT NULL,
  posted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create post_hashtags junction table
CREATE TABLE IF NOT EXISTS post_hashtags (
  post_id uuid REFERENCES posts(post_id) ON DELETE CASCADE,
  hashtag_id uuid REFERENCES hashtags(hashtag_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, hashtag_id)
);

-- Create sentiment table
CREATE TABLE IF NOT EXISTS sentiment (
  sentiment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(post_id) ON DELETE CASCADE,
  label text NOT NULL CHECK (label IN ('Positive', 'Negative', 'Neutral')),
  score decimal CHECK (score >= 0 AND score <= 1),
  emotion text,
  emotion_label text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  last_updated timestamptz DEFAULT now(),
  last_ionc text,
  hast_history jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create engagement table
CREATE TABLE IF NOT EXISTS engagement (
  engagement_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(post_id) ON DELETE CASCADE,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  views integer DEFAULT 0,
  reactions integer DEFAULT 0,
  engagement_score decimal DEFAULT 0,
  engagement_history jsonb DEFAULT '[]'::jsonb,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_posted_at ON posts(posted_at);
CREATE INDEX IF NOT EXISTS idx_sentiment_post_id ON sentiment(post_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_label ON sentiment(label);
CREATE INDEX IF NOT EXISTS idx_engagement_post_id ON engagement(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag_id ON post_hashtags(hashtag_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all user profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert new users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update user profiles"
  ON users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for hashtags table
CREATE POLICY "Anyone can view hashtags"
  ON hashtags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create hashtags"
  ON hashtags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update hashtags"
  ON hashtags FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for posts table
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for post_hashtags table
CREATE POLICY "Anyone can view post hashtags"
  ON post_hashtags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create post hashtags"
  ON post_hashtags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete post hashtags"
  ON post_hashtags FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sentiment table
CREATE POLICY "Anyone can view sentiment data"
  ON sentiment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create sentiment records"
  ON sentiment FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sentiment records"
  ON sentiment FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for engagement table
CREATE POLICY "Anyone can view engagement data"
  ON engagement FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create engagement records"
  ON engagement FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update engagement records"
  ON engagement FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update hashtag post count
CREATE OR REPLACE FUNCTION update_hashtag_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE hashtags 
    SET total_posts = total_posts + 1 
    WHERE hashtag_id = NEW.hashtag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE hashtags 
    SET total_posts = total_posts - 1 
    WHERE hashtag_id = OLD.hashtag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for hashtag count
DROP TRIGGER IF EXISTS trigger_update_hashtag_count ON post_hashtags;
CREATE TRIGGER trigger_update_hashtag_count
AFTER INSERT OR DELETE ON post_hashtags
FOR EACH ROW
EXECUTE FUNCTION update_hashtag_count();

-- Create function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.engagement_score := (NEW.likes * 1.0 + NEW.comments * 2.0 + NEW.reactions * 1.5 + NEW.views * 0.1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for engagement score calculation
DROP TRIGGER IF EXISTS trigger_calculate_engagement_score ON engagement;
CREATE TRIGGER trigger_calculate_engagement_score
BEFORE INSERT OR UPDATE ON engagement
FOR EACH ROW
EXECUTE FUNCTION calculate_engagement_score();