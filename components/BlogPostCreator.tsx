'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, Eye, FileText } from 'lucide-react';

type BlogPostCreatorProps = {
  sandboxId?: string | null; // null for main blog, sandbox ID for sandbox-specific blog
  onSave?: () => void;
  onCancel?: () => void;
  initialPost?: {
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    status: string;
    featured: boolean;
    tags: string[];
    author_name: string | null;
  } | null;
};

export function BlogPostCreator({
  sandboxId = null,
  onSave,
  onCancel,
  initialPost = null,
}: BlogPostCreatorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title);
      setContent(initialPost.content);
      setExcerpt(initialPost.excerpt || '');
      setStatus(initialPost.status as 'draft' | 'published');
      setFeatured(initialPost.featured);
      setTags(initialPost.tags.join(', '));
      setAuthorName(initialPost.author_name || '');
    }
  }, [initialPost]);

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: any = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || null,
        status,
        featured,
        tags: tagsArray,
        author_name: authorName.trim() || null,
      };

      if (sandboxId) {
        payload.sandbox_id = sandboxId;
      }

      const url = initialPost ? `/api/blog/${initialPost.id}` : '/api/blog';
      const method = initialPost ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save post');
      }

      if (onSave) {
        onSave();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cockpit-panel p-6">
      <div className="mb-6 border-b border-[var(--keyline-primary)] pb-4">
        <div className="cockpit-label mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {initialPost ? 'EDIT BLOG POST' : 'CREATE BLOG POST'}
        </div>
        {sandboxId && (
          <div className="cockpit-text text-xs opacity-60">
            Creating post for sandbox blog
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3">
          <div className="cockpit-text text-sm text-red-400">{error}</div>
        </div>
      )}

      <div className="space-y-4">
        {/* Title */}
        <div>
          <Label htmlFor="title" className="cockpit-label mb-2 block text-xs">
            TITLE
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            className="cockpit-input"
          />
        </div>

        {/* Excerpt */}
        <div>
          <Label htmlFor="excerpt" className="cockpit-label mb-2 block text-xs">
            EXCERPT (OPTIONAL)
          </Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary of the post..."
            rows={2}
            className="cockpit-input"
          />
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content" className="cockpit-label mb-2 block text-xs">
            CONTENT
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog post content here..."
            rows={12}
            className="cockpit-input font-mono text-sm"
          />
        </div>

        {/* Author Name */}
        <div>
          <Label htmlFor="author_name" className="cockpit-label mb-2 block text-xs">
            AUTHOR NAME (OPTIONAL)
          </Label>
          <Input
            id="author_name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Display name (defaults to email username)"
            className="cockpit-input"
          />
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags" className="cockpit-label mb-2 block text-xs">
            TAGS (COMMA-SEPARATED)
          </Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="cockpit-input"
          />
        </div>

        {/* Status and Featured */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="cockpit-label mb-2 block text-xs">STATUS</Label>
            <div className="flex gap-2">
              <Button
                variant={status === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus('draft')}
                className="cockpit-lever"
              >
                Draft
              </Button>
              <Button
                variant={status === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus('published')}
                className="cockpit-lever"
              >
                Published
              </Button>
            </div>
          </div>

          <div>
            <Label className="cockpit-label mb-2 block text-xs">FEATURED</Label>
            <Button
              variant={featured ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFeatured(!featured)}
              className="cockpit-lever"
            >
              {featured ? 'Featured' : 'Not Featured'}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
            className="cockpit-lever"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : initialPost ? 'Update Post' : 'Create Post'}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="cockpit-lever">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

