import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ── Photo imports ─────────────────────────────────────────── */
import imgNba from "@/assets/promos/nba-promo.jpg";
import imgWcHero from "@/assets/promos/world-cup-hero.jpg";
import imgWcAfrica from "@/assets/promos/world-cup-african-teams.jpg";
import imgWcGroups from "@/assets/promos/world-cup-groups.jpg";
import imgWcCities from "@/assets/promos/world-cup-cities.jpg";
import imgWcStadiums from "@/assets/promos/world-cup-stadiums.jpg";
import imgWcLegends from "@/assets/promos/world-cup-legends.jpg";
import imgWcBetting from "@/assets/promos/world-cup-betting.jpg";
import imgWcFinal from "@/assets/promos/world-cup-final.jpg";
import imgUcl from "@/assets/promos/champions-league-promo.jpg";
import imgPl from "@/assets/promos/premier-league-boost.jpg";
import imgLaLiga from "@/assets/promos/la-liga-specials.jpg";
import imgAfconHero from "@/assets/promos/afcon-hero.jpg";
import imgAfconFavs from "@/assets/promos/afcon-favorites.jpg";
import imgAfconNigeria from "@/assets/promos/afcon-nigeria-host.jpg";
import imgAfconFinal from "@/assets/promos/afcon-final.jpg";
import imgAfconBoot from "@/assets/promos/afcon-golden-boot.jpg";
import imgBetBuilder from "@/assets/promos/bet-builder-promo.jpg";
import imgWelcome from "@/assets/promos/welcome-bonus-promo.jpg";

/* ── Sport icon imports (used as gradient-slide watermarks) ── */
import iconBasketball from "@/assets/sports/basketball-ball.png";
import iconFootball from "@/assets/sports/football-ball.png";
import iconMotor from "@/assets/sports/motorsports-helmet.png";
import iconCricket from "@/assets/sports/cricket-ball.png";
import iconTennis from "@/assets/sports/tennis-ball.png";
import iconAmerican from "@/assets/sports/american-football-ball.png";
import iconRugby from "@/assets/sports/rugby-ball.png";

/* ── Types ─────────────────────────────────────────────────── */
interface Slide {
  /* background — either a real photo OR a CSS gradient class */
  img?: string;
  bg?: string;
  sportIcon?: string;
  badge: string;
  badgeColor: string;
  live?: boolean;
  hot?: boolean;
  title: string;
  subtitle: string;
  cta: string;
  url: string;
  /* gradient used for the CTA button */
  accent: string;
}

/* ── Slide data — live events first, then upcoming ──────────── */
const SLIDES: Slide[] = [

  /* ── NBA FINALS (7 slides — user's priority) ── */
  {
    img: imgNba,
    badge: "🏀 NBA FINALS",
    badgeColor: "bg-orange-500 text-white",
    live: true,
    title: "NBA Finals — Live Now",
    subtitle: "OKC Thunder vs Boston Celtics · Game 3 · In-play betting open",
    cta: "Bet Live",
    url: "/basketball/nba",
    accent: "from-orange-500 to-red-600",
  },
  {
    bg: "bg-gradient-to-br from-[#002D62] via-[#003F88] to-[#00264D]",
    sportIcon: iconBasketball,
    badge: "⚡ OKC THUNDER",
    badgeColor: "bg-[#EF6C00] text-white",
    live: true,
    title: "OKC Thunder — Series Favourites",
    subtitle: "Shai Gilgeous-Alexander leads all scorers · Bet OKC to win it all",
    cta: "Thunder Bets",
    url: "/basketball/nba",
    accent: "from-[#EF6C00] to-orange-700",
  },
  {
    bg: "bg-gradient-to-br from-[#006532] via-[#007A33] to-[#004D22]",
    sportIcon: iconBasketball,
    badge: "☘️ BOSTON CELTICS",
    badgeColor: "bg-[#BA9653] text-black",
    live: true,
    title: "Celtics Fight Back",
    subtitle: "Jayson Tatum hunting Finals MVP · Bet Celtics to level the series",
    cta: "Celtics Bets",
    url: "/basketball/nba",
    accent: "from-[#006532] to-emerald-700",
  },
  {
    bg: "bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    sportIcon: iconBasketball,
    badge: "🏅 FINALS MVP ODDS",
    badgeColor: "bg-yellow-500 text-black",
    hot: true,
    title: "Who Wins Finals MVP?",
    subtitle: "SGA 1.85 · Tatum 2.40 · Brown 8.00 · Holmgren 12.00",
    cta: "MVP Market",
    url: "/basketball/nba",
    accent: "from-yellow-500 to-orange-500",
  },
  {
    bg: "bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e]",
    sportIcon: iconBasketball,
    badge: "📊 SERIES ODDS",
    badgeColor: "bg-purple-600 text-white",
    hot: true,
    title: "NBA Finals Series Winner",
    subtitle: "OKC 1.55 · Celtics 2.45 · Bet the series — best odds guaranteed",
    cta: "Series Bet",
    url: "/basketball/nba",
    accent: "from-purple-600 to-violet-700",
  },
  {
    bg: "bg-gradient-to-br from-[#1c1c3a] via-[#2d1b69] to-[#11001c]",
    sportIcon: iconBasketball,
    badge: "🔥 PLAYER PROPS",
    badgeColor: "bg-rose-600 text-white",
    hot: true,
    title: "SGA 35+ Points Tonight",
    subtitle: "Shai averaging 34.7 in the Finals · Player points over/under markets",
    cta: "Player Props",
    url: "/basketball/nba",
    accent: "from-rose-500 to-pink-600",
  },
  {
    bg: "bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#1a2035]",
    sportIcon: iconBasketball,
    badge: "⚡ IN-PLAY",
    badgeColor: "bg-red-600 text-white",
    live: true,
    title: "Live Quarter Betting",
    subtitle: "Bet on every quarter · Next team to score · Live spread updates",
    cta: "Live Bet",
    url: "/basketball/nba",
    accent: "from-red-600 to-orange-600",
  },

  /* ── WORLD CUP 2026 (8 slides) ── */
  {
    img: imgWcHero,
    badge: "⚽ FIFA WORLD CUP 2026",
    badgeColor: "bg-yellow-500 text-black",
    hot: true,
    title: "The World Cup Is Here",
    subtitle: "48 teams · USA · Mexico · Canada — best odds guaranteed",
    cta: "Bet World Cup",
    url: "/football/world-cup",
    accent: "from-yellow-400 to-orange-500",
  },
  {
    img: imgWcAfrica,
    badge: "🌍 AFRICA SPECIALS",
    badgeColor: "bg-green-600 text-white",
    title: "Back Your African Team",
    subtitle: "Nigeria 12.00 · Morocco 8.00 · Senegal 14.00 · Egypt 18.00",
    cta: "Africa Bets",
    url: "/football/world-cup",
    accent: "from-green-500 to-emerald-600",
  },
  {
    img: imgWcGroups,
    badge: "📋 GROUP STAGE",
    badgeColor: "bg-blue-600 text-white",
    title: "Group Stage Draw",
    subtitle: "12 groups · 48 teams · Every match has odds — bet the groups now",
    cta: "Group Bets",
    url: "/football/world-cup",
    accent: "from-blue-500 to-indigo-600",
  },
  {
    img: imgWcCities,
    badge: "🏙️ HOST CITIES",
    badgeColor: "bg-cyan-600 text-white",
    title: "11 Host Cities Across 3 Nations",
    subtitle: "New York · LA · Mexico City · Miami · Toronto — explore stadiums",
    cta: "Explore",
    url: "/football/world-cup",
    accent: "from-cyan-500 to-blue-600",
  },
  {
    img: imgWcLegends,
    badge: "🐐 GOAT DEBATE",
    badgeColor: "bg-amber-500 text-black",
    title: "The Last Dance?",
    subtitle: "Mbappe · Vinicius · Bellingham · Pedri — who takes the Golden Ball?",
    cta: "Golden Ball",
    url: "/football/world-cup",
    accent: "from-amber-500 to-yellow-600",
  },
  {
    img: imgWcStadiums,
    badge: "🏟️ STADIUMS",
    badgeColor: "bg-slate-600 text-white",
    title: "Iconic Stadiums Await",
    subtitle: "Azteca · MetLife · AT&T Stadium — pick your match, place your bet",
    cta: "Match Odds",
    url: "/football/world-cup",
    accent: "from-slate-500 to-gray-600",
  },
  {
    img: imgWcBetting,
    badge: "💰 BEST ODDS",
    badgeColor: "bg-emerald-500 text-white",
    title: "World Cup Betting Guide",
    subtitle: "Market tips · Value picks · Accumulator guide — get the edge",
    cta: "View Guide",
    url: "/football/world-cup",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    img: imgWcFinal,
    badge: "🏆 THE FINAL",
    badgeColor: "bg-yellow-600 text-black",
    title: "World Cup Final — Jul 19, 2026",
    subtitle: "France 3.50 · England 5.00 · Brazil 4.00 · Germany 6.00",
    cta: "Outright Bets",
    url: "/football/world-cup",
    accent: "from-yellow-400 to-amber-600",
  },

  /* ── CHAMPIONS LEAGUE (3 slides) ── */
  {
    img: imgUcl,
    badge: "🏆 UCL SEMI-FINAL",
    badgeColor: "bg-blue-700 text-white",
    live: true,
    title: "Champions League Semi-Finals",
    subtitle: "PSG vs Arsenal · Real Madrid vs Bayern — live odds now",
    cta: "Bet UCL",
    url: "/football/champions-league",
    accent: "from-blue-600 to-indigo-700",
  },
  {
    bg: "bg-gradient-to-br from-[#071d3f] via-[#0a2d6b] to-[#050f26]",
    sportIcon: iconFootball,
    badge: "🥇 UCL FINAL OUTRIGHT",
    badgeColor: "bg-yellow-500 text-black",
    hot: true,
    title: "Who Lifts the Trophy?",
    subtitle: "PSG 2.80 · Real Madrid 3.20 · Arsenal 4.50 · Bayern 5.50",
    cta: "UCL Outright",
    url: "/football/champions-league",
    accent: "from-yellow-500 to-amber-600",
  },

  /* ── PREMIER LEAGUE (2 slides) ── */
  {
    img: imgPl,
    badge: "⚡ ODDS BOOST",
    badgeColor: "bg-purple-600 text-white",
    hot: true,
    title: "Premier League Odds Boost",
    subtitle: "Enhanced odds every match day — Liverpool · Arsenal · City",
    cta: "See Boosts",
    url: "/football/premier-league",
    accent: "from-purple-600 to-violet-700",
  },
  {
    bg: "bg-gradient-to-r from-[#38003c] via-[#560059] to-[#38003c]",
    sportIcon: iconFootball,
    badge: "🏅 TITLE RACE",
    badgeColor: "bg-white text-[#38003c]",
    hot: true,
    title: "Premier League Title Decider",
    subtitle: "Liverpool 1.25 · Arsenal 4.00 · Man City 9.00 — final stretch",
    cta: "Title Bet",
    url: "/football/premier-league",
    accent: "from-[#38003c] to-purple-800",
  },

  /* ── LA LIGA (2 slides) ── */
  {
    img: imgLaLiga,
    badge: "🇪🇸 LA LIGA",
    badgeColor: "bg-red-600 text-white",
    title: "La Liga Final Stretch",
    subtitle: "Real Madrid vs Barcelona title fight — El Clásico odds",
    cta: "La Liga Bets",
    url: "/football/la-liga",
    accent: "from-red-500 to-rose-600",
  },

  /* ── AFCON (4 slides) ── */
  {
    img: imgAfconHero,
    badge: "🌍 AFCON 2025",
    badgeColor: "bg-green-600 text-white",
    title: "Africa Cup of Nations",
    subtitle: "The continent's biggest tournament — place your bets now",
    cta: "AFCON Bets",
    url: "/football",
    accent: "from-green-600 to-emerald-700",
  },
  {
    img: imgAfconFavs,
    badge: "📊 FAVOURITES",
    badgeColor: "bg-yellow-500 text-black",
    title: "AFCON Tournament Favourites",
    subtitle: "Nigeria 3.50 · Morocco 4.00 · Senegal 4.50 · Egypt 6.00",
    cta: "Outright",
    url: "/football",
    accent: "from-yellow-500 to-orange-600",
  },
  {
    img: imgAfconNigeria,
    badge: "🦅 SUPER EAGLES",
    badgeColor: "bg-green-700 text-white",
    title: "Nigeria — Eagles Fly High",
    subtitle: "Back the Super Eagles for AFCON glory — big value odds",
    cta: "Bet Nigeria",
    url: "/football",
    accent: "from-green-600 to-green-800",
  },
  {
    img: imgAfconBoot,
    badge: "👟 GOLDEN BOOT",
    badgeColor: "bg-amber-500 text-black",
    title: "AFCON Top Scorer Market",
    subtitle: "Who claims the golden boot? Osimhen 2.80 · Ziyech 4.50",
    cta: "Top Scorer",
    url: "/football",
    accent: "from-amber-500 to-yellow-600",
  },

  /* ── F1 (2 slides) ── */
  {
    bg: "bg-gradient-to-br from-[#e10600] via-[#b00000] to-[#1a0000]",
    sportIcon: iconMotor,
    badge: "🏎️ FORMULA 1",
    badgeColor: "bg-white text-red-600",
    hot: true,
    title: "F1 Miami Grand Prix",
    subtitle: "Verstappen 1.80 · Norris 2.90 · Hamilton 6.00 · Russell 8.00",
    cta: "F1 Bets",
    url: "/racing",
    accent: "from-red-600 to-rose-700",
  },
  {
    bg: "bg-gradient-to-r from-[#e10600] via-[#ff8c00] to-[#1a0000]",
    sportIcon: iconMotor,
    badge: "🥇 F1 CHAMPIONSHIP",
    badgeColor: "bg-white text-red-700",
    title: "Drivers' Championship Outright",
    subtitle: "Verstappen 1.40 · Norris 3.50 · Leclerc 9.00 — bet the season",
    cta: "Championship",
    url: "/racing",
    accent: "from-red-600 to-orange-600",
  },

  /* ── IPL CRICKET (2 slides) ── */
  {
    bg: "bg-gradient-to-br from-[#0f4c82] via-[#1a6fb5] to-[#002a5c]",
    sportIcon: iconCricket,
    badge: "🏏 IPL 2026",
    badgeColor: "bg-blue-500 text-white",
    live: true,
    title: "IPL — Live Match Betting",
    subtitle: "CSK vs MI · RCB vs KKR — live in-play odds every ball",
    cta: "IPL Live",
    url: "/cricket",
    accent: "from-blue-600 to-sky-700",
  },
  {
    bg: "bg-gradient-to-br from-[#ffd700] via-[#ff8c00] to-[#8b4513]",
    sportIcon: iconCricket,
    badge: "🏆 IPL WINNER",
    badgeColor: "bg-white text-orange-700",
    title: "Who Wins IPL 2026?",
    subtitle: "CSK 4.00 · MI 4.50 · RCB 5.00 · DC 7.00 — outright bets",
    cta: "IPL Winner",
    url: "/cricket",
    accent: "from-orange-500 to-amber-600",
  },

  /* ── TENNIS (1 slide) ── */
  {
    bg: "bg-gradient-to-br from-[#8B6914] via-[#c19a2e] to-[#5a3e00]",
    sportIcon: iconTennis,
    badge: "🎾 ROLAND GARROS",
    badgeColor: "bg-orange-600 text-white",
    hot: true,
    title: "French Open — Clay Court Kings",
    subtitle: "Sinner 2.20 · Alcaraz 2.50 · Djokovic 4.50 — who takes the title?",
    cta: "Tennis Bets",
    url: "/tennis",
    accent: "from-orange-600 to-yellow-700",
  },

  /* ── NFL / NFL DRAFT (1 slide) ── */
  {
    bg: "bg-gradient-to-br from-[#013369] via-[#001f4d] to-[#d50a0a]",
    sportIcon: iconAmerican,
    badge: "🏈 NFL DRAFT",
    badgeColor: "bg-red-600 text-white",
    hot: true,
    title: "NFL Draft Special Markets",
    subtitle: "First overall pick · Team draft grades · Season outrights now live",
    cta: "NFL Bets",
    url: "/american-football",
    accent: "from-blue-700 to-red-700",
  },

  /* ── BET BUILDER & BONUS ── */
  {
    img: imgBetBuilder,
    badge: "🎯 BET BUILDER",
    badgeColor: "bg-cyan-600 text-white",
    title: "Build Your Own Bet",
    subtitle: "Combine markets across all sports — massive potential returns",
    cta: "Build Now",
    url: "/sports/football",
    accent: "from-cyan-500 to-blue-600",
  },
  {
    img: imgWelcome,
    badge: "🎁 NEW MEMBERS",
    badgeColor: "bg-emerald-500 text-white",
    title: "300% Welcome Bonus",
    subtitle: "Deposit ₦1,000 · Bet with ₦4,000 · No wagering on first bet",
    cta: "Claim Bonus",
    url: "/auth",
    accent: "from-emerald-500 to-green-600",
  },
];

/* ─────────────────────────────────────────────────────────── */
const INTERVAL = 4500;

export const PromoBannerCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    setProgress(0);
  }, []);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  /* Progress bar */
  useEffect(() => {
    if (paused) { if (progressRef.current) clearInterval(progressRef.current); return; }
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progressRef.current!); return 100; }
        return p + (100 / (INTERVAL / 60));
      });
    }, 60);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [current, paused]);

  /* Auto-advance */
  useEffect(() => {
    if (paused) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => next(), INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused]);

  const slide = SLIDES[current];

  return (
    <div
      className="relative overflow-hidden rounded-2xl mb-4 select-none"
      style={{ height: "clamp(185px, 30vw, 380px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* ── Backgrounds (cross-fade) ── */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          {s.img ? (
            <>
              <img
                src={s.img}
                alt=""
                className="w-full h-full object-cover"
                loading={i < 3 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            </>
          ) : (
            <div className={`w-full h-full ${s.bg}`}>
              {/* Overlays for gradient slides */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* Sport icon watermark */}
              {s.sportIcon && (
                <img
                  src={s.sportIcon}
                  alt=""
                  className="absolute right-4 md:right-14 top-1/2 -translate-y-1/2 pointer-events-none select-none"
                  style={{ height: "clamp(80px, 14vw, 180px)", opacity: 0.12, filter: "brightness(2)" }}
                />
              )}
            </div>
          )}
        </div>
      ))}

      {/* ── Slide content ── */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-8">
        {/* Badge row */}
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          {slide.live && (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          )}
          {slide.hot && !slide.live && (
            <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
              🔥 HOT
            </span>
          )}
          <span className={`text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full tracking-wide ${slide.badgeColor}`}>
            {slide.badge}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-2xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-lg max-w-lg">
          {slide.title}
        </h2>

        {/* Subtitle */}
        <p className="text-[11px] sm:text-sm md:text-base text-white/80 mt-1 md:mt-2 max-w-xs sm:max-w-sm md:max-w-md leading-snug">
          {slide.subtitle}
        </p>

        {/* CTA + counter */}
        <div className="flex items-center gap-3 mt-2.5 md:mt-4">
          <Link
            to={slide.url}
            className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${slide.accent} text-white text-[11px] md:text-sm font-bold px-3.5 md:px-5 py-2 md:py-2.5 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all`}
          >
            {slide.cta}
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
          </Link>
          <span className="text-white/40 text-[10px] font-mono tabular-nums hidden sm:block">
            {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ── Thumbnail strip — desktop right side ── */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden xl:flex flex-col gap-1 max-h-[90%] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            title={s.title}
            className={`relative w-11 h-7 rounded overflow-hidden border-2 flex-shrink-0 transition-all duration-200 ${
              i === current
                ? "border-white opacity-100 scale-110 shadow-lg"
                : "border-white/15 opacity-40 hover:opacity-70"
            }`}
          >
            {s.img ? (
              <img src={s.img} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full ${s.bg}`} />
            )}
            {s.live && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* ── Nav arrows ── */}
      <button
        onClick={e => { e.preventDefault(); prev(); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 md:w-9 md:h-9 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="w-3.5 h-3.5 md:w-5 md:h-5" />
      </button>
      <button
        onClick={e => { e.preventDefault(); next(); }}
        className="absolute right-2 xl:right-16 top-1/2 -translate-y-1/2 z-20 w-7 h-7 md:w-9 md:h-9 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="w-3.5 h-3.5 md:w-5 md:h-5" />
      </button>

      {/* ── Dot indicators — mobile/tablet ── */}
      <div className="absolute bottom-2.5 left-4 z-20 flex gap-1 xl:hidden overflow-hidden max-w-[60%]">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`flex-shrink-0 rounded-full transition-all duration-300 ${
              i === current
                ? "w-5 h-1.5 bg-white"
                : s.live
                ? "w-1.5 h-1.5 bg-red-400"
                : "w-1.5 h-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/10">
        <div
          className="h-full bg-white/50 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
