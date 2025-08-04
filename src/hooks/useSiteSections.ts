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
          .select('*');

        if (error) throw error;

        if (data) {
          const sectionsMap = data.reduce((acc, section) => {
            acc[section.section_key] = section;
            return acc;
          }, {} as Record<string, SiteSection>);
          setSections(sectionsMap);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  return { sections, loading, error };
}