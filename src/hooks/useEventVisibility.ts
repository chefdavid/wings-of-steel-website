import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface EventVisibility {
  event_key: string;
  is_visible: boolean;
  is_featured?: boolean;
}

export function useEventVisibility() {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [featuredEventKey, setFeaturedEventKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('event_visibility')
          .select('event_key, is_visible, is_featured');

        if (fetchError) throw fetchError;

        if (data) {
          const visibilityMap = data.reduce((acc, item) => {
            acc[item.event_key] = item.is_visible;
            return acc;
          }, {} as Record<string, boolean>);
          setVisibility(visibilityMap);

          // Find the featured event (must also be visible)
          const featured = data.find(
            (item) => item.is_featured && item.is_visible
          );
          setFeaturedEventKey(featured?.event_key ?? null);
        }
      } catch (err) {
        console.error('Error fetching event visibility:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Default to visible if there's an error (fail open)
        setVisibility({
          'golf-outing': true,
        });
        setFeaturedEventKey(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVisibility();

    // Set up real-time subscription for updates
    const channel = supabase
      .channel('event_visibility_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_visibility'
        },
        (payload) => {
          console.log('📡 Event visibility updated:', payload);
          fetchVisibility();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const isEventVisible = (eventKey: string): boolean => {
    // Default to visible if not found (fail open)
    return visibility[eventKey] !== false;
  };

  return { visibility, loading, error, isEventVisible, featuredEventKey };
}
