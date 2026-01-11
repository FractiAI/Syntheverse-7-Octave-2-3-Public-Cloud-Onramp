/**
 * Hero Creator Console - Lab-styled CRUD interface for hero and story management
 * Rebuilt with Creator Lab™ aesthetic for consistency
 */
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Sparkles, Save, Trash2, Edit, PlusCircle, Loader2 } from 'lucide-react';

interface Hero {
  id: string;
  name: string;
  icon_url: string | null;
  tagline: string | null;
  description: string | null;
  page_assignment: string | null;
  pillar_assignment: string | null;
  default_system_prompt: string | null;
  status: 'online' | 'offline' | 'maintenance';
  metadata?: {
    personality?: string;
    capabilities?: string[];
    tone?: string;
    style?: string;
  };
}

interface Story {
  id: string;
  hero_id: string;
  title: string;
  description: string | null;
  system_prompt: string;
  context: string | null;
  tags: string[];
  interaction_style: string | null;
  metadata?: any;
}

interface AIPromptTemplate {
  id: string;
  template_name: string;
  template_type: 'hero_persona' | 'story_narrative' | 'interaction_behavior' | 'custom';
  prompt_template: string;
  variables: string[];
  example_output: string | null;
}

export default function HeroCreatorConsole() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [templates, setTemplates] = useState<AIPromptTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'heroes' | 'stories' | 'ai-assistant'>('heroes');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hero form state
  const [heroForm, setHeroForm] = useState({
    name: '',
    icon_url: '',
    tagline: '',
    description: '',
    page_assignment: '',
    pillar_assignment: '',
    default_system_prompt: '',
    status: 'offline' as 'online' | 'offline' | 'maintenance',
    metadata: {
      personality: '' as string,
      capabilities: [] as string[],
      tone: '' as string,
      style: '' as string,
    } as { personality: string; capabilities: string[]; tone: string; style: string },
  });

  // Story form state
  const [storyForm, setStoryForm] = useState({
    hero_id: '',
    title: '',
    description: '',
    system_prompt: '',
    context: '',
    tags: [] as string[],
    interaction_style: '',
  });

  // AI Assistant state
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiGeneratedOutput, setAiGeneratedOutput] = useState('');
  const [aiMode, setAiMode] = useState<'hero' | 'story' | 'interaction'>('hero');
  const [aiGenerating, setAiGenerating] = useState(false);

  const supabase = createClient();

  // Load data
  const loadHeroes = async () => {
    try {
      const response = await fetch('/api/heroes');
      if (!response.ok) throw new Error('Failed to fetch heroes');
      const data = await response.json();
      setHeroes(data.heroes || []);
    } catch (err) {
      console.error('Error loading heroes:', err);
    }
  };

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from('story_catalog')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (err) {
      console.error('Error loading stories:', err);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_prompt_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadHeroes(), loadStories(), loadTemplates()]);
      setLoading(false);
    };
    init();
  }, []);

  // Hero CRUD
  const createHero = async () => {
    if (!heroForm.name.trim()) {
      alert('Hero name is required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/heroes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroForm),
      });

      if (!response.ok) throw new Error('Failed to create hero');
      
      alert('Hero created successfully!');
      resetHeroForm();
      await loadHeroes();
    } catch (err) {
      console.error('Error creating hero:', err);
      alert('Failed to create hero');
    } finally {
      setSaving(false);
    }
  };

  const updateHero = async () => {
    if (!selectedHero) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/heroes/${selectedHero.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroForm),
      });

      if (!response.ok) throw new Error('Failed to update hero');
      
      alert('Hero updated successfully!');
      setSelectedHero(null);
      resetHeroForm();
      await loadHeroes();
    } catch (err) {
      console.error('Error updating hero:', err);
      alert('Failed to update hero');
    } finally {
      setSaving(false);
    }
  };

  const deleteHero = async (heroId: string) => {
    if (!confirm('Are you sure you want to delete this hero? This will also delete all associated stories.')) {
      return;
    }

    try {
      const response = await fetch(`/api/heroes/${heroId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete hero');
      
      alert('Hero deleted successfully!');
      await loadHeroes();
    } catch (err) {
      console.error('Error deleting hero:', err);
      alert('Failed to delete hero');
    }
  };

  // Story CRUD
  const createStory = async () => {
    if (!storyForm.hero_id || !storyForm.title.trim() || !storyForm.system_prompt.trim()) {
      alert('Hero, title, and system prompt are required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/heroes/${storyForm.hero_id}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyForm),
      });

      if (!response.ok) throw new Error('Failed to create story');
      
      alert('Story created successfully!');
      resetStoryForm();
      await loadStories();
    } catch (err) {
      console.error('Error creating story:', err);
      alert('Failed to create story');
    } finally {
      setSaving(false);
    }
  };

  const updateStory = async () => {
    if (!selectedStory) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('story_catalog')
        .update(storyForm)
        .eq('id', selectedStory.id);

      if (error) throw error;
      
      alert('Story updated successfully!');
      setSelectedStory(null);
      resetStoryForm();
      await loadStories();
    } catch (err) {
      console.error('Error updating story:', err);
      alert('Failed to update story');
    } finally {
      setSaving(false);
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('story_catalog')
        .delete()
        .eq('id', storyId);

      if (error) throw error;
      
      alert('Story deleted successfully!');
      await loadStories();
    } catch (err) {
      console.error('Error deleting story:', err);
      alert('Failed to delete story');
    }
  };

  // AI-Assisted Prompt Generation
  const generatePrompt = async () => {
    if (!aiPromptInput.trim()) {
      alert('Please provide input for prompt generation');
      return;
    }

    setAiGenerating(true);
    try {
      // Simulate AI generation with a template-based approach
      // In production, this would call an AI API (OpenAI, Anthropic, etc.)
      
      let generatedPrompt = '';
      
      if (aiMode === 'hero') {
        generatedPrompt = `You are ${aiPromptInput.split('\n')[0]}, a character in the Syntheverse ecosystem. ${aiPromptInput}

Your role is to guide and assist users navigating the Syntheverse platform. You are knowledgeable, friendly, and focused on helping contributors, operators, and creators achieve their goals.

Key traits:
- Professional yet approachable
- Clear and concise communication
- Supportive and encouraging
- Expert knowledge of the Syntheverse system

Always maintain consistency with the Syntheverse vision and values.`;
      } else if (aiMode === 'story') {
        generatedPrompt = `Story Context: ${aiPromptInput}

As the hero guiding this story, you will:
1. Introduce the story theme and context
2. Ask clarifying questions to understand user goals
3. Provide step-by-step guidance through the narrative
4. Adapt your responses based on user choices
5. Maintain story coherence and engagement

Your responses should be immersive, interactive, and aligned with the story's objectives.`;
      } else {
        generatedPrompt = `Interaction Behavior: ${aiPromptInput}

Core interaction principles:
- Listen actively to user needs
- Provide contextual, relevant responses
- Use examples and analogies when helpful
- Encourage exploration and discovery
- Adapt tone and complexity to user level

Always prioritize user experience and goal achievement.`;
      }

      setAiGeneratedOutput(generatedPrompt);
    } catch (err) {
      console.error('Error generating prompt:', err);
      alert('Failed to generate prompt');
    } finally {
      setAiGenerating(false);
    }
  };

  const applyGeneratedPrompt = () => {
    if (aiMode === 'hero') {
      setHeroForm(prev => ({ ...prev, default_system_prompt: aiGeneratedOutput }));
      setActiveTab('heroes');
    } else if (aiMode === 'story') {
      setStoryForm(prev => ({ ...prev, system_prompt: aiGeneratedOutput }));
      setActiveTab('stories');
    }
    alert('Generated prompt applied!');
  };

  // Form helpers
  const resetHeroForm = () => {
    setHeroForm({
      name: '',
      icon_url: '',
      tagline: '',
      description: '',
      page_assignment: '',
      pillar_assignment: '',
      default_system_prompt: '',
      status: 'offline',
      metadata: { personality: '', capabilities: [], tone: '', style: '' },
    });
    setSelectedHero(null);
  };

  const resetStoryForm = () => {
    setStoryForm({
      hero_id: '',
      title: '',
      description: '',
      system_prompt: '',
      context: '',
      tags: [],
      interaction_style: '',
    });
    setSelectedStory(null);
  };

  const editHero = (hero: Hero) => {
    setSelectedHero(hero);
    setHeroForm({
      name: hero.name,
      icon_url: hero.icon_url || '',
      tagline: hero.tagline || '',
      description: hero.description || '',
      page_assignment: hero.page_assignment || '',
      pillar_assignment: hero.pillar_assignment || '',
      default_system_prompt: hero.default_system_prompt || '',
      status: hero.status,
      metadata: {
        personality: hero.metadata?.personality || '',
        capabilities: hero.metadata?.capabilities || [],
        tone: hero.metadata?.tone || '',
        style: hero.metadata?.style || '',
      } as { personality: string; capabilities: string[]; tone: string; style: string },
    });
  };

  const editStory = (story: Story) => {
    setSelectedStory(story);
    setStoryForm({
      hero_id: story.hero_id,
      title: story.title,
      description: story.description || '',
      system_prompt: story.system_prompt,
      context: story.context || '',
      tags: story.tags || [],
      interaction_style: story.interaction_style || '',
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--lab-primary)] mx-auto" />
        <p className="mt-4 text-[var(--lab-text-secondary)]">Loading creator console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lab-style Tabs */}
      <div className="lab-instrument-panel">
        <div className="flex gap-2 border-b-2 border-[var(--lab-border)]">
          <button
            onClick={() => setActiveTab('heroes')}
            className={`px-6 py-3 font-semibold text-sm uppercase tracking-wider transition-all ${
              activeTab === 'heroes'
                ? 'text-[var(--lab-primary)] border-b-2 border-[var(--lab-primary)] -mb-[2px]'
                : 'text-[var(--lab-text-secondary)] hover:text-[var(--lab-text-primary)]'
            }`}
          >
            Heroes ({heroes.length})
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-6 py-3 font-semibold text-sm uppercase tracking-wider transition-all ${
              activeTab === 'stories'
                ? 'text-[var(--lab-primary)] border-b-2 border-[var(--lab-primary)] -mb-[2px]'
                : 'text-[var(--lab-text-secondary)] hover:text-[var(--lab-text-primary)]'
            }`}
          >
            Stories ({stories.length})
          </button>
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className={`px-6 py-3 font-semibold text-sm uppercase tracking-wider transition-all ${
              activeTab === 'ai-assistant'
                ? 'text-[var(--lab-primary)] border-b-2 border-[var(--lab-primary)] -mb-[2px]'
                : 'text-[var(--lab-text-secondary)] hover:text-[var(--lab-text-primary)]'
            }`}
          >
            <Sparkles className="inline h-4 w-4 mr-1" /> AI Assistant
          </button>
        </div>
      </div>

      {/* Heroes Tab */}
      {activeTab === 'heroes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hero Form */}
          <div className="lg:col-span-1">
            <div className="lab-card">
              <div className="lab-card-header">
                <h3 className="lab-card-title">
                  {selectedHero ? <Edit className="inline h-4 w-4 mr-2" /> : <PlusCircle className="inline h-4 w-4 mr-2" />}
                  {selectedHero ? 'Edit Hero' : 'Create Hero'}
                </h3>
              </div>
              <div className="lab-card-body">
              
              <div className="space-y-4">
                <div>
                  <label className="lab-label">Name *</label>
                  <input
                    type="text"
                    value={heroForm.name}
                    onChange={(e) => setHeroForm({ ...heroForm, name: e.target.value })}
                    className="lab-input"
                    placeholder="e.g., Navigator Nova"
                  />
                </div>

                <div>
                  <label className="lab-label">Icon (emoji or URL)</label>
                  <input
                    type="text"
                    value={heroForm.icon_url}
                    onChange={(e) => setHeroForm({ ...heroForm, icon_url: e.target.value })}
                    className="lab-input"
                    placeholder="🚀 or https://..."
                  />
                </div>

                <div>
                  <label className="lab-label">Tagline</label>
                  <input
                    type="text"
                    value={heroForm.tagline}
                    onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })}
                    className="lab-input"
                    placeholder="Your friendly guide"
                  />
                </div>

                <div>
                  <label className="lab-label">Description</label>
                  <textarea
                    value={heroForm.description}
                    onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                    className="lab-textarea h-20"
                    placeholder="Brief description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="lab-label">Page</label>
                    <select
                      value={heroForm.page_assignment}
                      onChange={(e) => setHeroForm({ ...heroForm, page_assignment: e.target.value })}
                      className="lab-input"
                    >
                      <option value="">Any</option>
                      <option value="dashboard">Dashboard</option>
                      <option value="landing">Landing</option>
                      <option value="onboarding">Onboarding</option>
                      <option value="console">Console</option>
                    </select>
                  </div>

                  <div>
                    <label className="lab-label">Pillar</label>
                    <select
                      value={heroForm.pillar_assignment}
                      onChange={(e) => setHeroForm({ ...heroForm, pillar_assignment: e.target.value })}
                      className="lab-input"
                    >
                      <option value="">Any</option>
                      <option value="contributor">Contributor</option>
                      <option value="operator">Operator</option>
                      <option value="creator">Creator</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="lab-label">Default System Prompt</label>
                  <textarea
                    value={heroForm.default_system_prompt}
                    onChange={(e) => setHeroForm({ ...heroForm, default_system_prompt: e.target.value })}
                    className="lab-textarea h-32 text-sm"
                    placeholder="Default behavior and personality..."
                  />
                </div>

                <div>
                  <label className="lab-label">Status</label>
                  <select
                    value={heroForm.status}
                    onChange={(e) => setHeroForm({ ...heroForm, status: e.target.value as any })}
                    className="lab-input"
                  >
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  {selectedHero ? (
                    <>
                      <button
                        onClick={updateHero}
                        disabled={saving}
                        className="lab-button flex-1 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Update'}
                      </button>
                      <button
                        onClick={resetHeroForm}
                        className="lab-button-secondary"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={createHero}
                      disabled={saving}
                      className="lab-button w-full disabled:opacity-50"
                    >
                      {saving ? 'Creating...' : 'Create Hero'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Heroes List */}
          <div className="lg:col-span-2">
            <div className="lab-card">
              <div className="lab-card-header">
                <h3 className="lab-card-title">Existing Heroes</h3>
              </div>
              <div className="lab-card-body">
              
                <div className="space-y-3">
                  {heroes.map(hero => (
                    <div key={hero.id} className="p-4 bg-[var(--lab-bg-instrument)] rounded-lg border border-[var(--lab-border)] hover:border-[var(--lab-primary)] transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl">{hero.icon_url || '🤖'}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[var(--lab-text-primary)]">{hero.name}</h3>
                          <p className="text-sm text-[var(--lab-text-secondary)]">{hero.tagline}</p>
                          <div className="flex gap-2 mt-2">
                            {hero.page_assignment && (
                              <span className="lab-badge">
                                {hero.page_assignment}
                              </span>
                            )}
                            {hero.pillar_assignment && (
                              <span className="lab-badge">
                                {hero.pillar_assignment}
                              </span>
                            )}
                            <span className={`lab-badge ${
                              hero.status === 'online' ? 'bg-[var(--lab-success)]/10 text-[var(--lab-success)] border-[var(--lab-success)]' : ''
                            }`}>
                              {hero.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editHero(hero)}
                          className="lab-button-secondary text-sm"
                        >
                          <Edit className="inline h-3 w-3 mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => deleteHero(hero.id)}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded border border-red-300 hover:border-red-500 transition-all text-sm"
                        >
                          <Trash2 className="inline h-3 w-3 mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stories Tab */}
      {activeTab === 'stories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Story Form */}
          <div className="lg:col-span-1">
            <div className="lab-card">
              <div className="lab-card-header">
                <h3 className="lab-card-title">
                  {selectedStory ? <Edit className="inline h-4 w-4 mr-2" /> : <PlusCircle className="inline h-4 w-4 mr-2" />}
                  {selectedStory ? 'Edit Story' : 'Create Story'}
                </h3>
              </div>
              <div className="lab-card-body">
              
              <div className="space-y-4">
                <div>
                  <label className="lab-label">Hero *</label>
                  <select
                    value={storyForm.hero_id}
                    onChange={(e) => setStoryForm({ ...storyForm, hero_id: e.target.value })}
                    className="lab-input"
                  >
                    <option value="">Select a hero</option>
                    {heroes.map(hero => (
                      <option key={hero.id} value={hero.id}>{hero.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="lab-label">Title *</label>
                  <input
                    type="text"
                    value={storyForm.title}
                    onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                    className="lab-input"
                    placeholder="e.g., Getting Started Guide"
                  />
                </div>

                <div>
                  <label className="lab-label">Description</label>
                  <textarea
                    value={storyForm.description}
                    onChange={(e) => setStoryForm({ ...storyForm, description: e.target.value })}
                    className="lab-textarea h-20"
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <label className="lab-label">System Prompt *</label>
                  <textarea
                    value={storyForm.system_prompt}
                    onChange={(e) => setStoryForm({ ...storyForm, system_prompt: e.target.value })}
                    className="lab-textarea h-32 text-sm"
                    placeholder="Story-specific system prompt..."
                  />
                </div>

                <div>
                  <label className="lab-label">Context</label>
                  <textarea
                    value={storyForm.context}
                    onChange={(e) => setStoryForm({ ...storyForm, context: e.target.value })}
                    className="w-full h-20 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Additional context..."
                  />
                </div>

                <div>
                  <label className="lab-label">Interaction Style</label>
                  <select
                    value={storyForm.interaction_style}
                    onChange={(e) => setStoryForm({ ...storyForm, interaction_style: e.target.value })}
                    className="lab-input"
                  >
                    <option value="">Default</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="conversational">Conversational</option>
                    <option value="directive">Directive</option>
                    <option value="exploratory">Exploratory</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  {selectedStory ? (
                    <>
                      <button
                        onClick={updateStory}
                        disabled={saving}
                        className="lab-button flex-1 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Update'}
                      </button>
                      <button
                        onClick={resetStoryForm}
                        className="lab-button-secondary"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={createStory}
                      disabled={saving}
                      className="lab-button w-full disabled:opacity-50"
                    >
                      {saving ? 'Creating...' : 'Create Story'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Stories List */}
          <div className="lg:col-span-2">
            <div className="lab-card">
              <div className="lab-card-header">
                <h3 className="lab-card-title">Existing Stories</h3>
              </div>
              <div className="lab-card-body">
              
                <div className="space-y-3">
                  {stories.map(story => {
                    const hero = heroes.find(h => h.id === story.hero_id);
                    return (
                      <div key={story.id} className="p-4 bg-[var(--lab-bg-instrument)] rounded-lg border border-[var(--lab-border)] hover:border-[var(--lab-primary)] transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[var(--lab-text-primary)]">{story.title}</h3>
                            <span className="text-xs px-2 py-1 bg-[var(--lab-primary)]/10 text-[var(--lab-primary)] border border-[var(--lab-primary)]/30 rounded">
                              {hero?.name || 'Unknown Hero'}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--lab-text-secondary)]">{story.description}</p>
                          {story.interaction_style && (
                            <span className="inline-block mt-2 lab-badge">
                              {story.interaction_style}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editStory(story)}
                            className="lab-button-secondary text-sm"
                          >
                            <Edit className="inline h-3 w-3 mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => deleteStory(story.id)}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded border border-red-300 hover:border-red-500 transition-all text-sm"
                          >
                            <Trash2 className="inline h-3 w-3 mr-1" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Tab */}
      {activeTab === 'ai-assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="lab-card">
            <div className="lab-card-header">
              <h3 className="lab-card-title">
                <Sparkles className="inline h-4 w-4 mr-2" /> AI-Assisted Prompt Creator
              </h3>
            </div>
            <div className="lab-card-body">
              
                <div className="space-y-4">
                  <div>
                    <label className="lab-label">Generation Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setAiMode('hero')}
                        className={`px-4 py-2 rounded font-medium transition-all ${
                          aiMode === 'hero'
                            ? 'lab-button'
                            : 'lab-button-secondary'
                        }`}
                      >
                        Hero Persona
                      </button>
                      <button
                        onClick={() => setAiMode('story')}
                        className={`px-4 py-2 rounded font-medium transition-all ${
                          aiMode === 'story'
                            ? 'lab-button'
                            : 'lab-button-secondary'
                        }`}
                      >
                        Story
                      </button>
                      <button
                        onClick={() => setAiMode('interaction')}
                        className={`px-4 py-2 rounded font-medium transition-all ${
                          aiMode === 'interaction'
                            ? 'lab-button'
                            : 'lab-button-secondary'
                        }`}
                      >
                        Interaction
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="lab-label">
                      Describe your {aiMode === 'hero' ? 'hero' : aiMode === 'story' ? 'story' : 'interaction behavior'}
                    </label>
                    <textarea
                      value={aiPromptInput}
                      onChange={(e) => setAiPromptInput(e.target.value)}
                      className="lab-textarea h-64"
                      placeholder={
                        aiMode === 'hero'
                          ? "Describe the hero's name, personality, role, expertise, and tone..."
                          : aiMode === 'story'
                          ? "Describe the story narrative, objectives, user journey, and desired outcomes..."
                          : "Describe the interaction patterns, user engagement style, and behavioral guidelines..."
                      }
                    />
                  </div>

                  <button
                    onClick={generatePrompt}
                    disabled={aiGenerating}
                    className="lab-button w-full disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <><Loader2 className="inline h-4 w-4 animate-spin mr-2" /> Generating...</>
                    ) : (
                      <><Sparkles className="inline h-4 w-4 mr-2" /> Generate System Prompt</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Output */}
            <div className="lab-card">
              <div className="lab-card-header">
                <h3 className="lab-card-title">Generated System Prompt</h3>
              </div>
              <div className="lab-card-body">
              
              {aiGeneratedOutput ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--lab-bg-instrument)] border border-[var(--lab-border)] rounded">
                    <pre className="whitespace-pre-wrap text-sm text-[var(--lab-text-primary)] font-mono">
                      {aiGeneratedOutput}
                    </pre>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={applyGeneratedPrompt}
                      className="flex-1 px-4 py-2 bg-[var(--lab-success)] hover:bg-[var(--lab-success)]/90 text-white font-semibold rounded transition-all"
                    >
                      <Save className="inline h-4 w-4 mr-2" /> Apply to Form
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(aiGeneratedOutput)}
                      className="lab-button-secondary"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--lab-text-label)]">
                  <div className="text-center">
                    <Sparkles className="h-16 w-16 mx-auto mb-4 text-[var(--lab-primary)]" />
                    <p>AI-generated prompt will appear here</p>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

