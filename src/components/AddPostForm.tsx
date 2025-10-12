import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, X } from 'lucide-react';

interface AddPostFormProps {
  onSuccess: () => void;
}

export default function AddPostForm({ onSuccess }: AddPostFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    location: '',
    platform: 'Twitter',
    content: '',
    hashtags: '',
    likes: 0,
    comments: 0,
    views: 0,
    reactions: 0,
    sentiment: 'Neutral' as 'Positive' | 'Negative' | 'Neutral',
    emotion: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userId = null;

      const { data: existingUser } = await supabase
        .from('users')
        .select('user_id')
        .eq('username', formData.username)
        .maybeSingle();

      if (existingUser) {
        userId = existingUser.user_id;
      } else {
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            username: formData.username,
            display_name: formData.displayName || formData.username,
            email: formData.email || null,
            location: formData.location || null,
            platform: formData.platform
          })
          .select()
          .single();

        if (userError) throw userError;
        userId = newUser.user_id;
      }

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content: formData.content,
          platform: formData.platform,
          posted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (postError) throw postError;

      if (formData.hashtags) {
        const tags = formData.hashtags.split(',').map(t => t.trim().replace('#', '')).filter(t => t);

        for (const tag of tags) {
          let hashtagId = null;

          const { data: existingHashtag } = await supabase
            .from('hashtags')
            .select('hashtag_id')
            .eq('tag', tag)
            .maybeSingle();

          if (existingHashtag) {
            hashtagId = existingHashtag.hashtag_id;
          } else {
            const { data: newHashtag, error: hashtagError } = await supabase
              .from('hashtags')
              .insert({ tag })
              .select()
              .single();

            if (hashtagError) throw hashtagError;
            hashtagId = newHashtag.hashtag_id;
          }

          await supabase
            .from('post_hashtags')
            .insert({
              post_id: post.post_id,
              hashtag_id: hashtagId
            });
        }
      }

      const sentimentScore = formData.sentiment === 'Positive' ? 0.85 : formData.sentiment === 'Negative' ? 0.15 : 0.5;

      await supabase
        .from('sentiment')
        .insert({
          post_id: post.post_id,
          label: formData.sentiment,
          score: sentimentScore,
          emotion: formData.emotion || null,
          emotion_label: formData.emotion || null,
          status: 'completed'
        });

      await supabase
        .from('engagement')
        .insert({
          post_id: post.post_id,
          likes: formData.likes,
          comments: formData.comments,
          views: formData.views,
          reactions: formData.reactions
        });

      setFormData({
        username: '',
        displayName: '',
        email: '',
        location: '',
        platform: 'Twitter',
        content: '',
        hashtags: '',
        likes: 0,
        comments: 0,
        views: 0,
        reactions: 0,
        sentiment: 'Neutral',
        emotion: ''
      });
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Add New Post</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="johndoe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="New York, USA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Platform <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Twitter">Twitter</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sentiment <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.sentiment}
                    onChange={(e) => setFormData({ ...formData, sentiment: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Post Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="What's happening?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hashtags
                </label>
                <input
                  type="text"
                  value={formData.hashtags}
                  onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="trending, socialmedia, ai (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Emotion
                </label>
                <input
                  type="text"
                  value={formData.emotion}
                  onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="joy, anger, sadness, fear, etc."
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Likes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.likes}
                    onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Comments
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Views
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reactions
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reactions}
                    onChange={(e) => setFormData({ ...formData, reactions: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
