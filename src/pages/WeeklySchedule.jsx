import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, CalendarDays, ArrowLeft } from 'lucide-react'
import { supabase } from '../services/supabase'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'

const weekDays = [
  { value: 'segunda', label: 'SEG', full: 'Segunda-feira' },
  { value: 'terca', label: 'TER', full: 'Terça-feira' },
  { value: 'quarta', label: 'QUA', full: 'Quarta-feira' },
  { value: 'quinta', label: 'QUI', full: 'Quinta-feira' },
  { value: 'sexta', label: 'SEX', full: 'Sexta-feira' },
]

export function WeeklySchedule() {
  const [scheduleData, setScheduleData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true)
      setError('')
      try {
        const { data, error: supaError } = await supabase
          .from('training_days')
          .select('id, training_time, week_day, provisional, client_id, clients(id, name, status)')
          .in('week_day', weekDays.map((d) => d.value))
          .eq('clients.status', 'ativo')
          .order('training_time', { ascending: true })

        if (supaError) throw supaError
        setScheduleData(data || [])
      } catch (err) {
        const detail = err?.message || err?.error_description || JSON.stringify(err)
        setError(`Erro ao carregar programação: ${detail}`)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [])

  const { timeSlots, scheduleMap } = useMemo(() => {
    const map = {}
    const times = new Set()

    scheduleData.forEach((item) => {
      if (!item.clients || item.clients.status !== 'ativo') return

      const time = item.training_time ? item.training_time.slice(0, 5) : '--:--'
      const day = item.week_day
      const clientName = item.clients?.name || 'Aluno não encontrado'
      const key = `${time}-${day}`

      if (!map[key]) {
        map[key] = []
      }
      map[key].push({
        name: clientName,
        provisional: item.provisional || false,
      })

      times.add(time)
    })

    const sortedTimes = Array.from(times).sort()
    return { timeSlots: sortedTimes, scheduleMap: map }
  }, [scheduleData])

  function getCellStudents(time, day) {
    return scheduleMap[`${time}-${day.value}`] || []
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Programação Semanal"
          description="Visualize a grade de horários dos alunos de segunda a sexta."
        />
        <Link
          to="/attendance"
          className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Voltar para presença
        </Link>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : (
        <div
          className="force-horizontal-scrollbar relative max-h-[calc(100vh-220px)] overflow-x-scroll overflow-y-auto rounded-xl bg-[var(--surface)] shadow-sm"
          style={{
            scrollbarWidth: 'auto',
            scrollbarColor: '#cbd5e1 #f1f5f9',
          }}
        >
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="sticky top-0 z-10 bg-[var(--primary)] text-white">
                <th className="sticky left-0 top-0 z-30 min-w-[60px] border border-white/20 bg-[var(--primary)] px-2 py-3 text-center font-semibold">
                  <div className="flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.value}
                      className="min-w-[160px] border border-white/20 px-4 py-3 text-center font-semibold"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CalendarDays size={16} />
                        {day.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.length === 0 ? (
                  <tr>
                    <td
                      colSpan={weekDays.length + 1}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      Nenhum horário encontrado para a programação semanal.
                    </td>
                  </tr>
                ) : (
                  timeSlots.map((time, index) => (
                    <tr
                      key={time}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                    >
                      <td
                        className={`sticky left-0 z-20 min-w-[60px] border border-[var(--border)] px-2 py-3 text-center font-semibold text-[var(--text-heading)] ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        }`}
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        {time}
                      </td>
                      {weekDays.map((day) => {
                        const students = getCellStudents(time, day)
                        return (
                          <td
                            key={day.value}
                            className="border border-[var(--border)] px-3 py-2 align-top"
                          >
                            {students.length === 0 ? (
                              <span className="block py-2 text-center text-xs text-slate-300">
                                -
                              </span>
                            ) : (
                              <div className="space-y-1">
                                {students.map((student, i) => (
                                  <div
                                    key={i}
                                    className="rounded-md bg-[var(--primary-light)] px-2 py-1.5 text-xs font-medium text-[var(--primary-dark)]"
                                  >
                                    {student.name}
                                    {student.provisional && (
                                      <span className="ml-1 text-[10px] text-purple-600">
                                        (rep)
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      )}
    </div>
  )
}
