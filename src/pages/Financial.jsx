import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Plus,
  X,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  CalendarPlus,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Settings,
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { ConfirmDialog } from '../components/ConfirmDialog'

const monthOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function parseMonthLabel(label) {
  if (!label) return null
  const [monthShort, year] = label.split('/')
  const monthIndex = monthOrder.indexOf(monthShort)
  if (monthIndex === -1 || !year) return null
  return new Date(parseInt(year, 10), monthIndex, 1)
}

function sortMonthsDescending(months) {
  return [...months].sort((a, b) => {
    const dateA = parseMonthLabel(a.month)
    const dateB = parseMonthLabel(b.month)
    if (!dateA || !dateB) return 0
    return dateB.getTime() - dateA.getTime()
  })
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR')
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

function getCurrentMonthLabel() {
  const now = new Date()
  return `${monthOrder[now.getMonth()]}/${now.getFullYear()}`
}

function getNextMonthLabel(label) {
  const date = parseMonthLabel(label)
  if (!date) return null
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  return `${monthOrder[next.getMonth()]}/${next.getFullYear()}`
}

async function getOrCreateMonthId(monthLabel) {
  const { data: existing, error: findError } = await supabase
    .from('month_end_closing')
    .select('id')
    .eq('month', monthLabel)
    .order('created_at', { ascending: false })
    .maybeSingle()

  if (findError) throw findError
  if (existing?.id) return existing.id

  try {
    const { data: inserted, error: insertError } = await supabase
      .from('month_end_closing')
      .insert({ month: monthLabel })
      .select('id')
      .single()

    if (insertError) throw insertError
    return inserted?.id
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
      return retryExisting?.id
    }
    throw insertErr
  }
}

// Cria débitos de mensalidade (-monthly_fee) no mês informado para todos os
// alunos ativos com mensalidade definida que ainda não possuem débito naquele mês.
// Retorna a quantidade de débitos criados.
async function generateMissingDebits(monthId) {
  const { data: activeClients, error: clientsError } = await supabase
    .from('clients')
    .select('id, monthly_fee')
    .eq('status', 'ativo')

  if (clientsError) throw clientsError

  const billableClients = (activeClients || []).filter((client) => client.monthly_fee > 0)

  const { data: existingTransactions, error: transactionsError } = await supabase
    .from('financial')
    .select('client_id')
    .eq('month_id', monthId)

  if (transactionsError) throw transactionsError

  const existingClientIds = new Set((existingTransactions || []).map((t) => t.client_id))
  const newTransactions = billableClients
    .filter((client) => !existingClientIds.has(client.id))
    .map((client) => ({
      client_id: client.id,
      month_id: monthId,
      amount: -Math.abs(client.monthly_fee),
    }))

  if (newTransactions.length > 0) {
    const { error: insertError } = await supabase.from('financial').insert(newTransactions)
    if (insertError) throw insertError
  }

  return newTransactions.length
}

export function Financial() {
  const [clients, setClients] = useState([])
  const [months, setMonths] = useState([])
  const [transactions, setTransactions] = useState([])
  const [selectedMonthId, setSelectedMonthId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    client_id: '',
    amount: '',
    type: 'entrada',
    month_id: selectedMonthId,
  })
  const [deleteId, setDeleteId] = useState(null)
  const [detailClientId, setDetailClientId] = useState(null)
  const [chargeTemplates, setChargeTemplates] = useState([])
  const [showChargeModal, setShowChargeModal] = useState(false)
  const [chargeClient, setChargeClient] = useState(null)
  const [selectedChargeTemplateId, setSelectedChargeTemplateId] = useState('')
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phoneClient, setPhoneClient] = useState(null)
  const [phoneValue, setPhoneValue] = useState('')
  const [phoneSaving, setPhoneSaving] = useState(false)
  const [showZeroBalance, setShowZeroBalance] = useState(false)
  const [search, setSearch] = useState('')
  const [showManageModal, setShowManageModal] = useState(false)
  const [manageMonthId, setManageMonthId] = useState('')
  const [manageBusy, setManageBusy] = useState('')
  const [manageFeedback, setManageFeedback] = useState(null)
  const [manageConfirm, setManageConfirm] = useState(null)

  const sortedMonths = useMemo(() => sortMonthsDescending(months), [months])

  const nextMonthLabel = useMemo(() => {
    const baseLabel = sortedMonths[0]?.month || getCurrentMonthLabel()
    return getNextMonthLabel(baseLabel)
  }, [sortedMonths])

  const nextMonthExists = months.some((m) => m.month === nextMonthLabel)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [clientsRes, monthsRes] = await Promise.all([
        supabase.from('clients').select('id, name, phone, status').order('name'),
        supabase.from('month_end_closing').select('id, month'),
      ])

      if (clientsRes.error) throw clientsRes.error
      if (monthsRes.error) throw monthsRes.error

      setClients(clientsRes.data || [])
      const loadedMonths = monthsRes.data || []
      setMonths(loadedMonths)

      const { data: templatesData, error: templatesError } = await supabase
        .from('message_templates')
        .select('*')
        .ilike('category', 'Cobrança')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (templatesError) throw templatesError
      setChargeTemplates(templatesData || [])

      const ordered = sortMonthsDescending(loadedMonths)
      if (ordered.length > 0 && !selectedMonthId) {
        setSelectedMonthId(ordered[0].id)
      }
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar financeiro: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedMonthId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (selectedMonthId) {
      loadTransactions(selectedMonthId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonthId])

  async function loadTransactions(monthId) {
    if (!monthId) return
    try {
      const { data, error: supaError } = await supabase
        .from('financial')
        .select('*, clients(name)')
        .eq('month_id', monthId)
        .order('created_at', { ascending: false })

      if (supaError) throw supaError
      setTransactions(data || [])
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar movimentações: ${detail}`)
      console.error(err)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function openNew() {
    setForm({ client_id: '', amount: '', type: 'entrada', month_id: selectedMonthId })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const value = parseFloat(form.amount)
    const payload = {
      client_id: form.client_id,
      month_id: form.month_id || selectedMonthId,
      amount: form.type === 'saida' ? -Math.abs(value) : Math.abs(value),
    }

    try {
      const { error: supaError } = await supabase.from('financial').insert(payload)
      if (supaError) throw supaError
      setShowForm(false)
      setForm({ client_id: '', amount: '', type: 'entrada', month_id: selectedMonthId })
      await loadTransactions(selectedMonthId)
    } catch (err) {
      setError('Erro ao salvar movimentação.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      const { error: supaError } = await supabase.from('financial').delete().eq('id', deleteId)
      if (supaError) throw supaError
      await loadTransactions(selectedMonthId)
    } catch (err) {
      setError('Erro ao excluir movimentação.')
      console.error(err)
    } finally {
      setDeleteId(null)
    }
  }

  function sendWhatsAppMessage(client, template) {
    let message = template?.message || 'Olá {{ALUNO}}, gostaríamos de falar sobre sua mensalidade.'
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

  function openChargeModal(client) {
    setChargeClient(client)
    setSelectedChargeTemplateId(chargeTemplates[0]?.id || '')
    setShowChargeModal(true)
  }

  function closeChargeModal() {
    setShowChargeModal(false)
    setChargeClient(null)
    setSelectedChargeTemplateId('')
  }

  function handleSendCharge() {
    if (!chargeClient || !selectedChargeTemplateId) return

    const template = chargeTemplates.find((t) => t.id === selectedChargeTemplateId)
    if (!template) return

    if (!chargeClient.phone) {
      closeChargeModal()
      openPhoneModal(chargeClient)
      return
    }

    sendWhatsAppMessage(chargeClient, template)
    closeChargeModal()
  }

  function openPhoneModal(client) {
    setPhoneClient(client)
    setPhoneValue(formatPhone(client.phone || ''))
    setShowPhoneModal(true)
  }

  function closePhoneModal() {
    setShowPhoneModal(false)
    setPhoneClient(null)
    setPhoneValue('')
  }

  function handlePhoneChange(e) {
    setPhoneValue(formatPhone(e.target.value))
  }

  async function handleSavePhone(e) {
    e.preventDefault()
    if (!phoneClient) return

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
        .eq('id', phoneClient.id)

      if (supaError) throw supaError

      setClients((prev) => prev.map((c) => (c.id === phoneClient.id ? { ...c, phone: digits } : c)))

      const template = chargeTemplates[0]
      closePhoneModal()
      if (template) {
        sendWhatsAppMessage({ ...phoneClient, phone: digits }, template)
      }
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao salvar telefone: ${detail}`)
      console.error(err)
    } finally {
      setPhoneSaving(false)
    }
  }

  function handleMonthChange(direction) {
    const currentIndex = sortedMonths.findIndex((m) => m.id === selectedMonthId)
    if (currentIndex === -1) return

    const newIndex = direction === 'prev' ? currentIndex + 1 : currentIndex - 1
    if (newIndex >= 0 && newIndex < sortedMonths.length) {
      setSelectedMonthId(sortedMonths[newIndex].id)
    }
  }

  function handleSelectMonth(e) {
    setSelectedMonthId(e.target.value)
  }

  function openManageModal() {
    setManageMonthId(selectedMonthId || sortedMonths[0]?.id || '')
    setManageFeedback(null)
    setShowManageModal(true)
  }

  function closeManageModal() {
    setShowManageModal(false)
    setManageConfirm(null)
    setManageBusy('')
  }

  async function handleStartNewMonth() {
    setManageBusy('newMonth')
    setManageFeedback(null)
    try {
      const monthId = await getOrCreateMonthId(nextMonthLabel)
      if (!monthId) throw new Error('Não foi possível criar o mês.')
      const created = await generateMissingDebits(monthId)
      setManageFeedback({
        kind: 'success',
        text: `Mês ${nextMonthLabel} iniciado com ${created} débito(s) gerado(s).`,
      })
      await loadData()
      setManageMonthId(monthId)
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setManageFeedback({ kind: 'error', text: `Erro ao iniciar novo mês: ${detail}` })
      console.error(err)
    } finally {
      setManageBusy('')
      setManageConfirm(null)
    }
  }

  async function handleGenerateMissing() {
    if (!manageMonthId) return
    setManageBusy('fillDebits')
    setManageFeedback(null)
    try {
      const monthLabel = months.find((m) => m.id === manageMonthId)?.month
      const created = await generateMissingDebits(manageMonthId)
      setManageFeedback({
        kind: 'success',
        text:
          created > 0
            ? `${created} débito(s) faltante(s) gerado(s) para ${monthLabel}.`
            : `Nenhum débito faltante para ${monthLabel}. Todos os alunos ativos já possuem débito.`,
      })
      if (manageMonthId === selectedMonthId) {
        await loadTransactions(selectedMonthId)
      }
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setManageFeedback({ kind: 'error', text: `Erro ao gerar débitos: ${detail}` })
      console.error(err)
    } finally {
      setManageBusy('')
      setManageConfirm(null)
    }
  }

  const groupedByClient = useMemo(() => {
    const map = {}
    transactions.forEach((transaction) => {
      const clientId = transaction.client_id
      const client = clients.find((c) => c.id === clientId)
      if (client?.status === 'pausado') return

      const clientName = transaction.clients?.name || client?.name || '-'
      if (!map[clientId]) {
        map[clientId] = { clientId, clientName, total: 0, credits: 0, debits: 0, transactions: [] }
      }
      const amount = transaction.amount || 0
      map[clientId].total += amount
      if (amount > 0) map[clientId].credits += amount
      if (amount < 0) map[clientId].debits += amount
      map[clientId].transactions.push(transaction)
    })
    return Object.values(map).sort((a, b) => {
      const balanceRank = (total) => {
        if (total < 0) return 0
        if (total > 0) return 1
        return 2
      }
      const rankDiff = balanceRank(a.total) - balanceRank(b.total)
      if (rankDiff !== 0) return rankDiff
      return a.clientName.localeCompare(b.clientName)
    })
  }, [transactions, clients])

  const filteredGroups = useMemo(() => {
    const searchLower = search.toLowerCase()
    return groupedByClient.filter((g) => {
      const matchesSearch = g.clientName.toLowerCase().includes(searchLower)
      const matchesBalance = showZeroBalance || g.total !== 0
      return matchesSearch && matchesBalance
    })
  }, [groupedByClient, showZeroBalance, search])

  const activeTransactions = transactions.filter((t) => {
    const client = clients.find((c) => c.id === t.client_id)
    return client?.status !== 'pausado'
  })

  const total = activeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalCredits = activeTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0)
  const totalDebits = activeTransactions.reduce((sum, t) => sum + (t.amount < 0 ? t.amount : 0), 0)

  const selectedMonth = sortedMonths.find((m) => m.id === selectedMonthId)
  const detailClient = groupedByClient.find((g) => g.clientId === detailClientId)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Movimentação Financeira"
          description="Controle entradas e saídas do estúdio por mês."
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={openManageModal}
            className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50"
          >
            <Settings size={18} />
            Gerenciar
          </button>
          <button
            type="button"
            onClick={openNew}
            className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
          >
            <Plus size={18} />
            Nova movimentação
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="mb-6 rounded-xl bg-[var(--surface)] p-5 shadow-sm">
        <p className="text-sm text-slate-500">Total de créditos do mês</p>
        <p className="text-3xl font-bold text-emerald-600">
          {formatCurrency(totalCredits)}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <span>Total de débitos {formatCurrency(totalDebits)}</span>
          <span className="text-slate-300">|</span>
          <span>Saldo do mês {formatCurrency(total)}</span>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleMonthChange('prev')}
          disabled={sortedMonths.findIndex((m) => m.id === selectedMonthId) >= sortedMonths.length - 1}
          className="rounded-lg border border-[var(--border)] bg-white p-2.5 text-[var(--text)] hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="relative flex-1">
          <Calendar
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={selectedMonthId}
            onChange={handleSelectMonth}
            className="w-full appearance-none rounded-lg border border-[var(--border)] bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-[var(--text-heading)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
          >
            {sortedMonths.map((month) => (
              <option key={month.id} value={month.id}>
                {month.month}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => handleMonthChange('next')}
          disabled={sortedMonths.findIndex((m) => m.id === selectedMonthId) <= 0}
          className="rounded-lg border border-[var(--border)] bg-white p-2.5 text-[var(--text)] hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-heading)] transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                checked={showZeroBalance}
                onChange={(e) => setShowZeroBalance(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[var(--primary)] accent-[var(--primary)] focus:ring-[var(--primary)]"
              />
              Exibir saldo zerado
            </label>
          </div>

          <div className="overflow-hidden rounded-xl bg-[var(--surface)] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Aluno</th>
                    <th className="px-4 py-3 font-medium text-right">Movimentações</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                        Nenhuma movimentação encontrada para {selectedMonth?.month || 'este mês'}.
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group) => {
                    return (
                      <tr key={group.clientId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-[var(--text-heading)]">
                          {group.clientName}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <div className="inline-block whitespace-nowrap text-left">
                            <div className="flex justify-between gap-6">
                              <span className="whitespace-nowrap text-slate-500">Débitos:</span>
                              <span className="whitespace-nowrap font-medium text-slate-700">
                                {formatCurrency(group.debits)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-6">
                              <span className="whitespace-nowrap text-slate-500">Créditos:</span>
                              <span className="whitespace-nowrap font-medium text-emerald-600">
                                {formatCurrency(group.credits)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-6">
                              <span className="whitespace-nowrap text-slate-500">Saldo:</span>
                              <span
                                className={`whitespace-nowrap font-medium ${
                                  group.total >= 0 ? 'text-emerald-600' : 'text-[var(--danger)]'
                                }`}
                              >
                                {formatCurrency(group.total)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setDetailClientId(group.clientId)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[var(--primary)]"
                            title="Ver detalhes"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const client = clients.find((c) => c.id === group.clientId)
                              if (client) openChargeModal(client)
                            }}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[var(--primary)]"
                            title="Enviar mensagem de cobrança"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                Nova movimentação
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Mês <span className="text-[var(--danger)]">*</span>
                </label>
                <select
                  name="month_id"
                  value={form.month_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                >
                  <option value="">Selecione um mês</option>
                  {sortedMonths.map((month) => (
                    <option key={month.id} value={month.id}>
                      {month.month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Aluno <span className="text-[var(--danger)]">*</span>
                </label>
                <select
                  name="client_id"
                  value={form.client_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                >
                  <option value="">Selecione um aluno</option>
                  {clients
                    .filter((client) => client.status !== 'pausado')
                    .map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Tipo
                </label>
                <div className="flex gap-3">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-700">
                    <input
                      type="radio"
                      name="type"
                      value="entrada"
                      checked={form.type === 'entrada'}
                      onChange={handleChange}
                      className="accent-emerald-600"
                    />
                    Crédito
                  </label>
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm has-[:checked]:border-[var(--danger)] has-[:checked]:bg-[var(--danger-bg)] has-[:checked]:text-[var(--danger)]">
                    <input
                      type="radio"
                      name="type"
                      value="saida"
                      checked={form.type === 'saida'}
                      onChange={handleChange}
                      className="accent-[var(--danger)]"
                    />
                    Débito
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Valor (R$) <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  min="0.01"
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-70"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailClientId && detailClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                Detalhes: {detailClient.clientName}
              </h3>
              <button
                type="button"
                onClick={() => setDetailClientId(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-[var(--border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {detailClient.transactions
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                    )
                    .map((transaction) => {
                      const isIncome = (transaction.amount || 0) >= 0
                      return (
                        <tr key={transaction.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-500">
                            {formatDate(transaction.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                isIncome
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-[var(--danger-bg)] text-[var(--danger)]'
                              }`}
                            >
                              {isIncome ? (
                                <>
                                  <ArrowDownCircle size={12} /> Crédito
                                </>
                              ) : (
                                <>
                                  <ArrowUpCircle size={12} /> Débito
                                </>
                              )}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-medium ${
                              isIncome ? 'text-emerald-600' : 'text-[var(--danger)]'
                            }`}
                          >
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setDeleteId(transaction.id)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailClientId(null)}
                className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showChargeModal && chargeClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                Enviar cobrança
              </h3>
              <button
                type="button"
                onClick={closeChargeModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mb-4 text-sm text-[var(--text)]">
              Aluno: <span className="font-semibold">{chargeClient.name}</span>
            </p>

            {chargeTemplates.length === 0 ? (
              <p className="mb-4 text-sm text-slate-500">
                Nenhuma mensagem de cobrança ativa cadastrada. Cadastre uma em Configurações.
              </p>
            ) : (
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Mensagem
                </label>
                <select
                  value={selectedChargeTemplateId}
                  onChange={(e) => setSelectedChargeTemplateId(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                >
                  {chargeTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeChargeModal}
                className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendCharge}
                disabled={!selectedChargeTemplateId || chargeTemplates.length === 0}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-70"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {showPhoneModal && phoneClient && (
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
              <span className="font-semibold">{phoneClient.name}</span> não possui um número cadastrado. Deseja incluir agora?
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

      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                Gerenciar meses
              </h3>
              <button
                type="button"
                onClick={closeManageModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                Mês selecionado
              </label>
              <select
                value={manageMonthId}
                onChange={(e) => setManageMonthId(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
              >
                {sortedMonths.length === 0 && <option value="">Nenhum mês aberto</option>}
                {sortedMonths.map((month) => (
                  <option key={month.id} value={month.id}>
                    {month.month}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setManageConfirm('newMonth')}
                disabled={!!manageBusy || !nextMonthLabel || nextMonthExists}
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-50"
              >
                <CalendarPlus size={18} />
                {nextMonthExists
                  ? `Próximo mês (${nextMonthLabel}) já criado`
                  : `Iniciar novo mês (${nextMonthLabel})`}
              </button>

              <button
                type="button"
                onClick={() => setManageConfirm('fillDebits')}
                disabled={!!manageBusy || !manageMonthId}
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={18} className={manageBusy === 'fillDebits' ? 'animate-spin' : ''} />
                {manageBusy === 'fillDebits' ? 'Gerando...' : 'Gerar débitos faltantes'}
              </button>
            </div>

            {manageFeedback && (
              <p
                className={`mt-4 text-sm ${
                  manageFeedback.kind === 'success' ? 'text-emerald-600' : 'text-[var(--danger)]'
                }`}
              >
                {manageFeedback.text}
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeManageModal}
                className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!manageConfirm}
        title={manageConfirm === 'newMonth' ? 'Iniciar novo mês' : 'Gerar débitos faltantes'}
        message={
          manageConfirm === 'newMonth'
            ? `Será criado o mês ${nextMonthLabel} e gerados os débitos de todos os alunos ativos. Deseja continuar?`
            : 'Serão gerados débitos para os alunos ativos que não possuem débito no mês selecionado. Deseja continuar?'
        }
        onConfirm={manageConfirm === 'newMonth' ? handleStartNewMonth : handleGenerateMissing}
        onCancel={() => setManageConfirm(null)}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir movimentação"
        message="Tem certeza que deseja excluir esta movimentação?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
