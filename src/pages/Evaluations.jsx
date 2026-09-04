import { useEffect, useMemo, useState } from 'react'
import { Plus, Eye, Pencil, Trash2, X, Save, Calendar, Clock } from 'lucide-react'
import { supabase } from '../services/supabase'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { ConfirmDialog } from '../components/ConfirmDialog'

const emptyEvaluation = {
  id: null,
  client_id: '',
  created_at: new Date().toISOString().slice(0, 16),
  evaluation_type_id: '',
  data: {},
}

function sortFields(fields) {
  return [...(fields || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
}

function formatFieldValue(field, value) {
  if (value == null || value === '') return null
  if (field?.data_type === 'boolean') {
    return value === true || value === 'true' ? 'Sim' : 'Não'
  }
  if (field?.data_type === 'scale') {
    const number = Number(value)
    return Number.isNaN(number) ? null : `${number}/5`
  }
  if (field?.data_type === 'number') {
    const number = Number(value)
    if (Number.isNaN(number)) return null
    const text = Number.isInteger(number) ? String(number) : number.toFixed(2)
    return field?.unit ? `${text} ${field.unit}` : text
  }
  return field?.unit ? `${value} ${field.unit}` : String(value)
}

export function Evaluations() {
  const [clients, setClients] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [evaluationTypes, setEvaluationTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalMode, setModalMode] = useState(null) // 'create' | 'edit' | 'view'
  const [form, setForm] = useState(emptyEvaluation)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [clientsRes, evaluationsRes, typesRes] = await Promise.all([
        supabase.from('clients').select('id, name').eq('status', 'ativo').order('name'),
        supabase
          .from('evaluations')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('evaluation_type').select('*, evaluation_type_field(*)'),
      ])

      if (clientsRes.error) throw clientsRes.error
      if (evaluationsRes.error) throw evaluationsRes.error
      if (typesRes.error) throw typesRes.error

      setClients(clientsRes.data || [])
      setEvaluations(evaluationsRes.data || [])
      setEvaluationTypes(typesRes.data || [])
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar dados: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Mapa de tipos com os campos ordenados para montar formulário e exibição.
  const typesMap = useMemo(() => {
    const map = {}
    evaluationTypes.forEach((type) => {
      map[type.id] = { ...type, fields: sortFields(type.evaluation_type_field) }
    })
    return map
  }, [evaluationTypes])

  const groupedEvaluations = evaluations.reduce((acc, evaluation) => {
    const clientId = evaluation.client_id
    if (!acc[clientId]) {
      acc[clientId] = []
    }
    acc[clientId].push(evaluation)
    return acc
  }, {})

  const clientsWithEvaluations = clients
    .filter((client) => groupedEvaluations[client.id])
    .sort((a, b) => a.name.localeCompare(b.name))

  function getClientName(clientId) {
    return clients.find((c) => c.id === clientId)?.name || 'Aluno não encontrado'
  }

  function getTypeName(typeId) {
    return typesMap[typeId]?.name || 'Tipo não encontrado'
  }

  function formatDate(dateString) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  function openCreate(clientId = '') {
    setForm({
      ...emptyEvaluation,
      client_id: clientId,
      evaluation_type_id: '',
      data: {},
    })
    setModalMode('create')
  }

  function openView(evaluation) {
    setForm(mapEvaluationToForm(evaluation))
    setModalMode('view')
  }

  function openEdit(evaluation) {
    setForm(mapEvaluationToForm(evaluation))
    setModalMode('edit')
  }

  function mapEvaluationToForm(evaluation) {
    return {
      id: evaluation.id,
      client_id: evaluation.client_id,
      evaluation_type_id: evaluation.evaluation_type_id || '',
      created_at: evaluation.created_at
        ? new Date(evaluation.created_at).toISOString().slice(0, 16)
        : '',
      data: evaluation.data || {},
    }
  }

  function closeModal() {
    setModalMode(null)
    setForm(emptyEvaluation)
  }

  function handleFieldChange(fieldKey, value) {
    setForm((prev) => ({ ...prev, data: { ...prev.data, [fieldKey]: value } }))
  }

  function handleTypeChange(e) {
    // Ao trocar o tipo, os valores antigos não se aplicam aos novos campos.
    setForm((prev) => ({ ...prev, evaluation_type_id: e.target.value, data: {} }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const fields = typesMap[form.evaluation_type_id]?.fields || []
    const data = {}
    fields.forEach((field) => {
      const raw = form.data[field.field_key]
      if (raw == null || raw === '') return
      if (field.data_type === 'boolean') {
        if (raw === true || raw === 'true') data[field.field_key] = true
        else if (raw === false || raw === 'false') data[field.field_key] = false
        return
      }
      data[field.field_key] =
        field.data_type === 'number' || field.data_type === 'scale' ? Number(raw) : raw
    })

    const payload = {
      client_id: form.client_id,
      evaluation_type_id: form.evaluation_type_id || null,
      created_at: form.created_at ? new Date(form.created_at).toISOString() : new Date().toISOString(),
      data,
    }

    try {
      if (modalMode === 'edit') {
        const { error: updateError } = await supabase
          .from('evaluations')
          .update(payload)
          .eq('id', form.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('evaluations').insert(payload)
        if (insertError) throw insertError
      }

      setSuccess(modalMode === 'edit' ? 'Avaliação atualizada!' : 'Avaliação cadastrada!')
      closeModal()
      await loadData()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao salvar avaliação: ${detail}`)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      const { error: deleteError } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', deleteId)
      if (deleteError) throw deleteError
      await loadData()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao excluir avaliação: ${detail}`)
      console.error(err)
    } finally {
      setDeleteId(null)
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

  const isView = modalMode === 'view'
  const formFields = typesMap[form.evaluation_type_id]?.fields || []
  const knownFieldKeys = new Set(formFields.map((f) => f.field_key))
  // Valores gravados com campos que o tipo não tem mais (ex.: campo removido do template).
  const orphanEntries = Object.entries(form.data || {}).filter(([key]) => !knownFieldKeys.has(key))

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Cadastro de Avaliações"
          description="Gerencie as avaliações dos alunos ativos."
        />
        <button
          type="button"
          onClick={() => openCreate()}
          className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          Nova avaliação
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {loading ? (
        <Loading />
      ) : clientsWithEvaluations.length === 0 ? (
        <div className="rounded-xl bg-[var(--surface)] p-8 text-center text-slate-500 shadow-sm">
          Nenhuma avaliação cadastrada.
        </div>
      ) : (
        <div className="space-y-4">
          {clientsWithEvaluations.map((client) => (
            <div
              key={client.id}
              className="rounded-xl bg-[var(--surface)] p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                  {client.name}
                </h3>
                <button
                  type="button"
                  onClick={() => openCreate(client.id)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--primary-light)] px-3 py-1.5 text-xs font-medium text-[var(--primary-dark)] hover:bg-teal-100"
                >
                  <Plus size={14} />
                  Nova avaliação
                </button>
              </div>

              <div className="space-y-2">
                {groupedEvaluations[client.id].map((evaluation) => (
                  <div
                    key={evaluation.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-heading)]">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="font-medium">{formatDate(evaluation.created_at)}</span>
                      <span className="rounded-full bg-[var(--primary-light)] px-2 py-0.5 text-xs font-medium text-[var(--primary-dark)]">
                        {getTypeName(evaluation.evaluation_type_id)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openView(evaluation)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        title="Visualizar"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(evaluation)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(evaluation.id)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                {isView
                  ? 'Visualizar avaliação'
                  : modalMode === 'edit'
                  ? 'Editar avaliação'
                  : 'Nova avaliação'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {isView ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Aluno</p>
                    <p className="font-medium text-[var(--text-heading)]">
                      {getClientName(form.client_id)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Tipo de avaliação</p>
                    <p className="font-medium text-[var(--text-heading)]">
                      {getTypeName(form.evaluation_type_id)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Data</p>
                    <p className="font-medium text-[var(--text-heading)]">
                      {formatDate(form.created_at)}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {formFields.map((field) => {
                    const text = formatFieldValue(field, form.data[field.field_key])
                    return text != null ? (
                      <div key={field.id} className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">{field.label}</p>
                        <p className="font-medium text-[var(--text-heading)]">{text}</p>
                      </div>
                    ) : null
                  })}
                  {orphanEntries.map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">{key}</p>
                      <p className="font-medium text-[var(--text-heading)]">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                      Aluno <span className="text-[var(--danger)]">*</span>
                    </label>
                    <select
                      name="client_id"
                      value={form.client_id}
                      onChange={(e) => setForm((prev) => ({ ...prev, client_id: e.target.value }))}
                      required
                      disabled={modalMode === 'edit'}
                      className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] disabled:bg-slate-100"
                    >
                      <option value="">Selecione um aluno</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                      Tipo de avaliação <span className="text-[var(--danger)]">*</span>
                    </label>
                    <select
                      value={form.evaluation_type_id}
                      onChange={handleTypeChange}
                      required
                      disabled={modalMode === 'edit'}
                      className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] disabled:bg-slate-100"
                    >
                      <option value="">Selecione um tipo</option>
                      {evaluationTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                      Data e horário
                    </label>
                    <div className="relative">
                      <Clock
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="datetime-local"
                        name="created_at"
                        value={form.created_at}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, created_at: e.target.value }))
                        }
                        required
                        className="w-full rounded-lg border border-[var(--border)] px-3 py-2 pl-9 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                      />
                    </div>
                  </div>
                </div>

                {form.evaluation_type_id && formFields.length === 0 && (
                  <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                    Este tipo de avaliação ainda não possui campos definidos. Cadastre-os em
                    Avaliações → Tipos de avaliação.
                  </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {formFields.map((field) => (
                    <div key={field.id}>
                      <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                        {field.label}
                        {field.unit ? ` (${field.unit})` : ''}
                      </label>
                      {field.data_type === 'scale' ? (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-[var(--border)] px-3 py-2">
                          {[0, 1, 2, 3, 4, 5].map((option) => (
                            <label
                              key={option}
                              className="flex cursor-pointer items-center gap-1 text-sm text-[var(--text-heading)]"
                            >
                              <input
                                type="radio"
                                name={`scale-${field.id}`}
                                checked={String(form.data[field.field_key] ?? '') === String(option)}
                                onChange={() => handleFieldChange(field.field_key, String(option))}
                                onClick={() => {
                                  if (String(form.data[field.field_key] ?? '') === String(option)) {
                                    handleFieldChange(field.field_key, '')
                                  }
                                }}
                                className="h-4 w-4 border-slate-300 text-[var(--primary)] accent-[var(--primary)]"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : field.data_type === 'boolean' ? (
                        <div className="flex items-center gap-4 rounded-lg border border-[var(--border)] px-3 py-2">
                          {[
                            { value: 'true', label: 'Sim' },
                            { value: 'false', label: 'Não' },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex cursor-pointer items-center gap-1.5 text-sm text-[var(--text-heading)]"
                            >
                              <input
                                type="radio"
                                name={`boolean-${field.id}`}
                                checked={String(form.data[field.field_key] ?? '') === option.value}
                                onChange={() => handleFieldChange(field.field_key, option.value)}
                                onClick={() => {
                                  if (String(form.data[field.field_key] ?? '') === option.value) {
                                    handleFieldChange(field.field_key, '')
                                  }
                                }}
                                className="h-4 w-4 border-slate-300 text-[var(--primary)] accent-[var(--primary)]"
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={field.data_type === 'number' ? 'number' : 'text'}
                          step="0.01"
                          value={form.data[field.field_key] ?? ''}
                          onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-70"
                  >
                    <Save size={16} />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir avaliação"
        message="Tem certeza que deseja excluir esta avaliação?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
