import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, X, Phone, Calendar, Clock, Trash } from 'lucide-react'
import { supabase } from '../services/supabase'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { ConfirmDialog } from '../components/ConfirmDialog'

const emptyClient = {
  name: '',
  phone: '',
  birth_date: '',
  start_date: '',
  monthly_fee: '',
  observations: '',
  status: 'ativo',
}

const weekDayOptions = [
  { value: 'segunda', label: 'Segunda-feira', short: 'SEG' },
  { value: 'terca', label: 'Terça-feira', short: 'TER' },
  { value: 'quarta', label: 'Quarta-feira', short: 'QUA' },
  { value: 'quinta', label: 'Quinta-feira', short: 'QUI' },
  { value: 'sexta', label: 'Sexta-feira', short: 'SEX' },
  { value: 'sabado', label: 'Sábado', short: 'SAB' },
  { value: 'domingo', label: 'Domingo', short: 'DOM' },
]

function getShortDay(value) {
  return weekDayOptions.find((d) => d.value === value)?.short || value
}

export function Clients() {
  const [clients, setClients] = useState([])
  const [contacts, setContacts] = useState([])
  const [trainingDays, setTrainingDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyClient)
  const [editingId, setEditingId] = useState(null)
  const [formContacts, setFormContacts] = useState([])
  const [formTrainingDays, setFormTrainingDays] = useState([])
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [clientsRes, contactsRes, trainingRes] = await Promise.all([
        supabase.from('clients').select('*').order('name', { ascending: true }),
        supabase.from('contacts').select('*'),
        supabase.from('training_days').select('*'),
      ])

      if (clientsRes.error) throw clientsRes.error
      if (contactsRes.error) throw contactsRes.error
      if (trainingRes.error) throw trainingRes.error

      setClients(clientsRes.data || [])
      setContacts(contactsRes.data || [])
      setTrainingDays(trainingRes.data || [])
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar dados: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = showInactive || c.status === 'ativo'
    return matchesSearch && matchesStatus
  })

  function getClientContacts(clientId) {
    return contacts.filter((c) => c.client_id === clientId)
  }

  function getClientTrainingDays(clientId) {
    return trainingDays.filter((t) => t.client_id === clientId)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function openNew() {
    setForm(emptyClient)
    setEditingId(null)
    setFormContacts([])
    setFormTrainingDays([])
    setShowForm(true)
  }

  function openEdit(client) {
    setForm({
      name: client.name || '',
      phone: client.phone || '',
      birth_date: client.birth_date || '',
      start_date: client.start_date || '',
      monthly_fee: client.monthly_fee || '',
      observations: client.observations || '',
      status: client.status || 'ativo',
    })
    setEditingId(client.id)
    setFormContacts(
      getClientContacts(client.id).map((c) => ({
        id: c.id,
        name: c.name || '',
        phone: c.phone || '',
      })),
    )
    setFormTrainingDays(
      getClientTrainingDays(client.id).map((t) => ({
        id: t.id,
        week_day: t.week_day || 'segunda',
        training_time: t.training_time ? t.training_time.slice(0, 5) : '',
      })),
    )
    setShowForm(true)
  }

  // Contatos
  function addContact() {
    setFormContacts((prev) => [...prev, { name: '', phone: '' }])
  }

  function updateContact(index, field, value) {
    setFormContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    )
  }

  function removeContact(index) {
    setFormContacts((prev) => prev.filter((_, i) => i !== index))
  }

  // Dias de treino
  function addTrainingDay() {
    setFormTrainingDays((prev) => [
      ...prev,
      { week_day: 'segunda', training_time: '' },
    ])
  }

  function updateTrainingDay(index, field, value) {
    setFormTrainingDays((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    )
  }

  function removeTrainingDay(index) {
    setFormTrainingDays((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      phone: form.phone || null,
      birth_date: form.birth_date || null,
      start_date: form.start_date || null,
      monthly_fee: form.monthly_fee ? parseFloat(form.monthly_fee) : null,
      observations: form.observations || null,
      status: form.status || 'ativo',
    }

    try {
      let clientId = editingId

      if (editingId) {
        const { error: updateError } = await supabase
          .from('clients')
          .update(payload)
          .eq('id', editingId)
        if (updateError) throw updateError
      } else {
        const { data: newClient, error: insertError } = await supabase
          .from('clients')
          .insert(payload)
          .select('id')
          .single()
        if (insertError) throw insertError
        clientId = newClient.id
      }

      // Substitui contatos
      const { error: deleteContactsError } = await supabase
        .from('contacts')
        .delete()
        .eq('client_id', clientId)
      if (deleteContactsError) throw deleteContactsError

      const contactsToInsert = formContacts
        .filter((c) => c.name.trim() || c.phone.trim())
        .map((c) => ({
          client_id: clientId,
          name: c.name.trim() || null,
          phone: c.phone.trim() || null,
        }))

      if (contactsToInsert.length > 0) {
        const { error: contactsInsertError } = await supabase
          .from('contacts')
          .insert(contactsToInsert)
        if (contactsInsertError) throw contactsInsertError
      }

      // Substitui dias de treino
      const { error: deleteTrainingError } = await supabase
        .from('training_days')
        .delete()
        .eq('client_id', clientId)
      if (deleteTrainingError) throw deleteTrainingError

      const trainingToInsert = formTrainingDays
        .filter((t) => t.training_time.trim())
        .map((t) => ({
          client_id: clientId,
          week_day: t.week_day,
          training_time: t.training_time + ':00',
        }))

      if (trainingToInsert.length > 0) {
        const { error: trainingInsertError } = await supabase
          .from('training_days')
          .insert(trainingToInsert)
        if (trainingInsertError) throw trainingInsertError
      }

      setShowForm(false)
      setForm(emptyClient)
      setEditingId(null)
      setFormContacts([])
      setFormTrainingDays([])
      await loadData()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao salvar aluno: ${detail}`)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      const { error: supaError } = await supabase
        .from('clients')
        .delete()
        .eq('id', deleteId)
      if (supaError) throw supaError
      await loadData()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao excluir aluno: ${detail}`)
      console.error(err)
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Cadastro de Alunos"
          description="Gerencie os alunos, contatos e dias de treino do seu estúdio."
        />
        <button
          type="button"
          onClick={openNew}
          className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          Novo aluno
        </button>
      </div>

      <ErrorMessage message={error} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[var(--primary)] accent-[var(--primary)] focus:ring-[var(--primary)]"
          />
          Exibir inativos
        </label>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="rounded-xl bg-[var(--surface)] p-8 text-center text-slate-500 shadow-sm">
              Nenhum aluno encontrado.
            </div>
          ) : (
            filteredClients.map((client) => {
              const clientContacts = getClientContacts(client.id)
              const clientTraining = getClientTrainingDays(client.id)
              return (
                <div
                  key={client.id}
                  className="rounded-xl bg-[var(--surface)] p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--text-heading)]">
                          {client.name}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            client.status === 'ativo'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs text-slate-500">Telefone</p>
                          <p className="font-medium text-[var(--text-heading)]">
                            {client.phone || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Mensalidade</p>
                          <p className="font-medium text-[var(--text-heading)]">
                            {client.monthly_fee
                              ? `R$ ${Number(client.monthly_fee).toFixed(2)}`
                              : '-'}
                          </p>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-2">
                          <p className="text-xs text-slate-500">Dias de treino</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {clientTraining.length === 0 ? (
                              <span className="text-sm text-slate-400">-</span>
                            ) : (
                              clientTraining
                                .slice()
                                .sort((a, b) => {
                                  const order = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
                                  return order.indexOf(a.week_day) - order.indexOf(b.week_day)
                                })
                                .map((d, idx) => {
                                  const time = d.training_time ? d.training_time.slice(0, 5) : '--:--'
                                  return (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700"
                                    >
                                      {getShortDay(d.week_day)} {time}
                                    </span>
                                  )
                                })
                            )}
                          </div>
                        </div>
                      </div>

                      {(clientContacts.length > 0 || client.observations) && (
                        <div className="mt-3 border-t border-[var(--border)] pt-3 text-sm">
                          {clientContacts.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-slate-500">Contatos</p>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {clientContacts.map((c) => (
                                  <span
                                    key={c.id}
                                    className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600"
                                  >
                                    <Phone size={12} />
                                    {c.name || 'Contato'}
                                    {c.phone && `: ${c.phone}`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {client.observations && (
                            <p className="text-slate-500">{client.observations}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 md:flex-col">
                      <button
                        type="button"
                        onClick={() => openEdit(client)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50 md:flex-initial"
                      >
                        <Pencil size={16} />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(client.id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-2 text-sm font-medium text-[var(--danger)] hover:bg-red-100 md:flex-initial"
                      >
                        <Trash2 size={16} />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                {editingId ? 'Editar aluno' : 'Novo aluno'}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Nome <span className="text-[var(--danger)]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Data de nascimento
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={form.birth_date}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Data de início
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Mensalidade (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="monthly_fee"
                    value={form.monthly_fee}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Observações
                  </label>
                  <input
                    type="text"
                    name="observations"
                    value={form.observations}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>
              </div>
              {/* Contatos */}
              <div className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-heading)]">
                    <Phone size={16} />
                    Contatos de emergência
                  </h4>
                  <button
                    type="button"
                    onClick={addContact}
                    className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-medium text-[var(--primary)] shadow-sm hover:bg-slate-50"
                  >
                    <Plus size={14} />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-3">
                  {formContacts.length === 0 && (
                    <p className="text-xs text-slate-500">Nenhum contato cadastrado.</p>
                  )}
                  {formContacts.map((contact, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updateContact(index, 'name', e.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => updateContact(index, 'phone', e.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-[var(--danger)]"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dias de treino */}
              <div className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-heading)]">
                    <Calendar size={16} />
                    Dias de treino
                  </h4>
                  <button
                    type="button"
                    onClick={addTrainingDay}
                    className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-medium text-[var(--primary)] shadow-sm hover:bg-slate-50"
                  >
                    <Plus size={14} />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-3">
                  {formTrainingDays.length === 0 && (
                    <p className="text-xs text-slate-500">Nenhum dia de treino cadastrado.</p>
                  )}
                  {formTrainingDays.map((day, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Dia da semana
                        </label>
                        <select
                          value={day.week_day}
                          onChange={(e) =>
                            updateTrainingDay(index, 'week_day', e.target.value)
                          }
                          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                        >
                          {weekDayOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Horário
                        </label>
                        <div className="relative">
                          <Clock
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="time"
                            value={day.training_time}
                            onChange={(e) =>
                              updateTrainingDay(index, 'training_time', e.target.value)
                            }
                            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 pl-9 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTrainingDay(index)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-[var(--danger)]"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  ))}
                </div>
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

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir aluno"
        message="Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
