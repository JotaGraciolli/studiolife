import { useEffect, useMemo, useState } from 'react'
import { Cake, Calendar, Phone, Clock, Gift } from 'lucide-react'
import { supabase } from '../services/supabase'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'

function formatPhone(value) {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return ''
  if (digits.length <= 2) {
    return `(${digits}`
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

function calculateAge(birthDateString) {
  if (!birthDateString) return null
  const birthDate = new Date(birthDateString)
  const today = new Date()

  let years = today.getFullYear() - birthDate.getFullYear()
  let months = today.getMonth() - birthDate.getMonth()

  if (months < 0) {
    years -= 1
    months += 12
  }

  if (today.getDate() < birthDate.getDate()) {
    months -= 1
    if (months < 0) {
      years -= 1
      months += 12
    }
  }

  if (years === 0 && months === 0) {
    return '0 meses'
  }
  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`
  }
  if (months === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'}, ${months} ${months === 1 ? 'mês' : 'meses'}`
}

function calculateDuration(startDateString) {
  if (!startDateString) return null
  const startDate = new Date(startDateString)
  const today = new Date()

  let years = today.getFullYear() - startDate.getFullYear()
  let months = today.getMonth() - startDate.getMonth()

  if (months < 0) {
    years -= 1
    months += 12
  }

  if (today.getDate() < startDate.getDate()) {
    months -= 1
    if (months < 0) {
      years -= 1
      months += 12
    }
  }

  if (years === 0 && months === 0) {
    return 'menos de 1 mês'
  }
  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`
  }
  if (months === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`
}

function formatBirthDate(birthDateString) {
  if (!birthDateString) return ''
  const date = new Date(birthDateString)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function isBirthdayInMonth(birthDateString, month) {
  if (!birthDateString) return false
  const date = new Date(birthDateString)
  return date.getMonth() === month
}

function getFirstName(fullName) {
  if (!fullName) return ''
  return fullName.trim().split(' ')[0]
}

function isBirthdayInCurrentWeek(birthDateString) {
  if (!birthDateString) return false
  const today = new Date()
  const currentDay = today.getDay()
  const diffToMonday = (currentDay + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const birthDate = new Date(birthDateString)
  const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())

  return birthdayThisYear >= monday && birthdayThisYear <= sunday
}

export function Birthdays() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('month')
  const [birthdayTemplate, setBirthdayTemplate] = useState(null)

  useEffect(() => {
    async function loadClients() {
      try {
        const [clientsRes, templateRes] = await Promise.all([
          supabase
            .from('clients')
            .select('id, name, phone, birth_date, start_date, status')
            .order('name'),
          supabase
            .from('message_templates')
            .select('*')
            .ilike('category', 'Aniversário')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ])

        if (clientsRes.error) throw clientsRes.error
        if (templateRes.error) throw templateRes.error

        setClients(clientsRes.data || [])
        setBirthdayTemplate(templateRes.data)
      } catch (err) {
        const detail = err?.message || err?.error_description || JSON.stringify(err)
        setError(`Não foi possível carregar os alunos. ${detail}`)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  const today = new Date()
  const currentMonth = today.getMonth()

  const filteredClients = useMemo(() => {
    if (filter === 'week') {
      return clients.filter((client) => isBirthdayInCurrentWeek(client.birth_date))
    }
    return clients.filter((client) => isBirthdayInMonth(client.birth_date, currentMonth))
  }, [clients, filter, currentMonth])

  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      if (!a.birth_date || !b.birth_date) return 0
      const dateA = new Date(a.birth_date)
      const dateB = new Date(b.birth_date)
      return dateA.getDate() - dateB.getDate()
    })
  }, [filteredClients])

  async function handleBirthdayClick(client) {
    if (!client.phone) {
      setError(`${client.name} não possui telefone cadastrado.`)
      return
    }

    let message = birthdayTemplate?.message || 'Parabéns, {{ALUNO}}! Feliz aniversário! 🎉'
    message = message.replace(/\{\{ALUNO\}\}/g, getFirstName(client.name))

    const digits = client.phone.replace(/\D/g, '')
    const phoneWithCountry = `55${digits}`

    const encodedPhone = encodeURIComponent(phoneWithCountry)
    const encodedMessage = encodeURIComponent(message).replace(/%20/g, '+')
    const url = `https://api.whatsapp.com/send?phone=${encodedPhone}&text=${encodedMessage}`

    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <PageHeader
        title="Aniversariantes"
        description="Acompanhe os aniversariantes do mês e da semana."
      />

      <ErrorMessage message={error} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setFilter('month')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            filter === 'month'
              ? 'bg-[var(--primary)] text-white'
              : 'border border-[var(--border)] bg-white text-[var(--text)] hover:bg-slate-50'
          }`}
        >
          <Calendar size={18} />
          Aniversariantes do mês
        </button>
        <button
          type="button"
          onClick={() => setFilter('week')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            filter === 'week'
              ? 'bg-[var(--primary)] text-white'
              : 'border border-[var(--border)] bg-white text-[var(--text)] hover:bg-slate-50'
          }`}
        >
          <Gift size={18} />
          Aniversariantes da semana
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {filter === 'month'
              ? `Exibindo aniversariantes de ${today.toLocaleDateString('pt-BR', { month: 'long' })}.`
              : 'Exibindo aniversariantes da semana atual.'}
            {' '}
            <span className="font-medium text-[var(--text-heading)]">{sortedClients.length}</span>{' '}
            {sortedClients.length === 1 ? 'aluno encontrado' : 'alunos encontrados'}.
          </p>

          {sortedClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                <Cake size={28} />
              </div>
              <p className="text-base font-medium text-[var(--text-heading)]">
                Nenhum aniversariante {filter === 'month' ? 'neste mês' : 'esta semana'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Os aniversariantes aparecerão aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedClients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-xl bg-[var(--surface)] p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-[var(--text-heading)]">{client.name}</h3>
                    <button
                      type="button"
                      onClick={() => handleBirthdayClick(client)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white"
                      title="Enviar mensagem de aniversário"
                    >
                      <Cake size={16} />
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Calendar size={16} />
                        Data
                      </span>
                      <span className="font-medium text-[var(--text-heading)]">
                        {formatBirthDate(client.birth_date)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Gift size={16} />
                        Idade
                      </span>
                      <span className="font-medium text-[var(--text-heading)]">
                        {calculateAge(client.birth_date) || '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Phone size={16} />
                        Telefone
                      </span>
                      <span className="font-medium text-[var(--text-heading)]">
                        {formatPhone(client.phone) || '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Clock size={16} />
                        Aluno há
                      </span>
                      <span className="font-medium text-[var(--text-heading)]">
                        {calculateDuration(client.start_date) || '-'}
                      </span>
                    </div>
                  </div>

                  {client.status === 'inativo' && (
                    <div className="mt-4 rounded-lg bg-slate-100 px-3 py-1.5 text-center text-xs font-medium text-slate-500">
                      Aluno inativo
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
