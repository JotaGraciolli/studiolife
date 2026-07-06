import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react'
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

export function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyClient)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    setLoading(true)
    setError('')
    try {
      const { data, error: supaError } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true })

      if (supaError) throw supaError
      setClients(data || [])
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar alunos: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()),
  )

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function openNew() {
    setForm(emptyClient)
    setEditingId(null)
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
    setShowForm(true)
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
      if (editingId) {
        const { error: supaError } = await supabase
          .from('clients')
          .update(payload)
          .eq('id', editingId)
        if (supaError) throw supaError
      } else {
        const { error: supaError } = await supabase.from('clients').insert(payload)
        if (supaError) throw supaError
      }
      setShowForm(false)
      setForm(emptyClient)
      setEditingId(null)
      await loadClients()
    } catch (err) {
      setError('Erro ao salvar aluno.')
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
      await loadClients()
    } catch (err) {
      setError('Erro ao excluir aluno.')
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
          description="Gerencie os alunos do seu estúdio."
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

      <div className="mb-6 relative">
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

      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-hidden rounded-xl bg-[var(--surface)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">Mensalidade</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-[var(--text-heading)]">
                        {client.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{client.phone || '-'}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {client.monthly_fee
                          ? `R$ ${Number(client.monthly_fee).toFixed(2)}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            client.status === 'ativo'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(client)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(client.id)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-[var(--surface)] p-6 shadow-lg">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
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

              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                <textarea
                  name="observations"
                  value={form.observations}
                  onChange={handleChange}
                  rows={3}
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
        title="Excluir aluno"
        message="Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
