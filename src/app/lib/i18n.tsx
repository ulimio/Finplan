import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const SETTINGS_STORAGE_KEY = 'finplan.settings'

export type AppLanguage = 'de-CH' | 'en' | 'fr-CH' | 'it-CH'

type LanguageContextValue = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function loadStoredLanguage(): AppLanguage {
  if (typeof window === 'undefined') {
    return 'de-CH'
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return 'de-CH'

    const parsed = JSON.parse(raw)
    return parsed.language === 'en' || parsed.language === 'fr-CH' || parsed.language === 'it-CH'
      ? parsed.language
      : 'de-CH'
  } catch {
    return 'de-CH'
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(loadStoredLanguage)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ language }))
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(() => ({ language, setLanguage }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider.')
  }

  return context
}

export const LANGUAGE_OPTIONS: Array<{ value: AppLanguage; label: string }> = [
  { value: 'de-CH', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'fr-CH', label: 'Français' },
  { value: 'it-CH', label: 'Italiano' },
]

export const chromeCopy = {
  'de-CH': {
    nav: {
      dashboard: 'Dashboard',
      variants: 'Varianten',
      profile: 'Profil',
      knowledge: 'Wissen',
      home: 'Start',
      demo: 'Demo',
      settings: 'Einstellungen',
      signOut: 'Abmelden',
      signIn: 'Anmelden',
    },
    loginPage: {
      badge: 'Persönlicher Finanzarbeitsplatz',
      title: 'Melde dich an, um dein Profil, deine Varianten und deinen Fortschritt zu speichern.',
      body: 'Die öffentliche Website bleibt frei zugänglich. Der Login schützt nur deine persönlichen Daten und deine individuelle Planung.',
      loading: 'Lade Anwendung...',
    },
    authForm: {
      title: 'Anmelden oder registrieren',
      body: 'Mit Login werden dein Profil und deine Varianten gespeichert.',
      email: 'E-Mail',
      password: 'Passwort',
      signIn: 'Einloggen',
      signUp: 'Registrieren',
      signUpSuccess: 'Registrierung erfolgreich. Prüfe gegebenenfalls deine E-Mail.',
      signInSuccess: 'Login erfolgreich.',
    },
    settings: {
      title: 'Einstellungen',
      body: 'Verwalte Sprache, Session und deine gespeicherten Account-Daten.',
      languageCard: 'Sprache & Anzeige',
      languageLabel: 'Anzeigesprache',
      languageHint: 'Die Auswahl wird auf diesem Gerät gespeichert. Die Oberfläche aktualisiert sich direkt.',
      accountCard: 'Account',
      emailLabel: 'Angemeldete E-Mail',
      noEmail: 'Keine E-Mail verfügbar',
      signOut: 'Abmelden',
      deleteCard: 'Konto löschen',
      deleteWarningTitle: 'Diese Aktion löscht deinen FinPlan-Account inklusive Profil, Varianten und Login.',
      deleteWarningBody: 'Nach erfolgreicher Löschung kannst du dich mit derselben E-Mail und demselben Passwort nicht mehr anmelden.',
      deleteConfirm: 'Willst du deinen Account wirklich löschen? Profil, Varianten und Login werden entfernt. Diese Aktion kann nicht rückgängig gemacht werden.',
      deleting: 'Lösche Account...',
      deleteAction: 'Account löschen',
      deleteSuccess: 'Dein Account wurde gelöscht.',
      deleteFailed: 'Löschen fehlgeschlagen.',
      deleteAccountFailed: 'Account-Löschung fehlgeschlagen.',
    },
  },
  en: {
    nav: {
      dashboard: 'Dashboard',
      variants: 'Scenarios',
      profile: 'Profile',
      knowledge: 'Knowledge',
      home: 'Home',
      demo: 'Demo',
      settings: 'Settings',
      signOut: 'Sign out',
      signIn: 'Sign in',
    },
    loginPage: {
      badge: 'Personal finance workspace',
      title: 'Sign in to save your profile, your scenarios and your progress.',
      body: 'The public website remains accessible. Login only protects your personal data and your individual planning.',
      loading: 'Loading application...',
    },
    authForm: {
      title: 'Sign in or register',
      body: 'With login, your profile and scenarios are stored.',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign in',
      signUp: 'Register',
      signUpSuccess: 'Registration successful. Please check your email if needed.',
      signInSuccess: 'Login successful.',
    },
    settings: {
      title: 'Settings',
      body: 'Manage language, session and your stored account data.',
      languageCard: 'Language & Display',
      languageLabel: 'Display language',
      languageHint: 'Your choice is stored on this device. The interface updates immediately.',
      accountCard: 'Account',
      emailLabel: 'Signed-in email',
      noEmail: 'No email available',
      signOut: 'Sign out',
      deleteCard: 'Delete account',
      deleteWarningTitle: 'This action deletes your FinPlan account including profile, scenarios and login.',
      deleteWarningBody: 'After successful deletion, you will no longer be able to sign in with the same email and password.',
      deleteConfirm: 'Do you really want to delete your account? Profile, scenarios and login will be removed. This action cannot be undone.',
      deleting: 'Deleting account...',
      deleteAction: 'Delete account',
      deleteSuccess: 'Your account was deleted.',
      deleteFailed: 'Deletion failed.',
      deleteAccountFailed: 'Account deletion failed.',
    },
  },
  'fr-CH': {
    nav: {
      dashboard: 'Tableau de bord',
      variants: 'Scénarios',
      profile: 'Profil',
      knowledge: 'Connaissances',
      home: 'Accueil',
      demo: 'Démo',
      settings: 'Paramètres',
      signOut: 'Se déconnecter',
      signIn: 'Se connecter',
    },
    loginPage: {
      badge: 'Espace financier personnel',
      title: 'Connectez-vous pour enregistrer votre profil, vos scénarios et votre progression.',
      body: 'Le site public reste accessible. La connexion protège uniquement vos données personnelles et votre planification individuelle.',
      loading: "Chargement de l'application...",
    },
    authForm: {
      title: 'Se connecter ou créer un compte',
      body: 'Avec une connexion, votre profil et vos scénarios sont enregistrés.',
      email: 'E-mail',
      password: 'Mot de passe',
      signIn: 'Se connecter',
      signUp: "S'inscrire",
      signUpSuccess: 'Inscription réussie. Vérifiez votre e-mail si nécessaire.',
      signInSuccess: 'Connexion réussie.',
    },
    settings: {
      title: 'Paramètres',
      body: 'Gérez la langue, la session et les données enregistrées de votre compte.',
      languageCard: 'Langue et affichage',
      languageLabel: "Langue d'affichage",
      languageHint: "Votre choix est enregistré sur cet appareil. L'interface se met à jour immédiatement.",
      accountCard: 'Compte',
      emailLabel: 'E-mail connecté',
      noEmail: 'Aucun e-mail disponible',
      signOut: 'Se déconnecter',
      deleteCard: 'Supprimer le compte',
      deleteWarningTitle: 'Cette action supprime votre compte FinPlan, y compris le profil, les scénarios et la connexion.',
      deleteWarningBody: "Après la suppression, vous ne pourrez plus vous connecter avec la même adresse e-mail et le même mot de passe.",
      deleteConfirm: 'Voulez-vous vraiment supprimer votre compte ? Le profil, les scénarios et la connexion seront supprimés. Cette action est irréversible.',
      deleting: 'Suppression du compte...',
      deleteAction: 'Supprimer le compte',
      deleteSuccess: 'Votre compte a été supprimé.',
      deleteFailed: 'La suppression a échoué.',
      deleteAccountFailed: 'La suppression du compte a échoué.',
    },
  },
  'it-CH': {
    nav: {
      dashboard: 'Dashboard',
      variants: 'Scenari',
      profile: 'Profilo',
      knowledge: 'Conoscenza',
      home: 'Home',
      demo: 'Demo',
      settings: 'Impostazioni',
      signOut: 'Esci',
      signIn: 'Accedi',
    },
    loginPage: {
      badge: 'Spazio finanziario personale',
      title: 'Accedi per salvare il tuo profilo, i tuoi scenari e i tuoi progressi.',
      body: 'Il sito pubblico rimane accessibile. Il login protegge solo i tuoi dati personali e la tua pianificazione individuale.',
      loading: "Caricamento dell'applicazione...",
    },
    authForm: {
      title: 'Accedi o registrati',
      body: 'Con il login, il tuo profilo e i tuoi scenari vengono salvati.',
      email: 'E-mail',
      password: 'Password',
      signIn: 'Accedi',
      signUp: 'Registrati',
      signUpSuccess: "Registrazione riuscita. Se necessario, controlla la tua e-mail.",
      signInSuccess: 'Accesso riuscito.',
    },
    settings: {
      title: 'Impostazioni',
      body: 'Gestisci lingua, sessione e dati salvati del tuo account.',
      languageCard: 'Lingua e visualizzazione',
      languageLabel: 'Lingua di visualizzazione',
      languageHint: "La scelta viene salvata su questo dispositivo. L'interfaccia si aggiorna subito.",
      accountCard: 'Account',
      emailLabel: 'E-mail registrata',
      noEmail: 'Nessuna e-mail disponibile',
      signOut: 'Esci',
      deleteCard: 'Elimina account',
      deleteWarningTitle: "Questa azione elimina il tuo account FinPlan, inclusi profilo, scenari e accesso.",
      deleteWarningBody: "Dopo l'eliminazione non potrai più accedere con lo stesso indirizzo e-mail e la stessa password.",
      deleteConfirm: "Vuoi davvero eliminare il tuo account? Profilo, scenari e accesso verranno rimossi. Questa azione non può essere annullata.",
      deleting: "Eliminazione dell'account...",
      deleteAction: 'Elimina account',
      deleteSuccess: 'Il tuo account è stato eliminato.',
      deleteFailed: "Eliminazione non riuscita.",
      deleteAccountFailed: "Eliminazione dell'account non riuscita.",
    },
  },
} as const

export const publicHomeCopy = {
  'de-CH': {
    badge: 'Finanzplanung für die Schweiz, verständlich gemacht',
    heroTitle: 'Weniger Unsicherheit. Mehr Überblick. Ein Finanzplan, der mit deinem Leben mitgeht.',
    heroBody:
      'FinPlan hilft dir, deine finanzielle Situation sauber zu erfassen, Varianten zu vergleichen und bessere Entscheidungen zu treffen. Die Planung bleibt anpassbar, wenn sich dein Leben verändert, und soll dich langfristig bei wichtigen Finanzaufgaben begleiten. Ohne Beratungssprache und ohne Tool-Chaos.',
    ctaPrimary: 'Jetzt starten',
    ctaSecondary: 'Demo ansehen',
  },
  en: {
    badge: 'Financial planning for Switzerland, made understandable',
    heroTitle: 'Less uncertainty. More clarity. A financial plan that moves with your life.',
    heroBody:
      'FinPlan helps you capture your financial situation clearly, compare scenarios and make better decisions. Your plan stays flexible when life changes and is designed to support you over time with important financial tasks.',
    ctaPrimary: 'Get started',
    ctaSecondary: 'View demo',
  },
  'fr-CH': {
    badge: 'Planification financière pour la Suisse, rendue compréhensible',
    heroTitle: 'Moins d’incertitude. Plus de clarté. Un plan financier qui évolue avec votre vie.',
    heroBody:
      'FinPlan vous aide à structurer clairement votre situation financière, à comparer des scénarios et à prendre de meilleures décisions. Le plan reste adaptable lorsque votre vie change et doit vous accompagner durablement dans vos tâches financières importantes.',
    ctaPrimary: 'Commencer',
    ctaSecondary: 'Voir la démo',
  },
  'it-CH': {
    badge: 'Pianificazione finanziaria per la Svizzera, resa comprensibile',
    heroTitle: 'Meno incertezza. Più chiarezza. Un piano finanziario che segue la tua vita.',
    heroBody:
      'FinPlan ti aiuta a strutturare chiaramente la tua situazione finanziaria, confrontare scenari e prendere decisioni migliori. Il piano resta adattabile quando la vita cambia ed è pensato per accompagnarti nel tempo nelle attività finanziarie importanti.',
    ctaPrimary: 'Inizia ora',
    ctaSecondary: 'Guarda la demo',
  },
} as const
