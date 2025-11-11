import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PoolBet {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  sport: string;
  type: string;
  status: string;
  max_members: number;
  min_entry: number;
  total_stake: number;
  potential_win: number;
  total_odds: number;
  selections_count: number;
  closes_at: string;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

export const usePoolBetting = () => {
  const [pools, setPools] = useState<PoolBet[]>([]);
  const [myPools, setMyPools] = useState<PoolBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPools = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch all public pools
      const { data: poolsData, error: poolsError } = await supabase
        .from("pool_bets")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (poolsError) throw poolsError;

      // Fetch member counts and user membership
      const poolsWithCounts = await Promise.all(
        (poolsData || []).map(async (pool) => {
          const { count } = await supabase
            .from("pool_members")
            .select("*", { count: "exact", head: true })
            .eq("pool_id", pool.id);

          const isMember = user ? await supabase
            .from("pool_members")
            .select("id")
            .eq("pool_id", pool.id)
            .eq("user_id", user.id)
            .single() : null;

          return {
            ...pool,
            member_count: count || 0,
            is_member: !!isMember?.data
          };
        })
      );

      setPools(poolsWithCounts);

      // Fetch user's pools
      if (user) {
        const myPoolIds = poolsWithCounts
          .filter(p => p.is_member)
          .map(p => p.id);
        setMyPools(poolsWithCounts.filter(p => myPoolIds.includes(p.id)));
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading pools:", error);
      toast.error("Failed to load betting pools");
      setIsLoading(false);
    }
  };

  const joinPool = async (poolId: string, stakeAmount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to join a pool");
        return;
      }

      const { error } = await supabase.from("pool_members").insert({
        pool_id: poolId,
        user_id: user.id,
        stake_amount: stakeAmount
      });

      if (error) throw error;

      // Update pool total stake
      const pool = pools.find(p => p.id === poolId);
      if (pool) {
        const { error: updateError } = await supabase
          .from("pool_bets")
          .update({
            total_stake: pool.total_stake + stakeAmount,
            potential_win: (pool.total_stake + stakeAmount) * pool.total_odds
          })
          .eq("id", poolId);

        if (updateError) console.error("Error updating pool stake:", updateError);
      }

      toast.success("Successfully joined pool!");
      loadPools();
    } catch (error: any) {
      console.error("Error joining pool:", error);
      toast.error(error.message || "Failed to join pool");
    }
  };

  const createPool = async (poolData: {
    name: string;
    description?: string;
    sport: string;
    type?: string;
    max_members?: number;
    min_entry?: number;
    total_odds?: number;
    selections_count?: number;
    closes_at: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to create a pool");
        return;
      }

      const { error } = await supabase.from("pool_bets").insert({
        name: poolData.name,
        description: poolData.description,
        sport: poolData.sport,
        type: poolData.type || 'public',
        max_members: poolData.max_members || 100,
        min_entry: poolData.min_entry || 5000,
        total_odds: poolData.total_odds || 1.0,
        selections_count: poolData.selections_count || 0,
        closes_at: poolData.closes_at,
        creator_id: user.id
      });

      if (error) throw error;

      toast.success("Pool created successfully!");
      loadPools();
    } catch (error: any) {
      console.error("Error creating pool:", error);
      toast.error(error.message || "Failed to create pool");
    }
  };

  useEffect(() => {
    loadPools();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("pool_bets_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pool_bets" },
        () => loadPools()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    pools,
    myPools,
    isLoading,
    joinPool,
    createPool,
    refreshPools: loadPools
  };
};
