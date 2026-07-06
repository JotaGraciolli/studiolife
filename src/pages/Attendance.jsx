import { useEffect, useState } from 'react'
import { Plus, X, Trash2, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { supabase } from '../services/supabase'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { ConfirmDialog } from '../components/ConfirmDialog'

const statusOptions = [
  { value: 'presente', label: 'Presente', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  { value: 'ausente', label: 'Ausente', color: 'bg-[var(--danger-bg)] text-[var(--danger)]', icon: XCircle },
  { value: 'reposicao', label: 'Reposição', color: 'bg-amber-100 text-amber-700', icon: HelpCircle },
]

export function Attendance() {
  const [clients, setClients] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    client_id: '',
    status: 'presente',
    created_at: new Date().toISOString().slice(0, 16),
  })
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const today = new Date().toISOString().split('T')[0]
      const [clientsRes, attendanceRes] = await Promise.all([
        supabase.from('clients').select('id, name').eq('status', 'ativo').order('name'),
        supabase
          .from('attendance')
          .select('*, clients(name)')
          .gte('created_at', `${today}T00:00:00`)
          .order('created_at', { ascending: false }),
      ])

      if (clientsRes.error) throw clientsRes.error
      if (attendanceRes.error) throw attendanceRes.error

      setClients(clientsRes.data || [])
      setRecords(attendanceRes.data || [])
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar presenças: ${detail}`)
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
    setForm({
      client_id: '',
      status: 'presente',
      created_at: new Date().toISOString().slice(0, 16),
    })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      client_id: form.client_id,
      status: form.status,
      created_at: new Date(form.created_at).toISOString(),
    }

    try {
      const { error: supaError } = await supabase.from('attendance').insert(payload)
      if (supaError) throw supaError
      setShowForm(false)
      await loadData()
    } catch (err) {
      setError('Erro ao salvar presença.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      const { error: supaError } = await supabase
        .from('attendance')
        .delete()
        .eq('id', deleteId)
      if (supaError) throw supaError
      await loadData()
    } catch (err) {
      setError('Erro ao excluir presença.')
      console.error(err)
    } finally {
      setDeleteId(null)
    }
  }

  function getStatusConfig(status) {
    return statusOptions.find((s) => s.value === status) || statusOptions[0]
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Lista de Presença"
          description="Registre a presença dos alunos nas aulas."
        />
        <button
          type="button"
          onClick={openNew}
          className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          Registrar presença
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-hidden rounded-xl bg-[var(--surface)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Horário</th>
                  <th className="px-4 py-3 font-medium">Aluno</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Nenhuma presença registrada hoje.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const config = getStatusConfig(record.status)
                    const Icon = config.icon
                    return (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(record.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--text-heading)]">
                          {record.clients?.name || 'Aluno não encontrado'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
                          >
                            <Icon size={12} />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setDeleteId(record.id)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
                          >
                            <Trash2 size={16} />
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
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                Registrar presença
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

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {statusOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                          form.status === option.value
                            ? option.color.replace('bg-', 'border-').replace('100', '500')
                            : 'border-[var(--border)] bg-white'
                        } ${form.status === option.value ? option.color : 'text-[var(--text)]'}`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={form.status === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <Icon size={16} />
                        {option.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Data e horário
                </label>
                <input
                  type="datetime-local"
                  name="created_at"
                  value={form.created_at}
                  onChange={handleChange}
                  required
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

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir presença"
        message="Tem certeza que deseja excluir este registro de presença?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
