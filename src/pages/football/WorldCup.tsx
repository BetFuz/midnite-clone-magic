import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Flame, ChevronRight, BarChart3, MapPin } from "lucide-react";
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "@/components/ui/carousel";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Link, useNavigate } from "react-router-dom";
import { FLAG } from "@/utils/teamLogos";
import worldCupHero       from "@/assets/promos/world-cup-hero.jpg";
import worldCupBetting    from "@/assets/promos/world-cup-betting.jpg";
import worldCupCities     from "@/assets/promos/world-cup-cities.jpg";
import worldCupGroups     from "@/assets/promos/world-cup-groups.jpg";
import worldCupFinal      from "@/assets/promos/world-cup-final.jpg";
import worldCupAfricanTeams from "@/assets/promos/world-cup-african-teams.jpg";
import worldCupLegends    from "@/assets/promos/world-cup-legends.jpg";
import worldCupStadiums   from "@/assets/promos/world-cup-stadiums.jpg";

/* ─── ISO codes ─────────────────────────────────────────────── */
const ISO: Record<string, string> = {
  Nigeria:"NG", Morocco:"MA", Senegal:"SN", Egypt:"EG", Cameroon:"CM",
  Algeria:"DZ", Tunisia:"TN", Ghana:"GH", "Ivory Coast":"CI",
  France:"FR", Germany:"DE", Spain:"ES", England:"GB", Portugal:"PT",
  Italy:"IT", Netherlands:"NL", Belgium:"BE", Croatia:"HR", Serbia:"RS",
  Poland:"PL", Denmark:"DK", Switzerland:"CH", Austria:"AT", Ukraine:"UA",
  Albania:"AL", Slovakia:"SK", Turkey:"TR", Scotland:"GB",
  Brazil:"BR", Argentina:"AR", Mexico:"MX", USA:"US", Canada:"CA",
  Uruguay:"UY", Colombia:"CO", Chile:"CL", Ecuador:"EC", Peru:"PE",
  Paraguay:"PY", Panama:"PA", Bolivia:"BO", Venezuela:"VE",
  Japan:"JP", "South Korea":"KR", "Saudi Arabia":"SA", Australia:"AU",
  Iran:"IR", Uzbekistan:"UZ", Qatar:"QA", Norway:"NO", Sweden:"SE",
};

/* ─── Flag image component ──────────────────────────────────── */
const Fl = ({ iso, size = 28, className = "" }: { iso: string; size?: number; className?: string }) => {
  const w = size, h = Math.round(size * 0.67);
  return (
    <img src={FLAG(iso)} alt="" width={w} height={h}
      className={`object-contain rounded-[2px] flex-shrink-0 ${className}`}
      style={{ width: w, height: h, minWidth: w }}
      onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0.2"; }}
    />
  );
};

/* ─── Types ─────────────────────────────────────────────────── */
type MarketType = "3way" | "dc" | "ggng" | "dnb";
type MainTab    = "fixtures" | "outrights" | "groups" | "news";
type OTab       = "winner" | "scorer" | "africa";

/* ─── Carousel slides ───────────────────────────────────────── */
const PHOTO_SLIDES = [
  { img: worldCupHero,         title: "FIFA World Cup 2026",             sub: "USA · Mexico · Canada — 11 Jun – 19 Jul", cta: "View Fixtures",   tab: "fixtures" as MainTab },
  { img: worldCupBetting,      title: "Best Odds on Every Match",        sub: "Enhanced prices on all 104 fixtures",      cta: "Bet Now",         tab: "fixtures" as MainTab },
  { img: worldCupAfricanTeams, title: "Africa Rising — 9 Nations 🌍",   sub: "Nigeria, Morocco, Senegal & 6 more",       cta: "Africa Bets",     tab: "outrights" as MainTab },
  { img: worldCupGroups,       title: "48 Teams · 12 Groups",            sub: "The most competitive World Cup ever",      cta: "See Groups",      tab: "groups" as MainTab },
  { img: worldCupLegends,      title: "Legends Collide",                 sub: "Messi · Mbappé · Ronaldo · Osimhen",      cta: "Golden Boot",     tab: "outrights" as MainTab },
  { img: worldCupFinal,        title: "The Final — Miami 2026 🏆",      sub: "Hard Rock Stadium · 19 July 2026",         cta: "Bet on Winner",   tab: "outrights" as MainTab },
  { img: worldCupStadiums,     title: "16 Iconic Stadiums",              sub: "From Azteca to MetLife",                   cta: "Host Cities",     tab: "news" as MainTab },
  { img: worldCupCities,       title: "Across Three Nations",            sub: "New York · Dallas · Miami · Mexico City",  cta: "News & Info",     tab: "news" as MainTab },
];

const PLAYER_SLIDES = [
  { name: "Kylian Mbappé",   country: "France",    iso: "FR", pos: "Forward",  odds: "4.50",  apps: "91 caps · 48 goals",  grad: "from-blue-900 via-blue-700 to-red-700" },
  { name: "Lionel Messi",    country: "Argentina", iso: "AR", pos: "Forward",  odds: "6.00",  apps: "Defending Champion",   grad: "from-sky-800 to-sky-600" },
  { name: "Victor Osimhen",  country: "Nigeria",   iso: "NG", pos: "Striker",  odds: "10.00", apps: "Super Eagles Captain", grad: "from-green-900 to-green-700" },
  { name: "Vinicius Jr",     country: "Brazil",    iso: "BR", pos: "Winger",   odds: "6.50",  apps: "Samba Star",           grad: "from-green-800 to-yellow-700" },
  { name: "Erling Haaland",  country: "Norway",    iso: "NO", pos: "Striker",  odds: "5.50",  apps: "Club-record Scorer",   grad: "from-red-800 to-rose-900" },
  { name: "Mohamed Salah",   country: "Egypt",     iso: "EG", pos: "Winger",   odds: "12.00", apps: "Pharaohs Talisman",    grad: "from-red-900 to-amber-800" },
  { name: "Cristiano Ronaldo",country:"Portugal",  iso: "PT", pos: "Forward",  odds: "8.00",  apps: "130+ International Goals", grad: "from-red-700 to-green-900" },
  { name: "Lamine Yamal",    country: "Spain",     iso: "ES", pos: "Winger",   odds: "14.00", apps: "World's Best Young Player", grad: "from-red-800 to-amber-700" },
];

const EVENT_SLIDES = [
  { icon: "🎉", title: "Opening Ceremony",  sub: "11 June 2026 · Estadio Azteca, Mexico City",         grad: "from-red-700 to-yellow-600",    cta: "Opening Fixtures" },
  { icon: "⚽", title: "Group Stage",        sub: "11 Jun – 3 Jul · 12 Groups · 48 Teams · 72 Matches", grad: "from-primary/80 to-emerald-700",cta: "View Groups" },
  { icon: "🔥", title: "Round of 32",        sub: "27 Jun – 3 Jul · First Knockout Stage",               grad: "from-orange-700 to-red-800",    cta: "Bet on Knockouts" },
  { icon: "⚡", title: "Quarter-Finals",     sub: "4–5 July 2026 · Elite Eight Remain",                  grad: "from-purple-800 to-blue-800",   cta: "Outright Markets" },
  { icon: "🌟", title: "Semi-Finals",        sub: "14–15 July 2026 · The Final Four",                    grad: "from-amber-700 to-orange-800",  cta: "Bet on Semis" },
  { icon: "🏆", title: "THE FINAL",          sub: "19 July 2026 · Hard Rock Stadium, Miami 🇺🇸",         grad: "from-yellow-600 to-amber-800",  cta: "Bet on Winner" },
];

/* ─── Match schedule ────────────────────────────────────────── */
interface WCMatch {
  id:string; home:string; away:string; group:string; venue:string; time:string;
  h:number; d:number; a:number;
  ou:number; ov:number; un:number;
  dcHX:number; dc12:number; dcXA:number;
  gg:number; ng:number; dnbH:number; dnbA:number; more:number;
}
const S = (id:string,home:string,away:string,group:string,venue:string,time:string,
  h:number,d:number,a:number,ou:number,ov:number,un:number,
  dcHX:number,dc12:number,dcXA:number,gg:number,ng:number,dnbH:number,dnbA:number,more:number
):WCMatch=>({id,home,away,group,venue,time,h,d,a,ou,ov,un,dcHX,dc12,dcXA,gg,ng,dnbH,dnbA,more});

const SCHEDULE: { day:string; matches:WCMatch[] }[] = [
  { day:"11 Jun · Thu — Opening Day", matches:[
    S("m01","Mexico","Cameroon","Group D","Estadio Azteca, Mexico City","19:00",1.52,4.10,6.50,2.5,1.88,1.96,1.14,1.12,2.20,1.75,2.05,1.25,4.20,267),
    S("m02","USA","Albania","Group A","MetLife, New Jersey","22:00",1.65,3.80,5.10,2.5,1.85,1.99,1.18,1.14,2.00,1.80,2.00,1.30,3.50,248),
  ]},
  { day:"12 Jun · Fri", matches:[
    S("m03","Spain","Morocco","Group B","SoFi Stadium, Los Angeles","16:00",1.88,3.40,4.30,2.5,1.87,1.97,1.25,1.22,1.85,1.82,1.98,1.42,2.80,278),
    S("m04","Germany","Saudi Arabia","Group C","Levi's Stadium, San Francisco","19:00",1.32,5.00,9.50,2.5,1.75,2.10,1.06,1.05,2.60,1.72,2.10,1.15,6.00,261),
    S("m05","Brazil","Colombia","Group D","Hard Rock Stadium, Miami","22:00",1.55,3.90,5.50,2.5,1.86,1.98,1.12,1.10,2.10,1.77,2.03,1.22,4.00,283),
  ]},
  { day:"13 Jun · Sat", matches:[
    S("m06","France","Uruguay","Group E","Mercedes-Benz, Atlanta","16:00",1.80,3.45,4.50,2.5,1.86,1.98,1.22,1.18,1.88,1.80,2.00,1.36,2.95,275),
    S("m07","Argentina","Chile","Group F","AT&T Stadium, Dallas","19:00",1.62,3.75,5.20,2.5,1.84,2.00,1.16,1.13,2.05,1.79,2.01,1.28,3.60,271),
    S("m08","England","Serbia","Group G","Lincoln Financial, Philadelphia","22:00",1.65,3.70,5.10,2.5,1.85,1.99,1.18,1.14,2.00,1.81,1.99,1.30,3.50,264),
  ]},
  { day:"14 Jun · Sun", matches:[
    S("m09","Nigeria","Ecuador","Group H","NRG Stadium, Houston","16:00",2.60,3.10,2.80,2.5,1.90,1.93,1.48,1.35,1.58,1.84,1.96,1.65,1.72,251),
    S("m10","Portugal","Poland","Group I","Gillette Stadium, Boston","19:00",1.72,3.60,4.80,2.5,1.86,1.98,1.20,1.16,1.92,1.79,2.01,1.33,3.10,258),
    S("m11","Netherlands","Senegal","Group J","Rose Bowl, Los Angeles","22:00",1.90,3.35,4.20,2.5,1.88,1.96,1.26,1.22,1.83,1.81,1.99,1.44,2.78,255),
  ]},
  { day:"15 Jun · Mon", matches:[
    S("m12","Italy","Ivory Coast","Group K","SoFi Stadium, Los Angeles","16:00",1.75,3.55,4.60,2.5,1.87,1.97,1.22,1.17,1.88,1.80,2.00,1.36,2.95,252),
    S("m13","Egypt","Belgium","Group L","Allegiant Stadium, Las Vegas","19:00",3.20,3.10,2.20,2.5,1.89,1.95,1.65,1.28,1.42,1.83,1.97,1.85,1.50,244),
    S("m14","Japan","Algeria","Group C","Gillette Stadium, Boston","22:00",2.20,3.20,3.30,2.5,1.91,1.92,1.38,1.30,1.66,1.82,1.98,1.55,1.90,238),
  ]},
  { day:"16 Jun · Tue", matches:[
    S("m15","Morocco","Colombia","Group B","AT&T Stadium, Dallas","16:00",2.40,3.20,2.90,2.5,1.89,1.95,1.42,1.33,1.60,1.82,1.98,1.58,1.78,246),
    S("m16","Ghana","Croatia","Group K","Arrowhead, Kansas City","19:00",3.00,3.20,2.35,2.5,1.90,1.93,1.58,1.38,1.50,1.83,1.97,1.78,1.60,240),
    S("m17","Tunisia","Denmark","Group L","State Farm, Atlanta","22:00",3.10,3.15,2.25,2.5,1.91,1.92,1.62,1.35,1.44,1.82,1.98,1.80,1.55,237),
  ]},
];

/* ─── Groups ────────────────────────────────────────────────── */
const GROUPS = [
  { name:"Group A", teams:[{n:"USA",iso:"US"},{n:"Panama",iso:"PA"},{n:"Albania",iso:"AL"},{n:"Ukraine",iso:"UA"}] },
  { name:"Group B", teams:[{n:"Spain",iso:"ES"},{n:"Morocco",iso:"MA"},{n:"Uzbekistan",iso:"UZ"},{n:"Ecuador",iso:"EC"}] },
  { name:"Group C", teams:[{n:"Germany",iso:"DE"},{n:"Japan",iso:"JP"},{n:"Saudi Arabia",iso:"SA"},{n:"Algeria",iso:"DZ"}] },
  { name:"Group D", teams:[{n:"Brazil",iso:"BR"},{n:"Mexico",iso:"MX"},{n:"Cameroon",iso:"CM"},{n:"Colombia",iso:"CO"}] },
  { name:"Group E", teams:[{n:"France",iso:"FR"},{n:"Uruguay",iso:"UY"},{n:"Netherlands",iso:"NL"},{n:"Ivory Coast",iso:"CI"}] },
  { name:"Group F", teams:[{n:"Argentina",iso:"AR"},{n:"Chile",iso:"CL"},{n:"Australia",iso:"AU"},{n:"Slovakia",iso:"SK"}] },
  { name:"Group G", teams:[{n:"England",iso:"GB"},{n:"Serbia",iso:"RS"},{n:"Ghana",iso:"GH"},{n:"Turkey",iso:"TR"}] },
  { name:"Group H", teams:[{n:"Nigeria",iso:"NG"},{n:"Ecuador",iso:"EC"},{n:"Bolivia",iso:"BO"},{n:"South Korea",iso:"KR"}] },
  { name:"Group I", teams:[{n:"Portugal",iso:"PT"},{n:"Poland",iso:"PL"},{n:"Egypt",iso:"EG"},{n:"Venezuela",iso:"VE"}] },
  { name:"Group J", teams:[{n:"Netherlands",iso:"NL"},{n:"Senegal",iso:"SN"},{n:"Canada",iso:"CA"},{n:"Paraguay",iso:"PY"}] },
  { name:"Group K", teams:[{n:"Italy",iso:"IT"},{n:"Ivory Coast",iso:"CI"},{n:"Croatia",iso:"HR"},{n:"Peru",iso:"PE"}] },
  { name:"Group L", teams:[{n:"Belgium",iso:"BE"},{n:"Egypt",iso:"EG"},{n:"Tunisia",iso:"TN"},{n:"Denmark",iso:"DK"}] },
];

/* ─── Outrights ─────────────────────────────────────────────── */
const WINNERS = [
  {id:"w-bra",name:"Brazil",     iso:"BR",odds:"4.50",af:false},
  {id:"w-fra",name:"France",     iso:"FR",odds:"5.00",af:false},
  {id:"w-arg",name:"Argentina",  iso:"AR",odds:"5.50",af:false},
  {id:"w-eng",name:"England",    iso:"GB",odds:"6.50",af:false},
  {id:"w-esp",name:"Spain",      iso:"ES",odds:"7.00",af:false},
  {id:"w-ger",name:"Germany",    iso:"DE",odds:"7.50",af:false},
  {id:"w-por",name:"Portugal",   iso:"PT",odds:"9.00",af:false},
  {id:"w-ned",name:"Netherlands",iso:"NL",odds:"11.00",af:false},
  {id:"w-ita",name:"Italy",      iso:"IT",odds:"13.00",af:false},
  {id:"w-bel",name:"Belgium",    iso:"BE",odds:"15.00",af:false},
  {id:"w-nga",name:"Nigeria",    iso:"NG",odds:"35.00",af:true},
  {id:"w-mor",name:"Morocco",    iso:"MA",odds:"40.00",af:true},
  {id:"w-sen",name:"Senegal",    iso:"SN",odds:"45.00",af:true},
  {id:"w-egy",name:"Egypt",      iso:"EG",odds:"65.00",af:true},
  {id:"w-gha",name:"Ghana",      iso:"GH",odds:"90.00",af:true},
  {id:"w-alg",name:"Algeria",    iso:"DZ",odds:"100.00",af:true},
];

const TOP_SCORERS = [
  {id:"gs-mba",player:"Kylian Mbappé",  iso:"FR",country:"France",    odds:"4.50"},
  {id:"gs-hal",player:"Erling Haaland", iso:"NO",country:"Norway",    odds:"5.50"},
  {id:"gs-mes",player:"Lionel Messi",   iso:"AR",country:"Argentina", odds:"6.00"},
  {id:"gs-vin",player:"Vinicius Jr",    iso:"BR",country:"Brazil",    odds:"6.50"},
  {id:"gs-ron",player:"C. Ronaldo",     iso:"PT",country:"Portugal",  odds:"8.00"},
  {id:"gs-osi",player:"V. Osimhen",     iso:"NG",country:"Nigeria",   odds:"10.00"},
  {id:"gs-sal",player:"M. Salah",       iso:"EG",country:"Egypt",     odds:"12.00"},
  {id:"gs-lam",player:"Lamine Yamal",   iso:"ES",country:"Spain",     odds:"14.00"},
  {id:"gs-sak",player:"Bukayo Saka",    iso:"GB",country:"England",   odds:"16.00"},
  {id:"gs-mnd",player:"S. Mané",        iso:"SN",country:"Senegal",   odds:"22.00"},
];

const AFRICA_BETS = [
  {id:"af-nga-qf", label:"Nigeria to reach Quarter-Finals",        odds:"3.20"},
  {id:"af-mor-qf", label:"Morocco to reach Quarter-Finals",         odds:"3.80"},
  {id:"af-sen-r16",label:"Senegal to reach Round of 16",            odds:"1.85"},
  {id:"af-any-sf", label:"Any African team to reach Semi-Finals",   odds:"2.60"},
  {id:"af-any-fn", label:"Any African team to reach Final",         odds:"4.50"},
  {id:"af-any-win",label:"African team to WIN the World Cup",       odds:"8.00"},
  {id:"af-top-scr",label:"African player wins Golden Boot",         odds:"5.50"},
  {id:"af-nga-win",label:"Nigeria to win Group H",                  odds:"2.20"},
  {id:"af-mor-win",label:"Morocco to win Group B",                  odds:"4.50"},
  {id:"af-alg-r16",label:"Algeria to reach Round of 16",            odds:"2.40"},
];

/* ─── Host cities ───────────────────────────────────────────── */
const CITIES = [
  {city:"Mexico City",  iso:"MX",country:"Mexico",  stadium:"Estadio Azteca",      cap:"87,000",games:8, badge:"🎉 OPENING",  grad:"from-red-800 to-green-900"},
  {city:"New York",     iso:"US",country:"USA",     stadium:"MetLife Stadium",     cap:"82,500",games:8, badge:"🌟 SEMI-FINAL",grad:"from-blue-900 to-red-700"},
  {city:"Dallas",       iso:"US",country:"USA",     stadium:"AT&T Stadium",        cap:"80,000",games:9, badge:"⚽ MOST GAMES",grad:"from-slate-800 to-blue-900"},
  {city:"Los Angeles",  iso:"US",country:"USA",     stadium:"SoFi Stadium",        cap:"70,000",games:8, badge:"🌟 SEMI-FINAL",grad:"from-indigo-900 to-blue-800"},
  {city:"Miami",        iso:"US",country:"USA",     stadium:"Hard Rock Stadium",   cap:"65,000",games:8, badge:"🏆 THE FINAL", grad:"from-amber-700 to-yellow-600"},
  {city:"San Francisco",iso:"US",country:"USA",     stadium:"Levi's Stadium",      cap:"68,500",games:8, badge:"",             grad:"from-red-900 to-slate-700"},
  {city:"Atlanta",      iso:"US",country:"USA",     stadium:"Mercedes-Benz",       cap:"71,000",games:8, badge:"",             grad:"from-slate-800 to-red-900"},
  {city:"Seattle",      iso:"US",country:"USA",     stadium:"Lumen Field",         cap:"69,000",games:6, badge:"",             grad:"from-teal-800 to-blue-900"},
  {city:"Kansas City",  iso:"US",country:"USA",     stadium:"Arrowhead Stadium",   cap:"76,000",games:6, badge:"",             grad:"from-red-800 to-slate-700"},
  {city:"Boston",       iso:"US",country:"USA",     stadium:"Gillette Stadium",    cap:"65,000",games:6, badge:"",             grad:"from-blue-900 to-slate-700"},
  {city:"Toronto",      iso:"CA",country:"Canada",  stadium:"BMO Field",           cap:"45,000",games:6, badge:"",             grad:"from-red-900 to-slate-800"},
];

/* ─── News ──────────────────────────────────────────────────── */
const NEWS = [
  {iso:"NG",title:"Africa's Historic 9-Team Representation",excerpt:"Nigeria, Morocco, Senegal, Egypt, Cameroon, Algeria, Tunisia, Ghana and Ivory Coast all set. Can 2026 be Africa's tournament?",time:"2h ago"},
  {iso:"AR",title:"Messi's Final World Cup Countdown",excerpt:"Argentina's defending champion Lionel Messi confirms 2026 will be his last. Can La Albiceleste repeat?",time:"4h ago"},
  {iso:"US",title:"48-Team Format — What Changes?",excerpt:"The expanded format means 12 groups of 4, more shocks, and more drama. Experts analyse the new knockout path.",time:"6h ago"},
  {iso:"NG",title:"Osimhen Leads Nigeria's Golden Generation",excerpt:"Victor Osimhen, Chukwueze, and Lookman spearhead what could be Nigeria's best-ever World Cup squad.",time:"1d ago"},
  {iso:"MA",title:"Morocco: From Dreamers to Contenders",excerpt:"After their historic 2022 semi-final run, Morocco arrive in North America as genuine contenders. Hakimi and En-Nesyri ready.",time:"1d ago"},
  {iso:"MX",title:"Azteca Hosts the Opening Ceremony",excerpt:"For the third time, Estadio Azteca will host a World Cup match — the historic opening game on 11 June 2026.",time:"2d ago"},
  {iso:"FR",title:"France: Defending Euro Champions Eye the Double",excerpt:"Les Bleus arrive with arguably their strongest-ever squad. Mbappé leads a generation-defining team.",time:"3d ago"},
  {iso:"BR",title:"Brazil's 5th — The Dream Lives On",excerpt:"Brazil aim for a record-equalling fifth star. Vinicius Jr, Rodrygo and the Seleção mean business.",time:"5d ago"},
];

/* ════════════════════════════════════════════════════════════ */
const WorldCup = () => {
  const { addSelection } = useBetSlip();
  const navigate = useNavigate();
  const [mainTab, setMainTab]   = useState<MainTab>("fixtures");
  const [market, setMarket]     = useState<MarketType>("3way");
  const [oTab, setOTab]         = useState<OTab>("winner");

  /* bet helpers */
  const addM = (m: WCMatch, type: string, odds: number, label: string) =>
    addSelection({
      id:`${m.id}-${type}`, matchId:m.id, sport:"⚽",
      league:`FIFA World Cup 2026 — ${m.group}`,
      homeTeam:m.home, awayTeam:m.away,
      selectionType: ["home","draw","away"].includes(type) ? (type as any) : "other",
      selectionValue:label, odds, matchTime:m.time,
    });

  const addO = (id:string, label:string, odds:string, cat:string) =>
    addSelection({
      id, matchId:id, sport:"⚽", league:"FIFA World Cup 2026",
      homeTeam:label, awayTeam:"Outright", selectionType:"other",
      selectionValue:`${cat}: ${label}`, odds:parseFloat(odds), matchTime:"Jul 2026",
    });

  /* odds button */
  const OBtn = ({lbl,val,onClick}:{lbl?:string;val:string|number;onClick:()=>void}) => (
    <button onClick={e=>{e.stopPropagation();onClick();}}
      className="flex flex-col items-center justify-center min-w-[52px] h-9 px-1 rounded bg-muted hover:bg-primary/15 hover:border-primary border border-transparent transition-all active:scale-95">
      {lbl&&<span className="text-[9px] text-muted-foreground leading-none mb-0.5">{lbl}</span>}
      <span className="text-xs font-bold text-primary tabular-nums">{typeof val==="number"?val.toFixed(2):val}</span>
    </button>
  );

  /* column headers */
  const ColH = () => (
    <div className="flex items-center justify-end gap-1 px-3 py-1.5 border-b border-border/30 bg-muted/30">
      <span className="flex-1"/>
      {market==="3way"&&<>
        {["1","X","2"].map(l=><span key={l} className="text-[10px] font-bold text-muted-foreground min-w-[52px] text-center">{l}</span>)}
        <span className="text-[10px] font-bold text-muted-foreground min-w-[28px] text-center">Goals</span>
        <span className="text-[10px] font-bold text-muted-foreground min-w-[52px] text-center">Over</span>
        <span className="text-[10px] font-bold text-muted-foreground min-w-[52px] text-center">Under</span>
      </>}
      {market==="dc"&&["1X","12","X2"].map(l=><span key={l} className="text-[10px] font-bold text-muted-foreground min-w-[52px] text-center">{l}</span>)}
      {market==="ggng"&&["GG","NG"].map(l=><span key={l} className="text-[10px] font-bold text-muted-foreground min-w-[52px] text-center">{l}</span>)}
      {market==="dnb"&&["Home","Away"].map(l=><span key={l} className="text-[10px] font-bold text-muted-foreground min-w-[52px] text-center">{l}</span>)}
      <span className="min-w-[52px]"/>
    </div>
  );

  /* match row */
  const MRow = ({m}:{m:WCMatch}) => (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer group">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <span>{m.time}</span>
          <Badge variant="outline" className="text-[9px] px-1 py-0 border-border/60">{m.group}</Badge>
        </p>
        <div className="flex items-center gap-2 mb-1">
          <Fl iso={ISO[m.home]??"US"} size={22}/>
          <span className="text-xs font-semibold truncate">{m.home}</span>
        </div>
        <div className="flex items-center gap-2">
          <Fl iso={ISO[m.away]??"US"} size={22}/>
          <span className="text-xs text-muted-foreground truncate">{m.away}</span>
        </div>
        <p className="text-[9px] text-muted-foreground/50 mt-0.5 truncate">{m.venue}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {market==="3way"&&<>
          <OBtn lbl="1" val={m.h} onClick={()=>addM(m,"home",m.h,`${m.home} to win`)}/>
          <OBtn lbl="X" val={m.d} onClick={()=>addM(m,"draw",m.d,"Draw")}/>
          <OBtn lbl="2" val={m.a} onClick={()=>addM(m,"away",m.a,`${m.away} to win`)}/>
          <span className="text-[10px] text-muted-foreground/60 min-w-[28px] text-center">{m.ou}</span>
          <OBtn lbl="Over" val={m.ov} onClick={()=>addM(m,"over",m.ov,`Over ${m.ou} goals`)}/>
          <OBtn lbl="Under" val={m.un} onClick={()=>addM(m,"under",m.un,`Under ${m.ou} goals`)}/>
        </>}
        {market==="dc"&&<>
          <OBtn lbl="1X" val={m.dcHX} onClick={()=>addM(m,"dcHX",m.dcHX,`${m.home} or Draw`)}/>
          <OBtn lbl="12" val={m.dc12} onClick={()=>addM(m,"dc12",m.dc12,`${m.home} or ${m.away}`)}/>
          <OBtn lbl="X2" val={m.dcXA} onClick={()=>addM(m,"dcXA",m.dcXA,`Draw or ${m.away}`)}/>
        </>}
        {market==="ggng"&&<>
          <OBtn lbl="GG" val={m.gg} onClick={()=>addM(m,"gg",m.gg,"Both Teams Score")}/>
          <OBtn lbl="NG" val={m.ng} onClick={()=>addM(m,"ng",m.ng,"No Goal/Goal")}/>
        </>}
        {market==="dnb"&&<>
          <OBtn lbl={m.home.slice(0,3)} val={m.dnbH} onClick={()=>addM(m,"dnbH",m.dnbH,`${m.home} DNB`)}/>
          <OBtn lbl={m.away.slice(0,3)} val={m.dnbA} onClick={()=>addM(m,"dnbA",m.dnbA,`${m.away} DNB`)}/>
        </>}
        <span className="text-[10px] font-semibold text-primary/70 min-w-[36px] text-right">+{m.more}</span>
        <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary/50 transition-colors"/>
      </div>
    </div>
  );

  /* flash card odds row helper */
  const FcOdds = ({matchId,home,away,league,time,bets}:{
    matchId:string;home:string;away:string;league:string;time:string;
    bets:{l:string;v:string;type:string;label:string}[]
  }) => (
    <div className="flex gap-1 mt-2">
      {bets.map(o=>(
        <button key={o.l}
          onClick={e=>{e.stopPropagation();addSelection({
            id:`fc-${matchId}-${o.type}`, matchId,sport:"⚽",league,
            homeTeam:home,awayTeam:away,
            selectionType:o.type as any,selectionValue:o.label,
            odds:parseFloat(o.v),matchTime:time,
          });}}
          className="flex-1 flex flex-col items-center bg-black/25 hover:bg-black/45 rounded-lg py-1.5 transition-colors">
          <span className="text-[9px] text-white/60">{o.l}</span>
          <span className="text-sm font-bold text-yellow-300">{o.v}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header/>
      <div className="flex">
        <Sidebar className="hidden md:flex"/>
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">

          {/* ══ MEGA CAROUSEL — photo + player + event slides ══ */}
          <Carousel className="w-full">
            <CarouselContent>

              {/* — Photo slides — */}
              {PHOTO_SLIDES.map((s,i)=>(
                <CarouselItem key={i}>
                  <div className="relative overflow-hidden h-52 md:h-72 w-full">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center px-6 md:px-10">
                      <div className="max-w-xs md:max-w-sm">
                        <div className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-1">FIFA World Cup 2026</div>
                        <h2 className="text-xl md:text-3xl font-extrabold text-white mb-1.5 drop-shadow leading-tight">{s.title}</h2>
                        <p className="text-white/80 text-xs md:text-sm mb-4">{s.sub}</p>
                        <button onClick={()=>setMainTab(s.tab)}
                          className="inline-block bg-primary text-primary-foreground font-bold text-sm px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                          {s.cta}
                        </button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}

              {/* — Player slides — */}
              {PLAYER_SLIDES.map((p,i)=>(
                <CarouselItem key={`p${i}`}>
                  <div className={`relative overflow-hidden h-52 md:h-72 w-full bg-gradient-to-r ${p.grad}`}>
                    {/* large flag watermark */}
                    <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none">
                      <img src={FLAG(p.iso)} alt="" className="w-40 md:w-56 object-contain drop-shadow-2xl"/>
                    </div>
                    <div className="relative z-10 flex items-center h-full px-6 md:px-10">
                      <div className="max-w-xs">
                        <div className="flex items-center gap-2 mb-3">
                          <Fl iso={p.iso} size={36}/>
                          <div>
                            <div className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{p.country} · {p.pos}</div>
                            <div className="text-[11px] text-white/80">{p.apps}</div>
                          </div>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 drop-shadow leading-tight">{p.name}</h2>
                        <div className="flex items-center gap-3 mb-4">
                          <div>
                            <div className="text-[9px] text-white/60 uppercase">Golden Boot</div>
                            <div className="text-2xl font-extrabold text-yellow-400">{p.odds}</div>
                          </div>
                        </div>
                        <button onClick={()=>addO(`carousel-gs-${i}`,`${p.name} — Golden Boot`,p.odds,"Golden Boot")}
                          className="bg-primary text-primary-foreground font-bold text-sm px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                          Bet on Golden Boot
                        </button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}

              {/* — Event milestone slides — */}
              {EVENT_SLIDES.map((ev,i)=>(
                <CarouselItem key={`e${i}`}>
                  <div className={`relative overflow-hidden h-52 md:h-72 w-full bg-gradient-to-br ${ev.grad} flex items-center`}>
                    <div className="absolute inset-0 bg-black/30"/>
                    <div className="relative z-10 px-8 md:px-12 w-full">
                      <div className="text-6xl md:text-8xl mb-2 drop-shadow">{ev.icon}</div>
                      <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-1 drop-shadow">{ev.title}</h2>
                      <p className="text-white/80 text-sm mb-4">{ev.sub}</p>
                      <button onClick={()=>ev.cta.includes("Winner")?setOTab("winner"):setMainTab("fixtures")}
                        className="bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-5 py-2 rounded-lg backdrop-blur transition-colors border border-white/30">
                        {ev.cta}
                      </button>
                    </div>
                  </div>
                </CarouselItem>
              ))}

            </CarouselContent>
            <CarouselPrevious className="left-2"/>
            <CarouselNext className="right-2"/>
          </Carousel>

          {/* ══ FLASH CARDS — horizontal scroll ══ */}
          <div className="relative">
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"/>
            <div className="flex gap-3 overflow-x-auto pb-1 px-3 md:px-4 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {/* Card: Tournament Winner */}
              <div className="flex-shrink-0 w-48 rounded-2xl bg-gradient-to-br from-yellow-600 to-amber-800 border border-yellow-500/30 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={()=>{setMainTab("outrights");setOTab("winner");}}>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-yellow-200/70 uppercase tracking-wider mb-1.5">🏆 Who wins it?</div>
                  <p className="text-sm font-extrabold text-white mb-2.5">Tournament<br/>Winner</p>
                  {[{iso:"BR",name:"Brazil",odds:"4.50"},{iso:"FR",name:"France",odds:"5.00"},{iso:"AR",name:"Argentina",odds:"5.50"}].map(t=>(
                    <button key={t.iso} onClick={e=>{e.stopPropagation();addO(`fc-win-${t.iso}`,t.name,t.odds,"Tournament Winner");}}
                      className="flex items-center justify-between w-full bg-black/25 hover:bg-black/45 rounded-lg px-2 py-1 mb-1 transition-colors">
                      <span className="flex items-center gap-1.5"><Fl iso={t.iso} size={18}/><span className="text-xs text-white">{t.name}</span></span>
                      <span className="text-xs font-bold text-yellow-300">{t.odds}</span>
                    </button>
                  ))}
                  <p className="text-[9px] text-yellow-200/50 mt-1">+{WINNERS.length-3} more →</p>
                </div>
              </div>

              {/* Card: Brazil vs Colombia */}
              <div className="flex-shrink-0 w-52 rounded-2xl bg-gradient-to-br from-green-800 to-yellow-800 border border-green-500/30 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={()=>setMainTab("fixtures")}>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-green-200/70 uppercase tracking-wider mb-1.5">⚽ Group D · 12 Jun</div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Fl iso="BR" size={32}/>
                    <div><p className="text-sm font-extrabold text-white">Brazil</p><p className="text-[10px] text-green-200/70">vs Colombia</p></div>
                    <Fl iso="CO" size={24} className="ml-auto"/>
                  </div>
                  <FcOdds matchId="m05" home="Brazil" away="Colombia" league="FIFA World Cup 2026 — Group D" time="22:00"
                    bets={[{l:"1",v:"1.55",type:"home",label:"Brazil to win"},{l:"X",v:"3.90",type:"draw",label:"Draw"},{l:"2",v:"5.50",type:"away",label:"Colombia to win"}]}/>
                </div>
              </div>

              {/* Card: Africa Rising */}
              <div className="flex-shrink-0 w-52 rounded-2xl bg-gradient-to-br from-green-900 to-emerald-700 border border-green-400/30 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={()=>{setMainTab("outrights");setOTab("africa");}}>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-green-300/70 uppercase tracking-wider mb-1.5">🌍 Africa Special</div>
                  <p className="text-sm font-extrabold text-white mb-1.5">Africa Rising<br/>2026</p>
                  <div className="flex gap-1 flex-wrap mb-2">
                    {[["NG","Nigeria"],["MA","Morocco"],["SN","Senegal"],["EG","Egypt"],["CM","Cameroon"],["DZ","Algeria"],["TN","Tunisia"],["GH","Ghana"],["CI","Ivory Coast"]].map(([iso])=>(
                      <Fl key={iso} iso={iso} size={20}/>
                    ))}
                  </div>
                  <button onClick={e=>{e.stopPropagation();addO("fc-afr-win","Any African team to WIN the World Cup","8.00","Africa Special");}}
                    className="w-full bg-black/25 hover:bg-black/45 rounded-lg px-2 py-1.5 transition-colors text-left">
                    <p className="text-[10px] text-green-200/70">Any Africa to WIN</p>
                    <p className="text-lg font-extrabold text-green-300">8.00</p>
                  </button>
                </div>
              </div>

              {/* Card: Nigeria vs Ecuador */}
              <div className="flex-shrink-0 w-52 rounded-2xl bg-gradient-to-br from-green-700 to-gray-900 border border-green-400/40 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={()=>setMainTab("fixtures")}>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-green-300/70 uppercase tracking-wider mb-1.5">⚽ Group H · 14 Jun</div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Fl iso="NG" size={32}/>
                    <div><p className="text-sm font-extrabold text-white">Nigeria</p><p className="text-[10px] text-green-200/70">vs Ecuador</p></div>
                    <Fl iso="EC" size={24} className="ml-auto"/>
                  </div>
                  <FcOdds matchId="m09" home="Nigeria" away="Ecuador" league="FIFA World Cup 2026 — Group H" time="16:00"
                    bets={[{l:"1",v:"2.60",type:"home",label:"Nigeria to win"},{l:"X",v:"3.10",type:"draw",label:"Draw"},{l:"2",v:"2.80",type:"away",label:"Ecuador to win"}]}/>
                </div>
              </div>

              {/* Card: Golden Boot */}
              <div className="flex-shrink-0 w-48 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-500/30 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={()=>{setMainTab("outrights");setOTab("scorer");}}>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-yellow-400/70 uppercase tracking-wider mb-1.5">⚽ Golden Boot</div>
                  <p className="text-sm font-extrabold text-white mb-2">Top Scorer 2026</p>
                  {[{iso:"FR",name:"Mbappé",odds:"4.50"},{iso:"NO",name:"Haaland",odds:"5.50"},{iso:"AR",name:"Messi",odds:"6.00"},{iso:"NG",name:"Osimhen",odds:"10.00"}].map(p=>(
                    <button key={p.iso} onClick={e=>{e.stopPropagation();addO(`fc-gs-${p.iso}`,`${p.name} — Golden Boot`,p.odds,"Golden Boot");}}
                      className="flex items-center justify-between w-full bg-white/5 hover:bg-white/10 rounded-lg px-2 py-1 mb-1 transition-colors">
                      <span className="flex items-center gap-1.5"><Fl iso={p.iso} size={18}/><span className="text-xs text-white/90">{p.name}</span></span>
                      <span className="text-xs font-bold text-yellow-400">{p.odds}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card: Spain vs Morocco */}
              <div className="flex-shrink-0 w-52 rounded-2xl bg-gradient-to-br from-red-800 to-green-900 border border-red-400/30 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={()=>setMainTab("fixtures")}>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-red-300/70 uppercase tracking-wider mb-1.5">⚽ Group B · 12 Jun</div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Fl iso="ES" size={32}/>
                    <div><p className="text-sm font-extrabold text-white">Spain</p><p className="text-[10px] text-red-200/70">vs Morocco</p></div>
                    <Fl iso="MA" size={24} className="ml-auto"/>
                  </div>
                  <FcOdds matchId="m03" home="Spain" away="Morocco" league="FIFA World Cup 2026 — Group B" time="16:00"
                    bets={[{l:"1",v:"1.88",type:"home",label:"Spain to win"},{l:"X",v:"3.40",type:"draw",label:"Draw"},{l:"2",v:"4.30",type:"away",label:"Morocco to win"}]}/>
                </div>
              </div>

              {/* Card: Morocco to SF */}
              <div className="flex-shrink-0 w-44 rounded-2xl bg-gradient-to-br from-red-900 to-green-800 border border-red-400/30 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={()=>{setMainTab("outrights");setOTab("africa");}}>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-red-300/70 uppercase tracking-wider mb-1">🌍 Africa Bet</div>
                  <Fl iso="MA" size={44} className="mb-1.5"/>
                  <p className="text-sm font-extrabold text-white mb-1.5">Morocco<br/>Semi-Final</p>
                  <button onClick={e=>{e.stopPropagation();addO("fc-mor-sf","Morocco to reach Semi-Finals","5.50","Africa Special");}}
                    className="w-full bg-black/30 hover:bg-black/50 rounded-lg px-2 py-1.5 transition-colors text-left">
                    <p className="text-[9px] text-red-200/70">To reach Semi-Final</p>
                    <p className="text-xl font-extrabold text-amber-400">5.50</p>
                  </button>
                </div>
              </div>

              {/* Card: France vs Uruguay */}
              <div className="flex-shrink-0 w-52 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 border border-blue-400/30 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={()=>setMainTab("fixtures")}>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-blue-300/70 uppercase tracking-wider mb-1.5">⚽ Group E · 13 Jun</div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Fl iso="FR" size={32}/>
                    <div><p className="text-sm font-extrabold text-white">France</p><p className="text-[10px] text-blue-200/70">vs Uruguay</p></div>
                    <Fl iso="UY" size={24} className="ml-auto"/>
                  </div>
                  <FcOdds matchId="m06" home="France" away="Uruguay" league="FIFA World Cup 2026 — Group E" time="16:00"
                    bets={[{l:"1",v:"1.80",type:"home",label:"France to win"},{l:"X",v:"3.45",type:"draw",label:"Draw"},{l:"2",v:"4.50",type:"away",label:"Uruguay to win"}]}/>
                </div>
              </div>

              {/* Card: Nigeria to QF */}
              <div className="flex-shrink-0 w-44 rounded-2xl bg-gradient-to-br from-green-700 to-gray-900 border border-green-400/30 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={()=>{setMainTab("outrights");setOTab("africa");}}>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-green-300/70 uppercase tracking-wider mb-1">🌍 Nigeria</div>
                  <Fl iso="NG" size={44} className="mb-1.5"/>
                  <p className="text-sm font-extrabold text-white mb-1.5">Super Eagles<br/>to QF</p>
                  <button onClick={e=>{e.stopPropagation();addO("fc-nga-qf","Nigeria to reach Quarter-Finals","3.20","Africa Special");}}
                    className="w-full bg-black/30 hover:bg-black/50 rounded-lg px-2 py-1.5 transition-colors text-left">
                    <p className="text-[9px] text-green-200/70">To reach Quarter-Finals</p>
                    <p className="text-xl font-extrabold text-green-300">3.20</p>
                  </button>
                </div>
              </div>

              {/* Card: England vs Serbia */}
              <div className="flex-shrink-0 w-52 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-800 border border-indigo-400/30 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={()=>setMainTab("fixtures")}>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-wider mb-1.5">⚽ Group G · 13 Jun</div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Fl iso="GB" size={32}/>
                    <div><p className="text-sm font-extrabold text-white">England</p><p className="text-[10px] text-indigo-200/70">vs Serbia</p></div>
                    <Fl iso="RS" size={24} className="ml-auto"/>
                  </div>
                  <FcOdds matchId="m08" home="England" away="Serbia" league="FIFA World Cup 2026 — Group G" time="22:00"
                    bets={[{l:"1",v:"1.65",type:"home",label:"England to win"},{l:"X",v:"3.70",type:"draw",label:"Draw"},{l:"2",v:"5.10",type:"away",label:"Serbia to win"}]}/>
                </div>
              </div>

              {/* Card: Acca Boost */}
              <div className="flex-shrink-0 w-44 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-700 border border-orange-400/30 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={()=>setMainTab("fixtures")}>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-orange-200/70 uppercase tracking-wider mb-1">🚀 Promo</div>
                  <p className="text-sm font-extrabold text-white mb-1">Acca Boost<br/>Up to +100%</p>
                  <p className="text-[11px] text-orange-200/80 mb-2">Add 5+ World Cup bets for a bonus on winnings</p>
                  <div className="text-2xl font-black text-white">+100%</div>
                  <p className="text-[9px] text-orange-200/50 mt-1">on 20+ selections</p>
                </div>
              </div>

              {/* Card: Live Betting */}
              <div className="flex-shrink-0 w-44 rounded-2xl bg-gradient-to-br from-red-700 to-rose-900 border border-red-400/30 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={()=>navigate("/live")}>
                <div className="p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"/>
                    <div className="text-[10px] font-bold text-red-300/70 uppercase tracking-wider">Live Now</div>
                  </div>
                  <p className="text-sm font-extrabold text-white mb-1">In-Play<br/>Betting</p>
                  <p className="text-[11px] text-red-200/80 mb-2">Bet live on all 104 World Cup matches in real-time</p>
                  <div className="text-2xl">📺</div>
                  <p className="text-[9px] text-red-200/50 mt-1">Real-time odds updates</p>
                </div>
              </div>

            </div>
          </div>

          {/* ══ HOST CITIES STORY ══ */}
          <div className="px-3 md:px-4 mt-4 mb-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary"/>
                <span className="text-sm font-bold">Host Cities & Venues</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">3 Nations · 11 Cities · 16 Stadiums</Badge>
              </div>
            </div>
            <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"/>
              <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {CITIES.map((c,i)=>(
                  <div key={i} className={`flex-shrink-0 w-44 rounded-xl overflow-hidden bg-gradient-to-br ${c.grad} border border-white/10 cursor-pointer hover:scale-[1.02] transition-transform`}>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Fl iso={c.iso} size={30}/>
                        {c.badge&&<span className="text-[9px] font-bold text-yellow-300 bg-black/30 px-1.5 py-0.5 rounded-full">{c.badge}</span>}
                      </div>
                      <p className="text-sm font-extrabold text-white leading-tight mb-0.5">{c.city}</p>
                      <p className="text-[10px] text-white/60 leading-tight mb-2">{c.stadium}</p>
                      <div className="flex justify-between text-center">
                        <div>
                          <div className="text-sm font-bold text-primary">{c.games}</div>
                          <div className="text-[9px] text-white/50">Matches</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-primary">{c.cap}</div>
                          <div className="text-[9px] text-white/50">Capacity</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ TOURNAMENT HEADER BAR ══ */}
          <div className="bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 px-4 md:px-6 py-3 mt-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <h1 className="text-sm md:text-base font-bold text-white leading-tight">International FIFA World Cup 2026</h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Fl iso="US" size={14}/><Fl iso="MX" size={14}/><Fl iso="CA" size={14}/>
                    <span className="text-yellow-100 text-[10px]">USA · Mexico · Canada</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-center">
                {[{val:"51",label:"Days"},{val:"48",label:"Teams"},{val:"104",label:"Matches"},{val:"9",label:"Africa 🌍"}].map(s=>(
                  <div key={s.label}>
                    <div className="text-lg font-bold text-white leading-none">{s.val}</div>
                    <div className="text-[10px] text-yellow-100">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ MAIN TABS ══ */}
          <div className="flex border-b border-border bg-card sticky top-0 z-10">
            {(["fixtures","outrights","groups","news"] as MainTab[]).map(t=>(
              <button key={t} onClick={()=>setMainTab(t)}
                className={`px-4 md:px-5 py-2.5 text-xs font-semibold transition-colors border-b-2 ${mainTab===t?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t==="fixtures"?"Matches":t==="outrights"?"Outrights":t==="groups"?"Groups":"News"}
              </button>
            ))}
          </div>

          <div className="px-3 md:px-4 py-3">

            {/* ── FIXTURES ── */}
            {mainTab==="fixtures"&&(
              <div>
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {(["3way","dc","ggng","dnb"] as MarketType[]).map(m=>(
                    <button key={m} onClick={()=>setMarket(m)}
                      className={`px-3 py-1 text-[11px] font-semibold rounded border transition-colors ${market===m?"bg-primary text-primary-foreground border-primary":"bg-muted text-muted-foreground border-border hover:border-primary/50"}`}>
                      {m==="3way"&&"3 Way & O/U"}{m==="dc"&&"Double Chance"}{m==="ggng"&&"GG / NG"}{m==="dnb"&&"Draw No Bet"}
                    </button>
                  ))}
                </div>
                {SCHEDULE.map(({day,matches})=>(
                  <div key={day} className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{day}</span>
                      <span className="text-[10px] text-muted-foreground/50">· {matches.length} matches</span>
                    </div>
                    <div className="border border-border rounded-xl overflow-hidden bg-card">
                      <ColH/>
                      {matches.map(m=><MRow key={m.id} m={m}/>)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── OUTRIGHTS ── */}
            {mainTab==="outrights"&&(
              <div>
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {(["winner","scorer","africa"] as OTab[]).map(t=>(
                    <button key={t} onClick={()=>setOTab(t)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded border transition-colors ${oTab===t?"bg-primary text-primary-foreground border-primary":"bg-muted text-muted-foreground border-border hover:border-primary/50"}`}>
                      {t==="winner"&&"🏆 Tournament Winner"}{t==="scorer"&&"⚽ Golden Boot"}{t==="africa"&&"🌍 Africa Specials"}
                    </button>
                  ))}
                </div>

                {oTab==="winner"&&(
                  <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <div className="px-4 py-3 border-b border-border/60 bg-muted/30 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary"/><span className="text-sm font-bold">World Cup Winner</span>
                    </div>
                    {WINNERS.map(w=>(
                      <div key={w.id} className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <Fl iso={w.iso} size={28}/>
                          <span className="text-sm font-medium">{w.name}</span>
                          {w.af&&<Badge className="bg-green-700/80 text-[9px] px-1 py-0 border-0">🌍 Africa</Badge>}
                        </div>
                        <button onClick={()=>addO(w.id,w.name,w.odds,"Tournament Winner")}
                          className="min-w-[68px] h-8 px-3 rounded bg-muted hover:bg-primary/15 hover:border-primary border border-transparent text-xs font-bold text-primary transition-all active:scale-95">
                          {w.odds}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {oTab==="scorer"&&(
                  <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <div className="px-4 py-3 border-b border-border/60 bg-muted/30 flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary"/><span className="text-sm font-bold">Golden Boot — Top Scorer</span>
                    </div>
                    {TOP_SCORERS.map(p=>(
                      <div key={p.id} className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <Fl iso={p.iso} size={28}/>
                          <div><p className="text-sm font-medium leading-tight">{p.player}</p><p className="text-[10px] text-muted-foreground">{p.country}</p></div>
                        </div>
                        <button onClick={()=>addO(p.id,`${p.player} — Golden Boot`,p.odds,"Golden Boot")}
                          className="min-w-[68px] h-8 px-3 rounded bg-muted hover:bg-primary/15 hover:border-primary border border-transparent text-xs font-bold text-primary transition-all active:scale-95">
                          {p.odds}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {oTab==="africa"&&(
                  <>
                    <div className="rounded-xl bg-gradient-to-r from-green-900/60 to-green-700/30 border border-green-600/30 p-4 mb-3 flex items-center gap-4">
                      <span className="text-4xl flex-shrink-0">🌍</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm mb-0.5">Africa Rising at World Cup 2026</h3>
                        <p className="text-[11px] text-green-200/80 mb-2">9 African nations — more than ever before</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {[["NG","Nigeria"],["MA","Morocco"],["SN","Senegal"],["EG","Egypt"],["CM","Cameroon"],["DZ","Algeria"],["TN","Tunisia"],["GH","Ghana"],["CI","Ivory Coast"]].map(([iso,name])=>(
                            <div key={iso} className="flex flex-col items-center gap-0.5">
                              <Fl iso={iso} size={24}/>
                              <span className="text-[8px] text-green-200/60">{name.split(" ")[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="border border-border rounded-xl overflow-hidden bg-card">
                      <div className="px-4 py-3 border-b border-border/60 bg-muted/30 flex items-center gap-2">
                        <Flame className="h-4 w-4 text-primary"/><span className="text-sm font-bold">Africa Special Markets</span>
                      </div>
                      {AFRICA_BETS.map(s=>(
                        <div key={s.id} className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-primary/5 transition-colors">
                          <span className="text-xs font-medium flex-1 pr-3">{s.label}</span>
                          <button onClick={()=>addO(s.id,s.label,s.odds,"Africa Special")}
                            className="min-w-[68px] h-8 px-3 rounded bg-muted hover:bg-primary/15 hover:border-primary border border-transparent text-xs font-bold text-primary transition-all active:scale-95">
                            {s.odds}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── GROUPS ── */}
            {mainTab==="groups"&&(
              <div>
                <div className="rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 p-4 mb-4 flex items-center gap-4">
                  <span className="text-4xl">🎯</span>
                  <div>
                    <h3 className="font-bold text-sm mb-0.5">World Cup 2026 Group Draw</h3>
                    <p className="text-[11px] text-muted-foreground">12 Groups · 4 Teams Each · Top 2 advance · 32 nations qualify</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={()=>{setMainTab("outrights");setOTab("winner");}} className="text-[10px] font-semibold text-primary border border-primary/30 rounded px-2 py-0.5 hover:bg-primary/10 transition-colors">Bet on Winner</button>
                      <button onClick={()=>{setMainTab("outrights");setOTab("africa");}} className="text-[10px] font-semibold text-green-400 border border-green-500/30 rounded px-2 py-0.5 hover:bg-green-500/10 transition-colors">🌍 Africa Bets</button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {GROUPS.map(g=>(
                    <div key={g.name} className="border border-border rounded-xl overflow-hidden bg-card">
                      <div className="px-3 py-2 bg-muted/40 border-b border-border/60">
                        <span className="text-xs font-bold">{g.name}</span>
                      </div>
                      {g.teams.map((t,idx)=>{
                        const hosts=["USA","Mexico","Canada"];
                        const africans=["Nigeria","Morocco","Senegal","Egypt","Cameroon","Algeria","Tunisia","Ghana","Ivory Coast"];
                        return(
                          <div key={t.n} className="flex items-center gap-2 px-3 py-2 border-b border-border/20 last:border-0 hover:bg-primary/5 transition-colors">
                            <span className="text-[11px] text-muted-foreground/50 w-4">{idx+1}</span>
                            <Fl iso={t.iso} size={24}/>
                            <span className="text-xs font-medium flex-1">{t.n}</span>
                            {hosts.includes(t.n)&&<Badge className="text-[8px] px-1 py-0 bg-blue-600/80 border-0">HOST</Badge>}
                            {africans.includes(t.n)&&<Badge className="text-[8px] px-1 py-0 bg-green-700/80 border-0">🌍</Badge>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {/* African nations panel */}
                <div className="mt-4 border border-green-600/30 rounded-xl overflow-hidden bg-card">
                  <div className="px-4 py-3 border-b border-border/60 bg-green-900/20 flex items-center gap-2">
                    <span className="text-lg">🌍</span>
                    <span className="text-sm font-bold text-green-400">African Nations at World Cup 2026</span>
                    <Badge className="bg-green-700/80 border-0 text-[10px]">9 Teams</Badge>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-9 divide-x divide-border/30">
                    {[{n:"Nigeria",iso:"NG",g:"H"},{n:"Morocco",iso:"MA",g:"B"},{n:"Senegal",iso:"SN",g:"J"},
                      {n:"Egypt",iso:"EG",g:"L"},{n:"Cameroon",iso:"CM",g:"D"},{n:"Algeria",iso:"DZ",g:"C"},
                      {n:"Tunisia",iso:"TN",g:"L"},{n:"Ghana",iso:"GH",g:"K"},{n:"Ivory Coast",iso:"CI",g:"E"}
                    ].map(t=>(
                      <div key={t.n} className="flex flex-col items-center py-3 px-1 hover:bg-primary/5 transition-colors cursor-pointer">
                        <Fl iso={t.iso} size={32} className="mb-1"/>
                        <span className="text-[9px] font-semibold text-center leading-tight">{t.n}</span>
                        <span className="text-[9px] text-muted-foreground mt-0.5">Group {t.g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── NEWS ── */}
            {mainTab==="news"&&(
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                  {[{icon:"🏆",val:"48",label:"Teams"},{icon:"⚽",val:"104",label:"Matches"},{icon:"🏟️",val:"16",label:"Stadiums"},{icon:"💰",val:"$1B+",label:"Prize Pool"},
                    {icon:"🌍",val:"9",label:"African Nations"},{icon:"📅",val:"39",label:"Days"},{icon:"🌎",val:"3",label:"Host Nations"},{icon:"🏙️",val:"11",label:"Host Cities"}
                  ].map(s=>(
                    <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-lg font-bold text-primary leading-none">{s.val}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                  <div className="px-4 py-3 border-b border-border/60 bg-muted/30 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary"/><span className="text-sm font-bold">World Cup 2026 News</span>
                  </div>
                  {NEWS.map((n,i)=>(
                    <div key={i} className="flex items-start gap-3 px-4 py-3.5 border-b border-border/30 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer group">
                      <Fl iso={n.iso} size={28} className="mt-0.5 flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground mb-1 leading-tight group-hover:text-primary transition-colors">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{n.excerpt}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">{n.time}</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary/50 flex-shrink-0 mt-1"/>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
        <BetSlip className="hidden md:flex"/>
      </div>
    </div>
  );
};

export default WorldCup;
