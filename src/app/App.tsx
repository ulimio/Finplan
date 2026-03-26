import React, { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import { Navigation } from './components/navigation'
import { AuthForm } from './components/auth-form'
import { Dashboard } from './pages/dashboard'
import { Profil } from './pages/profil'
import { PublicHome } from './pages/public-home'
import { Varianten } from './pages/varianten'
import { Wissen } from './pages/wissen'
import { supabase } from '../lib/supabase'

function ProtectedRoute({
  session,
  children,
}: {
  session: Session | null
  children: React.ReactNode
}) {
  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function LoginPage({ session }: { session: Session | null }) {
  if (session) {
    return <Navigate to="/app/dashboard" replace />
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm text-primary">
            Persönlicher Finanzarbeitsplatz
          </span>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl leading-tight text-foreground sm:text-5xl">
              Melde dich an, um dein Profil, deine Varianten und deinen Fortschritt zu speichern.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Die öffentliche Website bleibt frei zugänglich. Der Login schützt nur deine persönlichen Daten und deine individuelle Planung.
            </p>
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Fehler beim Laden der Session:', error.message)
      } else {
        setSession(data.session)
      }

      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Fehler beim Ausloggen:', error.message)
      alert('Ausloggen fehlgeschlagen: ' + error.message)
      return
    }

    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-muted-foreground">Lade Anwendung...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isLoggedIn={Boolean(session)} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/demo" element={<Dashboard isLoggedIn={false} />} />
        <Route path="/wissen" element={<Wissen />} />
        <Route path="/login" element={<LoginPage session={session} />} />

        <Route
          path="/app/dashboard"
          element={
            <ProtectedRoute session={session}>
              <Dashboard isLoggedIn={true} userId={session?.user.id ?? ''} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/profil"
          element={
            <ProtectedRoute session={session}>
              <Profil isLoggedIn={true} userId={session?.user.id ?? ''} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/varianten"
          element={
            <ProtectedRoute session={session}>
              <Varianten isLoggedIn={true} userId={session?.user.id ?? ''} />
            </ProtectedRoute>
          }
        />

        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/profil" element={<Navigate to="/app/profil" replace />} />
        <Route path="/varianten" element={<Navigate to="/app/varianten" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
