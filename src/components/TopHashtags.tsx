import { useEffect, useState } from 'react';
import { supabase, type Hashtag } from '../lib/supabase';
import { Hash, TrendingUp } from 'lucide-react';

export default function TopHashtags() {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHashtags();
  }, []);

  const loadHashtags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .order('total_posts', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHashtags(data || []);
    } catch (error) {
      console.error('Error loading hashtags:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Trending Hashtags</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : hashtags.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Hash className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hashtags yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hashtags.map((hashtag, index) => (
            <div
              key={hashtag.hashtag_id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-amber-100 text-amber-700' :
                  index === 1 ? 'bg-slate-200 text-slate-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">#{hashtag.tag}</p>
                  <p className="text-xs text-slate-500">{hashtag.total_posts} posts</p>
                </div>
              </div>
              {index < 3 && <TrendingUp className="w-4 h-4 text-green-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
