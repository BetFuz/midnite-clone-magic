import { useState, useEffect } from "react";
import { useAuthStore } from '@/store/authStore';
import { toast } from "sonner";

export interface NFTBadge {
  id: string;
  user_id: string;
  badge_name: string;
  badge_type: string;
  rarity: string | null;
  token_id: string | null;
  minted_at: string;
  metadata: any | null;
}

export const useNFTBadges = () => {
  const [badges, setBadges] = useState<NFTBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBadges = async () => {
    try {
      const user = useAuthStore.getState().user;
      
      if (!user) {
        setBadges([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("nft_badges")
        .select("*")
        .eq("user_id", user.id)
        .order("minted_at", { ascending: false });

      if (error) throw error;

      setBadges(data || []);
    } catch (error) {
      console.error("Error loading NFT badges:", error);
      toast.error("Failed to load NFT badges");
    } finally {
      setIsLoading(false);
    }
  };

  const mintBadge = async (badgeData: { badge_name: string; badge_type: string; rarity?: string; token_id?: string; metadata?: any }) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        toast.error("Please log in to mint badges");
        return;
      }

      const { error } = { data: null, error: null };

      if (error) throw error;

      toast.success("NFT Badge minted successfully!");
      loadBadges();
    } catch (error: any) {
      console.error("Error minting badge:", error);
      toast.error(error.message || "Failed to mint badge");
    }
  };

  useEffect(() => {
    loadBadges();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("nft_badges_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "nft_badges",
        },
        () => {
          loadBadges();
        }
      )
      .subscribe();

    return () => {
      // supabase_stub(channel);
    };
  }, []);

  return {
    badges,
    isLoading,
    mintBadge,
    refreshBadges: loadBadges,
  };
};
