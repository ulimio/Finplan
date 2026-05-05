import React, { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { Navigation } from './components/navigation'
import { Sidebar } from './components/sidebar'
import { AuthForm } from './components/auth-form'
import { Dashboard } from './pages/dashboard'
import { Profil } from './pages/profil'
import { PublicHome } from './pages/public-home'
import { Varianten } from './pages/varianten'
import { Wissen } from './pages/wissen'
import { Einstellungen } from './pages/einstellungen'
import { LanguageProvider, chromeCopy, useLanguage } from './lib/i18n'
import { ErrorBoundary } from './components/error-boundary'
import { loadStoredProfile } from './lib/finance-data'
import { supabase } from '../lib/supabase'

function ProtectedRoute({ session, children }: { session: Session | null; children: React.ReactNode }) {
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Shell wrapping all /app/* routes with the sidebar. */
function AppShell({
  session,
  onLogout,
  children,
}: {
  session: Session
  onLogout: () => void
  children: React.ReactNode
}) {
  const profile = loadStoredProfile(session.user.id)
  const userName = [profile.vorname, profile.nachname].filter(Boolean).join(' ') || undefined
  const variantCount = (() => {
    try {
      const raw = window.localStorage.getItem(`finplan.varianten.${session.user.id}`)
      return raw ? (JSON.parse(raw) as unknown[]).length : 0
    } catch {
      return 0
    }
  })()

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      <Sidebar
        onLogout={onLogout}
        userEmail={session.user.email}
        userName={userName}
        userKanton={profile.kanton ? profile.kanton.toUpperCase() : undefined}
        variantCount={variantCount}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

function LoginPage({ session }: { session: Session | null }) {
  const { language } = useLanguage()
  const copy = chromeCopy[language].loginPage

  if (session) return <Navigate to="/app/dashboard" replace />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
            style={{ borderColor: 'rgba(196,242,90,0.3)', color: 'var(--primary)', background: 'var(--accent-soft)' }}
          >
            {copy.badge}
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl leading-tight text-foreground sm:text-5xl" style={{ letterSpacing: '-0.03em' }}>
              {copy.title}
            </h1>
            <p className="max-w-lg text-base text-muted-foreground" style={{ lineHeight: 1.7 }}>{copy.body}</p>
          </div>
        </div>
        <div
          className="rounded-2xl border p-8"
          style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
        >
          <AuthForm />
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { language } = useLanguage()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Session error:', error.message)
      else setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) { alert('Ausloggen fehlgeschlagen: ' + error.message); return }
    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--background)' }}>
        <p className="text-muted-foreground">{chromeCopy[language].loginPage.loading}</p>
      </div>
    )
  }

  const isAppRoute = location.pathname.startsWith('/app')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Top navigation only for public routes */}
      {!isAppRoute && (
        <Navigation isLoggedIn={Boolean(session)} onLogout={handleLogout} />
      )}

      <Routes>
        {/* Public */}
        <Route path="/" element={<ErrorBoundary><PublicHome /></ErrorBoundary>} />
        <Route path="/demo" element={<ErrorBoundary><Dashboard isLoggedIn={false} /></ErrorBoundary>} />
        <Route path="/wissen" element={<ErrorBoundary><Wissen /></ErrorBoundary>} />
        <Route path="/login" element={<ErrorBoundary><LoginPage session={session} /></ErrorBoundary>} />

        {/* Protected — wrapped in AppShell (sidebar layout) */}
        <Route
          path="/app/dashboard"
          element={
            <ProtectedRoute session={session}>
              <AppShell session={session!} onLogout={handleLogout}>
                <ErrorBoundary>
                  <Dashboard isLoggedIn={true} userId={session?.user.id ?? ''} />
                </ErrorBoundary>
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/profil"
          element={
            <ProtectedRoute session={session}>
              <AppShell session={session!} onLogout={handleLogout}>
                <ErrorBoundary>
                  <Profil isLoggedIn={true} userId={session?.user.id ?? ''} />
                </ErrorBoundary>
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/varianten"
          element={
            <ProtectedRoute session={session}>
              <AppShell session={session!} onLogout={handleLogout}>
                <ErrorBoundary>
                  <Varianten isLoggedIn={true} userId={session?.user.id ?? ''} />
                </ErrorBoundary>
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/einstellungen"
          element={
            <ProtectedRoute session={session}>
              <AppShell session={session!} onLogout={handleLogout}>
                <ErrorBoundary>
                  <Einstellungen session={session!} onLogout={handleLogout} />
                </ErrorBoundary>
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Legacy redirects */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/profil" element={<Navigate to="/app/profil" replace />} />
        <Route path="/varianten" element={<Navigate to="/app/varianten" replace />} />
        <Route path="/einstellungen" element={<Navigate to="/app/einstellungen" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'var(--background)' }}>
          <div className="max-w-md rounded-2xl border p-8 text-center" style={{ borderColor: 'rgba(255,110,110,0.2)', background: 'rgba(255,110,110,0.05)' }}>
            <p className="text-lg text-foreground">Ein Fehler ist aufgetreten</p>
            <p className="mt-2 text-sm text-muted-foreground">{this.state.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="mt-4 rounded-lg border px-4 py-2 text-sm text-foreground"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  )
}

export default App
