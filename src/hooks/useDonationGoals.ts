import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface DonationGoal {
  id: string;
  goal_type: 'monthly' | 'annual' | 'campaign';
  goal_name: string;
  target_amount: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonationProgress {
  goal_id: string;
  goal_type: string;
  goal_name: string;
  target_amount: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  current_amount: number;
  percentage_complete: number;
  days_remaining: number | null;
}

export function useDonationGoals() {
  const [goals, setGoals] = useState<DonationGoal[]>([]);
  const [progress, setProgress] = useState<DonationProgress[]>([]);
  const [activeGoal, setActiveGoal] = useState<DonationProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
    fetchProgress();

    // Set up real-time subscription for goals
    const goalsChannel = supabase
      .channel('donation_goals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'donation_goals'
        },
        () => {
          fetchGoals();
          fetchProgress();
        }
      )
      .subscribe();

    // Set up real-time subscription for donations (affects progress)
    const donationsChannel = supabase
      .channel('donations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'donations'
        },
        () => {
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      goalsChannel.unsubscribe();
      donationsChannel.unsubscribe();
    };
  }, []);

  const fetchGoals = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('donation_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching donation goals:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchProgress = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('donation_progress')
        .select('*');

      if (fetchError) throw fetchError;

      const progressData = data || [];
      setProgress(progressData);

      // Set the most relevant active goal
      // Priority: campaign > monthly > annual
      const campaignGoal = progressData.find(g => g.goal_type === 'campaign' && g.is_active);
      const monthlyGoal = progressData.find(g => g.goal_type === 'monthly' && g.is_active);
      const annualGoal = progressData.find(g => g.goal_type === 'annual' && g.is_active);

      const mostRelevant = campaignGoal || monthlyGoal || annualGoal || null;
      setActiveGoal(mostRelevant);
    } catch (err) {
      console.error('Error fetching donation progress:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    goals,
    progress,
    activeGoal,
    loading,
    error,
    refetch: () => {
      fetchGoals();
      fetchProgress();
    }
  };
}

