import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'fr';

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    'nav.home':        'Home',
    'nav.live':        'Live',
    'nav.sports':      'Sports',
    'nav.casino':      'Casino',
    'nav.promotions':  'Promotions',
    'nav.deposit':     'Deposit',
    'nav.withdraw':    'Withdraw',
    'nav.bets':        'My Bets',
    'nav.vip':         'VIP Club',
    'nav.bonuses':     'Bonuses',
    'nav.referral':    'Refer & Earn',
    'nav.kyc':         'Verification',
    'nav.settings':    'Settings',
    'nav.logout':      'Sign Out',
    // Auth
    'auth.login':      'Log In',
    'auth.register':   'Register',
    'auth.email':      'Email',
    'auth.password':   'Password',
    'auth.phone':      'Phone Number',
    // General
    'btn.submit':      'Submit',
    'btn.cancel':      'Cancel',
    'btn.save':        'Save',
    'btn.confirm':     'Confirm',
    'label.balance':   'Balance',
    'label.stake':     'Stake',
    'label.odds':      'Odds',
    'label.potential': 'Potential Win',
    'label.status':    'Status',
    'label.date':      'Date',
    'msg.loading':     'Loading…',
    'msg.no_data':     'Nothing to show',
    // Bet status
    'status.active':   'Running',
    'status.won':      'Won',
    'status.lost':     'Lost',
    'status.void':     'Void',
    'status.cashout':  'Cashed Out',
  },
  fr: {
    // Nav
    'nav.home':        'Accueil',
    'nav.live':        'En Direct',
    'nav.sports':      'Sports',
    'nav.casino':      'Casino',
    'nav.promotions':  'Promotions',
    'nav.deposit':     'Dépôt',
    'nav.withdraw':    'Retrait',
    'nav.bets':        'Mes Paris',
    'nav.vip':         'Club VIP',
    'nav.bonuses':     'Bonus',
    'nav.referral':    'Parrainage',
    'nav.kyc':         'Vérification',
    'nav.settings':    'Paramètres',
    'nav.logout':      'Déconnexion',
    // Auth
    'auth.login':      'Connexion',
    'auth.register':   'S\'inscrire',
    'auth.email':      'E-mail',
    'auth.password':   'Mot de passe',
    'auth.phone':      'Numéro de téléphone',
    // General
    'btn.submit':      'Soumettre',
    'btn.cancel':      'Annuler',
    'btn.save':        'Enregistrer',
    'btn.confirm':     'Confirmer',
    'label.balance':   'Solde',
    'label.stake':     'Mise',
    'label.odds':      'Cote',
    'label.potential': 'Gain potentiel',
    'label.status':    'Statut',
    'label.date':      'Date',
    'msg.loading':     'Chargement…',
    'msg.no_data':     'Aucun résultat',
    // Bet status
    'status.active':   'En cours',
    'status.won':      'Gagné',
    'status.lost':     'Perdu',
    'status.void':     'Nul',
    'status.cashout':  'Cashout',
  },
};

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
}

const LangContext = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  t: (k, f) => f ?? k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const stored = (typeof localStorage !== 'undefined' ? localStorage.getItem('betfuz_lang') : null) as Lang | null;
  const [lang, setLangState] = useState<Lang>(stored ?? 'en');

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('betfuz_lang', l);
  };

  const t = (key: string, fallback?: string): string =>
    TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en?.[key] ?? fallback ?? key;

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
