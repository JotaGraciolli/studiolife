import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ClipboardList, DollarSign, CalendarCheck, Cake } from 'lucide-react'
import { supabase } from '../services/supabase'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'

function isBirthdayToday(birthDateString) {
  if (!birthDateString) return false
  const today = new Date()
  const [, month, day] = birthDateString.split('-').map(Number)
  return today.getMonth() + 1 === month && today.getDate() === day
}

function isBirthdayInCurrentWeek(birthDateString) {
  if (!birthDateString) return false
  const [, birthMonth, birthDay] = birthDateString.split('-').map(Number)
  const today = new Date()
  const currentDay = today.getDay()
  const diffToMonday = (currentDay + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - diffToMonday)
  monday.setHours(0, 0, 0, 0)

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    if (date.getMonth() + 1 === birthMonth && date.getDate() === birthDay) {
      return true
    }
  }

  return false
}

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
  {
    label: 'Aniversariantes',
    description: 'Aniversariantes do mês e da semana',
    icon: Cake,
    path: '/birthdays',
    color: 'bg-pink-50 text-pink-600',
  },
]

export function Dashboard() {
  const [activeCount, setActiveCount] = useState(0)
  const [scheduleCounts, setScheduleCounts] = useState({})
  const [birthdayCounts, setBirthdayCounts] = useState({ today: 0, week: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const closingChecked = useRef(false)

  useEffect(() => {
    async function loadDashboard() {
      try {
        await ensureMonthEndClosing()

        const [activeClientsRes, trainingDaysRes] = await Promise.all([
          supabase.from('clients').select('id, birth_date, status'),
          supabase.from('training_days').select('client_id, week_day, training_time'),
        ])

        if (activeClientsRes.error) throw activeClientsRes.error
        if (trainingDaysRes.error) throw trainingDaysRes.error

        const clients = activeClientsRes.data || []
        const activeClients = clients.filter((c) => c.status === 'ativo')
        setActiveCount(activeClients.length)
        setScheduleCounts(buildScheduleCounts(activeClients, trainingDaysRes.data || []))
        const todayCount = clients.filter((c) => isBirthdayToday(c.birth_date)).length
        const weekCount = clients.filter(
          (c) => isBirthdayInCurrentWeek(c.birth_date) && !isBirthdayToday(c.birth_date),
        ).length
        setBirthdayCounts({
          today: todayCount,
          week: weekCount,
        })
      } catch (err) {
        const detail = err?.message || err?.error_description || JSON.stringify(err)
        setError(`Não foi possível carregar os dados do dashboard. ${detail}`)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  function buildScheduleCounts(activeClients, trainingDays) {
    const activeClientIds = new Set(activeClients.map((c) => c.id))
    const weekDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
    const counts = {}
    weekDays.forEach((day) => {
      counts[day] = { manha: 0, tarde: 0 }
    })

    trainingDays.forEach((day) => {
      if (!activeClientIds.has(day.client_id)) return
      if (!counts[day.week_day]) return
      const time = day.training_time ? day.training_time.slice(0, 5) : '00:00'
      if (time < '12:00') {
        counts[day.week_day].manha += 1
      } else {
        counts[day.week_day].tarde += 1
      }
    })

    return counts
  }

  async function ensureMonthEndClosing() {
    const today = new Date()
    const currentDay = today.getDate()

    if (currentDay < 10) return

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const monthLabel = `${monthNames[today.getMonth()]}/${today.getFullYear()}`

    try {
      if (closingChecked.current) return
      closingChecked.current = true

      let { data: existing, error: findError } = await supabase
        .from('month_end_closing')
        .select('id')
        .eq('month', monthLabel)
        .order('created_at', { ascending: false })
        .maybeSingle()

      if (findError) throw findError

      let monthId = existing?.id

      if (!monthId) {
        try {
          const { data: inserted, error: insertError } = await supabase
            .from('month_end_closing')
            .insert({ month: monthLabel })
            .select('id')
            .single()

          if (insertError) throw insertError
          monthId = inserted?.id
        } catch (insertErr) {
          // Se outra execução paralela já criou o registro (violação de UNIQUE),
          // buscamos o registro existente.
          if (insertErr?.code === '23505') {
            const { data: retryExisting, error: retryError } = await supabase
              .from('month_end_closing')
              .select('id')
              .eq('month', monthLabel)
              .order('created_at', { ascending: false })
              .maybeSingle()

            if (retryError) throw retryError
            monthId = retryExisting?.id
          } else {
            throw insertErr
          }
        }
      }

      if (!monthId) return

      const { data: activeClients, error: clientsError } = await supabase
        .from('clients')
        .select('id, monthly_fee')
        .eq('status', 'ativo')

      if (clientsError) throw clientsError

      const { data: existingTransactions, error: transactionsError } = await supabase
        .from('financial')
        .select('client_id')
        .eq('month_id', monthId)

      if (transactionsError) throw transactionsError

      const existingClientIds = new Set((existingTransactions || []).map((t) => t.client_id))
      const newTransactions = (activeClients || [])
        .filter((client) => !existingClientIds.has(client.id) && client.monthly_fee)
        .map((client) => ({
          client_id: client.id,
          month_id: monthId,
          amount: -Math.abs(client.monthly_fee),
        }))

      if (newTransactions.length > 0) {
        const { error: bulkError } = await supabase.from('financial').insert(newTransactions)
        if (bulkError) throw bulkError
      }
    } catch (err) {
      console.error('Erro ao verificar fechamento mensal:', err)
    }
  }

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
        <div className="mb-6">
          <p className="text-sm font-medium text-teal-50">Total de alunos ativos</p>
          {loading ? (
            <Loading />
          ) : (
            <p className="text-4xl font-bold md:text-5xl">{activeCount}</p>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl bg-white/10 p-4">
          <table className="w-full text-center text-sm text-white">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left font-medium text-teal-50"></th>
                <th className="px-2 py-2 font-medium text-teal-50">SEG</th>
                <th className="px-2 py-2 font-medium text-teal-50">TER</th>
                <th className="px-2 py-2 font-medium text-teal-50">QUA</th>
                <th className="px-2 py-2 font-medium text-teal-50">QUI</th>
                <th className="px-2 py-2 font-medium text-teal-50">SEX</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/20">
                <td className="px-2 py-2 text-left font-medium">Manhã</td>
                {['segunda', 'terca', 'quarta', 'quinta', 'sexta'].map((day) => (
                  <td key={day} className="px-2 py-2 font-semibold">
                    {loading ? '-' : scheduleCounts[day]?.manha || 0}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-white/20">
                <td className="px-2 py-2 text-left font-medium">tarde</td>
                {['segunda', 'terca', 'quarta', 'quinta', 'sexta'].map((day) => (
                  <td key={day} className="px-2 py-2 font-semibold">
                    {loading ? '-' : scheduleCounts[day]?.tarde || 0}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {(birthdayCounts.today > 0 || birthdayCounts.week > 0) && (
        <div className="mb-8 rounded-2xl bg-blue-500 p-6 text-white shadow-md md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Cake size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white" style={{ color: 'white' }}>Aniversariantes</h3>
          </div>
          <div className="mt-4 space-y-2">
            {birthdayCounts.today > 0 && (
              <p className="text-sm">
                Aniversariantes de Hoje: <span className="text-2xl font-bold">{birthdayCounts.today}</span>
              </p>
            )}
            {birthdayCounts.week > 0 && (
              <p className="text-sm">
                Aniversariantes da Semana: <span className="text-2xl font-bold">{birthdayCounts.week}</span>
              </p>
            )}
          </div>
        </div>
      )}

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
