import { Trophy, Target, TrendingUp, Timer, Activity, Award } from "lucide-react";

export interface MarketOption {
  label: string;
  odds: number;
  hot?: boolean;
}

export interface Market {
  title: string;
  icon: any;
  options: MarketOption[];
}

export interface SportMarkets {
  [key: string]: Market;
}

export const getSportMarkets = (sport: string, homeTeam: string, awayTeam: string): SportMarkets => {
  const lowerSport = sport?.toLowerCase() || "football";

  // Basketball markets
  if (lowerSport.includes("basketball") || lowerSport.includes("nba") || lowerSport.includes("wnba")) {
    return {
      points: {
        title: "Total Points",
        icon: Trophy,
        options: [
          { label: "Over 220.5 Points", odds: 1.90, hot: true },
          { label: "Under 220.5 Points", odds: 1.90 },
          { label: "Over 115.5 1H Points", odds: 1.85 },
          { label: "Under 115.5 1H Points", odds: 1.95 },
        ],
      },
      quarters: {
        title: "Quarter Markets",
        icon: Timer,
        options: [
          { label: `${homeTeam} Win Q1`, odds: 1.85 },
          { label: `${awayTeam} Win Q1`, odds: 2.00 },
          { label: `${homeTeam} Win Q4`, odds: 1.90, hot: true },
          { label: `${awayTeam} Win Q4`, odds: 1.95 },
        ],
      },
      spreads: {
        title: "Point Spread",
        icon: TrendingUp,
        options: [
          { label: `${homeTeam} -5.5`, odds: 1.90 },
          { label: `${awayTeam} +5.5`, odds: 1.90 },
          { label: `${homeTeam} -8.5`, odds: 2.10 },
          { label: `${awayTeam} +8.5`, odds: 1.75 },
        ],
      },
      playerProps: {
        title: "Player Props",
        icon: Award,
        options: [
          { label: "Top Scorer Over 28.5", odds: 1.85 },
          { label: "Top Scorer Under 28.5", odds: 1.95 },
          { label: "Double-Double Yes", odds: 2.20, hot: true },
          { label: "Triple-Double Yes", odds: 6.50 },
        ],
      },
    };
  }

  // American Football / NFL markets
  if (lowerSport.includes("american football") || lowerSport.includes("nfl")) {
    return {
      points: {
        title: "Total Points",
        icon: Trophy,
        options: [
          { label: "Over 47.5 Points", odds: 1.90, hot: true },
          { label: "Under 47.5 Points", odds: 1.90 },
          { label: "Over 24.5 1H Points", odds: 1.85 },
          { label: "Under 24.5 1H Points", odds: 1.95 },
        ],
      },
      touchdowns: {
        title: "Touchdown Markets",
        icon: Target,
        options: [
          { label: "Over 5.5 Touchdowns", odds: 1.85 },
          { label: "Under 5.5 Touchdowns", odds: 1.95 },
          { label: "First TD Home", odds: 1.90, hot: true },
          { label: "First TD Away", odds: 1.95 },
        ],
      },
      spreads: {
        title: "Point Spread",
        icon: TrendingUp,
        options: [
          { label: `${homeTeam} -3.5`, odds: 1.90 },
          { label: `${awayTeam} +3.5`, odds: 1.90 },
          { label: `${homeTeam} -7.5`, odds: 2.10 },
          { label: `${awayTeam} +7.5`, odds: 1.75 },
        ],
      },
      quarters: {
        title: "Quarter Markets",
        icon: Timer,
        options: [
          { label: `${homeTeam} Win Q1`, odds: 1.95 },
          { label: `${awayTeam} Win Q1`, odds: 1.95 },
          { label: `${homeTeam} Win Q4`, odds: 1.90 },
          { label: `${awayTeam} Win Q4`, odds: 2.00 },
        ],
      },
    };
  }

  // Tennis markets
  if (lowerSport.includes("tennis")) {
    return {
      sets: {
        title: "Set Markets",
        icon: Trophy,
        options: [
          { label: `${homeTeam} 2-0`, odds: 2.40, hot: true },
          { label: `${awayTeam} 2-0`, odds: 3.20 },
          { label: `${homeTeam} 2-1`, odds: 3.50 },
          { label: `${awayTeam} 2-1`, odds: 4.00 },
        ],
      },
      games: {
        title: "Total Games",
        icon: Target,
        options: [
          { label: "Over 22.5 Games", odds: 1.85 },
          { label: "Under 22.5 Games", odds: 1.95 },
          { label: "Over 39.5 Games", odds: 2.10, hot: true },
          { label: "Under 39.5 Games", odds: 1.75 },
        ],
      },
      tiebreak: {
        title: "Tiebreak",
        icon: Activity,
        options: [
          { label: "Tiebreak in Match Yes", odds: 2.20 },
          { label: "Tiebreak in Match No", odds: 1.65 },
          { label: "Tiebreak in Set 1 Yes", odds: 3.50 },
          { label: "Tiebreak in Set 1 No", odds: 1.28 },
        ],
      },
      firstSet: {
        title: "First Set Winner",
        icon: TrendingUp,
        options: [
          { label: `${homeTeam}`, odds: 1.75, hot: true },
          { label: `${awayTeam}`, odds: 2.10 },
        ],
      },
    };
  }

  // Default to Soccer/Football markets
  return {
    goals: {
      title: "Goals Markets",
      icon: Trophy,
      options: [
        { label: "Over 2.5 Goals", odds: 1.85, hot: true },
        { label: "Under 2.5 Goals", odds: 1.95 },
        { label: "Both Teams to Score", odds: 1.70, hot: true },
        { label: "No Goal", odds: 8.50 },
      ],
    },
    nextGoal: {
      title: "Next Goal",
      icon: Target,
      options: [
        { label: `${homeTeam}`, odds: 1.65 },
        { label: `${awayTeam}`, odds: 2.40 },
        { label: "No More Goals", odds: 4.20 },
      ],
    },
    halftime: {
      title: "Halftime/Fulltime",
      icon: TrendingUp,
      options: [
        { label: `${homeTeam}/${homeTeam}`, odds: 2.10 },
        { label: `${homeTeam}/Draw`, odds: 8.50 },
        { label: `${awayTeam}/${awayTeam}`, odds: 4.50 },
        { label: "Draw/Draw", odds: 5.20 },
      ],
    },
    corners: {
      title: "Corners",
      icon: Target,
      options: [
        { label: "Over 9.5 Corners", odds: 1.90 },
        { label: "Under 9.5 Corners", odds: 1.90 },
        { label: "Next Corner Home", odds: 1.80 },
        { label: "Next Corner Away", odds: 2.00 },
      ],
    },
  };
};
