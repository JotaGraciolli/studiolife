import { useState } from 'react'
import { CheckCircle2, XCircle, HelpCircle, Save, Calendar } from 'lucide-react'
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

const statusOptions = [
  { value: 'presente', label: 'Presente', icon: CheckCircle2 },
  { value: 'ausente', label: 'Ausente', icon: XCircle },
  { value: 'falta_justificada', label: 'Falta justificada', icon: HelpCircle },
]

export function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDay, setSelectedDay] = useState(null)
  const [groupedStudents, setGroupedStudents] = useState([])
  const [attendanceMap, setAttendanceMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadStudentsForDay(day) {
    setSelectedDay(day)
    setLoading(true)
    setError('')
    setSuccess('')
    setAttendanceMap({})

    try {
      // Busca alunos ativos com treino no dia selecionado
      const { data: trainingData, error: trainingError } = await supabase
        .from('training_days')
        .select('id, training_time, client_id, clients(id, name, status)')
        .eq('week_day', day)
        .eq('clients.status', 'ativo')
        .order('training_time', { ascending: true })

      if (trainingError) throw trainingError

      // Agrupa por horario
      const groups = {}
      const initialMap = {}

      ;(trainingData || []).forEach((item) => {
        const time = item.training_time ? item.training_time.slice(0, 5) : '--:--'
        if (!groups[time]) {
          groups[time] = []
        }
        groups[time].push({
          trainingId: item.id,
          clientId: item.client_id,
          clientName: item.clients?.name || 'Aluno não encontrado',
          trainingTime: time,
        })
        initialMap[item.client_id] = 'presente'
      })

      const sortedGroups = Object.keys(groups)
        .sort()
        .map((time) => ({
          time,
          students: groups[time],
        }))

      setGroupedStudents(sortedGroups)
      setAttendanceMap(initialMap)

      // Verifica registros existentes para preencher status anteriores
      await loadExistingAttendance(Object.keys(initialMap))
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar alunos: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadExistingAttendance(clientIds) {
    if (clientIds.length === 0) return

    const startOfDay = `${selectedDate}T00:00:00`
    const endOfDay = `${selectedDate}T23:59:59`

    const { data, error } = await supabase
      .from('attendance')
      .select('client_id, status')
      .in('client_id', clientIds)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    if (error) {
      console.error('Erro ao carregar presenças existentes:', error)
      return
    }

    if (data && data.length > 0) {
      const existing = {}
      data.forEach((record) => {
        existing[record.client_id] = record.status
      })
      setAttendanceMap((prev) => ({ ...prev, ...existing }))
    }
  }

  function handleStatusChange(clientId, status) {
    setAttendanceMap((prev) => ({ ...prev, [clientId]: status }))
  }

  async function handleSave() {
    if (!selectedDay || groupedStudents.length === 0) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const records = []
      groupedStudents.forEach((group) => {
        group.students.forEach((student) => {
          const time = student.trainingTime === '--:--' ? '00:00:00' : `${student.trainingTime}:00`
          records.push({
            client_id: student.clientId,
            status: attendanceMap[student.clientId] || 'presente',
            created_at: `${selectedDate}T${time}`,
          })
        })
      })

      const clientIds = records.map((r) => r.client_id)
      const startOfDay = `${selectedDate}T00:00:00`
      const endOfDay = `${selectedDate}T23:59:59`

      // Remove registros existentes para o dia e alunos selecionados
      const { error: deleteError } = await supabase
        .from('attendance')
        .delete()
        .in('client_id', clientIds)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)

      if (deleteError) throw deleteError

      // Insere novos registros
      const { error: insertError } = await supabase.from('attendance').insert(records)
      if (insertError) throw insertError

      setSuccess('Presença registrada com sucesso!')
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao salvar presença: ${detail}`)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  function SuccessMessage({ message }) {
    if (!message) return null
    return (
      <div className="mb-4 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
        {message}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Lista de Presença"
        description="Selecione o dia da semana para registrar a presença dos alunos."
      />

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          <Calendar
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value)
              if (selectedDay) loadStudentsForDay(selectedDay)
            }}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-5 gap-2 sm:gap-3">
        {weekDays.map((day) => {
          const active = selectedDay === day.value
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => loadStudentsForDay(day.value)}
              className={`rounded-xl px-2 py-3 text-sm font-semibold transition-all sm:text-base ${
                active
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'bg-[var(--surface)] text-[var(--text-heading)] shadow-sm hover:bg-slate-50'
              }`}
            >
              {day.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <Loading />
      ) : selectedDay ? (
        <div className="rounded-xl bg-[var(--surface)] p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-heading)]">
            Lista de Presença - {weekDays.find((d) => d.value === selectedDay)?.full}
          </h2>

          {groupedStudents.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              Nenhum aluno ativo encontrado para este dia.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-slate-500">
                      <th className="pb-3 font-medium">Horário</th>
                      <th className="pb-3 font-medium">Aluno</th>
                      {statusOptions.map((status) => (
                        <th key={status.value} className="pb-3 text-center font-medium">
                          {status.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupedStudents.map((group) =>
                      group.students.map((student, index) => {
                        const isFirst = index === 0
                        return (
                          <tr
                            key={student.clientId}
                            className="border-t border-[var(--border)]"
                          >
                            {isFirst ? (
                              <td
                                rowSpan={group.students.length}
                                className="w-16 py-3 align-top font-semibold text-[var(--text-heading)]"
                              >
                                {group.time}
                              </td>
                            ) : null}
                            <td className="py-3 font-medium text-[var(--text-heading)]">
                              {student.clientName}
                            </td>
                            {statusOptions.map((status) => {
                              const Icon = status.icon
                              const checked =
                                attendanceMap[student.clientId] === status.value
                              return (
                                <td key={status.value} className="py-3 text-center">
                                  <label className="inline-flex cursor-pointer flex-col items-center gap-1">
                                    <input
                                      type="radio"
                                      name={`attendance-${student.clientId}`}
                                      value={status.value}
                                      checked={checked}
                                      onChange={() =>
                                        handleStatusChange(student.clientId, status.value)
                                      }
                                      className="h-4 w-4 accent-[var(--primary)]"
                                    />
                                    <Icon
                                      size={14}
                                      className={`${
                                        checked ? 'text-[var(--primary)]' : 'text-slate-300'
                                      }`}
                                    />
                                  </label>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      }),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-70"
                >
                  <Save size={18} />
                  {saving ? 'Salvando...' : 'Salvar presença'}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--surface)] p-8 text-center text-slate-500 shadow-sm">
          Selecione um dia da semana para começar.
        </div>
      )}
    </div>
  )
}
