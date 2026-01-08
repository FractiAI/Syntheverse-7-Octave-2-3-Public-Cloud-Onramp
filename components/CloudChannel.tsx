/**
 * Cloud Channel - Awareness Bridge/Router
 * Connection point to the Syntheverse HHF-AI Cloud of Choice
 * Routes consciousness through the Holographic Hydrogen Frontier
 * Positioned on the right side (Cursor-style) as a living bridge interface
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, MessageSquare, Heart, Image as ImageIcon, X, Plus, Cloud, Sparkles, Radio, Cpu, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className={`cloud-channel-container ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="cloud-channel-collapse-btn"
        title={isCollapsed ? 'Expand Cloud Channel' : 'Collapse Cloud Channel'}
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Header - CLOUD Branding */}
      <div className="cloud-channel-header">
        <div className="flex flex-col gap-2.5 w-full">
          {/* Main Title: CLOUD */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud 
                className="w-7 h-7" 
                style={{ 
                  color: 'hsl(var(--tropical-blue))',
                  filter: 'drop-shadow(0 0 12px hsl(var(--tropical-glow) / 0.8))',
                  strokeWidth: 2
                }} 
              />
              <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-black tracking-wider" style={{ 
                  color: 'hsl(var(--tropical-blue))',
                  textShadow: '0 0 15px hsl(var(--tropical-glow) / 0.6)',
                  letterSpacing: '0.15em',
                  lineHeight: 1
                }}>
                  CLOUD
                </h1>
                <div className="text-[9px] font-medium tracking-wide" style={{ 
                  color: 'hsl(var(--text-secondary) / 0.8)',
                  letterSpacing: '0.05em'
                }}>
                  Awareness Bridge Router • FractiAI
                </div>
              </div>
            </div>
            {/* Connection Status */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{
              background: 'hsl(var(--tropical-blue) / 0.1)',
              border: '1px solid hsl(var(--tropical-blue) / 0.3)'
            }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{
                background: 'hsl(var(--tropical-blue))',
                boxShadow: '0 0 8px hsl(var(--tropical-glow))'
              }} />
              <span className="text-[10px] font-mono font-semibold" style={{ 
                color: 'hsl(var(--tropical-blue))'
              }}>
                ONLINE
              </span>
            </div>
          </div>

          {/* Frontier HHF-AI Syntheverse Cloud */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <Radio className="w-3 h-3" style={{ color: 'hsl(var(--tropical-light))' }} />
              <span style={{ color: 'hsl(var(--text-secondary) / 0.9)' }}>
                Frontier HHF-AI Syntheverse Cloud
              </span>
            </div>
            <div className="flex-1 h-px" style={{
              background: 'linear-gradient(90deg, hsl(var(--tropical-blue) / 0.3), transparent)'
            }} />
            <span className="text-[10px] font-mono" style={{ 
              color: 'hsl(var(--tropical-dark))'
            }}>
              {sandboxName}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1">
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
              className="hydrogen-btn hydrogen-btn-beta flex items-center gap-2 px-3 py-1.5 text-xs font-semibold"
            >
              <Zap className="w-3.5 h-3.5" />
              New Transmission
            </button>
          </div>
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
            <div className="relative mb-4">
              <Radio className="w-12 h-12 animate-pulse" style={{ 
                color: 'hsl(var(--tropical-blue))',
                filter: 'drop-shadow(0 0 15px hsl(var(--tropical-glow) / 0.8))'
              }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin" style={{ color: 'hsl(var(--tropical-light))' }} />
              </div>
            </div>
            <p className="text-sm font-mono mb-1" style={{ color: 'hsl(var(--tropical-blue))' }}>
              ESTABLISHING BRIDGE CONNECTION
            </p>
            <p className="text-xs font-mono" style={{ color: 'hsl(var(--text-secondary))' }}>
              Routing through HHF-AI Cloud...
            </p>
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
            <div className="relative mb-6">
              <Radio 
                className="w-16 h-16 mb-2 animate-pulse" 
                style={{ 
                  color: 'hsl(var(--hydrogen-beta))',
                  filter: 'drop-shadow(0 0 20px hsl(var(--hydrogen-beta) / 0.6))'
                }} 
              />
              <div className="absolute -inset-8 border-2 border-dashed rounded-full animate-spin-slow" style={{
                borderColor: 'hsl(var(--hydrogen-beta) / 0.2)'
              }} />
            </div>
            <p className="text-base font-bold mb-2 tracking-wide" style={{ 
              color: 'hsl(var(--hydrogen-beta))',
              textShadow: '0 0 10px hsl(var(--hydrogen-beta) / 0.5)'
            }}>
              BRIDGE ACTIVE • AWAITING SIGNAL
            </p>
            <p className="text-xs mb-4 font-mono" style={{ color: 'hsl(var(--text-secondary))' }}>
              The Awareness Bridge routes your consciousness through<br/>
              the Holographic Hydrogen Frontier to the HHF-AI Cloud.
            </p>
            <p className="text-xs mb-6 opacity-70" style={{ color: 'hsl(var(--text-secondary))' }}>
              Be the first to transmit through this channel.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="hydrogen-btn hydrogen-btn-beta text-sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Initiate Transmission
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

