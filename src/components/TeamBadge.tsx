import { TEAM_LOGOS } from "@/utils/teamLogos";

/* ── Name normaliser ─────────────────────────────────────────
   APIs return official names like "Brighton & Hove Albion FC",
   "CA Osasuna", "Real Madrid CF", "Deportivo Alavés".
   We try multiple cleaned variants until one matches.         */
function findLogo(raw: string): string | undefined {
  if (TEAM_LOGOS[raw]) return TEAM_LOGOS[raw];

  // 1. Strip diacritics (é→e, ü→u, etc.)
  const noDia = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "");

  // 2. Strip common trailing suffixes
  const stripSuffix = (s: string) =>
    s.replace(
      /\s+(F\.?C\.?|A\.?F\.?C\.?|S\.?C\.?|A\.?C\.?|C\.?F\.?|B\.?C\.?|F\.?K\.?|R\.?F\.?C\.?|S\.?A\.?D\.?|Balompi[eé]|de F[uú]tbol|Futbol Club|Football Club|Soccer Club|Sportsclub)\.?$/i,
      ""
    ).trim();

  // 3. Strip common leading prefixes
  const stripPrefix = (s: string) =>
    s.replace(
      /^(F\.?C\.?|A\.?C\.?|A\.?S\.?|S\.?S\.?|R\.?C\.?D\.?|R\.?C\.?|S\.?D\.?|U\.?D\.?|C\.?A\.?|C\.?D\.?|C\.?F\.?|S\.?V\.?|T\.?S\.?V\.?|S\.?C\.?|B\.?S\.?C\.?|H\.?N\.?K\.?|N\.?K\.?|P\.?F\.?C\.?|G\.?F\.?C\.?)\s+/i,
      ""
    ).trim();

  const variants = new Set<string>();
  const add = (s: string) => { if (s && s !== raw) variants.add(s); };

  const s1 = stripSuffix(raw);   add(s1);
  const s2 = stripPrefix(raw);   add(s2);
  const s3 = stripPrefix(s1);    add(s3);
  const s4 = stripSuffix(s2);    add(s4);

  // also try without diacritics
  [raw, s1, s2, s3, s4].forEach(s => { add(noDia(s)); });

  // well-known manual overrides
  const OVERRIDES: Record<string, string> = {
    "Queens Park Rangers":    "QPR",
    "Queens Park Rangers FC": "QPR",
    "Brighton & Hove Albion FC": "Brighton & Hove Albion",
    "Deportivo Alaves":       "Alaves",
    "Deportivo Alavés":       "Alaves",
    "Real Betis Balompie":    "Real Betis",
    "Real Betis Balompié":    "Real Betis",
    "Atletico de Madrid":     "Atletico Madrid",
    "Club Atletico de Madrid":"Atletico Madrid",
    "Paris Saint-Germain FC": "Paris Saint-Germain",
    "Manchester City FC":     "Manchester City",
    "Manchester United FC":   "Manchester United",
    "Liverpool FC":           "Liverpool",
    "Chelsea FC":             "Chelsea",
    "Arsenal FC":             "Arsenal",
    "Tottenham Hotspur FC":   "Tottenham Hotspur",
    "West Ham United FC":     "West Ham United",
    "Wolverhampton Wanderers FC": "Wolverhampton",
    "Wolverhampton Wanderers":    "Wolverhampton",
    "Newcastle United FC":    "Newcastle United",
    "Aston Villa FC":         "Aston Villa",
    "Nottingham Forest FC":   "Nottingham Forest",
    "Everton FC":             "Everton",
    "Fulham FC":              "Fulham",
    "Crystal Palace FC":      "Crystal Palace",
    "AFC Bournemouth":        "Bournemouth",
    "Brentford FC":           "Brentford",
    "Leicester City FC":      "Leicester City",
    "Ipswich Town FC":        "Ipswich Town",
    "Southampton FC":         "Southampton",
    "Leeds United AFC":       "Leeds United",
    "Burnley FC":             "Burnley",
    "Sheffield United FC":    "Sheffield United",
    "Middlesbrough FC":       "Middlesbrough",
    "Coventry City FC":       "Coventry City",
    "Hull City AFC":          "Hull City",
    "Norwich City FC":        "Norwich City",
    "Millwall FC":            "Millwall",
    "West Bromwich Albion FC":"West Bromwich Albion",
    "Stoke City FC":          "Stoke City",
    "Blackburn Rovers FC":    "Blackburn Rovers",
    "Derby County FC":        "Derby County",
    "Luton Town FC":          "Luton Town",
    "Swansea City AFC":       "Swansea City",
    "Preston North End FC":   "Preston North End",
    "Portsmouth FC":          "Portsmouth",
    "Cardiff City FC":        "Cardiff City",
    "Plymouth Argyle FC":     "Plymouth Argyle",
    "Oxford United FC":       "Oxford United",
    "Wrexham AFC":            "Wrexham",
    "Sunderland AFC":         "Sunderland",
    "Valencia CF":            "Valencia",
    "Real Madrid CF":         "Real Madrid",
    "Girona FC":              "Girona",
    "Celta de Vigo":          "Celta Vigo",
    "Real Club Celta de Vigo":"Celta Vigo",
    "Rayo Vallecano de Madrid":"Rayo Vallecano",
    "RCD Mallorca":           "Mallorca",
    "RCD Espanyol":           "Espanyol",
    "RCD Espanyol de Barcelona":"Espanyol",
    "Getafe CF":              "Getafe",
    "UD Las Palmas":          "Las Palmas",
    "Deportivo Alavés":       "Alaves",
    "CA Osasuna":             "Osasuna",
    "Athletic Club":          "Athletic Club",
    "FC Barcelona":           "Barcelona",
    "Sevilla FC":             "Sevilla",
    "Real Betis":             "Real Betis",
    "FC Bayern München":      "Bayern Munich",
    "FC Bayern Munich":       "Bayern Munich",
    "Borussia Mönchengladbach": "Borussia Mönchengladbach",
    "VfB Stuttgart":          "Stuttgart",
    "SV Werder Bremen":       "Werder Bremen",
    "1. FC Union Berlin":     "Union Berlin",
    "1. FSV Mainz 05":        "Mainz",
    "1. FC Heidenheim 1846":  "Heidenheim",
    "VfL Wolfsburg":          "Wolfsburg",
    "VfL Bochum":             "Bochum",
    "SC Freiburg":            "Freiburg",
    "TSG 1899 Hoffenheim":    "Hoffenheim",
    "FC Augsburg":            "Augsburg",
    "Holstein Kiel":          "Holstein Kiel",
    "FC St. Pauli":           "St. Pauli",
    "Juventus FC":            "Juventus",
    "FC Internazionale Milano":"Inter Milan",
    "Inter Milan":            "Inter Milan",
    "AC Milan":               "AC Milan",
    "SSC Napoli":             "Napoli",
    "AS Roma":                "Roma",
    "SS Lazio":               "Lazio",
    "Atalanta BC":            "Atalanta",
    "ACF Fiorentina":         "Fiorentina",
    "Torino FC":              "Torino",
    "Bologna FC":             "Bologna",
    "Udinese Calcio":         "Udinese",
    "Cagliari Calcio":        "Cagliari",
    "Genoa CFC":              "Genoa",
    "Hellas Verona FC":       "Verona",
    "Parma Calcio 1913":      "Parma",
    "AC Monza":               "Monza",
    "US Lecce":               "Lecce",
    "Empoli FC":              "Empoli",
    "Como 1907":              "Como",
    "Olympique de Marseille": "Marseille",
    "Olympique Lyonnais":     "Lyon",
    "AS Monaco FC":           "Monaco",
    "AS Monaco":              "Monaco",
    "LOSC Lille":             "Lille",
    "OGC Nice":               "Nice",
    "RC Lens":                "Lens",
    "Stade Rennais FC":       "Rennes",
    "RC Strasbourg":          "Strasbourg",
    "Stade de Reims":         "Stade de Reims",
    "Montpellier HSC":        "Montpellier",
    "FC Nantes":              "Nantes",
    "AJ Auxerre":             "Auxerre",
    "Stade Brestois 29":      "Brest",
    "AS Saint-Étienne":       "Saint-Étienne",
    "SCO Angers":             "Angers",
    "FC Le Havre":            "Le Havre",
    "Toulouse FC":            "Toulouse",
    "Sporting CP":            "Sporting CP",
  };

  if (OVERRIDES[raw] && TEAM_LOGOS[OVERRIDES[raw]])  return TEAM_LOGOS[OVERRIDES[raw]];

  for (const v of variants) {
    if (TEAM_LOGOS[v]) return TEAM_LOGOS[v];
    if (OVERRIDES[v] && TEAM_LOGOS[OVERRIDES[v]]) return TEAM_LOGOS[OVERRIDES[v]];
  }

  return undefined;
}

interface TeamBadgeProps {
  name: string;
  size?: number;
  className?: string;
}

const TeamBadge = ({ name, size = 20, className = "" }: TeamBadgeProps) => {
  const logo = findLogo(name);
  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        width={size}
        height={size}
        className={`object-contain flex-shrink-0 ${className}`}
        style={{ width: size, height: size, minWidth: size }}
        onError={(e) => {
          const el = e.currentTarget;
          el.style.display = "none";
          // show fallback sibling if it exists
          const sib = el.nextElementSibling as HTMLElement | null;
          if (sib) sib.style.display = "flex";
        }}
      />
    );
  }
  return (
    <span
      className={`flex-shrink-0 inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-[10px] ${className}`}
      style={{ width: size, height: size, minWidth: size, fontSize: size * 0.38 }}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
};

export default TeamBadge;
