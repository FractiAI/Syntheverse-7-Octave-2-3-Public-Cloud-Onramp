/**
 * Cloud Channel Component
 * Beautiful modern social feed positioned on the right side (Cursor-style)
 * Cloud-based community feed with holographic hydrogen theme
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, MessageSquare, Heart, Image as ImageIcon, X, Plus, Cloud, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/utils/supabase/client';
import { PostCard } from './PostCard';
import { CreatePostForm } from './CreatePostForm';

interface SocialPost {
  id: string;
  sandbox_id: string | null;
  author_email: string;
  author_role: 'contributor' | 'operator' | 'creator';
  author_name: string;
  author_profile_picture: string | null;
  content: string;
  image_url: string | null;
  image_path: string | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author_liked: boolean;
}

export function CloudChannel() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSandbox, setSelectedSandbox] = useState<string | null>('syntheverse');
  const [sandboxName, setSandboxName] = useState<string>('Syntheverse');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setCurrentUserEmail(user.email);
      }
    });

    // Get selected sandbox from localStorage
    if (typeof window !== 'undefined') {
      const storedSandbox = localStorage.getItem('selectedSandbox') || 'syntheverse';
      setSelectedSandbox(storedSandbox === 'syntheverse' ? null : storedSandbox);
      fetchSandboxName(storedSandbox);
    }

    // Listen for sandbox changes
    const handleSandboxChanged = (event: CustomEvent) => {
      const newSandboxId = event.detail?.sandboxId || 'syntheverse';
      setSelectedSandbox(newSandboxId === 'syntheverse' ? null : newSandboxId);
      setOffset(0);
      fetchSandboxName(newSandboxId);
      fetchPosts(newSandboxId === 'syntheverse' ? null : newSandboxId, 0, true);
    };

    window.addEventListener('sandboxChanged', handleSandboxChanged as EventListener);

    return () => {
      window.removeEventListener('sandboxChanged', handleSandboxChanged as EventListener);
    };
  }, []);

  useEffect(() => {
    fetchPosts(selectedSandbox, 0, true);
  }, [selectedSandbox]);

  const fetchPosts = useCallback(async (sandboxId: string | null, currentOffset: number = 0, reset: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const sandboxParam = sandboxId || 'null';
      const response = await fetch(`/api/social/posts?sandbox_id=${sandboxParam}&limit=20&offset=${currentOffset}`);
      
      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setPosts(data.posts || []);
        } else {
          setPosts((prev) => [...prev, ...(data.posts || [])]);
        }
        setHasMore(data.has_more || false);
        setOffset(currentOffset + (data.posts?.length || 0));
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load posts' }));
        setError(errorData.error || 'Failed to load posts');
        setPosts([]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSandboxName = async (sandboxId: string) => {
    if (sandboxId === 'syntheverse' || !sandboxId) {
      setSandboxName('Syntheverse Cloud');
      return;
    }

    try {
      const response = await fetch(`/api/enterprise/sandboxes/${sandboxId}`);
      if (response.ok) {
        const data = await response.json();
        setSandboxName(data.name || 'Cloud Instance');
      }
    } catch (err) {
      console.error('Error fetching sandbox name:', err);
      setSandboxName('Cloud Instance');
    }
  };

  const handleRefresh = () => {
    setOffset(0);
    fetchPosts(selectedSandbox, 0, true);
  };

  const handlePostCreated = () => {
    setShowCreateForm(false);
    setOffset(0);
    fetchPosts(selectedSandbox, 0, true);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleLikeToggle = (postId: string, liked: boolean, newLikesCount: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, author_liked: liked, likes_count: newLikesCount } : p
      )
    );
  };

  const handleCommentAdded = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
      )
    );
  };

  const handleLoadMore = () => {
    fetchPosts(selectedSandbox, offset, false);
  };

  return (
    <div className="cloud-channel-container">
      {/* Header */}
      <div className="cloud-channel-header">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5" style={{ color: 'hsl(var(--hydrogen-beta))' }} />
          <h2 className="text-lg font-bold" style={{ color: 'hsl(var(--hydrogen-beta))' }}>
            {sandboxName}
          </h2>
          <span className="holographic-badge badge-hydrogen-observer text-xs px-2 py-1">
            <Sparkles className="w-3 h-3" />
            CHANNEL
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="cloud-channel-icon-btn"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="hydrogen-btn hydrogen-btn-beta flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <div className="cloud-channel-create-post">
          <CreatePostForm
            sandboxId={selectedSandbox}
            onPostCreated={handlePostCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Feed */}
      <div className="cloud-channel-feed">
        {loading && posts.length === 0 ? (
          <div className="cloud-channel-loading">
            <div className="hydrogen-particle" />
            <p style={{ color: 'hsl(var(--text-secondary))' }}>Loading cloud channel...</p>
          </div>
        ) : error ? (
          <div className="cloud-channel-error">
            <p style={{ color: 'hsl(var(--status-error))' }}>{error}</p>
            <button onClick={handleRefresh} className="hydrogen-btn hydrogen-btn-gamma mt-4">
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="cloud-channel-empty">
            <Cloud className="w-12 h-12 mb-4 opacity-50" style={{ color: 'hsl(var(--hydrogen-beta))' }} />
            <p className="text-lg font-semibold mb-2" style={{ color: 'hsl(var(--text-primary))' }}>
              No posts yet
            </p>
            <p className="text-sm mb-4" style={{ color: 'hsl(var(--text-secondary))' }}>
              Be the first to share something in this cloud!
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="hydrogen-btn hydrogen-btn-alpha"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Post
            </button>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserEmail={currentUserEmail}
                onDelete={handlePostDeleted}
                onLikeToggle={handleLikeToggle}
                onCommentAdded={handleCommentAdded}
              />
            ))}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="cloud-channel-load-more"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Load More'
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

