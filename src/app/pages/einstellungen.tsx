import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { AlertTriangle, Globe, LogOut, Mail, ShieldAlert, Trash2, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/card'
import { Select } from '../components/select'
import { Button } from '../components/button'
import { LANGUAGE_OPTIONS, chromeCopy, useLanguage } from '../lib/i18n'
import { supabase } from '../../lib/supabase'

function getProfileStorageKey(userId?: string) {
  return `finplan.profil.${userId ?? 'guest'}`
}

function getVariantenStorageKey(userId?: string) {
  return `finplan.varianten.${userId ?? 'guest'}`
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
  const { language, setLanguage } = useLanguage()
  const copy = chromeCopy[language].settings
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const userId = session.user.id

  const email = useMemo(() => session.user.email ?? copy.noEmail, [copy.noEmail, session.user.email])

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(copy.deleteConfirm)

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setMessage('')

    try {
      const { error } = await supabase.rpc('delete_own_account')

      if (error) {
        throw new Error(error.message || copy.deleteAccountFailed)
      }

      clearStoredUserData(userId)
      setMessage(copy.deleteSuccess)

      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' })

      if (signOutError) {
        console.error('Fehler beim lokalen Ausloggen nach Account-Löschung:', signOutError.message)
      }

      navigate('/login', { replace: true })
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : copy.deleteFailed
      setMessage(nextMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl text-foreground">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.body}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>{copy.languageCard}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label={copy.languageLabel}
              value={language}
              onChange={(value) => setLanguage(value as typeof language)}
              options={LANGUAGE_OPTIONS}
            />
            <p className="text-sm text-muted-foreground">{copy.languageHint}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>{copy.accountCard}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {copy.emailLabel}
              </div>
              <p className="mt-2 text-foreground">{email}</p>
            </div>

            <Button variant="outline" onClick={() => void onLogout()} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              {copy.signOut}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <CardTitle>{copy.deleteCard}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
                <div className="space-y-2 text-sm">
                  <p className="text-foreground">{copy.deleteWarningTitle}</p>
                  <p className="text-muted-foreground">{copy.deleteWarningBody}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => void handleDeleteAccount()}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? copy.deleting : copy.deleteAction}
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
