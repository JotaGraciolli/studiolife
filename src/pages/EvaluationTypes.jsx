import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, X, Save, ClipboardList, ChevronRight } from 'lucide-react'
import { supabase } from '../services/supabase'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { ConfirmDialog } from '../components/ConfirmDialog'

function sortFields(fields) {
  return [...(fields || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
}

function generateFieldKey(label, existingKeys) {
  const base =
    (label || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'campo'

  let key = base
  let counter = 2
  while (existingKeys.has(key)) {
    key = `${base}_${counter}`
    counter += 1
  }
  return key
}

const emptyTypeForm = { id: null, name: '' }
const emptyFieldForm = { id: null, label: '', unit: '', data_type: 'number' }

export function EvaluationTypes() {
  const [types, setTypes] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [typeForm, setTypeForm] = useState(emptyTypeForm)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [fieldForm, setFieldForm] = useState(emptyFieldForm)
  const [fieldTypeId, setFieldTypeId] = useState(null)
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [manageTypeId, setManageTypeId] = useState(null)
  const [showManageModal, setShowManageModal] = useState(false)
  const [deleteTypeId, setDeleteTypeId] = useState(null)
  const [deleteFieldId, setDeleteFieldId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [typesRes, evaluationsRes] = await Promise.all([
        supabase.from('evaluation_type').select('*, evaluation_type_field(*)').order('created_at', { ascending: false }),
        supabase.from('evaluations').select('id, evaluation_type_id'),
      ])

      if (typesRes.error) throw typesRes.error
      if (evaluationsRes.error) throw evaluationsRes.error

      setTypes(typesRes.data || [])
      setEvaluations(evaluationsRes.data || [])
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar dados: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const usageCountByType = useMemo(() => {
    const counts = {}
    evaluations.forEach((evaluation) => {
      if (!evaluation.evaluation_type_id) return
      counts[evaluation.evaluation_type_id] = (counts[evaluation.evaluation_type_id] || 0) + 1
    })
    return counts
  }, [evaluations])

  const manageType = types.find((t) => t.id === manageTypeId) || null

  function showSuccess(message) {
    setSuccess(message)
    setTimeout(() => setSuccess(''), 4000)
  }

  // ---- Tipos (modal) ----

  function openNewType() {
    setTypeForm(emptyTypeForm)
    setShowTypeModal(true)
  }

  function openEditType(type) {
    setTypeForm({ id: type.id, name: type.name })
    setShowTypeModal(true)
  }

  function closeTypeModal() {
    setShowTypeModal(false)
    setTypeForm(emptyTypeForm)
  }

  async function handleSubmitType(e) {
    e.preventDefault()
    if (!typeForm.name.trim()) return
    setSaving(true)
    setError('')
    try {
      if (typeForm.id) {
        const { error: updateError } = await supabase
          .from('evaluation_type')
          .update({ name: typeForm.name.trim() })
          .eq('id', typeForm.id)
        if (updateError) throw updateError
        showSuccess('Tipo atualizado!')
        closeTypeModal()
        await loadData()
      } else {
        // Cria o tipo e já abre a gestão de campos dele.
        const { data: inserted, error: insertError } = await supabase
          .from('evaluation_type')
          .insert({ name: typeForm.name.trim() })
          .select('id')
          .single()
        if (insertError) throw insertError
        showSuccess('Tipo criado! Agora adicione os campos.')
        closeTypeModal()
        await loadData()
        openManage(inserted.id)
      }
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao salvar tipo: ${detail}`)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteType() {
    if (!deleteTypeId) return
    try {
      const { error: deleteError } = await supabase
        .from('evaluation_type')
        .delete()
        .eq('id', deleteTypeId)
      if (deleteError) throw deleteError
      showSuccess('Tipo excluído!')
      if (manageTypeId === deleteTypeId) closeManage()
      await loadData()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao excluir tipo: ${detail}`)
      console.error(err)
    } finally {
      setDeleteTypeId(null)
    }
  }

  // ---- Gestão de campos de um tipo (modal) ----

  function openManage(typeId) {
    setManageTypeId(typeId)
    setShowManageModal(true)
  }

  function closeManage() {
    setShowManageModal(false)
    setManageTypeId(null)
  }

  // ---- Campos (modal) ----

  function openNewField(typeId) {
    setFieldTypeId(typeId)
    setFieldForm(emptyFieldForm)
    setShowFieldModal(true)
  }

  function openEditField(typeId, field) {
    setFieldTypeId(typeId)
    setFieldForm({
      id: field.id,
      label: field.label,
      unit: field.unit || '',
      data_type: field.data_type || 'number',
    })
    setShowFieldModal(true)
  }

  function closeFieldModal() {
    setShowFieldModal(false)
    setFieldTypeId(null)
    setFieldForm(emptyFieldForm)
  }

  async function handleSubmitField(e) {
    e.preventDefault()
    if (!fieldTypeId || !fieldForm.label.trim()) return
    setSaving(true)
    setError('')
    try {
      if (fieldForm.id) {
        const { error: updateError } = await supabase
          .from('evaluation_type_field')
          .update({
            label: fieldForm.label.trim(),
            unit: fieldForm.unit.trim() || null,
            data_type: fieldForm.data_type,
          })
          .eq('id', fieldForm.id)
        if (updateError) throw updateError
        showSuccess('Campo atualizado!')
      } else {
        const type = types.find((t) => t.id === fieldTypeId)
        const existingKeys = new Set((type?.evaluation_type_field || []).map((f) => f.field_key))
        const nextOrder = (type?.evaluation_type_field || []).length + 1
        const { error: insertError } = await supabase.from('evaluation_type_field').insert({
          evaluation_type_id: fieldTypeId,
          field_key: generateFieldKey(fieldForm.label, existingKeys),
          label: fieldForm.label.trim(),
          unit: fieldForm.unit.trim() || null,
          data_type: fieldForm.data_type,
          sort_order: nextOrder,
        })
        if (insertError) throw insertError
        showSuccess('Campo adicionado!')
      }
      closeFieldModal()
      await loadData()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao salvar campo: ${detail}`)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteField() {
    if (!deleteFieldId) return
    try {
      const { error: deleteError } = await supabase
        .from('evaluation_type_field')
        .delete()
        .eq('id', deleteFieldId)
      if (deleteError) throw deleteError
      showSuccess('Campo excluído!')
      await loadData()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao excluir campo: ${detail}`)
      console.error(err)
    } finally {
      setDeleteFieldId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Tipos de Avaliação"
          description="Defina os modelos de avaliação e os campos de cada um. As avaliações cadastradas usam esses modelos."
        />
        <button
          type="button"
          onClick={openNewType}
          className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
        >
          <Plus size={18} />
          Novo tipo
        </button>
      </div>

      <ErrorMessage message={error} />
      {success && (
        <div className="mb-4 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : types.length === 0 ? (
        <div className="rounded-xl bg-[var(--surface)] p-8 text-center text-slate-500 shadow-sm">
          Nenhum tipo de avaliação cadastrado. Clique em "Novo tipo" para começar.
        </div>
      ) : (
        <div className="space-y-3">
          {types.map((type) => {
            const fieldCount = (type.evaluation_type_field || []).length
            const usageCount = usageCountByType[type.id] || 0

            return (
              <div
                key={type.id}
                className="flex items-center gap-3 rounded-xl bg-[var(--surface)] p-4 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => openManage(type.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                  title="Ver e editar campos"
                >
                  <ClipboardList size={20} className="shrink-0 text-[var(--primary)]" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-[var(--text-heading)]">
                      {type.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {fieldCount} campo{fieldCount !== 1 ? 's' : ''}
                      <span className="mx-1 text-slate-300">·</span>
                      {usageCount} avaliaç{usageCount !== 1 ? 'ões' : 'ão'}
                    </p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-slate-400" />
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditType(type)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                    title="Renomear tipo"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTypeId(type.id)}
                    disabled={usageCount > 0}
                    title={usageCount > 0 ? 'Tipo em uso por avaliações não pode ser excluído' : 'Excluir tipo'}
                    className="rounded-lg p-2 text-slate-500 hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Gestão de campos do tipo selecionado */}
      {showManageModal && manageType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                Campos: {manageType.name}
              </h3>
              <button
                type="button"
                onClick={closeManage}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {sortFields(manageType.evaluation_type_field).length === 0 ? (
              <p className="mb-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                Nenhum campo definido. Clique em "Novo campo" para adicionar o primeiro.
              </p>
            ) : (
              <div className="mb-4 overflow-hidden rounded-lg border border-[var(--border)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Campo</th>
                      <th className="px-4 py-2 font-medium">Unidade</th>
                      <th className="px-4 py-2 font-medium">Tipo de dado</th>
                      <th className="px-4 py-2 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {sortFields(manageType.evaluation_type_field).map((field) => (
                      <tr key={field.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium text-[var(--text-heading)]">
                          {field.label}
                        </td>
                        <td className="px-4 py-2 text-slate-500">{field.unit || '-'}</td>
                        <td className="px-4 py-2 text-slate-500">
                          {field.data_type === 'number'
                            ? 'Número'
                            : field.data_type === 'boolean'
                            ? 'Sim/Não'
                            : field.data_type === 'scale'
                            ? 'Escala (0-5)'
                            : 'Texto'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => openEditField(manageType.id, field)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                            title="Editar campo"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteFieldId(field.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
                            title="Excluir campo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => openNewField(manageType.id)}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
              >
                <Plus size={16} />
                Novo campo
              </button>
              <button
                type="button"
                onClick={closeManage}
                className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Criar / renomear tipo */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                {typeForm.id ? 'Renomear tipo' : 'Novo tipo de avaliação'}
              </h3>
              <button
                type="button"
                onClick={closeTypeModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitType} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Nome do tipo <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  type="text"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex.: Avaliação Postural"
                  required
                  autoFocus
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeTypeModal}
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
          </div>
        </div>
      )}

      {/* Criar / editar campo */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                {fieldForm.id ? 'Editar campo' : 'Novo campo'}
              </h3>
              <button
                type="button"
                onClick={closeFieldModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitField} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Nome do campo <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  type="text"
                  value={fieldForm.label}
                  onChange={(e) => setFieldForm((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="Ex.: Alongamento"
                  required
                  autoFocus
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Unidade
                  </label>
                  <input
                    type="text"
                    value={fieldForm.unit}
                    onChange={(e) => setFieldForm((prev) => ({ ...prev, unit: e.target.value }))}
                    placeholder="cm"
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Tipo de dado
                  </label>
                  <select
                    value={fieldForm.data_type}
                    onChange={(e) => setFieldForm((prev) => ({ ...prev, data_type: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  >
                    <option value="number">Número</option>
                    <option value="text">Texto</option>
                    <option value="boolean">Sim/Não</option>
                    <option value="scale">Escala (0-5)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeFieldModal}
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
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTypeId}
        title="Excluir tipo de avaliação"
        message="Os campos deste tipo também serão excluídos. Avaliações já cadastradas com este tipo não serão apagadas, mas perderão o vínculo com o modelo. Deseja continuar?"
        onConfirm={handleDeleteType}
        onCancel={() => setDeleteTypeId(null)}
      />

      <ConfirmDialog
        open={!!deleteFieldId}
        title="Excluir campo"
        message="Avaliações já registradas manterão o valor deste campo, mas ele deixará de aparecer nos formulários. Deseja continuar?"
        onConfirm={handleDeleteField}
        onCancel={() => setDeleteFieldId(null)}
      />
    </div>
  )
}
