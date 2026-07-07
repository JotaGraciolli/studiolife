import { useEffect, useState } from 'react'
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
  weight: '',
  height: '',
  torax: '',
  waist: '',
  abdomen: '',
  hip: '',
  forearm_left: '',
  forearm_right: '',
  arm_left: '',
  arm_right: '',
  thigh_left: '',
  thigh_right: '',
  calf_left: '',
  calf_right: '',
}

const measureFields = [
  { name: 'weight', label: 'Peso (kg)' },
  { name: 'height', label: 'Altura (m)' },
  { name: 'torax', label: 'Tórax' },
  { name: 'waist', label: 'Cintura' },
  { name: 'abdomen', label: 'Abdômen' },
  { name: 'hip', label: 'Quadril' },
  { name: 'forearm_left', label: 'Antebraço Esq' },
  { name: 'forearm_right', label: 'Antebraço Dir' },
  { name: 'arm_left', label: 'Braço Esq' },
  { name: 'arm_right', label: 'Braço Dir' },
  { name: 'thigh_left', label: 'Coxa Esq' },
  { name: 'thigh_right', label: 'Coxa Dir' },
  { name: 'calf_left', label: 'Panturrilha Esq' },
  { name: 'calf_right', label: 'Panturrilha Dir' },
]

export function Evaluations() {
  const [clients, setClients] = useState([])
  const [evaluations, setEvaluations] = useState([])
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
      const [clientsRes, evaluationsRes] = await Promise.all([
        supabase.from('clients').select('id, name').eq('status', 'ativo').order('name'),
        supabase
          .from('evaluations')
          .select('*')
          .order('created_at', { ascending: false }),
      ])

      if (clientsRes.error) throw clientsRes.error
      if (evaluationsRes.error) throw evaluationsRes.error

      setClients(clientsRes.data || [])
      setEvaluations(evaluationsRes.data || [])
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar dados: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

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

  function formatDate(dateString) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function openCreate(clientId = '') {
    setForm({ ...emptyEvaluation, client_id: clientId })
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
      created_at: evaluation.created_at
        ? new Date(evaluation.created_at).toISOString().slice(0, 16)
        : '',
      weight: evaluation.weight || '',
      height: evaluation.height || '',
      torax: evaluation.torax || '',
      waist: evaluation.waist || '',
      abdomen: evaluation.abdomen || '',
      hip: evaluation.hip || '',
      forearm_left: evaluation.forearm_left || '',
      forearm_right: evaluation.forearm_right || '',
      arm_left: evaluation.arm_left || '',
      arm_right: evaluation.arm_right || '',
      thigh_left: evaluation.thigh_left || '',
      thigh_right: evaluation.thigh_right || '',
      calf_left: evaluation.calf_left || '',
      calf_right: evaluation.calf_right || '',
    }
  }

  function closeModal() {
    setModalMode(null)
    setForm(emptyEvaluation)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const payload = {
      client_id: form.client_id,
      created_at: form.created_at ? new Date(form.created_at).toISOString() : new Date().toISOString(),
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      torax: form.torax ? parseFloat(form.torax) : null,
      waist: form.waist ? parseFloat(form.waist) : null,
      abdomen: form.abdomen ? parseFloat(form.abdomen) : null,
      hip: form.hip ? parseFloat(form.hip) : null,
      forearm_left: form.forearm_left ? parseFloat(form.forearm_left) : null,
      forearm_right: form.forearm_right ? parseFloat(form.forearm_right) : null,
      arm_left: form.arm_left ? parseFloat(form.arm_left) : null,
      arm_right: form.arm_right ? parseFloat(form.arm_right) : null,
      thigh_left: form.thigh_left ? parseFloat(form.thigh_left) : null,
      thigh_right: form.thigh_right ? parseFloat(form.thigh_right) : null,
      calf_left: form.calf_left ? parseFloat(form.calf_left) : null,
      calf_right: form.calf_right ? parseFloat(form.calf_right) : null,
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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Cadastro de Avaliações"
          description="Gerencie as avaliações corporais dos alunos ativos."
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
                    <div className="flex items-center gap-2 text-sm text-[var(--text-heading)]">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="font-medium">{formatDate(evaluation.created_at)}</span>
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
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Aluno</p>
                  <p className="font-medium text-[var(--text-heading)]">
                    {getClientName(form.client_id)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Data</p>
                  <p className="font-medium text-[var(--text-heading)]">
                    {formatDate(form.created_at)}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {measureFields.map((field) => {
                    const value = form[field.name]
                    return value ? (
                      <div key={field.name} className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">{field.label}</p>
                        <p className="font-medium text-[var(--text-heading)]">
                          {Number(value).toFixed(2)} {field.name === 'weight' ? 'kg' : field.name === 'height' ? 'm' : 'cm'}
                        </p>
                      </div>
                    ) : null
                  })}
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
                      onChange={handleChange}
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
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-[var(--border)] px-3 py-2 pl-9 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {measureFields.map((field) => (
                    <div key={field.name}>
                      <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                        {field.label}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                      />
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
