import { useEffect, useState } from 'react';
import { supabase, type PostWithDetails, type Sentiment } from '../lib/supabase';
import { BarChart3, TrendingUp, Users, Hash, MessageSquare, Heart, Eye, Smile } from 'lucide-react';
import SentimentChart from './SentimentChart';
import RecentPosts from './RecentPosts';
import TopHashtags from './TopHashtags';
import EngagementMetrics from './EngagementMetrics';

interface DashboardStats {
  totalPosts: number;
  totalUsers: number;
  totalHashtags: number;
  avgEngagement: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalUsers: 0,
    totalHashtags: 0,
    avgEngagement: 0,
    sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState<PostWithDetails[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [postsRes, usersRes, hashtagsRes, sentimentRes, engagementRes, recentPostsRes] = await Promise.all([
        supabase.from('posts').select('post_id', { count: 'exact', head: true }),
        supabase.from('users').select('user_id', { count: 'exact', head: true }),
        supabase.from('hashtags').select('hashtag_id', { count: 'exact', head: true }),
        supabase.from('sentiment').select('label'),
        supabase.from('engagement').select('engagement_score'),
        supabase.from('posts')
          .select(`
            *,
            users(*),
            sentiment(*),
            engagement(*)
          `)
          .order('posted_at', { ascending: false })
          .limit(10)
      ]);

      const sentimentBreakdown = {
        positive: 0,
        negative: 0,
        neutral: 0
      };

      if (sentimentRes.data) {
        sentimentRes.data.forEach((s: Sentiment) => {
          if (s.label === 'Positive') sentimentBreakdown.positive++;
          else if (s.label === 'Negative') sentimentBreakdown.negative++;
          else if (s.label === 'Neutral') sentimentBreakdown.neutral++;
        });
      }

      const avgEngagement = engagementRes.data && engagementRes.data.length > 0
        ? engagementRes.data.reduce((acc, e) => acc + (e.engagement_score || 0), 0) / engagementRes.data.length
        : 0;

      setStats({
        totalPosts: postsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalHashtags: hashtagsRes.count || 0,
        avgEngagement,
        sentimentBreakdown
      });

      setRecentPosts(recentPostsRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Sentiment Analysis Dashboard</h1>
          <p className="text-slate-600">Real-time insights from social media sentiment data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Total Posts"
            value={stats.totalPosts}
            color="bg-blue-500"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Active Users"
            value={stats.totalUsers}
            color="bg-green-500"
          />
          <StatCard
            icon={<Hash className="w-6 h-6" />}
            title="Hashtags"
            value={stats.totalHashtags}
            color="bg-amber-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Avg Engagement"
            value={Math.round(stats.avgEngagement)}
            color="bg-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SentimentChart data={stats.sentimentBreakdown} />
          <EngagementMetrics />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RecentPosts posts={recentPosts} onUpdate={loadDashboardData} />
          </div>
          <div>
            <TopHashtags />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}

function StatCard({ icon, title, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
