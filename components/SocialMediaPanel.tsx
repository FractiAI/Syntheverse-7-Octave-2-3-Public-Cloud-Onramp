/**
 * Social Media Panel Component
 * Sandbox-based community feed with posts, likes, comments, and image uploads
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, MessageSquare, Heart, Image as ImageIcon, X } from 'lucide-react';
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

export function SocialMediaPanel() {
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
    // Fetch posts for both Syntheverse (null) and other sandboxes
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
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    setOffset(0);
    fetchPosts(selectedSandbox, 0, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(selectedSandbox, offset, false);
    }
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
      prev.map((post) =>
        post.id === postId
          ? { ...post, author_liked: liked, likes_count: newLikesCount }
          : post
      )
    );
  };

  const handleCommentAdded = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, comments_count: post.comments_count + 1 } : post
      )
    );
  };

  const fetchSandboxName = async (sandboxId: string) => {
    if (sandboxId === 'syntheverse') {
      setSandboxName('Syntheverse');
      return;
    }

    try {
      const response = await fetch(`/api/enterprise/sandboxes`);
      if (response.ok) {
        const data = await response.json();
        const sandbox = data.sandboxes?.find((s: any) => s.id === sandboxId);
        if (sandbox?.name) {
          setSandboxName(sandbox.name);
        } else {
          setSandboxName(`Sandbox ${sandboxId.substring(0, 8)}...`);
        }
      }
    } catch (err) {
      console.error('Error fetching sandbox name:', err);
      setSandboxName(`Sandbox ${sandboxId.substring(0, 8)}...`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--keyline-primary)] pb-3">
        <div>
          <div className="cockpit-label text-xs uppercase tracking-wider">{sandboxName} CHANNEL</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="cockpit-lever"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="default"
            size="sm"
            className="cockpit-lever"
          >
            {showCreateForm ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                New Post
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <div className="mb-4">
          <CreatePostForm
            sandboxId={selectedSandbox}
            onPostCreated={handlePostCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="cockpit-panel border-l-4 border-red-500 bg-red-500/10 p-4">
          <div className="cockpit-text text-red-400">{error}</div>
        </div>
      )}

      {/* Posts Feed */}
      {loading && posts.length === 0 ? (
        <div className="cockpit-panel p-8 text-center">
          <div className="cockpit-text opacity-70">Loading posts...</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="cockpit-panel p-8 text-center">
          <div className="cockpit-text opacity-70">No posts yet. Be the first to post!</div>
        </div>
      ) : (
        <div className="space-y-4">
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

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                className="cockpit-lever"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

