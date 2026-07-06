import { useEffect, useState } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import { supabase } from '../services/supabase'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { ConfirmDialog } from '../components/ConfirmDialog'

const emptyEvaluation = {
  client_id: '',
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

export function Evaluations() {
  const [clients, setClients] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
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
        supabase.from('clients').select('id, name').order('name'),
        supabase
          .from('evaluations')
          .select('*, clients(name)')
          .order('created_at', { ascending: false }),
      ])

      if (clientsRes.error) throw clientsRes.error
      if (evaluationsRes.error) throw evaluationsRes.error

      setClients(clientsRes.data || [])
      setEvaluations(evaluationsRes.data || [])
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar avaliações: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function openNew() {
    setForm(emptyEvaluation)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      client_id: form.client_id,
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
      const { error: supaError } = await supabase.from('evaluations').insert(payload)
      if (supaError) throw supaError
      setShowForm(false)
      setForm(emptyEvaluation)
      await loadData()
    } catch (err) {
      setError('Erro ao salvar avaliação.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      const { error: supaError } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', deleteId)
      if (supaError) throw supaError
      await loadData()
    } catch (err) {
      setError('Erro ao excluir avaliação.')
      console.error(err)
    } finally {
      setDeleteId(null)
    }
  }

  const fields = [
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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Cadastro de Avaliações"
          description="Registre as medidas corporais dos alunos."
        />
        <button
          type="button"
          onClick={openNew}
          className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          Nova avaliação
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          {evaluations.length === 0 ? (
            <div className="rounded-xl bg-[var(--surface)] p-8 text-center text-slate-500 shadow-sm">
              Nenhuma avaliação cadastrada.
            </div>
          ) : (
            evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="rounded-xl bg-[var(--surface)] p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--text-heading)]">
                      {evaluation.clients?.name || 'Aluno não encontrado'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(evaluation.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteId(evaluation.id)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                  {fields.map((field) => {
                    const value = evaluation[field.name]
                    return value ? (
                      <div
                        key={field.name}
                        className="rounded-lg bg-slate-50 px-3 py-2"
                      >
                        <p className="text-xs text-slate-500">{field.label}</p>
                        <p className="font-medium text-[var(--text-heading)]">
                          {Number(value).toFixed(2)} cm
                        </p>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                Nova avaliação
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
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {fields.map((field) => (
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
        title="Excluir avaliação"
        message="Tem certeza que deseja excluir esta avaliação?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
