import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, X, Phone, Calendar, Clock, Trash, Stethoscope, Ban, Pill, MapPin } from 'lucide-react'
import { supabase } from '../services/supabase'
import { isEvaluationPending } from '../utils/evaluation'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'

const emptyClient = {
  name: '',
  phone: '',
  cpf: '',
  birth_date: '',
  start_date: '',
  monthly_fee: '',
  observations: '',
  chief_complaint: '',
  goal: '',
  status: 'ativo',
  address_id: null,
}

const emptyAddress = {
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  country: 'Brasil',
  cep: '',
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

function calculateAge(birthDateString) {
  if (!birthDateString) return null
  const birthDate = new Date(birthDateString)
  const today = new Date()

  let years = today.getFullYear() - birthDate.getFullYear()
  let months = today.getMonth() - birthDate.getMonth()

  if (months < 0) {
    years -= 1
    months += 12
  }

  if (today.getDate() < birthDate.getDate()) {
    months -= 1
    if (months < 0) {
      years -= 1
      months += 12
    }
  }

  if (years === 0 && months === 0) {
    return '0 meses'
  }
  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`
  }
  if (months === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'}, ${months} ${months === 1 ? 'mês' : 'meses'}`
}

function formatPhone(value) {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return ''
  if (digits.length <= 2) {
    return `(${digits}`
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

function normalizePhone(value) {
  return value.replace(/\D/g, '').slice(0, 11)
}

function formatCEP(value) {
  if (!value) return ''
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

function normalizeCEP(value) {
  return value.replace(/\D/g, '').slice(0, 8)
}

function formatAddressLine(address) {
  if (!address) return null
  const parts = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    address.city && address.state ? `${address.city} - ${address.state}` : address.city || address.state,
  ].filter(Boolean)
  const cep = address.cep ? `CEP: ${formatCEP(address.cep)}` : null
  if (parts.length === 0 && !cep) return null
  return [...parts, cep].filter(Boolean).join(', ')
}

function DynamicListSection({ title, icon, items, fieldName, placeholder, onAdd, onUpdate, onRemove }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-heading)]">
          {icon}
          {title}
        </h4>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-medium text-[var(--primary)] shadow-sm hover:bg-slate-50"
        >
          <Plus size={14} />
          Adicionar
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-xs text-slate-500">Nenhum registro cadastrado.</p>
        )}
        {items.map((item, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={item[fieldName]}
                onChange={(e) => onUpdate(index, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-[var(--danger)]"
            >
              <Trash size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Clients() {
  const [clients, setClients] = useState([])
  const [contacts, setContacts] = useState([])
  const [trainingDays, setTrainingDays] = useState([])
  const [diagnoses, setDiagnoses] = useState([])
  const [restrictions, setRestrictions] = useState([])
  const [medications, setMedications] = useState([])
  const [addresses, setAddresses] = useState([])
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
  const [formDiagnoses, setFormDiagnoses] = useState([])
  const [formRestrictions, setFormRestrictions] = useState([])
  const [formMedications, setFormMedications] = useState([])
  const [formAddress, setFormAddress] = useState(emptyAddress)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [evaluations, setEvaluations] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [clientsRes, contactsRes, trainingRes, diagnosesRes, restrictionsRes, medicationsRes, evaluationsRes, addressesRes] =
        await Promise.all([
          supabase.from('clients').select('*').order('name', { ascending: true }),
          supabase.from('contacts').select('*'),
          supabase.from('training_days').select('*'),
          supabase.from('diagnoses').select('*'),
          supabase.from('restrictions').select('*'),
          supabase.from('medications').select('*'),
          supabase.from('evaluations').select('id, client_id, created_at'),
          supabase.from('address').select('*'),
        ])

      if (clientsRes.error) throw clientsRes.error
      if (contactsRes.error) throw contactsRes.error
      if (trainingRes.error) throw trainingRes.error
      if (diagnosesRes.error) throw diagnosesRes.error
      if (restrictionsRes.error) throw restrictionsRes.error
      if (medicationsRes.error) throw medicationsRes.error
      if (evaluationsRes.error) throw evaluationsRes.error
      if (addressesRes.error) throw addressesRes.error

      setClients(clientsRes.data || [])
      setContacts(contactsRes.data || [])
      setTrainingDays(trainingRes.data || [])
      setDiagnoses(diagnosesRes.data || [])
      setRestrictions(restrictionsRes.data || [])
      setMedications(medicationsRes.data || [])
      setEvaluations(evaluationsRes.data || [])
      setAddresses(addressesRes.data || [])
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
    const matchesStatus = showInactive || c.status === 'ativo' || c.status === 'pausado'
    return matchesSearch && matchesStatus
  })

  function getClientContacts(clientId) {
    return contacts.filter((c) => c.client_id === clientId)
  }

  function getClientEvaluations(clientId) {
    return evaluations.filter((e) => e.client_id === clientId)
  }

  function getClientTrainingDays(clientId) {
    return trainingDays.filter((t) => t.client_id === clientId)
  }

  function getClientDiagnoses(clientId) {
    return diagnoses.filter((d) => d.client_id === clientId)
  }

  function getClientRestrictions(clientId) {
    return restrictions.filter((r) => r.client_id === clientId)
  }

  function getClientMedications(clientId) {
    return medications.filter((m) => m.client_id === clientId)
  }

  function getClientAddress(clientId) {
    const client = clients.find((c) => c.id === clientId)
    if (!client?.address_id) return null
    return addresses.find((a) => a.id === client.address_id) || null
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
    setFormDiagnoses([])
    setFormRestrictions([])
    setFormMedications([])
    setFormAddress(emptyAddress)
    setEditingAddressId(null)
    setShowForm(true)
  }

  function openEdit(client) {
    setForm({
      name: client.name || '',
      phone: client.phone || '',
      cpf: client.cpf || '',
      birth_date: client.birth_date || '',
      start_date: client.start_date || '',
      monthly_fee: client.monthly_fee || '',
      observations: client.observations || '',
      chief_complaint: client.chief_complaint || '',
      goal: client.goal || '',
      status: client.status || 'ativo',
      address_id: client.address_id || null,
    })
    setEditingId(client.id)

    const clientAddress = getClientAddress(client.id)
    if (clientAddress) {
      setFormAddress({
        street: clientAddress.street || '',
        number: clientAddress.number || '',
        complement: clientAddress.complement || '',
        neighborhood: clientAddress.neighborhood || '',
        city: clientAddress.city || '',
        state: clientAddress.state || '',
        country: clientAddress.country || 'Brasil',
        cep: clientAddress.cep || '',
      })
      setEditingAddressId(clientAddress.id)
    } else {
      setFormAddress(emptyAddress)
      setEditingAddressId(null)
    }

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
        provisional: t.provisional || false,
      })),
    )
    setFormDiagnoses(getClientDiagnoses(client.id).map((d) => ({ id: d.id, diagnose: d.diagnose || '' })))
    setFormRestrictions(getClientRestrictions(client.id).map((r) => ({ id: r.id, restriction: r.restriction || '' })))
    setFormMedications(getClientMedications(client.id).map((m) => ({ id: m.id, medication: m.medication || '' })))
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
      { week_day: 'segunda', training_time: '', provisional: false },
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

  // Diagnósticos
  function addDiagnose() {
    setFormDiagnoses((prev) => [...prev, { diagnose: '' }])
  }

  function updateDiagnose(index, value) {
    setFormDiagnoses((prev) =>
      prev.map((d, i) => (i === index ? { ...d, diagnose: value } : d)),
    )
  }

  function removeDiagnose(index) {
    setFormDiagnoses((prev) => prev.filter((_, i) => i !== index))
  }

  // Restrições
  function addRestriction() {
    setFormRestrictions((prev) => [...prev, { restriction: '' }])
  }

  function updateRestriction(index, value) {
    setFormRestrictions((prev) =>
      prev.map((r, i) => (i === index ? { ...r, restriction: value } : r)),
    )
  }

  function removeRestriction(index) {
    setFormRestrictions((prev) => prev.filter((_, i) => i !== index))
  }

  // Medicações
  function addMedication() {
    setFormMedications((prev) => [...prev, { medication: '' }])
  }

  function updateMedication(index, value) {
    setFormMedications((prev) =>
      prev.map((m, i) => (i === index ? { ...m, medication: value } : m)),
    )
  }

  function removeMedication(index) {
    setFormMedications((prev) => prev.filter((_, i) => i !== index))
  }

  function openAddressModal() {
    setShowAddressModal(true)
  }

  function closeAddressModal() {
    setShowAddressModal(false)
  }

  function handleAddressChange(e) {
    const { name, value } = e.target
    if (name === 'cep') {
      setFormAddress((prev) => ({ ...prev, [name]: normalizeCEP(value) }))
      return
    }
    if (name === 'state') {
      setFormAddress((prev) => ({ ...prev, [name]: value.toUpperCase().slice(0, 2) }))
      return
    }
    setFormAddress((prev) => ({ ...prev, [name]: value }))
  }

  function hasAddressFilled() {
    return (
      formAddress.street.trim() ||
      formAddress.number.trim() ||
      formAddress.complement.trim() ||
      formAddress.neighborhood.trim() ||
      formAddress.city.trim() ||
      formAddress.state.trim() ||
      formAddress.cep.trim()
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const addressPayload = {
      street: formAddress.street.trim() || null,
      number: formAddress.number.trim() || null,
      complement: formAddress.complement.trim() || null,
      neighborhood: formAddress.neighborhood.trim() || null,
      city: formAddress.city.trim() || null,
      state: formAddress.state.trim() || null,
      country: 'Brasil',
      cep: formAddress.cep.trim() || null,
    }

    const hasAddress = hasAddressFilled()

    const payload = {
      name: form.name,
      phone: form.phone || null,
      cpf: form.cpf || null,
      birth_date: form.birth_date || null,
      start_date: form.start_date || null,
      monthly_fee: form.monthly_fee ? parseFloat(form.monthly_fee) : null,
      observations: form.observations || null,
      chief_complaint: form.chief_complaint || null,
      goal: form.goal || null,
      status: form.status || 'ativo',
    }

    try {
      let addressId = editingAddressId

      if (hasAddress) {
        if (editingAddressId) {
          const { error: addressUpdateError } = await supabase
            .from('address')
            .update(addressPayload)
            .eq('id', editingAddressId)
          if (addressUpdateError) throw addressUpdateError
        } else {
          const { data: newAddress, error: addressInsertError } = await supabase
            .from('address')
            .insert(addressPayload)
            .select('id')
            .single()
          if (addressInsertError) throw addressInsertError
          addressId = newAddress.id
        }
      }

      if (addressId) {
        payload.address_id = addressId
      }

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
          provisional: t.provisional || false,
        }))

      if (trainingToInsert.length > 0) {
        const { error: trainingInsertError } = await supabase
          .from('training_days')
          .insert(trainingToInsert)
        if (trainingInsertError) throw trainingInsertError
      }

      // Substitui diagnosticos
      const { error: deleteDiagnosesError } = await supabase
        .from('diagnoses')
        .delete()
        .eq('client_id', clientId)
      if (deleteDiagnosesError) throw deleteDiagnosesError

      const diagnosesToInsert = formDiagnoses
        .filter((d) => d.diagnose.trim())
        .map((d) => ({
          client_id: clientId,
          diagnose: d.diagnose.trim(),
        }))
      if (diagnosesToInsert.length > 0) {
        const { error: diagnosesInsertError } = await supabase
          .from('diagnoses')
          .insert(diagnosesToInsert)
        if (diagnosesInsertError) throw diagnosesInsertError
      }

      // Substitui restricoes
      const { error: deleteRestrictionsError } = await supabase
        .from('restrictions')
        .delete()
        .eq('client_id', clientId)
      if (deleteRestrictionsError) throw deleteRestrictionsError

      const restrictionsToInsert = formRestrictions
        .filter((r) => r.restriction.trim())
        .map((r) => ({
          client_id: clientId,
          restriction: r.restriction.trim(),
        }))
      if (restrictionsToInsert.length > 0) {
        const { error: restrictionsInsertError } = await supabase
          .from('restrictions')
          .insert(restrictionsToInsert)
        if (restrictionsInsertError) throw restrictionsInsertError
      }

      // Substitui medicacoes
      const { error: deleteMedicationsError } = await supabase
        .from('medications')
        .delete()
        .eq('client_id', clientId)
      if (deleteMedicationsError) throw deleteMedicationsError

      const medicationsToInsert = formMedications
        .filter((m) => m.medication.trim())
        .map((m) => ({
          client_id: clientId,
          medication: m.medication.trim(),
        }))
      if (medicationsToInsert.length > 0) {
        const { error: medicationsInsertError } = await supabase
          .from('medications')
          .insert(medicationsToInsert)
        if (medicationsInsertError) throw medicationsInsertError
      }

      setShowForm(false)
      setShowAddressModal(false)
      setForm(emptyClient)
      setEditingId(null)
      setFormContacts([])
      setFormTrainingDays([])
      setFormDiagnoses([])
      setFormRestrictions([])
      setFormMedications([])
      setFormAddress(emptyAddress)
      setEditingAddressId(null)
      await loadData()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao salvar aluno: ${detail}`)
      console.error(err)
    } finally {
      setSaving(false)
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
              const clientEvaluations = getClientEvaluations(client.id)
              const clientAddress = getClientAddress(client.id)
              const addressText = formatAddressLine(clientAddress)
              return (
                <div
                  key={client.id}
                  className="rounded-xl bg-[var(--surface)] p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[var(--text-heading)]">
                          {client.name}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            client.status === 'ativo'
                              ? 'bg-emerald-100 text-emerald-700'
                              : client.status === 'pausado'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {client.status === 'ativo'
                            ? 'Ativo'
                            : client.status === 'pausado'
                            ? 'Pausado'
                            : 'Inativo'}
                        </span>
                        {client.birth_date && (
                          <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {calculateAge(client.birth_date)}
                          </span>
                        )}
                        {isEvaluationPending(clientEvaluations) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            Avaliação pendente
                          </span>
                        )}
                      </div>

                      <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs text-slate-500">Telefone</p>
                          <p className="font-medium text-[var(--text-heading)]">
                            {client.phone ? formatPhone(client.phone) : '-'}
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
                                      {d.provisional && (
                                        <span className="ml-1 text-purple-500">(rep)</span>
                                      )}
                                    </span>
                                  )
                                })
                            )}
                          </div>
                        </div>
                      </div>

                      {(clientContacts.length > 0 || client.observations || addressText) && (
                        <div className="mt-3 border-t border-[var(--border)] pt-3 text-sm">
                          {addressText && (
                            <div className="mb-2">
                              <p className="text-xs text-slate-500">Endereço</p>
                              <p className="font-medium text-[var(--text-heading)]">{addressText}</p>
                            </div>
                          )}
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
                                    {c.phone && `: ${formatPhone(c.phone)}`}
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
                    value={formatPhone(form.phone)}
                    onChange={(e) =>
                      handleChange({
                        target: { name: 'phone', value: normalizePhone(e.target.value) },
                      })
                    }
                    maxLength={15}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    CPF
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={form.cpf}
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
                    <option value="pausado">Pausado</option>
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
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-heading)]">
                    <MapPin size={16} />
                    Endereço
                  </h4>
                  <button
                    type="button"
                    onClick={openAddressModal}
                    className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-medium text-[var(--primary)] shadow-sm hover:bg-slate-50"
                  >
                    <Pencil size={14} />
                    {hasAddressFilled() ? 'Editar endereço' : 'Adicionar endereço'}
                  </button>
                </div>

                {hasAddressFilled() ? (
                  <p className="text-sm text-[var(--text)]">{formatAddressLine(formAddress)}</p>
                ) : (
                  <p className="text-xs text-slate-500">Nenhum endereço cadastrado.</p>
                )}
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Queixa principal
                  </label>
                  <textarea
                    name="chief_complaint"
                    value={form.chief_complaint}
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Objetivo
                  </label>
                  <textarea
                    name="goal"
                    value={form.goal}
                    onChange={handleChange}
                    rows={2}
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
                    rows={2}
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
                          value={formatPhone(contact.phone)}
                          onChange={(e) => updateContact(index, 'phone', normalizePhone(e.target.value))}
                          maxLength={15}
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
                    <div
                      key={index}
                      className="rounded-lg border border-[var(--border)] bg-white p-3"
                    >
                      <div className="mb-2 flex items-end gap-2">
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
                              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <select
                              value={day.training_time}
                              onChange={(e) =>
                                updateTrainingDay(index, 'training_time', e.target.value)
                              }
                              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 pl-9 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                            >
                              <option value="">Selecione</option>
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = String(i).padStart(2, '0')
                                const value = `${hour}:00`
                                return (
                                  <option key={value} value={value}>
                                    {value}
                                  </option>
                                )
                              })}
                            </select>
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
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-heading)]">
                        <input
                          type="checkbox"
                          checked={day.provisional || false}
                          onChange={(e) =>
                            updateTrainingDay(index, 'provisional', e.target.checked)
                          }
                          className="h-4 w-4 rounded border-slate-300 text-[var(--primary)] accent-[var(--primary)]"
                        />
                        Dia provisório (reposição)
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnósticos */}
              <DynamicListSection
                title="Diagnósticos"
                icon={<Stethoscope size={16} />}
                items={formDiagnoses}
                fieldName="diagnose"
                placeholder="Digite o diagnóstico"
                onAdd={addDiagnose}
                onUpdate={(index, value) => updateDiagnose(index, value)}
                onRemove={removeDiagnose}
              />

              {/* Restrições */}
              <DynamicListSection
                title="Restrições"
                icon={<Ban size={16} />}
                items={formRestrictions}
                fieldName="restriction"
                placeholder="Digite a restrição"
                onAdd={addRestriction}
                onUpdate={(index, value) => updateRestriction(index, value)}
                onRemove={removeRestriction}
              />

              {/* Medicações */}
              <DynamicListSection
                title="Medicações"
                icon={<Pill size={16} />}
                items={formMedications}
                fieldName="medication"
                placeholder="Digite a medicação"
                onAdd={addMedication}
                onUpdate={(index, value) => updateMedication(index, value)}
                onRemove={removeMedication}
              />

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

      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-[var(--surface)] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-heading)]">
                {editingAddressId ? 'Editar endereço' : 'Adicionar endereço'}
              </h3>
              <button
                type="button"
                onClick={closeAddressModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                closeAddressModal()
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Rua
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formAddress.street}
                    onChange={handleAddressChange}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Número
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formAddress.number}
                    onChange={handleAddressChange}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Complemento
                  </label>
                  <input
                    type="text"
                    name="complement"
                    value={formAddress.complement}
                    onChange={handleAddressChange}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Bairro
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formAddress.neighborhood}
                    onChange={handleAddressChange}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formAddress.city}
                    onChange={handleAddressChange}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formAddress.state}
                    onChange={handleAddressChange}
                    maxLength={2}
                    placeholder="UF"
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm uppercase outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="cep"
                    value={formatCEP(formAddress.cep)}
                    onChange={handleAddressChange}
                    maxLength={9}
                    placeholder="00000-000"
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddressModal}
                  className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
                >
                  Salvar endereço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
