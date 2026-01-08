/**
 * Post Card Component
 * Displays individual social media posts with like, comment, and delete functionality
 */

'use client';

import { useState } from 'react';
import { Heart, MessageSquare, Trash2, Pin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostComments } from './PostComments';
// Date formatting utility

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

interface PostCardProps {
  post: SocialPost;
  currentUserEmail: string | null;
  onDelete: (postId: string) => void;
  onLikeToggle: (postId: string, liked: boolean, newLikesCount: number) => void;
  onCommentAdded: (postId: string) => void;
}

export function PostCard({
  post,
  currentUserEmail,
  onDelete,
  onLikeToggle,
  onCommentAdded,
}: PostCardProps) {
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);

    try {
      const endpoint = post.author_liked
        ? `/api/social/posts/${post.id}/like`
        : `/api/social/posts/${post.id}/like`;

      const method = post.author_liked ? 'DELETE' : 'POST';

      const response = await fetch(endpoint, { method });

      if (response.ok) {
        const data = await response.json();
        onLikeToggle(post.id, data.liked, data.likes_count);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    if (deleting) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/social/posts/${post.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(post.id);
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      creator: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      operator: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      contributor: 'bg-green-500/20 text-green-400 border-green-500/50',
    };
    return colors[role as keyof typeof colors] || colors.contributor;
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const isOwnPost = currentUserEmail === post.author_email;

  return (
    <div 
      className="fractal-node-post" 
      data-pinned={post.is_pinned}
      data-role={post.author_role}
    >
      <div className="fractal-node-inner">
        <div className="fractal-node-content">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Profile Picture */}
            <div className="h-10 w-10 rounded-full bg-[var(--hydrogen-amber)]/20 flex items-center justify-center overflow-hidden">
              {post.author_profile_picture ? (
                <img
                  src={post.author_profile_picture}
                  alt={post.author_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-[var(--hydrogen-amber)]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="cockpit-title text-sm font-semibold">{post.author_name}</span>
                {post.is_pinned && (
                  <Pin className="h-4 w-4 text-[var(--hydrogen-amber)]" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`cockpit-badge text-xs ${getRoleBadge(post.author_role)}`}>
                  {post.author_role}
                </span>
                <span className="cockpit-text text-xs opacity-60">
                  {formatTime(post.created_at)}
                </span>
              </div>
            </div>
          </div>
          {isOwnPost && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="cockpit-lever text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="cockpit-text whitespace-pre-wrap break-words">{post.content}</div>

        {/* Image */}
        {post.image_url && (
          <div className="rounded overflow-hidden">
            <img
              src={post.image_url}
              alt="Post image"
              className="max-h-96 w-full object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-[var(--keyline-primary)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={liking}
            className={`cockpit-lever ${post.author_liked ? 'text-red-400' : ''}`}
          >
            <Heart
              className={`h-4 w-4 mr-2 ${post.author_liked ? 'fill-current' : ''}`}
            />
            {post.likes_count}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="cockpit-lever"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {post.comments_count}
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="pt-3 border-t border-[var(--keyline-primary)]">
            <PostComments
              postId={post.id}
              currentUserEmail={currentUserEmail}
              onCommentAdded={onCommentAdded}
            />
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

