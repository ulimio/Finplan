import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from './button'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignUp = async () => {
    setMessage('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Registrierung erfolgreich. Prüfe gegebenenfalls deine E-Mail.')
  }

  const handleSignIn = async () => {
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Login erfolgreich.')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl text-foreground">Anmelden oder registrieren</h2>
        <p className="text-sm text-muted-foreground">
          Mit Login werden dein Profil und deine Varianten gespeichert.
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleSignIn} className="flex-1">
          Einloggen
        </Button>
        <Button variant="outline" onClick={handleSignUp} className="flex-1">
          Registrieren
        </Button>
      </div>

      {message && (
        <p className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
          {message}
        </p>
      )}
    </div>
  )
}
