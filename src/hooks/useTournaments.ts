import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import type { Tournament } from '../types/database';

// Use admin client for admin operations (bypasses RLS)
const dbClient = supabaseAdmin || supabase;

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await dbClient
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const createTournament = useCallback(async (
    data: Partial<Omit<Tournament, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Tournament> => {
    try {
      const { data: newTournament, error } = await dbClient
        .from('tournaments')
        .insert({
          name: data.name || '',
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          location: data.location || null,
          description: data.description || null,
          season: data.season || null,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchTournaments();
      return newTournament;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tournament');
      throw err;
    }
  }, [fetchTournaments]);

  const updateTournament = useCallback(async (
    id: string,
    data: Partial<Omit<Tournament, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Tournament> => {
    try {
      const { data: updated, error } = await dbClient
        .from('tournaments')
        .update({
          name: data.name,
          start_date: data.start_date,
          end_date: data.end_date,
          location: data.location,
          description: data.description,
          season: data.season,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchTournaments();
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tournament');
      throw err;
    }
  }, [fetchTournaments]);

  const deleteTournament = useCallback(async (id: string) => {
    try {
      const { error } = await dbClient
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTournaments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tournament');
      throw err;
    }
  }, [fetchTournaments]);

  return {
    tournaments,
    loading,
    error,
    fetchTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
  };
}
