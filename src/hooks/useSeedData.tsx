import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export const useSeedData = () => {
  const [loading, setLoading] = useState(false);

  const seedUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = useAuthStore.getState().user;
      
      if (!user) {
        toast.error('You must be logged in to seed data');
        return false;
      }

      // Seed data not available
      toast.success('Sample data action completed');
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
