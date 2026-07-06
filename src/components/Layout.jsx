import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Users,
  ClipboardList,
  DollarSign,
  CalendarCheck,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/clients', label: 'Alunos', icon: Users },
  { path: '/evaluations', label: 'Avaliações', icon: ClipboardList },
  { path: '/financial', label: 'Financeiro', icon: DollarSign },
  { path: '/attendance', label: 'Presença', icon: CalendarCheck },
]

export function Layout({ children }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-[var(--border)] px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <span className="text-sm font-bold">SL</span>
          </div>
          <span className="text-lg font-semibold text-[var(--text-heading)]">
            StudioLife
          </span>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[var(--primary-light)] text-[var(--primary-dark)]'
                        : 'text-[var(--text)] hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="border-t border-[var(--border)] p-4 text-xs text-slate-400">
          StudioLife Pilates
        </div>
      </aside>

      {/* Header mobile */}
      <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <span className="text-sm font-bold">SL</span>
          </div>
          <span className="text-lg font-semibold text-[var(--text-heading)]">
            StudioLife
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-[var(--text)] hover:bg-slate-50"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Menu mobile */}
      {mobileOpen && (
        <nav className="border-b border-[var(--border)] bg-[var(--surface)] px-4 pb-4 md:hidden">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[var(--primary-light)] text-[var(--primary-dark)]'
                        : 'text-[var(--text)] hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      <main className="flex-1 overflow-auto bg-[var(--bg)]">
        <div className="mx-auto max-w-6xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
