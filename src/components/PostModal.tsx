import { X, Heart, MessageSquare, Eye, TrendingUp, Smile, Frown, Minus } from 'lucide-react';
import { type PostWithDetails } from '../lib/supabase';

interface PostModalProps {
  post: PostWithDetails;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PostModal({ post, onClose, onUpdate }: PostModalProps) {
  const sentiment = post.sentiment?.[0];
  const engagement = post.engagement?.[0];

  const getSentimentIcon = (label?: string) => {
    switch (label) {
      case 'Positive':
        return <Smile className="w-5 h-5 text-green-600" />;
      case 'Negative':
        return <Frown className="w-5 h-5 text-red-600" />;
      case 'Neutral':
        return <Minus className="w-5 h-5 text-slate-600" />;
      default:
        return <Minus className="w-5 h-5 text-slate-400" />;
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
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Post Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
              {post.users?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-lg">
                {post.users?.display_name || post.users?.username || 'Unknown User'}
              </p>
              <p className="text-sm text-slate-500">@{post.users?.username || 'unknown'}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-slate-800 text-lg leading-relaxed">{post.content}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {post.platform}
            </span>
            <span className="px-3 py-1.5 rounded-full text-sm text-slate-600 bg-slate-100">
              {formatDate(post.posted_at)}
            </span>
          </div>

          {sentiment && (
            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Sentiment Analysis</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Sentiment</span>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${getSentimentColor(sentiment.label)}`}>
                    {getSentimentIcon(sentiment.label)}
                    {sentiment.label}
                  </span>
                </div>

                {sentiment.score !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600">Confidence Score</span>
                      <span className="font-semibold text-slate-900">{(sentiment.score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${sentiment.score * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {sentiment.emotion && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Detected Emotion</span>
                    <span className="font-medium text-slate-900 capitalize">{sentiment.emotion}</span>
                  </div>
                )}

                {sentiment.emotion_label && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Emotion Label</span>
                    <span className="font-medium text-slate-900">{sentiment.emotion_label}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Analysis Status</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    sentiment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    sentiment.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {sentiment.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {engagement && (
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Engagement Metrics</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-100 rounded-lg">
                    <Heart className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Likes</p>
                    <p className="text-xl font-bold text-slate-900">{engagement.likes}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Comments</p>
                    <p className="text-xl font-bold text-slate-900">{engagement.comments}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Views</p>
                    <p className="text-xl font-bold text-slate-900">{engagement.views}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Reactions</p>
                    <p className="text-xl font-bold text-slate-900">{engagement.reactions}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Engagement Score</span>
                  <span className="text-2xl font-bold text-blue-600">{Math.round(engagement.engagement_score)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
