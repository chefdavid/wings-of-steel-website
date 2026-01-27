import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Donation {
  id: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string | null;
  company_name: string | null;
  amount: number;
  donation_type: 'one-time' | 'recurring';
  player_name: string | null;
  is_anonymous: boolean;
  message: string | null;
  stripe_payment_intent_id: string;
  stripe_subscription_id: string | null;
  payment_status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  campaign_id: string | null;
  event_tag: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonationStatistics {
  total_donations: number;
  unique_donors: number;
  total_raised: number;
  average_donation: number;
  recurring_count: number;
  one_time_count: number;
  recurring_total: number;
  one_time_total: number;
  company_donations: number;
  player_honor_donations: number;
}

export function useDonations(filters?: {
  type?: 'one-time' | 'recurring' | 'all';
  status?: 'pending' | 'succeeded' | 'failed' | 'all';
  dateRange?: 'month' | 'year' | 'all';
  search?: string;
  eventTag?: string;
}) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [statistics, setStatistics] = useState<DonationStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDonations();
    fetchStatistics();

    // Set up real-time subscription
    const channel = supabase
      .channel('donations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'donations'
        },
        () => {
          fetchDonations();
          fetchStatistics();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [filters?.type, filters?.status, filters?.dateRange, filters?.search, filters?.eventTag]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('donation_type', filters.type);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('payment_status', filters.status);
      }

      if (filters?.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        if (filters.dateRange === 'month') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (filters.dateRange === 'year') {
          startDate = new Date(now.getFullYear(), 0, 1);
        } else {
          startDate = new Date(0); // All time
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      if (filters?.search) {
        query = query.or(`donor_name.ilike.%${filters.search}%,donor_email.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
      }

      if (filters?.eventTag) {
        query = query.ilike('event_tag', `${filters.eventTag}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setDonations(data || []);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('donation_statistics')
        .select('*')
        .single();

      if (fetchError) throw fetchError;

      setStatistics(data);
    } catch (err) {
      console.error('Error fetching donation statistics:', err);
      // Don't set error for statistics - it's not critical
    }
  };

  return {
    donations,
    statistics,
    loading,
    error,
    refetch: () => {
      fetchDonations();
      fetchStatistics();
    }
  };
}



