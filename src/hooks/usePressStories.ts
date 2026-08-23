import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { PressStory } from '../types/database';

const PHOTO_BUCKET = 'game-photos';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function usePressStories() {
  const [stories, setStories] = useState<PressStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('press_stories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories((data || []) as PressStory[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const fetchPublishedStories = useCallback(async (): Promise<PressStory[]> => {
    const { data, error } = await supabase
      .from('press_stories')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching published stories:', error);
      return [];
    }
    return (data || []) as PressStory[];
  }, []);

  const fetchFeaturedStories = useCallback(async (limit = 3): Promise<PressStory[]> => {
    const { data, error } = await supabase
      .from('press_stories')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('display_order', { ascending: true })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('Error fetching featured stories:', error);
      return [];
    }
    return (data || []) as PressStory[];
  }, []);

  const getStoryBySlug = useCallback(async (slug: string): Promise<PressStory | null> => {
    const { data, error } = await supabase
      .from('press_stories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      console.error('Error fetching story by slug:', error);
      return null;
    }
    return (data as PressStory) || null;
  }, []);

  const ensureUniqueSlug = useCallback(async (base: string, ignoreId?: string): Promise<string> => {
    const baseSlug = slugify(base) || `story-${Date.now()}`;
    let candidate = baseSlug;
    let attempt = 1;
    while (attempt < 50) {
      const query = supabase.from('press_stories').select('id').eq('slug', candidate).limit(1);
      const { data, error } = await query;
      if (error) {
        console.error('Slug check failed:', error);
        return `${baseSlug}-${Date.now()}`;
      }
      const conflict = (data || []).find((row: { id: string }) => row.id !== ignoreId);
      if (!conflict) return candidate;
      attempt += 1;
      candidate = `${baseSlug}-${attempt}`;
    }
    return `${baseSlug}-${Date.now()}`;
  }, []);

  const createStory = useCallback(
    async (data: Partial<Omit<PressStory, 'id' | 'created_at' | 'updated_at'>>) => {
      const slug = await ensureUniqueSlug(data.slug || data.title || '');
      const { data: newStory, error } = await supabase
        .from('press_stories')
        .insert({
          slug,
          title: data.title || 'Untitled Story',
          subtitle: data.subtitle || null,
          body: data.body || '',
          cover_photo_url: data.cover_photo_url || null,
          photos: data.photos || [],
          author: data.author || null,
          published_at: data.published_at || null,
          is_published: data.is_published ?? false,
          is_featured: data.is_featured ?? false,
          display_order: data.display_order ?? 0,
        })
        .select()
        .single();
      if (error) throw error;
      await fetchStories();
      return newStory as PressStory;
    },
    [ensureUniqueSlug, fetchStories]
  );

  const updateStory = useCallback(
    async (id: string, data: Partial<Omit<PressStory, 'id' | 'created_at' | 'updated_at'>>) => {
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.subtitle !== undefined) updateData.subtitle = data.subtitle || null;
      if (data.body !== undefined) updateData.body = data.body;
      if (data.cover_photo_url !== undefined) updateData.cover_photo_url = data.cover_photo_url || null;
      if (data.photos !== undefined) updateData.photos = data.photos;
      if (data.author !== undefined) updateData.author = data.author || null;
      if (data.published_at !== undefined) updateData.published_at = data.published_at || null;
      if (data.is_published !== undefined) updateData.is_published = data.is_published;
      if (data.is_featured !== undefined) updateData.is_featured = data.is_featured;
      if (data.display_order !== undefined) updateData.display_order = data.display_order;
      if (data.slug !== undefined && data.slug.length > 0) {
        updateData.slug = await ensureUniqueSlug(data.slug, id);
      }

      const { data: updated, error } = await supabase
        .from('press_stories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchStories();
      return updated as PressStory;
    },
    [ensureUniqueSlug, fetchStories]
  );

  const deleteStory = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('press_stories').delete().eq('id', id);
      if (error) throw error;
      await fetchStories();
    },
    [fetchStories]
  );

  const uploadStoryPhoto = useCallback(async (file: File, storyId: string): Promise<string> => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `press/${storyId}/${Date.now()}.${ext}`;
    // Supabase defaults uploads to `cache-control: max-age=3600`, which is why
    // GTmetrix flagged every storage object with a 60-minute TTL (2026-08-23).
    // The path is timestamped, so a replacement is always a new URL — these are
    // safe to cache for a year.
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { cacheControl: '31536000' });
    if (error) throw error;
    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }, []);

  const deleteStoryPhoto = useCallback(async (photoUrl: string) => {
    const parts = photoUrl.split(`/${PHOTO_BUCKET}/`);
    if (parts.length < 2) return;
    const filePath = parts[1];
    const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([filePath]);
    if (error) console.error('Failed to delete photo:', error);
  }, []);

  return {
    stories,
    loading,
    error,
    fetchStories,
    fetchPublishedStories,
    fetchFeaturedStories,
    getStoryBySlug,
    createStory,
    updateStory,
    deleteStory,
    uploadStoryPhoto,
    deleteStoryPhoto,
  };
}
