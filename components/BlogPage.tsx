'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BlogPostCreator } from './BlogPostCreator';
import { FileText, Plus, Edit, Trash2, Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

type BlogPageProps = {
  sandboxId?: string;
  isAuthenticated?: boolean;
  userEmail?: string | null;
  canCreate?: boolean;
};

type BlogPost = {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  author: string;
  author_name: string | null;
  sandbox_id: string | null;
  status: string;
  published_at: string | null;
  featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export function BlogPage({
  sandboxId,
  isAuthenticated = false,
  userEmail = null,
  canCreate: canCreateProp = false,
}: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const canCreate = canCreateProp;

  async function fetchPosts() {
    setLoading(true);
    try {
      // If user can create posts, show all statuses (including drafts)
      // Otherwise, only show published posts
      const statusParam = canCreate ? 'all' : 'published';
      const url = sandboxId 
        ? `/api/blog?sandbox_id=${sandboxId}&status=${statusParam}` 
        : `/api/blog?status=${statusParam}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        // Debug: Log post statuses to help identify issues
        if (data.posts) {
          data.posts.forEach((post: BlogPost) => {
            if (post.title.includes('Hydrogen Spin')) {
              console.log('Post status debug:', {
                title: post.title,
                status: post.status,
                published_at: post.published_at,
                isPublished: post.status === 'published',
              });
            }
          });
        }
        setPosts(data.posts || []);
      } else {
        console.error('Failed to fetch posts:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandboxId, userEmail]);

  async function handleDelete(postId: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/blog/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  }

  function handleEdit(post: BlogPost) {
    setEditingPost(post);
    setShowCreator(true);
  }

  function handleSave() {
    setShowCreator(false);
    setEditingPost(null);
    // Refresh posts and then reload page to ensure everything is in sync
    fetchPosts().then(() => {
      // Small delay to ensure data is saved, then refresh
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
  }

  function handleCancel() {
    setShowCreator(false);
    setEditingPost(null);
  }

  const featuredPosts = posts.filter((p) => p.featured && p.status === 'published');
  const regularPosts = posts.filter((p) => !p.featured || p.status !== 'published');

  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto space-y-6 px-6 py-8">
        {/* Header */}
        <div className="cockpit-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="cockpit-label mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {sandboxId ? 'CLOUD BLOG' : 'SYNTHEVERSE BLOG'}
              </div>
              <h1 className="cockpit-title text-2xl md:text-3xl">
                {sandboxId ? 'Sandbox Blog' : 'Syntheverse Blog'}
              </h1>
              <p className="cockpit-text mt-2 opacity-80">
                {sandboxId
                  ? 'Blog posts for this enterprise sandbox'
                  : 'News, updates, and insights from the Syntheverse ecosystem'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canCreate && (
                <Button onClick={() => setShowCreator(true)} className="cockpit-lever">
                  <Plus className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              )}
              {sandboxId && (
                <Link href="/blog" className="cockpit-lever inline-block">
                  <ArrowLeft className="mr-2 inline h-4 w-4" />
                  Main Blog
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Blog Post Creator */}
        {showCreator && (
          <BlogPostCreator
            sandboxId={sandboxId || null}
            initialPost={editingPost}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div>
            <div className="cockpit-label mb-4 flex items-center gap-2 text-xs">
              <span className="text-[var(--hydrogen-amber)]">★</span>
              FEATURED POSTS
            </div>
            <div className="space-y-6">
              {featuredPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} canEdit={canCreate} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        <div>
          <div className="cockpit-label mb-4 flex items-center gap-2 text-xs">
            {featuredPosts.length > 0 ? (
              <>
                <span>—</span>
                ALL POSTS
              </>
            ) : (
              'BLOG POSTS'
            )}
          </div>
          {loading ? (
            <div className="cockpit-panel p-8 text-center">
              <div className="cockpit-text opacity-60">Loading posts...</div>
            </div>
          ) : regularPosts.length > 0 ? (
            <div className="space-y-6">
              {regularPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} canEdit={canCreate} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="cockpit-panel p-8 text-center">
              <div className="cockpit-text mb-4 opacity-60">No blog posts yet.</div>
              {canCreate && (
                <Button onClick={() => setShowCreator(true)} className="cockpit-lever">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Post
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Markdown renderer for blog content display
function BlogContentDisplay({ content }: { content: string }) {
  // Simple markdown parser
  const renderMarkdown = (text: string) => {
    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="cockpit-title text-lg mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="cockpit-title text-xl mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="cockpit-title text-2xl mt-6 mb-4">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-[var(--hydrogen-amber)]">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic opacity-90">$1</em>');

    // Images
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/gim,
      '<div class="my-6"><img src="$2" alt="$1" class="w-full rounded border border-[var(--keyline-primary)] shadow-lg" /></div>'
    );

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/gim,
      '<a href="$2" class="text-[var(--hydrogen-amber)] hover:text-[var(--hydrogen-amber)]/80 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Code blocks
    html = html.replace(
      /```([\s\S]*?)```/gim,
      '<div class="cockpit-panel bg-[var(--cockpit-carbon)] p-4 rounded my-4 overflow-x-auto"><code class="text-xs font-mono cockpit-text">$1</code></div>'
    );

    // Inline code
    html = html.replace(
      /`([^`]+)`/gim,
      '<code class="bg-[var(--cockpit-carbon)] px-1.5 py-0.5 rounded text-xs font-mono cockpit-text border border-[var(--keyline-primary)]">$1</code>'
    );

    // Lists
    const lines = html.split('\n');
    let inList = false;
    let listItems: string[] = [];
    const processedLines: string[] = [];

    lines.forEach((line) => {
      if (line.trim().match(/^[\-\*\+]\s/)) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(line.replace(/^[\-\*\+]\s/, ''));
      } else {
        if (inList) {
          processedLines.push(
            `<ul class="list-disc ml-6 my-3 space-y-1 cockpit-text">${listItems
              .map((item) => `<li>${item}</li>`)
              .join('')}</ul>`
          );
          inList = false;
          listItems = [];
        }
        processedLines.push(line);
      }
    });

    if (inList && listItems.length > 0) {
      processedLines.push(
        `<ul class="list-disc ml-6 my-3 space-y-1 cockpit-text">${listItems
          .map((item) => `<li>${item}</li>`)
          .join('')}</ul>`
      );
    }

    html = processedLines.join('\n');

    // Line breaks
    html = html.replace(/\n\n\n+/gim, '</p><p class="cockpit-text mb-4 leading-relaxed">');
    html = html.replace(/\n\n/gim, '</p><p class="cockpit-text mb-4 leading-relaxed">');
    html = html.replace(/\n/gim, '<br />');

    return `<div class="cockpit-text text-sm leading-relaxed"><p class="cockpit-text mb-4 leading-relaxed">${html}</p></div>`;
  };

  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}

function BlogPostCard({
  post,
  canEdit,
  onEdit,
  onDelete,
}: {
  post: BlogPost;
  canEdit: boolean;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
}) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Draft';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="cockpit-panel p-6">
      {/* Header Section */}
      <div className="mb-6 border-b border-[var(--keyline-primary)] pb-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="cockpit-title mb-3 text-2xl">{post.title}</h2>
            {post.excerpt && (
              <p className="cockpit-text mb-0 text-sm leading-relaxed opacity-80">{post.excerpt}</p>
            )}
          </div>
          {canEdit && (
            <div className="ml-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(post)}
                className="cockpit-lever"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(post.id)}
                className="cockpit-lever text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Metadata Bar */}
        <div className="cockpit-label flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3 opacity-60" />
            <span className="cockpit-text opacity-75">
              {post.author_name || post.author.split('@')[0]}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 opacity-60" />
            <span className="cockpit-text opacity-75">
              {formatDate(post.published_at || post.created_at)}
            </span>
          </div>
          {post.status && post.status.toLowerCase() !== 'published' && (
            <span className="rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-yellow-400">
              {post.status?.toUpperCase() || 'DRAFT'}
            </span>
          )}
          {post.featured && (
            <span className="rounded border border-[var(--hydrogen-amber)]/30 bg-[var(--hydrogen-amber)]/10 px-2 py-1 text-[var(--hydrogen-amber)]">
              FEATURED
            </span>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="cockpit-label flex items-center gap-1 rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] px-2 py-1 text-xs opacity-75"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="blog-post-content">
        <BlogContentDisplay content={post.content} />
      </div>
    </div>
  );
}

