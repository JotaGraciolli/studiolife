import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Upload,
  FileText,
  Download,
  MessageCircle,
  FileCheck,
  Search,
  ChevronDown,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { ConfirmDialog } from '../components/ConfirmDialog'

const BUCKET = 'contracts'
const SIGNED_BUCKET = 'signed-contracts'
const ACCEPTED_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const ACCEPTED_SIGNED_TYPES = ['application/pdf']

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(isoDate) {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getFirstName(fullName) {
  if (!fullName) return ''
  return fullName.trim().split(' ')[0]
}

export function ContractSettings() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const signedInputRef = useRef(null)
  const selectRef = useRef(null)

  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)

  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)

  const [signedContracts, setSignedContracts] = useState([])
  const [signedFile, setSignedFile] = useState(null)
  const [uploadingSigned, setUploadingSigned] = useState(false)
  const [showSignedReplaceConfirm, setShowSignedReplaceConfirm] = useState(false)

  const [contractTemplate, setContractTemplate] = useState(null)
  const [downloadingContract, setDownloadingContract] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    loadInitialData()

    function handleClickOutside(e) {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setShowClientDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadInitialData() {
    setLoading(true)
    setError('')
    try {
      const [settingsRes, clientsRes, contractsRes, templateRes] = await Promise.all([
        supabase
          .from('contract_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from('clients').select('*').eq('status', 'ativo').order('name', { ascending: true }),
        supabase.from('client_contracts').select('*'),
        supabase
          .from('message_templates')
          .select('*')
          .ilike('category', 'Contrato')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      if (settingsRes.error) throw settingsRes.error
      if (clientsRes.error) throw clientsRes.error
      if (contractsRes.error) throw contractsRes.error
      if (templateRes.error) throw templateRes.error

      setCurrent(settingsRes.data)
      setClients(clientsRes.data || [])
      setSignedContracts(contractsRes.data || [])
      setContractTemplate(templateRes.data)
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar dados: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadCurrent() {
    setLoading(true)
    setError('')
    try {
      const { data, error: supaError } = await supabase
        .from('contract_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (supaError) throw supaError
      setCurrent(data)
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar modelo atual: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadSignedContracts() {
    try {
      const { data, error: supaError } = await supabase.from('client_contracts').select('*')
      if (supaError) throw supaError
      setSignedContracts(data || [])
    } catch (err) {
      console.error('Erro ao carregar contratos assinados:', err)
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Por favor, selecione um arquivo do tipo .doc ou .docx.')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setError('')
    setSelectedFile(file)
  }

  async function performUpload() {
    if (!selectedFile) return

    setUploading(true)
    setError('')

    try {
      if (current?.file_path) {
        const { error: removeError } = await supabase.storage
          .from(BUCKET)
          .remove([current.file_path])
        if (removeError) console.error('Erro ao remover arquivo anterior:', removeError)
      }

      const extension = selectedFile.name.split('.').pop()
      const filePath = `contract_template.${extension}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, selectedFile, {
          upsert: true,
          contentType: selectedFile.type,
        })

      if (uploadError) throw uploadError

      const payload = {
        file_name: selectedFile.name,
        file_path: filePath,
        file_size: selectedFile.size,
        content_type: selectedFile.type,
        updated_at: new Date().toISOString(),
      }

      if (current) {
        const { error: updateError } = await supabase
          .from('contract_settings')
          .update(payload)
          .eq('id', current.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('contract_settings').insert(payload)
        if (insertError) throw insertError
      }

      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadCurrent()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao enviar arquivo: ${detail}`)
      console.error(err)
    } finally {
      setUploading(false)
      setShowReplaceConfirm(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!selectedFile) return

    if (current) {
      setShowReplaceConfirm(true)
    } else {
      performUpload()
    }
  }

  function getClientSignedContract(clientId) {
    return signedContracts.find((c) => c.client_id === clientId)
  }

  async function handleDownloadContract() {
    if (!selectedClient) {
      setError('Selecione um aluno para baixar o contrato.')
      return
    }

    setDownloadingContract(true)
    setError('')

    try {
      const signedContract = getClientSignedContract(selectedClient.id)

      if (signedContract) {
        const { data, error: downloadError } = await supabase.storage
          .from(SIGNED_BUCKET)
          .download(signedContract.file_path)
        if (downloadError) throw downloadError

        const blob = new Blob([await data.arrayBuffer()], { type: signedContract.content_type })
        const firstName = getFirstName(selectedClient.name)
        const extension = signedContract.file_name.split('.').pop() || 'pdf'
        const fileName = firstName
          ? `contrato_assinado_${firstName}.${extension}`
          : `contrato_assinado.${extension}`

        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
      } else {
        const { generateAndDownloadContract } = await import('../services/contract')
        const { data: address } = await supabase
          .from('address')
          .select('*')
          .eq('id', selectedClient.address_id)
          .maybeSingle()
        const { data: trainingDays } = await supabase
          .from('training_days')
          .select('*')
          .eq('client_id', selectedClient.id)

        await generateAndDownloadContract(selectedClient, address, trainingDays || [])
      }
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao baixar contrato: ${detail}`)
      console.error(err)
    } finally {
      setDownloadingContract(false)
    }
  }

  function handleSendMessage() {
    if (!selectedClient) {
      setError('Selecione um aluno para enviar a mensagem.')
      return
    }

    if (!selectedClient.phone) {
      setError('O aluno selecionado não possui telefone cadastrado.')
      return
    }

    setSendingMessage(true)

    try {
      let message = contractTemplate?.message || 'Olá {{ALUNO}}, tudo bem? Segue o contrato. '
      message = message.replace(/\{\{ALUNO\}\}/g, getFirstName(selectedClient.name))

      const digits = selectedClient.phone.replace(/\D/g, '')
      const phoneWithCountry = `55${digits}`

      const encodedPhone = encodeURIComponent(phoneWithCountry)
      const encodedMessage = encodeURIComponent(message).replace(/%20/g, '+')
      const url = `https://api.whatsapp.com/send?phone=${encodedPhone}&text=${encodedMessage}`

      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao enviar mensagem: ${detail}`)
      console.error(err)
    } finally {
      setSendingMessage(false)
    }
  }

  function handleSignedFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) {
      setSignedFile(null)
      return
    }

    if (!ACCEPTED_SIGNED_TYPES.includes(file.type)) {
      setError('Por favor, selecione um arquivo PDF.')
      setSignedFile(null)
      if (signedInputRef.current) signedInputRef.current.value = ''
      return
    }

    setError('')
    setSignedFile(file)
  }

  async function performSignedUpload() {
    if (!selectedClient || !signedFile) return

    setUploadingSigned(true)
    setError('')

    try {
      const existing = getClientSignedContract(selectedClient.id)

      if (existing?.file_path) {
        const { error: removeError } = await supabase.storage
          .from(SIGNED_BUCKET)
          .remove([existing.file_path])
        if (removeError) console.error('Erro ao remover contrato anterior:', removeError)
      }

      const firstName = getFirstName(selectedClient.name)
      const extension = signedFile.name.split('.').pop()
      const filePath = firstName
        ? `${selectedClient.id}/contrato_assinado_${firstName}.${extension}`
        : `${selectedClient.id}/contrato_assinado.${extension}`

      const { error: uploadError } = await supabase.storage
        .from(SIGNED_BUCKET)
        .upload(filePath, signedFile, {
          upsert: true,
          contentType: signedFile.type,
        })

      if (uploadError) throw uploadError

      const payload = {
        client_id: selectedClient.id,
        file_name: signedFile.name,
        file_path: filePath,
        file_size: signedFile.size,
        content_type: signedFile.type,
        updated_at: new Date().toISOString(),
      }

      if (existing) {
        const { error: updateError } = await supabase
          .from('client_contracts')
          .update(payload)
          .eq('id', existing.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('client_contracts').insert(payload)
        if (insertError) throw insertError
      }

      setSignedFile(null)
      if (signedInputRef.current) signedInputRef.current.value = ''
      await loadSignedContracts()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao enviar contrato assinado: ${detail}`)
      console.error(err)
    } finally {
      setUploadingSigned(false)
      setShowSignedReplaceConfirm(false)
    }
  }

  function handleSignedSubmit(e) {
    e.preventDefault()
    if (!selectedClient || !signedFile) return

    if (getClientSignedContract(selectedClient.id)) {
      setShowSignedReplaceConfirm(true)
    } else {
      performSignedUpload()
    }
  }

  const filteredClients = clients.filter((c) =>
    c.name?.toLowerCase().includes(clientSearch.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="rounded-lg border border-[var(--border)] bg-white p-2 text-[var(--text)] hover:bg-slate-50"
          aria-label="Voltar para configurações"
        >
          <ArrowLeft size={18} />
        </button>
        <PageHeader
          title="Contratos"
          description="Gerencie o modelo de contrato e os contratos dos alunos."
        />
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          {/* Upload do modelo */}
          <div className="rounded-xl bg-[var(--surface)] p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary-dark)]">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-heading)]">
                  Modelo de Contrato
                </h3>
                <p className="text-sm text-slate-500">
                  Envie o modelo em .docx com os placeholders.
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">Atenção</p>
              <p className="mt-1">
                Apenas um modelo pode ser armazenado. Um novo upload substituirá o
                existente.
              </p>
            </div>

            {current && (
              <div className="mb-6 rounded-lg border border-[var(--border)] bg-white p-4">
                <p className="mb-3 text-sm font-medium text-[var(--text-heading)]">
                  Modelo atual
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary-dark)]">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--text-heading)]">
                      {current.file_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatFileSize(current.file_size)} • Atualizado em{' '}
                      {formatDate(current.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Arquivo <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-[var(--text)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[var(--primary-dark)]"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Formatos aceitos: .doc e .docx
                </p>
              </div>

              {selectedFile && (
                <p className="text-sm text-slate-600">
                  Arquivo selecionado:{" "}
                  <span className="font-medium">{selectedFile.name}</span>{" "}
                  <span className="text-slate-400">
                    ({formatFileSize(selectedFile.size)})
                  </span>
                </p>
              )}

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-70"
              >
                <Upload size={18} />
                {uploading ? 'Enviando...' : current ? 'Substituir modelo' : 'Enviar modelo'}
              </button>
            </form>
          </div>

          {/* Gerar contrato */}
          <div className="rounded-xl bg-[var(--surface)] p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary-dark)]">
                <FileCheck size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-heading)]">
                  Gerar Contrato
                </h3>
                <p className="text-sm text-slate-500">
                  Selecione um aluno ativo para baixar, enviar mensagem ou fazer upload do
                  contrato assinado.
                </p>
              </div>
            </div>

            <div className="space-y-4" ref={selectRef}>
              <div className="relative">
                <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                  Aluno <span className="text-[var(--danger)]">*</span>
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Buscar aluno..."
                    value={
                      showClientDropdown
                        ? clientSearch
                        : selectedClient?.name || clientSearch
                    }
                    onChange={(e) => {
                      setClientSearch(e.target.value)
                      setShowClientDropdown(true)
                      if (selectedClient) setSelectedClient(null)
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    className="w-full rounded-lg border border-[var(--border)] bg-white py-2 pl-10 pr-10 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientDropdown(!showClientDropdown)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${showClientDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>

                {showClientDropdown && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-[var(--border)] bg-white py-1 shadow-lg">
                    {filteredClients.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-slate-500">
                        Nenhum aluno encontrado.
                      </p>
                    ) : (
                      filteredClients.map((client) => {
                        const signed = getClientSignedContract(client.id)
                        return (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setSelectedClient(client)
                              setClientSearch(client.name)
                              setShowClientDropdown(false)
                            }}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                          >
                            <span className="text-[var(--text-heading)]">{client.name}</span>
                            {signed && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                Assinado
                              </span>
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              {selectedClient && (
                <div className="rounded-lg border border-[var(--border)] bg-white p-3 text-sm">
                  <p className="text-slate-500">Aluno selecionado</p>
                  <p className="font-medium text-[var(--text-heading)]">
                    {selectedClient.name}
                  </p>
                  {getClientSignedContract(selectedClient.id) && (
                    <p className="mt-1 text-xs text-emerald-600">
                      Contrato assinado vinculado
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownloadContract}
                  disabled={downloadingContract || !selectedClient}
                  className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-70"
                >
                  <Download size={18} />
                  {downloadingContract ? 'Baixando...' : 'Baixar contrato'}
                </button>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !selectedClient}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-slate-50 disabled:opacity-70"
                >
                  <MessageCircle size={18} />
                  Enviar mensagem de contrato
                </button>
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <h4 className="mb-3 text-sm font-semibold text-[var(--text-heading)]">
                  Upload de contrato assinado
                </h4>

                <form onSubmit={handleSignedSubmit} className="space-y-4">
                  <div>
                    <input
                      ref={signedInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleSignedFileChange}
                      className="block w-full text-sm text-[var(--text)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[var(--primary-dark)]"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Formato aceito: PDF
                    </p>
                  </div>

                  {signedFile && (
                    <p className="text-sm text-slate-600">
                      Arquivo selecionado:{" "}
                      <span className="font-medium">{signedFile.name}</span>{" "}
                      <span className="text-slate-400">
                        ({formatFileSize(signedFile.size)})
                      </span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedClient || !signedFile || uploadingSigned}
                    className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-70"
                  >
                    <Upload size={18} />
                    {uploadingSigned
                      ? 'Enviando...'
                      : getClientSignedContract(selectedClient?.id)
                      ? 'Substituir contrato assinado'
                      : 'Enviar contrato assinado'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showReplaceConfirm}
        title="Substituir modelo de contrato"
        message="Já existe um modelo de contrato salvo. Deseja substituí-lo pelo novo arquivo? Essa ação não pode ser desfeita."
        onConfirm={performUpload}
        onCancel={() => setShowReplaceConfirm(false)}
      />

      <ConfirmDialog
        open={showSignedReplaceConfirm}
        title="Substituir contrato assinado"
        message="Já existe um contrato assinado vinculado a este aluno. Deseja substituí-lo pelo novo arquivo? Essa ação não pode ser desfeita."
        onConfirm={performSignedUpload}
        onCancel={() => setShowSignedReplaceConfirm(false)}
      />
    </div>
  )
}
