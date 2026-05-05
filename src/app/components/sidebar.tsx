import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, LayoutDashboard, LogOut, Settings, User, Wallet } from 'lucide-react'

interface SidebarProps {
  onLogout: () => void
  userEmail?: string
  userName?: string
  userKanton?: string
  variantCount?: number
}

export function Sidebar({ onLogout, userEmail, userName, userKanton, variantCount = 0 }: SidebarProps) {
  const location = useLocation()

  const mainItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/varianten', label: 'Varianten', icon: Wallet },
    { path: '/app/profil', label: 'Profil', icon: User },
    { path: '/wissen', label: 'Wissen', icon: BookOpen },
  ]

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : 'FP'

  const displayName = userName || userEmail || 'Mein Konto'
  const subtitle = [userKanton ? `Kt. ${userKanton}` : null, variantCount > 0 ? `${variantCount} Variante${variantCount !== 1 ? 'n' : ''}` : null].filter(Boolean).join(' · ')

  return (
    <aside
      className="flex flex-col border-r border-border"
      style={{ background: 'var(--bg-elev)', width: 240, minHeight: '100vh', padding: '24px 16px' }}
    >
      {/* Brand */}
      <Link to="/app/dashboard" className="flex items-center gap-2.5 px-2.5 pb-6" style={{ textDecoration: 'none' }}>
        <div
          className="grid place-items-center rounded-lg text-sm font-bold"
          style={{ width: 28, height: 28, background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          F
        </div>
        <span className="text-base font-semibold tracking-tight text-foreground">Finplan</span>
      </Link>

      {/* Nav group: Planung */}
      <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--fg-dim)' }}>
        Planung
      </p>
      {mainItems.slice(0, 3).map((item) => {
        const Icon = item.icon
        const active = location.pathname === item.path || (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path))
        return (
          <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            <div
              className={`relative flex items-center gap-3 rounded-[10px] px-2.5 py-2 text-sm transition-all ${
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              style={active ? { background: 'var(--card)' } : {}}
            >
              {active && (
                <span
                  className="absolute rounded-sm"
                  style={{ left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 16, background: 'var(--primary)' }}
                />
              )}
              <Icon size={16} className="shrink-0" />
              <span>{item.label}</span>
            </div>
          </Link>
        )
      })}

      {/* Nav group: Wissen */}
      <p className="mb-1.5 mt-4 px-2.5 text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--fg-dim)' }}>
        Ressourcen
      </p>
      {mainItems.slice(3).map((item) => {
        const Icon = item.icon
        const active = location.pathname === item.path
        return (
          <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            <div
              className={`relative flex items-center gap-3 rounded-[10px] px-2.5 py-2 text-sm transition-all ${
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              style={active ? { background: 'var(--card)' } : {}}
            >
              {active && (
                <span
                  className="absolute rounded-sm"
                  style={{ left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 16, background: 'var(--primary)' }}
                />
              )}
              <Icon size={16} className="shrink-0" />
              <span>{item.label}</span>
            </div>
          </Link>
        )
      })}

      {/* Nav group: Konto */}
      <p className="mb-1.5 mt-4 px-2.5 text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--fg-dim)' }}>
        Konto
      </p>
      <Link to="/app/einstellungen" style={{ textDecoration: 'none' }}>
        <div
          className={`relative flex items-center gap-3 rounded-[10px] px-2.5 py-2 text-sm transition-all ${
            location.pathname === '/app/einstellungen' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
          style={location.pathname === '/app/einstellungen' ? { background: 'var(--card)' } : {}}
        >
          {location.pathname === '/app/einstellungen' && (
            <span
              className="absolute rounded-sm"
              style={{ left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 16, background: 'var(--primary)' }}
            />
          )}
          <Settings size={16} className="shrink-0" />
          <span>Einstellungen</span>
        </div>
      </Link>

      {/* User footer */}
      <div
        className="mt-auto flex items-center gap-2.5"
        style={{
          borderTop: '1px solid var(--border)',
          margin: 'auto -16px -24px -16px',
          padding: '16px 26px',
        }}
      >
        <div
          className="grid shrink-0 place-items-center rounded-full text-xs font-semibold"
          style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #7aa6ff, #c4f25a)',
            color: '#0a0c10',
          }}
        >
          {initials}
        </div>
        <div className="flex min-w-0 flex-col" style={{ lineHeight: 1.25 }}>
          <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
          {subtitle ? <span className="truncate text-[11px]" style={{ color: 'var(--fg-dim)' }}>{subtitle}</span> : null}
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="ml-auto shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          title="Abmelden"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
