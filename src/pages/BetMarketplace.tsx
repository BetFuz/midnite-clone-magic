import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, TrendingUp, Clock, Package } from "lucide-react";
import { useBetMarketplace } from "@/hooks/useBetMarketplace";
import ListingCard from "@/components/marketplace/ListingCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/currency";

const BetMarketplace = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [currentUserId, setCurrentUserId] = useState<string>();
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  
  const {
    listings,
    myListings,
    isLoading,
    buyBet,
    cancelListing,
  } = useBetMarketplace();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    loadUser();
  }, []);

  const handleBuyClick = (listing: any) => {
    setSelectedListing(listing);
    setShowBuyDialog(true);
  };

  const confirmPurchase = async () => {
    if (selectedListing) {
      await buyBet(selectedListing.id, selectedListing.asking_price);
      setShowBuyDialog(false);
      setSelectedListing(null);
    }
  };

  const sortedListings = [...listings].sort((a, b) => {
    // Sort by best value (highest ROI)
    const roiA = ((a.potential_win - a.asking_price) / a.asking_price) * 100;
    const roiB = ((b.potential_win - b.asking_price) / b.asking_price) * 100;
    return roiB - roiA;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Bet Trading Marketplace</h1>
              <p className="text-muted-foreground">
                Buy and sell active bet slips. Trade your way to profit.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="browse" className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Browse ({listings.length})
                </TabsTrigger>
                <TabsTrigger value="trending" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Best Value
                </TabsTrigger>
                <TabsTrigger value="mylistings" className="gap-2">
                  <Package className="h-4 w-4" />
                  My Listings ({myListings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="browse">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="bg-card rounded-lg p-6 animate-pulse">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 bg-muted rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                            <div className="h-3 bg-muted rounded w-1/3"></div>
                          </div>
                        </div>
                        <div className="h-32 bg-muted rounded mb-4"></div>
                        <div className="h-10 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                    <p className="text-muted-foreground">
                      Check back soon for available bets to purchase
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {listings.map(listing => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        onBuy={() => handleBuyClick(listing)}
                        isOwnListing={listing.seller_id === currentUserId}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-card rounded-lg p-6 animate-pulse h-64"></div>
                    ))}
                  </div>
                ) : sortedListings.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No trending bets</h3>
                    <p className="text-muted-foreground">
                      Be the first to list a bet!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedListings.slice(0, 9).map(listing => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        onBuy={() => handleBuyClick(listing)}
                        isOwnListing={listing.seller_id === currentUserId}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mylistings">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2].map(i => (
                      <div key={i} className="bg-card rounded-lg p-6 animate-pulse h-64"></div>
                    ))}
                  </div>
                ) : myListings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No active listings</h3>
                    <p className="text-muted-foreground">
                      List your pending bets to start trading
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myListings.map(listing => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        onBuy={() => {}}
                        onCancel={() => cancelListing(listing.id)}
                        isOwnListing={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Buy Confirmation Dialog */}
      <AlertDialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedListing && (
                <div className="space-y-4 mt-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">You Pay</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(selectedListing.asking_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Potential Win</p>
                        <p className="text-2xl font-bold text-green-500">
                          {formatCurrency(selectedListing.potential_win)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm">
                    The bet will be transferred to your account immediately. This action cannot be undone.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPurchase}>
              Confirm Purchase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BetMarketplace;