import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  user_id: string;
  username: string;
  display_name?: string;
  email?: string;
  location?: string;
  platform?: string;
  created_at: string;
  updated_at: string;
}

export interface Hashtag {
  hashtag_id: string;
  tag: string;
  created_at: string;
  total_posts: number;
}

export interface Post {
  post_id: string;
  user_id: string;
  content: string;
  platform: string;
  posted_at: string;
  created_at: string;
}

export interface Sentiment {
  sentiment_id: string;
  post_id: string;
  label: 'Positive' | 'Negative' | 'Neutral';
  score: number;
  emotion?: string;
  emotion_label?: string;
  status: 'pending' | 'completed' | 'failed';
  last_updated: string;
  last_ionc?: string;
  hast_history?: any[];
  created_at: string;
}

export interface Engagement {
  engagement_id: string;
  post_id: string;
  likes: number;
  comments: number;
  views: number;
  reactions: number;
  engagement_score: number;
  engagement_history?: any[];
  last_updated: string;
  created_at: string;
}

export interface PostWithDetails extends Post {
  users?: User;
  sentiment?: Sentiment[];
  engagement?: Engagement[];
}
