import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, X, UserX, UserCheck, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { ConfirmDialog } from '../components/ConfirmDialog'

const emptyTemplate = {
  title: '',
  category: '',
  message: '',
  is_active: true,
}

const categories = ['Aniversário', 'Ausência', 'Cobrança']

function formatCharacterCount(value) {
  const count = value?.length || 0
  return `${new Intl.NumberFormat('pt-BR').format(count)} caracteres`
}

export function MessageTemplates() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyTemplate)
  const [editingId, setEditingId] = useState(null)
  const [toggleId, setToggleId] = useState(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    setLoading(true)
    setError('')
    try {
      const { data, error: supaError } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (supaError) throw supaError
      setTemplates(data || [])
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar mensagens: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function openNew() {
    setForm(emptyTemplate)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(template) {
    setForm({
      title: template.title || '',
      category: template.category || '',
      message: template.message || '',
      is_active: template.is_active ?? true,
    })
    setEditingId(template.id)
    setShowForm(true)
  }

  function insertStudentPlaceholder() {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const current = form.message
    const before = current.slice(0, start)
    const after = current.slice(end)
    const placeholder = '{{ALUNO}}'

    const newValue = before + placeholder + after
    setForm((prev) => ({ ...prev, message: newValue }))

    setTimeout(() => {
      const newCursor = start + placeholder.length
      textarea.focus()
      textarea.setSelectionRange(newCursor, newCursor)
    }, 0)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      message: form.message,
      is_active: form.is_active,
    }

    try {
      if (editingId) {
        const { error: supaError } = await supabase
          .from('message_templates')
          .update(payload)
          .eq('id', editingId)
        if (supaError) throw supaError
      } else {
        const { error: supaError } = await supabase.from('message_templates').insert(payload)
        if (supaError) throw supaError
      }

      setShowForm(false)
      setForm(emptyTemplate)
      setEditingId(null)
      await loadTemplates()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao salvar mensagem: ${detail}`)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus() {
    if (!toggleId) return
    const template = templates.find((t) => t.id === toggleId)
    if (!template) return

    const newStatus = !(template.is_active ?? true)

    try {
      const { error: supaError } = await supabase
        .from('message_templates')
        .update({ is_active: newStatus })
        .eq('id', toggleId)
      if (supaError) throw supaError
      await loadTemplates()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao ${newStatus ? 'reativar' : 'inativar'} mensagem: ${detail}`)
      console.error(err)
    } finally {
      setToggleId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="rounded-lg border border-[var(--border)] bg-white p-2 text-[var(--text)] hover:bg-slate-50"
            aria-label="Voltar para configurações"
          >
            <ArrowLeft size={18} />
          </button>
          <PageHeader
            title="Templates de Mensagens"
            description="Cadastre e gerencie modelos de mensagens."
          />
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          Nova mensagem
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : (
        <div className="grid gap-4">
          {templates.length === 0 ? (
            <div className="rounded-xl bg-[var(--surface)] p-8 text-center shadow-sm">
              <p className="text-slate-500">Nenhuma mensagem cadastrada.</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className={`rounded-xl bg-[var(--surface)] p-5 shadow-sm ${
                  !template.is_active ? 'opacity-70' : ''
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[var(--text-heading)]">
                        {template.title || 'Sem título'}
                      </h3>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          template.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {template.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    {template.category && (
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                        {template.category}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap text-sm text-[var(--text)]">
                      {template.message || (
                        <span className="text-slate-400">Nenhuma mensagem.</span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2 md:flex-col">
                    <button
                      type="button"
                      onClick={() => openEdit(template)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50 md:flex-initial"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                    {template.is_active ? (
                      <button
                        type="button"
                        onClick={() => setToggleId(template.id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-2 text-sm font-medium text-[var(--danger)] hover:bg-red-100 md:flex-initial"
                      >
                        <UserX size={16} />
                        Inativar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setToggleId(template.id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 md:flex-initial"
                      >
                        <UserCheck size={16} />
                        Reativar
                      </button>
                    )}
                  </div>
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
                {editingId ? 'Editar mensagem' : 'Nova mensagem'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setForm(emptyTemplate)
                  setEditingId(null)
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Título <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Lembrete de aniversário"
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Categoria <span className="text-[var(--danger)]">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-sm font-medium text-[var(--text-heading)]">
                    Mensagem <span className="text-[var(--danger)]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={insertStudentPlaceholder}
                    className="flex items-center gap-1 rounded-md bg-[var(--primary-light)] px-2 py-1 text-xs font-medium text-[var(--primary-dark)] hover:bg-teal-100"
                  >
                    ALUNO
                  </button>
                </div>
                <textarea
                  ref={textareaRef}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={10}
                  placeholder="Digite aqui a mensagem..."
                  className="w-full resize-y rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {formatCharacterCount(form.message)}
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-heading)]">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Ativa
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setForm(emptyTemplate)
                    setEditingId(null)
                  }}
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
        open={!!toggleId}
        title={
          templates.find((t) => t.id === toggleId)?.is_active
            ? 'Inativar mensagem'
            : 'Reativar mensagem'
        }
        message={
          templates.find((t) => t.id === toggleId)?.is_active
            ? 'Tem certeza que deseja inativar esta mensagem? Ela não será excluída.'
            : 'Tem certeza que deseja reativar esta mensagem?'
        }
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleId(null)}
      />
    </div>
  )
}
