import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { PromoBannerCarousel } from "@/components/home/PromoBannerCarousel";
import { SportsQuickNav } from "@/components/home/SportsQuickNav";
import { LiveScoreTicker } from "@/components/home/LiveScoreTicker";
import { LiveMatchesBanner } from "@/components/home/LiveMatchesBanner";
import { TodaysMatches } from "@/components/home/TodaysMatches";
import { JackpotBanner } from "@/components/home/JackpotBanner";
import { PopularLeaguesBar } from "@/components/home/PopularLeaguesBar";
import { CasinoPreview } from "@/components/home/CasinoPreview";
import { OddsBoostsSection } from "@/components/home/OddsBoostsSection";
import { PromoStripBanner } from "@/components/home/PromoStripBanner";
import PopularBetsWidget from "@/components/PopularBetsWidget";
import QuickBetBuilder from "@/components/QuickBetBuilder";
import PersonalizedSuggestions from "@/components/PersonalizedSuggestions";
import FlashOdds from "@/components/FlashOdds";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="flex">
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
        {/* ── Live Score Ticker ── */}
        <div className="px-4 md:px-6 pt-3">
          <LiveScoreTicker />
        </div>

        <div className="px-4 md:px-6 space-y-0">
          {/* ── Sports Quick Nav ── */}
          <SportsQuickNav />

          {/* ── Hero Promo Carousel ── */}
          <PromoBannerCarousel />

          {/* ── Promo Strip ── */}
          <PromoStripBanner />

          {/* ── FuzJackpot Banner ── */}
          <JackpotBanner />

          {/* ── Live Matches ── */}
          <LiveMatchesBanner />

          {/* ── Flash Odds ── */}
          <FlashOdds />

          {/* ── Today's / Upcoming Matches (grouped by league) ── */}
          <TodaysMatches />

          {/* ── Popular Leagues with live match counts ── */}
          <PopularLeaguesBar />

          {/* ── AI Bet Recommendations ── */}
          <div className="mb-4">
            <h2 className="text-base font-bold mb-3">🤖 AI Bet Picks</h2>
            <PersonalizedSuggestions />
          </div>

          {/* ── Odds Boosts ── */}
          <OddsBoostsSection />

          {/* ── Popular / Trending Bets ── */}
          <div className="mb-4">
            <h2 className="text-base font-bold mb-3">🔥 Trending Bets</h2>
            <PopularBetsWidget />
          </div>

          {/* ── Casino + Virtual Sports Preview ── */}
          <CasinoPreview />

          {/* ── Quick Bet Builder ── */}
          <div className="mb-4">
            <h2 className="text-base font-bold mb-3">⚡ Quick Bet Builder</h2>
            <QuickBetBuilder />
          </div>
        </div>
      </main>

      <BetSlip className="hidden md:flex" />
    </div>
  </div>
);

export default Index;
