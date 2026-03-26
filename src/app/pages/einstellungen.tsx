import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { AlertTriangle, Globe, LogOut, Mail, ShieldAlert, Trash2, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/card'
import { Select } from '../components/select'
import { Button } from '../components/button'
import { supabase } from '../../lib/supabase'

const SETTINGS_STORAGE_KEY = 'finplan.settings'

const LANGUAGE_OPTIONS = [
  { value: 'de-CH', label: 'Deutsch (Schweiz)' },
  { value: 'en', label: 'English' },
  { value: 'fr-CH', label: 'Français (Suisse)' },
  { value: 'it-CH', label: 'Italiano (Svizzera)' },
]

function getProfileStorageKey(userId?: string) {
  return `finplan.profil.${userId ?? 'guest'}`
}

function getVariantenStorageKey(userId?: string) {
  return `finplan.varianten.${userId ?? 'guest'}`
}

function loadLanguageSetting() {
  if (typeof window === 'undefined') {
    return 'de-CH'
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return 'de-CH'

    const parsed = JSON.parse(raw)
    return typeof parsed.language === 'string' ? parsed.language : 'de-CH'
  } catch {
    return 'de-CH'
  }
}

function clearStoredUserData(userId: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(getProfileStorageKey(userId))
  window.localStorage.removeItem(getVariantenStorageKey(userId))
  window.localStorage.removeItem(getProfileStorageKey())
  window.localStorage.removeItem(getVariantenStorageKey())
}

export function Einstellungen({
  session,
  onLogout,
}: {
  session: Session
  onLogout: () => Promise<void>
}) {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(loadLanguageSetting)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const userId = session.user.id

  const email = useMemo(() => session.user.email ?? 'Keine E-Mail verfuegbar', [session.user.email])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ language }))
    document.documentElement.lang = language
  }, [language])

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Willst du deinen Account wirklich loeschen? Profil, Varianten und Login werden entfernt. Diese Aktion kann nicht rueckgaengig gemacht werden.'
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setMessage('')

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(typeof payload?.error === 'string' ? payload.error : 'Account-Loeschung fehlgeschlagen.')
      }

      clearStoredUserData(userId)
      window.localStorage.removeItem(SETTINGS_STORAGE_KEY)
      setMessage('Dein Account wurde geloescht.')
      await onLogout()
      navigate('/login', { replace: true })
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : 'Loeschen fehlgeschlagen.'
      setMessage(nextMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl text-foreground">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalte Sprache, Session und deine gespeicherten Account-Daten.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Sprache & Anzeige</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Anzeigesprache"
              value={language}
              onChange={setLanguage}
              options={LANGUAGE_OPTIONS}
            />
            <p className="text-sm text-muted-foreground">
              Die Auswahl wird auf diesem Geraet gespeichert. Die Oberflaeche verwendet die Einstellung fuer Anzeige und Browser-Sprache.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                Angemeldete E-Mail
              </div>
              <p className="mt-2 text-foreground">{email}</p>
            </div>

            <Button variant="outline" onClick={() => void onLogout()} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <CardTitle>Konto loeschen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
                <div className="space-y-2 text-sm">
                  <p className="text-foreground">
                    Diese Aktion loescht deinen FinPlan-Account inklusive Profil, Varianten und Login.
                  </p>
                  <p className="text-muted-foreground">
                    Nach erfolgreicher Loeschung kannst du dich mit derselben E-Mail und demselben Passwort nicht mehr anmelden.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => void handleDeleteAccount()}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Loesche Account...' : 'Account loeschen'}
            </Button>

            {message && (
              <p className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground">
                {message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
