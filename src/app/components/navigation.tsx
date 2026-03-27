import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  User,
  Wallet,
} from 'lucide-react'
import { Button } from './button'
import { chromeCopy, useLanguage } from '../lib/i18n'

interface NavigationProps {
  isLoggedIn: boolean
  onLogout: () => void
}

export function Navigation({ isLoggedIn, onLogout }: NavigationProps) {
  const { language } = useLanguage()
  const copy = chromeCopy[language].nav
  const location = useLocation()

  const navItems = isLoggedIn
    ? [
        { path: '/app/dashboard', label: copy.dashboard, icon: LayoutDashboard },
        { path: '/app/varianten', label: copy.variants, icon: Wallet },
        { path: '/app/profil', label: copy.profile, icon: User },
        { path: '/wissen', label: copy.knowledge, icon: BookOpen },
      ]
    : [
        { path: '/', label: copy.home, icon: LayoutDashboard },
        { path: '/demo', label: copy.demo, icon: Wallet },
        { path: '/wissen', label: copy.knowledge, icon: BookOpen },
      ]

  const homePath = isLoggedIn ? '/app/dashboard' : '/'

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link to={homePath} className="flex items-center gap-2">
              <Wallet className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold text-primary">FinPlan</span>
            </Link>
            <div className="hidden gap-1 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                to="/app/einstellungen"
                aria-label={copy.settings}
                className={`inline-flex items-center justify-center rounded-lg border border-border p-2 transition-colors ${
                  location.pathname === '/app/einstellungen'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Settings className="h-4 w-4" />
              </Link>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {copy.signOut}
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                {copy.signIn}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
