'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, Eye, FileText, Upload, Image as ImageIcon, EyeOff } from 'lucide-react';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/blog/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to upload image');
      }

      const { url } = await res.json();

      // Insert image markdown at cursor position
      const textarea = contentTextareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const imageMarkdown = `![${file.name}](${url})`;
        const newContent =
          content.substring(0, start) + imageMarkdown + content.substring(end);
        setContent(newContent);

        // Set cursor position after inserted image
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
        }, 0);
      } else {
        // Append to end if no cursor position
        setContent((prev) => prev + (prev ? '\n\n' : '') + `![${file.name}](${url})`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          await handleImageUpload(file);
        }
        break;
      }
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

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

      // Show success message briefly
      setError(null);
      
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

        {/* Content Editor */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="content" className="cockpit-label block text-xs">
              CONTENT (MARKDOWN SUPPORTED)
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="cockpit-lever text-xs"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="mr-1 h-3 w-3" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="mr-1 h-3 w-3" />
                    Show Preview
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="cockpit-lever text-xs"
              >
                <Upload className="mr-1 h-3 w-3" />
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Textarea
                ref={contentTextareaRef}
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                placeholder="Write your blog post content here... (Markdown supported, paste images to upload)"
                rows={16}
                className="cockpit-input font-mono text-sm"
                style={{ display: showPreview ? 'none' : 'block' }}
              />
              <div className="cockpit-text mt-2 text-xs opacity-60">
                Tip: Paste images directly or use the upload button. Markdown formatting is supported.
              </div>
            </div>
            {showPreview && (
              <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
                <div className="cockpit-label mb-2 text-xs">PREVIEW</div>
                <BlogContentPreview content={content} />
              </div>
            )}
          </div>
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

// Simple markdown renderer component
function BlogContentPreview({ content }: { content: string }) {
  // Simple markdown parser for preview
  const renderMarkdown = (text: string) => {
    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="cockpit-title text-lg mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="cockpit-title text-xl mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="cockpit-title text-2xl mt-4 mb-2">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');

    // Images
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/gim,
      '<img src="$2" alt="$1" class="my-4 max-w-full rounded border border-[var(--keyline-primary)]" />'
    );

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/gim,
      '<a href="$2" class="text-[var(--hydrogen-amber)] hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Code blocks
    html = html.replace(
      /```([\s\S]*?)```/gim,
      '<pre class="cockpit-panel bg-[var(--cockpit-carbon)] p-3 rounded my-2 overflow-x-auto"><code class="text-xs font-mono">$1</code></pre>'
    );

    // Inline code
    html = html.replace(
      /`([^`]+)`/gim,
      '<code class="bg-[var(--cockpit-carbon)] px-1 py-0.5 rounded text-xs font-mono">$1</code>'
    );

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/(<li.*<\/li>)/gim, '<ul class="list-disc my-2 space-y-1">$1</ul>');

    // Line breaks
    html = html.replace(/\n\n/gim, '</p><p class="cockpit-text mb-3">');
    html = html.replace(/\n/gim, '<br />');

    return `<p class="cockpit-text mb-3">${html}</p>`;
  };

  return (
    <div
      className="cockpit-text prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
