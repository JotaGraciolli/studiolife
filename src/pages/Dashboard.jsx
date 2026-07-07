import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ClipboardList, DollarSign, CalendarCheck, Activity } from 'lucide-react'
import { supabase } from '../services/supabase'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'

const cards = [
  {
    label: 'Alunos',
    description: 'Gerenciar cadastros',
    icon: Users,
    path: '/clients',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Avaliações',
    description: 'Medidas e avaliações',
    icon: ClipboardList,
    path: '/evaluations',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    label: 'Presença',
    description: 'Lista de presença',
    icon: CalendarCheck,
    path: '/attendance',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Financeiro',
    description: 'Movimentações',
    icon: DollarSign,
    path: '/financial',
    color: 'bg-emerald-50 text-emerald-600',
  },

]

export function Dashboard() {
  const [activeCount, setActiveCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadActiveClients() {
      try {
        const { count, error: supaError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo')

        if (supaError) throw supaError
        setActiveCount(count || 0)
      } catch (err) {
        const detail = err?.message || err?.error_description || JSON.stringify(err)
        setError(`Não foi possível carregar o total de alunos ativos. ${detail}`)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadActiveClients()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-heading)] md:text-3xl">
          SLM - StudioLife Management
        </h1>
        <p className="mt-1 text-sm text-slate-500 md:text-base">
          Gerencie seu estúdio de pilates em um só lugar.
        </p>
      </div>

      <ErrorMessage message={error} />

      <div className="mb-8 rounded-2xl bg-[var(--primary)] p-6 text-white shadow-md md:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-teal-50">Total de alunos ativos</p>
            {loading ? (
              <Loading />
            ) : (
              <p className="text-4xl font-bold md:text-5xl">{activeCount}</p>
            )}
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-[var(--text-heading)]">
        Acesso rápido
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.path}
              to={card.path}
              className="group flex flex-col rounded-xl bg-[var(--surface)] p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}
              >
                <Icon size={24} />
              </div>
              <span className="text-base font-semibold text-[var(--text-heading)]">
                {card.label}
              </span>
              <span className="mt-1 text-sm text-slate-500">{card.description}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
