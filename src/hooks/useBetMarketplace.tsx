import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface BetListing {
  id: string;
  seller_id: string;
  bet_slip_id: string;
  asking_price: number;
  original_stake: number;
  potential_win: number;
  status: 'active' | 'sold' | 'cancelled';
  buyer_id?: string;
  sold_at?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
  bet_slips?: {
    total_odds: number;
    status: string;
  };
}

export const useBetMarketplace = () => {
  const [listings, setListings] = useState<BetListing[]>([]);
  const [myListings, setMyListings] = useState<BetListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMarketplace();
    loadMyListings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('marketplace-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bet_listings'
        },
        () => {
          loadMarketplace();
          loadMyListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMarketplace = async () => {
    try {
      const { data: listingsData, error } = await supabase
        .from('bet_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data
      const enriched = await Promise.all(
        (listingsData || []).map(async (listing) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', listing.seller_id)
            .single();

          const { data: betSlip } = await supabase
            .from('bet_slips')
            .select('total_odds, status')
            .eq('id', listing.bet_slip_id)
            .single();

          return {
            ...listing,
            profiles: profile || { full_name: '', email: '' },
            bet_slips: betSlip || { total_odds: 0, status: 'pending' }
          };
        })
      );

      setListings(enriched as BetListing[]);
    } catch (error: any) {
      console.error('Error loading marketplace:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyListings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: listingsData, error } = await supabase
        .from('bet_listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data
      const enriched = await Promise.all(
        (listingsData || []).map(async (listing) => {
          const { data: betSlip } = await supabase
            .from('bet_slips')
            .select('total_odds, status')
            .eq('id', listing.bet_slip_id)
            .single();

          return {
            ...listing,
            bet_slips: betSlip || { total_odds: 0, status: 'pending' }
          };
        })
      );

      setMyListings(enriched as BetListing[]);
    } catch (error) {
      console.error('Error loading my listings:', error);
    }
  };

  const listBetForSale = async (
    betSlipId: string,
    askingPrice: number,
    originalStake: number,
    potentialWin: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to list bets",
          variant: "destructive",
        });
        return false;
      }

      // Check if bet slip is already listed
      const { data: existing } = await supabase
        .from('bet_listings')
        .select('*')
        .eq('bet_slip_id', betSlipId)
        .eq('status', 'active')
        .single();

      if (existing) {
        toast({
          title: "Already Listed",
          description: "This bet is already listed for sale",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('bet_listings')
        .insert({
          seller_id: user.id,
          bet_slip_id: betSlipId,
          asking_price: askingPrice,
          original_stake: originalStake,
          potential_win: potentialWin,
          status: 'active',
        });

      if (error) throw error;

      toast({
        title: "Listed Successfully!",
        description: "Your bet is now available in the marketplace",
      });

      loadMarketplace();
      loadMyListings();
      return true;
    } catch (error: any) {
      console.error('Error listing bet:', error);
      toast({
        title: "Error",
        description: "Failed to list bet for sale",
        variant: "destructive",
      });
      return false;
    }
  };

  const buyBet = async (listingId: string, askingPrice: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to buy bets",
          variant: "destructive",
        });
        return false;
      }

      // Check user balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (!profile || parseFloat(profile.balance.toString()) < askingPrice) {
        toast({
          title: "Insufficient Balance",
          description: "Please deposit funds to buy this bet",
          variant: "destructive",
        });
        return false;
      }

      // Get listing details
      const { data: listing, error: listingError } = await supabase
        .from('bet_listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (listingError || !listing) throw listingError;

      // Update listing status
      const { error: updateError } = await supabase
        .from('bet_listings')
        .update({
          status: 'sold',
          buyer_id: user.id,
          sold_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      if (updateError) throw updateError;

      // Transfer bet ownership
      const { error: transferError } = await supabase
        .from('bet_slips')
        .update({ user_id: user.id })
        .eq('id', listing.bet_slip_id);

      if (transferError) throw transferError;

      // Deduct from buyer balance
      await supabase
        .from('profiles')
        .update({
          balance: parseFloat(profile.balance.toString()) - askingPrice
        })
        .eq('id', user.id);

      // Add to seller balance
      const { data: sellerProfile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', listing.seller_id)
        .single();

      if (sellerProfile) {
        await supabase
          .from('profiles')
          .update({
            balance: parseFloat(sellerProfile.balance.toString()) + askingPrice
          })
          .eq('id', listing.seller_id);
      }

      toast({
        title: "Purchase Complete!",
        description: "This bet is now yours. Check your bet slips.",
      });

      loadMarketplace();
      return true;
    } catch (error: any) {
      console.error('Error buying bet:', error);
      toast({
        title: "Error",
        description: "Failed to complete purchase",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('bet_listings')
        .update({ status: 'cancelled' })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "Listing Cancelled",
        description: "Your bet has been removed from the marketplace",
      });

      loadMarketplace();
      loadMyListings();
    } catch (error: any) {
      console.error('Error cancelling listing:', error);
      toast({
        title: "Error",
        description: "Failed to cancel listing",
        variant: "destructive",
      });
    }
  };

  const calculateRecommendedPrice = (
    originalStake: number,
    potentialWin: number,
    currentOdds: number
  ): number => {
    // Fair market value calculation
    // Price = Original Stake + (Potential Win - Original Stake) * (Current Odds Probability)
    const profit = potentialWin - originalStake;
    const probability = 1 / currentOdds;
    const fairValue = originalStake + (profit * probability);
    
    // Add 10% premium for seller
    return Math.round(fairValue * 1.1 * 100) / 100;
  };

  return {
    listings,
    myListings,
    isLoading,
    listBetForSale,
    buyBet,
    cancelListing,
    calculateRecommendedPrice,
    refreshMarketplace: loadMarketplace,
  };
};