import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, HelpCircle, Save, Calendar, Clock, ChevronLeft, ChevronRight, CalendarDays, MessageSquare, X, Phone } from 'lucide-react'
import { supabase } from '../services/supabase'
import { isEvaluationPending } from '../utils/evaluation'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'

const weekDays = [
  { value: 'domingo', label: 'Domingo', full: 'Domingo' },
  { value: 'segunda', label: 'Segunda', full: 'Segunda-feira' },
  { value: 'terca', label: 'Terça', full: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta', full: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta', full: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta', full: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado', full: 'Sábado' },
]

const weekDayOptions = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
]

const statusOptions = [
  { value: 'presente', label: 'Presente', icon: CheckCircle2 },
  { value: 'ausente', label: 'Ausente', icon: XCircle },
  { value: 'falta_justificada', label: 'Falta justificada', icon: HelpCircle },
]

function getDayOfWeek(dateString) {
  const date = new Date(dateString + 'T00:00:00')
  return weekDays[date.getDay()].value
}

function addDays(dateString, days) {
  const date = new Date(dateString + 'T00:00:00')
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

function formatPhone(value) {
  if (!value) return ''
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function getFirstName(fullName) {
  if (!fullName) return ''
  return fullName.trim().split(' ')[0]
}

export function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDay, setSelectedDay] = useState(getDayOfWeek(new Date().toISOString().split('T')[0]))
  const [groupedStudents, setGroupedStudents] = useState([])
  const [attendanceMap, setAttendanceMap] = useState({})
  const [replacementMap, setReplacementMap] = useState({})
  const [noReplacementMap, setNoReplacementMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [evaluationsMap, setEvaluationsMap] = useState({})
  const [monthlyAbsences, setMonthlyAbsences] = useState({})
  const [absenceTemplate, setAbsenceTemplate] = useState(null)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phoneStudent, setPhoneStudent] = useState(null)
  const [phoneValue, setPhoneValue] = useState('')
  const [phoneSaving, setPhoneSaving] = useState(false)

  useEffect(() => {
    loadStudentsForDay(selectedDay, selectedDate)
    loadAbsenceTemplate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAbsenceTemplate() {
    try {
      const { data, error: supaError } = await supabase
        .from('message_templates')
        .select('*')
        .ilike('category', 'Ausência')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (supaError) throw supaError
      setAbsenceTemplate(data)
    } catch (err) {
      console.error('Erro ao carregar template de ausência:', err)
    }
  }

  async function loadStudentsForDay(day, date) {
    setSelectedDay(day)
    setLoading(true)
    setError('')
    setSuccess('')
    setAttendanceMap({})
    setReplacementMap({})

    try {
      const { data: trainingData, error: trainingError } = await supabase
        .from('training_days')
        .select('id, training_time, week_day, provisional, client_id, clients(id, name, status, phone)')
        .eq('week_day', day)
        .eq('clients.status', 'ativo')
        .order('training_time', { ascending: true })

      if (trainingError) throw trainingError

      const groups = {}
      const initialMap = {}
      const initialReplacement = {}

        ; (trainingData || []).forEach((item) => {
          if (!item.clients || item.clients.status !== 'ativo') return

          const time = item.training_time ? item.training_time.slice(0, 5) : '--:--'
          if (!groups[time]) {
            groups[time] = []
          }
          groups[time].push({
            trainingDayId: item.id,
            clientId: item.client_id,
            clientName: item.clients?.name || 'Aluno não encontrado',
            phone: item.clients?.phone || '',
            trainingTime: time,
            weekDay: item.week_day,
            provisional: item.provisional || false,
          })
          initialMap[item.client_id] = 'presente'
          initialReplacement[item.client_id] = {
            week_day: item.week_day,
            training_time: time,
          }
        })

      const initialNoReplacement = {}
      Object.keys(initialMap).forEach((clientId) => {
        initialNoReplacement[clientId] = false
      })

      const sortedGroups = Object.keys(groups)
        .sort()
        .map((time) => ({
          time,
          students: groups[time].slice().sort((a, b) =>
            a.clientName.localeCompare(b.clientName),
          ),
        }))

      setGroupedStudents(sortedGroups)
      setAttendanceMap(initialMap)
      setReplacementMap(initialReplacement)
      setNoReplacementMap(initialNoReplacement)

      const clientIds = Object.keys(initialMap)
      await loadExistingAttendance(clientIds, date)
      await loadEvaluations(clientIds)
      await loadMonthlyAbsences(clientIds, date)
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar alunos: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadExistingAttendance(clientIds, date) {
    if (clientIds.length === 0) return

    const startOfDay = `${date}T00:00:00`
    const endOfDay = `${date}T23:59:59`

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

      // Carrega training_days provisionais para preencher reposicao
      const justifiedIds = data
        .filter((r) => r.status === 'falta_justificada')
        .map((r) => r.client_id)

      if (justifiedIds.length > 0) {
        await loadReplacementDays(justifiedIds)
      }
    }
  }

  async function loadReplacementDays(clientIds) {
    const { data, error } = await supabase
      .from('training_days')
      .select('client_id, week_day, training_time')
      .in('client_id', clientIds)
      .eq('provisional', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar dias de reposição:', error)
      return
    }

    if (data && data.length > 0) {
      const replacements = {}
      data.forEach((record) => {
        if (!replacements[record.client_id]) {
          replacements[record.client_id] = {
            week_day: record.week_day,
            training_time: record.training_time ? record.training_time.slice(0, 5) : '',
          }
        }
      })
      setReplacementMap((prev) => ({ ...prev, ...replacements }))
    }
  }

  async function loadMonthlyAbsences(clientIds, date) {
    if (clientIds.length === 0) {
      setMonthlyAbsences({})
      return
    }

    const current = new Date(date + 'T00:00:00')
    const year = current.getFullYear()
    const month = current.getMonth()
    const start = new Date(year, month, 1).toISOString()
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('client_id, status')
        .in('client_id', clientIds)
        .gte('created_at', start)
        .lte('created_at', end)

      if (error) {
        console.error('Erro ao carregar faltas do mês:', error)
        return
      }

      const counts = {}
      clientIds.forEach((id) => {
        counts[id] = 0
      })
      ;(data || [])
        .filter((record) => record.status === 'ausente')
        .forEach((record) => {
          counts[record.client_id] = (counts[record.client_id] || 0) + 1
        })

      setMonthlyAbsences(counts)
    } catch (err) {
      console.error('Erro ao carregar faltas do mês:', err)
    }
  }

  async function loadEvaluations(clientIds) {
    if (clientIds.length === 0) {
      setEvaluationsMap({})
      return
    }

    const { data, error } = await supabase
      .from('evaluations')
      .select('client_id, created_at')
      .in('client_id', clientIds)

    if (error) {
      console.error('Erro ao carregar avaliações:', error)
      return
    }

    const map = {}
    data.forEach((record) => {
      if (!map[record.client_id]) {
        map[record.client_id] = []
      }
      map[record.client_id].push(record)
    })
    setEvaluationsMap(map)
  }

  function sendWhatsAppMessage(student) {
    let message = absenceTemplate?.message || 'Olá {{ALUNO}}, vimos que você faltou hoje. Tudo bem?'
    message = message.replace(/\{\{ALUNO\}\}/g, getFirstName(student.clientName))

    const digits = student.phone.replace(/\D/g, '')
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

  function openPhoneModal(student) {
    setPhoneStudent(student)
    setPhoneValue(formatPhone(student.phone || ''))
    setShowPhoneModal(true)
  }

  function closePhoneModal() {
    setShowPhoneModal(false)
    setPhoneStudent(null)
    setPhoneValue('')
  }

  function handlePhoneChange(e) {
    setPhoneValue(formatPhone(e.target.value))
  }

  async function handleSavePhone(e) {
    e.preventDefault()
    if (!phoneStudent) return

    const digits = phoneValue.replace(/\D/g, '')
    if (!digits) {
      setError('Informe um número de telefone válido.')
      return
    }

    setPhoneSaving(true)
    setError('')

    try {
      const { error: supaError } = await supabase
        .from('clients')
        .update({ phone: digits })
        .eq('id', phoneStudent.clientId)

      if (supaError) throw supaError

      setGroupedStudents((prev) =>
        prev.map((group) => ({
          ...group,
          students: group.students.map((s) =>
            s.clientId === phoneStudent.clientId ? { ...s, phone: digits } : s,
          ),
        })),
      )

      closePhoneModal()
      sendWhatsAppMessage({ ...phoneStudent, phone: digits })
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao salvar telefone: ${detail}`)
      console.error(err)
    } finally {
      setPhoneSaving(false)
    }
  }

  function handleAbsenceMessageClick(student) {
    if (!student.phone) {
      openPhoneModal(student)
      return
    }

    sendWhatsAppMessage(student)
  }

  function changeDate(days) {
    const newDate = addDays(selectedDate, days)
    setSelectedDate(newDate)
    const newDay = getDayOfWeek(newDate)
    loadStudentsForDay(newDay, newDate)
  }

  function handleDateChange(e) {
    const newDate = e.target.value
    setSelectedDate(newDate)
    const newDay = getDayOfWeek(newDate)
    loadStudentsForDay(newDay, newDate)
  }

  function handleStatusChange(clientId, status) {
    setAttendanceMap((prev) => ({ ...prev, [clientId]: status }))
  }

  function handleReplacementChange(clientId, field, value) {
    setReplacementMap((prev) => ({
      ...prev,
      [clientId]: { ...prev[clientId], [field]: value },
    }))
  }

  function handleNoReplacementChange(clientId, checked) {
    setNoReplacementMap((prev) => ({ ...prev, [clientId]: checked }))
  }

  async function handleSave() {
    if (!selectedDay || groupedStudents.length === 0) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const attendanceRecords = []
      const replacementRecords = []
      const provisionalTrainingIdsToDelete = []

      groupedStudents.forEach((group) => {
        group.students.forEach((student) => {
          const time = student.trainingTime === '--:--' ? '00:00:00' : `${student.trainingTime}:00`
          const status = attendanceMap[student.clientId] || 'presente'

          attendanceRecords.push({
            client_id: student.clientId,
            status,
            created_at: `${selectedDate}T${time}`,
          })

          if (status === 'falta_justificada' && !noReplacementMap[student.clientId]) {
            const replacement = replacementMap[student.clientId]
            if (replacement?.week_day && replacement?.training_time) {
              replacementRecords.push({
                client_id: student.clientId,
                week_day: replacement.week_day,
                training_time: replacement.training_time + ':00',
                provisional: true,
              })
            }
          }

          if (student.provisional && student.trainingDayId) {
            provisionalTrainingIdsToDelete.push(student.trainingDayId)
          }
        })
      })

      const clientIds = attendanceRecords.map((r) => r.client_id)
      const startOfDay = `${selectedDate}T00:00:00`
      const endOfDay = `${selectedDate}T23:59:59`

      const { error: deleteAttendanceError } = await supabase
        .from('attendance')
        .delete()
        .in('client_id', clientIds)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)

      if (deleteAttendanceError) throw deleteAttendanceError

      const { error: insertAttendanceError } = await supabase
        .from('attendance')
        .insert(attendanceRecords)
      if (insertAttendanceError) throw insertAttendanceError

      if (replacementRecords.length > 0) {
        const { error: replacementError } = await supabase
          .from('training_days')
          .insert(replacementRecords)
        if (replacementError) throw replacementError
      }

      if (provisionalTrainingIdsToDelete.length > 0) {
        const { error: deleteTrainingError } = await supabase
          .from('training_days')
          .delete()
          .in('id', provisionalTrainingIdsToDelete)
        if (deleteTrainingError) throw deleteTrainingError
      }

      const pausedCount = await pauseStudentsWithThreeAbsences(selectedDate)

      let successMessage = 'Presença registrada com sucesso!'
      if (pausedCount > 0) {
        successMessage += ` ${pausedCount} aluno${pausedCount > 1 ? 's' : ''} atingiu 3 faltas e foi pausado${pausedCount > 1 ? 's' : ''}.`
      }

      setSuccess(successMessage)
      setGroupedStudents([])
      setAttendanceMap({})
      setReplacementMap({})
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao salvar presença: ${detail}`)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function pauseStudentsWithThreeAbsences(date) {
    const current = new Date(date + 'T00:00:00')
    const year = current.getFullYear()
    const month = current.getMonth()
    const start = new Date(year, month, 1).toISOString()
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

    try {
      const { data, error: countError } = await supabase
        .from('attendance')
        .select('client_id')
        .eq('status', 'ausente')
        .gte('created_at', start)
        .lte('created_at', end)

      if (countError) throw countError

      const counts = {}
      ;(data || []).forEach((record) => {
        counts[record.client_id] = (counts[record.client_id] || 0) + 1
      })

      const clientIdsToPause = Object.entries(counts)
        .filter(([, count]) => count >= 3)
        .map(([clientId]) => clientId)

      if (clientIdsToPause.length === 0) return 0

      const { error: updateError } = await supabase
        .from('clients')
        .update({ status: 'pausado' })
        .in('id', clientIdsToPause)
        .neq('status', 'pausado')

      if (updateError) throw updateError

      return clientIdsToPause.length
    } catch (err) {
      console.error('Erro ao pausar alunos com 3 faltas:', err)
      return 0
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

  const selectedDayLabel = weekDays.find((d) => d.value === selectedDay)

  return (
    <div>
      <PageHeader
        title="Lista de Presença"
        description="Navegue pela data para registrar a presença dos alunos."
      />

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => changeDate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--text-heading)] shadow-sm hover:bg-slate-50"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="relative">
          <Calendar
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
          />
        </div>
        <button
          type="button"
          onClick={() => changeDate(1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--text-heading)] shadow-sm hover:bg-slate-50"
        >
          <ChevronRight size={20} />
        </button>
        <span className="ml-2 text-sm font-medium text-[var(--text-heading)]">
          {selectedDayLabel?.full}
        </span>
        <Link
          to="/weekly-schedule"
          className="ml-auto flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
        >
          <CalendarDays size={18} />
          Programação semanal
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className={`rounded-xl bg-[var(--surface)] p-4 shadow-sm sm:p-6 ${groupedStudents.length > 0 ? 'pb-24' : ''}`}>
          {/* <h2 className="mb-4 text-lg font-semibold text-[var(--text-heading)]"> */}
          {/* Lista de Presença - {selectedDayLabel?.full} */}
          {/* </h2> */}

          {groupedStudents.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              Nenhum aluno ativo encontrado para este dia.
            </p>
          ) : (
            <>
              <div className="space-y-6">
                {groupedStudents.map((group) => (
                  <div key={group.time} className="rounded-xl border border-[var(--border)] bg-slate-50/50 p-4">
                    <h3 className="mb-3 text-base font-bold text-[var(--primary)]">
                      {group.time}
                    </h3>
                    <div className="space-y-1">
                      {group.students.map((student) => {
                        const status = attendanceMap[student.clientId] || 'presente'
                        const isJustified = status === 'falta_justificada'

                        return (
                          <div
                            key={student.clientId}
                            className="rounded-lg bg-[var(--surface)] p-3 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex flex-col">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-base font-medium text-[var(--text-heading)]">
                                    {student.clientName}
                                  </span>
                                  {monthlyAbsences[student.clientId] > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                      {monthlyAbsences[student.clientId]} falta
                                      {monthlyAbsences[student.clientId] > 1 ? 's' : ''}
                                    </span>
                                  )}
                                  {isEvaluationPending(evaluationsMap[student.clientId]) && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                      Avaliação pendente
                                    </span>
                                  )}
                                </div>
                                {student.provisional && (
                                  <span className="text-xs text-purple-600">(reposição)</span>
                                )}
                                {status === 'ausente' && (
                                  <button
                                    type="button"
                                    onClick={() => handleAbsenceMessageClick(student)}
                                    className="mt-1 flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary-light)] text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white"
                                    title="Enviar mensagem sobre ausência"
                                  >
                                    <MessageSquare size={14} />
                                  </button>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                {statusOptions.map((statusOption) => {
                                  const checked = status === statusOption.value
                                  return (
                                    <label
                                      key={statusOption.value}
                                      className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-heading)]"
                                    >
                                      <span
                                        className={`text-xs ${checked ? 'font-medium text-[var(--primary)]' : 'text-slate-500'
                                          }`}
                                      >
                                        {statusOption.label}
                                      </span>
                                      <input
                                        type="radio"
                                        name={`attendance-${student.clientId}`}
                                        value={statusOption.value}
                                        checked={checked}
                                        onChange={() =>
                                          handleStatusChange(student.clientId, statusOption.value)
                                        }
                                        className="h-4 w-4 accent-[var(--primary)]"
                                      />
                                    </label>
                                  )
                                })}
                              </div>
                            </div>

                            {isJustified && (
                              <div className="mt-3 rounded-lg bg-slate-100 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                  <p className="text-xs font-medium text-slate-500">Reposição:</p>
                                  <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--text-heading)]">
                                    <input
                                      type="checkbox"
                                      checked={noReplacementMap[student.clientId] || false}
                                      onChange={(e) =>
                                        handleNoReplacementChange(student.clientId, e.target.checked)
                                      }
                                      className="h-3.5 w-3.5 rounded border-slate-300 text-[var(--primary)] accent-[var(--primary)]"
                                    />
                                    Não reagendar
                                  </label>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <select
                                    value={replacementMap[student.clientId]?.week_day || student.weekDay}
                                    onChange={(e) =>
                                      handleReplacementChange(
                                        student.clientId,
                                        'week_day',
                                        e.target.value,
                                      )
                                    }
                                    disabled={noReplacementMap[student.clientId] || false}
                                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)] disabled:bg-slate-100 disabled:text-slate-400"
                                  >
                                    {weekDayOptions.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="relative">
                                    <Clock
                                      size={16}
                                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                      type="time"
                                      value={replacementMap[student.clientId]?.training_time || ''}
                                      onChange={(e) =>
                                        handleReplacementChange(
                                          student.clientId,
                                          'training_time',
                                          e.target.value,
                                        )
                                      }
                                      disabled={noReplacementMap[student.clientId] || false}
                                      className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 pl-9 text-sm outline-none focus:border-[var(--primary)] disabled:bg-slate-100 disabled:text-slate-400"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </>
          )}
        </div>
      )}

      {groupedStudents.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:left-64">
          <div className="mx-auto flex max-w-6xl justify-end">
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
        </div>
      )}

      {showPhoneModal && phoneStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                Ooops!
              </h3>
              <button
                type="button"
                onClick={closePhoneModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mb-4 text-sm text-[var(--text)]">
              <span className="font-semibold">{phoneStudent.clientName}</span> não possui um número cadastrado. Deseja incluir agora?
            </p>

            <form onSubmit={handleSavePhone} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Telefone <span className="text-[var(--danger)]">*</span>
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="tel"
                    value={phoneValue}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    required
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 pl-10 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePhoneModal}
                  className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={phoneSaving}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-70"
                >
                  {phoneSaving ? 'Salvando...' : 'Salvar e enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
