import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface EngagementData {
  platform: string;
  avgEngagement: number;
  totalPosts: number;
}

export default function EngagementMetrics() {
  const [metrics, setMetrics] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEngagementMetrics();
  }, []);

  const loadEngagementMetrics = async () => {
    setLoading(true);
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          platform,
          engagement(engagement_score)
        `);

      if (error) throw error;

      const platformMetrics = new Map<string, { total: number; count: number; posts: number }>();

      posts?.forEach((post: any) => {
        const platform = post.platform || 'Unknown';
        const score = post.engagement?.[0]?.engagement_score || 0;

        if (!platformMetrics.has(platform)) {
          platformMetrics.set(platform, { total: 0, count: 0, posts: 0 });
        }

        const current = platformMetrics.get(platform)!;
        current.total += score;
        current.count += 1;
        current.posts += 1;
      });

      const metricsArray: EngagementData[] = Array.from(platformMetrics.entries()).map(([platform, data]) => ({
        platform,
        avgEngagement: data.count > 0 ? data.total / data.count : 0,
        totalPosts: data.posts
      })).sort((a, b) => b.avgEngagement - a.avgEngagement);

      setMetrics(metricsArray);
    } catch (error) {
      console.error('Error loading engagement metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      Twitter: 'bg-sky-100 text-sky-800',
      Facebook: 'bg-blue-100 text-blue-800',
      Instagram: 'bg-pink-100 text-pink-800',
      LinkedIn: 'bg-indigo-100 text-indigo-800',
      TikTok: 'bg-slate-100 text-slate-800'
    };
    return colors[platform] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Platform Engagement</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : metrics.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No engagement data yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const maxEngagement = Math.max(...metrics.map(m => m.avgEngagement));
            const percentage = maxEngagement > 0 ? (metric.avgEngagement / maxEngagement) * 100 : 0;
            const isTop = index === 0;

            return (
              <div key={metric.platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPlatformColor(metric.platform)}`}>
                      {metric.platform}
                    </span>
                    {isTop && (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{metric.totalPosts} posts</span>
                    <span className="text-sm font-bold text-slate-900">
                      {Math.round(metric.avgEngagement)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTop ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
