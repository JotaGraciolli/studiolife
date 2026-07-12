import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Users,
  ClipboardList,
  DollarSign,
  CalendarCheck,
  Cake,
  Settings,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/clients', label: 'Alunos', icon: Users },
  { path: '/evaluations', label: 'Avaliações', icon: ClipboardList },
  { path: '/financial', label: 'Financeiro', icon: DollarSign },
  { path: '/attendance', label: 'Presença', icon: CalendarCheck },
  { path: '/birthdays', label: 'Aniversariantes', icon: Cake },
  { path: '/settings', label: 'Configurações', icon: Settings },
]

export function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Erro ao sair:', err)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-[var(--border)] px-6">
          <Link to="/" className="flex h-8 w-8 shrink-0 rounded-lg">
            <img
              src="/favicon.svg"
              alt="StudioLife"
              className="h-8 w-8 rounded-lg object-contain"
            />
          </Link>
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
        <div className="border-t border-[var(--border)] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
            <User size={14} />
            <span className="truncate">{user?.email || 'Usuário'}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[var(--danger)]"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Header mobile */}
      <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex h-8 w-8 shrink-0 rounded-lg">
            <img
              src="/favicon.svg"
              alt="StudioLife"
              className="h-8 w-8 rounded-lg object-contain"
            />
          </Link>
          <span className="text-lg font-semibold text-[var(--text-heading)]">
            StudioLife
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-[var(--danger)]"
          >
            <LogOut size={20} />
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-[var(--text)] hover:bg-slate-50"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
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
