import { useEffect, useState } from 'react'
import { Plus, X, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { supabase } from '../services/supabase'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { ConfirmDialog } from '../components/ConfirmDialog'

export function Financial() {
  const [clients, setClients] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    client_id: '',
    amount: '',
    type: 'entrada',
  })
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [clientsRes, financialRes] = await Promise.all([
        supabase.from('clients').select('id, name').order('name'),
        supabase
          .from('financial')
          .select('*, clients(name)')
          .order('created_at', { ascending: false }),
      ])

      if (clientsRes.error) throw clientsRes.error
      if (financialRes.error) throw financialRes.error

      setClients(clientsRes.data || [])
      setTransactions(financialRes.data || [])
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar financeiro: ${detail}`)
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
    setForm({ client_id: '', amount: '', type: 'entrada' })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const value = parseFloat(form.amount)
    const payload = {
      client_id: form.client_id,
      amount: form.type === 'saida' ? -Math.abs(value) : Math.abs(value),
    }

    try {
      const { error: supaError } = await supabase.from('financial').insert(payload)
      if (supaError) throw supaError
      setShowForm(false)
      setForm({ client_id: '', amount: '', type: 'entrada' })
      await loadData()
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
      const { error: supaError } = await supabase
        .from('financial')
        .delete()
        .eq('id', deleteId)
      if (supaError) throw supaError
      await loadData()
    } catch (err) {
      setError('Erro ao excluir movimentação.')
      console.error(err)
    } finally {
      setDeleteId(null)
    }
  }

  const total = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Movimentação Financeira"
          description="Controle entradas e saídas do estúdio."
        />
        <button
          type="button"
          onClick={openNew}
          className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          Nova movimentação
        </button>
      </div>

      <ErrorMessage message={error} />

      <div className="mb-6 rounded-xl bg-[var(--surface)] p-5 shadow-sm">
        <p className="text-sm text-slate-500">Saldo total</p>
        <p
          className={`text-3xl font-bold ${
            total >= 0 ? 'text-emerald-600' : 'text-[var(--danger)]'
          }`}
        >
          R$ {total.toFixed(2)}
        </p>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-hidden rounded-xl bg-[var(--surface)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Aluno</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium text-right">Valor</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Nenhuma movimentação encontrada.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    const isIncome = (transaction.amount || 0) >= 0
                    return (
                      <tr key={transaction.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--text-heading)]">
                          {transaction.clients?.name || '-'}
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
                                <ArrowDownCircle size={12} /> Entrada
                              </>
                            ) : (
                              <>
                                <ArrowUpCircle size={12} /> Saída
                              </>
                            )}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium ${
                            isIncome ? 'text-emerald-600' : 'text-[var(--danger)]'
                          }`}
                        >
                          R$ {Math.abs(transaction.amount || 0).toFixed(2)}
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
                    Entrada
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
                    Saída
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
