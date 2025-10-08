import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { GameHighlight, GamePhoto, KeyMoment, PlayerHighlight } from '../types/database';

export function useGameHighlights(gameId?: string) {
  const [highlights, setHighlights] = useState<GameHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHighlights = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('game_highlights').select('*');

      if (gameId) {
        query = query.eq('game_id', gameId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setHighlights(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  const getHighlightByGameId = useCallback(async (gameId: string): Promise<GameHighlight | null> => {
    try {
      const { data, error } = await supabase
        .from('game_highlights')
        .select('*')
        .eq('game_id', gameId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No highlights found for this game
          return null;
        }
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error fetching highlight:', err);
      return null;
    }
  }, []);

  const createHighlight = useCallback(async (
    gameId: string,
    data: Partial<Omit<GameHighlight, 'id' | 'game_id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const { data: newHighlight, error } = await supabase
        .from('game_highlights')
        .insert({
          game_id: gameId,
          title: data.title || '',
          summary: data.summary || '',
          final_score: data.final_score || '',
          key_moments: data.key_moments || [],
          player_highlights: data.player_highlights || [],
          photos: data.photos || [],
          video_url: data.video_url || '',
          is_published: data.is_published || false,
          created_by: data.created_by || '',
        })
        .select()
        .single();

      if (error) throw error;

      await fetchHighlights();
      return newHighlight;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create highlight');
      throw err;
    }
  }, [fetchHighlights]);

  const updateHighlight = useCallback(async (
    id: string,
    data: Partial<Omit<GameHighlight, 'id' | 'game_id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const { data: updatedHighlight, error } = await supabase
        .from('game_highlights')
        .update({
          title: data.title,
          summary: data.summary,
          final_score: data.final_score,
          key_moments: data.key_moments,
          player_highlights: data.player_highlights,
          photos: data.photos,
          video_url: data.video_url,
          is_published: data.is_published,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchHighlights();
      return updatedHighlight;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update highlight');
      throw err;
    }
  }, [fetchHighlights]);

  const deleteHighlight = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('game_highlights').delete().eq('id', id);

      if (error) throw error;

      await fetchHighlights();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete highlight');
      throw err;
    }
  }, [fetchHighlights]);

  const uploadPhoto = useCallback(async (file: File, gameId: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${gameId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('game-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('game-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
      throw err;
    }
  }, []);

  const deletePhoto = useCallback(async (photoUrl: string) => {
    try {
      // Extract the file path from the URL
      const urlParts = photoUrl.split('/game-photos/');
      if (urlParts.length < 2) throw new Error('Invalid photo URL');

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('game-photos')
        .remove([filePath]);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
      throw err;
    }
  }, []);

  return {
    highlights,
    loading,
    error,
    fetchHighlights,
    getHighlightByGameId,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    uploadPhoto,
    deletePhoto,
  };
}
