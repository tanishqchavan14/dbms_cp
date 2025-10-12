import { useState } from 'react';
import { type PostWithDetails } from '../lib/supabase';
import { Smile, Frown, Minus, Heart, MessageSquare, Eye, TrendingUp } from 'lucide-react';
import PostModal from './PostModal';

interface RecentPostsProps {
  posts: PostWithDetails[];
  onUpdate: () => void;
}

export default function RecentPosts({ posts, onUpdate }: RecentPostsProps) {
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);

  const getSentimentIcon = (label?: string) => {
    switch (label) {
      case 'Positive':
        return <Smile className="w-4 h-4 text-green-600" />;
      case 'Negative':
        return <Frown className="w-4 h-4 text-red-600" />;
      case 'Neutral':
        return <Minus className="w-4 h-4 text-slate-600" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSentimentColor = (label?: string) => {
    switch (label) {
      case 'Positive':
        return 'bg-green-100 text-green-800';
      case 'Negative':
        return 'bg-red-100 text-red-800';
      case 'Neutral':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Posts</h2>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No posts yet. Add your first post to get started!</p>
            </div>
          ) : (
            posts.map((post) => {
              const sentiment = post.sentiment?.[0];
              const engagement = post.engagement?.[0];

              return (
                <div
                  key={post.post_id}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {post.users?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {post.users?.display_name || post.users?.username || 'Unknown User'}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(post.posted_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sentiment && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getSentimentColor(sentiment.label)}`}>
                          {getSentimentIcon(sentiment.label)}
                          {sentiment.label}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {post.platform}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 mb-3 line-clamp-2">{post.content}</p>

                  {engagement && (
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {engagement.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {engagement.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {engagement.views}
                      </span>
                      <span className="flex items-center gap-1 ml-auto text-blue-600 font-medium">
                        <TrendingUp className="w-4 h-4" />
                        {Math.round(engagement.engagement_score)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
