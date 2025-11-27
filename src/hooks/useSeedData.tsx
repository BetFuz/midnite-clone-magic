import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSeedData = () => {
  const [loading, setLoading] = useState(false);

  const seedUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to seed data');
        return false;
      }

      const { data, error } = await supabase.functions.invoke('seed-data', {
        body: { userId: user.id }
      });

      if (error) throw error;

      toast.success('Sample data seeded successfully', {
        description: `Created ${data.stats.betSlips} bet slips (${data.stats.pending} pending, ${data.stats.won} won, ${data.stats.lost} lost)`
      });
      
      return true;
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to seed data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    seedUserData
  };
};
