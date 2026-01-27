import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { SiteSection } from '../types/database';

export function useSiteSections() {
  const [sections, setSections] = useState<Record<string, SiteSection>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('site_sections')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const sectionsMap = data.reduce((acc, section) => {
            acc[section.section_key] = section;
            return acc;
          }, {} as Record<string, SiteSection>);
          // Removed debug logs
          setSections(sectionsMap);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();

    // Set up real-time subscription for updates
    const channel = supabase
      .channel('site_sections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_sections'
        },
        (payload) => {
          console.log('📡 Site section updated:', payload);
          // Refetch all sections when any change occurs
          fetchSections();
        }
      )
      .subscribe();

    // Also refetch on window focus to catch any missed updates
    const handleFocus = () => {
      // Removed debug log
      fetchSections();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      channel.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return { sections, loading, error };
}