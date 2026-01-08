/**
 * Create Post Form Component
 * Form for creating new social media posts with image upload
 */

'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/utils/supabase/client';

interface CreatePostFormProps {
  sandboxId: string | null;
  onPostCreated: () => void;
  onCancel: () => void;
}

export function CreatePostForm({ sandboxId, onPostCreated, onCancel }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);
      if (sandboxId) {
        formData.append('sandbox_id', sandboxId);
      }

      const response = await fetch('/api/social/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.url);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload image');
        setImagePreview(null);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Post content is required');
      return;
    }

    if (content.length > 2000) {
      setError('Post must be less than 2000 characters');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sandbox_id: sandboxId,
          content: content.trim(),
          image_url: imageUrl,
        }),
      });

      if (response.ok) {
        setContent('');
        setImageUrl(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onPostCreated();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cloud-card p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts in the cloud..."
            className="w-full min-h-[120px] resize-none bg-transparent border border-opacity-30 rounded-lg p-3 text-sm focus:border-opacity-60 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all"
            style={{
              borderColor: 'hsl(var(--hydrogen-beta))',
              color: 'hsl(var(--text-primary))',
              '--tw-ring-color': 'hsl(var(--hydrogen-beta))',
            } as React.CSSProperties}
            maxLength={2000}
            disabled={submitting}
          />
          <div className="mt-1.5 text-xs text-right" style={{ color: 'hsl(var(--text-tertiary))' }}>
            {content.length}/2000
          </div>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-64 w-full rounded object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 bg-black/50 hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm p-2 rounded" style={{ 
            backgroundColor: 'hsl(var(--status-error) / 0.1)',
            color: 'hsl(var(--status-error))' 
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={uploading || submitting}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || submitting}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: 'hsl(var(--hydrogen-gamma) / 0.1)',
                border: '1px solid hsl(var(--hydrogen-gamma) / 0.3)',
                color: 'hsl(var(--hydrogen-gamma))',
              }}
            >
              <ImageIcon className={`h-4 w-4 ${uploading ? 'animate-pulse' : ''}`} />
              {uploading ? 'Uploading...' : 'Image'}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                border: '1px solid hsl(var(--hydrogen-beta) / 0.3)',
                color: 'hsl(var(--text-secondary))',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="hydrogen-btn hydrogen-btn-beta flex items-center gap-2 px-4 py-1.5 text-sm"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

